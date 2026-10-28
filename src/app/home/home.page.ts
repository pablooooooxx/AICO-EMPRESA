import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, ToastController, ActionSheetController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { AichatService } from '../services/ai-chat.service';
import { User } from '../models/user.model';
import { Chatmessage } from '../models/chat.model';

export interface GameTypeOption {
  id: string;
  name: string;
  desc: string;
  icon: string;
  badgeColor: string;
}

export interface SavedGame {
  id: string;
  titulo: string;
  tipo: string;
  tipoLabel: string;
  modo: 'en-vivo' | 'asignar';
  preguntasCount: number;
  fecha: string;
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
  studentsCount: number;
  estudiantesList: StudentItem[];
  actividadesCount: number;
  icon: string;
  color: string;
}

export interface StoreItem {
  id: string;
  name: string;
  category: 'cabello' | 'tops' | 'pantalones' | 'zapatos' | 'accesorios';
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
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: User | null = null;

  // Pestaña activa en pantalla
  activeTab: 'estudiante' | 'profesor' | 'clases' | 'clase-detalle' | 'crear-juego' | 'tienda' | 'closet' | 'logros' | 'estadisticas' | 'configuracion' | 'opciones-adicionales' | 'quiz-lobby' | 'quiz-opcion' | 'quiz-vf' | 'quiz-abierta' | 'quiz-ganar' | 'ruleta-juego' = 'estudiante';

  // Destino activo en la barra inferior de 5 botones
  currentBottomNav: 'inicio' | 'clases' | 'crear' | 'tienda' | 'logros' = 'inicio';

  // Monedas y Economía
  userCoins: number = 1250;

  // Configuración de Avatar sincronizada globalmente
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

  // Paleta de tonos de piel (naturales y cósmicos)
  tonosPiel = [
    { color: '#fae7d0', label: 'Claro' },
    { color: '#f8d9b6', label: 'Medio' },
    { color: '#e5b88f', label: 'Cálido' },
    { color: '#c98a58', label: 'Bronce' },
    { color: '#703c19', label: 'Oscuro' },
    { color: '#d8b4fe', label: 'Morado Cósmico' },
    { color: '#93c5fd', label: 'Azul Estelar' },
    { color: '#f472b6', label: 'Rosa Galaxia' }
  ];

  // Expresiones faciales cartoon
  expresiones = ['Feliz', 'Guiño', 'Sorprendido', 'Neutro', 'Pensativo'];

  // Ángulos de vista 360°
  angulosVista = ['Frente', '3/4', 'Perfil', 'Espalda'];

  // Categorías de la Tienda / Armario (Roblox style)
  storeCategoryFilter: 'todo' | 'cabello' | 'tops' | 'pantalones' | 'zapatos' | 'accesorios' = 'todo';

  // Artículos de la Tienda e Inventario
  storeItems: StoreItem[] = [
    { id: 'sudadera-estrella', name: 'Sudadera Estrella', category: 'tops', price: 350, tag: 'NUEVO', owned: true, equipped: true, icon: 'shirt-outline', color: '#a855f7' },
    { id: 'pantalon-urbano', name: 'Pantalón Urbano', category: 'pantalones', price: 280, tag: 'POPULAR', owned: true, equipped: true, icon: 'barcode-outline', color: '#3b82f6' },
    { id: 'mascota-snoopy', name: 'Perrito Galáctico Snoopy', category: 'accesorios', price: 450, tag: 'DESTACADO', owned: true, equipped: true, icon: 'paw-outline', color: '#ec4899' },
    { id: 'cabello-moderno', name: 'Corte Galáctico', category: 'cabello', price: 180, tag: 'ESTILO', owned: true, equipped: true, icon: 'sparkles-outline', color: '#6366f1' },
    { id: 'sneakers-pro', name: 'Sneakers Cósmicos', category: 'zapatos', price: 220, owned: true, equipped: true, icon: 'footsteps-outline', color: '#10b981' },
    { id: 'hoodie-neon', name: 'Hoodie Neón Cyber', category: 'tops', price: 320, tag: 'NUEVO', owned: false, equipped: false, icon: 'shirt-outline', color: '#f43f5e' },
    { id: 'falda-plisada', name: 'Falda Plisada Violeta', category: 'pantalones', price: 250, owned: false, equipped: false, icon: 'color-palette-outline', color: '#c084fc' },
    { id: 'gorra-saber', name: 'Gorra SaberStyle', category: 'accesorios', price: 160, owned: false, equipped: false, icon: 'flash-outline', color: '#ffb300' },
    { id: 'botas-lunares', name: 'Botas de Gravedad', category: 'zapatos', price: 310, tag: 'ÉPICO', owned: false, equipped: false, icon: 'rocket-outline', color: '#8b5cf6' },
    { id: 'cabello-rizos', name: 'Melena Estelar', category: 'cabello', price: 200, owned: false, equipped: false, icon: 'flower-outline', color: '#f472b6' }
  ];

