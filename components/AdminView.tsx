

import React, { useState, useEffect } from 'react';
import { ThemeType, Product, ExpressOffer, UserStats, OpeningHours, MascotConfig, Order, Suggestion, CommunityPost, ComboBundle, StoryOffer, Debtor, Expense, StickyNote, MascotOutfit, ApiUsage, SpecialRequest, AppNotification, UserProfile, ThemeConfig } from '../types';
import { generateMarketingCopy, generatePromoVideo, enhanceProductImage } from '../services/geminiService';
import { addProduct, getAnalyticsSummary, getMascotConfig, saveMascotConfig, updateProduct, deleteProduct, getOrders, updateOrderStatus, saveOpeningHours, getSuggestions, getCommunityPosts, getBundles, saveBundle, deleteBundle, saveFlashStory, getDebtors, saveDebtor, payDebt, getExpenses, saveExpense, getStickyNotes, saveStickyNote, deleteStickyNote, getTopClients, playSound, exportData, importData, deleteOrder, getAllKnownUsers, toggleUserBlock, isUserBlocked, broadcastNotification, getApiUsage, getSpecialRequests, getNotifications, deleteNotification, getUserProfile, getFlashStories, deleteNotification as deleteNotifService } from '../services/storeService';

// Defined themes for usage in component styling
const THEME_STYLES: Record<ThemeType, { bg: string, text: string, accent: string, border: string }> = {
    DEFAULT: { bg: 'bg-[#002D62]', text: 'text-[#002D62]', accent: 'bg-blue-600', border: 'border-[#002D62]' },
    VALENTINES: { bg: 'bg-[#BE123C]', text: 'text-[#BE123C]', accent: 'bg-pink-500', border: 'border-[#BE123C]' },
    PATRIO: { bg: 'bg-[#002D62]', text: 'text-[#002D62]', accent: 'bg-red-600', border: 'border-[#002D62]' },
    SCHOOL: { bg: 'bg-[#D97706]', text: 'text-[#D97706]', accent: 'bg-orange-500', border: 'border-[#D97706]' },
    CHRISTMAS: { bg: 'bg-[#166534]', text: 'text-[#166534]', accent: 'bg-red-600', border: 'border-[#166534]' }
};

interface Props {
  theme: ThemeType;
  setTheme: (t: ThemeType) => void;
  products: Product[];
  refreshProducts: () => void;
  createOffer: (offer: ExpressOffer) => void;
  activeOffers: ExpressOffer[];
  userStats?: UserStats;
  openingHours?: OpeningHours;
  setOpeningHours?: (h: OpeningHours) => void;
  createEvent?: (title: string, message: string) => void;
}

type Tab = 'INICIO' | 'PEDIDOS' | 'HERRAMIENTAS' | 'CLIENTES' | 'PRODUCTOS' | 'MARKETING' | 'OFERTAS' | 'COMUNIDAD' | 'MASCOTAS' | 'CONFIGURACIÓN';

const OrderDetailModal = ({ order, onClose }: { order: Order, onClose: () => void }) => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
        <div className="bg-white w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
            <div className="p-6 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-black text-lg text-[#002D62]">Pedido #{order.id.slice(-4)}</h3>
                    <p className="text-xs text-slate-500">{new Date(order.date).toLocaleString()}</p>
                </div>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-red-500"><i className="fa-solid fa-times"></i></button>
            </div>
            <div className="p-6 overflow-y-auto">
                <div className="bg-blue-50 p-3 rounded-xl mb-4 text-xs text-blue-800">
                    <span className="font-bold block">Cliente: {order.clientName}</span>
                    {order.locationLink && <a href={order.locationLink} target="_blank" className="underline text-blue-600">Ver Ubicación (Maps)</a>}
                </div>
                <div className="space-y-4 mb-6">
                    {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center border-b border-slate-50 pb-2">
                            <div className="flex items-center gap-3">
                                <span className="w-6 h-6 bg-blue-100 text-[#002D62] rounded flex items-center justify-center text-xs font-bold">{item.quantity}x</span>
                                <span className="text-sm font-bold text-slate-700">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-slate-500">RD${(item.discountPrice || item.price) * item.quantity}</span>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t-2 border-slate-100">
                    <span className="text-lg font-bold text-slate-600">Total</span>
                    <span className="text-2xl font-black text-[#002D62]">RD${order.total.toLocaleString()}</span>
                </div>
            </div>
        </div>
    </div>
);

