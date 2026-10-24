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
    private readonly GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generaterContent';

    private conversationHistory: Chatmessage[ ] = [ ];
    
    private readonly systemPrompt =  '';

    constructor(private http: HttpClient) {}

    sendMessage(userMessage: string): Observable<Chatmessage> {
        const apiKey = environment.geminiApiKey;

        if (!apiKey ||apiKey === 'AQ.Ab8RN6IoMiesykkkkcWoecoXF7cHHCd7OPN8dEwb3SZYMaQVzw') {
            return this.getOfflineResponse(userMessage);
        }

        const userMsg: Chatmessage = {
            id: 'msg_' + Date.now(),
            role: 'user',
            content: userMessage,
            timestamp: new Date()
         };
         this.conversationHistory.push(userMsg);

         const body = this.buildGeminiRequest(userMessage)

         return this.http.post<any>(`${this.GEMINI_URL}?key=${apiKey}`, body).pipe(
            map (response => {
                const text = response?.candidates?.[0]?.content?.parts?.[0]?.text
                || 'Lo siento, no pude generar una respuesta. Intenta de nuevo.';

                const assistantMsg: Chatmessage = {
                    id: 'msg_' + Date.now(),
                    role: 'assistant',
                    content: text,
                    timestamp: new Date()
                };
                 this.conversationHistory.push(assistantMsg);
                 return assistantMsg;
            }),
            catchError(error => {
                console.error('Error al contactar Gemini API:', error);
                return this.getOfflineResponse(userMessage);
            })
         );
    }

    private buildGeminiRequest(userMessage : string): any {

        const contents: any[] = [];

        const systemInstruction = {
            parts: [{ text: this.systemPrompt}]
        };

        const recentHistory = this.conversationHistory.slice(-10);
        for (const msg of recentHistory) {
            contents.push({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: userMessage}]
            });
        } 

        if (contents.length === 0) {
            contents.push({
                role:'user',
                parts: [{ text: userMessage}]
            });
        }

        return {
            system_instruction: systemInstruction,
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
        const query = userMessage.toLowerCase();
        let response: string;

        if (query.includes('hola') || query.includes('hey') || query.includes('buenas')) {
            response = '';
        } else if (query.includes ('ruta') || query.includes('camino') || query.includes('llegar')) {
        } 
        
        const userMsg: Chatmessage = {
                id: 'msg_' + Date.now(),
                role: 'user',
                content: userMessage,
                timestamp: new Date()
        };
        this.conversationHistory.push(userMsg);

        const assistantMsg:  Chatmessage = {
            id: 'msg_' + (Date.now() + 1),
            role: 'assistant',
            content: response + '\n\n_ Tip: Configura tu API key de Gemini en la app para respuestas más inteligentes y personalizadas._',
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