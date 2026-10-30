import { Component, OnInit, OnDestroy } from '@angular/core';
import { AlertController, ToastController, ActionSheetController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AichatService } from '../services/ai-chat.service';
import { I18nService, SupportedLanguage } from '../services/i18n.service';
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
  instrucciones?: string;
  recompensaMonedas: number;
  palabras?: string[];
}

export interface StudentItem {
  id: string;
  name: string;
  avatar: string;
  avatarImg: string;
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
  actividades: { id: string; titulo: string; tipo: string; estado: 'completado' | 'en-vivo' | 'pendiente'; duracion: string; recompensa: number }[];
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
  image: string;
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
export class HomePage implements OnInit, OnDestroy {
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
    | 'tienda-monedas'
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

  // Destino de la barra de navegación inferior (Fase 2: Perfil sustituido por Estadísticas)
  currentBottomNav: 'inicio' | 'clases' | 'crear' | 'tienda' | 'stats' = 'inicio';

  // Monedas del usuario
  userCoins: number = 1250;

  // Avatar sincronizado globalmente
  avatarConfig = {
    skinColor: '#f8d9b6',
    hairId: 'corte-fade',
    topId: 'sudadera-estrella',
    bottomId: 'pantalon-urbano',
    shoesId: 'pantalon-urbano',
    accessoryId: 'gorra-urbana',
    expression: 'Feliz',
    angle: 'Frente'
  };

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

  // Catálogo completo de Tienda usando recursos gráficos originales (PNGs individuales)
  storeItems: StoreItem[] = [
    // Ropa / Tops
    {
      id: 'sudadera-estrella',
      name: 'Sudadera Estrella Violeta',
      category: 'ropa',
      price: 350,
      tag: 'NUEVO',
      owned: true,
      equipped: true,
      icon: 'shirt-outline',
      color: '#a855f7',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/03_Prendas_superiores/prenda_superior_01.png'
    },
    {
      id: 'hoodie-galaxia',
      name: 'Hoodie Galaxia con Capucha',
      category: 'ropa',
      price: 400,
      tag: 'POPULAR',
      owned: true,
      equipped: false,
      icon: 'shirt-outline',
      color: '#6366f1',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/03_Prendas_superiores/prenda_superior_02.png'
    },
    {
      id: 'camiseta-saber',
      name: 'Camiseta SaberStyle Blanca',
      category: 'ropa',
      price: 200,
      owned: true,
      equipped: false,
      icon: 'shirt-outline',
      color: '#e2e8f0',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/03_Prendas_superiores/prenda_superior_03.png'
    },
    {
      id: 'chaqueta-neon',
      name: 'Chaqueta Cyber Urbana',
      category: 'ropa',
      price: 480,
      tag: 'ÉPICO',
      owned: false,
      equipped: false,
      icon: 'shirt-outline',
      color: '#ec4899',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/03_Prendas_superiores/prenda_superior_04.png'
    },
    {
      id: 'camiseta-gamer',
      name: 'Camiseta Gamer Pro',
      category: 'ropa',
      price: 260,
      owned: false,
      equipped: false,
      icon: 'shirt-outline',
      color: '#10b981',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/03_Prendas_superiores/prenda_superior_05.png'
    },
    // Pantalones y faldas
    {
      id: 'pantalon-urbano',
      name: 'Pantalón Urbano Denim',
      category: 'ropa',
      price: 280,
      tag: 'POPULAR',
      owned: true,
      equipped: true,
      icon: 'barcode-outline',
      color: '#3b82f6',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/04_Pantalones/pantalon_01.png'
    },
    {
      id: 'pantalon-jogger',
      name: 'Pantalón Jogger Galaxia',
      category: 'ropa',
      price: 320,
      owned: false,
      equipped: false,
      icon: 'barcode-outline',
      color: '#8b5cf6',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/04_Pantalones/pantalon_02.png'
    },
    {
      id: 'falda-plisada',
      name: 'Falda Plisada Violeta',
      category: 'ropa',
      price: 260,
      owned: false,
      equipped: false,
      icon: 'color-palette-outline',
      color: '#c084fc',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/05_Faldas/falda_01.png'
    },
    {
      id: 'falda-sport',
      name: 'Falda Deportiva Galáctica',
      category: 'ropa',
      price: 270,
      owned: false,
      equipped: false,
      icon: 'color-palette-outline',
      color: '#ec4899',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/05_Faldas/falda_02.png'
    },

    // Pelo / Peinados
    {
      id: 'corte-fade',
      name: 'Corte Fade Moderno',
      category: 'pelo',
      price: 180,
      tag: 'ESTILO',
      owned: true,
      equipped: true,
      icon: 'sparkles-outline',
      color: '#6366f1',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/02_Peinados/peinado_masculino_01.png'
    },
    {
      id: 'corte-bob',
      name: 'Corte Galáctico Bob',
      category: 'pelo',
      price: 220,
      tag: 'NUEVO',
      owned: false,
      equipped: false,
      icon: 'sparkles-outline',
      color: '#8b5cf6',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/02_Peinados/peinado_femenino_01.png'
    },
    {
      id: 'melena-rizada',
      name: 'Melena Ondulada Estelar',
      category: 'pelo',
      price: 230,
      owned: false,
      equipped: false,
      icon: 'flower-outline',
      color: '#f472b6',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/02_Peinados/peinado_femenino_02.png'
    },
    {
      id: 'peinado-spiky',
      name: 'Peinado Spiky Anime',
      category: 'pelo',
      price: 210,
      owned: false,
      equipped: false,
      icon: 'flame-outline',
      color: '#eab308',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/02_Peinados/peinado_masculino_03.png'
    },

    // Accesorios
    {
      id: 'gorra-urbana',
      name: 'Gorra Urbana Saber',
      category: 'accesorios',
      price: 250,
      tag: 'DESTACADO',
      owned: true,
      equipped: true,
      icon: 'star-outline',
      color: '#3b82f6',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/07_Accesorios/accesorio_01_gorra.png'
    },
    {
      id: 'gorro-tejido',
      name: 'Gorro Cósmico de Lana',
      category: 'accesorios',
      price: 220,
      owned: false,
      equipped: false,
      icon: 'snow-outline',
      color: '#6366f1',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/07_Accesorios/accesorio_02_gorro_tejido.png'
    },
    {
      id: 'gafas-redondas',
      name: 'Gafas Intelectuales',
      category: 'accesorios',
      price: 190,
      owned: false,
      equipped: false,
      icon: 'glasses-outline',
      color: '#10b981',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/07_Accesorios/accesorio_08_gafas_redondas.png'
    },
    {
      id: 'gafas-sol',
      name: 'Gafas de Sol Cyber',
      category: 'accesorios',
      price: 280,
      tag: 'ÉPICO',
      owned: false,
      equipped: false,
      icon: 'sunny-outline',
      color: '#f59e0b',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/07_Accesorios/accesorio_10_gafas_sol.png'
    },
    {
      id: 'mochila-galactica',
      name: 'Mochila Explorador Galáctico',
      category: 'accesorios',
      price: 380,
      tag: 'POPULAR',
      owned: false,
      equipped: false,
      icon: 'bag-outline',
      color: '#ec4899',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/07_Accesorios/accesorio_20_mochila.png'
    },

    // Zapatos
    {
      id: 'sneakers-pro',
      name: 'Sneakers Cósmicos Pro',
      category: 'zapatos',
      price: 220,
      owned: true,
      equipped: true,
      icon: 'footsteps-outline',
      color: '#10b981',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/04_Pantalones/pantalon_05.png'
    },
    {
      id: 'botas-lunares',
      name: 'Botas de Gravedad Cero',
      category: 'zapatos',
      price: 340,
      tag: 'ÉPICO',
      owned: false,
      equipped: false,
      icon: 'rocket-outline',
      color: '#8b5cf6',
      image: 'assets/saber-icons/SaberStyle_PNG_Individuales/04_Pantalones/pantalon_03.png'
    }
  ];