  // ==========================================
  // Datos Módulo de Creación de Juegos
  // ==========================================
  selectedGameType: string = 'quiz';
  selectedParticipationMode: 'en-vivo' | 'asignar' = 'en-vivo';
  nuevoJuegoTitulo: string = '';

  gameTypes: GameTypeOption[] = [
    { id: 'quiz', name: 'Cuestionario', desc: 'Preguntas de opción múltiple con puntajes inmediatos', icon: 'help-circle-outline', badgeColor: '#ec4899' },
    { id: 'ruleta', name: 'Ruleta Aleatoria', desc: 'Rueda de conceptos y preguntas para dinamizar la clase', icon: 'disc-outline', badgeColor: '#8b5cf6' },
    { id: 'abierta', name: 'Pregunta Abierta', desc: 'Debates y respuestas escritas estilo chat colaborativo', icon: 'chatbubbles-outline', badgeColor: '#3b82f6' },
    { id: 'verdadero-falso', name: 'Verdadero o Falso', desc: 'Dilemas rápidos de verificación conceptual', icon: 'checkmark-done-circle-outline', badgeColor: '#10b981' },
    { id: 'completar', name: 'Completar Frase', desc: 'Rellena los espacios vacíos con los términos correctos', icon: 'document-text-outline', badgeColor: '#f59e0b' },
    { id: 'sopa-letras', name: 'Sopa de Letras', desc: 'Búsqueda de términos clave en cuadrícula interactiva', icon: 'grid-outline', badgeColor: '#06b6d4' }
  ];

  savedGames: SavedGame[] = [
    { id: 'g1', titulo: 'Quiz de Funciones y Límites', tipo: 'quiz', tipoLabel: 'Cuestionario', modo: 'en-vivo', preguntasCount: 15, fecha: 'Hoy' },
    { id: 'g2', titulo: 'Ruleta de Repaso Saber 11', tipo: 'ruleta', tipoLabel: 'Ruleta', modo: 'en-vivo', preguntasCount: 6, fecha: 'Ayer' },
    { id: 'g3', titulo: 'Debate: Funciones en la Vida Real', tipo: 'abierta', tipoLabel: 'Pregunta Abierta', modo: 'asignar', preguntasCount: 3, fecha: '18 Oct' },
    { id: 'g4', titulo: 'Comprobación: Leyes de Newton', tipo: 'verdadero-falso', tipoLabel: 'Verdadero o Falso', modo: 'asignar', preguntasCount: 8, fecha: '15 Oct' },
    { id: 'g5', titulo: 'Vocabulario Biología Celular', tipo: 'sopa-letras', tipoLabel: 'Sopa de Letras', modo: 'asignar', preguntasCount: 10, fecha: '12 Oct' }
  ];

  // Ruleta interactiva
  ruletaSectores: string[] = ['Dominio', 'Rango', 'Inyectiva', 'Asíntota', 'Pendiente', 'Parábola'];
  ruletaRotacion: number = 0;
  ruletaGirando: boolean = false;
  ruletaResultado: string | null = null;

