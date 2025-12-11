
import { Product, AppNotification, ExpressOffer, UserStats, Order, OpeningHours, OrderStatus, MascotConfig, ChatMessage, UserProfile, CommunityPost, Suggestion, UserLevel, DailyQuest, ComboBundle, StoryOffer, Debtor, Expense, StickyNote, Reward, Accessory, ApiUsage, SpecialRequest, UserRole } from '../types';

const PRODUCTS_KEY = 'sudomsur_products';
const NOTIFICATIONS_KEY = 'sudomsur_notifications';
const OFFERS_KEY = 'sudomsur_offers';
const STATS_KEY = 'sudomsur_user_stats';
const ORDERS_KEY = 'sudomsur_orders';
const HOURS_KEY = 'sudomsur_hours';
const MASCOT_CONFIG_KEY = 'sudomsur_mascot_config';
const CHAT_HISTORY_KEY = 'sudomsur_chat_history';
const USER_PROFILE_KEY = 'sudomsur_user_profile';
const COMMUNITY_POSTS_KEY = 'sudomsur_community_posts';
const SUGGESTIONS_KEY = 'sudomsur_suggestions';
const QUESTS_KEY = 'sudomsur_quests';
const BUNDLES_KEY = 'sudomsur_bundles';
const STORIES_KEY = 'sudomsur_stories';
const DEBTORS_KEY = 'sudomsur_debtors';
const EXPENSES_KEY = 'sudomsur_expenses';
const NOTES_KEY = 'sudomsur_sticky_notes';
const BLOCKED_USERS_KEY = 'sudomsur_blocked_users';
const API_USAGE_KEY = 'sudomsur_api_usage';
const SPECIAL_REQUESTS_KEY = 'sudomsur_special_requests';

export const STORE_COORDS = { lat: 18.281883582694103, lng: -70.32828277473207 };

export const MASCOT_ACCESSORIES: Accessory[] = [
  // HEAD (Hats, Crowns, Headphones) - Sits ON TOP of hair
  { id: 'acc_cap_angel', name: 'Gorra Sudomsur', price: 100, type: 'HEAD', mascot: 'ANGEL', icon: '🧢' },
  { id: 'acc_crown', name: 'Corona Real', price: 500, type: 'HEAD', mascot: 'BOTH', icon: '👑' },
  { id: 'acc_party_hat', name: 'Gorro Fiesta', price: 150, type: 'HEAD', mascot: 'BOTH', icon: '🥳' },
  { id: 'acc_headphones', name: 'Audífonos Gamer', price: 400, type: 'HEAD', mascot: 'BOTH', icon: '🎧' },
  { id: 'acc_flower', name: 'Flor Feliz', price: 80, type: 'HEAD', mascot: 'EBERT', icon: '🌻' },
  { id: 'acc_grad_cap', name: 'Birrete', price: 300, type: 'HEAD', mascot: 'BOTH', icon: '🎓' },
  { id: 'acc_viking', name: 'Casco Vikingo', price: 250, type: 'HEAD', mascot: 'BOTH', icon: '🪖' },

  // FACE (Glasses, Masks) - Sits ON TOP of face
  { id: 'acc_glasses_angel', name: 'Lentes Cool', price: 150, type: 'FACE', mascot: 'ANGEL', icon: '🕶️' },
  { id: 'acc_glasses_star', name: 'Lentes Estrella', price: 200, type: 'FACE', mascot: 'BOTH', icon: '🤩' },
  { id: 'acc_pacifier_ebert', name: 'Chupete Oro', price: 300, type: 'FACE', mascot: 'EBERT', icon: '👶' },
  { id: 'acc_mustache', name: 'Bigote Falso', price: 100, type: 'FACE', mascot: 'ANGEL', icon: '🥸' },
  { id: 'acc_3dglasses', name: 'Lentes 3D', price: 180, type: 'FACE', mascot: 'BOTH', icon: '👓' },

  // BODY (Backpacks, Capes, Scarves) - Complex Layering
  { id: 'acc_bowtie_angel', name: 'Corbatín Rojo', price: 200, type: 'BODY', mascot: 'ANGEL', icon: '🎀' },
  { id: 'acc_scarf', name: 'Bufanda Escolar', price: 180, type: 'BODY', mascot: 'BOTH', icon: '🧣' },
  { id: 'acc_bib_ebert', name: 'Babero', price: 90, type: 'BODY', mascot: 'EBERT', icon: '🍼' },
  { id: 'acc_backpack', name: 'Mochila Totto', price: 350, type: 'BODY', mascot: 'ANGEL', icon: '🎒' },
  { id: 'acc_cape', name: 'Capa Héroe', price: 400, type: 'BODY', mascot: 'BOTH', icon: '🦸' },
  { id: 'acc_medal', name: 'Medalla Honor', price: 250, type: 'BODY', mascot: 'BOTH', icon: '🥇' },

  // HAND (Items held) - Sits in front of everything
  { id: 'acc_brush_ebert', name: 'Pincel Artista', price: 120, type: 'HAND', mascot: 'EBERT', icon: '🖌️' },
  { id: 'acc_guitar', name: 'Guitarra', price: 600, type: 'HAND', mascot: 'ANGEL', icon: '🎸' },
  { id: 'acc_lollipop', name: 'Paleta', price: 50, type: 'HAND', mascot: 'BOTH', icon: '🍭' },
  { id: 'acc_pencil', name: 'Lápiz Gigante', price: 80, type: 'HAND', mascot: 'ANGEL', icon: '✏️' },
  { id: 'acc_book', name: 'Libro', price: 100, type: 'HAND', mascot: 'BOTH', icon: '📖' },
  { id: 'acc_flag', name: 'Bandera RD', price: 150, type: 'HAND', mascot: 'BOTH', icon: '🇩🇴' },
];