export default function AdminView({ theme, setTheme, products, refreshProducts, createOffer, createEvent, openingHours, setOpeningHours, activeOffers }: Props) {
  const [currentTab, setCurrentTab] = useState<Tab>('INICIO');
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false); 
  const [showConfetti, setShowConfetti] = useState(false);

  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [bundles, setBundles] = useState<ComboBundle[]>([]);
  const [stories, setStories] = useState<StoryOffer[]>([]);
  const [debtors, setDebtors] = useState<Debtor[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [topClients, setTopClients] = useState<{name:string, total:number, count:number}[]>([]);
  const [knownUsers, setKnownUsers] = useState<string[]>([]);
  const [apiUsage, setApiUsage] = useState<ApiUsage>({count: 0, limit: 100, date: ''});
  const [specialRequests, setSpecialRequests] = useState<SpecialRequest[]>([]);
  const [scheduledEvents, setScheduledEvents] = useState<AppNotification[]>([]);
  
  const [newProd, setNewProd] = useState({ name: '', price: '', category: 'Escolar', description: '' });
  
  // Marketing State
  const [marketingType, setMarketingType] = useState<'COPY' | 'VIDEO' | 'PHOTO' | 'EBERT_REVIEW'>('COPY');
  const [marketingResult, setMarketingResult] = useState('');
  const [generatedMediaUrl, setGeneratedMediaUrl] = useState('');
  const [selectedProductForAd, setSelectedProductForAd] = useState('');
  const [mediaPrompt, setMediaPrompt] = useState('');
  const [estimatedTime, setEstimatedTime] = useState<string | null>(null);
  
  const [mascotConfig, setMascotConfig] = useState<MascotConfig>(getMascotConfig());
  const [bundleForm, setBundleForm] = useState({ title: '', discount: 10, description: '', selectedIds: [] as string[] });
  const [storyForm, setStoryForm] = useState({ title: '', subtitle: '', color: '#CE1126' });
  const [expenseForm, setExpenseForm] = useState({ description: '', amount: '', category: 'OTHER' as 'FOOD' | 'TRANSPORT' | 'SUPPLIES' | 'OTHER' });
  const [eventForm, setEventForm] = useState({ title: '', message: '', date: '' });

  const [inventorySearch, setInventorySearch] = useState('');
  const [greeting, setGreeting] = useState('');
  const [offerForm, setOfferForm] = useState({ productId: '', discount: 20, duration: 60 });
  const [localHours, setLocalHours] = useState<OpeningHours | undefined>(openingHours);
  
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Dynamic Styles
  const styles = THEME_STYLES[theme];

  useEffect(() => {
    setAnalyticsData(getAnalyticsSummary());
    setOrders(getOrders());
    setIsOpen(openingHours?.weekdays.open !== 'Cerrado');
    setSuggestions(getSuggestions());
    setPosts(getCommunityPosts());
    setBundles(getBundles());
    setStories(getFlashStories());
    setDebtors(getDebtors());
    setExpenses(getExpenses());
    setTopClients(getTopClients());
    setMascotConfig(getMascotConfig());
    setKnownUsers(getAllKnownUsers());
    setApiUsage(getApiUsage());
    setLocalHours(openingHours);
    setSpecialRequests(getSpecialRequests());
    setScheduledEvents(getNotifications().filter(n => n.type === 'EVENT' && n.scheduledDate));
    
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Buenos días, Mami'); else if (hour < 18) setGreeting('Buenas tardes, Mami'); else setGreeting('Buenas noches, Wanda');
  }, [openingHours, currentTab]);

  const triggerSuccess = (msg: string) => { setStatusMessage(msg); playSound('SUCCESS'); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 3000); setTimeout(() => setStatusMessage(''), 4000); };
  const toggleStoreStatus = () => { if(setOpeningHours) { const newStatus = !isOpen; setIsOpen(newStatus); const hours = newStatus ? '08:00' : 'Cerrado'; const close = newStatus ? '18:00' : 'Cerrado'; setOpeningHours({ weekdays: { open: hours, close }, saturday: { open: newStatus ? '09:00' : 'Cerrado', close: newStatus ? '13:00' : 'Cerrado' }, sunday: { open: 'Cerrado', close: 'Cerrado' } }); triggerSuccess(newStatus ? '¡Tienda Abierta!' : 'Tienda Cerrada'); } };
  const handleUpdateHours = () => { if(localHours && setOpeningHours) { setOpeningHours(localHours); triggerSuccess('Horarios actualizados correctamente 🕒'); } };
  const handleAddProduct = () => { if (!newProd.name || !newProd.price) { playSound('ERROR'); alert("Por favor ponle nombre y precio al producto"); return; } const p: Product = { id: Date.now().toString(), name: newProd.name, price: Number(newProd.price), category: newProd.category, subCategory: 'General', brand: 'Generico', description: newProd.description || 'Producto nuevo', image: 'https://placehold.co/400x400/png?text=' + newProd.name.substring(0,3), stock: 50 }; addProduct(p); refreshProducts(); setNewProd({ name: '', price: '', category: 'Escolar', description: '' }); triggerSuccess('¡Producto agregado correctamente! ✅'); };
  const handleDeleteProduct = (id: string) => { if(confirm("¿Seguro que quieres borrar este producto?")) { deleteProduct(id); refreshProducts(); setStatusMessage('Producto eliminado'); setTimeout(() => setStatusMessage(''), 2000); } };
  const handleCompleteOrder = (id: string) => { updateOrderStatus(id, 'COMPLETED'); setOrders(getOrders()); triggerSuccess('Pedido marcado como completado. ¡Buen trabajo!'); };
  const handleDeleteOrder = (id: string) => { if(confirm("¿Eliminar este pedido permanentemente? No se podrá recuperar.")) { setOrders(deleteOrder(id)); triggerSuccess('Pedido eliminado del historial.'); } };
  const handleScanProduct = () => { setShowScanner(true); playSound('POP'); setTimeout(() => { playSound('SUCCESS'); setShowScanner(false); const random = products[Math.floor(Math.random() * products.length)]; if (random) { setInventorySearch(random.name); triggerSuccess(`¡Encontrado: ${random.name}!`); } }, 1500); };
  const handlePayDebt = (id: string) => { setDebtors(payDebt(id)); triggerSuccess('¡Deuda pagada! 💰'); };
  const handleAddExpense = () => { if(!expenseForm.description || !expenseForm.amount) return; const newExp: Expense = { id: Date.now().toString(), description: expenseForm.description, amount: Number(expenseForm.amount), category: expenseForm.category, date: Date.now() }; setExpenses(saveExpense(newExp)); setExpenseForm({description:'', amount:'', category: 'OTHER'}); triggerSuccess('Gasto registrado 💸'); };
  const handleToggleBlock = (userName: string) => { toggleUserBlock(userName); setKnownUsers(getAllKnownUsers()); triggerSuccess(isUserBlocked(userName) ? `Usuario ${userName} bloqueado 🚫` : `Usuario ${userName} desbloqueado ✅`); };
  const handleGenerateMedia = async () => { if (!selectedProductForAd) { alert("Selecciona un producto primero"); return; } setIsLoading(true); setGeneratedMediaUrl(''); setMarketingResult(''); setEstimatedTime(null); const prod = products.find(p => p.id === selectedProductForAd); if (prod) { try { if (marketingType === 'COPY') { setEstimatedTime("Segundos..."); const copy = await generateMarketingCopy(prod.name + " " + prod.description); setMarketingResult(copy); } else if (marketingType === 'VIDEO') { setEstimatedTime("1-2 minutos (Generando Video Veo)..."); const prompt = mediaPrompt || `Comercial profesional para ${prod.name}, estilo minimalista y limpio`; const videoUrl = await generatePromoVideo(prompt, '16:9'); setGeneratedMediaUrl(videoUrl); } else if (marketingType === 'PHOTO') { setEstimatedTime("10-15 segundos (Renderizando Imagen)..."); const prompt = mediaPrompt || `Fotografía profesional de producto, iluminación de estudio, fondo minimalista`; const newImage = await enhanceProductImage(prod.image, prompt); setGeneratedMediaUrl(newImage); } else if (marketingType === 'EBERT_REVIEW') { setEstimatedTime("1-2 minutos (Generando video y guion)..."); const script = await generateMarketingCopy(`Escribe un guion muy corto y divertido donde un bebé llamado Ebert recomienda ${prod.name}.`); setMarketingResult(script); const prompt = `Primer plano suave y brillante de ${prod.name} en una mesa de escuela, estilo colorido y feliz.`; const videoUrl = await generatePromoVideo(prompt, '9:16'); setGeneratedMediaUrl(videoUrl); } playSound('SUCCESS'); } catch (e) { console.error(e); alert("Hubo un error generando el contenido. Intenta de nuevo."); } } setIsLoading(false); setEstimatedTime(null); };
  const handleApplyGeneratedImage = () => { if (selectedProductForAd && generatedMediaUrl && marketingType === 'PHOTO') { const prod = products.find(p => p.id === selectedProductForAd); if (prod) { updateProduct({ ...prod, image: generatedMediaUrl }); refreshProducts(); triggerSuccess("Imagen del producto actualizada ✅"); setGeneratedMediaUrl(''); } } };
  const handleSaveMascotConfig = () => { saveMascotConfig(mascotConfig); triggerSuccess('Configuración de mascotas actualizada 🤖'); };
  const handleCreateOffer = () => { if(!offerForm.productId) return; const offer: ExpressOffer = { id: Date.now().toString(), productId: offerForm.productId, discountPercent: offerForm.discount, durationMinutes: offerForm.duration, endTime: Date.now() + (offerForm.duration * 60000), active: true }; createOffer(offer); setOfferForm({productId: '', discount: 20, duration: 60}); triggerSuccess('¡Oferta Flash Creada! ⚡'); };
  const handleCreateBundle = () => { if(!bundleForm.title || bundleForm.selectedIds.length < 2) { alert("Selecciona al menos 2 productos y pon un título"); return; } const bundle: ComboBundle = { id: Date.now().toString(), title: bundleForm.title, description: bundleForm.description, discountPercent: bundleForm.discount, productIds: bundleForm.selectedIds }; saveBundle(bundle); setBundles(getBundles()); setBundleForm({title: '', discount: 10, description: '', selectedIds: []}); triggerSuccess('¡Combo creado exitosamente! 🎒'); };
  const handleCreateStory = () => { if(!storyForm.title) return; const story: StoryOffer = { id: Date.now().toString(), title: storyForm.title, subtitle: storyForm.subtitle, color: storyForm.color, expiresAt: Date.now() + 86400000, seen: false }; saveFlashStory(story); setStoryForm({title:'', subtitle:'', color: '#CE1126'}); setStories(getFlashStories()); triggerSuccess('Historia publicada en la app 📱'); };
  const handleDeleteBundle = (id: string) => { deleteBundle(id); setBundles(getBundles()); triggerSuccess('Combo eliminado'); };
  
  const handleScheduleEvent = () => {
      if(!eventForm.title || !eventForm.message) return;
      broadcastNotification(eventForm.title, eventForm.message, eventForm.date || undefined);
      setEventForm({title:'', message:'', date:''});
      setScheduledEvents(getNotifications().filter(n => n.type === 'EVENT' && n.scheduledDate));
      triggerSuccess(eventForm.date ? 'Evento programado 📅' : 'Notificación enviada 📡');
  };
  
  const handleDeleteScheduled = (id: string) => {
      deleteNotifService(id);
      setScheduledEvents(getNotifications().filter(n => n.type === 'EVENT' && n.scheduledDate));
      triggerSuccess('Evento cancelado');
  };

  const MENU_ITEMS: {id: Tab, label: string, icon: string, desc: string}[] = [
    { id: 'INICIO', label: 'Resumen', icon: 'fa-home', desc: 'Vista general' },
    { id: 'PEDIDOS', label: 'Pedidos', icon: 'fa-clipboard-check', desc: 'Para empacar' },
    { id: 'CLIENTES', label: 'Clientes', icon: 'fa-users', desc: 'Fiados y VIP' },
    { id: 'PRODUCTOS', label: 'Inventario', icon: 'fa-boxes-stacked', desc: 'Precios y stock' },
    { id: 'MARKETING', label: 'Estudio IA', icon: 'fa-photo-film', desc: 'Crear fotos/videos' },
    { id: 'OFERTAS', label: 'Ofertas', icon: 'fa-tags', desc: 'Combos y promos' },
    { id: 'COMUNIDAD', label: 'Comunidad', icon: 'fa-comments', desc: 'Sugerencias' },
    { id: 'MASCOTAS', label: 'Mascotas', icon: 'fa-paw', desc: 'Configurar' },
    { id: 'HERRAMIENTAS', label: 'Herramientas', icon: 'fa-toolbox', desc: 'Gastos y Respaldos' },
    { id: 'CONFIGURACIÓN', label: 'Mi Perfil', icon: 'fa-user-gear', desc: 'Ajustes y cuenta' },
  ];
  
  const apiEnergyPercent = Math.max(0, 100 - (apiUsage.count / apiUsage.limit * 100));
  const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = (analyticsData?.totalRevenue || 0) - totalExpenses;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-20 relative overflow-hidden">
      {showConfetti && <div className="fixed inset-0 pointer-events-none z-[100] flex justify-center overflow-hidden"><div className="w-full h-full bg-contain" style={{backgroundImage: 'url("https://media.giphy.com/media/26tOZ42Mg6pbTUPVS/giphy.gif")', opacity: 0.2}}></div></div>}
      {selectedOrder && <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

      <header className="bg-white shadow-sm sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 ${styles.bg} text-white rounded-2xl flex items-center justify-center text-xl shadow-md border-2 border-white`}>
            <i className="fa-solid fa-user-tie"></i>
          </div>
          <div>
            <h1 className={`text-xl font-black ${styles.text} leading-none`}>{greeting} ❤️</h1>
            <p className="text-xs text-slate-500 font-medium mt-1">
               {orders.filter(o => o.status === 'PENDING').length > 0 ? `🔴 ${orders.filter(o => o.status === 'PENDING').length} pedidos pendientes` : '🟢 Todo tranquilo'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4"><button className="md:hidden bg-slate-100 p-2 rounded-lg text-slate-500" onClick={() => setCurrentTab('INICIO')}><i className="fa-solid fa-grid"></i></button></div>
      </header>
      {statusMessage && (<div className="fixed bottom-6 right-6 z-[100] animate-slide-left"><div className={`${styles.bg} text-white px-6 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-md`}><i className="fa-solid fa-check-circle text-green-400 text-xl"></i> <span>{statusMessage}</span></div></div>)}
      {showScanner && (<div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center"><div className="relative w-80 h-80 border-4 border-white/50 rounded-3xl flex flex-col items-center justify-center"><div className="absolute inset-0 border-4 border-red-500 animate-pulse rounded-3xl opacity-50"></div><div className="w-full h-1 bg-red-500 absolute top-1/2 shadow-[0_0_10px_red] animate-bounce-short"></div><p className="mt-40 text-white font-bold tracking-widest uppercase">Escaneando...</p></div></div>)}

      <div className="max-w-7xl mx-auto p-4 md:p-6 flex gap-6">
         <div className={`w-full md:w-64 flex-shrink-0 space-y-2 ${currentTab === 'INICIO' ? 'block' : 'hidden md:block'}`}>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 px-2 hidden md:block">Menú Principal</h3>
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2">
               {MENU_ITEMS.map(item => (
                   <button key={item.id} onClick={() => setCurrentTab(item.id)} className={`p-3 rounded-2xl flex items-center gap-3 transition-all text-left group active:scale-95 ${currentTab === item.id ? `bg-white shadow-md border-2 ${styles.border}` : 'bg-white border border-slate-100 hover:bg-slate-50'}`}>
                       <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm ${currentTab === item.id ? styles.bg : 'bg-slate-300'}`}><i className={`fa-solid ${item.icon}`}></i></div>
                       <div><div className={`font-bold text-xs ${currentTab === item.id ? styles.text : 'text-slate-700'}`}>{item.label}</div></div>
                   </button>
               ))}
            </div>
         </div>

         <div className={`flex-1 ${currentTab === 'INICIO' ? 'hidden md:block' : 'block'}`}>
            <button onClick={() => setCurrentTab('INICIO')} className="md:hidden mb-4 flex items-center gap-2 text-slate-500 font-bold"><i className="fa-solid fa-arrow-left"></i> Volver al Menú</button>

            {currentTab === 'INICIO' && analyticsData && (
               <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl shadow-card border border-slate-100 bg-gradient-to-r from-white to-slate-50"><div><h2 className="text-2xl font-black text-slate-800">Panel de Control</h2><p className="text-slate-500 text-sm">Resumen de actividad de Sudomsur</p></div><button onClick={toggleStoreStatus} className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform active:scale-95 flex items-center gap-2 ${isOpen ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}><i className={`fa-solid ${isOpen ? 'fa-store' : 'fa-store-slash'}`}></i>{isOpen ? 'TIENDA ABIERTA' : 'TIENDA CERRADA'}</button></div>
                  <div className="bg-slate-800 p-6 rounded-3xl shadow-card text-white relative overflow-hidden"><div className="relative z-10 flex justify-between items-center mb-2"><h3 className="font-bold flex items-center gap-2"><i className="fa-solid fa-battery-half"></i> Energía de Mascotas (API)</h3><span className="text-xs font-bold">{Math.round(apiEnergyPercent)}%</span></div><div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden mb-2 relative z-10"><div className={`h-full transition-all duration-1000 ${apiEnergyPercent > 50 ? 'bg-green-400' : apiEnergyPercent > 20 ? 'bg-yellow-400' : 'bg-red-500'}`} style={{width: `${apiEnergyPercent}%`}}></div></div><p className="text-xs text-slate-400 relative z-10">{apiEnergyPercent <= 0 ? "⚠️ Mascotas dormidas (Límite alcanzado). Volverán mañana." : `Quedan ${apiUsage.limit - apiUsage.count} interacciones hoy.`}</p></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"><div className="text-slate-400 text-xs font-bold uppercase mb-1">Ventas Hoy</div><div className={`text-2xl font-black ${styles.text}`}>RD${analyticsData.totalRevenue.toLocaleString()}</div></div>
                     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"><div className="text-slate-400 text-xs font-bold uppercase mb-1">Ganancia Real</div><div className={`text-2xl font-black ${netProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>RD${netProfit.toLocaleString()}</div></div>
                     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"><div className="text-slate-400 text-xs font-bold uppercase mb-1">Pedidos</div><div className={`text-2xl font-black ${styles.text}`}>{analyticsData.totalOrders}</div></div>
                     <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all"><div className="text-slate-400 text-xs font-bold uppercase mb-1">Stock Bajo</div><div className="text-2xl font-black text-red-500">{products.filter(p => (p.stock || 0) < 10).length}</div></div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                      <button onClick={() => setCurrentTab('PEDIDOS')} className="bg-blue-50 hover:bg-blue-100 p-4 rounded-xl text-blue-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors"><i className="fa-solid fa-clipboard-check"></i> Ver Pedidos</button>
                      <button onClick={() => setCurrentTab('MARKETING')} className="bg-purple-50 hover:bg-purple-100 p-4 rounded-xl text-purple-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors"><i className="fa-solid fa-wand-magic-sparkles"></i> Crear Promo</button>
                      <button onClick={() => setCurrentTab('HERRAMIENTAS')} className="bg-slate-100 hover:bg-slate-200 p-4 rounded-xl text-slate-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors"><i className="fa-solid fa-calculator"></i> Registrar Gasto</button>
                      <button onClick={() => setCurrentTab('CLIENTES')} className="bg-green-50 hover:bg-green-100 p-4 rounded-xl text-green-700 font-bold text-sm flex items-center justify-center gap-2 transition-colors"><i className="fa-solid fa-user-plus"></i> Nuevo Cliente</button>
                  </div>
               </div>
            )}
            
            {currentTab === 'PEDIDOS' && (
                <div className="space-y-4 animate-fade-in">
                    <h2 className={`text-xl font-black ${styles.text} mb-4`}>Gestión de Pedidos</h2>
                    {orders.length === 0 ? <p className="text-slate-400 italic">No hay pedidos recientes.</p> : orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4 cursor-pointer hover:shadow-md transition-all" onClick={() => setSelectedOrder(order)}>
                            <div className="flex-1">
                                <div className="flex items-center gap-2"><span className={`font-bold ${styles.text}`}>#{order.id.slice(-4)}</span><span className="text-sm font-medium text-slate-600"> - {order.clientName}</span></div>
                                <div className="text-xs text-slate-400 mt-1">{new Date(order.date).toLocaleString()} • {order.items.length} items</div>
                            </div>
                            <div className={`font-black text-lg ${styles.text}`}>RD${order.total.toLocaleString()}</div>
                            <div className="flex items-center gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleCompleteOrder(order.id); }} disabled={order.status === 'COMPLETED'} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${order.status === 'COMPLETED' ? 'bg-green-100 text-green-600' : 'bg-slate-100 hover:bg-green-100 text-slate-400 hover:text-green-600'}`}><i className="fa-solid fa-check"></i></button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(order.id); }} className="w-10 h-10 rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 flex items-center justify-center transition-all"><i className="fa-solid fa-trash"></i></button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {currentTab === 'HERRAMIENTAS' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-3xl shadow-card border border-red-100">
                        <h3 className="font-black text-xl text-red-600 mb-4"><i className="fa-solid fa-money-bill-wave"></i> Registro de Gastos Operativos</h3>
                        <div className="flex flex-col md:flex-row gap-4 mb-4">
                            <input placeholder="Descripción (Ej. Luz, Comida)" value={expenseForm.description} onChange={e => setExpenseForm({...expenseForm, description: e.target.value})} className="flex-1 p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                            <input type="number" placeholder="Monto (RD$)" value={expenseForm.amount} onChange={e => setExpenseForm({...expenseForm, amount: e.target.value})} className="w-32 p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                            <select value={expenseForm.category} onChange={e => setExpenseForm({...expenseForm, category: e.target.value as any})} className="p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100">
                                <option value="OTHER">Otro</option>
                                <option value="FOOD">Comida</option>
                                <option value="TRANSPORT">Pasaje</option>
                                <option value="SUPPLIES">Insumos</option>
                            </select>
                            <button onClick={handleAddExpense} className="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 shadow-md">Registrar</button>
                        </div>
                        <div className="mt-4">
                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Últimos Gastos</h4>
                            <div className="space-y-2 h-40 overflow-y-auto">
                                {expenses.map(exp => (
                                    <div key={exp.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                        <div><span className="font-bold text-slate-700 block">{exp.description}</span><span className="text-xs text-slate-400">{new Date(exp.date).toLocaleDateString()}</span></div>
                                        <span className="font-black text-red-500">-RD${exp.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="font-bold text-slate-600">Total Gastos Histórico</span>
                                <span className="font-black text-xl text-red-600">RD${totalExpenses.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-3xl shadow-card border border-blue-100">
                            <h3 className="font-black text-xl text-blue-600 mb-4"><i className="fa-solid fa-download"></i> Copia de Seguridad</h3>
                            <p className="text-sm text-slate-500 mb-4">Descarga toda la base de datos de la tienda para no perder nada.</p>
                            <button onClick={exportData} className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-600 flex items-center justify-center gap-2"><i className="fa-solid fa-cloud-arrow-down"></i> Descargar Datos</button>
                        </div>
                        <div className="bg-white p-6 rounded-3xl shadow-card border border-orange-100">
                            <h3 className="font-black text-xl text-orange-600 mb-4"><i className="fa-solid fa-upload"></i> Restaurar Datos</h3>
                            <p className="text-sm text-slate-500 mb-4">Carga un archivo de respaldo anterior.</p>
                            <input type="file" onChange={(e) => { if(e.target.files?.[0]) importData(e.target.files[0]).then(ok => ok ? triggerSuccess('Datos restaurados') : alert('Error')) }} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"/>
                        </div>
                    </div>
                </div>
            )}
            
            {currentTab === 'CLIENTES' && (
                <div className="bg-white rounded-3xl shadow-card border border-slate-100 p-6 animate-fade-in">
                    <h2 className={`text-xl font-black ${styles.text} mb-6 flex items-center gap-2`}><i className="fa-solid fa-users"></i> Gestión de Clientes</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                           <h3 className="font-bold text-sm text-slate-600 mb-3 uppercase tracking-wide">Usuarios Conocidos</h3>
                           <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden h-64 overflow-y-auto">
                               {knownUsers.length === 0 && <p className="p-4 text-slate-400 text-sm italic">No hay usuarios registrados aún.</p>}
                               {knownUsers.map((user, i) => (
                                   <div key={i} className="flex justify-between items-center p-4 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                                       <div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full ${styles.bg} opacity-80 flex items-center justify-center text-white font-bold`}>{user.charAt(0)}</div><span className={`font-bold ${isUserBlocked(user) ? 'text-red-400 line-through' : 'text-slate-700'}`}>{user}</span></div>
                                       <button onClick={() => handleToggleBlock(user)} className={`text-xs font-bold px-3 py-1 rounded-lg transition-colors ${isUserBlocked(user) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{isUserBlocked(user) ? 'Desbloquear' : 'Bloquear'}</button>
                                   </div>
                               ))}
                           </div>
                        </div>
                        <div>
                           <h3 className="font-bold text-sm text-slate-600 mb-3 uppercase tracking-wide">Top 5 Clientes</h3>
                           <div className="space-y-3">
                               {topClients.map((client, i) => (
                                   <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                                       <div className="flex items-center gap-3"><div className="text-xl font-black text-yellow-400">#{i+1}</div><div><div className="font-bold text-slate-800">{client.name}</div><div className="text-xs text-slate-500">{client.count} pedidos</div></div></div>
                                       <div className={`font-black ${styles.text}`}>RD${client.total.toLocaleString()}</div>
                                   </div>
                               ))}
                           </div>
                        </div>
                    </div>
                </div>
            )}
            
            {currentTab === 'PRODUCTOS' && (
                <div className="space-y-4 animate-fade-in">
                     <div className="bg-white p-6 rounded-3xl shadow-card border border-orange-100">
                         <h3 className="font-black text-lg text-orange-600 mb-4"><i className="fa-solid fa-plus-circle"></i> Agregar Producto</h3>
                         <div className="grid md:grid-cols-2 gap-4 mb-4">
                             <input placeholder="Nombre del Producto" value={newProd.name} onChange={e => setNewProd({...newProd, name: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                             <input type="number" placeholder="Precio" value={newProd.price} onChange={e => setNewProd({...newProd, price: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                             <select value={newProd.category} onChange={e => setNewProd({...newProd, category: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100"><option value="Escolar">Escolar</option><option value="Oficina">Oficina</option><option value="Tecnología">Tecnología</option><option value="Servicios">Servicios</option></select>
                             <input placeholder="Descripción breve" value={newProd.description} onChange={e => setNewProd({...newProd, description: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                         </div>
                         <button onClick={handleAddProduct} className="w-full bg-orange-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-orange-600">Guardar Producto</button>
                     </div>
                     <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-100">
                         <div className="flex justify-between items-center mb-4"><h3 className="font-black text-lg text-slate-700">Inventario Actual</h3><button onClick={handleScanProduct} className="text-xs bg-slate-100 px-3 py-1 rounded-full font-bold text-slate-500 hover:bg-slate-200"><i className="fa-solid fa-barcode"></i> Escanear</button></div>
                         <input placeholder="Buscar producto..." value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100 mb-4" />
                         <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
                             {products.filter(p => p.name.toLowerCase().includes(inventorySearch.toLowerCase())).map(p => (
                                 <div key={p.id} className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 relative group">
                                     <img src={p.image} className="w-16 h-16 rounded-lg object-cover bg-white" />
                                     <div><div className="font-bold text-sm text-slate-800 line-clamp-1">{p.name}</div><div className="text-xs text-slate-500">Stock: {p.stock || 0}</div><div className={`font-black ${styles.text}`}>RD${p.price}</div></div>
                                     <button onClick={() => handleDeleteProduct(p.id)} className="absolute top-2 right-2 text-red-300 hover:text-red-500"><i className="fa-solid fa-trash"></i></button>
                                 </div>
                             ))}
                         </div>
                     </div>
                </div>
            )}
            
            {currentTab === 'MASCOTAS' && (
                <div className="bg-white p-6 rounded-3xl shadow-card border border-green-100 animate-fade-in">
                    <h2 className="text-xl font-black text-green-600 mb-6"><i className="fa-solid fa-paw"></i> Personalizar Mascotas</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                         <div>
                             <h3 className="font-bold text-slate-700 mb-2">Angel (Gerente)</h3>
                             <div className="space-y-3">
                                 <div><label className="text-xs font-bold text-slate-400 uppercase">Ropa</label><div className="flex gap-2 mt-1"><button onClick={() => setMascotConfig({...mascotConfig, angelOutfit: 'CASUAL'})} className={`px-3 py-1 rounded-lg text-xs font-bold ${mascotConfig.angelOutfit === 'CASUAL' ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>Casual</button><button onClick={() => setMascotConfig({...mascotConfig, angelOutfit: 'FORMAL'})} className={`px-3 py-1 rounded-lg text-xs font-bold ${mascotConfig.angelOutfit === 'FORMAL' ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>Formal</button><button onClick={() => setMascotConfig({...mascotConfig, angelOutfit: 'PJ'})} className={`px-3 py-1 rounded-lg text-xs font-bold ${mascotConfig.angelOutfit === 'PJ' ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>Pijama</button></div></div>
                             </div>
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-700 mb-2">Ebert (Bebé)</h3>
                             <div className="space-y-3">
                                 <div><label className="text-xs font-bold text-slate-400 uppercase">Ropa</label><div className="flex gap-2 mt-1"><button onClick={() => setMascotConfig({...mascotConfig, ebertOutfit: 'CASUAL'})} className={`px-3 py-1 rounded-lg text-xs font-bold ${mascotConfig.ebertOutfit === 'CASUAL' ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>Casual</button><button onClick={() => setMascotConfig({...mascotConfig, ebertOutfit: 'FORMAL'})} className={`px-3 py-1 rounded-lg text-xs font-bold ${mascotConfig.ebertOutfit === 'FORMAL' ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>Formal</button><button onClick={() => setMascotConfig({...mascotConfig, ebertOutfit: 'PJ'})} className={`px-3 py-1 rounded-lg text-xs font-bold ${mascotConfig.ebertOutfit === 'PJ' ? 'bg-green-500 text-white' : 'bg-slate-100'}`}>Pijama</button></div></div>
                             </div>
                         </div>
                    </div>
                    <button onClick={handleSaveMascotConfig} className="mt-6 w-full bg-green-500 text-white py-3 rounded-xl font-bold shadow-md hover:bg-green-600">Guardar Cambios</button>
                </div>
            )}

            {currentTab === 'CONFIGURACIÓN' && (
                <div className="bg-white p-6 rounded-3xl shadow-card border border-slate-200 animate-fade-in">
                    <h2 className="text-xl font-black text-slate-700 mb-6"><i className="fa-solid fa-gear"></i> Configuración de Tienda</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                         <div>
                             <h3 className="font-bold text-sm text-slate-500 uppercase mb-4">Apariencia (Tema)</h3>
                             <div className="grid grid-cols-2 gap-3">
                                 {['DEFAULT', 'VALENTINES', 'PATRIO', 'SCHOOL', 'CHRISTMAS'].map(t => (
                                     <button key={t} onClick={() => setTheme(t as any)} className={`p-3 rounded-xl border font-bold text-xs ${theme === t ? `border-blue-500 ${styles.bg} text-white` : 'border-slate-100 text-slate-500'}`}>{t}</button>
                                 ))}
                             </div>
                         </div>
                         <div>
                             <h3 className="font-bold text-sm text-slate-500 uppercase mb-4">Horarios</h3>
                             <button onClick={handleUpdateHours} className="w-full bg-slate-800 text-white py-3 rounded-xl font-bold hover:bg-slate-900">Actualizar Horarios</button>
                         </div>
                    </div>
                </div>
            )}
            
            {currentTab === 'MARKETING' && (
                <div className="bg-white p-6 rounded-3xl shadow-card border border-purple-100 animate-fade-in space-y-6">
                    <div className="flex justify-between items-center"><h2 className="text-xl font-black text-purple-600"><i className="fa-solid fa-wand-magic-sparkles"></i> Estudio Creativo IA</h2><span className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded-full font-bold">Powered by Gemini</span></div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase">1. Configuración</h3>
                            <select value={selectedProductForAd} onChange={e => setSelectedProductForAd(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100">
                                <option value="">Selecciona un Producto...</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            
                            <div className="grid grid-cols-2 gap-2">
                                {[
                                    {id: 'COPY', icon: 'fa-align-left', label: 'Texto Venta'},
                                    {id: 'PHOTO', icon: 'fa-image', label: 'Foto Estudio'},
                                    {id: 'VIDEO', icon: 'fa-video', label: 'Video Promo'},
                                    {id: 'EBERT_REVIEW', icon: 'fa-baby', label: 'Reseña Ebert'}
                                ].map(type => (
                                    <button key={type.id} onClick={() => setMarketingType(type.id as any)} className={`p-3 rounded-xl flex flex-col items-center gap-2 border transition-all ${marketingType === type.id ? 'bg-purple-600 text-white border-purple-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:bg-purple-50'}`}>
                                        <i className={`fa-solid ${type.icon} text-xl`}></i>
                                        <span className="text-[10px] font-bold uppercase">{type.label}</span>
                                    </button>
                                ))}
                            </div>
                            
                            {(marketingType === 'VIDEO' || marketingType === 'PHOTO') && (
                                <input placeholder="Prompt opcional (Ej: Fondo navideño...)" value={mediaPrompt} onChange={e => setMediaPrompt(e.target.value)} className="w-full p-3 bg-slate-50 rounded-xl text-sm border border-slate-100" />
                            )}
                            
                            <button onClick={handleGenerateMedia} disabled={isLoading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-50 flex items-center justify-center gap-2">
                                {isLoading ? <><i className="fa-solid fa-circle-notch animate-spin"></i> Generando...</> : <><i className="fa-solid fa-bolt"></i> Crear Contenido</>}
                            </button>
                            {estimatedTime && <p className="text-center text-xs text-slate-400 animate-pulse">Tiempo estimado: {estimatedTime}</p>}
                        </div>

                        <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6 flex flex-col items-center justify-center min-h-[300px] relative overflow-hidden">
                            {!marketingResult && !generatedMediaUrl && !isLoading && <div className="text-center text-slate-400"><i className="fa-solid fa-photo-film text-4xl mb-2"></i><p>El resultado aparecerá aquí</p></div>}
                            
                            {marketingResult && (
                                <div className="w-full text-left">
                                    <h4 className="font-bold text-slate-700 mb-2">Texto Generado:</h4>
                                    <textarea readOnly value={marketingResult} className="w-full h-40 p-3 bg-white rounded-xl border border-slate-200 text-sm resize-none focus:outline-none" />
                                    <button onClick={() => { navigator.clipboard.writeText(marketingResult); triggerSuccess("Copiado!"); }} className="mt-2 text-xs font-bold text-purple-600 hover:underline"><i className="fa-solid fa-copy"></i> Copiar Texto</button>
                                </div>
                            )}

                            {generatedMediaUrl && (
                                <div className="w-full h-full flex flex-col items-center">
                                    {marketingType === 'VIDEO' || marketingType === 'EBERT_REVIEW' ? (
                                        <video src={generatedMediaUrl} controls className="w-full rounded-xl shadow-lg max-h-60" />
                                    ) : (
                                        <div className="relative group">
                                            <img src={generatedMediaUrl} className="w-full rounded-xl shadow-lg max-h-60 object-contain" />
                                            {marketingType === 'PHOTO' && <button onClick={handleApplyGeneratedImage} className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 text-slate-900 px-4 py-2 rounded-full text-xs font-bold shadow-lg hover:bg-white active:scale-95">Usar en Producto</button>}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {currentTab === 'OFERTAS' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-3xl shadow-card border border-yellow-100">
                        <h2 className="text-xl font-black text-yellow-600 mb-6 flex items-center gap-2"><i className="fa-solid fa-tags"></i> Centro de Ofertas</h2>
                        
                        <div className="grid md:grid-cols-3 gap-6">
                            {/* FLASH OFFERS */}
                            <div className="bg-yellow-50/50 p-5 rounded-2xl border border-yellow-100">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><i className="fa-solid fa-bolt text-yellow-500"></i> Oferta Flash</h3>
                                <div className="space-y-3">
                                    <select value={offerForm.productId} onChange={e => setOfferForm({...offerForm, productId: e.target.value})} className="w-full p-2 bg-white rounded-lg text-xs font-bold border border-slate-200"><option value="">Producto...</option>{products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="%" value={offerForm.discount} onChange={e => setOfferForm({...offerForm, discount: Number(e.target.value)})} className="w-1/2 p-2 bg-white rounded-lg text-xs font-bold border border-slate-200" />
                                        <input type="number" placeholder="Mins" value={offerForm.duration} onChange={e => setOfferForm({...offerForm, duration: Number(e.target.value)})} className="w-1/2 p-2 bg-white rounded-lg text-xs font-bold border border-slate-200" />
                                    </div>
                                    <button onClick={handleCreateOffer} className="w-full bg-yellow-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-yellow-600 shadow-sm">Crear Flash</button>
                                </div>
                            </div>

                            {/* BUNDLES */}
                            <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><i className="fa-solid fa-box text-blue-500"></i> Nuevo Combo</h3>
                                <div className="space-y-3">
                                    <input placeholder="Título (Ej. Kit Escolar)" value={bundleForm.title} onChange={e => setBundleForm({...bundleForm, title: e.target.value})} className="w-full p-2 bg-white rounded-lg text-xs font-bold border border-slate-200" />
                                    <select multiple className="w-full p-2 bg-white rounded-lg text-xs font-bold border border-slate-200 h-20" onChange={e => setBundleForm({...bundleForm, selectedIds: Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value)})}>
                                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <div className="flex gap-2 items-center">
                                        <span className="text-xs font-bold text-slate-500">Desc:</span>
                                        <input type="number" value={bundleForm.discount} onChange={e => setBundleForm({...bundleForm, discount: Number(e.target.value)})} className="w-16 p-2 bg-white rounded-lg text-xs font-bold border border-slate-200" />
                                        <span className="text-xs font-bold text-slate-500">%</span>
                                    </div>
                                    <button onClick={handleCreateBundle} className="w-full bg-blue-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-blue-600 shadow-sm">Guardar Combo</button>
                                </div>
                            </div>

                            {/* STORIES */}
                            <div className="bg-pink-50/50 p-5 rounded-2xl border border-pink-100">
                                <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2"><i className="fa-solid fa-mobile-screen text-pink-500"></i> Historia App</h3>
                                <div className="space-y-3">
                                    <input placeholder="Título Grande" value={storyForm.title} onChange={e => setStoryForm({...storyForm, title: e.target.value})} className="w-full p-2 bg-white rounded-lg text-xs font-bold border border-slate-200" />
                                    <input placeholder="Subtítulo" value={storyForm.subtitle} onChange={e => setStoryForm({...storyForm, subtitle: e.target.value})} className="w-full p-2 bg-white rounded-lg text-xs font-bold border border-slate-200" />
                                    <input type="color" value={storyForm.color} onChange={e => setStoryForm({...storyForm, color: e.target.value})} className="w-full h-8 cursor-pointer rounded-lg border border-slate-200" />
                                    <button onClick={handleCreateStory} className="w-full bg-pink-500 text-white py-2 rounded-lg text-xs font-bold hover:bg-pink-600 shadow-sm">Publicar Historia</button>
                                </div>
                            </div>
                        </div>

                        {/* LIST OF ACTIVE BUNDLES */}
                        <div className="mt-8">
                             <h3 className="font-bold text-slate-700 mb-4 border-b border-slate-100 pb-2">Combos Activos</h3>
                             <div className="grid md:grid-cols-2 gap-4">
                                 {bundles.map(b => (
                                     <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                                         <div><h4 className={`font-black ${styles.text} text-sm`}>{b.title}</h4><p className="text-xs text-slate-500">{b.productIds.length} productos • {b.discountPercent}% OFF</p></div>
                                         <button onClick={() => handleDeleteBundle(b.id)} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                                     </div>
                                 ))}
                                 {bundles.length === 0 && <p className="text-slate-400 text-sm italic">No hay combos activos.</p>}
                             </div>
                        </div>
                    </div>
                </div>
            )}

            {currentTab === 'COMUNIDAD' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="bg-white p-6 rounded-3xl shadow-card border border-teal-100">
                         <h2 className="text-xl font-black text-teal-600 mb-6 flex items-center gap-2"><i className="fa-solid fa-comments"></i> Comunidad & Solicitudes</h2>
                         
                         <div className="grid md:grid-cols-2 gap-6">
                             {/* SPECIAL REQUESTS */}
                             <div>
                                 <h3 className="font-bold text-slate-700 mb-3 uppercase tracking-wide border-b border-slate-100 pb-2">Pedidos Especiales</h3>
                                 <div className="space-y-3 h-80 overflow-y-auto bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                     {specialRequests.length === 0 && <p className="text-slate-400 text-sm text-center py-10">Sin solicitudes pendientes.</p>}
                                     {specialRequests.map(req => (
                                         <div key={req.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                             <div className="flex justify-between items-start mb-2"><span className={`font-black ${styles.text} text-sm`}>{req.itemName}</span><span className="text-[10px] font-bold bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">{req.status}</span></div>
                                             <p className="text-xs text-slate-600 mb-2">{req.description}</p>
                                             <div className="flex justify-between items-center text-[10px] text-slate-400"><span>{req.clientName}</span><span>{new Date(req.date).toLocaleDateString()}</span></div>
                                         </div>
                                     ))}
                                 </div>
                             </div>

                             {/* SUGGESTIONS */}
                             <div>
                                 <h3 className="font-bold text-slate-700 mb-3 uppercase tracking-wide border-b border-slate-100 pb-2">Buzón de Sugerencias</h3>
                                 <div className="space-y-3 h-80 overflow-y-auto bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                     {suggestions.length === 0 && <p className="text-slate-400 text-sm text-center py-10">El buzón está vacío.</p>}
                                     {suggestions.map(sug => (
                                         <div key={sug.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                             <p className="text-sm text-slate-700 font-medium mb-2">"{sug.text}"</p>
                                             <div className="text-[10px] text-slate-400 text-right">- {sug.authorName}, {new Date(sug.date).toLocaleDateString()}</div>
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         </div>
                    </div>

                    {/* NOTIFICATIONS & EVENTS */}
                    <div className="bg-white p-6 rounded-3xl shadow-card border border-indigo-100">
                         <h2 className="text-xl font-black text-indigo-600 mb-6 flex items-center gap-2"><i className="fa-solid fa-calendar-check"></i> Eventos & Notificaciones</h2>
                         <div className="flex gap-4 mb-6">
                              <input placeholder="Título (Ej. Regreso a Clases)" value={eventForm.title} onChange={e => setEventForm({...eventForm, title: e.target.value})} className="flex-1 p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                              <input placeholder="Mensaje" value={eventForm.message} onChange={e => setEventForm({...eventForm, message: e.target.value})} className="flex-1 p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                              <input type="date" value={eventForm.date} onChange={e => setEventForm({...eventForm, date: e.target.value})} className="p-3 bg-slate-50 rounded-xl font-bold text-sm border border-slate-100" />
                              <button onClick={handleScheduleEvent} className="bg-indigo-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-600 shadow-md">Programar</button>
                         </div>
                         
                         <h3 className="font-bold text-slate-700 mb-2 uppercase tracking-wide text-xs">Eventos Programados</h3>
                         <div className="space-y-2">
                             {scheduledEvents.length === 0 && <p className="text-slate-400 text-sm italic">No hay eventos futuros programados.</p>}
                             {scheduledEvents.map(evt => (
                                 <div key={evt.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                                     <div><span className="font-bold text-indigo-700 block">{evt.title}</span><span className="text-xs text-slate-500">Programado para: {evt.scheduledDate}</span></div>
                                     <button onClick={() => handleDeleteScheduled(evt.id)} className="text-red-400 hover:text-red-600"><i className="fa-solid fa-trash"></i></button>
                                 </div>
                             ))}
                         </div>
                    </div>
                </div>
            )}

         </div>
      </div>
    </div>
  );
}