  // ==========================================
  // Datos Flujo de Quiz
  // ==========================================
  quizTimer: number = 15;
  quizJugadores: number = 24;
  quizOpcionSeleccionada: string | null = null;
  quizVFSeleccionado: string | null = null;
  quizMiRespuestaAbierta: string = '';
  quizRespuestasFeed = [
    {
      autor: 'Prof. Carlos Ramírez',
      rol: 'profesor',
      texto: 'Recuerden que una función f(x) asigna a cada elemento del dominio exactamente un elemento del codominio.',
      correcta: true
    },
    {
      autor: 'Sofia Morales (Estudiante)',
      rol: 'estudiante',
      texto: 'Es una relación entre dos magnitudes de forma que a cada valor de la primera le corresponde un único valor de la segunda.',
      correcta: true
    },
    {
      autor: 'Mateo Gómez (Estudiante)',
      rol: 'estudiante',
      texto: 'Una regla matemática donde la variable x determina el resultado exacto de y.',
      correcta: true
    }
  ];

  // ==========================================
  // Datos Mis Clases y Gestión
  // ==========================================
  searchQuery: string = '';
  claseSeleccionada: ClaseItem | null = null;
  clases: ClaseItem[] = [
    {
      id: 101,
      name: 'Matemáticas 11-A',
      grado: '11°',
      codigo: 'SABER-MAT11',
      docente: 'Prof. Carlos Ramírez',
      studentsCount: 24,
      actividadesCount: 5,
      icon: 'calculator-outline',
      color: '#8b5cf6',
      estudiantesList: [
        { id: 's1', name: 'Juan Pérez', avatar: '👨‍🎓', asistencia: 96, retosCompletados: 14, promedio: 88 },
        { id: 's2', name: 'Sofia Morales', avatar: '👩‍🎓', asistencia: 92, retosCompletados: 13, promedio: 91 },
        { id: 's3', name: 'Mateo Gómez', avatar: '👨‍🎓', asistencia: 88, retosCompletados: 12, promedio: 79 },
        { id: 's4', name: 'Valeria Torres', avatar: '👩‍🎓', asistencia: 100, retosCompletados: 15, promedio: 95 },
        { id: 's5', name: 'Lucas Ramírez', avatar: '👨‍🎓', asistencia: 84, retosCompletados: 10, promedio: 75 }
      ]
    },
    {
      id: 102,
      name: 'Sociales & Ciudadanas',
      grado: '10°',
      codigo: 'SABER-SOC10',
      docente: 'Prof. Carlos Ramírez',
      studentsCount: 28,
      actividadesCount: 4,
      icon: 'globe-outline',
      color: '#ec4899',
      estudiantesList: [
        { id: 's6', name: 'Camila Rojas', avatar: '👩‍🎓', asistencia: 94, retosCompletados: 11, promedio: 85 },
        { id: 's7', name: 'Andrés López', avatar: '👨‍🎓', asistencia: 90, retosCompletados: 9, promedio: 80 }
      ]
    },
    {
      id: 103,
      name: 'Ciencias Naturales 9',
      grado: '9°',
      codigo: 'SABER-CNAT9',
      docente: 'Prof. Carlos Ramírez',
      studentsCount: 22,
      actividadesCount: 3,
      icon: 'flask-outline',
      color: '#3b82f6',
      estudiantesList: [
        { id: 's8', name: 'Daniela Castro', avatar: '👩‍🎓', asistencia: 95, retosCompletados: 10, promedio: 87 }
      ]
    }
  ];

  // ==========================================
  // Estadísticas Explicadas con Lógica Real
  // ==========================================
  statsEstudiante = {
    clasesAsistidas: 12,
    juegosCompletados: 10,
    juegosFallados: 3,
    totalPartidas: 13,
    porcentajePromedio: 78 // (10 / 13) = 76.9% ≈ 78%
  };