export const CATEGORY_HIERARCHY: Record<string, string[]> = {
  'Escolar': ['Cuadernos', 'Escritura', 'Mochilas', 'Geometría', 'Arte'],
  'Oficina': ['Papel', 'Organización', 'Calculadoras', 'Mobiliario', 'Archivadores'],
  'Tecnología': ['Accesorios', 'Audio', 'Cables', 'Impresoras'],
  'Servicios': ['Impresiones', 'Plastificación', 'Encuadernación']
};

export const CATEGORY_ICONS: Record<string, string> = {
  'Escolar': 'fa-graduation-cap',
  'Oficina': 'fa-briefcase',
  'Tecnología': 'fa-laptop',
  'Servicios': 'fa-print'
};

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Resma de Papel 8.5x11', price: 350, category: 'Oficina', subCategory: 'Papel', brand: 'Chamex', image: 'https://m.media-amazon.com/images/I/61S9Wc-M2+L.jpg', description: 'Papel bond blanco, 500 hojas, 20lb. El estándar.', stock: 100 },
  { id: '2', name: 'Folder 8.5x11 Manila (Caja)', price: 450, category: 'Oficina', subCategory: 'Archivadores', brand: 'Generico', image: 'https://m.media-amazon.com/images/I/71wLpWv-ZAL._AC_SL1500_.jpg', description: 'Caja de 100 folders color manila tamaño carta.', stock: 30 },
  { id: '4', name: 'Grapadora Metálica', price: 350, category: 'Oficina', subCategory: 'Organización', brand: 'Bostitch', image: 'https://m.media-amazon.com/images/I/61u+yJjKxWL._AC_SL1500_.jpg', description: 'Grapadora resistente para oficina.', stock: 15 },
  { id: '6', name: 'Calculadora de Mesa', price: 850, category: 'Oficina', subCategory: 'Calculadoras', brand: 'Casio', image: 'https://m.media-amazon.com/images/I/71tQYx3fXAL._AC_SL1500_.jpg', description: 'Pantalla grande 12 dígitos.', stock: 25 },
  { id: '8', name: 'Cuaderno 200 Páginas', price: 125, category: 'Escolar', subCategory: 'Cuadernos', brand: 'Norma', image: 'https://m.media-amazon.com/images/I/71j1+t+M6AL._AC_SL1500_.jpg', description: 'Cuaderno cosido resistente.', stock: 200 },
  { id: '9', name: 'Caja Lápices Mongul', price: 150, category: 'Escolar', subCategory: 'Escritura', brand: 'Mongol', image: 'https://m.media-amazon.com/images/I/71r+h+i+2WL._AC_SL1500_.jpg', description: 'Caja de 12 lápices #2.', stock: 100 },
  { id: '10', name: 'Juego de Geometría', price: 85, category: 'Escolar', subCategory: 'Geometría', brand: 'Maped', image: 'https://m.media-amazon.com/images/I/81+2+q+3+mL._AC_SL1500_.jpg', description: 'Regla, escuadra y transportador.', stock: 50 },
  { id: '12', name: 'Mochila Totto', price: 2500, category: 'Escolar', subCategory: 'Mochilas', brand: 'Totto', image: 'https://m.media-amazon.com/images/I/91t+q+4+mL._AC_SL1500_.jpg', description: 'Mochila resistente con garantía.', stock: 10 },
  { id: '13', name: 'Caja Colores 12u', price: 200, category: 'Escolar', subCategory: 'Arte', brand: 'Crayola', image: 'https://m.media-amazon.com/images/I/81t+q+5+mL._AC_SL1500_.jpg', description: 'Colores vibrantes no tóxicos.', stock: 40 },
  { id: '14', name: 'Memoria USB 32GB', price: 450, category: 'Tecnología', subCategory: 'Accesorios', brand: 'Kingston', image: 'https://m.media-amazon.com/images/I/61t+q+6+mL._AC_SL1500_.jpg', description: 'Almacenamiento rápido.', stock: 25 },
  { id: '15', name: 'Mouse Inalámbrico', price: 350, category: 'Tecnología', subCategory: 'Accesorios', brand: 'Logitech', image: 'https://m.media-amazon.com/images/I/61t+q+7+mL._AC_SL1500_.jpg', description: 'Batería de larga duración.', stock: 15 }
];

