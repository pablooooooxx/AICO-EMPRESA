import { Component, OnInit } from '@angular/core';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AichatService } from '../services/ai-chat.service';
import { User } from '../models/user.model';
import { Chatmessage } from '../models/chat.model';

export interface GameTypeOption {
  id: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras';
  name: string;
  desc: string;
  icon: string;
  badgeColor: string;
}

export interface SavedGame {
  id: string;
  titulo: string;
  tipo: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras';
  tipoLabel: string;
  modo: 'en-vivo' | 'individual';
  materia: string;
  preguntasCount: number;
  preguntas: any[];
  fecha: string;
  compartido?: boolean;
}

export interface StudentItem {
  id: string;
  name: string;
  avatar: string;
  asistencia: number;
  retosCompletados: number;
  promedio: number;
}

export interface ClaseItem {
  id: number;
  name: string;
  grado: string;
  codigo: string;
  docente: string;
  materia: string;
  descripcion: string;
  horario: string;
  studentsCount: number;
  estudiantesList: StudentItem[];
  actividades: { id: string; titulo: string; tipo: string; estado: 'completado' | 'en-vivo' | 'pendiente'; duracion: string }[];
  icon: string;
  color: string;
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'ropa' | 'pelo' | 'accesorios' | 'zapatos';
  price: number;
  tag?: string;
  owned: boolean;
  equipped: boolean;
  icon: string;
  color: string;
}

export interface LogroDesafio {
  id: number;
  title: string;
  desc: string;
  medal: 'bronze' | 'silver' | 'gold' | 'diamond';
  completed: boolean;
  recompensa: number;
  claimed?: boolean;
}

export interface MisionDiaria {
  id: number;
  nivel: 'bronce' | 'plata' | 'oro' | 'diamante';
  title: string;
  desc: string;
  recompensa: number;
  progreso: number;
  meta: number;
  completed: boolean;
  claimed?: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: User | null = null;

  // Pestaña o pantalla activa dentro de la aplicación
  activeTab: 
    | 'estudiante'
    | 'profesor'
    | 'clases'
    | 'clase-detalle'
    | 'crear-juego'
    | 'ruleta-config'
    | 'mis-juegos'
    | 'tienda'
    | 'closet'
    | 'progreso'
    | 'logros'
    | 'perfil'
    | 'accesibilidad'
    | 'guia-tutorial'
    | 'juego-quiz'
    | 'juego-ruleta'
    | 'juego-abierta'
    | 'juego-vf'
    | 'juego-completar'
    | 'juego-sopa'
    | 'juego-victoria' = 'estudiante';

  // Destino de la barra de navegación inferior
  currentBottomNav: 'inicio' | 'clases' | 'crear' | 'tienda' | 'perfil' = 'inicio';

  // Monedas del usuario
  userCoins: number = 1250;

  // Avatar sincronizado globalmente
  avatarConfig = {
    skinColor: '#f8d9b6',
    hairId: 'cabello-moderno',
    topId: 'sudadera-estrella',
    bottomId: 'pantalon-urbano',
    shoesId: 'sneakers-pro',
    accessoryId: 'mascota-snoopy',
    expression: 'Feliz',
    angle: 'Frente'
  };

  // Paleta de tonos de piel (naturales y fantasía cósmica)
  tonosPiel = [
    { color: '#fae7d0', label: 'Porcelana' },
    { color: '#f8d9b6', label: 'Claro Cálido' },
    { color: '#e5b88f', label: 'Medio Natural' },
    { color: '#c98a58', label: 'Bronceado' },
    { color: '#703c19', label: 'Ébano Profundo' },
    { color: '#a855f7', label: 'Morado Cósmico' },
    { color: '#38bdf8', label: 'Azul Estelar' },
    { color: '#f472b6', label: 'Rosa Galaxia' }
  ];

  expresiones = ['Feliz', 'Guiño', 'Sorprendido', 'Neutro', 'Pensativo'];
  angulosVista = ['Frente', '3/4', 'Perfil', 'Espalda'];

  // Categorías de Tienda y Armario
  storeCategoryFilter: 'ropa' | 'pelo' | 'accesorios' | 'zapatos' = 'ropa';
  closetCategoryFilter: 'ropa' | 'pelo' | 'accesorios' | 'zapatos' = 'ropa';

  // Catálogo completo de Tienda e Inventario (inspirado en Roblox/SaberStyle)
  storeItems: StoreItem[] = [
    // Ropa / Tops
    { id: 'sudadera-estrella', name: 'Sudadera Estrella Violeta', category: 'ropa', price: 350, tag: 'NUEVO', owned: true, equipped: true, icon: 'shirt-outline', color: '#a855f7' },
    { id: 'hoodie-galaxia', name: 'Hoodie Galaxia con Capucha', category: 'ropa', price: 400, tag: 'POPULAR', owned: true, equipped: false, icon: 'shirt-outline', color: '#6366f1' },
    { id: 'camiseta-saber', name: 'Camiseta SaberStyle Blanca', category: 'ropa', price: 200, owned: true, equipped: false, icon: 'shirt-outline', color: '#e2e8f0' },
    { id: 'chaqueta-neon', name: 'Chaqueta Cyber Neón', category: 'ropa', price: 480, tag: 'ÉPICO', owned: false, equipped: false, icon: 'shirt-outline', color: '#ec4899' },
    { id: 'pantalon-urbano', name: 'Pantalón Urbano Denim', category: 'ropa', price: 280, tag: 'POPULAR', owned: true, equipped: true, icon: 'barcode-outline', color: '#3b82f6' },
    { id: 'falda-plisada', name: 'Falda Plisada Violeta', category: 'ropa', price: 260, owned: false, equipped: false, icon: 'color-palette-outline', color: '#c084fc' },
    
    // Zapatos
    { id: 'sneakers-pro', name: 'Sneakers Cósmicos Pro', category: 'zapatos', price: 220, owned: true, equipped: true, icon: 'footsteps-outline', color: '#10b981' },
    { id: 'botas-lunares', name: 'Botas de Gravedad Cero', category: 'zapatos', price: 340, tag: 'ÉPICO', owned: false, equipped: false, icon: 'rocket-outline', color: '#8b5cf6' },
    { id: 'tenis-runner', name: 'Tenis Runner Galaxia', category: 'zapatos', price: 250, owned: false, equipped: false, icon: 'flash-outline', color: '#f59e0b' },

    // Pelo
    { id: 'cabello-moderno', name: 'Corte Galáctico Bob', category: 'pelo', price: 180, tag: 'ESTILO', owned: true, equipped: true, icon: 'sparkles-outline', color: '#6366f1' },
    { id: 'melena-estelar', name: 'Melena Rizada Estelar', category: 'pelo', price: 220, owned: false, equipped: false, icon: 'flower-outline', color: '#f472b6' },
    { id: 'pelo-spiky', name: 'Peinado Spiky Anime', category: 'pelo', price: 210, owned: false, equipped: false, icon: 'flame-outline', color: '#eab308' },

    // Accesorios
    { id: 'mascota-snoopy', name: 'Perrito Astronauta Snoopy', category: 'accesorios', price: 450, tag: 'DESTACADO', owned: true, equipped: true, icon: 'paw-outline', color: '#ec4899' },
    { id: 'lentes-sol', name: 'Lentes de Sol Cyber Black', category: 'accesorios', price: 190, tag: 'NUEVO', owned: false, equipped: false, icon: 'glasses-outline', color: '#1e293b' },
    { id: 'gorra-saber', name: 'Gorra SaberStyle Oro', category: 'accesorios', price: 160, owned: false, equipped: false, icon: 'flash-outline', color: '#ffb300' },
    { id: 'auriculares-gamer', name: 'Auriculares Gamer RGB', category: 'accesorios', price: 380, tag: 'POPULAR', owned: false, equipped: false, icon: 'headset-outline', color: '#06b6d4' }
  ];