  // 6 Tipos de Minijuegos disponibles
  gameTypes: GameTypeOption[] = [
    { id: 'quiz', name: 'Cuestionario', desc: 'Preguntas de opción múltiple cronometradas', icon: 'checkbox-outline', badgeColor: '#8b5cf6' },
    { id: 'ruleta', name: 'Ruleta', desc: 'Gira para seleccionar un tema o pregunta aleatoria', icon: 'disc-outline', badgeColor: '#ec4899' },
    { id: 'abierta', name: 'Pregunta abierta', desc: 'Respuestas de reflexión y debate colaborativo', icon: 'chatbubbles-outline', badgeColor: '#3b82f6' },
    { id: 'verdadero-falso', name: 'Verdadero o falso', desc: 'Evaluación rápida de conceptos con retroalimentación', icon: 'thumbs-up-outline', badgeColor: '#10b981' },
    { id: 'completar', name: 'Completar frase', desc: 'Identifica la palabra clave para completar el enunciado', icon: 'create-outline', badgeColor: '#f59e0b' },
    { id: 'sopa-letras', name: 'Sopa de letras', desc: 'Encuentra las palabras clave en la cuadrícula', icon: 'grid-outline', badgeColor: '#06b6d4' }
  ];

  selectedGameType: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras' = 'quiz';
  selectedParticipationMode: 'en-vivo' | 'individual' = 'individual';

  // Biblioteca de Minijuegos
  juegosFiltroTab: 'mis-juegos' | 'compartidos' = 'mis-juegos';
  juegosSearchQuery: string = '';

  savedGames: SavedGame[] = [
    {
      id: 'g1',
      titulo: 'Quiz de funciones',
      tipo: 'quiz',
      tipoLabel: 'Cuestionario',
      modo: 'en-vivo',
      materia: 'Matemáticas',
      preguntasCount: 3,
      fecha: 'Hoy',
      instrucciones: 'Selecciona la opción correcta antes de que expire el tiempo.',
      recompensaMonedas: 100,
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
      instrucciones: 'Gira la ruleta y responde el tema seleccionado.',
      recompensaMonedas: 80,
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
      titulo: 'Verdadero o falso de ciencias',
      tipo: 'verdadero-falso',
      tipoLabel: 'Verdadero / falso',
      modo: 'individual',
      materia: 'Ciencias',
      preguntasCount: 3,
      fecha: '18 Oct',
      instrucciones: 'Indica si cada afirmación es verdadera o falsa.',
      recompensaMonedas: 90,
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
      preguntasCount: 1,
      fecha: '15 Oct',
      instrucciones: 'Escribe tu respuesta y reflexiona con tus compañeros.',
      recompensaMonedas: 70,
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
      preguntasCount: 1,
      fecha: '14 Oct',
      instrucciones: 'Selecciona la palabra que completa la oración correctamente.',
      recompensaMonedas: 75,
      preguntas: [
        { fraseAntes: 'Un triángulo que tiene sus tres lados con la misma longitud se denomina triángulo', palabraCorrecta: 'equilátero', opciones: ['equilátero', 'isósceles', 'escaleno', 'rectángulo'] }
      ]
    },
    {
      id: 'g6',
      titulo: 'Sopa de letras matemática',
      tipo: 'sopa-letras',
      tipoLabel: 'Sopa de letras',
      modo: 'individual',
      materia: 'Lengua y Matemáticas',
      preguntasCount: 5,
      fecha: '12 Oct',
      instrucciones: 'Toca las letras para encontrar las palabras escondidas.',
      recompensaMonedas: 120,
      palabras: ['DOMINIO', 'RANGO', 'FUNCION', 'LIMITE', 'RECTA'],
      preguntas: [
        { palabras: ['DOMINIO', 'RANGO', 'FUNCION', 'LIMITE', 'RECTA'] }
      ]
    }
  ];

  // ==========================================
  // Editor Completo de Minijuegos (Fase 2)
  // ==========================================
  editingGameId: string | null = null;
  editorTitulo: string = '';
  editorMateria: string = 'Matemáticas';
  editorInstrucciones: string = '';
  editorRecompensa: number = 100;
  editorModo: 'en-vivo' | 'individual' = 'individual';
  editorTipo: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras' = 'quiz';

  // Sub-editores específicos por modalidad
  editorQuizPreguntas: { pregunta: string; opciones: string[]; correcta: number }[] = [];
  nuevaPreguntaQuizTexto: string = '';
  nuevaPreguntaQuizOpciones: string[] = ['', '', '', ''];
  nuevaPreguntaQuizCorrecta: number = 0;

  editorRuletaPreguntas: string[] = [];
  nuevaPreguntaRuletaInput: string = '';

  editorSopaPalabras: string[] = [];
  nuevaPalabraSopaInput: string = '';

  editorVFPreguntas: { afirmacion: string; esVerdadero: boolean; explicacion: string }[] = [];
  nuevaVFAfirmacion: string = '';
  nuevaVFEsVerdadero: boolean = true;
  nuevaVFExplicacion: string = '';

  editorAbiertaConsigna: string = '';

  editorCompletarFrases: { fraseAntes: string; palabraCorrecta: string; opciones: string[] }[] = [];
  nuevaCompletarFrase: string = '';
  nuevaCompletarPalabra: string = '';
  nuevaCompletarOpciones: string = '';

  // ==========================================
  // Motores de Juego Activo
  // ==========================================
  juegoActivo: SavedGame | null = null;
  recompensaReclamada: boolean = false;
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
  ruletaSectores: { tema: string; pregunta: string }[] = [];

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
  sopaGrid: string[][] = [];
  sopaPalabrasObjetivo: { palabra: string; encontrada: boolean }[] = [];
  sopaLetrasSeleccionadas: { row: number; col: number; letra: string }[] = [];