const AUDIO_CONTEXT = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;

export const resumeAudioContext = () => {
  if (AUDIO_CONTEXT && AUDIO_CONTEXT.state === 'suspended') {
    AUDIO_CONTEXT.resume().catch(e => console.log("Audio interaction required"));
  }
};

export const playSound = (type: string) => {
  if (!AUDIO_CONTEXT || AUDIO_CONTEXT.state === 'suspended') return;
  const now = AUDIO_CONTEXT.currentTime;
  const osc = AUDIO_CONTEXT.createOscillator();
  const gain = AUDIO_CONTEXT.createGain();
  
  osc.connect(gain);
  gain.connect(AUDIO_CONTEXT.destination);
  
  if (type === 'POP') {
    osc.frequency.setValueAtTime(400, now);
    gain.gain.setValueAtTime(0.1, now);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'SUCCESS') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.setValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
  } else if (type === 'ERROR') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, now);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
  } else if (type === 'EBERT_TALK') {
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.linearRampToValueAtTime(800, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      osc.start(now);
      osc.stop(now + 0.1);
  } else if (type === 'ANGEL_TALK') {
      osc.frequency.setValueAtTime(400, now);
      osc.frequency.linearRampToValueAtTime(500, now + 0.1);
      gain.gain.setValueAtTime(0.1, now);
      osc.start(now);
      osc.stop(now + 0.1);
  } else {
      osc.frequency.setValueAtTime(300, now);
      gain.gain.setValueAtTime(0.05, now);
      osc.start(now);
      osc.stop(now + 0.05);
  }
};