  // ==========================================
  // Creación y Gestión de Minijuegos
  // ==========================================
  selectedGameType: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras' = 'quiz';
  selectedParticipationMode: 'en-vivo' | 'individual' = 'en-vivo';
  nuevoJuegoTitulo: string = '';
  nuevoJuegoMateria: string = 'Matemáticas';
  juegosFiltroTab: 'mis-juegos' | 'compartidos' = 'mis-juegos';
  juegosSearchQuery: string = '';

  gameTypes: GameTypeOption[] = [
    { id: 'quiz', name: 'Cuestionario', desc: 'Preguntas de opción múltiple con puntajes inmediatos', icon: 'checkbox-outline', badgeColor: '#8b5cf6' },
    { id: 'ruleta', name: 'Ruleta', desc: 'Rueda aleatoria para elegir conceptos y preguntas al azar', icon: 'disc-outline', badgeColor: '#ec4899' },
    { id: 'abierta', name: 'Pregunta abierta', desc: 'Debates y respuestas escritas colaborativas en directo', icon: 'chatbubbles-outline', badgeColor: '#3b82f6' },
    { id: 'verdadero-falso', name: 'Verdadero / falso', desc: 'Comprobaciones conceptuales ágiles con retroalimentación', icon: 'checkmark-circle-outline', badgeColor: '#10b981' },
    { id: 'completar', name: 'Completar frase', desc: 'Rellena los espacios vacíos con los términos correctos', icon: 'create-outline', badgeColor: '#f59e0b' },
    { id: 'sopa-letras', name: 'Sopa de letras', desc: 'Búsqueda de términos clave en cuadrícula interactiva', icon: 'grid-outline', badgeColor: '#06b6d4' }
  ];

  // Editor de Ruleta
  ruletaConfigTitulo: string = 'La ruleta del conocimiento';
  ruletaConfigPreguntas: string[] = [
    '¿Cuál es la función inversa de f(x) = 2x + 4?',
    '¿Qué representa la asíntota vertical en una función racional?',
    'Define el concepto de dominio y rango de f(x) = √x',
    'Explica la diferencia entre función inyectiva y sobreyectiva'
  ];
  nuevaPreguntaRuletaInput: string = '';

  // Biblioteca de Juegos Guardados
  savedGames: SavedGame[] = [
    {
      id: 'g1',
      titulo: 'Quiz de funciones',
      tipo: 'quiz',
      tipoLabel: 'Cuestionario',
      modo: 'en-vivo',
      materia: 'Matemáticas',
      preguntasCount: 10,
      fecha: 'Hoy',
      preguntas: [
        {
          pregunta: '¿Cuál es el dominio de la función f(x) = 1 / (x - 3)?',
          opciones: ['Todos los números reales', 'Todos los reales excepto x = 3', 'Solo x > 3', 'x = 0'],
          correcta: 1
        },
        {
          pregunta: '¿Cuál es el rango de la función cuadrática f(x) = x² + 2?',
          opciones: ['(-∞, ∞)', '[2, ∞)', '[0, ∞)', '(-∞, 2]'],
          correcta: 1
        },
        {
          pregunta: 'Si f(x) = 3x - 5, ¿cuál es el valor de f(4)?',
          opciones: ['7', '12', '-1', '17'],
          correcta: 0
        }
      ]
    },
    {
      id: 'g2',
      titulo: 'La ruleta del conocimiento',
      tipo: 'ruleta',
      tipoLabel: 'Ruleta',
      modo: 'en-vivo',
      materia: 'General',
      preguntasCount: 6,
      fecha: 'Ayer',
      preguntas: [
        { tema: 'Dominio', pregunta: '¿Qué valores de x hacen indefinida a f(x) = 1/x?' },
        { tema: 'Rango', pregunta: '¿Cuál es el rango de una función seno?' },
        { tema: 'Inyectiva', pregunta: '¿Cómo se comprueba si una función es inyectiva gráficamente?' },
        { tema: 'Asíntota', pregunta: '¿Qué ocurre con la gráfica cuando x tiende a la asíntota vertical?' },
        { tema: 'Pendiente', pregunta: '¿Qué indica una pendiente negativa en una función lineal?' },
        { tema: 'Parábola', pregunta: '¿Hacia dónde abre la parábola f(x) = -2x² + 5?' }
      ]
    },
    {
      id: 'g3',
      titulo: 'Verdadero o falso',
      tipo: 'verdadero-falso',
      tipoLabel: 'Verdadero / falso',
      modo: 'individual',
      materia: 'Ciencias',
      preguntasCount: 12,
      fecha: '18 Oct',
      preguntas: [
        { afirmacion: 'Una función lineal f(x) = mx + b siempre genera una línea recta.', esVerdadero: true, explicacion: 'Correcto: una función polinomial de grado 1 representa siempre una recta con pendiente m.' },
        { afirmacion: 'El dominio de f(x) = √x incluye todos los números reales negativos.', esVerdadero: false, explicacion: 'Falso: en los números reales no existe raíz cuadrada de un número negativo.' },
        { afirmacion: 'Una función inyectiva asigna resultados distintos a elementos distintos.', esVerdadero: true, explicacion: 'Correcto: si a ≠ b entonces f(a) ≠ f(b).' }
      ]
    },
    {
      id: 'g4',
      titulo: 'Pregunta abierta: Funciones en la vida real',
      tipo: 'abierta',
      tipoLabel: 'Pregunta abierta',
      modo: 'individual',
      materia: 'Matemáticas',
      preguntasCount: 3,
      fecha: '15 Oct',
      preguntas: [
        { consigna: 'Menciona un ejemplo cotidiano donde una variable dependa directamente de otra:' }
      ]
    },
    {
      id: 'g5',
      titulo: 'Completar frase de geometría',
      tipo: 'completar',
      tipoLabel: 'Completar frase',
      modo: 'individual',
      materia: 'Matemáticas',
      preguntasCount: 5,
      fecha: '14 Oct',
      preguntas: [
        { fraseAntes: 'Un triángulo que tiene sus tres lados con la misma longitud se denomina triángulo', palabraCorrecta: 'equilátero', opciones: ['equilátero', 'isósceles', 'escaleno', 'rectángulo'] }
      ]
    },
    {
      id: 'g6',
      titulo: 'Sopa de letras',
      tipo: 'sopa-letras',
      tipoLabel: 'Sopa de letras',
      modo: 'individual',
      materia: 'Lengua',
      preguntasCount: 10,
      fecha: '12 Oct',
      preguntas: [
        { palabras: ['DOMINIO', 'RANGO', 'FUNCION', 'LIMITE', 'RECTA'] }
      ]
    }
  ];