  // ==========================================
  // Clases y Roster de Estudiantes con Avatares Reales
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
        { id: 's1', name: 'Juan Pérez', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_01.png', asistencia: 96, retosCompletados: 10, promedio: 88 },
        { id: 's2', name: 'Sofia Morales', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_02.png', asistencia: 92, retosCompletados: 12, promedio: 94 },
        { id: 's3', name: 'Mateo Gómez', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_03.png', asistencia: 88, retosCompletados: 8, promedio: 79 },
        { id: 's4', name: 'Valeria Torres', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_02.png', asistencia: 100, retosCompletados: 14, promedio: 97 },
        { id: 's5', name: 'Lucas Ramírez', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_01.png', asistencia: 84, retosCompletados: 9, promedio: 75 },
        { id: 's6', name: 'Camila Rojas', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_03.png', asistencia: 90, retosCompletados: 11, promedio: 85 }
      ],
      actividades: [
        { id: 'act1', titulo: 'Quiz de funciones', tipo: 'Cuestionario', estado: 'completado', duracion: '10 min', recompensa: 100 },
        { id: 'act2', titulo: 'Ruleta del conocimiento', tipo: 'Ruleta', estado: 'en-vivo', duracion: '15 min', recompensa: 80 },
        { id: 'act3', titulo: 'Pregunta abierta: Funciones en la vida real', tipo: 'Pregunta abierta', estado: 'pendiente', duracion: '20 min', recompensa: 70 }
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
        { id: 's7', name: 'Andrés López', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_01.png', asistencia: 91, retosCompletados: 9, promedio: 82 },
        { id: 's8', name: 'Daniela Castro', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_02.png', asistencia: 95, retosCompletados: 11, promedio: 90 }
      ],
      actividades: [
        { id: 'act4', titulo: 'Sopa de letras matemática', tipo: 'Sopa de letras', estado: 'completado', duracion: '15 min', recompensa: 120 },
        { id: 'act5', titulo: 'Completar frase de geometría', tipo: 'Completar frase', estado: 'pendiente', duracion: '10 min', recompensa: 75 }
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
        { id: 's9', name: 'Martín Vega', avatar: 'Estudiante', avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_03.png', asistencia: 89, retosCompletados: 7, promedio: 78 }
      ],
      actividades: [
        { id: 'act6', titulo: 'Verdadero o falso de ciencias', tipo: 'Verdadero / falso', estado: 'completado', duracion: '8 min', recompensa: 90 }
      ]
    }
  ];

  // ==========================================
  // Estadísticas Dinámicas del Estudiante (Fase 2)
  // Estado inicial en 0, actualización automática, 4 categorías
  // ==========================================
  progresoTab: 'general' | 'juegos' | 'clases' | 'funcion' = 'general';

  statsEstudiante = {
    clasesUnidas: 0,
    actividadesRealizadas: 0,
    juegosCompletados: 0,
    juegosFallados: 0,
    totalPartidas: 0,
    porcentajePromedio: 0,
    monedasGanadas: 0,
    iaConsultas: 0,
    armarioCambios: 0,
    tiendaVisitas: 0,
    accesibilidadUsos: 0
  };

  evolucionPuntos: { mes: string; porcentaje: number; cx: number; cy: number }[] = [];

  // ==========================================
  // Logros y Misiones Diarias
  // ==========================================
  logrosTab: 'logros' | 'misiones' = 'logros';

  logros: LogroDesafio[] = [
    { id: 1, title: 'Creador de partidas', desc: 'Nivel 1: Diseña tu primera actividad educativa.', medal: 'bronze', completed: true, recompensa: 50, claimed: true },
    { id: 2, title: 'Explorador', desc: 'Completa 5 juegos en cualquier modalidad.', medal: 'silver', completed: false, recompensa: 100, claimed: false },
    { id: 3, title: 'Maestro del quiz', desc: 'Completa 20 juegos con más del 80% de aciertos.', medal: 'gold', completed: false, recompensa: 250, claimed: false },
    { id: 4, title: 'Racha de fuego', desc: 'Ingresa y supera un reto diario 3 días seguidos.', medal: 'silver', completed: false, recompensa: 120, claimed: false },
    { id: 5, title: 'Coleccionista de estilo', desc: 'Adquiere 4 prendas o accesorios para tu avatar.', medal: 'gold', completed: false, recompensa: 200, claimed: false }
  ];

  misionesDiarias: MisionDiaria[] = [
    { id: 1, nivel: 'bronce', title: 'Misión Bronce', desc: 'Completa 1 juego en vivo o individual.', recompensa: 50, progreso: 0, meta: 1, completed: false, claimed: false },
    { id: 2, nivel: 'plata', title: 'Misión Plata', desc: 'Completa 3 juegos y gana al menos 80 puntos.', recompensa: 100, progreso: 0, meta: 3, completed: false, claimed: false },
    { id: 3, nivel: 'oro', title: 'Misión Oro', desc: 'Obtén puntaje perfecto (100%) en cualquier dinámica.', recompensa: 200, progreso: 0, meta: 1, completed: false, claimed: false },
    { id: 4, nivel: 'diamante', title: 'Misión Diamante Rara', desc: 'Supera 5 retos consecutivos sin equivocarte.', recompensa: 500, progreso: 0, meta: 5, completed: false, claimed: false }
  ];

  // ==========================================
  // Idioma, Tema, Accesibilidad y Perfil
  // ==========================================
  configIdioma: SupportedLanguage = 'Español';
  configTema: 'claro' | 'oscuro' = 'oscuro';
  
  // Perfil editable con email y contraseña (Fase 2)
  perfilEditando: boolean = false;
  perfilNombreInput: string = '';
  perfilBioInput: string = 'Apasionado por las matemáticas y la física galáctica.';
  perfilEmailInput: string = '';
  perfilPasswordInput: string = '';
  mostrarPasswordPerfil: boolean = false;

  // Privacidad
  privacidadPerfil: 'publico' | 'privado' = 'publico';
  privacidadJuegos: 'publico' | 'amigos' | 'privado' = 'amigos';

  // Ayudas funcionales de inclusión
  accesibilidad = {
    lectorPantallaVoz: false,
    tamanoLetra: 'normal' as 'normal' | 'grande' | 'muy-grande',
    altoContraste: false,
    modoEnfoque: false
  };

  private screenReaderClickListener: ((e: MouseEvent) => void) | null = null;

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
    public i18n: I18nService,
    private alertController: AlertController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.configIdioma = this.i18n.currentLanguage;
    this.cargarPreferenciasGuardadas();

    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        if (user.coins !== undefined) {
          this.userCoins = user.coins;
        }
        if (user.avatarConfig) {
          this.avatarConfig = { ...this.avatarConfig, ...user.avatarConfig };
        }
        this.perfilNombreInput = user.name || '';
        this.perfilEmailInput = user.email || '';
        this.cargarEstadisticasEstudiante();
      }
    });

    this.cargarJuegosGuardados();
    this.actualizarLectorActivo();
  }

  ngOnDestroy() {
    if (this.screenReaderClickListener) {
      document.removeEventListener('click', this.screenReaderClickListener, true);
    }
    clearInterval(this.quizTimerInterval);
  }

  // Traducción rápida reactiva
  t(key: string): string {
    return this.i18n.t(key);
  }

  private cargarPreferenciasGuardadas() {
    try {
      const temaGuardado = localStorage.getItem('saberstyle_theme') as 'claro' | 'oscuro' | null;
      if (temaGuardado) {
        this.setTema(temaGuardado, false);
      } else {
        this.setTema('oscuro', false);
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
  // Navegación Principal y Roles (Fase 2)
  // ==========================================
  selectBottomNav(nav: 'inicio' | 'clases' | 'crear' | 'tienda' | 'stats') {
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
          this.abrirCrearJuego();
        } else {
          this.activeTab = 'mis-juegos';
        }
        break;
      case 'tienda':
        this.activeTab = 'tienda';
        this.statsEstudiante.tiendaVisitas++;
        this.guardarEstadisticasEstudiante();
        break;
      case 'stats':
        this.abrirProgreso();
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
    } else if (tab === 'tienda' || tab === 'tienda-monedas') {
      this.currentBottomNav = 'tienda';
    } else if (tab === 'progreso') {
      this.currentBottomNav = 'stats';
    }
  }

  volverAInicio() {
    this.selectBottomNav('inicio');
  }

  abrirVestuario() {
    this.activeTab = 'closet';
    this.currentBottomNav = 'tienda';
  }

  abrirTienda() {
    this.activeTab = 'tienda';
    this.currentBottomNav = 'tienda';
    this.statsEstudiante.tiendaVisitas++;
    this.guardarEstadisticasEstudiante();
  }

  abrirTiendaMonedas() {
    this.activeTab = 'tienda-monedas';
    this.currentBottomNav = 'tienda';
  }

  abrirCrearJuego() {
    if (this.currentUser?.role !== 'teacher') {
      this.mostrarToast(this.configIdioma === 'English' ? 'Feature exclusive for teachers. Explore available games to play.' : 'Función exclusiva para profesores. Explora los juegos disponibles para jugar.');
      this.activeTab = 'mis-juegos';
      return;
    }
    this.prepararEditorJuego('quiz');
    this.activeTab = 'crear-juego';
    this.currentBottomNav = 'crear';
  }

  abrirProgreso() {
    this.activeTab = 'progreso';
    this.currentBottomNav = 'stats';
    this.cargarEstadisticasEstudiante();
  }

  abrirLogros() {
    this.activeTab = 'logros';
  }

  abrirPerfil() {
    this.activeTab = 'perfil';
    this.perfilEditando = false;
  }

  abrirConfiguracion() {
    // Menú tres puntos: va directo a configuración/perfil sin menús intermedios
    this.activeTab = 'perfil';
    this.perfilEditando = false;
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
        header: this.configIdioma === 'English' ? 'Insufficient Coins' : 'Monedas Insuficientes',
        message: this.configIdioma === 'English' 
          ? `You need ${item.price} coins to buy "${item.name}". Current balance: 🪙 ${this.userCoins}. Win challenges to get more!`
          : `Necesitas ${item.price} monedas para adquirir "${item.name}". Tu saldo actual es de 🪙 ${this.userCoins}. ¡Supera retos y misiones para conseguir más!`,
        buttons: [this.configIdioma === 'English' ? 'Understood' : 'Entendido']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Confirm Purchase' : 'Confirmar Compra',
      message: this.configIdioma === 'English' 
        ? `Do you want to buy "${item.name}" for 🪙 ${item.price} coins?`
        : `¿Deseas comprar "${item.name}" por 🪙 ${item.price} monedas?`,
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Buy' : 'Comprar',
          handler: () => {
            this.userCoins -= item.price;
            item.owned = true;
            this.equiparPrenda(item);
            this.sincronizarUsuario();
            this.mostrarToast(this.configIdioma === 'English' 
              ? `Awesome! You bought and equipped "${item.name}". Added to your wardrobe.`
              : `¡Genial! Has comprado y equipado "${item.name}". Ya está en tu armario.`);
          }
        }
      ]
    });
    await alert.present();
  }