export const getProducts = (): Product[] => {
  const stored = localStorage.getItem(PRODUCTS_KEY);
  return stored ? JSON.parse(stored) : INITIAL_PRODUCTS;
};

export const addProduct = (product: Product) => {
  const products = getProducts();
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify([...products, product]));
};

export const updateProduct = (product: Product) => {
    const products = getProducts().map(p => p.id === product.id ? product : p);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const deleteProduct = (id: string) => {
    const products = getProducts().filter(p => p.id !== id);
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
};

export const getDiscoveryFeed = (): Product[] => {
    const products = getProducts();
    return products.sort(() => 0.5 - Math.random());
};

// USER PROFILE & GAMIFICATION
export const getUserProfile = (): UserProfile | null => {
    const stored = localStorage.getItem(USER_PROFILE_KEY);
    return stored ? JSON.parse(stored) : null;
};

export const saveUserProfile = (profile: UserProfile) => {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
};

export const getNextLevelThreshold = (level: UserLevel): number => {
    switch(level) {
        case 'Novato': return 100;
        case 'Explorador': return 500;
        case 'Super Fan': return 1500;
        case 'Leyenda': return 5000;
        default: return 100;
    }
};

export const getProfileStats = (profile: UserProfile) => {
    const points = profile.points;
    let level: UserLevel = 'Novato';
    if(points >= 5000) level = 'Leyenda';
    else if(points >= 1500) level = 'Super Fan';
    else if(points >= 500) level = 'Explorador';
    
    if(level !== profile.level) {
        profile.level = level;
        saveUserProfile(profile);
    }

    return [
        { label: 'Puntos XP', value: profile.points },
        { label: 'Racha', value: `${profile.streak}🔥` },
        { label: 'Nivel', value: level }
    ];
};

export const equipAccessory = (mascot: 'ANGEL' | 'EBERT', accessoryId: string): UserProfile | null => {
    const profile = getUserProfile();
    if (!profile) return null;

    if (!profile.equipped) profile.equipped = { angel: {}, ebert: {} };
    // Ensure we are working with object
    if (typeof profile.equipped.angel !== 'object') profile.equipped.angel = {};
    if (typeof profile.equipped.ebert !== 'object') profile.equipped.ebert = {};

    const target = mascot === 'ANGEL' ? 'angel' : 'ebert';
    const itemDef = MASCOT_ACCESSORIES.find(a => a.id === accessoryId);
    if(!itemDef) return null;

    const slot = itemDef.type;
    const currentInSlot = profile.equipped[target][slot];

    // Toggle: If wearing this specific item, remove it. Otherwise, put it on.
    if (currentInSlot === accessoryId) {
        delete profile.equipped[target][slot];
    } else {
        profile.equipped[target][slot] = accessoryId;
    }

    saveUserProfile(profile);
    return profile;
};

export const buyAccessory = (accessoryId: string) => {
    return true; 
};

export const getDailyQuests = (): DailyQuest[] => {
    return [
        { id: 'q1', label: 'Visita la tienda', targetAction: 'VIEW_PRODUCT', pointsReward: 10, completed: true },
        { id: 'q2', label: 'Habla con Angel', targetAction: 'CHAT_MASCOT', pointsReward: 15, completed: false },
        { id: 'q3', label: 'Busca una oferta', targetAction: 'ADD_CART', pointsReward: 20, completed: false }
    ];
};

export const completeQuest = (action: string) => {
    const profile = getUserProfile();
    if(profile) {
        profile.points += 15; 
        saveUserProfile(profile);
    }
    return getDailyQuests(); 
};

export const trackUserInterest = (category: string) => {
    console.log("User interested in:", category);
};

export const checkDailyReward = () => {
    const profile = getUserProfile();
    if (!profile) return { claimed: false, reward: 0 };
    
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastDailyReward !== today) {
        profile.lastDailyReward = today;
        profile.points += 50;
        profile.streak += 1;
        saveUserProfile(profile);
        return { claimed: true, reward: 50 };
    }
    return { claimed: false, reward: 0 };
};