  // ==========================================
  // Motores de Juego Activo
  // ==========================================
  juegoActivo: SavedGame | null = null;
  quizIndexPregunta: number = 0;
  quizScoreCorrectas: number = 0;
  quizTimerSegundos: number = 20;
  quizTimerInterval: any = null;
  quizOpcionElegida: number | null = null;
  quizRespondida: boolean = false;

  // Ruleta
  ruletaAngulo: number = 0;
  ruletaGirando: boolean = false;
  ruletaSectorSeleccionado: any = null;

  // Pregunta Abierta
  abiertaRespuestaUsuario: string = '';
  abiertaFeedRespuestas: { autor: string; rol: string; texto: string; timestamp: string }[] = [
    { autor: 'Prof. Carlos Ramírez', rol: 'profesor', texto: '¡Excelente pregunta! Recuerden dar ejemplos específicos.', timestamp: '10:14' },
    { autor: 'Sofia Morales', rol: 'estudiante', texto: 'La distancia recorrida por un automóvil depende de la velocidad y el tiempo transcurrido.', timestamp: '10:15' },
    { autor: 'Mateo Gómez', rol: 'estudiante', texto: 'El costo de la factura de electricidad en función de los kilovatios consumidos al mes.', timestamp: '10:17' }
  ];

  // Verdadero / Falso
  vfIndexPregunta: number = 0;
  vfSeleccion: boolean | null = null;
  vfFeedbackMostrar: boolean = false;

  // Completar Frase
  completarPalabraElegida: string | null = null;
  completarCorrecta: boolean | null = null;

  // Sopa de Letras
  sopaGrid: string[][] = [
    ['D', 'O', 'M', 'I', 'N', 'I', 'O', 'S'],
    ['F', 'U', 'N', 'C', 'I', 'O', 'N', 'A'],
    ['L', 'I', 'M', 'I', 'T', 'E', 'P', 'B'],
    ['R', 'A', 'N', 'G', 'O', 'X', 'Y', 'E'],
    ['R', 'E', 'C', 'T', 'A', 'K', 'L', 'R'],
    ['A', 'S', 'I', 'N', 'T', 'O', 'T', 'A'],
    ['V', 'E', 'R', 'T', 'I', 'C', 'A', 'L'],
    ['S', 'A', 'B', 'E', 'R', 'S', 'E', 'P']
  ];
  sopaPalabrasObjetivo = [
    { palabra: 'DOMINIO', encontrada: false },
    { palabra: 'FUNCION', encontrada: false },
    { palabra: 'RANGO', encontrada: false },
    { palabra: 'LIMITE', encontrada: false },
    { palabra: 'RECTA', encontrada: false }
  ];
  sopaLetrasSeleccionadas: { row: number; col: number; letra: string }[] = [];

  // ==========================================
  // Clases y Roster de Estudiantes
  // ==========================================
  claseSearchQuery: string = '';
  claseDetalleTab: 'info' | 'estudiantes' | 'actividades' = 'info';
  claseSeleccionada: ClaseItem | null = null;

  clases: ClaseItem[] = [
    {
      id: 201,
      name: 'Matemáticas 10°A',
      grado: '10°A',
      codigo: '8F3DSX',
      docente: 'Prof. Carlos Ramírez',
      materia: 'Matemáticas y Cálculo',
      descripcion: 'Preparación integral para pruebas Saber 11 en funciones, trigonometría y análisis cuantitativo.',
      horario: 'Lunes y Miércoles 8:00 AM - 10:00 AM',
      studentsCount: 25,
      icon: 'calculator-outline',
      color: '#8b5cf6',
      estudiantesList: [
        { id: 's1', name: 'Juan Pérez', avatar: '👨‍🎓', asistencia: 96, retosCompletados: 10, promedio: 88 },
        { id: 's2', name: 'Sofia Morales', avatar: '👩‍🎓', asistencia: 92, retosCompletados: 12, promedio: 94 },
        { id: 's3', name: 'Mateo Gómez', avatar: '👨‍🎓', asistencia: 88, retosCompletados: 8, promedio: 79 },
        { id: 's4', name: 'Valeria Torres', avatar: '👩‍🎓', asistencia: 100, retosCompletados: 14, promedio: 97 },
        { id: 's5', name: 'Lucas Ramírez', avatar: '👨‍🎓', asistencia: 84, retosCompletados: 9, promedio: 75 },
        { id: 's6', name: 'Camila Rojas', avatar: '👩‍🎓', asistencia: 90, retosCompletados: 11, promedio: 85 }
      ],
      actividades: [
        { id: 'act1', titulo: 'Quiz de funciones', tipo: 'Cuestionario', estado: 'completado', duracion: '10 min' },
        { id: 'act2', titulo: 'Ruleta de números', tipo: 'Ruleta', estado: 'en-vivo', duracion: '15 min' },
        { id: 'act3', titulo: 'Debate de Asíntotas', tipo: 'Pregunta abierta', estado: 'pendiente', duracion: '20 min' }
      ]
    },
    {
      id: 202,
      name: 'Lengua 10°B',
      grado: '10°B',
      codigo: 'LENG-4K9',
      docente: 'Prof. Carlos Ramírez',
      materia: 'Lenguaje y Comunicación',
      descripcion: 'Comprensión lectora crítica, inferencias textuales y argumentación para Saber 11.',
      horario: 'Martes y Jueves 10:00 AM - 12:00 PM',
      studentsCount: 22,
      icon: 'book-outline',
      color: '#3b82f6',
      estudiantesList: [
        { id: 's7', name: 'Andrés López', avatar: '👨‍🎓', asistencia: 91, retosCompletados: 9, promedio: 82 },
        { id: 's8', name: 'Daniela Castro', avatar: '👩‍🎓', asistencia: 95, retosCompletados: 11, promedio: 90 }
      ],
      actividades: [
        { id: 'act4', titulo: 'Sopa de letras literaria', tipo: 'Sopa de letras', estado: 'completado', duracion: '15 min' },
        { id: 'act5', titulo: 'Pregunta abierta: Figuras retóricas', tipo: 'Pregunta abierta', estado: 'pendiente', duracion: '10 min' }
      ]
    },
    {
      id: 203,
      name: 'Ciencias 10°A',
      grado: '10°A',
      codigo: 'CIEN-7X2',
      docente: 'Prof. Carlos Ramírez',
      materia: 'Física y Química Básica',
      descripcion: 'Modelos cinemáticos, dinámica de fuerzas y leyes de la conservación.',
      horario: 'Viernes 7:00 AM - 9:30 AM',
      studentsCount: 18,
      icon: 'flask-outline',
      color: '#ec4899',
      estudiantesList: [
        { id: 's9', name: 'Martín Vega', avatar: '👨‍🎓', asistencia: 89, retosCompletados: 7, promedio: 78 }
      ],
      actividades: [
        { id: 'act6', titulo: 'Verdadero o falso: Leyes de Newton', tipo: 'Verdadero / falso', estado: 'completado', duracion: '8 min' }
      ]
    }
  ];

