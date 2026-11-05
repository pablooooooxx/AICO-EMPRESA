import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, throwError } from "rxjs";
import { map, catchError, timestamp } from 'rxjs/operators';
import { Chatmessage } from '../models/chat.model';
import { environment } from "../../environments/environment";
import { user } from "@angular/fire/auth";
import { ReturnStatement } from "@angular/compiler";

@Injectable({
    providedIn: 'root'
})
export class AichatService {
    private readonly GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    private conversationHistory: Chatmessage[] = [];
    
    private readonly systemPrompt = 'Eres "StAIle"", el asistente inteligente integrado en SaberStyle, una aplicación educativa enfocada en el aprendizaje y la educación inclusiva. Tu propósito es acompañar a los estudiantes, resolver sus dudas y facilitar su aprendizaje mediante una experiencia amigable, interactiva, accesible y personalizada. Tu personalidad: Eres amigable, paciente, alegre y motivador. Eres un asistente educativo comprensivo y respetuoso. Respondes SIEMPRE en español. Utilizas un lenguaje sencillo, claro y fácil de comprender. Utilizas emojis de forma moderada 📚✨🎓. Nunca haces sentir mal al estudiante por equivocarse. Eres inclusivo y respetas los diferentes ritmos de aprendizaje. Explicas paso a paso cuando un tema es difícil. Eres conciso, pero das explicaciones completas cuando se necesitan. Tu conocimiento especializado incluye: Educación inclusiva y aprendizaje accesible, comprensión lectora y escritura, matemáticas y razonamiento lógico, ciencias naturales y ciencias sociales, lengua castellana y conocimientos generales, técnicas y estrategias de estudio, comprensión de textos y conceptos difíciles, orientación para resolver actividades educativas, adaptación de explicaciones según las necesidades del estudiante y uso de herramientas tecnológicas para el aprendizaje. Funciones de SaberStyle que conoces: Chat inteligente con StAIle para resolver dudas, sugerencias rápidas para iniciar conversaciones, acompañamiento y orientación durante el aprendizaje, actividades y juegos educativos disponibles en la plataforma, herramientas de accesibilidad para facilitar la comprensión, simplificación de textos y explicaciones, lectura en voz alta cuando esté disponible y opciones de personalización visual y apoyo a la lectura cuando estén disponibles. Reglas importantes: Prioriza siempre el aprendizaje y la comprensión del estudiante. No te limites a dar respuestas: explica cómo llegar a ellas. Si el estudiante no comprende, intenta explicarlo de otra manera. Utiliza ejemplos cotidianos para facilitar el aprendizaje. Divide los temas complejos en pasos pequeños. Motiva al estudiante a pensar y participar. No juzgues, discrimines ni utilices lenguaje ofensivo. Adapta tus respuestas a diferentes niveles de comprensión. Si no conoces una respuesta, dilo honestamente. No inventes funciones que no existan en SaberStyle. No afirmes que has realizado acciones dentro de la aplicación si no tienes herramientas para ejecutarlas. Si el estudiante necesita una herramienta de accesibilidad, explícale cómo utilizarla si está disponible. Mantén tus respuestas en un máximo de 200 palabras, a menos que el estudiante solicite más detalles. Tu objetivo principal: Ser un compañero de aprendizaje que ayude a cada estudiante a comprender, descubrir, practicar y aprender a su propio ritmo. Recuerda: No eres solamente un chatbot. Eres StAIle, el compañero inteligente de aprendizaje de SaberStyle. ';

    constructor(private http: HttpClient) {}