// HELPERS
export const generateWhatsAppLink = (name: string, method: string, cart: any[]) => {
    const phone = '18290000000'; 
    let text = `Hola, soy *${name}*. Quisiera ordenar:\n\n`;
    cart.forEach(item => {
        text += `- ${item.quantity}x ${item.name}\n`;
    });
    const total = cart.reduce((acc, item) => acc + (item.discountPrice || item.price) * item.quantity, 0);
    text += `\n*Total Estimado: RD$${total.toLocaleString()}*`;
    text += `\n\nMétodo: ${method === 'URBAN' ? 'Delivery 🛵' : 'Recoger 🏪'}`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
};

export const trackUserVisits = () => {
    const stored = localStorage.getItem(STATS_KEY);
    const stats: UserStats = stored ? JSON.parse(stored) : { totalVisits: 0, monthlyVisits: 0, annualVisits: 0, lastVisitDate: 0, lastMonthStr: '', lastYearStr: '' };
    
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const monthStr = `${now.getFullYear()}-${now.getMonth()}`;
    const yearStr = `${now.getFullYear()}`;

    if (new Date(stats.lastVisitDate).toISOString().split('T')[0] !== todayStr) {
        stats.totalVisits++;
        
        if (stats.lastMonthStr !== monthStr) { stats.monthlyVisits = 1; stats.lastMonthStr = monthStr; } 
        else { stats.monthlyVisits++; }

        if (stats.lastYearStr !== yearStr) { stats.annualVisits = 1; stats.lastYearStr = yearStr; } 
        else { stats.annualVisits++; }
        
        stats.lastVisitDate = Date.now();
        localStorage.setItem(STATS_KEY, JSON.stringify(stats));
        return { stats, message: '¡Qué bueno verte de nuevo!' };
    }
    return { stats, message: undefined };
};

export const getNotifications = (): AppNotification[] => {
    const s = localStorage.getItem(NOTIFICATIONS_KEY);
    return s ? JSON.parse(s) : [];
};
export const addNotification = (n: AppNotification) => {
    const list = getNotifications();
    const updated = [n, ...list];
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));
    return updated;
};
export const markNotificationsRead = () => {
    const list = getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    return list;
};
export const deleteNotification = (id: string) => {
    const list = getNotifications().filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(list));
    return list;
};

export const getOffers = (): ExpressOffer[] => { const s = localStorage.getItem(OFFERS_KEY); return s ? JSON.parse(s) : []; };
export const saveOffers = (o: ExpressOffer[]) => localStorage.setItem(OFFERS_KEY, JSON.stringify(o));

export const getOrders = (): Order[] => { const s = localStorage.getItem(ORDERS_KEY); return s ? JSON.parse(s) : []; };
export const saveOrder = (o: Order) => { const list = [o, ...getOrders()]; localStorage.setItem(ORDERS_KEY, JSON.stringify(list)); };
export const updateOrderStatus = (id: string, status: OrderStatus) => {
    const orders = getOrders().map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
};
export const deleteOrder = (id: string) => {
    const orders = getOrders().filter(o => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    return orders;
};

export const getOpeningHours = (): OpeningHours => {
    const s = localStorage.getItem(HOURS_KEY);
    return s ? JSON.parse(s) : { weekdays: {open:'08:00', close:'18:00'}, saturday: {open:'09:00', close:'13:00'}, sunday: {open:'Cerrado', close:'Cerrado'} };
};
export const saveOpeningHours = (h: OpeningHours) => localStorage.setItem(HOURS_KEY, JSON.stringify(h));

export const getMascotConfig = (): MascotConfig => {
    const s = localStorage.getItem(MASCOT_CONFIG_KEY);
    return s ? JSON.parse(s) : { angelPrompt: '', ebertPrompt: '', angelOutfit: 'CASUAL', ebertOutfit: 'CASUAL' };
};
export const saveMascotConfig = (c: MascotConfig) => localStorage.setItem(MASCOT_CONFIG_KEY, JSON.stringify(c));

export const getChatHistory = (): ChatMessage[] => { const s = localStorage.getItem(CHAT_HISTORY_KEY); return s ? JSON.parse(s) : []; };
export const saveChatHistory = (h: ChatMessage[]) => localStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(h));