  equiparPrenda(item: StoreItem) {
    this.storeItems
      .filter(i => i.category === item.category && i.id !== item.id)
      .forEach(i => (i.equipped = false));

    item.equipped = true;

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

    this.statsEstudiante.armarioCambios++;
    this.guardarEstadisticasEstudiante();
    this.sincronizarUsuario();
    this.mostrarToast(`"${item.name}" equipada en tu avatar.`);
  }

  // Tienda de Monedas (Opciones honestas)
  async consultarPaqueteMonedas(nombre: string, monedas: number) {
    const alert = await this.alertController.create({
      header: `🪙 ${nombre} (${monedas} Monedas)`,
      subHeader: this.configIdioma === 'English' ? 'Payment Integration Status' : 'Estado de la Pasarela de Pagos',
      message: this.configIdioma === 'English'
        ? `SaberStyle is in Phase 2. Real payment transactions are intentionally disabled. You can earn all your coins 100% free by completing quizzes, roulette games, and daily missions!`
        : `SaberStyle se encuentra en Fase 2. Las pasarelas de cobro no están activas por seguridad y transparencia. ¡Puedes conseguir todas tus monedas gratis jugando y completando misiones educativas!`,
      buttons: [
        {
          text: this.configIdioma === 'English' ? 'Go to Games' : 'Ir a Jugar',
          handler: () => { this.activeTab = 'mis-juegos'; }
        },
        {
          text: this.configIdioma === 'English' ? 'Close' : 'Cerrar',
          role: 'cancel'
        }
      ]
    });
    await alert.present();
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
    this.mostrarToast(this.configIdioma === 'English' ? 'Style saved and synchronized!' : '¡Estilo guardado y sincronizado con tu perfil e inicio!');
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
  // Creación y Edición Real de Minijuegos (Fase 2)
  // ==========================================
  selectGameType(id: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras') {
    this.selectedGameType = id;
    this.editorTipo = id;
  }

  setParticipationMode(mode: 'en-vivo' | 'individual') {
    this.selectedParticipationMode = mode;
    this.editorModo = mode;
  }

  prepararEditorJuego(tipo: 'quiz' | 'ruleta' | 'abierta' | 'verdadero-falso' | 'completar' | 'sopa-letras') {
    this.editingGameId = null;
    this.selectedGameType = tipo;
    this.editorTipo = tipo;
    this.editorTitulo = '';
    this.editorMateria = 'Matemáticas';
    this.editorInstrucciones = 'Completa la actividad respondiendo con atención.';
    this.editorRecompensa = 100;
    this.editorModo = 'individual';

    // Inicializar sub-editores con plantilla limpia y editable
    this.editorQuizPreguntas = [
      {
        pregunta: '¿Cuál es el concepto principal de este tema?',
        opciones: ['Opción A', 'Opción B', 'Opción C', 'Opción D'],
        correcta: 0
      }
    ];

    this.editorRuletaPreguntas = ['Tema 1', 'Tema 2', 'Tema 3', 'Tema 4'];
    this.editorSopaPalabras = ['SABER', 'STYLE', 'APRENDE', 'JUEGA'];
    this.editorVFPreguntas = [
      { afirmacion: 'Esta afirmación es verdadera y describe el concepto clave.', esVerdadero: true, explicacion: 'Explicación del concepto.' }
    ];
    this.editorAbiertaConsigna = 'Escribe tu opinión y análisis reflexivo sobre la temática:';
    this.editorCompletarFrases = [
      { fraseAntes: 'En matemáticas, una función asigna a cada elemento un', palabraCorrecta: 'único', opciones: ['único', 'múltiple', 'infinito', 'cero'] }
    ];
  }

  cargarJuegoEnEditor(juego: SavedGame) {
    this.editingGameId = juego.id;
    this.selectedGameType = juego.tipo;
    this.editorTipo = juego.tipo;
    this.editorTitulo = juego.titulo;
    this.editorMateria = juego.materia || 'General';
    this.editorInstrucciones = juego.instrucciones || 'Completa la actividad con atención.';
    this.editorRecompensa = juego.recompensaMonedas || 100;
    this.editorModo = juego.modo;

    if (juego.tipo === 'quiz') {
      this.editorQuizPreguntas = (juego.preguntas && juego.preguntas.length > 0) 
        ? JSON.parse(JSON.stringify(juego.preguntas))
        : [{ pregunta: 'Pregunta 1', opciones: ['A', 'B', 'C', 'D'], correcta: 0 }];
    } else if (juego.tipo === 'ruleta') {
      this.editorRuletaPreguntas = (juego.preguntas && juego.preguntas.length > 0)
        ? juego.preguntas.map(p => p.pregunta || p.tema || p)
        : ['Tema 1', 'Tema 2', 'Tema 3', 'Tema 4'];
    } else if (juego.tipo === 'sopa-letras') {
      this.editorSopaPalabras = (juego.palabras && juego.palabras.length > 0)
        ? [...juego.palabras]
        : (juego.preguntas?.[0]?.palabras || ['SABER', 'STYLE', 'RETO']);
    } else if (juego.tipo === 'verdadero-falso') {
      this.editorVFPreguntas = (juego.preguntas && juego.preguntas.length > 0)
        ? JSON.parse(JSON.stringify(juego.preguntas))
        : [{ afirmacion: 'Afirmación de prueba', esVerdadero: true, explicacion: 'Detalle' }];
    } else if (juego.tipo === 'abierta') {
      this.editorAbiertaConsigna = juego.preguntas?.[0]?.consigna || 'Consigna de reflexión:';
    } else if (juego.tipo === 'completar') {
      this.editorCompletarFrases = (juego.preguntas && juego.preguntas.length > 0)
        ? JSON.parse(JSON.stringify(juego.preguntas))
        : [{ fraseAntes: 'Frase con espacio para completar:', palabraCorrecta: 'clave', opciones: ['clave', 'incorrecta'] }];
    }
  }

  // Métodos de edición por modalidad
  agregarPreguntaQuizEditor() {
    const texto = this.nuevaPreguntaQuizTexto.trim();
    if (!texto) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Please enter the question text.' : 'Por favor ingresa el texto de la pregunta.');
      return;
    }
    const ops = this.nuevaPreguntaQuizOpciones.map((o, idx) => o.trim() || `Opción ${idx + 1}`);
    this.editorQuizPreguntas.push({
      pregunta: texto,
      opciones: ops,
      correcta: this.nuevaPreguntaQuizCorrecta
    });
    this.nuevaPreguntaQuizTexto = '';
    this.nuevaPreguntaQuizOpciones = ['', '', '', ''];
    this.nuevaPreguntaQuizCorrecta = 0;
    this.mostrarToast(this.configIdioma === 'English' ? 'Question added to quiz.' : 'Pregunta agregada al cuestionario.');
  }

