import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, ToastController, ActionSheetController } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { User } from '../models/user.model';

export interface GameTypeOption {
  id: string;
  name: string;
  icon: string;
  color: string;
  bgLight: string;
}

export interface ClaseItem {
  id: number;
  name: string;
  grado: string;
  studentsCount: number;
  icon: string;
  color: string;
  bgLight: string;
}

export interface LogroItem {
  id: number;
  title: string;
  icon: string;
  color: string;
  bgLight: string;
}

export interface TiendaItem {
  id: string;
  name: string;
  price: number;
  icon: string;
  owned: boolean;
  color: string;
}

export interface AvatarPrenda {
  id: string;
  name: string;
  icon: string;
  equipped: boolean;
  type: string;
}

export interface LogroDesafio {
  id: number;
  title: string;
  medal: 'bronze' | 'silver' | 'gold' | 'diamond';
  completed: boolean;
}

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage implements OnInit {
  currentUser: User | null = null;

  // Pestaña activa
  activeTab: 'estudiante' | 'profesor' | 'crear-juego' | 'clases' | 'closet' | 'tienda' | 'logros' | 'estadisticas' | 'configuracion' | 'opciones-adicionales' | 'quiz-lobby' | 'quiz-opcion' | 'quiz-vf' | 'quiz-abierta' | 'quiz-ganar' = 'estudiante';

  // Sub-pestaña para Estadísticas y Logros
  statsSubTab: 'estadisticas' | 'logros' = 'estadisticas';

  // ==========================================
  // Datos Flujo de Quiz (Juego de Funciones)
  // ==========================================
  quizTimer: number = 15;
  quizJugadores: number = 15;
  quizOpcionSeleccionada: string | null = null;
  quizVFSeleccionado: string | null = null;
  quizMiRespuestaAbierta: string = '';
  quizRespuestasFeed = [
    {
      autor: 'Maria (MAESTRA)',
      rol: 'profesor',
      texto: 'Una función es una operación matemática donde un mismo valor de entrada puede tener muchas salidas diferentes al mismo tiempo.',
      correcta: false
    },
    {
      autor: 'Luis (Estudiante)',
      rol: 'estudiante',
      texto: 'Una función es una relación matemática que asigna a cada valor de entrada (x) un único valor de salida (y).',
      correcta: true
    },
    {
      autor: 'Estefhany (Estudiante)',
      rol: 'estudiante',
      texto: 'Es una regla de correspondencia entre dos variables donde a cada valor de x le corresponde uno de y.',
      correcta: true
    }
  ];

  // ==========================================
  // Datos Vista Configuración
  // ==========================================
  nombreUsuarioConfig: string = 'Thomas';
  handleUsuarioConfig: string = 'ThomasVastosRamirez';
  configPrivacidad = {
    info: 'privado' as 'privado' | 'publico',
    compartirClase: 'amigos' as 'amigos' | 'todos'
  };
  configIdioma: string = 'Español';
  configTema: 'oscuro' | 'claro' = 'claro';

  // ==========================================
  // Datos Vista Opciones Adicionales (Accesibilidad e IA)
  // ==========================================
  accesibilidad = {
    daltonismo: false,
    letrasResaltadas: false,
    lecturaVozAlta: false,
    simplificadorIA: false
  };

  // ==========================================
  // Datos Vista Estudiante (dos)
  // ==========================================
  estudianteNivel: number = 5;
  pruebaActual = {
    titulo: 'Prueba saber 11',
    materia: 'Matemáticas',
    progreso: 50,
    preguntasRestantes: 15
  };

  // ==========================================
  // Datos Vista Profesor (tres)
  // ==========================================
  rachaDias: number = 4;
  progresoRacha: number = 0.75;
  statsDocente = {
    clasesHoy: 3,
    juegosCreados: 8,
    estudiantes: 72,
    puntos: 1450,
    nivel: 'Nivel Oro'
  };

  logrosDocente: LogroItem[] = [
    { id: 1, title: 'Maestro Estrella', icon: 'ribbon-outline', color: '#9c27b0', bgLight: '#f3e5f5' },
    { id: 2, title: 'Creador Pro', icon: 'trophy-outline', color: '#e91e63', bgLight: '#fce4ec' },
    { id: 3, title: 'Racha de Fuego', icon: 'flame-outline', color: '#4caf50', bgLight: '#e8f5e9' },
    { id: 4, title: 'Docente Top', icon: 'star-outline', color: '#ffb300', bgLight: '#fff8e1' }
  ];

  // ==========================================
  // Datos Vista Crear Juego (cuatro)
  // ==========================================
  selectedGameType: string = 'quiz';
  gameTypes: GameTypeOption[] = [
    { id: 'quiz', name: 'Quiz', icon: 'help-circle-outline', color: '#e91e63', bgLight: '#fce4ec' },
    { id: 'ruleta', name: 'Ruleta', icon: 'disc-outline', color: '#9c27b0', bgLight: '#f3e5f5' },
    { id: 'abierta', name: 'Pregunta Abierta', icon: 'chatbubbles-outline', color: '#4caf50', bgLight: '#e8f5e9' },
    { id: 'verdadero-falso', name: 'Verdadero o falso', icon: 'checkmark-done-circle-outline', color: '#ffb300', bgLight: '#fff8e1' },
    { id: 'completar', name: 'Completa la oración', icon: 'document-text-outline', color: '#00bcd4', bgLight: '#e0f7fa' },
    { id: 'sopa-letras', name: 'Sopa de letras', icon: 'grid-outline', color: '#ec407a', bgLight: '#f8bbd0' }
  ];
  totalJuegosGuardados: number = 5;

  // ==========================================
  // Datos Vista Mis Clases (cinco)
  // ==========================================
  searchQuery: string = '';
  clases: ClaseItem[] = [
    { id: 1, name: 'Matemáticas 11', grado: '11°', studentsCount: 24, icon: 'calculator-outline', color: '#8e24aa', bgLight: '#f3e5f5' },
    { id: 2, name: 'Sociales 10', grado: '10°', studentsCount: 30, icon: 'globe-outline', color: '#e91e63', bgLight: '#fce4ec' },
    { id: 3, name: 'Inglés 11', grado: '11°', studentsCount: 18, icon: 'book-outline', color: '#43a047', bgLight: '#e8f5e9' },
    { id: 4, name: 'Ciencias Naturales 9', grado: '9°', studentsCount: 22, icon: 'flask-outline', color: '#1e88e5', bgLight: '#e3f2fd' }
  ];

  // ==========================================
  // Datos Vista Closet / Editar Avatar
  // ==========================================
  tonosPiel: string[] = [
    '#fae7d0', '#f8d9b6', '#e5b88f', '#c98a58', '#a05c32', '#703c19', '#42220f', '#241208'
  ];
  tonoPielActual: string = '#f8d9b6';

  avatarPrendas: AvatarPrenda[] = [
    { id: 'sneakers', name: 'Zapatillas Blancas', icon: 'footsteps-outline', equipped: true, type: 'shoes' },
    { id: 'suit', name: 'Traje Formal Azul', icon: 'shirt-outline', equipped: false, type: 'suit' },
    { id: 'skirt', name: 'Falda Plisada Rosa', icon: 'color-palette-outline', equipped: false, type: 'skirt' },
    { id: 'hat', name: 'Gorro Morado AICO', icon: 'sparkles-outline', equipped: false, type: 'hat' }
  ];
  prendaSeleccionadaId: string = 'sneakers';
  avatarOutfitIndex: number = 0;
  avatarOutfits = [
    { id: 'coat', label: 'Abrigo Beige y Morado', color: '#8e24aa' },
    { id: 'hoodie', label: 'Buzo Deportivo Amarillo', color: '#ffb300' },
    { id: 'suit', label: 'Traje de Gala Ejecutivo', color: '#283593' }
  ];

  // ==========================================
  // Datos Vista Tienda de Avatar
  // ==========================================
  userCoins: number = 250;
  tiendaItems: TiendaItem[] = [
    { id: 'suit', name: 'Traje Elegante', price: 300, icon: 'shirt-outline', owned: false, color: '#303f9f' },
    { id: 'skirt', name: 'Falda Rosa', price: 230, icon: 'sparkles-outline', owned: false, color: '#e91e63' },
    { id: 'sneakers', name: 'Zapatillas Urbanas', price: 180, icon: 'footsteps-outline', owned: true, color: '#9c27b0' },
    { id: 'hair', name: 'Corte Moderno', price: 150, icon: 'cut-outline', owned: false, color: '#795548' },
    { id: 'pet', name: 'Robot Mascota', price: 200, icon: 'paw-outline', owned: false, color: '#00bcd4' },
    { id: 'hoodie', name: 'Buzo Amarillo', price: 210, icon: 'accessibility-outline', owned: true, color: '#ffb300' }
  ];

  // ==========================================
  // Datos Vista Estadísticas y Logros
  // ==========================================
  statsEstudiante = {
    clasesAsistidas: 12,
    porcentajePromedio: 78,
    juegosFallados: 3,
    juegosCompletados: 10
  };

  chartPoints = [
    { x: 30, y: 140, val: '20%' },
    { x: 75, y: 110, val: '40%' },
    { x: 120, y: 130, val: '30%' },
    { x: 165, y: 70, val: '65%' },
    { x: 210, y: 90, val: '55%' },
    { x: 255, y: 35, val: '88%' },
    { x: 300, y: 40, val: '85%' }
  ];
  svgLinePath = 'M 30 140 L 75 110 L 120 130 L 165 70 L 210 90 L 255 35 L 300 40';
  svgAreaPath = 'M 30 140 L 75 110 L 120 130 L 165 70 L 210 90 L 255 35 L 300 40 L 300 160 L 30 160 Z';

  logrosDesafios: LogroDesafio[] = [
    { id: 1, title: 'Crea o Juega una partida.', medal: 'bronze', completed: true },
    { id: 2, title: 'Gana el obten una racha de respuestas', medal: 'silver', completed: true },
    { id: 3, title: 'Obten el primer lugar en una prtida', medal: 'gold', completed: true },
    { id: 4, title: 'Gana 10 partidas seguidas con el primer lugar', medal: 'diamond', completed: false }
  ];

  constructor(
    private authService: AuthService,
    private alertController: AlertController,
    private menuCtrl: MenuController,
    private toastController: ToastController,
    private actionSheetController: ActionSheetController
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  // Navegación de pestañas inferiores y pantallas
  selectTab(tab: 'estudiante' | 'profesor' | 'crear-juego' | 'clases' | 'closet' | 'tienda' | 'logros' | 'estadisticas' | 'configuracion' | 'opciones-adicionales' | 'quiz-lobby' | 'quiz-opcion' | 'quiz-vf' | 'quiz-abierta' | 'quiz-ganar') {
    this.activeTab = tab;
    if (tab === 'estadisticas' || tab === 'logros') {
      this.statsSubTab = tab;
    }
  }

  get currentTabTitle(): string {
    switch (this.activeTab) {
      case 'estudiante': return 'dos';
      case 'profesor': return 'tres';
      case 'crear-juego': return 'cuatro';
      case 'clases': return 'cinco';
      case 'closet': return 'Closet';
      case 'tienda': return 'Tienda';
      case 'logros': return 'Logros';
      case 'estadisticas': return 'Estadisticas';
      case 'configuracion': return 'Configuracion';
      case 'opciones-adicionales': return 'Opciones Adicionales';
      case 'quiz-lobby': return 'Prueba Matematicas';
      case 'quiz-opcion': return 'Prueba Matematicas';
      case 'quiz-vf': return 'Quiz de Matematicas';
      case 'quiz-abierta': return 'Quiz de Matematicas';
      case 'quiz-ganar': return 'GANAR';
      default: return 'AICO';
    }
  }

  // ==========================================
  // Interacciones Flujo de Quiz (Juego de Funciones)
  // ==========================================
  iniciarQuiz() {
    this.quizTimer = 15;
    this.quizOpcionSeleccionada = null;
    this.activeTab = 'quiz-opcion';
    this.mostrarToast('¡Comenzó la prueba! Pregunta 13 de 15.');
  }

  seleccionarOpcionQuiz(opcion: string) {
    this.quizOpcionSeleccionada = opcion;
    if (opcion === 'B') {
      this.mostrarToast('¡Excelente! El dominio de f(x)=1/(x-3) es x ≠ 3.');
    } else {
      this.mostrarToast('Respuesta guardada.');
    }
    setTimeout(() => {
      this.quizTimer = 15;
      this.activeTab = 'quiz-vf';
    }, 700);
  }

  seleccionarVF(val: string) {
    this.quizVFSeleccionado = val;
    if (val === 'Verdadero') {
      this.mostrarToast('¡Correcto! Una función lineal siempre genera una recta.');
    } else {
      this.mostrarToast('Respuesta registrada.');
    }
    setTimeout(() => {
      this.quizTimer = 150;
      this.activeTab = 'quiz-abierta';
    }, 700);
  }

  enviarRespuestaAbierta() {
    if (!this.quizMiRespuestaAbierta.trim()) {
      this.mostrarToast('Por favor escribe tu definición.');
      return;
    }
    this.quizRespuestasFeed.push({
      autor: (this.currentUser?.name || 'Thomas') + ' (Tú)',
      rol: 'estudiante',
      texto: this.quizMiRespuestaAbierta.trim(),
      correcta: true
    });
    this.quizMiRespuestaAbierta = '';
    this.mostrarToast('¡Respuesta enviada a la clase!');
    setTimeout(() => {
      this.activeTab = 'quiz-ganar';
    }, 800);
  }

  reclamarYTerminarQuiz() {
    this.userCoins += 100;
    this.mostrarToast('¡Felicitaciones! Has recibido 🪙 100$ monedas para la tienda.');
    this.selectTab('estudiante');
  }

  // ==========================================
  // Interacciones Closet / Avatar
  // ==========================================
  cambiarTonoPiel(tono: string) {
    this.tonoPielActual = tono;
  }

  seleccionarPrenda(prenda: AvatarPrenda) {
    this.prendaSeleccionadaId = prenda.id;
  }

  toggleEquiparPrenda(prenda: AvatarPrenda) {
    prenda.equipped = !prenda.equipped;
    this.mostrarToast(prenda.equipped ? `¡${prenda.name} equipada!` : `Prenda desequipada.`);
  }

  prevAvatarOutfit() {
    this.avatarOutfitIndex = (this.avatarOutfitIndex - 1 + this.avatarOutfits.length) % this.avatarOutfits.length;
  }

  nextAvatarOutfit() {
    this.avatarOutfitIndex = (this.avatarOutfitIndex + 1) % this.avatarOutfits.length;
  }

  resetAvatarChanges() {
    this.tonoPielActual = '#f8d9b6';
    this.avatarOutfitIndex = 0;
    this.mostrarToast('Se restauraron los ajustes originales del avatar.');
  }

  guardarCambiosAvatar() {
    this.mostrarToast('¡Cambios de avatar guardados con éxito!');
    this.selectTab('estudiante');
  }

  // ==========================================
  // Interacciones Tienda
  // ==========================================
  irAlVestuario() {
    this.selectTab('closet');
  }

  async comprarItem(item: TiendaItem) {
    if (item.owned) {
      this.selectTab('closet');
      return;
    }

    if (this.userCoins < item.price) {
      const alert = await this.alertController.create({
        header: 'Monedas insuficientes',
        message: `Necesitas ${item.price}$ monedas para comprar este artículo. Tu saldo actual es de ${this.userCoins}$. ¡Juega más partidas para conseguir monedas!`,
        buttons: ['Entendido']
      });
      await alert.present();
      return;
    }

    const alert = await this.alertController.create({
      header: 'Confirmar Compra',
      message: `¿Deseas comprar "${item.name}" por ${item.price}$ monedas?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Comprar',
          handler: () => {
            this.userCoins -= item.price;
            item.owned = true;
            this.mostrarToast(`¡Compraste "${item.name}" con éxito!`);
          }
        }
      ]
    });
    await alert.present();
  }

  // ==========================================
  // Interacciones Estadísticas y Logros
  // ==========================================
  switchStatsTab(subTab: 'estadisticas' | 'logros') {
    this.statsSubTab = subTab;
    this.activeTab = subTab;
  }

  // ==========================================
  // Interacciones Crear Juego
  // ==========================================
  selectGameType(typeId: string) {
    this.selectedGameType = typeId;
  }

  async crearJuego() {
    const juego = this.gameTypes.find(g => g.id === this.selectedGameType);
    const alert = await this.alertController.create({
      header: '¡Configurar ' + (juego?.name || 'Juego') + '!',
      message: `Has seleccionado el modo "${juego?.name}". Ingresa el título de tu nueva actividad:`,
      inputs: [
        {
          name: 'titulo',
          type: 'text',
          placeholder: 'Ej: Repaso examen final'
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Comenzar',
          handler: (data) => {
            if (data.titulo?.trim()) {
              this.totalJuegosGuardados++;
              this.mostrarToast(`Juego "${data.titulo}" creado exitosamente.`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async abrirJuegosGuardados() {
    const alert = await this.alertController.create({
      header: 'Juegos Guardados (' + this.totalJuegosGuardados + ')',
      message: '1. Quiz Matemáticas 11\n2. Ruleta Historia Saber 11\n3. Preguntas Abiertas Inglés\n4. Verdadero o Falso Filosofía\n5. Sopa de Letras Biología',
      buttons: ['Cerrar']
    });
    await alert.present();
  }

  // ==========================================
  // Interacciones Clases
  // ==========================================
  get clasesFiltradas(): ClaseItem[] {
    if (!this.searchQuery.trim()) {
      return this.clases;
    }
    const q = this.searchQuery.toLowerCase();
    return this.clases.filter(c => c.name.toLowerCase().includes(q));
  }

  async nuevaClase() {
    const alert = await this.alertController.create({
      header: 'Nueva Clase',
      inputs: [
        {
          name: 'nombre',
          type: 'text',
          placeholder: 'Nombre de la materia (Ej: Física 10)'
        },
        {
          name: 'estudiantes',
          type: 'number',
          placeholder: 'Número estimado de estudiantes',
          min: 1
        }
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Crear Clase',
          handler: (data) => {
            if (data.nombre?.trim()) {
              const nueva: ClaseItem = {
                id: Date.now(),
                name: data.nombre.trim(),
                grado: 'General',
                studentsCount: Number(data.estudiantes) || 20,
                icon: 'school-outline',
                color: '#8e24aa',
                bgLight: '#f3e5f5'
              };
              this.clases.unshift(nueva);
              this.statsDocente.clasesHoy++;
              this.mostrarToast(`Clase "${nueva.name}" agregada con éxito.`);
            }
          }
        }
      ]
    });
    await alert.present();
  }

  async verDetalleClase(clase: ClaseItem) {
    const alert = await this.alertController.create({
      header: clase.name,
      subHeader: `${clase.studentsCount} estudiantes matriculados`,
      message: 'Código de acceso: AICO-' + clase.id + '\nEstado: Activa\nDocente asignado: ' + (this.currentUser?.name || 'Profesor'),
      buttons: ['Entendido']
    });
    await alert.present();
  }

  // ==========================================
  // Interacciones Estudiante
  // ==========================================
  continuarPrueba() {
    this.selectTab('quiz-lobby');
  }

  // Menú superior de 3 puntos
  async presentHeaderMenu() {
    const actionSheet = await this.actionSheetController.create({
      header: 'Navegación AICO',
      buttons: [
        {
          text: 'Home Estudiante (dos)',
          icon: 'school-outline',
          handler: () => { this.selectTab('estudiante'); }
        },
        {
          text: 'Home Profesor (tres)',
          icon: 'person-outline',
          handler: () => { this.selectTab('profesor'); }
        },
        {
          text: 'Crear Juego (cuatro)',
          icon: 'game-controller-outline',
          handler: () => { this.selectTab('crear-juego'); }
        },
        {
          text: 'Mis Clases (cinco)',
          icon: 'storefront-outline',
          handler: () => { this.selectTab('clases'); }
        },
        {
          text: 'Closet / Editar Avatar',
          icon: 'shirt-outline',
          handler: () => { this.selectTab('closet'); }
        },
        {
          text: 'Tienda de Avatar',
          icon: 'pricetags-outline',
          handler: () => { this.selectTab('tienda'); }
        },
        {
          text: 'Logros',
          icon: 'trophy-outline',
          handler: () => { this.selectTab('logros'); }
        },
        {
          text: 'Estadísticas',
          icon: 'bar-chart-outline',
          handler: () => { this.selectTab('estadisticas'); }
        },
        {
          text: 'Configuración',
          icon: 'settings-outline',
          handler: () => { this.selectTab('configuracion'); }
        },
        {
          text: 'Opciones Adicionales',
          icon: 'options-outline',
          handler: () => { this.selectTab('opciones-adicionales'); }
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

  // ==========================================
  // Interacciones Configuración
  // ==========================================
  setPrivacidadInfo(tipo: 'privado' | 'publico') {
    this.configPrivacidad.info = tipo;
    this.mostrarToast(`Información establecida como ${tipo.toUpperCase()}`);
  }

  setCompartirClase(tipo: 'amigos' | 'todos') {
    this.configPrivacidad.compartirClase = tipo;
    this.mostrarToast(`Compartir clase: ${tipo === 'amigos' ? 'Solo amigos' : 'Todos'}`);
  }

  setTema(tema: 'oscuro' | 'claro') {
    this.configTema = tema;
    document.body.classList.toggle('dark-theme-active', tema === 'oscuro');
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

  irAOpcionesAdicionales() {
    this.selectTab('opciones-adicionales');
  }

  // ==========================================
  // Interacciones Opciones Adicionales (Accesibilidad e IA)
  // ==========================================
  toggleDaltonismo(val: boolean) {
    this.accesibilidad.daltonismo = val;
    document.body.classList.toggle('daltonismo-mode', val);
    this.mostrarToast(`Corrección de color (Daltonismo): ${val ? 'Activado' : 'Desactivado'}`);
  }

  toggleLetrasResaltadas(val: boolean) {
    this.accesibilidad.letrasResaltadas = val;
    document.body.classList.toggle('high-contrast-text', val);
    this.mostrarToast(`Letras resaltadas: ${val ? 'Activado' : 'Desactivado'}`);
  }

  toggleLecturaVoz(val: boolean) {
    this.accesibilidad.lecturaVozAlta = val;
    if (val && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utter = new SpeechSynthesisUtterance('Lectura en voz alta activada en AICO');
      utter.lang = 'es-ES';
      window.speechSynthesis.speak(utter);
    }
    this.mostrarToast(`Lectura en voz alta: ${val ? 'Activado' : 'Desactivado'}`);
  }

  toggleSimplificadorIA(val: boolean) {
    this.accesibilidad.simplificadorIA = val;
    document.body.classList.toggle('ia-simplified', val);
    this.mostrarToast(`Corrección de simplificador de elementos IA: ${val ? 'Activado' : 'Desactivado'}`);
  }

  async confirmLogout(): Promise<void> {
    await this.menuCtrl.close();
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas salir de tu cuenta?',
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