export const isMascotTired = () => {
    const usage = getApiUsage();
    return usage.count >= usage.limit;
};
export const getApiUsage = (): ApiUsage => {
    const s = localStorage.getItem(API_USAGE_KEY);
    const today = new Date().toISOString().split('T')[0];
    const defaultUsage = { date: today, count: 0, limit: 100 };
    if (!s) return defaultUsage;
    const data = JSON.parse(s);
    if (data.date !== today) return defaultUsage;
    return data;
};
export const trackApiCall = () => {
    const usage = getApiUsage();
    usage.count++;
    localStorage.setItem(API_USAGE_KEY, JSON.stringify(usage));
};

export const getCommunityPosts = (): CommunityPost[] => { const s = localStorage.getItem(COMMUNITY_POSTS_KEY); return s ? JSON.parse(s) : []; };
export const saveCommunityPost = (p: CommunityPost) => { const l = [p, ...getCommunityPosts()]; localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(l)); };
export const likeCommunityPost = (id: string) => {
    const posts = getCommunityPosts().map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p);
    localStorage.setItem(COMMUNITY_POSTS_KEY, JSON.stringify(posts));
    return posts;
};
export const getSuggestions = (): Suggestion[] => { const s = localStorage.getItem(SUGGESTIONS_KEY); return s ? JSON.parse(s) : []; };
export const saveSuggestion = (s: Suggestion) => { const l = [s, ...getSuggestions()]; localStorage.setItem(SUGGESTIONS_KEY, JSON.stringify(l)); };

export const getBundles = (): ComboBundle[] => { const s = localStorage.getItem(BUNDLES_KEY); return s ? JSON.parse(s) : []; };
export const saveBundle = (b: ComboBundle) => { const l = [...getBundles(), b]; localStorage.setItem(BUNDLES_KEY, JSON.stringify(l)); };
export const deleteBundle = (id: string) => { const l = getBundles().filter(b => b.id !== id); localStorage.setItem(BUNDLES_KEY, JSON.stringify(l)); };

export const getFlashStories = (): StoryOffer[] => { const s = localStorage.getItem(STORIES_KEY); return s ? JSON.parse(s) : []; };
export const saveFlashStory = (st: StoryOffer) => { const l = [st, ...getFlashStories()]; localStorage.setItem(STORIES_KEY, JSON.stringify(l)); };
export const markStorySeen = (id: string) => {
    const l = getFlashStories().map(s => s.id === id ? { ...s, seen: true } : s);
    localStorage.setItem(STORIES_KEY, JSON.stringify(l));
};

export const toggleWishlist = (id: string) => {
    const p = getUserProfile();
    if (p) {
        if (p.wishlist.includes(id)) p.wishlist = p.wishlist.filter(i => i !== id);
        else p.wishlist.push(id);
        saveUserProfile(p);
    }
};

export const getSpecialRequests = (): SpecialRequest[] => { const s = localStorage.getItem(SPECIAL_REQUESTS_KEY); return s ? JSON.parse(s) : []; };
export const saveSpecialRequest = (r: SpecialRequest) => { const l = [r, ...getSpecialRequests()]; localStorage.setItem(SPECIAL_REQUESTS_KEY, JSON.stringify(l)); };

