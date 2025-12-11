
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Product, CartItem, ThemeType, ThemeConfig, ExpressOffer, MascotType, ChatMessage, UserStats, OpeningHours, UserProfile, CommunityPost, DailyQuest, ComboBundle, StoryOffer, Accessory, MascotOutfit, Order, OrderStatus, UserRole, MascotState } from '../types';
import { getDiscoveryFeed, generateWhatsAppLink, saveChatHistory, getChatHistory, getUserProfile, saveUserProfile, getCommunityPosts, getDailyQuests, completeQuest, getBundles, getFlashStories, markStorySeen, toggleWishlist, playSound, CATEGORY_HIERARCHY, CATEGORY_ICONS, MASCOT_ACCESSORIES, buyAccessory, equipAccessory, getOrders, getMascotConfig, isMascotTired, saveOrder, calculateDistance, STORE_COORDS, checkProximity, addNotification, saveSpecialRequest, checkDailyReward, resumeAudioContext, saveSuggestion, saveCommunityPost, likeCommunityPost, trackUserInterest, getNextLevelThreshold, getProfileStats } from '../services/storeService';
import { chatWithMascot, analyzeSchoolList } from '../services/geminiService';

interface Props {
  products: Product[];
  addToCart: (p: Product) => void;
  cart: CartItem[];
  setCart: (c: CartItem[]) => void;
  removeFromCart: (id: string) => void;
  theme: ThemeType;
  themeConfig: ThemeConfig;
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  offers: ExpressOffer[];
  welcomeMessage?: string;
  userStats: UserStats | null;
  isProfileOpen: boolean;
  setIsProfileOpen: (v: boolean) => void;
  onLogout: () => void;
  openingHours: OpeningHours;
  currentTab: 'SHOP' | 'DISCOVERY' | 'PETS';
  setTab: (t: 'SHOP' | 'DISCOVERY' | 'PETS') => void;
  updateCartQuantity: (id: string, delta: number) => void;
}

const useMousePosition = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = (ev: MouseEvent) => {
      const x = (ev.clientX / window.innerWidth) * 2 - 1;
      const y = (ev.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);
  return mousePosition;
};

const useProximityAlert = () => {
    useEffect(() => {
        if (!navigator.geolocation) return;
        const check = () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    if (checkProximity(pos.coords.latitude, pos.coords.longitude)) {
                        addNotification({ id: Date.now().toString(), title: '¡Estás cerca!', message: 'Pasa por Sudomsur, tenemos ofertas nuevas esperándote.', type: 'EVENT', read: false, timestamp: Date.now() });
                        playSound('POP');
                    }
                },
                (err) => console.log('Location access denied or error'),
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
            );
        };
        check();
        const interval = setInterval(check, 300000); 
        return () => clearInterval(interval);
    }, []);
};

const DailyRewardModal = ({ points, onClose }: { points: number, onClose: () => void }) => (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-pop-in" onClick={onClose}>
        <div className="bg-white rounded-[32px] p-8 max-w-sm w-full text-center relative overflow-hidden shadow-2xl m-4 border-2 border-[#002D62]" onClick={e => e.stopPropagation()}>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 to-orange-500"></div>
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-5xl animate-bounce-short shadow-inner">🏆</div>
            <h2 className="text-2xl font-black text-[#002D62] mb-2 tracking-tight">¡Bono Diario!</h2>
            <p className="text-slate-500 font-bold text-sm mb-6">Por visitarnos hoy, has ganado:</p>
            <div className="text-5xl font-black text-orange-500 mb-8 drop-shadow-sm">+{points} Pts</div>
            <button onClick={onClose} className="w-full bg-[#002D62] text-white py-4 rounded-xl font-bold shadow-lg hover:bg-blue-800 transition-transform active:scale-95 text-lg">¡Genial!</button>
        </div>
    </div>
);

