import { supabase } from '../src/lib/supabase'; // Ajusta la ruta si tu archivo está en otro lado
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PlusCircle, 
  Barcode, 
  AlignJustify,
  Home,
  ShoppingCart,
  Delete,
  User,
  Banknote,
  CreditCard,
  Smartphone,
  ArrowLeft,
  CheckCircle,
  X,
  Printer,
  Send,
  Settings,
  Upload
} from 'lucide-react';

interface DashboardLayoutProps {
  isBlurred?: boolean;
}

const CATEGORIES = [
  { id: 'all', name: 'Todo', icon: <Home size={16} />, color: 'bg-gray-200 text-gray-700' },
  { id: 'frutas', name: 'Frutas', color: 'bg-[#FADCD9] text-[#8B4513]' }, 
  { id: 'verduras', name: 'Verduras', color: 'bg-[#C1E1C1] text-[#2E8B57]' }, 
  { id: 'tuberculos', name: 'Tubérculos', color: 'bg-[#E6CCB2] text-[#5D4037]' },
  { id: 'frutales', name: 'Frutales', color: 'bg-[#FFE5B4] text-[#D2691E]' },
  { id: 'hortalizas', name: 'Hortalizas', color: 'bg-[#98FB98] text-[#006400]' },
  { id: 'bulbos', name: 'Bulbos', color: 'bg-[#E0B0FF] text-[#4B0082]' },
  { id: 'legumbres', name: 'Legumbres', color: 'bg-[#FFFACD] text-[#8B8000]' },
  { id: 'citricos', name: 'Cítricos', color: 'bg-[#FFD700] text-[#8B4500]' },
  { id: 'tropicales', name: 'Tropicales', color: 'bg-[#FF7F50] text-[#8B0000]' },
  { id: 'hierbas', name: 'Hierbas', color: 'bg-[#ACE1AF] text-[#006400]' },
];

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  image: string;
}

interface CartItem {
  product: Product;
  qty: number;
}