  logrosDesafios: LogroDesafio[] = [
    { id: 1, title: 'Primer Vuelo Estelar', desc: 'Completa tu primera partida de práctica.', medal: 'bronze', completed: true, recompensa: 50 },
    { id: 2, title: 'Racha Cósmica', desc: 'Responde 5 preguntas correctas consecutivas.', medal: 'silver', completed: true, recompensa: 100 },
    { id: 3, title: 'Maestro de la Galaxia', desc: 'Obtén el 1er lugar en una partida en vivo.', medal: 'gold', completed: true, recompensa: 250 },
    { id: 4, title: 'Leyenda Diamante', desc: 'Gana 10 partidas consecutivas con puntaje perfecto.', medal: 'diamond', completed: false, recompensa: 500 }
  ];

  // ==========================================
  // Asistente Virtual StAIle
  // ==========================================
  staileOpen: boolean = false;
  staileInput: string = '';
  staileLoading: boolean = false;
  staileMessages: Chatmessage[] = [
    {
      id: 'staile_welcome',
      role: 'assistant',
      content: '¡Hola! 🚀 Soy **StAIle**, tu tutor galáctico en SaberStyle. ¿Tienes dudas sobre tus clases, una fórmula o cómo ganar monedas?',
      timestamp: new Date()
    }
  ];

  // Sugerencias rápidas para el chat de StAIle
  staileSugerencias = [
    '¿Cómo calculo el dominio de una función?',
    '¿Cómo gano monedas para el avatar?',
    '¿Cómo creo una ruleta en clase?'
  ];

  // ==========================================
  // Configuración & Preferencias
  // ==========================================
  configIdioma: string = 'Español';
  configTema: 'oscuro' | 'claro' = 'oscuro';
  configPrivacidad = {
    info: 'privado' as 'privado' | 'publico',
    compartirClase: 'amigos' as 'amigos' | 'todos'
  };
  accesibilidad = {
    daltonismo: false,
    letrasResaltadas: false,
    lecturaVozAlta: false,
    simplificadorIA: false
  };