const ServicesModal = ({ onClose }: { onClose: () => void }) => {
    const services = [
        { name: 'Impresión B/N', price: 'RD$5', icon: 'fa-print', color: 'bg-slate-100 text-slate-700' },
        { name: 'Impresión Color', price: 'RD$15', icon: 'fa-palette', color: 'bg-pink-100 text-pink-600' },
        { name: 'Fotocopias', price: 'RD$2', icon: 'fa-copy', color: 'bg-blue-100 text-blue-600' },
        { name: 'Plastificación', price: 'RD$50+', icon: 'fa-id-card', color: 'bg-green-100 text-green-600' },
        { name: 'Encuadernación', price: 'RD$100+', icon: 'fa-book', color: 'bg-orange-100 text-orange-600' },
        { name: 'Digitación', price: 'RD$50/pág', icon: 'fa-keyboard', color: 'bg-purple-100 text-purple-600' }
    ];
    const contactWhatsApp = () => { window.open('https://wa.me/18290000000?text=Hola,%20me%20interesa%20cotizar%20un%20servicio%20de...'); };
    
    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in p-4" onClick={onClose}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="bg-[#002D62] p-6 text-white text-center relative">
                    <button onClick={onClose} className="absolute top-4 right-4 text-white/70 hover:text-white"><i className="fa-solid fa-times text-xl"></i></button>
                    <i className="fa-solid fa-briefcase text-4xl mb-2"></i>
                    <h2 className="text-xl font-bold">Servicios Profesionales</h2>
                </div>
                <div className="p-4 grid grid-cols-2 gap-3">
                    {services.map((s, i) => (
                        <div key={i} className={`p-3 rounded-xl border border-slate-100 flex flex-col items-center text-center gap-2 ${s.color} bg-opacity-20`}>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.color} bg-opacity-100 text-white`}><i className={`fa-solid ${s.icon}`}></i></div>
                            <div><div className="font-bold text-xs text-slate-800">{s.name}</div><div className="text-[10px] font-bold opacity-70">{s.price}</div></div>
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={contactWhatsApp} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600"><i className="fa-brands fa-whatsapp text-lg"></i> Cotizar por WhatsApp</button>
                </div>
            </div>
        </div>
    );
};

// MASCOT AVATAR ENGINE
const MascotAvatar = ({ type, state, outfit, accessories = {}, scale = 1, isSpeaking = false }: { type: MascotType, state: MascotState, outfit: MascotOutfit, accessories?: Record<string, string>, scale?: number, isSpeaking?: boolean }) => {
    const { x, y } = useMousePosition();
    const eyeOffsetX = x * 2;
    const eyeOffsetY = y * 2;
    
    // Dynamic Mouth Logic
    let mouthPath = "M40,65 Q50,70 60,65"; // Default smile
    let tongue = false;
    
    if (isSpeaking) {
        mouthPath = "M40,65 Q50,75 60,65 Q50,55 40,65"; // Talking oval
    } else if (state === 'HAPPY' || state === 'LAUGH') {
        mouthPath = "M35,60 Q50,80 65,60 Z"; // Open happy D shape
        tongue = true;
    } else if (state === 'SURPRISED' || state === 'SHOCKED') {
        mouthPath = "M45,60 A5,8 0 1,1 55,60 A5,8 0 1,1 45,60"; // O shape
    } else if (state === 'SAD' || state === 'CONFUSED') {
        mouthPath = "M40,70 Q50,60 60,70"; // Frown
    }

    // Dynamic Eyebrows Logic
    let browLeft = "M35,45 Q40,40 45,45"; 
    let browRight = "M55,45 Q60,40 65,45";
    
    if (state === 'ANGRY') {
        browLeft = "M35,40 Q40,45 45,50"; 
        browRight = "M55,50 Q60,45 65,40";
    } else if (state === 'SAD') {
        browLeft = "M35,45 Q40,40 45,42";
        browRight = "M55,42 Q60,40 65,45";
    } else if (state === 'SURPRISED') {
        browLeft = "M35,35 Q40,30 45,35";
        browRight = "M55,35 Q60,30 65,35";
    }

    // Accessory Rendering Helper
    const renderAccessory = (accId: string, layer: 'BACK' | 'BODY' | 'HEAD' | 'FACE' | 'HAND') => {
        const item = MASCOT_ACCESSORIES.find(a => a.id === accId);
        if(!item) return null;
        
        // Manual SVG definitions for accessories
        switch(item.id) {
            // HEAD
            case 'acc_cap_angel': return <g transform="translate(0,-5)"><path d="M30,35 Q50,20 70,35 L80,35 L70,40 L30,40 Z" fill="#002D62" /><circle cx="50" cy="25" r="3" fill="#CE1126"/></g>;
            case 'acc_crown': return <g transform="translate(0,-15)"><path d="M30,40 L30,20 L40,30 L50,15 L60,30 L70,20 L70,40 Z" fill="#FFD700" stroke="#B8860B" strokeWidth="2"/></g>;
            case 'acc_headphones': return <g><path d="M25,50 C25,20 75,20 75,50" fill="none" stroke="#333" strokeWidth="4"/><rect x="20" y="45" width="10" height="15" rx="2" fill="#333"/><rect x="70" y="45" width="10" height="15" rx="2" fill="#333"/></g>;
            case 'acc_flower': return <g transform="translate(65, 30)"><circle cx="0" cy="0" r="5" fill="yellow"/><circle cx="0" cy="-5" r="3" fill="pink"/><circle cx="5" cy="0" r="3" fill="pink"/><circle cx="0" cy="5" r="3" fill="pink"/><circle cx="-5" cy="0" r="3" fill="pink"/></g>;
            
            // FACE
            case 'acc_glasses_angel': return <g transform="translate(0, 3)"><circle cx="40" cy="52" r="8" fill="rgba(0,0,0,0.5)" stroke="black" strokeWidth="2"/><circle cx="60" cy="52" r="8" fill="rgba(0,0,0,0.5)" stroke="black" strokeWidth="2"/><line x1="48" y1="52" x2="52" y2="52" stroke="black" strokeWidth="2"/></g>;
            case 'acc_mustache': return <path d="M40,62 Q50,55 60,62 Q50,65 40,62" fill="#333" transform="translate(0, 3)"/>;
            case 'acc_pacifier_ebert': return <g transform="translate(0, 5)"><circle cx="50" cy="65" r="6" fill="#FFD700" stroke="#DAA520"/><circle cx="50" cy="65" r="2" fill="white"/></g>;
            
            // BODY (Backpacks go to back layer usually, but straps front)
            case 'acc_backpack': return layer === 'BACK' ? <rect x="25" y="40" width="50" height="60" rx="10" fill="#CE1126"/> : <path d="M35,80 L35,110 M65,80 L65,110" stroke="#8B0000" strokeWidth="4"/>;
            case 'acc_cape': return layer === 'BACK' ? <path d="M30,80 L20,130 L80,130 L70,80 Z" fill="#CE1126"/> : null;
            case 'acc_bowtie_angel': return <path d="M45,80 L35,75 L35,85 L45,80 L55,75 L55,85 L45,80" fill="red" />;
            
            // HAND
            case 'acc_guitar': return <g transform="translate(10, 90) rotate(-45)"><rect x="0" y="0" width="15" height="40" fill="brown"/><circle cx="7" cy="35" r="12" fill="orange"/></g>;
            case 'acc_lollipop': return <g transform="translate(75, 90)"><line x1="0" y1="0" x2="0" y2="20" stroke="white" strokeWidth="2"/><circle cx="0" cy="0" r="8" fill="pink"/><path d="M-5,-5 L5,5" stroke="red" strokeWidth="1"/></g>;
            
            default: return null;
        }
    };

    if (type === 'EBERT') {
        // EBERT: TODDLER (Pear shape body, Curly Cloud Hair)
        return (
            <svg width={120 * scale} height={150 * scale} viewBox="0 0 100 130" className="drop-shadow-xl transition-transform duration-300">
                {/* LAYER 0: BACK */}
                {Object.values(accessories).map(id => renderAccessory(id, 'BACK'))}
                
                {/* LAYER 1: BODY (Pear Shape) */}
                <path d="M30,80 Q25,120 35,125 L65,125 Q75,120 70,80" fill="#E6C2A5" /> {/* Legs/Skin */}
                
                {/* LAYER 2: CLOTHES */}
                {outfit === 'CASUAL' && (
                    <g>
                        {/* Overalls */}
                        <path d="M30,90 L30,120 L70,120 L70,90 Q70,105 50,105 Q30,105 30,90" fill="#4682B4" /> {/* Pants */}
                        <rect x="35" y="80" width="30" height="25" fill="#4682B4" /> {/* Bib */}
                        <rect x="35" y="75" width="5" height="10" fill="#4682B4" /> {/* Strap L */}
                        <rect x="60" y="75" width="5" height="10" fill="#4682B4" /> {/* Strap R */}
                        <circle cx="37" cy="82" r="2" fill="gold" />
                        <circle cx="62" cy="82" r="2" fill="gold" />
                    </g>
                )}
                {outfit === 'FORMAL' && (
                    <g>
                        <path d="M30,90 L30,120 L70,120 L70,90 L30,90" fill="#111" />
                        <path d="M30,80 L70,80 L70,90 L30,90 Z" fill="#111" />
                        <path d="M45,80 L35,75 L35,85 L45,80 L55,75 L55,85 L45,80" fill="black" /> {/* Bowtie */}
                    </g>
                )}
                {outfit === 'PJ' && (
                    <path d="M25,80 Q20,120 30,125 L70,125 Q80,120 75,80 Z" fill="#87CEEB" />
                )}

                {/* LAYER 1.5: NECK */}
                <path d="M40,75 Q50,85 60,75" fill="#E6C2A5" />

                {/* LAYER 3: HEAD */}
                <circle cx="50" cy="50" r="32" fill="#E6C2A5" /> {/* Head Base */}
                
                {/* EBERT HAIR (Curly Cloud) - Dark Brown */}
                <g fill="#3E2723">
                   <circle cx="50" cy="25" r="10" />
                   <circle cx="35" cy="30" r="9" />
                   <circle cx="65" cy="30" r="9" />
                   <circle cx="25" cy="45" r="8" />
                   <circle cx="75" cy="45" r="8" />
                   <circle cx="40" cy="20" r="8" />
                   <circle cx="60" cy="20" r="8" />
                </g>

                {/* LAYER 4: FACE */}
                {/* Ears with detail */}
                <circle cx="18" cy="50" r="6" fill="#E6C2A5" />
                <path d="M18,48 Q15,50 18,52" stroke="#CD853F" fill="none" />
                <circle cx="82" cy="50" r="6" fill="#E6C2A5" />
                <path d="M82,48 Q85,50 82,52" stroke="#CD853F" fill="none" />

                {/* Eyes */}
                {state === 'WINK' ? (
                   <>
                     <path d="M35,50 Q40,55 45,50" stroke="#333" strokeWidth="3" fill="none" />
                     <circle cx="60" cy="50" r="4" fill="#333" />
                   </>
                ) : (
                   <>
                     <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
                       <circle cx="40" cy="50" r="4" fill="#333" />
                       <circle cx="42" cy="48" r="1.5" fill="white" />
                     </g>
                     <g transform={`translate(${eyeOffsetX}, ${eyeOffsetY})`}>
                       <circle cx="60" cy="50" r="4" fill="#333" />
                       <circle cx="62" cy="48" r="1.5" fill="white" />
                     </g>
                   </>
                )}

                {/* Eyebrows */}
                <path d={browLeft} stroke="#3E2723" strokeWidth="2" fill="none" />
                <path d={browRight} stroke="#3E2723" strokeWidth="2" fill="none" />

                {/* Mouth */}
                <path d={mouthPath} stroke={tongue ? 'none' : '#333'} strokeWidth="2" fill={tongue ? '#660000' : 'none'} strokeLinecap="round" />
                {tongue && <path d="M42,70 Q50,75 58,70" stroke="none" fill="pink" transform="translate(0, -2)" />}

                {/* LAYER 5: FACE ACCESSORIES */}
                {Object.values(accessories).map(id => renderAccessory(id, 'FACE'))}
                
                {/* LAYER 6: HEAD ACCESSORIES */}
                {Object.values(accessories).map(id => renderAccessory(id, 'HEAD'))}
                
                {/* LAYER 7: HAND ACCESSORIES */}
                {Object.values(accessories).map(id => renderAccessory(id, 'HAND'))}
                
                {/* Arms */}
                <path d="M25,85 Q10,100 25,110" stroke="#E6C2A5" strokeWidth="12" strokeLinecap="round" fill="none" />
                <path d="M75,85 Q90,100 75,110" stroke="#E6C2A5" strokeWidth="12" strokeLinecap="round" fill="none" />
            </svg>
        );
    } 
    
    // ANGEL: KID (3 Years, Afro, defined shirt)
    return (
        <svg width={110 * scale} height={150 * scale} viewBox="0 0 100 130" className="drop-shadow-xl transition-transform duration-300">
             {/* LAYER 0: BACK */}
             {Object.values(accessories).map(id => renderAccessory(id, 'BACK'))}

             {/* LAYER 1: BODY (Torso) */}
             <path d="M30,80 L30,130 L70,130 L70,80" fill="#1e293b" /> {/* Pants */}
             
             {/* LAYER 2: CLOTHES */}
             {outfit === 'FORMAL' && (
                 <g>
                     <path d="M25,80 L25,110 L75,110 L75,80 Z" fill="#002D62" /> {/* Jacket */}
                     <path d="M45,80 L50,100 L55,80" fill="white" /> {/* Shirt V */}
                     <path d="M48,82 L50,90 L52,82" fill="red" /> {/* Tie */}
                 </g>
             )}
             {outfit === 'CASUAL' && (
                 <g>
                    <rect x="25" y="80" width="50" height="35" fill="#FFFFFF" /> {/* Polo */}
                    <path d="M25,80 L50,90 L75,80" fill="none" stroke="#ddd" strokeWidth="1" /> {/* Collar */}
                 </g>
             )}
             {outfit === 'PJ' && (
                 <rect x="25" y="80" width="50" height="50" fill="#3b82f6" />
             )}

             {/* LAYER 1.5: NECK */}
             <path d="M42,75 Q50,85 58,75" fill="#8D5524" />

             {/* LAYER 3: HEAD (Afro Base) */}
             <circle cx="50" cy="45" r="35" fill="#222" /> 
             <circle cx="30" cy="40" r="15" fill="#222" />
             <circle cx="70" cy="40" r="15" fill="#222" />
             <circle cx="50" cy="25" r="20" fill="#222" />
             
             {/* Face Shape */}
             <circle cx="50" cy="55" r="28" fill="#8D5524" />

             {/* LAYER 4: FACE */}
             {/* Eyes */}
             {state === 'WINK' ? (
                <>
                  <path d="M38,55 Q42,60 46,55" stroke="#fff" strokeWidth="2" fill="none" />
                  <circle cx="62" cy="55" r="3" fill="#fff" />
                </>
             ) : (
                <>
                  <circle cx="38" cy="55" r="4" fill="#fff" />
                  <circle cx="38" cy="55" r="1.5" fill="#000" />
                  <circle cx="62" cy="55" r="4" fill="#fff" />
                  <circle cx="62" cy="55" r="1.5" fill="#000" />
                </>
             )}

             {/* Eyebrows */}
             <path d={browLeft} stroke="#000" strokeWidth="2" fill="none" transform="translate(0, 5)"/>
             <path d={browRight} stroke="#000" strokeWidth="2" fill="none" transform="translate(0, 5)"/>

             {/* Mouth */}
             <path d={mouthPath} stroke={tongue ? 'none' : '#fff'} strokeWidth="2" fill={tongue ? '#660000' : 'none'} transform="translate(0, -2)"/>
             {tongue && <path d="M42,68 Q50,73 58,68" stroke="none" fill="pink" />}

             {/* LAYER 5: FACE ACCESSORIES */}
             {Object.values(accessories).map(id => renderAccessory(id, 'FACE'))}
             
             {/* LAYER 6: HEAD ACCESSORIES */}
             {Object.values(accessories).map(id => renderAccessory(id, 'HEAD'))}
             
             {/* LAYER 7: HAND ACCESSORIES */}
             {Object.values(accessories).map(id => renderAccessory(id, 'HAND'))}

             {/* Arms */}
             <path d="M25,85 L15,100" stroke="#8D5524" strokeWidth="8" strokeLinecap="round" />
             <path d="M75,85 L85,100" stroke="#8D5524" strokeWidth="8" strokeLinecap="round" />
        </svg>
    );
};

// --- SUB-COMPONENTS ---
const DiscoveryTab = ({ products, addToCart, themeConfig, userStats, setTab }: any) => {
    const feed = useMemo(() => getDiscoveryFeed(), []);
    const [quests, setQuests] = useState(getDailyQuests());
    const [reward, setReward] = useState<{claimed: boolean, reward: number} | null>(null);

    useEffect(() => {
        const r = checkDailyReward();
        if(r.claimed) setReward(r);
    }, []);

    const profile = getUserProfile();
    const [profileStats, setProfileStats] = useState(profile ? getProfileStats(profile) : []);
    const progress = profile ? (profile.points / getNextLevelThreshold(profile.level)) * 100 : 0;

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
             {reward && <DailyRewardModal points={reward.reward} onClose={() => setReward(null)} />}
             
             {/* Gamification Header */}
             <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50"></div>
                 <div className="flex justify-between items-end relative z-10">
                     <div>
                         <h2 className="text-2xl font-black text-slate-800 tracking-tight">¡Hola, {profile?.name || 'Amigo'}! 👋</h2>
                         <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">Nivel: {profile?.level || 'Novato'}</p>
                     </div>
                     <div className="text-right">
                         <div className="text-3xl font-black text-[#002D62]">{profile?.points || 0} <span className="text-sm text-slate-400 font-bold">XP</span></div>
                     </div>
                 </div>
                 {/* XP Bar */}
                 <div className="mt-4 w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-blue-400 to-[#002D62] transition-all duration-1000" style={{width: `${Math.min(100, progress)}%`}}></div>
                 </div>
                 <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                     {quests.map(q => (
                         <div key={q.id} className={`flex-shrink-0 w-32 p-3 rounded-xl border-2 ${q.completed ? 'border-green-100 bg-green-50' : 'border-slate-100 bg-white'} transition-all`}>
                             <div className="text-xs font-bold text-slate-400 mb-1">{q.completed ? 'Completado' : 'Misión Diaria'}</div>
                             <div className="font-bold text-slate-800 text-xs leading-tight mb-2">{q.label}</div>
                             <div className={`text-[10px] font-black px-2 py-1 rounded-full inline-block ${q.completed ? 'bg-green-200 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>+{q.pointsReward} XP</div>
                         </div>
                     ))}
                 </div>
             </div>

             {/* Banner */}
             <div className="w-full h-48 rounded-3xl overflow-hidden relative shadow-lg group cursor-pointer" onClick={() => setTab('SHOP')}>
                <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1000&q=80" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#002D62]/90 to-transparent flex flex-col justify-center px-8">
                    <span className="bg-yellow-400 text-[#002D62] text-[10px] font-black px-2 py-1 rounded w-fit mb-2 uppercase tracking-wider">Regreso a Clases</span>
                    <h2 className="text-3xl font-black text-white leading-tight mb-2">Equípate con<br/>lo mejor.</h2>
                    <button className="bg-white text-[#002D62] px-5 py-2 rounded-full font-bold text-sm w-fit hover:bg-slate-100 transition-colors">Ver Ofertas <i className="fa-solid fa-arrow-right ml-1"></i></button>
                </div>
             </div>

             {/* Quick Categories */}
             <div>
                 <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">Explorar</h3>
                 <div className="grid grid-cols-4 gap-3">
                     {Object.keys(CATEGORY_ICONS).map(cat => (
                         <button key={cat} onClick={() => { trackUserInterest(cat); setTab('SHOP'); }} className="flex flex-col items-center gap-2 group">
                             <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-2xl text-slate-400 group-hover:text-[#002D62] group-hover:border-blue-200 transition-all">
                                 <i className={`fa-solid ${CATEGORY_ICONS[cat]}`}></i>
                             </div>
                             <span className="text-xs font-bold text-slate-600 group-hover:text-[#002D62]">{cat}</span>
                         </button>
                     ))}
                 </div>
             </div>

             {/* Recommended Feed */}
             <div>
                <div className="flex justify-between items-center px-2 mb-4">
                    <h3 className="text-lg font-bold text-slate-800">Para ti</h3>
                    <button className="text-xs font-bold text-[#002D62]" onClick={() => window.location.reload()}><i className="fa-solid fa-rotate-right"></i></button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    {feed.slice(0, 4).map(product => (
                        <div key={product.id} className="bg-white p-4 rounded-2xl shadow-card border border-slate-100 flex flex-col gap-3 group hover:-translate-y-1 transition-transform duration-300">
                            <div className="relative aspect-square rounded-xl overflow-hidden bg-slate-50">
                                <img src={product.image} className="w-full h-full object-contain p-2 mix-blend-multiply" />
                                <button onClick={() => addToCart(product)} className="absolute bottom-2 right-2 w-8 h-8 bg-[#002D62] text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"><i className="fa-solid fa-plus"></i></button>
                            </div>
                            <div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{product.category}</div>
                                <h4 className="font-bold text-slate-800 leading-tight line-clamp-2 min-h-[2.5em]">{product.name}</h4>
                                <div className="font-black text-[#CE1126] mt-1">RD${product.price}</div>
                            </div>
                        </div>
                    ))}
                </div>
             </div>
        </div>
    );
};

const ShopTab = ({ products, addToCart, categoryFilters }: any) => {
    const [selectedCat, setSelectedCat] = useState<string>('Todos');
    const [search, setSearch] = useState('');
    
    // Filter Logic
    const filtered = products.filter((p: Product) => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
        const matchesCat = selectedCat === 'Todos' || p.category === selectedCat;
        return matchesSearch && matchesCat;
    });

    return (
        <div className="pb-20 animate-fade-in space-y-4">
            {/* Search Header */}
            <div className="sticky top-0 bg-slate-50 z-20 pt-2 pb-4">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex items-center px-4 py-3">
                    <i className="fa-solid fa-search text-slate-400 mr-3"></i>
                    <input 
                        className="bg-transparent w-full outline-none font-medium text-slate-700 placeholder:text-slate-400"
                        placeholder="Buscar cuadernos, lápices..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                {/* Horizontal Category Scroll */}
                <div className="flex gap-2 overflow-x-auto mt-4 pb-2 scrollbar-hide px-1">
                    <button 
                        onClick={() => setSelectedCat('Todos')}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCat === 'Todos' ? 'bg-[#002D62] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                    >
                        Todos
                    </button>
                    {Object.keys(CATEGORY_HIERARCHY).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCat(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${selectedCat === cat ? 'bg-[#002D62] text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {filtered.map((p: Product) => (
                    <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between h-full">
                        <div className="relative aspect-square mb-3 bg-slate-50 rounded-xl overflow-hidden">
                            <img src={p.image} className="w-full h-full object-contain p-2 mix-blend-multiply hover:scale-105 transition-transform duration-500"/>
                        </div>
                        <div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">{p.brand}</div>
                            <h3 className="font-bold text-slate-800 text-sm leading-tight line-clamp-2 mb-2">{p.name}</h3>
                            <div className="flex items-center justify-between">
                                <span className="font-black text-[#002D62]">RD${p.price}</span>
                                <button onClick={() => addToCart(p)} className="w-8 h-8 rounded-full bg-slate-100 text-[#002D62] flex items-center justify-center hover:bg-[#002D62] hover:text-white transition-colors">
                                    <i className="fa-solid fa-cart-plus"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {filtered.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <i className="fa-solid fa-box-open text-4xl mb-3"></i>
                    <p>No encontramos productos.</p>
                </div>
            )}
        </div>
    );
};

// PROFILE COMPONENT
const ProfileView = ({ onClose, onLogout }: { onClose: () => void, onLogout: () => void }) => {
    const profile = getUserProfile();
    const stats = profile ? getProfileStats(profile) : [];
    const [tab, setTab] = useState<'STATS' | 'INVENTORY'>('STATS');
    const [, forceUpdate] = useState(0);

    const handleEquip = (accId: string, mascot: 'ANGEL' | 'EBERT') => {
        equipAccessory(mascot, accId);
        forceUpdate(n => n + 1); // Refresh UI to show equipped status
    };

    const isEquipped = (id: string) => {
        if(!profile) return false;
        const angelEq = Object.values(profile.equipped.angel);
        const ebertEq = Object.values(profile.equipped.ebert);
        return angelEq.includes(id) || ebertEq.includes(id);
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col animate-slide-up overflow-hidden">
            <div className="bg-[#002D62] text-white p-6 pb-12 rounded-b-[2.5rem] shadow-xl relative shrink-0">
                <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20"><i className="fa-solid fa-times"></i></button>
                <div className="flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-orange-400 flex items-center justify-center text-4xl mb-4 relative">
                        🦁
                        <div className="absolute bottom-0 right-0 bg-green-500 w-6 h-6 rounded-full border-2 border-white"></div>
                    </div>
                    <h2 className="text-2xl font-black">{profile?.name || 'Invitado'}</h2>
                    <p className="text-blue-200 font-medium text-sm">{profile?.role || 'Estudiante'} • Nivel {profile?.level}</p>
                    
                    <div className="flex gap-6 mt-6 w-full justify-center">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="text-xl font-black">{s.value}</div>
                                <div className="text-[10px] uppercase font-bold text-blue-300 tracking-wider">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-6 flex justify-center gap-2 mb-4 relative z-10">
                <button onClick={() => setTab('STATS')} className={`px-6 py-2 rounded-full font-bold text-xs shadow-md ${tab === 'STATS' ? 'bg-white text-[#002D62]' : 'bg-slate-200 text-slate-500'}`}>Estadísticas</button>
                <button onClick={() => setTab('INVENTORY')} className={`px-6 py-2 rounded-full font-bold text-xs shadow-md ${tab === 'INVENTORY' ? 'bg-white text-[#002D62]' : 'bg-slate-200 text-slate-500'}`}>Armario</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pb-20">
                {tab === 'STATS' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-2">Tus Logros</h3>
                            <div className="flex gap-2 flex-wrap">
                                {profile?.badges.map((b, i) => <span key={i} className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">{b}</span>)}
                                {(!profile?.badges || profile.badges.length === 0) && <span className="text-slate-400 text-xs italic">Aún no tienes medallas.</span>}
                            </div>
                        </div>
                        <button onClick={onLogout} className="w-full py-4 rounded-xl border border-red-100 text-red-500 font-bold hover:bg-red-50 transition-colors">Cerrar Sesión</button>
                    </div>
                )}

                {tab === 'INVENTORY' && (
                    <div className="grid grid-cols-2 gap-3">
                        {MASCOT_ACCESSORIES.map(acc => (
                            <div key={acc.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex flex-col items-center text-center gap-2 shadow-sm">
                                <div className="text-3xl">{acc.icon}</div>
                                <div className="font-bold text-xs text-slate-700 leading-tight">{acc.name}</div>
                                <div className="flex gap-1 w-full mt-1">
                                    {(acc.mascot === 'ANGEL' || acc.mascot === 'BOTH') && (
                                        <button 
                                            onClick={() => handleEquip(acc.id, 'ANGEL')} 
                                            className={`flex-1 py-1 rounded text-[10px] font-bold ${profile?.equipped.angel[acc.type] === acc.id ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            {profile?.equipped.angel[acc.type] === acc.id ? 'Quit Angel' : 'Angel'}
                                        </button>
                                    )}
                                    {(acc.mascot === 'EBERT' || acc.mascot === 'BOTH') && (
                                        <button 
                                            onClick={() => handleEquip(acc.id, 'EBERT')} 
                                            className={`flex-1 py-1 rounded text-[10px] font-bold ${profile?.equipped.ebert[acc.type] === acc.id ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            {profile?.equipped.ebert[acc.type] === acc.id ? 'Quit Ebert' : 'Ebert'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// PETS / CHAT TAB
const PetsTab = ({ themeConfig, cart }: any) => {
    const [messages, setMessages] = useState<ChatMessage[]>(getChatHistory());
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [mascotConfig] = useState(getMascotConfig());
    const scrollRef = useRef<HTMLDivElement>(null);
    const profile = getUserProfile();

    // Mascot States
    const [angelState, setAngelState] = useState<MascotState>('IDLE');
    const [ebertState, setEbertState] = useState<MascotState>('IDLE');

    useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

    const handleSend = async () => {
        if(!input.trim()) return;
        const userMsg: ChatMessage = { id: Date.now().toString(), sender: 'USER', text: input, timestamp: Date.now() };
        const newHistory = [...messages, userMsg];
        setMessages(newHistory);
        saveChatHistory(newHistory);
        setInput('');
        setIsTyping(true);
        setAngelState('THINKING');
        setEbertState('HAPPY');

        // Determine responder (simple heuristic)
        const responder = input.toLowerCase().includes('angel') ? 'ANGEL' : input.toLowerCase().includes('ebert') ? 'EBERT' : 'ANGEL';
        
        const context = { products: [], user: profile, cart: cart, offers: [] }; // Populate as needed
        const responseText = await chatWithMascot(responder, input, context as any);

        setIsTyping(false);
        setAngelState(responder === 'ANGEL' ? 'TALKING' : 'IDLE');
        setEbertState(responder === 'EBERT' ? 'TALKING' : 'IDLE');
        playSound(responder === 'ANGEL' ? 'ANGEL_TALK' : 'EBERT_TALK');

        const botMsg: ChatMessage = { id: (Date.now()+1).toString(), sender: responder, text: responseText, timestamp: Date.now() };
        const finalHistory = [...newHistory, botMsg];
        setMessages(finalHistory);
        saveChatHistory(finalHistory);

        setTimeout(() => {
            setAngelState('IDLE');
            setEbertState('IDLE');
        }, 2000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] relative overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-slate-900">
             {/* Night Sky Background */}
             <div className="absolute inset-0 overflow-hidden pointer-events-none">
                 <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#1e1b4b] to-[#312e81]"></div>
                 <div className="absolute top-10 right-10 w-20 h-20 bg-yellow-100 rounded-full blur-[40px] opacity-20 animate-pulse"></div>
                 {[...Array(20)].map((_, i) => (
                     <div key={i} className="absolute bg-white rounded-full opacity-70 animate-twinkle" style={{
                         top: `${Math.random()*100}%`, left: `${Math.random()*100}%`, width: `${Math.random()*3}px`, height: `${Math.random()*3}px`, animationDelay: `${Math.random()*5}s`
                     }}></div>
                 ))}
             </div>

             {/* Mascots Area */}
             <div className="flex-1 relative">
                 <div className="absolute bottom-4 left-4 z-10 transition-transform hover:scale-105" onClick={() => setEbertState('LAUGH')}>
                     <MascotAvatar type="EBERT" state={ebertState} outfit={mascotConfig.ebertOutfit} accessories={profile?.equipped.ebert} scale={1.2} isSpeaking={ebertState === 'TALKING'} />
                 </div>
                 <div className="absolute bottom-8 right-8 z-0 transition-transform hover:scale-105" onClick={() => setAngelState('WINK')}>
                     <MascotAvatar type="ANGEL" state={angelState} outfit={mascotConfig.angelOutfit} accessories={profile?.equipped.angel} scale={1} isSpeaking={angelState === 'TALKING'} />
                 </div>
                 
                 {/* Chat Bubbles */}
                 <div className="absolute top-0 left-0 right-0 bottom-40 overflow-y-auto px-4 py-4 space-y-3 scrollbar-hide">
                     {messages.map(m => (
                         <div key={m.id} className={`flex ${m.sender === 'USER' ? 'justify-end' : 'justify-start'}`}>
                             <div className={`max-w-[80%] p-3 rounded-2xl text-sm font-medium shadow-md ${
                                 m.sender === 'USER' ? 'bg-white text-slate-800 rounded-tr-none' : 
                                 m.sender === 'ANGEL' ? 'bg-[#002D62] text-white rounded-tl-none' : 'bg-orange-100 text-orange-900 rounded-tl-none border border-orange-200'
                             }`}>
                                 {m.text}
                             </div>
                         </div>
                     ))}
                     {isTyping && <div className="flex justify-start"><div className="bg-white/50 text-white px-4 py-2 rounded-full text-xs animate-pulse">Escribiendo...</div></div>}
                     <div ref={scrollRef}></div>
                 </div>
             </div>

             {/* Input Area */}
             <div className="bg-white p-3 flex gap-2 border-t border-slate-100 relative z-20">
                 <input 
                    value={input} 
                    onChange={e => setInput(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleSend()}
                    placeholder="Pregunta algo..." 
                    className="flex-1 bg-slate-100 rounded-full px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-[#002D62]"
                 />
                 <button onClick={handleSend} className="w-12 h-12 rounded-full bg-[#002D62] text-white flex items-center justify-center hover:bg-blue-900 active:scale-95 transition-all">
                     <i className="fa-solid fa-paper-plane"></i>
                 </button>
             </div>
        </div>
    );
};

const OnboardingModal = ({ onComplete }: { onComplete: (name: string, role: UserRole) => void }) => {
    const [name, setName] = useState('');
    const [role, setRole] = useState<UserRole>('ESTUDIANTE');
    
    return (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 animate-fade-in">
            <div className="w-full max-w-sm text-center">
                <div className="w-20 h-20 bg-[#002D62] rounded-3xl mx-auto mb-6 flex items-center justify-center text-4xl text-white shadow-xl rotate-3">👋</div>
                <h1 className="text-3xl font-black text-slate-800 mb-2">¡Bienvenido!</h1>
                <p className="text-slate-500 mb-8 font-medium">Antes de empezar, cuéntanos un poco de ti para personalizar la tienda.</p>
                
                <input 
                   placeholder="¿Cómo te llamas?" 
                   value={name} 
                   onChange={e => setName(e.target.value)} 
                   className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl font-bold text-lg text-center mb-4 focus:border-[#002D62] outline-none"
                />
                
                <div className="grid grid-cols-2 gap-3 mb-8">
                    {['ESTUDIANTE', 'PADRE', 'PROFESOR', 'EMPRESA'].map(r => (
                        <button key={r} onClick={() => setRole(r as any)} className={`p-3 rounded-xl border-2 font-bold text-xs transition-all ${role === r ? 'border-[#002D62] bg-blue-50 text-[#002D62]' : 'border-slate-100 text-slate-400'}`}>
                            {r}
                        </button>
                    ))}
                </div>
                
                <button onClick={() => { if(name) onComplete(name, role); }} disabled={!name} className="w-full bg-[#CE1126] text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95">
                    ¡Comenzar Aventura! 🚀
                </button>
            </div>
        </div>
    );
};

export default function CustomerView({ products, addToCart, cart, updateCartQuantity, removeFromCart, currentTab, setTab, isCartOpen, setIsCartOpen, offers, isProfileOpen, setIsProfileOpen, onLogout, themeConfig }: Props) {
    const [showServices, setShowServices] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(!getUserProfile());

    const handleOnboardingComplete = (name: string, role: UserRole) => {
        const newProfile: UserProfile = {
            id: Date.now().toString(),
            name,
            role,
            grade: '',
            avatarId: 0,
            favoriteColor: 'blue',
            createdAt: Date.now(),
            points: 100,
            level: 'Novato',
            badges: ['Bienvenida'],
            wishlist: [],
            streak: 1,
            inventory: [],
            equipped: { angel: {}, ebert: {} }
        };
        saveUserProfile(newProfile);
        setShowOnboarding(false);
    };

    return (
        <div className="w-full h-full relative">
            {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
            {showServices && <ServicesModal onClose={() => setShowServices(false)} />}
            {isProfileOpen && <ProfileView onClose={() => setIsProfileOpen(false)} onLogout={onLogout} />}

            {currentTab === 'DISCOVERY' && <DiscoveryTab products={products} addToCart={addToCart} themeConfig={themeConfig} setTab={setTab} />}
            {currentTab === 'SHOP' && <ShopTab products={products} addToCart={addToCart} />}
            {currentTab === 'PETS' && <PetsTab cart={cart} themeConfig={themeConfig} />}

            {/* Cart Drawer */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end bg-black/50 backdrop-blur-sm animate-fade-in" onClick={() => setIsCartOpen(false)}>
                    <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-left" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black text-[#002D62]">Tu Carrito</h2>
                            <button onClick={() => setIsCartOpen(false)} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-red-100 hover:text-red-500"><i className="fa-solid fa-times"></i></button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto space-y-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-20 opacity-50"><i className="fa-solid fa-cart-shopping text-6xl mb-4 text-slate-300"></i><p>Tu carrito está vacío</p></div>
                            ) : cart.map(item => (
                                <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <img src={item.image} className="w-16 h-16 rounded-lg object-contain bg-white p-1" />
                                    <div className="flex-1">
                                        <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                                        <div className="text-xs text-slate-500 font-bold">RD${(item.discountPrice || item.price) * item.quantity}</div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white rounded-lg p-1 border border-slate-200">
                                        <button onClick={() => updateCartQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-500"><i className="fa-solid fa-minus text-[10px]"></i></button>
                                        <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                                        <button onClick={() => updateCartQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-green-500"><i className="fa-solid fa-plus text-[10px]"></i></button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-500 font-bold">Total Estimado</span>
                                <span className="text-2xl font-black text-[#002D62]">RD${cart.reduce((a,c) => a + (c.discountPrice || c.price) * c.quantity, 0).toLocaleString()}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <a href={generateWhatsAppLink(getUserProfile()?.name || 'Cliente', 'URBAN', cart)} target="_blank" className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"><i className="fa-brands fa-whatsapp"></i> Delivery</a>
                                <a href={generateWhatsAppLink(getUserProfile()?.name || 'Cliente', 'PICKUP', cart)} target="_blank" className="bg-[#002D62] hover:bg-blue-900 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"><i className="fa-solid fa-store"></i> Recoger</a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Quick Service Button (Floating) */}
            <button onClick={() => setShowServices(true)} className="fixed bottom-24 right-4 bg-white text-[#002D62] w-12 h-12 rounded-full shadow-lg border border-slate-100 flex items-center justify-center z-40 hover:scale-110 transition-transform md:bottom-8">
                <i className="fa-solid fa-briefcase text-lg"></i>
            </button>
        </div>
    );
}
