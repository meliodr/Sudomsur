import React, { useState, useEffect } from 'react';
import { ThemeType, Product, CartItem, ThemeConfig, AppNotification, ExpressOffer, UserStats, OpeningHours } from './types';
import { getProducts, getNotifications, addNotification, markNotificationsRead, getOffers, saveOffers, trackUserVisits, getOpeningHours, saveOpeningHours } from './services/storeService';
import CustomerView from './components/CustomerView';
import AdminView from './components/AdminView';

const THEMES: Record<ThemeType, ThemeConfig> = {
  DEFAULT: {
    colors: { primary: '#002D62', secondary: '#CE1126', accent: '#F1F5F9', surface: '#FFFFFF' }, // Azul Real y Rojo Bandera
    pattern: 'linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)', // Cleaner gradient
    icons: { logo: 'fa-star', cart: 'fa-cart-shopping', hero: 'fa-bag-shopping', search: 'fa-magnifying-glass' }
  },
  VALENTINES: {
    colors: { primary: '#BE123C', secondary: '#FB7185', accent: '#FFF1F2', surface: '#FFFFFF' },
    pattern: 'linear-gradient(135deg, #FFF1F2 0%, #FFF5F5 100%)',
    icons: { logo: 'fa-heart', cart: 'fa-gift', hero: 'fa-heart-pulse', search: 'fa-magnifying-glass' }
  },
  PATRIO: {
    colors: { primary: '#002D62', secondary: '#CE1126', accent: '#F0F9FF', surface: '#FFFFFF' },
    pattern: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%)',
    icons: { logo: 'fa-flag', cart: 'fa-bag-shopping', hero: 'fa-star', search: 'fa-search' }
  },
  SCHOOL: {
    colors: { primary: '#D97706', secondary: '#2563EB', accent: '#FFFBEB', surface: '#FFFFFF' },
    pattern: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
    icons: { logo: 'fa-pencil', cart: 'fa-school', hero: 'fa-graduation-cap', search: 'fa-book-open' }
  },
  CHRISTMAS: {
    colors: { primary: '#166534', secondary: '#DC2626', accent: '#F0FDF4', surface: '#FFFFFF' },
    pattern: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
    icons: { logo: 'fa-tree', cart: 'fa-sleigh', hero: 'fa-snowflake', search: 'fa-search' }
  }
};