    sendMessage(userMessage: string): Observable<Chatmessage> {
        const apiKey = environment.firebase.geminiApiKey;

        const userMsg: Chatmessage = {
            id: 'msg_' + Date.now(),
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        };
        this.conversationHistory.push(userMsg);

        if (!apiKey || apiKey.startsWith('Q.') || apiKey.startsWith('AQ.')) {
            return this.getOfflineResponse(userMessage);
        }

        const body = this.buildGeminiRequest(userMessage);

        return this.http.post<any>(`${this.GEMINI_URL}?key=${apiKey}`, body).pipe(
            map(response => {
                const text = response?.candidates?.[0]?.content?.parts?.[0]?.text
                    || '¡Hola! Estoy procesando tu consulta con el motor cósmico de SaberStyle. Intenta de nuevo.';

                const assistantMsg: Chatmessage = {
                    id: 'msg_' + (Date.now() + 1),
                    role: 'assistant',
                    content: text,
                    timestamp: new Date()
                };
                this.conversationHistory.push(assistantMsg);
                return assistantMsg;
            }),
            catchError(error => {
                console.warn('Conexión con Gemini API no disponible. Utilizando motor StAIle local:', error);
                return this.getOfflineResponse(userMessage);
            })
        );
    }

    private buildGeminiRequest(userMessage: string): any {
        const contents: any[] = [];
        const recentHistory = this.conversationHistory.slice(-8);
        for (const msg of recentHistory) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.content }]
            });
        }

        return {
            system_instruction: {
                parts: [{ text: this.systemPrompt }]
            },
            contents,
            generationConfig: {
                temperature: 0.7,
                topP: 0.95,
                topK: 40,
                maxOutputTokens: 1024
            }
        };
    }

    private getOfflineResponse(userMessage: string): Observable<Chatmessage> {
        const query = userMessage.toLowerCase().trim();
        let response = '';

        if (query.includes('hola') || query.includes('hey') || query.includes('buenas') || query.includes('staile')) {
            response = '¡Hola, explorador galáctico! 🚀 Soy StAIle, tu copiloto en SaberStyle. ¿En qué materia o dinámica te puedo apoyar hoy?';
        } else if (query.includes('dominio') || query.includes('funcion') || query.includes('matematica')) {
            response = '📐 Dominio de una función: Es el conjunto de todos los valores de entrada (x) para los cuales la función está definida. Por ejemplo, en f(x) = 1/(x-3), el dominio son todos los reales excepto x = 3, porque no se puede dividir entre cero.';
        } else if (query.includes('moneda') || query.includes('tienda') || query.includes('comprar') || query.includes('ropa')) {
            response = '🪙 Economía SaberStyle: Ganas monedas completando retos y misiones diarias. Puedes usarlas en la **Tienda** para desbloquear sudaderas, pantalones urbanos, peinados y la mascota astronauta Snoopy, y equiparlas en tu **Vestuario**.';
        } else if (query.includes('mision') || query.includes('reto')) {
            response = '⭐ Misiones Diarias: Cada día tienes 3 misiones (bronce, plata y oro) y la posibilidad de un desafío diamante. ¡Completa tu reto diario para sumar 100 monedas y subir de nivel!';
        } else if (query.includes('ruleta') || query.includes('crear') || query.includes('juego')) {
            response = '🎮 Creación de Juegos: En la pestaña **Crear (+)** puedes elegir entre Quiz, Ruleta, Pregunta Abierta, V/F, Completar y Sopa de Letras. Además, defines si es **En Vivo** (sincrónico) o **Asignar** (individual).';
        } else if (query.includes('clase') || query.includes('codigo') || query.includes('estudiante')) {
            response = '📖 Gestión de Clases: Puedes ingresar con el código de tu profesor (ej: `SABER-MAT11`) o, si eres docente, crear una clase y compartir el código directamente.';
        } else {
            response = `✨ Entendido: *" ${userMessage} "*. Como tutor StAIle, te recomiendo repasar la lección correspondiente en tus clases activas o lanzar un minijuego de práctica para afianzar tus conocimientos.`;
        }

        const assistantMsg: Chatmessage = {
            id: 'msg_' + (Date.now() + 1),
            role: 'assistant',
            content: response,
            timestamp: new Date()
        };
        this.conversationHistory.push(assistantMsg);
        return of(assistantMsg);
    }


    getConversationHistory(): Chatmessage[] {
        return [...this.conversationHistory];
    }

    clearConversation(): void {
        this.conversationHistory = [];
    }
}