type ViewState = 'pos' | 'payment' | 'receipt' | 'backend';

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ isBlurred = false }) => {
  
  // --- CAMBIO 1: ESTADO INICIAL VACÍO (Esperando a Supabase) ---
  const [products, setProducts] = useState<Product[]>([]); 

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState<ViewState>('pos');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [tenderAmount, setTenderAmount] = useState('');

  // --- CAMBIO 2: CARGAR PRODUCTOS DESDE SUPABASE ---
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, categories(name)');
      
      if (error) {
        console.error("Error cargando productos:", error);
      } 
      
      if (data) {
        const productosReales = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          unit: 'kg',
          category: item.categories?.name || 'Varios',
          image: item.image_url || 'https://via.placeholder.com/150'
        }));
        setProducts(productosReales);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase()); // Pequeña mejora para ignorar mayúsculas

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      const incrementAmount = 1.5; 

      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
          ? { ...item, qty: item.qty + incrementAmount } 
          : item
        );
      }
      return [...prev, { product, qty: incrementAmount }];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0);

  const handleTenderInput = (val: string) => {
      if (val === 'backspace') {
          setTenderAmount(prev => prev.slice(0, -1));
      } else {
          setTenderAmount(prev => prev + val);
      }
  };
  
  const handleQuickCash = (amount: number) => {
      const current = parseFloat(tenderAmount) || 0;
      setTenderAmount((current + amount).toString());
  };

  // --- CAMBIO 3: PAGAR CON SUPABASE ---
  const handleValidateSale = async () => {
    if (cart.length === 0) return alert("El carrito esta vacio");
    
    try {
        const {data: {user} } = await supabase.auth.getUser();

        if (!user) {
            alert("Error: No hay sesión activa.");
            return;
        }

        const saleHeaderData = {
            user_id: user.id,
            total: cartTotal,
            payment_method: paymentMethod,
            created_at: new Date().toISOString()
        };

        const {data: saleData, error: saleError} = await supabase
            .from('sales_header')
            .insert(saleHeaderData)
            .select()
            .single();

        if (saleError) throw saleError;

        const newSaleId = saleData.id;

        const saleDetailData = cart.map(item => ({
            sale_id: newSaleId,
            product_id: item.product.id,
            quantity: item.qty,
            unit_price: item.product.price,
            subtotal: item.product.price * item.qty
        }));

        const {error: detailsError } = await supabase
            .from('sales_detail')
            .insert(saleDetailData);

        if (detailsError) throw detailsError;

        console.log("✅ Venta registrada ID:", newSaleId);
        setView('receipt');

    } catch (error: any) {
        console.error("Error venta:", error);
        alert("❌ Error: " + error.message);
    }
  };

  const handleNewOrder = () => {
      setCart([]);
      setTenderAmount('');
      setView('pos');
  };

  // Manejador de imagen (Visual local solamente por ahora)
  const handleImageUpload = (productId: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, image: base64String } : p
        ));
      };
      reader.readAsDataURL(file);
    }
  };

  const tenderedValue = parseFloat(tenderAmount) || 0;
  const difference = cartTotal - tenderedValue;
  const isChange = difference < 0;
  const changeAmount = Math.abs(difference);

  return (
    <div className={`flex flex-col h-screen bg-gray-100 text-gray-800 transition-all duration-300 ${isBlurred ? 'blur-[2px]' : ''}`}>
      
      {/* Header */}
      <header className="h-14 bg-white border-b border-gray-300 flex shrink-0 shadow-sm z-20 relative">
        <div className="w-[420px] border-r border-gray-300 flex items-center justify-between px-3 shrink-0">
          <div className="flex items-center space-x-2">
            <button onClick={() => setView('pos')} className={`px-3 py-1 font-medium text-sm rounded-sm transition-colors ${view === 'pos' ? 'bg-gray-700 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}>Registrar</button>
            <button className="px-3 py-1 text-gray-600 hover:bg-gray-100 font-medium text-sm rounded-sm transition-colors">Pedidos</button>
            <button className="p-1 text-gray-500 hover:bg-gray-100 rounded-full"><PlusCircle size={18} /></button>
          </div>
          <div className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-bold rounded border border-gray-300">1001</div>
        </div>

        <div className="flex-1 flex items-center px-3 gap-4">
            {view === 'pos' && (
                <>
                  <div className="flex h-12 border-4 border-gray-300 rounded overflow-hidden shadow-md">
                      <div className="bg-[#39FF14] w-48 flex items-center justify-end px-2 shadow-inner relative overflow-hidden">
                          <span className="font-digital text-black text-6xl leading-none tracking-widest translate-y-1">1.500</span>
                      </div>
                      <div className="bg-[#2c3e50] w-14 flex items-center justify-center border-l border-gray-600">
                          <span className="text-white font-medium text-xl">kg</span>
                      </div>
                  </div>
                  <div className="flex-1 max-w-md ml-auto">
                    <div className="relative group">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#704559]" size={16} />
                      <input type="text" placeholder="Buscar productos..." className="w-full pl-9 pr-4 py-1.5 bg-gray-50 border border-gray-200 focus:bg-white focus:border-[#704559] rounded-sm text-sm focus:outline-none transition-all shadow-inner" />
                    </div>
                  </div>
                </>
            )}
            
            {view === 'payment' && <div className="flex-1 flex justify-center"><h1 className="text-xl font-bold text-gray-600">PAGOS</h1></div>}
            {view === 'receipt' && <div className="flex-1 flex justify-center"><h1 className="text-xl font-bold text-gray-600">RECIBO</h1></div>}
            {view === 'backend' && <div className="flex-1 flex justify-center"><h1 className="text-xl font-bold text-gray-600">GESTIÓN DE INVENTARIO</h1></div>}

          <div className="flex items-center space-x-3 text-gray-500 ml-auto">
            <div className="flex items-center gap-1 pr-2 border-r border-gray-300">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
               <span className="text-xs font-medium text-green-600">Conectado</span>
            </div>
            <button onClick={() => setView(view === 'backend' ? 'pos' : 'backend')} className={`p-2 rounded transition-colors ${view === 'backend' ? 'bg-[#704559] text-white shadow-md' : 'hover:bg-gray-100 hover:text-gray-800'}`}><Settings size={20} /></button>
            <button className="hover:text-gray-800"><Barcode size={20} /></button>
            <div className="w-7 h-7 bg-[#A0522D] text-white rounded flex items-center justify-center font-bold text-xs cursor-pointer hover:opacity-90 shadow-sm">W</div>
            <button className="hover:text-gray-800"><AlignJustify size={20} /></button>
          </div>
        </div>
      </header>

      {/* CONTENT AREA */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* VIEW: POS (Standard) */}
        {view === 'pos' && (
            <>
                {/* LEFT PANEL: Cart / Numpad */}
                <div className="w-[420px] bg-white border-r border-gray-300 flex flex-col relative shadow-lg z-10 shrink-0">
                
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto scrollbar-thin">
                    {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
                        <ShoppingCart size={80} strokeWidth={1} />
                        <p className="font-medium text-gray-400 text-lg">La cesta está vacía</p>
                    </div>
                    ) : (
                    <div className="flex flex-col">
                        <div className="bg-gray-100 px-4 py-2 text-xs font-bold text-gray-500 border-b border-gray-200 flex sticky top-0 z-10">
                            <span className="flex-1">Producto</span>
                            <span className="w-20 text-center">Precio U.</span>
                            <span className="w-16 text-center">Cant/ Kg</span>
                            <span className="w-20 text-right">Total</span>
                        </div>
                        {cart.map((item, idx) => (
                        <div key={idx} className={`px-4 py-3 border-b border-gray-100 hover:bg-blue-50 cursor-pointer group flex items-center ${idx === cart.length - 1 ? 'bg-blue-50/50' : ''}`}>
                            <div className="flex-1"><p className="text-base font-bold text-gray-800 leading-tight">{item.product.name}</p></div>
                            <div className="w-20 text-center text-xs font-medium text-gray-500">S/. {item.product.price.toFixed(2)} <span className='text-[10px]'>/{item.product.unit}</span></div>
                            <div className="w-16 text-center font-bold text-gray-700">{item.qty.toFixed(3)}</div>
                            <div className="w-20 text-right font-bold text-gray-900">S/. {(item.product.price * item.qty).toFixed(2)}</div>
                        </div>
                        ))}
                    </div>
                    )}
                </div>

                {/* Totals Section */}
                <div className="border-t border-gray-200 px-4 py-4 bg-gray-50">
                    <div className="flex justify-between items-end">
                    <span className="text-gray-800 text-xl font-bold">Total</span>
                    <span className="text-gray-900 text-3xl font-bold">S/. {cartTotal.toFixed(2)}</span>
                    </div>
                </div>

                {/* Keypad / Action Area */}
                <div className="border-t border-gray-300 bg-white">
                    <div className="grid grid-cols-4 h-[240px]">
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">1</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">2</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">3</button>
                        <button className="border-b border-gray-200 bg-[#e0f2f1] hover:bg-[#b2dfdb] text-lg font-semibold text-teal-900 active:bg-[#80cbc4]">Ctd.</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">4</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">5</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">6</button>
                        <button className="border-b border-gray-200 hover:bg-gray-100 text-lg font-medium text-gray-700 active:bg-gray-200">%</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">7</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">8</button>
                        <button className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">9</button>
                        <button className="border-b border-gray-200 hover:bg-gray-100 text-lg font-medium text-gray-700 active:bg-gray-200">Precio</button>
                        <button className="border-r border-b border-gray-200 bg-[#fff59d] hover:bg-[#fff176] text-lg font-medium text-gray-800 active:bg-[#ffee58]">+/-</button>
                        <button onClick={() => handleTenderInput('0')} className="border-r border-b border-gray-200 hover:bg-gray-100 text-xl font-medium text-gray-700 active:bg-gray-200">0</button>
                        <button onClick={() => handleTenderInput('.')} className="border-r border-b border-gray-200 bg-[#C1E1C1] hover:bg-[#a8d8a8] text-xl font-medium text-gray-800 active:bg-[#8fce8f]"> , </button>
                        <button onClick={() => handleTenderInput('backspace')} className="border-b border-gray-200 bg-[#98FB98] hover:bg-[#80e680] text-gray-800 active:bg-[#6bd46b] flex items-center justify-center"><Delete className="w-6 h-6" /></button>
                    </div>
                    <button onClick={() => setView('payment')} disabled={cart.length === 0} className="w-full h-[60px] bg-[#28a745] hover:bg-[#218838] disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xl font-semibold flex items-center justify-center shadow-inner active:bg-[#1e7e34] transition-colors">Pago</button>
                </div>
                </div>

                {/* RIGHT PANEL: Product Catalog */}
                <div className="flex-1 flex flex-col bg-[#f0f0f0] overflow-hidden">
                    <div className="p-3 bg-white border-b border-gray-200 shadow-sm overflow-x-auto whitespace-nowrap custom-scrollbar">
                        <div className="flex space-x-3">
                            {CATEGORIES.map(cat => (
                                <button key={cat.id} onClick={() => setActiveCategory(cat.id)} className={`px-5 py-2 rounded shadow-sm text-sm font-bold transition-all hover:shadow-md flex items-center gap-2 ${activeCategory === cat.id ? 'ring-2 ring-offset-1 ring-gray-400' : ''} ${cat.color}`}>
                                    {cat.icon && <span>{cat.icon}</span>}
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredProducts.map(product => (
                                <div key={product.id} onClick={() => addToCart(product)} className="bg-white rounded-md overflow-hidden shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer group relative flex flex-col h-[180px]">
                                    <div className="absolute top-1 right-1 bg-green-600 text-white text-sm font-bold px-2 py-1 rounded z-20 shadow-sm">S/. {product.price.toFixed(2)}</div>
                                    <div className="absolute inset-0 w-full h-full bg-gray-100">
                                        <img src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Sin+Imagen'; }} />
                                    </div>
                                    <div className="absolute bottom-0 w-full bg-white/80 backdrop-blur-[1px] p-2 border-t border-gray-100/50 z-10">
                                        <h3 className="text-lg font-bold text-gray-900 leading-tight truncate">{product.name}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* VIEW: PAYMENT SCREEN */}
        {view === 'payment' && (
            <div className="w-full h-full flex animate-in fade-in duration-200">
                <div className="w-[320px] bg-white border-r border-gray-300 flex flex-col p-4 space-y-3">
                    <h3 className="text-gray-500 text-sm font-bold uppercase mb-2">Métodos de Pago</h3>
                    <button onClick={() => setPaymentMethod('efectivo')} className={`flex items-center p-4 rounded border transition-all ${paymentMethod === 'efectivo' ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}><Banknote className="mr-3" /><span className="font-bold">Efectivo</span></button>
                    <button onClick={() => setPaymentMethod('yape')} className={`flex items-center p-4 rounded border transition-all ${paymentMethod === 'yape' ? 'border-[#742284] bg-[#f3e5f5] text-[#742284] shadow-md' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}><Smartphone size={14} className="mr-3"/><span className="font-bold">Yape</span></button>
                    <button onClick={() => setPaymentMethod('tarjeta')} className={`flex items-center p-4 rounded border transition-all ${paymentMethod === 'tarjeta' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-200 hover:bg-gray-50 text-gray-700'}`}><CreditCard className="mr-3" /><span className="font-bold">Tarjeta</span></button>
                </div>

                <div className="flex-1 flex flex-col bg-gray-50">
                    <div className="flex-1 flex flex-col items-center pt-16 px-20">
                        <div className="text-[64px] font-bold text-gray-700 tracking-tight leading-none mb-12">S/ <span className="text-gray-800">{cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                        <div className="w-full max-w-3xl space-y-4">
                            {tenderedValue > 0 && (
                                <div className="flex items-center justify-between bg-[#E0F2F1] border border-[#80CBC4] rounded-md px-6 py-4">
                                    <span className="text-xl font-medium text-gray-700">Efectivo</span>
                                    <div className="flex items-center gap-4"><span className="text-2xl font-bold text-[#1B5E20]">S/ {tenderedValue.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span><button onClick={() => setTenderAmount('')} className="text-red-500 hover:text-red-700"><X size={24} /></button></div>
                                </div>
                            )}
                            {tenderedValue === 0 && <div className="text-center text-gray-400 mt-10">Ingrese el monto en efectivo</div>}
                        </div>
                    </div>

                    <div className="h-[450px] w-full max-w-4xl mx-auto flex flex-col p-4">
                        <div className="flex-1 grid grid-cols-4 gap-3 mb-3">
                            {[1,2,3,4,5,6,7,8,9,0].map(n => <button key={n} onClick={() => handleTenderInput(n.toString())} className="bg-white rounded shadow-sm text-2xl font-medium text-gray-700 hover:bg-gray-50 border border-gray-200">{n}</button>)}
                            <button onClick={() => handleTenderInput('.')} className="bg-white rounded shadow-sm text-2xl font-medium text-gray-700 hover:bg-gray-50 border border-gray-200">.</button>
                            <button onClick={() => handleTenderInput('backspace')} className="bg-[#98FB98] rounded shadow-sm flex items-center justify-center"><Delete /></button>
                        </div>
                        <div className="flex gap-4 h-14">
                            <button onClick={() => setView('pos')} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold rounded shadow-sm hover:bg-gray-50 flex items-center justify-center gap-2"><ArrowLeft size={20} /> Regresar</button>
                            <button onClick={handleValidateSale} className="flex-[2] bg-[#704559] text-white font-bold rounded shadow-md hover:bg-[#5a3748] flex items-center justify-center gap-2"><CheckCircle size={20} /> Validar</button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: RECEIPT SCREEN */}
        {view === 'receipt' && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <div className="bg-white w-[380px] shadow-2xl py-8 px-6 text-sm font-mono text-gray-700">
                    <div className="flex flex-col items-center mb-6">
                        <span className="text-3xl font-black tracking-tight text-[#4caf50]">Yappita POS</span>
                        <p className="mt-2">Pago Exitoso</p>
                    </div>
                    <div className="space-y-3 mb-6 border-b border-dashed border-gray-300 pb-6">
                        {cart.map((item, idx) => (
                            <div key={idx} className="flex justify-between"><span>{item.product.name}</span><span>S/ {(item.product.price * item.qty).toFixed(2)}</span></div>
                        ))}
                    </div>
                    <div className="flex justify-between text-xl font-bold"><span>TOTAL</span><span>S/ {cartTotal.toFixed(2)}</span></div>
                    <button onClick={handleNewOrder} className="w-full mt-8 py-3 bg-[#704559] text-white font-bold rounded">Nueva Orden</button>
                </div>
            </div>
        )}

        {/* VIEW: BACKEND */}
        {view === 'backend' && (
             <div className="w-full h-full bg-gray-50 p-8">
                <h2 className="text-2xl font-bold mb-4">Inventario</h2>
                <button onClick={() => setView('pos')} className="mb-4 px-4 py-2 bg-white border rounded">Volver</button>
                <div className="bg-white rounded shadow overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100"><tr><th className="p-4">Producto</th><th className="p-4">Precio</th></tr></thead>
                        <tbody>
                            {products.map(p => <tr key={p.id} className="border-t"><td className="p-4">{p.name}</td><td className="p-4">S/ {p.price.toFixed(2)}</td></tr>)}
                        </tbody>
                    </table>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default DashboardLayout;