export default function App() {
  // Auth State
  const [authStage, setAuthStage] = useState<'LOGIN' | 'APP'>('LOGIN');
  const [pin, setPin] = useState('');
  const [loginError, setLoginError] = useState(false);

  // App State
  const [view, setView] = useState<'CUSTOMER' | 'ADMIN'>('CUSTOMER');
  const [customerTab, setCustomerTab] = useState<'SHOP' | 'DISCOVERY' | 'PETS'>('DISCOVERY');
  const [theme, setTheme] = useState<ThemeType>('DEFAULT');
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('sudomsur_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [offers, setOffers] = useState<ExpressOffer[]>([]);
  const [hours, setHours] = useState<OpeningHours>(getOpeningHours());
  const [eventPopup, setEventPopup] = useState<AppNotification | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState<string | undefined>(undefined);
  const [userStats, setUserStats] = useState<UserStats | null>(null);

  // Initial Data Load
  useEffect(() => {
    setProducts(getProducts());
    setOffers(getOffers());

    const tracking = trackUserVisits();
    setUserStats(tracking.stats);
    if (tracking.message) {
      setWelcomeMessage(tracking.message);
      setTimeout(() => setWelcomeMessage(undefined), 6000);
    }
    
    // Scheduled Event Logic
    const allNotifs = getNotifications();
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Find unread EVENT that is scheduled for today or earlier (but not too old)
    const dueEvent = allNotifs.find(n => 
        n.type === 'EVENT' && 
        !n.read && 
        (n.scheduledDate && n.scheduledDate <= todayStr)
    );
    
    // Filter visible notifications (exclude future scheduled ones)
    const visibleNotifs = allNotifs.filter(n => !n.scheduledDate || n.scheduledDate <= todayStr);
    setNotifications(visibleNotifs);

    if (dueEvent) setEventPopup(dueEvent);

    const interval = setInterval(() => {
      const now = Date.now();
      const currentOffers = getOffers();
      const validOffers = currentOffers.filter(o => o.endTime > now);
      if (validOffers.length !== currentOffers.length) {
        setOffers(validOffers);
        saveOffers(validOffers);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => { localStorage.setItem('sudomsur_cart', JSON.stringify(cart)); }, [cart]);

  useEffect(() => {
    const config = THEMES[theme];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', config.colors.primary);
    root.style.setProperty('--color-secondary', config.colors.secondary);
    root.style.setProperty('--color-accent', config.colors.accent);
    root.style.setProperty('--color-surface', config.colors.surface);
    root.style.setProperty('--bg-pattern', config.pattern);
  }, [theme]);

  // Handlers
  const handlePinSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (pin === '1234') {
      setView('CUSTOMER');
      setCustomerTab('DISCOVERY');
      setAuthStage('APP');
      setPin('');
    } else if (pin === '4321') {
      setView('ADMIN');
      setAuthStage('APP');
      setPin('');
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 500);
      setPin('');
    }
  };

  const handleLogout = () => {
    setAuthStage('LOGIN');
    setView('CUSTOMER');
    setIsProfileOpen(false);
  };

  const handleCreateOffer = (offer: ExpressOffer) => {
    const newOffers = [...offers, offer];
    setOffers(newOffers);
    saveOffers(newOffers);
    const prod = products.find(p => p.id === offer.productId);
    if (prod) {
      const notif: AppNotification = { id: Date.now().toString(), title: 'Oferta Disponible', message: `${offer.discountPercent}% de descuento en ${prod.name}.`, type: 'OFFER', read: false, timestamp: Date.now() };
      setNotifications(addNotification(notif));
    }
  };
  
  const handleCreateEvent = (title: string, message: string) => {
    const notif: AppNotification = { id: Date.now().toString(), title, message, type: 'EVENT', read: false, timestamp: Date.now() };
    setNotifications(addNotification(notif));
    setEventPopup(notif);
  };

  const handleUpdateHours = (newHours: OpeningHours) => { setHours(newHours); saveOpeningHours(newHours); };

  const addToCart = (product: Product) => {
    const activeOffer = offers.find(o => o.productId === product.id && o.endTime > Date.now());
    let finalPrice = product.price;
    if (activeOffer) finalPrice = Math.round(product.price * (1 - activeOffer.discountPercent / 100));

    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      return [...prev, { ...product, price: product.price, discountPrice: activeOffer ? finalPrice : undefined, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id));
  
  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty < 0 ? 0 : newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };
  
  const cartItemCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadCount = notifications.filter(n => !n.read).length;

  const toggleNotifications = () => {
    if (!showNotifications && unreadCount > 0) setNotifications(markNotificationsRead());
    setShowNotifications(!showNotifications);
  };
  
  const closeEventPopup = () => {
     if (eventPopup) {
       const allNotifs = getNotifications();
       // Mark specific event as read in storage
       const updated = allNotifs.map(n => n.id === eventPopup.id ? { ...n, read: true } : n);
       localStorage.setItem('sudomsur_notifications', JSON.stringify(updated));
       
       // Update local state without showing future events
       const todayStr = new Date().toISOString().split('T')[0];
       setNotifications(updated.filter(n => !n.scheduledDate || n.scheduledDate <= todayStr));
       setEventPopup(null);
     }
  };

  // --- LOGIN SCREEN ---
  if (authStage === 'LOGIN') {
    return (
      <div className="min-h-[100dvh] bg-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-sm relative z-10 flex flex-col items-center border border-slate-200">
          <div className="w-16 h-16 bg-[#002D62] text-white rounded-xl flex items-center justify-center text-2xl shadow-md mb-6">
            <i className="fa-solid fa-star"></i>
          </div>
          
          <h1 className="text-2xl font-bold text-[#002D62] tracking-tight mb-1">SUDOMSUR</h1>
          <p className="text-slate-500 text-sm font-medium mb-8">Suplidora Dominicana del Sur</p>

          <form onSubmit={handlePinSubmit} className="w-full">
            <div className="mb-6 relative">
              <input 
                type="tel" 
                maxLength={4}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                className={`w-full bg-slate-50 text-center text-2xl font-bold tracking-[0.5em] py-4 rounded-xl border focus:bg-white transition-all outline-none ${loginError ? 'border-red-500 text-red-500' : 'border-slate-200 focus:border-[#002D62] text-slate-800'}`}
                placeholder="••••"
              />
              {loginError && <p className="text-red-500 text-xs text-center mt-2 font-medium">PIN Incorrecto</p>}
            </div>

            <button type="submit" className="w-full bg-[#002D62] text-white py-4 rounded-xl font-bold shadow-md hover:bg-blue-900 active:scale-95 transition-all text-base flex items-center justify-center gap-2">
              Ingresar
            </button>
          </form>
          
          <div className="mt-8 text-center border-t border-slate-100 pt-4 w-full">
             <p className="text-[10px] text-gray-400 font-medium">
                Acceso Cliente: 1234 &nbsp;|&nbsp; Acceso Admin: 4321
             </p>
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP ---
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans text-slate-800 pb-24 md:pb-0 relative bg-slate-50">
      
      {/* Dynamic Header */}
      <header className={`sticky top-0 z-40 transition-all duration-300 ${view === 'CUSTOMER' ? 'bg-white shadow-sm border-b border-slate-200' : 'bg-slate-900 text-white border-b border-slate-800'}`}>
        <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { 
             if(view === 'ADMIN') return;
             setView('CUSTOMER'); setCustomerTab('DISCOVERY'); setIsProfileOpen(false); 
          }}>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shadow-sm ${view === 'CUSTOMER' ? 'bg-[#002D62] text-white' : 'bg-white text-slate-900'}`}>
               <i className={`fa-solid ${THEMES[theme].icons.logo} text-sm`}></i>
            </div>
            
            <div className="flex flex-col">
              <h1 className={`text-lg font-bold leading-none tracking-tight ${view === 'CUSTOMER' ? 'text-[#002D62]' : 'text-white'}`}>SUDOMSUR</h1>
              <p className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 opacity-80 ${view === 'CUSTOMER' ? 'text-slate-500' : 'text-slate-400'}`}>
                {view === 'ADMIN' ? 'Panel de Control' : customerTab === 'PETS' ? 'Asistente IA' : customerTab === 'DISCOVERY' ? 'Inicio' : 'Catálogo'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             {view === 'ADMIN' && (
                <button onClick={handleLogout} className="text-xs bg-red-900/50 text-red-200 px-3 py-1 rounded border border-red-800 hover:bg-red-900 transition-colors uppercase tracking-wider font-mono">
                   Salir
                </button>
             )}

             {view === 'CUSTOMER' && (
               <>
                <button onClick={toggleNotifications} className={`relative w-10 h-10 flex items-center justify-center rounded-full transition-all active:scale-95 hover:bg-slate-100`}>
                  <i className={`fa-solid ${unreadCount > 0 ? 'fa-bell' : 'fa-bell'} text-slate-600`}></i>
                  {unreadCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-[#CE1126] rounded-full border border-white"></span>}
                </button>
                {/* Cart Button visible on Desktop and Mobile Header */}
                <button onClick={() => setIsCartOpen(true)} className="relative w-10 h-10 flex items-center justify-center hover:bg-slate-100 transition-all rounded-full active:scale-95">
                  <i className="fa-solid fa-cart-shopping text-slate-600"></i>
                  {cartItemCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-[#CE1126] text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-white">
                      {cartItemCount}
                    </span>
                  )}
                </button>
               </>
             )}
          </div>
        </div>

        {/* Notifications Dropdown */}
        {showNotifications && (
           <div className="absolute top-full right-4 mt-2 w-80 bg-white shadow-xl rounded-xl border border-slate-200 z-50 overflow-hidden animate-fade-in origin-top-right">
              <div className="px-4 py-3 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                 <h3 className="font-bold text-xs uppercase tracking-wide text-slate-700">Notificaciones</h3>
                 <button onClick={() => setShowNotifications(false)} className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-slate-400 hover:text-red-500"><i className="fa-solid fa-times text-xs"></i></button>
              </div>
              <div className="max-h-72 overflow-y-auto p-1">
                 {notifications.length === 0 ? (
                    <div className="p-6 text-center text-gray-400 text-xs">
                       <p>No tienes notificaciones nuevas.</p>
                    </div>
                 ) : (
                    notifications.map(notif => (
                       <div key={notif.id} className={`p-3 m-1 rounded-lg transition-all ${notif.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                          <div className="flex items-start gap-3">
                             <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0 ${notif.type === 'OFFER' ? 'bg-[#CE1126]' : notif.type === 'EVENT' ? 'bg-[#002D62]' : 'bg-slate-400'}`}>
                                <i className={`fa-solid ${notif.type === 'OFFER' ? 'fa-tag' : notif.type === 'EVENT' ? 'fa-calendar' : 'fa-info'}`}></i>
                             </div>
                             <div>
                                <h4 className={`font-bold text-sm leading-tight mb-1 ${notif.read ? 'text-slate-600' : 'text-[#002D62]'}`}>{notif.title}</h4>
                                <p className="text-xs text-slate-500 leading-relaxed">{notif.message}</p>
                             </div>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-grow w-full max-w-5xl mx-auto px-4 py-6 z-10 relative">
        {view === 'CUSTOMER' ? (
          <CustomerView 
            products={products} addToCart={addToCart} cart={cart} setCart={setCart} removeFromCart={removeFromCart} 
            theme={theme} themeConfig={THEMES[theme]} isCartOpen={isCartOpen} setIsCartOpen={setIsCartOpen}
            offers={offers} welcomeMessage={welcomeMessage} userStats={userStats}
            isProfileOpen={isProfileOpen} setIsProfileOpen={setIsProfileOpen} 
            onLogout={handleLogout}
            openingHours={hours}
            currentTab={customerTab}
            setTab={setCustomerTab}
            updateCartQuantity={updateCartQuantity}
          />
        ) : (
          <AdminView 
            theme={theme} setTheme={setTheme} products={products} refreshProducts={() => setProducts(getProducts())}
            createOffer={handleCreateOffer} activeOffers={offers}
            userStats={userStats || undefined} openingHours={hours} setOpeningHours={handleUpdateHours} createEvent={handleCreateEvent}
          />
        )}
      </main>
      
      {/* Event Modal Overlay */}
      {eventPopup && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
           <div className="bg-white rounded-2xl shadow-2xl p-0 max-w-sm w-full relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-24 bg-[#002D62]"></div>
              <button onClick={closeEventPopup} className="absolute top-4 right-4 bg-white/20 hover:bg-white text-white hover:text-black rounded-full w-8 h-8 flex items-center justify-center transition-all z-20"><i className="fa-solid fa-xmark"></i></button>
              
              <div className="relative z-10 flex flex-col items-center text-center p-6 pt-8">
                 <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-4xl text-[#CE1126] mb-4 border-4 border-slate-100">
                    <i className="fa-solid fa-gift"></i>
                 </div>
                 <h2 className="text-xl font-bold text-slate-900 mb-2">{eventPopup.title}</h2>
                 <p className="text-slate-600 text-sm leading-relaxed mb-6">{eventPopup.message}</p>
                 <button onClick={closeEventPopup} className="w-full bg-[#002D62] text-white py-3 rounded-xl font-bold hover:bg-blue-800 active:scale-95 transition-all">
                    Entendido
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Floating Dock Navigation (Mobile) */}
      {view === 'CUSTOMER' && (
        <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 z-50 md:hidden flex items-center justify-around pb-safe h-16 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
            
            <button onClick={() => { setView('CUSTOMER'); setCustomerTab('DISCOVERY'); setIsProfileOpen(false); }} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${view === 'CUSTOMER' && customerTab === 'DISCOVERY' && !isProfileOpen ? 'text-[#002D62]' : 'text-slate-400 hover:text-slate-600'}`}>
              <i className="fa-solid fa-home text-lg mb-1"></i>
              <span className="text-[10px] font-semibold">Inicio</span>
            </button>

            <button onClick={() => { setView('CUSTOMER'); setCustomerTab('SHOP'); setIsProfileOpen(false); }} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${view === 'CUSTOMER' && customerTab === 'SHOP' && !isProfileOpen ? 'text-[#002D62]' : 'text-slate-400 hover:text-slate-600'}`}>
              <i className="fa-solid fa-layer-group text-lg mb-1"></i>
              <span className="text-[10px] font-semibold">Catálogo</span>
            </button>
            
            {/* AI Assistant (Center) */}
            <button onClick={() => { setView('CUSTOMER'); setCustomerTab('PETS'); setIsProfileOpen(false); }} className={`flex flex-col items-center justify-center w-14 h-14 rounded-full transition-all relative -mt-6 border-4 border-slate-50 shadow-lg ${view === 'CUSTOMER' && customerTab === 'PETS' ? 'bg-[#CE1126] text-white' : 'bg-[#002D62] text-white'}`}>
              <i className="fa-solid fa-message text-xl"></i>
            </button>

            {/* Cart Nav Button - Keeps existing logic */}
            <button onClick={() => setIsCartOpen(true)} className={`flex flex-col items-center justify-center w-16 h-full transition-colors text-slate-400 hover:text-slate-600 relative`}>
              <div className="relative">
                 <i className="fa-solid fa-cart-shopping text-lg mb-1"></i>
                 {cartItemCount > 0 && <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#CE1126] text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartItemCount}</span>}
              </div>
              <span className="text-[10px] font-semibold">Carrito</span>
            </button>

            <button onClick={() => setIsProfileOpen(true)} className={`flex flex-col items-center justify-center w-16 h-full transition-colors ${isProfileOpen ? 'text-[#002D62]' : 'text-slate-400 hover:text-slate-600'}`}>
              <i className="fa-solid fa-user text-lg mb-1"></i>
              <span className="text-[10px] font-semibold">Perfil</span>
            </button>
        </nav>
      )}

    </div>
  );
}