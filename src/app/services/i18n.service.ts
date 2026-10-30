import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = 'Español' | 'English';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private readonly LANG_KEY = 'saberstyle_lang';
  private currentLangSubject: BehaviorSubject<SupportedLanguage>;
  public currentLang$: Observable<SupportedLanguage>;

  private translations: Record<SupportedLanguage, Record<string, string>> = {
    Español: {
      // Navegación Inferior
      nav_home: 'Inicio',
      nav_classes: 'Clases',
      nav_games: 'Juegos',
      nav_create: 'Crear',
      nav_shop: 'Tienda',
      nav_stats: 'Estadísticas',
      nav_profile: 'Perfil',

      // Cabecera
      coins_available: 'Monedas disponibles',
      get_more_coins: 'Conseguir más monedas',
      menu_options: 'Configuración y Opciones',
      back_home: 'Volver al inicio',

      // Estudiante Inicio
      welcome_greeting: '¡Hola',
      ready_to_learn: '¿Listo para aprender jugando?',
      adventure_eyebrow: 'TU AVENTURA',
      adventure_title: 'Sigue donde quedaste',
      adventure_subject: 'Matemáticas · Nivel 3',
      continue: 'Continuar',
      customize_avatar: 'Personalizar mi avatar',
      your_avatar: 'Tu avatar',
      daily_mission: 'Misión diaria',
      explore_saber: 'Explora SaberStyle',
      my_games: 'Mis juegos',
      my_games_count: 'completados',
      play: 'Jugar',
      challenges_quizzes: 'Retos y quizzes',
      for_you: 'Para ti',
      quick_challenge: 'Reto rápido del día',
      quick_challenge_sub: 'Responde 5 preguntas y gana monedas',

      // Profesor Inicio
      hello_teacher: '¡Hola, Profe!',
      manage_classes_acts: 'Gestiona tus clases y actividades',
      create_game: 'Crear juego',
      create_game_desc: 'Diseña y comparte',
      my_classes: 'Mis clases',
      my_classes_desc: 'Gestiona tus grupos',
      statistics: 'Estadísticas',
      statistics_desc: 'Revisa tu progreso',
      materials: 'Materiales',
      materials_desc: 'Recursos y guías',
      create_class: 'Crear clase',
      create_class_desc: 'Invita estudiantes',
      see_games: 'Ver juegos',
      see_games_desc: 'Biblioteca',

      // Tienda y Armario
      shop_title: 'Tienda',
      shop_subtitle: 'Encuentra tu próximo estilo',
      wardrobe_title: 'Mi armario',
      wardrobe_subtitle: 'Viste y personaliza tu avatar cósmico',
      clothing: 'Ropa',
      hair: 'Pelo',
      accessories: 'Accesorios',
      shoes: 'Zapatos',
      coins_banner_label: 'MONEDAS DISPONIBLES',
      get_coins_btn: '+ Conseguir',
      coins_shop_title: 'Tienda de Monedas',
      coins_shop_sub: 'Opciones honestas para adquirir monedas',
      buy_action: 'Comprar',
      equipped_status: 'Equipado',
      save_changes: 'Guardar cambios',

      // Clases
      classes_title: 'Clases',
      join_class_btn: 'Unirme',
      create_class_btn: 'Crear clase',
      search_class_placeholder: 'Buscar por materia o código...',
      class_code: 'Código',
      students_count: 'estudiantes',
      copy_code: 'Copiar código',
      invite: 'Invitar',
      tab_info: 'Información',
      tab_students: 'Estudiantes',
      tab_activities: 'Actividades',
      description: 'Descripción',
      schedule_teacher: 'Horario y Docente',
      enrolled_students: 'Lista de Estudiantes Matriculados',
      add_student: '+ Añadir alumno',
      leave_class_btn: 'Abandonar clase',

      // Juegos
      my_games_title: 'Mis juegos',
      my_games_sub: 'Biblioteca de actividades y dinámicas',
      tab_my_games: 'Mis juegos',
      tab_shared: 'Compartidos',
      search_games: 'Buscar juegos...',
      edit: 'Editar',
      rename: 'Renombrar',
      delete: 'Eliminar',
      create_game_head: 'Crear juego',
      edit_game_head: 'Editar juego',
      config_game_sub: 'Configura tu dinámica educativa',
      game_type: 'Tipo de juego',
      participation_mode: 'Modo de participación',
      live_mode: 'En vivo',
      live_mode_desc: 'El profesor inicia la sesión para que el grupo compita sincrónicamente.',
      individual_mode: 'Individual',
      individual_mode_desc: 'El estudiante responde después a su propio ritmo.',
      activity_title: 'Título de la actividad',
      instructions: 'Instrucciones del juego',
      coins_reward_label: 'Recompensa en monedas al completar',
      save_game_btn: 'Guardar juego',
      spin_wheel: 'GIRAR RULETA',
      spinning: 'GIRANDO...',
      roulette_selected: 'Tema seleccionado:',
      wordsearch_title: 'Sopa de Letras',
      wordsearch_sub: 'Toca las letras para encontrar las palabras',

      // Estadísticas
      progress_title: 'Mi progreso',
      progress_sub: 'Métricas reales y evolución de aprendizaje',
      tab_general: 'General',
      tab_games_stat: 'Juegos',
      tab_classes_stat: 'Clases',
      tab_features_stat: 'Función',
      overall_average: 'Promedio general',
      classes_attended: 'Clases unidas',
      completed_stat: 'Completadas',
      failed_stat: 'Fallidas',
      activities_played: 'Actividades jugadas',
      time_evolution: 'Evolución en el tiempo',
      no_stats_yet: 'Aún no has participado en actividades. ¡Supera tu primer juego para activar tus estadísticas!',

      // Perfil y Configuración
      profile_title: 'Perfil',
      profile_sub: 'Configuración y cuenta',
      coins_badge: 'Monedas',
      edit_profile: 'Editar perfil',
      full_name: 'Nombre completo',
      bio_subject: 'Biografía o materia',
      email_field: 'Correo electrónico',
      new_password_field: 'Nueva contraseña (opcional)',
      save: 'Guardar',
      cancel: 'Cancelar',
      language: 'Idioma',
      theme: 'Tema',
      theme_light: 'Claro',
      theme_dark: 'Oscuro',
      help_accessibility: 'Ayuda y accesibilidad',
      guide_tutorial: 'Guía y tutorial',
      logout: 'Cerrar sesión',

      // Accesibilidad
      acc_screen_title: 'Ayudas para personas',
      acc_screen_sub: 'Accesibilidad real e inclusión digital',
      acc_reader_title: 'Lector de pantalla',
      acc_reader_desc: 'Lectura por voz activa que narra los elementos al tocarlos.',
      test_voice_btn: 'Probar lectura por voz',
      acc_font_title: 'Tamaño de letra',
      acc_font_desc: 'Escala dinámicamente la tipografía en toda la interfaz.',
      acc_contrast_title: 'Alto contraste',
      acc_contrast_desc: 'Colores con contraste elevado WCAG AAA para baja visión.',
      acc_focus_title: 'Modo de enfoque',
      acc_focus_desc: 'Desactiva nebulosas y animaciones distractoras.',
      font_normal: 'Normal (A)',
      font_large: 'Grande (A+)',
      font_xlarge: 'Muy grande (A++)',

      // IA Tutor
      ai_name: 'StAIle',
      ai_status: 'Tutor Galáctico · En línea',
      ai_placeholder: 'Pregúntale a StAIle...',
      ai_consulting: 'Consultando los registros cósmicos... ✨'
    },

    English: {
      // Bottom Navigation
      nav_home: 'Home',
      nav_classes: 'Classes',
      nav_games: 'Games',
      nav_create: 'Create',
      nav_shop: 'Shop',
      nav_stats: 'Stats',
      nav_profile: 'Profile',

      // Header
      coins_available: 'Available coins',
      get_more_coins: 'Get more coins',
      menu_options: 'Settings and Options',
      back_home: 'Back to home',

      // Student Home
      welcome_greeting: 'Hello',
      ready_to_learn: 'Ready to learn while playing?',
      adventure_eyebrow: 'YOUR ADVENTURE',
      adventure_title: 'Pick up where you left off',
      adventure_subject: 'Math · Level 3',
      continue: 'Continue',
      customize_avatar: 'Customize my avatar',
      your_avatar: 'Your avatar',
      daily_mission: 'Daily mission',
      explore_saber: 'Explore SaberStyle',
      my_games: 'My games',
      my_games_count: 'completed',
      play: 'Play',
      challenges_quizzes: 'Challenges & quizzes',
      for_you: 'For you',
      quick_challenge: 'Quick daily challenge',
      quick_challenge_sub: 'Answer 5 questions and earn coins',

      // Teacher Home
      hello_teacher: 'Hello, Teacher!',
      manage_classes_acts: 'Manage your classes and activities',
      create_game: 'Create game',
      create_game_desc: 'Design and share',
      my_classes: 'My classes',
      my_classes_desc: 'Manage your groups',
      statistics: 'Statistics',
      statistics_desc: 'Review your progress',
      materials: 'Materials',
      materials_desc: 'Resources & guides',
      create_class: 'Create class',
      create_class_desc: 'Invite students',
      see_games: 'View games',
      see_games_desc: 'Library',

      // Shop and Wardrobe
      shop_title: 'Shop',
      shop_subtitle: 'Find your next style',
      wardrobe_title: 'My Wardrobe',
      wardrobe_subtitle: 'Dress and customize your cosmic avatar',
      clothing: 'Clothing',
      hair: 'Hair',
      accessories: 'Accessories',
      shoes: 'Shoes',
      coins_banner_label: 'AVAILABLE COINS',
      get_coins_btn: '+ Get Coins',
      coins_shop_title: 'Coins Shop',
      coins_shop_sub: 'Transparent options to acquire coins',
      buy_action: 'Buy',
      equipped_status: 'Equipped',
      save_changes: 'Save changes',

      // Classes
      classes_title: 'Classes',
      join_class_btn: 'Join',
      create_class_btn: 'Create class',
      search_class_placeholder: 'Search by subject or code...',
      class_code: 'Code',
      students_count: 'students',
      copy_code: 'Copy code',
      invite: 'Invite',
      tab_info: 'Information',
      tab_students: 'Students',
      tab_activities: 'Activities',
      description: 'Description',
      schedule_teacher: 'Schedule and Teacher',
      enrolled_students: 'Enrolled Students List',
      add_student: '+ Add student',
      leave_class_btn: 'Leave class',

      // Games
      my_games_title: 'My Games',
      my_games_sub: 'Activities & dynamics library',
      tab_my_games: 'My games',
      tab_shared: 'Shared',
      search_games: 'Search games...',
      edit: 'Edit',
      rename: 'Rename',
      delete: 'Delete',
      create_game_head: 'Create Game',
      edit_game_head: 'Edit Game',
      config_game_sub: 'Configure your learning dynamic',
      game_type: 'Game type',
      participation_mode: 'Participation mode',
      live_mode: 'Live',
      live_mode_desc: 'The teacher starts the session for the class to compete synchronously.',
      individual_mode: 'Individual',
      individual_mode_desc: 'Students answer afterwards at their own pace.',
      activity_title: 'Activity title',
      instructions: 'Game instructions',
      coins_reward_label: 'Coins reward upon completion',
      save_game_btn: 'Save game',
      spin_wheel: 'SPIN WHEEL',
      spinning: 'SPINNING...',
      roulette_selected: 'Selected topic:',
      wordsearch_title: 'Word Search',
      wordsearch_sub: 'Tap letters to find the words',

      // Statistics
      progress_title: 'My Progress',
      progress_sub: 'Real metrics and learning evolution',
      tab_general: 'General',
      tab_games_stat: 'Games',
      tab_classes_stat: 'Classes',
      tab_features_stat: 'Features',
      overall_average: 'Overall average',
      classes_attended: 'Joined classes',
      completed_stat: 'Completed',
      failed_stat: 'Failed',
      activities_played: 'Activities played',
      time_evolution: 'Evolution over time',
      no_stats_yet: 'You haven’t participated in any activities yet. Complete your first game to see your progress!',

      // Profile & Settings
      profile_title: 'Profile',
      profile_sub: 'Settings and account',
      coins_badge: 'Coins',
      edit_profile: 'Edit profile',
      full_name: 'Full name',
      bio_subject: 'Bio or subject',
      email_field: 'Email address',
      new_password_field: 'New password (optional)',
      save: 'Save',
      cancel: 'Cancel',
      language: 'Language',
      theme: 'Theme',
      theme_light: 'Light',
      theme_dark: 'Dark',
      help_accessibility: 'Help and accessibility',
      guide_tutorial: 'Guide & tutorial',
      logout: 'Log out',

      // Accessibility
      acc_screen_title: 'Accessibility Helps',
      acc_screen_sub: 'Real accessibility and digital inclusion',
      acc_reader_title: 'Screen Reader',
      acc_reader_desc: 'Active speech narration that reads items when tapped or focused.',
      test_voice_btn: 'Test voice reading',
      acc_font_title: 'Font size',
      acc_font_desc: 'Dynamically scales typography across the entire interface.',
      acc_contrast_title: 'High contrast',
      acc_contrast_desc: 'WCAG AAA elevated contrast colors for low vision.',
      acc_focus_title: 'Focus mode',
      acc_focus_desc: 'Disables nebulae and distracting animations.',
      font_normal: 'Normal (A)',
      font_large: 'Large (A+)',
      font_xlarge: 'Extra Large (A++)',

      // AI Tutor
      ai_name: 'StAIle',
      ai_status: 'Cosmic Tutor · Online',
      ai_placeholder: 'Ask StAIle...',
      ai_consulting: 'Consulting cosmic records... ✨'
    }
  };

  constructor() {
    const saved = localStorage.getItem(this.LANG_KEY) as SupportedLanguage | null;
    const initialLang: SupportedLanguage = (saved === 'English' || saved === 'Español') ? saved : 'Español';
    this.currentLangSubject = new BehaviorSubject<SupportedLanguage>(initialLang);
    this.currentLang$ = this.currentLangSubject.asObservable();
  }

  public get currentLanguage(): SupportedLanguage {
    return this.currentLangSubject.value;
  }

  public setLanguage(lang: SupportedLanguage): void {
    if (lang === 'English' || lang === 'Español') {
      localStorage.setItem(this.LANG_KEY, lang);
      this.currentLangSubject.next(lang);
    }
  }

  public t(key: string): string {
    const lang = this.currentLanguage;
    const dict = this.translations[lang] || this.translations['Español'];
    return dict[key] || this.translations['Español'][key] || key;
  }
}