  eliminarPreguntaQuizEditor(index: number) {
    if (this.editorQuizPreguntas.length <= 1) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Quiz must have at least 1 question.' : 'El cuestionario debe tener al menos 1 pregunta.');
      return;
    }
    this.editorQuizPreguntas.splice(index, 1);
  }

  agregarPreguntaRuletaEditor() {
    const texto = this.nuevaPreguntaRuletaInput.trim();
    if (!texto) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Please enter the roulette topic.' : 'Por favor escribe el tema o pregunta de la ruleta.');
      return;
    }
    this.editorRuletaPreguntas.push(texto);
    this.nuevaPreguntaRuletaInput = '';
  }

  eliminarPreguntaRuletaEditor(index: number) {
    if (this.editorRuletaPreguntas.length <= 2) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Roulette must have at least 2 topics.' : 'La ruleta debe tener al menos 2 temas.');
      return;
    }
    this.editorRuletaPreguntas.splice(index, 1);
  }

  agregarPalabraSopaEditor() {
    const palabra = this.nuevaPalabraSopaInput.trim().toUpperCase().replace(/[^A-Z]/g, '');
    if (!palabra || palabra.length < 3) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Word must have at least 3 letters.' : 'La palabra debe tener al menos 3 letras.');
      return;
    }
    if (this.editorSopaPalabras.includes(palabra)) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Word already exists.' : 'Esta palabra ya está en la lista.');
      return;
    }
    this.editorSopaPalabras.push(palabra);
    this.nuevaPalabraSopaInput = '';
  }

  eliminarPalabraSopaEditor(index: number) {
    if (this.editorSopaPalabras.length <= 2) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Word search must have at least 2 words.' : 'La sopa de letras debe tener al menos 2 palabras.');
      return;
    }
    this.editorSopaPalabras.splice(index, 1);
  }

  agregarVFEditor() {
    const afirmacion = this.nuevaVFAfirmacion.trim();
    if (!afirmacion) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Please write the statement.' : 'Escribe la afirmación.');
      return;
    }
    this.editorVFPreguntas.push({
      afirmacion,
      esVerdadero: this.nuevaVFEsVerdadero,
      explicacion: this.nuevaVFExplicacion.trim() || (this.nuevaVFEsVerdadero ? 'Correcto.' : 'Falso.')
    });
    this.nuevaVFAfirmacion = '';
    this.nuevaVFExplicacion = '';
  }

  eliminarVFEditor(index: number) {
    if (this.editorVFPreguntas.length <= 1) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Must have at least 1 statement.' : 'Debe tener al menos 1 afirmación.');
      return;
    }
    this.editorVFPreguntas.splice(index, 1);
  }

  guardarJuegoDesdeEditor() {
    const titulo = this.editorTitulo.trim();
    if (!titulo) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Please enter a title for the activity.' : 'Por favor introduce un título para la actividad.');
      return;
    }

    const tipoObj = this.gameTypes.find(g => g.id === this.editorTipo);
    let preguntasFinales: any[] = [];
    let count = 0;
    let palabrasFinales: string[] | undefined = undefined;

    if (this.editorTipo === 'quiz') {
      preguntasFinales = [...this.editorQuizPreguntas];
      count = preguntasFinales.length;
    } else if (this.editorTipo === 'ruleta') {
      preguntasFinales = this.editorRuletaPreguntas.map(p => ({ tema: p.substring(0, 14), pregunta: p }));
      count = preguntasFinales.length;
    } else if (this.editorTipo === 'sopa-letras') {
      palabrasFinales = [...this.editorSopaPalabras];
      preguntasFinales = [{ palabras: palabrasFinales }];
      count = palabrasFinales.length;
    } else if (this.editorTipo === 'verdadero-falso') {
      preguntasFinales = [...this.editorVFPreguntas];
      count = preguntasFinales.length;
    } else if (this.editorTipo === 'abierta') {
      preguntasFinales = [{ consigna: this.editorAbiertaConsigna.trim() || 'Debate de reflexión:' }];
      count = 1;
    } else if (this.editorTipo === 'completar') {
      preguntasFinales = [...this.editorCompletarFrases];
      count = preguntasFinales.length;
    }

    const juegoGuardar: SavedGame = {
      id: this.editingGameId || ('g_' + Date.now()),
      titulo,
      tipo: this.editorTipo,
      tipoLabel: tipoObj?.name || 'Actividad',
      modo: this.editorModo,
      materia: this.editorMateria.trim() || 'General',
      preguntasCount: count,
      preguntas: preguntasFinales,
      fecha: 'Hoy',
      instrucciones: this.editorInstrucciones.trim(),
      recompensaMonedas: Number(this.editorRecompensa) || 100,
      palabras: palabrasFinales
    };

    if (this.editingGameId) {
      const idx = this.savedGames.findIndex(g => g.id === this.editingGameId);
      if (idx !== -1) {
        this.savedGames[idx] = juegoGuardar;
      } else {
        this.savedGames.unshift(juegoGuardar);
      }
      this.mostrarToast(this.configIdioma === 'English' ? `"${titulo}" updated successfully.` : `¡"${titulo}" actualizado con éxito!`);
    } else {
      this.savedGames.unshift(juegoGuardar);
      this.mostrarToast(this.configIdioma === 'English' ? `"${titulo}" created successfully.` : `¡"${titulo}" creado con éxito!`);
    }

    this.guardarJuegosEnStorage();
    this.activeTab = 'mis-juegos';
  }

  private guardarJuegosEnStorage() {
    try {
      localStorage.setItem('saberstyle_saved_games', JSON.stringify(this.savedGames));
    } catch {}
  }

  private cargarJuegosGuardados() {
    try {
      const saved = localStorage.getItem('saberstyle_saved_games');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.savedGames = parsed;
        }
      }
    } catch {}
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
    this.recompensaReclamada = false;

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

  editarActividad(juego: SavedGame) {
    if (this.currentUser?.role !== 'teacher') {
      this.mostrarToast(this.configIdioma === 'English' ? 'Only teachers can edit activities.' : 'Solo los profesores pueden editar actividades.');
      return;
    }
    this.cargarJuegoEnEditor(juego);
    this.activeTab = 'crear-juego';
  }

  async renombrarActividad(juego: SavedGame) {
    if (this.currentUser?.role !== 'teacher') {
      this.mostrarToast(this.configIdioma === 'English' ? 'Only teachers can rename activities.' : 'Solo los profesores pueden renombrar actividades.');
      return;
    }
    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Rename Activity' : 'Renombrar Actividad',
      inputs: [{ name: 'titulo', type: 'text', value: juego.titulo, placeholder: 'Nuevo nombre' }],
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Save' : 'Guardar',
          handler: (data) => {
            if (data.titulo?.trim()) {
              juego.titulo = data.titulo.trim();
              this.guardarJuegosEnStorage();
              this.mostrarToast(this.configIdioma === 'English' ? 'Name updated.' : 'Nombre actualizado.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarActividad(juego: SavedGame) {
    if (this.currentUser?.role !== 'teacher') {
      this.mostrarToast(this.configIdioma === 'English' ? 'Only teachers can delete activities.' : 'Solo los profesores pueden eliminar actividades.');
      return;
    }
    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Delete Activity' : 'Eliminar Actividad',
      message: this.configIdioma === 'English' 
        ? `Are you sure you want to delete "${juego.titulo}"?`
        : `¿Estás seguro de que deseas eliminar "${juego.titulo}"?`,
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Delete' : 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.savedGames = this.savedGames.filter(g => g.id !== juego.id);
            this.guardarJuegosEnStorage();
            this.mostrarToast(this.configIdioma === 'English' ? 'Activity deleted.' : 'Actividad eliminada.');
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
    this.quizRespondida = false;
    this.quizOpcionElegida = null;
    this.activeTab = 'juego-quiz';
    this.iniciarQuizTimer();
  }

  iniciarQuizTimer() {
    clearInterval(this.quizTimerInterval);
    this.quizTimerSegundos = 20;
    this.quizTimerInterval = setInterval(() => {
      if (this.quizTimerSegundos > 0) {
        this.quizTimerSegundos--;
      } else {
        clearInterval(this.quizTimerInterval);
        this.responderQuiz(-1);
      }
    }, 1000);
  }

  responderQuiz(opcionIdx: number) {
    if (this.quizRespondida) return;
    this.quizRespondida = true;
    this.quizOpcionElegida = opcionIdx;
    clearInterval(this.quizTimerInterval);

    const questions = this.juegoActivo?.preguntas || this.savedGames[0].preguntas;
    const actual = questions[this.quizIndexPregunta];

    if (opcionIdx === actual?.correcta) {
      this.quizScoreCorrectas++;
    }

    setTimeout(() => {
      if (this.quizIndexPregunta + 1 < questions.length) {
        this.quizIndexPregunta++;
        this.quizRespondida = false;
        this.quizOpcionElegida = null;
        this.iniciarQuizTimer();
      } else {
        const reward = this.juegoActivo?.recompensaMonedas || 100;
        this.finalizarJuegoExitoso(reward);
      }
    }, 1200);
  }

  iniciarRuletaFlow() {
    this.ruletaGirando = false;
    this.ruletaSectorSeleccionado = null;
    this.ruletaAngulo = 0;

    const items = this.juegoActivo?.preguntas;
    if (items && items.length > 0) {
      this.ruletaSectores = items.map(p => ({
        tema: p.tema || (typeof p === 'string' ? p : 'Tema'),
        pregunta: p.pregunta || (typeof p === 'string' ? p : 'Pregunta del reto')
      }));
    } else {
      this.ruletaSectores = [
        { tema: 'Dominio', pregunta: '¿Qué valores de x hacen indefinida a la función?' },
        { tema: 'Rango', pregunta: '¿Cuál es el conjunto de valores de salida de la función?' },
        { tema: 'Asíntota', pregunta: '¿Qué es una recta a la que la gráfica se aproxima indefinidamente?' },
        { tema: 'Pendiente', pregunta: '¿Qué representa m en la ecuación y = mx + b?' }
      ];
    }

    this.activeTab = 'juego-ruleta';
  }

  girarRuletaFisica() {
    if (this.ruletaGirando) return;
    this.ruletaGirando = true;
    this.ruletaSectorSeleccionado = null;

    const numSectores = this.ruletaSectores.length;
    const selectedIdx = Math.floor(Math.random() * numSectores);
    const sectorAngle = 360 / numSectores;
    const vueltasCompletas = 360 * 5;
    const targetAngle = vueltasCompletas + (selectedIdx * sectorAngle) + (sectorAngle / 2);

    this.ruletaAngulo += targetAngle;

    setTimeout(() => {
      this.ruletaGirando = false;
      this.ruletaSectorSeleccionado = this.ruletaSectores[selectedIdx];
      this.mostrarToast(`¡Tema seleccionado: "${this.ruletaSectorSeleccionado.tema}"!`);
    }, 3200);
  }

  completarRetoRuleta() {
    const reward = this.juegoActivo?.recompensaMonedas || 80;
    this.finalizarJuegoExitoso(reward);
  }

  iniciarAbiertaFlow() {
    this.abiertaRespuestaUsuario = '';
    this.activeTab = 'juego-abierta';
  }

  enviarRespuestaAbierta() {
    const txt = this.abiertaRespuestaUsuario.trim();
    if (!txt) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Please write your response.' : 'Por favor escribe tu respuesta.');
      return;
    }
    const autor = this.currentUser?.name || 'Tú';
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    this.abiertaFeedRespuestas.push({
      autor,
      rol: this.currentUser?.role || 'student',
      texto: txt,
      timestamp: timeStr
    });
    this.abiertaRespuestaUsuario = '';
    this.mostrarToast(this.configIdioma === 'English' ? 'Answer shared with class.' : '¡Respuesta compartida en el muro de clase!');
    
    setTimeout(() => {
      const reward = this.juegoActivo?.recompensaMonedas || 70;
      this.finalizarJuegoExitoso(reward);
    }, 1500);
  }

  iniciarVFFlow() {
    this.vfIndexPregunta = 0;
    this.vfSeleccion = null;
    this.vfFeedbackMostrar = false;
    this.activeTab = 'juego-vf';
  }

  responderVF(eleccion: boolean) {
    this.vfSeleccion = eleccion;
    this.vfFeedbackMostrar = true;

    setTimeout(() => {
      this.vfFeedbackMostrar = false;
      this.vfSeleccion = null;
      const questions = this.juegoActivo?.preguntas || this.savedGames[2].preguntas;
      if (this.vfIndexPregunta + 1 < questions.length) {
        this.vfIndexPregunta++;
      } else {
        const reward = this.juegoActivo?.recompensaMonedas || 90;
        this.finalizarJuegoExitoso(reward);
      }
    }, 1400);
  }

  iniciarCompletarFlow() {
    this.completarPalabraElegida = null;
    this.completarCorrecta = null;
    this.activeTab = 'juego-completar';
  }

  seleccionarPalabraCompletar(palabra: string) {
    this.completarPalabraElegida = palabra;
    const target = this.juegoActivo?.preguntas?.[0]?.palabraCorrecta || 'equilátero';
    this.completarCorrecta = (palabra.toLowerCase() === target.toLowerCase());

    setTimeout(() => {
      const reward = this.juegoActivo?.recompensaMonedas || 75;
      this.finalizarJuegoExitoso(reward);
    }, 1200);
  }

  iniciarSopaFlow() {
    this.sopaLetrasSeleccionadas = [];
    const palabrasRaw = this.juegoActivo?.palabras || this.juegoActivo?.preguntas?.[0]?.palabras || ['DOMINIO', 'RANGO', 'FUNCION', 'RECTA'];
    this.sopaPalabrasObjetivo = palabrasRaw.map((p: string) => ({ palabra: p.toUpperCase(), encontrada: false }));

    this.construirGridSopa(palabrasRaw);
    this.activeTab = 'juego-sopa';
  }

  private construirGridSopa(palabras: string[]) {
    const size = 8;
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    const alphabet = 'ABCDEFGHIJKLMNPRSTUVXYZ';

    // Insertar palabras horizontalmente en filas consecutivas
    palabras.slice(0, size).forEach((pal, rIdx) => {
      const p = pal.toUpperCase();
      const startCol = Math.max(0, Math.floor((size - p.length) / 2));
      for (let i = 0; i < p.length && (startCol + i) < size; i++) {
        grid[rIdx][startCol + i] = p[i];
      }
    });

    // Rellenar celdas vacías con letras aleatorias
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!grid[r][c]) {
          grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
    this.sopaGrid = grid;
  }

  tocarLetraSopa(row: number, col: number, letra: string) {
    const ya = this.sopaLetrasSeleccionadas.find(l => l.row === row && l.col === col);
    if (ya) {
      this.sopaLetrasSeleccionadas = this.sopaLetrasSeleccionadas.filter(l => !(l.row === row && l.col === col));
    } else {
      this.sopaLetrasSeleccionadas.push({ row, col, letra });
    }

    const palabra = this.sopaLetrasSeleccionadas.map(l => l.letra).join('');
    const palabraInvertida = this.sopaLetrasSeleccionadas.map(l => l.letra).reverse().join('');

    const target = this.sopaPalabrasObjetivo.find(
      p => !p.encontrada && (p.palabra === palabra || p.palabra === palabraInvertida)
    );

    if (target) {
      target.encontrada = true;
      this.sopaLetrasSeleccionadas = [];
      this.mostrarToast(`¡Palabra "${target.palabra}" encontrada! ✓`);

      if (this.sopaPalabrasObjetivo.every(p => p.encontrada)) {
        const reward = this.juegoActivo?.recompensaMonedas || 120;
        setTimeout(() => this.finalizarJuegoExitoso(reward), 800);
      }
    }
  }

  isCellSelected(row: number, col: number): boolean {
    return this.sopaLetrasSeleccionadas.some(l => l.row === row && l.col === col);
  }

  finalizarJuegoExitoso(monedasGanadas: number) {
    if (this.recompensaReclamada) return;
    this.recompensaReclamada = true;
    clearInterval(this.quizTimerInterval);

    this.userCoins += monedasGanadas;
    this.statsEstudiante.juegosCompletados++;
    this.statsEstudiante.totalPartidas++;
    this.statsEstudiante.monedasGanadas += monedasGanadas;
    this.statsEstudiante.porcentajePromedio = Math.round(
      (this.statsEstudiante.juegosCompletados / this.statsEstudiante.totalPartidas) * 100
    );

    this.guardarEstadisticasEstudiante();
    this.sincronizarUsuario();

    // Actualizar misiones diarias
    const m1 = this.misionesDiarias[0];
    if (m1) {
      m1.progreso = Math.min(m1.meta, m1.progreso + 1);
      if (m1.progreso >= m1.meta) m1.completed = true;
    }

    this.activeTab = 'juego-victoria';
  }

  reclamarVictoria() {
    this.mostrarToast(this.configIdioma === 'English' ? 'Reward saved to your account!' : '¡Recompensa guardada en tu cuenta!');
    this.volverAInicio();
  }

  // ==========================================
  // Estadísticas Reales (Cero inicial, 4 categorías, persistencia)
  // ==========================================
  cargarEstadisticasEstudiante() {
    const userId = this.currentUser?.id || 'guest_user';
    const key = 'saberstyle_stats_' + userId;
    try {
      const data = localStorage.getItem(key);
      if (data) {
        this.statsEstudiante = { ...this.statsEstudiante, ...JSON.parse(data) };
      } else {
        this.statsEstudiante = {
          clasesUnidas: 0,
          actividadesRealizadas: 0,
          juegosCompletados: 0,
          juegosFallados: 0,
          totalPartidas: 0,
          porcentajePromedio: 0,
          monedasGanadas: 0,
          iaConsultas: 0,
          armarioCambios: 0,
          tiendaVisitas: 0,
          accesibilidadUsos: 0
        };
      }
    } catch {
      // fallback
    }
    this.actualizarEvolucionGrafico();
  }

  guardarEstadisticasEstudiante() {
    const userId = this.currentUser?.id || 'guest_user';
    const key = 'saberstyle_stats_' + userId;
    try {
      localStorage.setItem(key, JSON.stringify(this.statsEstudiante));
    } catch {}
    this.actualizarEvolucionGrafico();
  }

  actualizarEvolucionGrafico() {
    if (this.statsEstudiante.totalPartidas === 0) {
      this.evolucionPuntos = [];
      return;
    }

    const prom = this.statsEstudiante.porcentajePromedio;
    this.evolucionPuntos = [
      { mes: 'Inicio', porcentaje: Math.max(10, prom - 25), cx: 30, cy: Math.max(30, 110 - (prom - 25)) },
      { mes: 'Semana 1', porcentaje: Math.max(20, prom - 15), cx: 100, cy: Math.max(30, 110 - (prom - 15)) },
      { mes: 'Semana 2', porcentaje: Math.max(30, prom - 5), cx: 170, cy: Math.max(30, 110 - (prom - 5)) },
      { mes: 'Actual', porcentaje: prom, cx: 240, cy: Math.max(20, 110 - prom) }
    ];
  }

  // ==========================================
  // Clases y Roster de Estudiantes
  // ==========================================
  get clasesFiltradas(): ClaseItem[] {
    if (!this.claseSearchQuery.trim()) return this.clases;
    const q = this.claseSearchQuery.toLowerCase();
    return this.clases.filter(c => c.name.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q) || c.materia.toLowerCase().includes(q));
  }

  verDetalleClase(clase: ClaseItem) {
    this.claseSeleccionada = clase;
    this.claseDetalleTab = 'info';
    this.activeTab = 'clase-detalle';
  }

  copiarCodigoClase(codigo: string) {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(codigo);
    }
    this.mostrarToast(this.configIdioma === 'English' ? `Class code ${codigo} copied!` : `¡Código de clase ${codigo} copiado al portapapeles!`);
  }

  async compartirCodigoClase(clase: ClaseItem) {
    if (navigator?.share) {
      try {
        await navigator.share({
          title: clase.name,
          text: `Únete a mi clase en SaberStyle con el código: ${clase.codigo}`,
          url: window.location.href
        });
      } catch {}
    } else {
      this.copiarCodigoClase(clase.codigo);
    }
  }

  async invitarEstudiante() {
    if (this.currentUser?.role !== 'teacher') {
      this.mostrarToast(this.configIdioma === 'English' ? 'Only teachers can invite students.' : 'Solo los profesores pueden invitar alumnos.');
      return;
    }
    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Invite Students' : 'Invitar Estudiantes',
      subHeader: this.claseSeleccionada?.name,
      message: this.configIdioma === 'English'
        ? `Share code ${this.claseSeleccionada?.codigo} with your students so they can join.`
        : `Comparte el código ${this.claseSeleccionada?.codigo} con tus alumnos para que se unan directamente desde su app.`,
      buttons: [
        {
          text: this.configIdioma === 'English' ? 'Copy Code' : 'Copiar Código',
          handler: () => {
            if (this.claseSeleccionada) {
              this.copiarCodigoClase(this.claseSeleccionada.codigo);
            }
          }
        },
        { text: this.configIdioma === 'English' ? 'Done' : 'Listo', role: 'cancel' }
      ]
    });
    await alert.present();
  }

  async crearNuevaClaseModal() {
    if (this.currentUser?.role !== 'teacher') return;

    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Create New Class' : 'Crear Nueva Clase',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre (ej: Física 11°B)' },
        { name: 'materia', type: 'text', placeholder: 'Materia (ej: Ciencias)' },
        { name: 'grado', type: 'text', placeholder: 'Grado (ej: 11°B)' }
      ],
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Create' : 'Crear',
          handler: (data) => {
            if (data.nombre?.trim()) {
              const code = Math.random().toString(36).substring(2, 8).toUpperCase();
              const nuevaClase: ClaseItem = {
                id: Date.now(),
                name: data.nombre.trim(),
                grado: data.grado?.trim() || '10°A',
                codigo: code,
                docente: this.currentUser?.name || 'Profesor',
                materia: data.materia?.trim() || 'General',
                descripcion: 'Clase interactiva en SaberStyle.',
                horario: 'Por definir',
                studentsCount: 1,
                icon: 'school-outline',
                color: '#8b5cf6',
                estudiantesList: [
                  {
                    id: 's_creator',
                    name: this.currentUser?.name || 'Profesor',
                    avatar: 'Docente',
                    avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_01.png',
                    asistencia: 100,
                    retosCompletados: 0,
                    promedio: 100
                  }
                ],
                actividades: []
              };
              this.clases.unshift(nuevaClase);
              this.mostrarToast(this.configIdioma === 'English' ? `Class "${nuevaClase.name}" created with code ${code}!` : `¡Clase "${nuevaClase.name}" creada con código ${code}!`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async unirseAClaseModal() {
    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Join a Class' : 'Unirse a una Clase',
      message: this.configIdioma === 'English' ? 'Enter the class code provided by your teacher:' : 'Ingresa el código proporcionado por tu profesor:',
      inputs: [
        { name: 'codigo', type: 'text', placeholder: 'Ej: 8F3DSX' }
      ],
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Join' : 'Unirme',
          handler: (data) => {
            const cod = data.codigo?.trim().toUpperCase();
            if (!cod) return;
            const encontrada = this.clases.find(c => c.codigo.toUpperCase() === cod);
            if (encontrada) {
              const yaEsta = encontrada.estudiantesList.some(e => e.name === (this.currentUser?.name || 'Estudiante'));
              if (!yaEsta) {
                encontrada.studentsCount++;
                encontrada.estudiantesList.push({
                  id: 's_' + Date.now(),
                  name: this.currentUser?.name || 'Estudiante',
                  avatar: 'Estudiante',
                  avatarImg: 'assets/saber-icons/SaberStyle_PNG_Individuales/01_Cuerpos/cuerpo_base_01.png',
                  asistencia: 100,
                  retosCompletados: 0,
                  promedio: 100
                });
                this.statsEstudiante.clasesUnidas++;
                this.guardarEstadisticasEstudiante();
                this.mostrarToast(this.configIdioma === 'English' ? `Joined ${encontrada.name}!` : `¡Te has unido con éxito a ${encontrada.name}!`);
                this.verDetalleClase(encontrada);
              } else {
                this.mostrarToast(this.configIdioma === 'English' ? 'You are already in this class.' : 'Ya estás inscrito en esta clase.');
                this.verDetalleClase(encontrada);
              }
            } else {
              this.mostrarToast(this.configIdioma === 'English' ? 'Class code not found.' : 'Código de clase no encontrado. Verifica con tu docente.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async abandonarClase(clase: ClaseItem) {
    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Leave Class' : 'Abandonar Clase',
      message: this.configIdioma === 'English' 
        ? `Are you sure you want to leave ${clase.name}?`
        : `¿Estás seguro de que deseas salir de ${clase.name}?`,
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Leave' : 'Abandonar',
          role: 'destructive',
          handler: () => {
            clase.estudiantesList = clase.estudiantesList.filter(e => e.name !== this.currentUser?.name);
            clase.studentsCount = Math.max(0, clase.studentsCount - 1);
            if (this.statsEstudiante.clasesUnidas > 0) {
              this.statsEstudiante.clasesUnidas--;
              this.guardarEstadisticasEstudiante();
            }
            this.mostrarToast(this.configIdioma === 'English' ? 'You left the class.' : 'Has abandonado la clase.');
            this.activeTab = 'clases';
          }
        }
      ]
    });
    await alert.present();
  }

  // ==========================================
  // Logros y Misiones
  // ==========================================
  reclamarMision(mision: MisionDiaria) {
    if (!mision.completed || mision.claimed) return;
    mision.claimed = true;
    this.userCoins += mision.recompensa;
    this.sincronizarUsuario();
    this.mostrarToast(`¡+${mision.recompensa} monedas reclamadas!`);
  }

  reclamarLogro(logro: LogroDesafio) {
    if (!logro.completed || logro.claimed) return;
    logro.claimed = true;
    this.userCoins += logro.recompensa;
    this.sincronizarUsuario();
    this.mostrarToast(`¡Logro "${logro.title}" reclamado! +${logro.recompensa} monedas.`);
  }

  // ==========================================
  // Tema, Idioma y Accesibilidad
  // ==========================================
  setTema(tema: 'claro' | 'oscuro', notificar: boolean = true) {
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
      header: this.configIdioma === 'English' ? 'Select Language' : 'Seleccionar Idioma',
      inputs: [
        { name: 'idioma', type: 'radio', label: 'Español 🇪🇸', value: 'Español', checked: this.configIdioma === 'Español' },
        { name: 'idioma', type: 'radio', label: 'English 🇺🇸', value: 'English', checked: this.configIdioma === 'English' }
      ],
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Save' : 'Guardar',
          handler: (val) => {
            if (val) {
              this.configIdioma = val;
              this.i18n.setLanguage(val);
              this.mostrarToast(val === 'English' ? 'Language switched to English.' : 'Idioma cambiado a Español.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  abrirAccesibilidad() {
    this.activeTab = 'accesibilidad';
    this.statsEstudiante.accesibilidadUsos++;
    this.guardarEstadisticasEstudiante();
  }

  toggleLectorVoz() {
    this.accesibilidad.lectorPantallaVoz = !this.accesibilidad.lectorPantallaVoz;
    this.guardarAccesibilidad();
    this.actualizarLectorActivo();
    if (this.accesibilidad.lectorPantallaVoz) {
      this.leerTextoEnVozAlta(this.configIdioma === 'English' ? 'Screen reader voice narrator enabled.' : 'Lector de pantalla por voz activado en SaberStyle.');
    } else {
      this.mostrarToast(this.configIdioma === 'English' ? 'Voice narrator disabled.' : 'Lector de voz desactivado.');
    }
  }

  private actualizarLectorActivo() {
    if (this.accesibilidad.lectorPantallaVoz) {
      if (!this.screenReaderClickListener) {
        this.screenReaderClickListener = (e: MouseEvent) => {
          const target = e.target as HTMLElement;
          if (!target) return;
          const elem = target.closest('button, [role="button"], a, input, h1, h2, h3, h4, .tab-dest-btn, .saved-game-card, .class-card-compact, .product-glass-card') as HTMLElement;
          if (elem) {
            const textToSpeak = elem.getAttribute('aria-label') || elem.getAttribute('title') || elem.innerText || elem.getAttribute('placeholder');
            if (textToSpeak && textToSpeak.trim().length > 0) {
              this.leerTextoEnVozAlta(textToSpeak.trim());
            }
          }
        };
        document.addEventListener('click', this.screenReaderClickListener, true);
      }
    } else {
      if (this.screenReaderClickListener) {
        document.removeEventListener('click', this.screenReaderClickListener, true);
        this.screenReaderClickListener = null;
      }
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
    this.mostrarToast(this.accesibilidad.modoEnfoque ? 'Modo Enfoque activado.' : 'Animaciones normales activadas.');
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
  // Perfil y Edición de Datos (Fase 2: Cambio de correo y contraseña)
  // ==========================================
  iniciarEdicionPerfil() {
    this.perfilEditando = true;
    this.perfilNombreInput = this.currentUser?.name || '';
    this.perfilEmailInput = this.currentUser?.email || '';
    this.perfilPasswordInput = '';
    this.mostrarPasswordPerfil = false;
  }

  guardarEdicionPerfil() {
    const nuevoNombre = this.perfilNombreInput.trim();
    const nuevoEmail = this.perfilEmailInput.trim().toLowerCase();
    const nuevaPassword = this.perfilPasswordInput.trim();

    if (!nuevoNombre) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Name cannot be empty.' : 'El nombre no puede estar vacío.');
      return;
    }

    if (nuevoEmail && !/^[^s@]+@[^s@]+.[^s@]+$/.test(nuevoEmail)) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Please enter a valid email address.' : 'Ingresa un correo electrónico válido.');
      return;
    }

    if (nuevaPassword && nuevaPassword.length < 6) {
      this.mostrarToast(this.configIdioma === 'English' ? 'Password must be at least 6 characters.' : 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    const updates: Partial<User> = { name: nuevoNombre };
    if (nuevoEmail) updates.email = nuevoEmail;
    if (nuevaPassword) updates.password = nuevaPassword;

    this.authService.updateCurrentUser(updates);
    this.perfilEditando = false;
    this.mostrarToast(this.configIdioma === 'English' ? 'Profile updated successfully.' : 'Perfil actualizado correctamente.');
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
    this.statsEstudiante.iaConsultas++;
    this.guardarEstadisticasEstudiante();

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
  // Utilidades y Notificaciones
  // ==========================================
  async confirmLogout() {
    const alert = await this.alertController.create({
      header: this.configIdioma === 'English' ? 'Log Out' : 'Cerrar Sesión',
      message: this.configIdioma === 'English' 
        ? 'Are you sure you want to log out of SaberStyle?' 
        : '¿Estás seguro de que deseas cerrar sesión en SaberStyle?',
      buttons: [
        { text: this.configIdioma === 'English' ? 'Cancel' : 'Cancelar', role: 'cancel' },
        {
          text: this.configIdioma === 'English' ? 'Log Out' : 'Cerrar Sesión',
          role: 'destructive',
          handler: () => {
            this.authService.logout();
          }
        }
      ]
    });
    await alert.present();
  }

  async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2200,
      position: 'bottom',
      cssClass: 'cosmic-toast'
    });
    await toast.present();
  }
}