  // ==========================================
  // Progreso y Estadísticas Explicadas
  // ==========================================
  progresoTab: 'general' | 'juegos' | 'clases' = 'general';
  statsEstudiante = {
    clasesAsistidas: 13,
    juegosCompletados: 10,
    juegosFallados: 3,
    totalPartidas: 13,
    porcentajePromedio: 78 // (10 / 13) * 100 = 76.9% ≈ 78%
  };

  // Puntos del gráfico de evolución (Sep, Oct, Nov, Dic)
  evolucionPuntos = [
    { mes: 'Sep', porcentaje: 65, cx: 30, cy: 95 },
    { mes: 'Oct', porcentaje: 72, cx: 100, cy: 75 },
    { mes: 'Nov', porcentaje: 75, cx: 170, cy: 65 },
    { mes: 'Dic', porcentaje: 88, cx: 240, cy: 35 }
  ];

  // ==========================================
  // Logros y Misiones Diarias
  // ==========================================
  logrosTab: 'logros' | 'misiones' = 'logros';

  logros: LogroDesafio[] = [
    { id: 1, title: 'Creador de partidas', desc: 'Nivel 1: Diseña tu primera actividad educativa.', medal: 'bronze', completed: true, recompensa: 50, claimed: true },
    { id: 2, title: 'Explorador', desc: 'Completa 5 juegos en cualquier modalidad.', medal: 'silver', completed: true, recompensa: 100, claimed: true },
    { id: 3, title: 'Maestro del quiz', desc: 'Completa 20 juegos con más del 80% de aciertos.', medal: 'gold', completed: false, recompensa: 250, claimed: false },
    { id: 4, title: 'Racha de fuego', desc: 'Ingresa y supera un reto diario 3 días seguidos.', medal: 'silver', completed: true, recompensa: 120, claimed: false },
    { id: 5, title: 'Coleccionista de estilo', desc: 'Adquiere 4 prendas o accesorios para tu avatar.', medal: 'gold', completed: true, recompensa: 200, claimed: false }
  ];

  misionesDiarias: MisionDiaria[] = [
    { id: 1, nivel: 'bronce', title: 'Misión Bronce', desc: 'Completa 1 juego en vivo o individual.', recompensa: 50, progreso: 1, meta: 1, completed: true, claimed: false },
    { id: 2, nivel: 'plata', title: 'Misión Plata', desc: 'Completa 3 juegos y gana al menos 80 puntos.', recompensa: 100, progreso: 2, meta: 3, completed: false, claimed: false },
    { id: 3, nivel: 'oro', title: 'Misión Oro', desc: 'Obtén puntaje perfecto (100%) en cualquier dinámica.', recompensa: 200, progreso: 1, meta: 1, completed: true, claimed: false },
    { id: 4, nivel: 'diamante', title: 'Misión Diamante Rara', desc: 'Supera 5 retos consecutivos sin equivocarte.', recompensa: 500, progreso: 3, meta: 5, completed: false, claimed: false }
  ];

  // ==========================================
  // Idioma, Tema, Accesibilidad y Perfil
  // ==========================================
  configIdioma: 'Español' | 'English' = 'Español';
  configTema: 'claro' | 'oscuro' = 'oscuro';
  
  // Perfil editable
  perfilEditando: boolean = false;
  perfilNombreInput: string = '';
  perfilBioInput: string = 'Apasionado por las matemáticas y la física galáctica.';
  perfilGradoInput: string = '10°A';

  // Privacidad
  privacidadPerfil: 'publico' | 'privado' = 'publico';
  privacidadJuegos: 'publico' | 'amigos' | 'privado' = 'amigos';

  // Ayudas funcionales de inclusión (Accesibilidad Real 8.4)
  accesibilidad = {
    lectorPantallaVoz: false,
    tamanoLetra: 'normal' as 'normal' | 'grande' | 'muy-grande',
    altoContraste: false,
    modoEnfoque: false
  };

  // Tutorial / Guía interactiva
  guiaPasoActual: number = 1;
  guiaAbierta: boolean = false;

  // StAIle AI Assistant
  staileOpen: boolean = false;
  staileInput: string = '';
  staileLoading: boolean = false;
  staileMessages: Chatmessage[] = [
    {
      id: 'staile_welcome',
      role: 'assistant',
      content: '¡Hola! 🚀 Soy **StAIle**, tu tutor galáctico en SaberStyle (Aico). ¿Tienes dudas sobre fórmulas, minijuegos o cómo ganar monedas para tu avatar?',
      timestamp: new Date()
    }
  ];
  staileSugerencias = [
    '¿Cómo calculo el dominio de una función?',
    '¿Cómo configuro una ruleta de preguntas?',
    '¿Cómo gano monedas para el armario?'
  ];