  constructor(
    private authService: AuthService,
    private aiChatService: AichatService,
    private alertController: AlertController,
    private menuCtrl: MenuController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        if (user.coins !== undefined) {
          this.userCoins = user.coins;
        }
        if (user.avatarConfig) {
          this.avatarConfig = { ...this.avatarConfig, ...user.avatarConfig };
        }
        // Redirección inteligente de rol
        if (user.role === 'teacher') {
          this.activeTab = 'profesor';
        } else {
          this.activeTab = 'estudiante';
        }
        this.currentBottomNav = 'inicio';
      }
    });
  }

  // ==========================================
  // NAVEGACIÓN PRINCIPAL (5 DESTINOS)
  // ==========================================
  selectBottomNav(nav: 'inicio' | 'clases' | 'crear' | 'tienda' | 'logros') {
    this.currentBottomNav = nav;
    switch (nav) {
      case 'inicio':
        this.activeTab = this.currentUser?.role === 'teacher' ? 'profesor' : 'estudiante';
        break;
      case 'clases':
        this.activeTab = 'clases';
        break;
      case 'crear':
        this.activeTab = 'crear-juego';
        break;
      case 'tienda':
        this.activeTab = 'tienda';
        break;
      case 'logros':
        this.activeTab = 'logros';
        break;
    }
  }

  selectTab(tab: any) {
    this.activeTab = tab;
    if (tab === 'estudiante' || tab === 'profesor') {
      this.currentBottomNav = 'inicio';
    } else if (tab === 'clases' || tab === 'clase-detalle') {
      this.currentBottomNav = 'clases';
    } else if (tab === 'crear-juego') {
      this.currentBottomNav = 'crear';
    } else if (tab === 'tienda') {
      this.currentBottomNav = 'tienda';
    } else if (tab === 'logros' || tab === 'estadisticas') {
      this.currentBottomNav = 'logros';
    }
  }

  abrirVestuario() {
    this.activeTab = 'closet';
  }

  volverAInicio() {
    this.selectBottomNav('inicio');
  }

  // ==========================================
  // TIENDA & ECONOMÍA DE MONEDAS
  // ==========================================
  get filteredStoreItems(): StoreItem[] {
    if (this.storeCategoryFilter === 'todo') {
      return this.storeItems;
    }
    return this.storeItems.filter(item => item.category === this.storeCategoryFilter);
  }

  setStoreCategory(cat: 'todo' | 'cabello' | 'tops' | 'pantalones' | 'zapatos' | 'accesorios') {
    this.storeCategoryFilter = cat;
  }

  async comprarPrenda(item: StoreItem) {
    if (item.owned) {
      this.equiparPrenda(item);
      return;
    }

    if (this.userCoins < item.price) {
      const alert = await this.alertController.create({
        header: 'Monedas Insuficientes',
        message: `Necesitas ${item.price} monedas para adquirir "${item.name}". Tu saldo actual es de ${this.userCoins} monedas. ¡Completa misiones y retos para ganar más!`,
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Adquisición',
      message: `¿Deseas comprar "${item.name}" por ${item.price} monedas cósmicas?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Comprar',
          handler: () => {
            this.userCoins -= item.price;
            item.owned = true;
            this.equiparPrenda(item);
            this.sincronizarUsuario();
            this.mostrarToast(`¡Excelente! Has adquirido y equipado "${item.name}".`);
          }
        }
      ]
    });
    await alert.present();
  }

  equiparPrenda(item: StoreItem) {
    // Desequipar otras de la misma categoría
    this.storeItems
      .filter(i => i.category === item.category && i.id !== item.id)
      .forEach(i => (i.equipped = false));

    item.equipped = true;

    // Actualizar configuración del avatar
    if (item.category === 'tops') this.avatarConfig.topId = item.id;
    if (item.category === 'pantalones') this.avatarConfig.bottomId = item.id;
    if (item.category === 'cabello') this.avatarConfig.hairId = item.id;
    if (item.category === 'zapatos') this.avatarConfig.shoesId = item.id;
    if (item.category === 'accesorios') this.avatarConfig.accessoryId = item.id;

    this.sincronizarUsuario();
    this.mostrarToast(`Prenda "${item.name}" equipada en tu avatar.`);
  }

  // ==========================================
  // ARMARIO / CLOSET Y PERSONALIZACIÓN AVATAR
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
    this.mostrarToast('¡Estilo de avatar guardado y sincronizado con éxito!');
    this.volverAInicio();
  }

  private sincronizarUsuario() {
    this.authService.updateCurrentUser({
      coins: this.userCoins,
      avatarConfig: { ...this.avatarConfig }
    });
  }

  // ==========================================
  // CREACIÓN Y GESTIÓN DE JUEGOS
  // ==========================================
  selectGameType(id: string) {
    this.selectedGameType = id;
  }

  setParticipationMode(mode: 'en-vivo' | 'asignar') {
    this.selectedParticipationMode = mode;
  }

  async guardarNuevoJuego() {
    const tipoObj = this.gameTypes.find(g => g.id === this.selectedGameType);
    const titulo = this.nuevoJuegoTitulo.trim() || `Nueva Dinámica de ${tipoObj?.name || 'Juego'}`;

    const nuevo: SavedGame = {
      id: 'g_' + Date.now(),
      titulo: titulo,
      tipo: this.selectedGameType,
      tipoLabel: tipoObj?.name || 'Actividad',
      modo: this.selectedParticipationMode,
      preguntasCount: this.selectedGameType === 'ruleta' ? 6 : 10,
      fecha: 'Ahora'
    };

    this.savedGames.unshift(nuevo);
    this.nuevoJuegoTitulo = '';
    this.mostrarToast(`¡"${nuevo.titulo}" creado exitosamente (${nuevo.modo === 'en-vivo' ? 'En Vivo' : 'Asignado'})!`);
  }

  jugarJuego(juego: SavedGame) {
    if (juego.tipo === 'ruleta') {
      this.activeTab = 'ruleta-juego';
      this.ruletaResultado = null;
    } else {
      this.activeTab = 'quiz-lobby';
    }
  }

  async editarJuego(juego: SavedGame) {
    const alert = await this.alertController.create({
      header: 'Editar Juego',
      subHeader: juego.tipoLabel,
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          value: juego.titulo,
          placeholder: 'Título de la actividad'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: (data) => {
            if (data.titulo?.trim()) {
              juego.titulo = data.titulo.trim();
              this.mostrarToast('Cambios del juego guardados.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async renombrarJuego(juego: SavedGame) {
    const alert = await this.alertController.create({
      header: 'Renombrar Actividad',
      inputs: [
        {
          name: 'nuevoNombre',
          type: 'text',
          value: juego.titulo,
          placeholder: 'Nuevo nombre'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Renombrar',
          handler: (data) => {
            if (data.nuevoNombre?.trim()) {
              juego.titulo = data.nuevoNombre.trim();
              this.mostrarToast('Actividad renombrada.');
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async eliminarJuego(juego: SavedGame) {
    const alert = await this.alertController.create({
      header: '¿Eliminar Actividad?',
      message: `¿Estás seguro de que deseas eliminar "${juego.titulo}"? Esta acción no se puede deshacer.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: () => {
            this.savedGames = this.savedGames.filter(g => g.id !== juego.id);
            this.mostrarToast('Actividad eliminada de tus juegos guardados.');
          }
        }
      ]
    });
    await alert.present();
  }

  // ==========================================
  // DINÁMICA DE LA RULETA INTERACTIVA
  // ==========================================
  girarRuleta() {
    if (this.ruletaGirando) return;
    this.ruletaGirando = true;
    this.ruletaResultado = null;

    const vueltas = 5 + Math.floor(Math.random() * 5);
    const anguloExtra = Math.floor(Math.random() * 360);
    const rotacionTotal = this.ruletaRotacion + vueltas * 360 + anguloExtra;
    this.ruletaRotacion = rotacionTotal;

    setTimeout(() => {
      this.ruletaGirando = false;
      const indiceSector = Math.floor((rotacionTotal % 360) / (360 / this.ruletaSectores.length));
      this.ruletaResultado = this.ruletaSectores[indiceSector] || this.ruletaSectores[0];
      this.userCoins += 50;
      this.sincronizarUsuario();
      this.mostrarToast(`¡La ruleta cayó en: ${this.ruletaResultado}! +50 monedas ganadas.`);
    }, 3200);
  }

  // ==========================================
  // CLASES Y GESTIÓN DE ESTUDIANTES
  // ==========================================
  get clasesFiltradas(): ClaseItem[] {
    if (!this.searchQuery.trim()) {
      return this.clases;
    }
    const q = this.searchQuery.toLowerCase();
    return this.clases.filter(c => c.name.toLowerCase().includes(q) || c.codigo.toLowerCase().includes(q));
  }

  verDetalleClase(clase: ClaseItem) {
    this.claseSeleccionada = clase;
    this.activeTab = 'clase-detalle';
  }

  async copiarCodigoClase(codigo: string) {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(codigo);
    }
    this.mostrarToast(`¡Código de clase "${codigo}" copiado al portapapeles!`);
  }

  async invitarEstudiante() {
    const alert = await this.alertController.create({
      header: 'Invitar Estudiante',
      message: 'Ingresa el correo institucional del alumno para enviarle una invitación:',
      inputs: [
        {
          name: 'email',
          type: 'email',
          placeholder: 'estudiante@institucion.edu.co'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Enviar Invitación',
          handler: (data) => {
            if (data.email?.trim()) {
              this.mostrarToast(`Invitación enviada a ${data.email.trim()}`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async nuevaClase() {
    const alert = await this.alertController.create({
      header: 'Crear Nueva Clase',
      inputs: [
        { name: 'nombre', type: 'text', placeholder: 'Nombre (Ej: Física Mecánica)' },
        { name: 'grado', type: 'text', placeholder: 'Grado (Ej: 11°B)' }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear',
          handler: (data) => {
            if (data.nombre?.trim()) {
              const codigoAleatorio = 'SABER-' + Math.random().toString(36).substring(2, 6).toUpperCase();
              const nueva: ClaseItem = {
                id: Date.now(),
                name: data.nombre.trim(),
                grado: data.grado?.trim() || '11°',
                codigo: codigoAleatorio,
                docente: this.currentUser?.name || 'Profesor',
                studentsCount: 1,
                actividadesCount: 0,
                icon: 'school-outline',
                color: '#ec4899',
                estudiantesList: [
                  { id: 's_new', name: 'Juan Pérez', avatar: '👨‍🎓', asistencia: 100, retosCompletados: 0, promedio: 100 }
                ]
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

  // ==========================================
  // ASISTENTE DE IA: StAIle
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
      next: (resp) => {
        this.staileLoading = false;
        this.staileMessages = this.aiChatService.getConversationHistory();
      },
      error: () => {
        this.staileLoading = false;
      }
    });
  }

  // ==========================================
  // FLUJO DE JUEGO / QUIZ
  // ==========================================
  iniciarQuiz() {
    this.quizTimer = 15;
    this.quizOpcionSeleccionada = null;
    this.activeTab = 'quiz-opcion';
  }

  seleccionarOpcionQuiz(opcion: string) {
    this.quizOpcionSeleccionada = opcion;
    setTimeout(() => {
      this.activeTab = 'quiz-vf';
    }, 600);
  }

  seleccionarVF(val: string) {
    this.quizVFSeleccionado = val;
    setTimeout(() => {
      this.activeTab = 'quiz-abierta';
    }, 600);
  }

  enviarRespuestaAbierta() {
    if (!this.quizMiRespuestaAbierta.trim()) {
      this.mostrarToast('Por favor escribe tu definición.');
      return;
    }
    this.quizRespuestasFeed.push({
      autor: (this.currentUser?.name || 'Juan Pérez') + ' (Tú)',
      rol: 'estudiante',
      texto: this.quizMiRespuestaAbierta.trim(),
      correcta: true
    });
    this.quizMiRespuestaAbierta = '';
    setTimeout(() => {
      this.activeTab = 'quiz-ganar';
    }, 700);
  }

  reclamarYTerminarQuiz() {
    this.userCoins += 100;
    this.statsEstudiante.juegosCompletados++;
    this.statsEstudiante.totalPartidas++;
    this.sincronizarUsuario();
    this.mostrarToast('¡Felicitaciones! Has ganado 🪙 100 monedas cósmicas.');
    this.volverAInicio();
  }

  // ==========================================
  // CONFIGURACIÓN, IDIOMA Y TEMA
  // ==========================================
  setTema(tema: 'oscuro' | 'claro') {
    this.configTema = tema;
    document.body.classList.toggle('light-theme-active', tema === 'claro');
    this.mostrarToast(`Tema ${tema.toUpperCase()} aplicado.`);
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
              this.mostrarToast(`Idioma cambiado a ${val}`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async presentHeaderMenu() {
    const actionSheet = await this.actionSheetController.create({
      header: 'SaberStyle (Aico)',
      buttons: [
        {
          text: 'Configuración y Perfil',
          icon: 'settings-outline',
          handler: () => { this.activeTab = 'configuracion'; }
        },
        {
          text: 'Accesibilidad',
          icon: 'options-outline',
          handler: () => { this.activeTab = 'opciones-adicionales'; }
        },
        {
          text: 'Cerrar Sesión',
          role: 'destructive',
          icon: 'log-out-outline',
          handler: () => { this.confirmLogout(); }
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          icon: 'close'
        }
      ]
    });
    await actionSheet.present();
  }

  async confirmLogout(): Promise<void> {
    await this.menuCtrl.close();
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
