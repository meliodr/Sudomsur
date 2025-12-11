

export type ThemeType = 'DEFAULT' | 'VALENTINES' | 'PATRIO' | 'SCHOOL' | 'CHRISTMAS';

export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    surface: string;
  };
  pattern: string;
  icons: {
    logo: string;
    cart: string;
    hero: string;
    search: string;
  };
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;     // Main Section (e.g., Escolar)
  subCategory: string;  // Subsection (e.g., Cuadernos)
  brand: string;        // Brand (e.g., Totto, Norma)
  image: string;
  description: string;
  stock?: number;       // Inventory count
}

export interface CartItem extends Product {
  quantity: number;
  discountPrice?: number; // Calculated price if offer is active
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  date: number;
  clientName: string;
  items: CartItem[];
  total: number;
  deliveryMethod: 'URBAN' | 'RURAL';
  status: OrderStatus;
  pickupTime?: string; // New: Time string HH:MM
  distanceKm?: number; // New: User distance from store
  locationLink?: string; // New: Google Maps link
}

export interface SpecialRequest {
  id: string;
  clientName: string;
  itemName: string;
  description: string;
  date: number;
  status: 'PENDING' | 'FOUND' | 'UNAVAILABLE';
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'OFFER' | 'INFO' | 'SYSTEM' | 'EVENT';
  read: boolean;
  timestamp: number;
  scheduledDate?: string; // ISO Date for future notifications
  imageUrl?: string; // For Event Popups
}

export interface ExpressOffer {
  id: string;
  productId: string;
  discountPercent: number;
  durationMinutes: number;
  endTime: number;
  active: boolean;
}

export interface SalesData {
  weeklySales: number;
  topProduct: string;
  lowStockItems: string[];
}

export interface UserStats {
  totalVisits: number;
  monthlyVisits: number;
  annualVisits: number;
  lastVisitDate: number; // Timestamp
  lastMonthStr: string;  // "2023-10" to check reset
  lastYearStr: string;   // "2023" to check reset
}

export interface OpeningHours {
  weekdays: { open: string; close: string };
  saturday: { open: string; close: string };
  sunday: { open: string; close: string };
}

// --- MASCOT TYPES ---
export type MascotType = 'EBERT' | 'ANGEL';
export type MascotOutfit = 'CASUAL' | 'FORMAL' | 'PJ';
// Added COOL, DANCE, SHOCKED, ANGRY for Easter Eggs
export type MascotState = 'IDLE' | 'TALKING' | 'HAPPY' | 'THINKING' | 'CELEBRATE' | 'SURPRISED' | 'WINK' | 'CONFUSED' | 'SAD' | 'LOVE' | 'LAUGH' | 'SLEEP' | 'COOL' | 'DANCE' | 'SHOCKED' | 'ANGRY';

export interface ChatMessage {
  id: string;
  sender: 'USER' | MascotType;
  text: string;
  timestamp: number;
}

export interface MascotConfig {
  angelPrompt: string;
  ebertPrompt: string;
  angelOutfit: MascotOutfit;
  ebertOutfit: MascotOutfit;
}

export interface ApiUsage {
  date: string; // YYYY-MM-DD
  count: number;
  limit: number;
}

// --- SOCIAL & PROFILE TYPES ---
export type UserLevel = 'Novato' | 'Explorador' | 'Super Fan' | 'Leyenda';
export type UserRole = 'ESTUDIANTE' | 'PROFESOR' | 'DIRECTOR' | 'PADRE' | 'EMPRESA';
export type AccessorySlot = 'HEAD' | 'FACE' | 'BODY' | 'HAND';

export interface Accessory {
  id: string;
  name: string;
  price: number; // in Points
  type: AccessorySlot;
  mascot: 'ANGEL' | 'EBERT' | 'BOTH';
  icon: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role?: UserRole; // New Role
  grade: string; // e.g., "5to Grado"
  avatarId: number; // Index of avatar
  favoriteColor: string;
  createdAt: number;
  points: number;
  level: UserLevel;
  badges: string[];
  wishlist: string[]; // Array of Product IDs
  redeemedRewards?: string[]; // IDs of redeemed rewards
  orderHistory?: string[]; // IDs of orders placed by user
  lastDailyReward?: string; // ISO Date of last daily login reward
  
  // New Gamification
  streak: number; // Current daily streak
  inventory: string[]; // Owned Accessory IDs
  // Updated for Multi-Slot Equipment
  equipped: {
    angel: Partial<Record<AccessorySlot, string>>; // Slot -> AccessoryID
    ebert: Partial<Record<AccessorySlot, string>>; // Slot -> AccessoryID
  };
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  type: 'COUPON' | 'WALLPAPER';
  value: string; // Discount % or Image URL
  description: string;
  icon: string;
}

export interface DailyQuest {
  id: string;
  label: string;
  targetAction: 'VIEW_PRODUCT' | 'ADD_CART' | 'CHAT_MASCOT' | 'FIND_HIDDEN';
  pointsReward: number;
  completed: boolean;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorGrade: string;
  imageUrl: string; // Base64 or URL
  description: string;
  likes: number;
  timestamp: number;
}

export interface Suggestion {
  id: string;
  authorName: string;
  text: string;
  date: number;
  read: boolean;
}

// --- NEW ENGAGEMENT TYPES ---

export interface ComboBundle {
  id: string;
  title: string;
  productIds: string[];
  discountPercent: number;
  description: string;
  image?: string;
}

export interface StoryOffer {
  id: string;
  title: string;
  subtitle: string;
  color: string; // Gradient start
  expiresAt: number;
  seen: boolean;
}

// --- MOM'S TOOLKIT TYPES ---
export interface Debtor {
  id: string;
  name: string;
  amount: number;
  reason: string;
  date: number;
  phone?: string;
  isPaid: boolean;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: number;
  category: 'FOOD' | 'TRANSPORT' | 'SUPPLIES' | 'OTHER';
}

export interface StickyNote {
  id: string;
  text: string;
  color: string; // Hex color for background
}