  constructor(
    private authService: AuthService,
    private aiChatService: AichatService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    // 1. Cargar preferencias guardadas en localStorage
    this.cargarPreferenciasGuardadas();

    // 2. Suscribirse a la sesión de usuario
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        if (user.coins !== undefined) {
          this.userCoins = user.coins;
        }
        if (user.avatarConfig) {
          this.avatarConfig = { ...this.avatarConfig, ...user.avatarConfig };
        }
        this.perfilNombreInput = user.name || 'Juan Pérez';
        
        // Asignación correcta de pantalla según rol
        if (user.role === 'teacher') {
          this.activeTab = 'profesor';
        } else {
          this.activeTab = 'estudiante';
        }
        this.currentBottomNav = 'inicio';
      }
    });
  }

  private cargarPreferenciasGuardadas(): void {
    try {
      const temaGuardado = localStorage.getItem('saberstyle_theme') as 'claro' | 'oscuro';
      if (temaGuardado === 'claro' || temaGuardado === 'oscuro') {
        this.aplicarTema(temaGuardado, false);
      } else {
        this.aplicarTema('oscuro', false);
      }

      const idiomaGuardado = localStorage.getItem('saberstyle_lang') as 'Español' | 'English';
      if (idiomaGuardado) {
        this.configIdioma = idiomaGuardado;
      }

      const accGuardada = localStorage.getItem('saberstyle_accessibility');
      if (accGuardada) {
        this.accesibilidad = { ...this.accesibilidad, ...JSON.parse(accGuardada) };
        this.aplicarClasesAccesibilidad();
      }
    } catch {
      // Ignorar fallos de parsing
    }
  }

  // ==========================================
  // Navegación Principal y Roles
  // ==========================================
  selectBottomNav(nav: 'inicio' | 'clases' | 'crear' | 'tienda' | 'perfil') {
    this.currentBottomNav = nav;
    const esProfesor = this.currentUser?.role === 'teacher';

    switch (nav) {
      case 'inicio':
        this.activeTab = esProfesor ? 'profesor' : 'estudiante';
        break;
      case 'clases':
        this.activeTab = 'clases';
        break;
      case 'crear':
        if (esProfesor) {
          this.activeTab = 'crear-juego';
        } else {
          // Estudiante: va directo a biblioteca / jugar
          this.activeTab = 'mis-juegos';
        }
        break;
      case 'tienda':
        this.activeTab = 'tienda';
        break;
      case 'perfil':
        this.activeTab = 'perfil';
        break;
    }
  }

  selectTab(tab: any) {
    this.activeTab = tab;
    if (tab === 'estudiante' || tab === 'profesor') {
      this.currentBottomNav = 'inicio';
    } else if (tab === 'clases' || tab === 'clase-detalle') {
      this.currentBottomNav = 'clases';
    } else if (tab === 'crear-juego' || tab === 'ruleta-config') {
      this.currentBottomNav = 'crear';
    } else if (tab === 'tienda') {
      this.currentBottomNav = 'tienda';
    } else if (tab === 'perfil' || tab === 'closet') {
      this.currentBottomNav = 'perfil';
    }
  }

  volverAInicio() {
    this.selectBottomNav('inicio');
  }

  abrirVestuario() {
    this.activeTab = 'closet';
    this.currentBottomNav = 'perfil';
  }

  abrirTienda() {
    this.activeTab = 'tienda';
    this.currentBottomNav = 'tienda';
  }

  abrirCrearJuego() {
    if (this.currentUser?.role !== 'teacher') {
      this.mostrarToast('Función exclusiva para profesores. Explora los juegos disponibles para jugar.');
      this.activeTab = 'mis-juegos';
      return;
    }
    this.activeTab = 'crear-juego';
    this.currentBottomNav = 'crear';
  }

  abrirProgreso() {
    this.activeTab = 'progreso';
  }

  abrirLogros() {
    this.activeTab = 'logros';
  }

  abrirPerfil() {
    this.activeTab = 'perfil';
    this.currentBottomNav = 'perfil';
  }

  // ==========================================
  // Tienda y Economía
  // ==========================================
  get filteredStoreItems(): StoreItem[] {
    return this.storeItems.filter(item => item.category === this.storeCategoryFilter);
  }

  get filteredClosetItems(): StoreItem[] {
    return this.storeItems.filter(item => item.owned && item.category === this.closetCategoryFilter);
  }

  setStoreCategory(cat: 'ropa' | 'pelo' | 'accesorios' | 'zapatos') {
    this.storeCategoryFilter = cat;
  }

  setClosetCategory(cat: 'ropa' | 'pelo' | 'accesorios' | 'zapatos') {
    this.closetCategoryFilter = cat;
  }

  async comprarPrenda(item: StoreItem) {
    if (item.owned) {
      this.equiparPrenda(item);
      return;
    }

    if (this.userCoins < item.price) {
      const alert = await this.alertController.create({
        header: 'Monedas Insuficientes',
        message: `Necesitas ${item.price} monedas para adquirir "${item.name}". Tu saldo actual es de 🪙 ${this.userCoins}. ¡Supera retos y misiones para conseguir más!`,
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Compra',
      message: `¿Deseas comprar "${item.name}" por 🪙 ${item.price} monedas?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Comprar',
          handler: () => {
            this.userCoins -= item.price;
            item.owned = true;
            this.equiparPrenda(item);
            this.sincronizarUsuario();
            this.mostrarToast(`¡Genial! Has comprado y equipado "${item.name}". Ya está en tu armario.`);
          }
        }
      ]
    });
    await alert.present();
  }

  equiparPrenda(item: StoreItem) {
    // Desequipar otras prendas de la misma categoría
    this.storeItems
      .filter(i => i.category === item.category && i.id !== item.id)
      .forEach(i => (i.equipped = false));

    item.equipped = true;

    // Actualizar configuración del avatar
    if (item.category === 'ropa') {
      if (item.id.includes('pantalon') || item.id.includes('falda')) {
        this.avatarConfig.bottomId = item.id;
      } else {
        this.avatarConfig.topId = item.id;
      }
    } else if (item.category === 'pelo') {
      this.avatarConfig.hairId = item.id;
    } else if (item.category === 'zapatos') {
      this.avatarConfig.shoesId = item.id;
    } else if (item.category === 'accesorios') {
      this.avatarConfig.accessoryId = item.id;
    }

    this.sincronizarUsuario();
    this.mostrarToast(`"${item.name}" equipada en tu avatar.`);
  }

  // ==========================================
  // Armario / Vestuario
  // ==========================================
  cambiarTonoPiel(color: string) {
    this.avatarConfig.skinColor = color;
    this.sincronizarUsuario();
  }

  cambiarExpresion(exp: string) {
    this.avatarConfig.expression = exp;
    this.sincronizarUsuario();
  }

  cambiarAngulo(angulo: string) {
    this.avatarConfig.angle = angulo;
  }

  guardarCambiosVestuario() {
    this.sincronizarUsuario();
    this.mostrarToast('¡Estilo guardado y sincronizado con tu perfil e inicio!');
    this.volverAInicio();
  }

  private sincronizarUsuario() {
    this.authService.updateCurrentUser({
      coins: this.userCoins,
      avatarConfig: { ...this.avatarConfig },
      name: this.perfilNombreInput || this.currentUser?.name
    });
  }

  // ==========================================
  // Creación y Edición de Minijuegos
  // ==========================================
  selectGameType(id: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras') {
    this.selectedGameType = id;
  }

  setParticipationMode(mode: 'en-vivo' | 'individual') {
    this.selectedParticipationMode = mode;
  }

  continuarCreacionJuego() {
    if (this.selectedGameType === 'ruleta') {
      this.ruletaConfigTitulo = this.nuevoJuegoTitulo.trim() || 'La ruleta de la historia';
      this.activeTab = 'ruleta-config';
    } else {
      this.guardarNuevoJuegoGenerico();
    }
  }

  agregarPreguntaRuleta() {
    const texto = this.nuevaPreguntaRuletaInput.trim();
    if (!texto) {
      this.mostrarToast('Por favor escribe la pregunta o concepto.');
      return;
    }
    this.ruletaConfigPreguntas.push(texto);
    this.nuevaPreguntaRuletaInput = '';
    this.mostrarToast('Pregunta añadida a la ruleta.');
  }

  eliminarPreguntaRuleta(index: number) {
    if (this.ruletaConfigPreguntas.length <= 2) {
      this.mostrarToast('La ruleta debe tener al menos 2 preguntas.');
      return;
    }
    this.ruletaConfigPreguntas.splice(index, 1);
  }

  guardarConfigRuleta() {
    const titulo = this.ruletaConfigTitulo.trim() || 'Ruleta de Repaso';
    const nueva: SavedGame = {
      id: 'g_' + Date.now(),
      titulo,
      tipo: 'ruleta',
      tipoLabel: 'Ruleta',
      modo: this.selectedParticipationMode,
      materia: 'General',
      preguntasCount: this.ruletaConfigPreguntas.length,
      fecha: 'Ahora',
      preguntas: this.ruletaConfigPreguntas.map(p => ({ tema: p.substring(0, 12), pregunta: p }))
    };

    this.savedGames.unshift(nueva);
    this.mostrarToast(`¡Ruleta "${titulo}" creada con éxito!`);
    this.activeTab = 'mis-juegos';
  }

  guardarNuevoJuegoGenerico() {
    const tipoObj = this.gameTypes.find(g => g.id === this.selectedGameType);
    const titulo = this.nuevoJuegoTitulo.trim() || `Actividad de ${tipoObj?.name || 'Práctica'}`;

    const nuevo: SavedGame = {
      id: 'g_' + Date.now(),
      titulo,
      tipo: this.selectedGameType,
      tipoLabel: tipoObj?.name || 'Actividad',
      modo: this.selectedParticipationMode,
      materia: this.nuevoJuegoMateria,
      preguntasCount: 8,
      fecha: 'Ahora',
      preguntas: []
    };

    this.savedGames.unshift(nuevo);
    this.nuevoJuegoTitulo = '';
    this.mostrarToast(`¡"${nuevo.titulo}" guardado (${nuevo.modo === 'en-vivo' ? 'En vivo' : 'Individual'})!`);
    this.activeTab = 'mis-juegos';
  }

  get filteredSavedGames(): SavedGame[] {
    let list = this.savedGames;
    if (this.juegosFiltroTab === 'compartidos') {
      list = list.filter(g => g.compartido);
    }
    if (this.juegosSearchQuery.trim()) {
      const q = this.juegosSearchQuery.toLowerCase();
      list = list.filter(g => g.titulo.toLowerCase().includes(q) || g.materia.toLowerCase().includes(q));
    }
    return list;
  }

  jugarActividad(juego: SavedGame) {
    this.juegoActivo = juego;

    switch (juego.tipo) {
      case 'quiz':
        this.iniciarQuizFlow();
        break;
      case 'ruleta':
        this.iniciarRuletaFlow();
        break;
      case 'abierta':
        this.iniciarAbiertaFlow();
        break;
      case 'verdadero-falso':
        this.iniciarVFFlow();
        break;
      case 'completar':
        this.iniciarCompletarFlow();
        break;
      case 'sopa-letras':
        this.iniciarSopaFlow();
        break;
      default:
        this.iniciarQuizFlow();
    }
  }

  async editarActividad(juego: SavedGame) {
    if (juego.tipo === 'ruleta') {
      this.ruletaConfigTitulo = juego.titulo;
      this.ruletaConfigPreguntas = juego.preguntas?.map(p => p.pregunta || p) || ['Pregunta 1', 'Pregunta 2'];
      this.activeTab = 'ruleta-config';
      return;
    }

    const alert = await this.alertController.create({
      header: 'Editar Actividad',
      subHeader: juego.tipoLabel,
      inputs: [
        { name: 'titulo', type: 'text', value: juego.titulo, placeholder: 'Título del juego' },
        { name: 'materia', type: 'text', value: juego.materia, placeholder: 'Materia' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.titulo?.trim()) {
              juego.titulo = data.titulo.trim();
              juego.materia = data.materia?.trim() || juego.materia;
              this.mostrarToast('Actividad actualizada.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async renombrarActividad(juego: SavedGame) {
    const alert = await this.alertController.create({
      header: 'Renombrar Actividad',
      inputs: [{ name: 'titulo', type: 'text', value: juego.titulo, placeholder: 'Nuevo nombre' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Renombrar',
          handler: (data) => {
            if (data.titulo?.trim()) {
              juego.titulo = data.titulo.trim();
              this.mostrarToast('Nombre actualizado.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarActividad(juego: SavedGame) {
    const alert = await this.alertController.create({
      header: '¿Eliminar Actividad?',
      message: `¿Estás seguro de eliminar "${juego.titulo}"?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.savedGames = this.savedGames.filter(g => g.id !== juego.id);
            this.mostrarToast('Actividad eliminada.');
          }
        }
      ]
    });
    await alert.present();
  }

  // ==========================================
  // Ejecución de Juegos
  // ==========================================
  iniciarQuizFlow() {
    this.quizIndexPregunta = 0;
    this.quizScoreCorrectas = 0;
    this.quizOpcionElegida = null;
    this.quizRespondida = false;
    this.quizTimerSegundos = 15;
    this.activeTab = 'juego-quiz';
    this.startQuizTimer();
  }

  private startQuizTimer() {
    clearInterval(this.quizTimerInterval);
    this.quizTimerSegundos = 15;
    this.quizTimerInterval = setInterval(() => {
      if (this.quizTimerSegundos > 0) {
        this.quizTimerSegundos--;
      } else {
        clearInterval(this.quizTimerInterval);
        if (!this.quizRespondida) {
          this.responderQuiz(-1);
        }
      }
    }, 1000);
  }

  responderQuiz(opcionIndex: number) {
    if (this.quizRespondida) return;
    this.quizRespondida = true;
    this.quizOpcionElegida = opcionIndex;
    clearInterval(this.quizTimerInterval);

    const quizJuego = this.juegoActivo || this.savedGames[0];
    const preguntas = quizJuego.preguntas || [];
    const correcta = preguntas[this.quizIndexPregunta]?.correcta ?? 1;

    if (opcionIndex === correcta) {
      this.quizScoreCorrectas++;
    }

    setTimeout(() => {
      if (this.quizIndexPregunta + 1 < (preguntas.length || 3)) {
        this.quizIndexPregunta++;
        this.quizRespondida = false;
        this.quizOpcionElegida = null;
        this.startQuizTimer();
      } else {
        this.finalizarJuegoExitoso(100);
      }
    }, 1200);
  }

  iniciarRuletaFlow() {
    this.ruletaAngulo = 0;
    this.ruletaGirando = false;
    this.ruletaSectorSeleccionado = null;
    this.activeTab = 'juego-ruleta';
  }

  girarRuletaFisica() {
    if (this.ruletaGirando) return;
    this.ruletaGirando = true;
    this.ruletaSectorSeleccionado = null;

    const vueltas = 5 + Math.floor(Math.random() * 4);
    const anguloOffset = Math.floor(Math.random() * 360);
    const totalGiro = this.ruletaAngulo + (vueltas * 360) + anguloOffset;
    this.ruletaAngulo = totalGiro;

    const preguntas = this.juegoActivo?.preguntas || this.savedGames[1].preguntas;

    setTimeout(() => {
      this.ruletaGirando = false;
      const index = Math.floor((totalGiro % 360) / (360 / preguntas.length));
      this.ruletaSectorSeleccionado = preguntas[index] || preguntas[0];
      this.userCoins += 60;
      this.sincronizarUsuario();
      this.mostrarToast(`¡La ruleta cayó en "${this.ruletaSectorSeleccionado.tema || 'Pregunta'}"! +60 monedas.`);
    }, 3200);
  }

  iniciarAbiertaFlow() {
    this.abiertaRespuestaUsuario = '';
    this.activeTab = 'juego-abierta';
  }

  enviarRespuestaAbierta() {
    const texto = this.abiertaRespuestaUsuario.trim();
    if (!texto) {
      this.mostrarToast('Por favor escribe tu respuesta.');
      return;
    }

    this.abiertaFeedRespuestas.unshift({
      autor: (this.currentUser?.name || 'Estudiante') + ' (Tú)',
      rol: this.currentUser?.role === 'teacher' ? 'profesor' : 'estudiante',
      texto,
      timestamp: 'Ahora'
    });

    this.abiertaRespuestaUsuario = '';
    this.mostrarToast('Respuesta compartida con la clase.');
    setTimeout(() => {
      this.finalizarJuegoExitoso(80);
    }, 900);
  }

  iniciarVFFlow() {
    this.vfIndexPregunta = 0;
    this.vfSeleccion = null;
    this.vfFeedbackMostrar = false;
    this.activeTab = 'juego-vf';
  }

  responderVF(eleccion: boolean) {
    if (this.vfFeedbackMostrar) return;
    this.vfSeleccion = eleccion;
    this.vfFeedbackMostrar = true;

    setTimeout(() => {
      this.vfFeedbackMostrar = false;
      this.vfSeleccion = null;
      this.finalizarJuegoExitoso(90);
    }, 1400);
  }

  iniciarCompletarFlow() {
    this.completarPalabraElegida = null;
    this.completarCorrecta = null;
    this.activeTab = 'juego-completar';
  }

  seleccionarPalabraCompletar(palabra: string) {
    this.completarPalabraElegida = palabra;
    this.completarCorrecta = (palabra.toLowerCase() === 'equilátero');

    setTimeout(() => {
      this.finalizarJuegoExitoso(100);
    }, 1200);
  }

  iniciarSopaFlow() {
    this.sopaLetrasSeleccionadas = [];
    this.sopaPalabrasObjetivo.forEach(p => (p.encontrada = false));
    this.activeTab = 'juego-sopa';
  }

  tocarLetraSopa(row: number, col: number, letra: string) {
    const ya = this.sopaLetrasSeleccionadas.find(l => l.row === row && l.col === col);
    if (ya) {
      this.sopaLetrasSeleccionadas = this.sopaLetrasSeleccionadas.filter(l => !(l.row === row && l.col === col));
    } else {
      this.sopaLetrasSeleccionadas.push({ row, col, letra });
    }

    // Verificar palabra formada
    const palabra = this.sopaLetrasSeleccionadas.map(l => l.letra).join('');
    const palabraInvertida = this.sopaLetrasSeleccionadas.map(l => l.letra).reverse().join('');

    const target = this.sopaPalabrasObjetivo.find(
      p => !p.encontrada && (p.palabra === palabra || p.palabra === palabraInvertida)
    );

    if (target) {
      target.encontrada = true;
      this.sopaLetrasSeleccionadas = [];
      this.userCoins += 40;
      this.sincronizarUsuario();
      this.mostrarToast(`¡Palabra "${target.palabra}" encontrada! +40 monedas.`);

      // Si encontró todas
      if (this.sopaPalabrasObjetivo.every(p => p.encontrada)) {
        setTimeout(() => this.finalizarJuegoExitoso(120), 800);
      }
    }
  }

  finalizarJuegoExitoso(monedasGanadas: number) {
    clearInterval(this.quizTimerInterval);
    this.userCoins += monedasGanadas;
    this.statsEstudiante.juegosCompletados++;
    this.statsEstudiante.totalPartidas++;
    this.statsEstudiante.porcentajePromedio = Math.round(
      (this.statsEstudiante.juegosCompletados / this.statsEstudiante.totalPartidas) * 100
    );

    // Actualizar progreso en misiones diarias
    const mision1 = this.misionesDiarias[0];
    if (mision1) mision1.completed = true;
    const mision2 = this.misionesDiarias[1];
    if (mision2 && mision2.progreso < mision2.meta) mision2.progreso++;
    if (mision2 && mision2.progreso >= mision2.meta) mision2.completed = true;

    this.sincronizarUsuario();
    this.activeTab = 'juego-victoria';
  }

  reclamarVictoria() {
    this.mostrarToast('¡Recompensa guardada en tu cuenta!');
    this.volverAInicio();
  }

  // ==========================================
  // Clases y Roster
  // ==========================================
  get clasesFiltradas(): ClaseItem[] {
    if (!this.claseSearchQuery.trim()) return this.clases;
    const q = this.claseSearchQuery.toLowerCase();
    return this.clases.filter(c => c.name.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q));
  }

  verDetalleClase(clase: ClaseItem) {
    this.claseSeleccionada = clase;
    this.claseDetalleTab = 'info';
    this.activeTab = 'clase-detalle';
    this.currentBottomNav = 'clases';
  }

  async copiarCodigoClase(codigo: string) {
    if (navigator?.clipboard) {
      await navigator.clipboard.writeText(codigo);
    }
    this.mostrarToast(`Código "${codigo}" copiado al portapapeles.`);
  }

  async compartirCodigoClase(clase: ClaseItem) {
    const texto = `Únete a mi clase de SaberStyle "${clase.name}" con el código: ${clase.codigo}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: 'SaberStyle - Código de Clase', text: texto });
        return;
      } catch {}
    }
    await this.copiarCodigoClase(clase.codigo);
  }

  async invitarEstudiante() {
    const alert = await this.alertController.create({
      header: 'Invitar Estudiante',
      message: 'Ingresa el correo del estudiante para matricularlo:',
      inputs: [{ name: 'email', type: 'email', placeholder: 'estudiante@institucion.edu.co' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Invitar',
          handler: (data) => {
            if (data.email?.trim()) {
              if (this.claseSeleccionada) {
                this.claseSeleccionada.estudiantesList.push({
                  id: 's_' + Date.now(),
                  name: data.email.split('@')[0],
                  avatar: '👨‍🎓',
                  asistencia: 100,
                  retosCompletados: 0,
                  promedio: 100
                });
                this.claseSeleccionada.studentsCount = this.claseSeleccionada.estudiantesList.length;
              }
              this.mostrarToast(`Invitación enviada a ${data.email.trim()}`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async crearNuevaClaseModal() {
    const alert = await this.alertController.create({
      header: 'Crear Nueva Clase',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre (Ej: Matemáticas 11°B)' },
        { name: 'grado', type: 'text', placeholder: 'Grado (Ej: 11°B)' },
        { name: 'materia', type: 'text', placeholder: 'Materia (Ej: Cálculo)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            if (data.nombre?.trim()) {
              const codigoAleatorio = Math.random().toString(36).substring(2, 8).toUpperCase();
              const nueva: ClaseItem = {
                id: Date.now(),
                name: data.nombre.trim(),
                grado: data.grado?.trim() || '10°A',
                codigo: codigoAleatorio,
                docente: this.currentUser?.name || 'Profesor',
                materia: data.materia?.trim() || 'General',
                descripcion: 'Aula virtual creada para dinámicas y actividades SaberStyle.',
                horario: 'Lunes a Viernes',
                studentsCount: 1,
                icon: 'school-outline',
                color: '#8b5cf6',
                estudiantesList: [
                  { id: 's_me', name: 'Juan Pérez', avatar: '👨‍🎓', asistencia: 100, retosCompletados: 0, promedio: 100 }
                ],
                actividades: []
              };
              this.clases.unshift(nueva);
              this.mostrarToast(`Clase "${nueva.name}" creada con código ${codigoAleatorio}`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async unirseAClaseModal() {
    const alert = await this.alertController.create({
      header: 'Unirte a una Clase',
      message: 'Ingresa el código proporcionado por tu profesor (ej: 8F3DSX):',
      inputs: [{ name: 'codigo', type: 'text', placeholder: 'Código de clase' }],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Unirme',
          handler: (data) => {
            const cod = data.codigo?.trim().toUpperCase();
            if (cod) {
              const encontrada = this.clases.find(c => c.codigo.toUpperCase() === cod);
              if (encontrada) {
                this.mostrarToast(`¡Te has unido con éxito a "${encontrada.name}"!`);
                this.verDetalleClase(encontrada);
              } else {
                this.mostrarToast(`Código ${cod} no encontrado. Verifica con tu docente.`);
              }
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // ==========================================
  // Reclamar Misiones y Logros
  // ==========================================
  reclamarMision(mision: MisionDiaria) {
    if (mision.claimed || !mision.completed) return;
    mision.claimed = true;
    this.userCoins += mision.recompensa;
    this.sincronizarUsuario();
    this.mostrarToast(`¡Misión reclamada! +🪙 ${mision.recompensa} monedas.`);
  }

  reclamarLogro(logro: LogroDesafio) {
    if (logro.claimed || !logro.completed) return;
    logro.claimed = true;
    this.userCoins += logro.recompensa;
    this.sincronizarUsuario();
    this.mostrarToast(`¡Logro desbloqueado! +🪙 ${logro.recompensa} monedas.`);
  }

  // ==========================================
  // Idioma y Tema Claro/Oscuro
  // ==========================================
  setTema(tema: 'claro' | 'oscuro') {
    this.aplicarTema(tema, true);
  }

  private aplicarTema(tema: 'claro' | 'oscuro', notificar: boolean) {
    this.configTema = tema;
    localStorage.setItem('saberstyle_theme', tema);

    const body = document.body;
    if (tema === 'claro') {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
    } else {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
    }

    if (notificar) {
      this.mostrarToast(`Tema ${tema.toUpperCase()} aplicado en toda la aplicación.`);
    }
  }

  async cambiarIdioma() {
    const alert = await this.alertController.create({
      header: 'Seleccionar Idioma',
      inputs: [
        { name: 'idioma', type: 'radio', label: 'Español 🇪🇸', value: 'Español', checked: this.configIdioma === 'Español' },
        { name: 'idioma', type: 'radio', label: 'English 🇺🇸', value: 'English', checked: this.configIdioma === 'English' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (val) => {
            if (val) {
              this.configIdioma = val;
              localStorage.setItem('saberstyle_lang', val);
              this.mostrarToast(`Idioma cambiado a ${val}.`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  // ==========================================
  // Accesibilidad Real (8.4)
  // ==========================================
  abrirAccesibilidad() {
    this.activeTab = 'accesibilidad';
  }

  toggleLectorVoz() {
    this.accesibilidad.lectorPantallaVoz = !this.accesibilidad.lectorPantallaVoz;
    this.guardarAccesibilidad();
    if (this.accesibilidad.lectorPantallaVoz) {
      this.leerTextoEnVozAlta('Lector de pantalla por voz activado en SaberStyle.');
    } else {
      this.mostrarToast('Lector de voz desactivado.');
    }
  }

  setTamanoLetra(tamano: 'normal' | 'grande' | 'muy-grande') {
    this.accesibilidad.tamanoLetra = tamano;
    this.guardarAccesibilidad();
    this.aplicarClasesAccesibilidad();
    this.mostrarToast(`Tamaño de letra: ${tamano.toUpperCase()}`);
  }

  toggleAltoContraste() {
    this.accesibilidad.altoContraste = !this.accesibilidad.altoContraste;
    this.guardarAccesibilidad();
    this.aplicarClasesAccesibilidad();
    this.mostrarToast(this.accesibilidad.altoContraste ? 'Modo Alto Contraste activado.' : 'Modo estándar activado.');
  }

  toggleModoEnfoque() {
    this.accesibilidad.modoEnfoque = !this.accesibilidad.modoEnfoque;
    this.guardarAccesibilidad();
    this.aplicarClasesAccesibilidad();
    this.mostrarToast(this.accesibilidad.modoEnfoque ? 'Modo Enfoque activado: animaciones reducidas.' : 'Animaciones normales activadas.');
  }

  private guardarAccesibilidad() {
    localStorage.setItem('saberstyle_accessibility', JSON.stringify(this.accesibilidad));
  }

  private aplicarClasesAccesibilidad() {
    const body = document.body;
    body.classList.toggle('acc-alto-contraste', this.accesibilidad.altoContraste);
    body.classList.toggle('acc-modo-enfoque', this.accesibilidad.modoEnfoque);
    body.classList.remove('font-normal', 'font-grande', 'font-muy-grande');
    body.classList.add('font-' + this.accesibilidad.tamanoLetra);
  }

  leerTextoEnVozAlta(texto: string) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = this.configIdioma === 'English' ? 'en-US' : 'es-ES';
      window.speechSynthesis.speak(u);
    } else {
      this.mostrarToast(texto);
    }
  }

  // ==========================================
  // Perfil y Edición
  // ==========================================
  guardarEdicionPerfil() {
    const nuevoNombre = this.perfilNombreInput.trim();
    if (!nuevoNombre) {
      this.mostrarToast('El nombre no puede estar vacío.');
      return;
    }
    this.authService.updateCurrentUser({
      name: nuevoNombre
    });
    this.perfilEditando = false;
    this.mostrarToast('Perfil actualizado correctamente.');
  }

  // ==========================================
  // Guía y Tutorial Interactivo
  // ==========================================
  abrirGuiaTutorial() {
    this.guiaPasoActual = 1;
    this.guiaAbierta = true;
    this.activeTab = 'guia-tutorial';
  }

  siguientePasoGuia() {
    if (this.guiaPasoActual < 4) {
      this.guiaPasoActual++;
    } else {
      this.guiaAbierta = false;
      this.volverAInicio();
      this.mostrarToast('¡Tutorial completado! Disfruta SaberStyle.');
    }
  }

  // ==========================================
  // Asistente IA: StAIle
  // ==========================================
  toggleStaile() {
    this.staileOpen = !this.staileOpen;
  }

  enviarMensajeStaile(texto?: string) {
    const query = (texto || this.staileInput).trim();
    if (!query) return;

    this.staileInput = '';
    this.staileLoading = true;

    this.aiChatService.sendMessage(query).subscribe({
      next: () => {
        this.staileLoading = false;
        this.staileMessages = this.aiChatService.getConversationHistory();
      },
      error: () => {
        this.staileLoading = false;
      }
    });
  }

  // ==========================================
  // Menú Superior y Cierre de Sesión
  // ==========================================
  async presentHeaderMenu() {
    const esProfe = this.currentUser?.role === 'teacher';
    const buttons: any[] = [
      {
        text: 'Mi Perfil',
        icon: 'person-outline',
        handler: () => { this.abrirPerfil(); }
      },
      {
        text: 'Ayuda y Accesibilidad',
        icon: 'accessibility-outline',
        handler: () => { this.abrirAccesibilidad(); }
      },
      {
        text: 'Guía y Tutorial',
        icon: 'help-circle-outline',
        handler: () => { this.abrirGuiaTutorial(); }
      }
    ];

    if (!esProfe) {
      buttons.unshift({
        text: 'Mi Armario y Vestuario',
        icon: 'shirt-outline',
        handler: () => { this.abrirVestuario(); }
      });
    }

    buttons.push({
      text: 'Cerrar Sesión',
      role: 'destructive',
      icon: 'log-out-outline',
      handler: () => { this.confirmLogout(); }
    });

    buttons.push({
      text: 'Cancelar',
      role: 'cancel',
      icon: 'close'
    });

    const actionSheet = await this.actionSheetController.create({
      header: 'SaberStyle · Aico',
      buttons
    });
    await actionSheet.present();
  }

  async confirmLogout(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir de SaberStyle?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Sí, Salir',
          role: 'confirm',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2500,
      position: 'bottom',
      color: 'dark'
    });
    await toast.present();
  }
}