export const getDebtors = (): Debtor[] => { const s = localStorage.getItem(DEBTORS_KEY); return s ? JSON.parse(s) : []; };
export const saveDebtor = (d: Debtor) => { const l = [d, ...getDebtors()]; localStorage.setItem(DEBTORS_KEY, JSON.stringify(l)); };
export const payDebt = (id: string) => { const l = getDebtors().map(d => d.id === id ? { ...d, isPaid: true } : d); localStorage.setItem(DEBTORS_KEY, JSON.stringify(l)); return l; };

export const getExpenses = (): Expense[] => { const s = localStorage.getItem(EXPENSES_KEY); return s ? JSON.parse(s) : []; };
export const saveExpense = (e: Expense) => { const l = [e, ...getExpenses()]; localStorage.setItem(EXPENSES_KEY, JSON.stringify(l)); return l; };

export const getStickyNotes = (): StickyNote[] => { const s = localStorage.getItem(NOTES_KEY); return s ? JSON.parse(s) : []; };
export const saveStickyNote = (n: StickyNote) => { const l = [n, ...getStickyNotes()]; localStorage.setItem(NOTES_KEY, JSON.stringify(l)); return l; };
export const deleteStickyNote = (id: string) => { const l = getStickyNotes().filter(n => n.id !== id); localStorage.setItem(NOTES_KEY, JSON.stringify(l)); return l; };

export const getAnalyticsSummary = () => {
    const orders = getOrders();
    const totalRevenue = orders.filter(o => o.status === 'COMPLETED').reduce((acc, o) => acc + o.total, 0);
    return { totalRevenue, totalOrders: orders.length };
};
export const getTopClients = () => {
    const orders = getOrders().filter(o => o.status === 'COMPLETED');
    const map: Record<string, {total:number, count:number}> = {};
    orders.forEach(o => {
        if(!map[o.clientName]) map[o.clientName] = {total:0, count:0};
        map[o.clientName].total += o.total;
        map[o.clientName].count += 1;
    });
    return Object.entries(map).map(([name, data]) => ({ name, ...data })).sort((a,b) => b.total - a.total).slice(0,5);
};
export const exportData = () => {
    const data = {
        products: getProducts(),
        orders: getOrders(),
        expenses: getExpenses(),
        debtors: getDebtors()
    };
    const blob = new Blob([JSON.stringify(data)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sudomsur_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
};
export const importData = async (file: File) => {
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        if(data.products) localStorage.setItem(PRODUCTS_KEY, JSON.stringify(data.products));
        if(data.orders) localStorage.setItem(ORDERS_KEY, JSON.stringify(data.orders));
        if(data.expenses) localStorage.setItem(EXPENSES_KEY, JSON.stringify(data.expenses));
        if(data.debtors) localStorage.setItem(DEBTORS_KEY, JSON.stringify(data.debtors));
        return true;
    } catch(e) { return false; }
};
export const getAllKnownUsers = (): string[] => {
    const orders = getOrders();
    const names = new Set<string>();
    orders.forEach(o => names.add(o.clientName));
    return Array.from(names);
};
export const toggleUserBlock = (name: string) => {
    const blocked = isUserBlocked(name);
    let list = JSON.parse(localStorage.getItem(BLOCKED_USERS_KEY) || '[]');
    if(blocked) list = list.filter((u: string) => u !== name);
    else list.push(name);
    localStorage.setItem(BLOCKED_USERS_KEY, JSON.stringify(list));
};
export const isUserBlocked = (name: string) => {
    const list = JSON.parse(localStorage.getItem(BLOCKED_USERS_KEY) || '[]');
    return list.includes(name);
};
export const broadcastNotification = (title: string, message: string, scheduledDate?: string) => {
    addNotification({
        id: Date.now().toString(),
        title,
        message,
        type: 'SYSTEM',
        read: false,
        timestamp: Date.now(),
        scheduledDate
    });
};

export const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
};
export const checkProximity = (lat: number, lng: number) => {
    const dist = calculateDistance(lat, lng, STORE_COORDS.lat, STORE_COORDS.lng);
    return dist < 0.5; 
};