import { supabase } from '../src/lib/supabase';
import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
  Scale as ScaleIcon,
  Edit3,
  Trash2,
  Menu,
  LogOut,
  Plus,
  Minus,
} from 'lucide-react';
import ScaleConfigModal, { ScaleConfig } from './ScaleConfigModal';
import AdminDashboard from './AdminDashboard';

interface DashboardLayoutProps {
  isBlurred?: boolean;
  userRole?: 'admin' | 'cajero' | null;
}

const CATEGORIES = [
  { id: 'all', name: 'Todo', icon: <Home size={16} />, color: 'bg-gray-100 text-gray-600 hover:bg-gray-200' },
  { id: 'frutas', name: 'Frutas', color: 'bg-red-50 text-red-600 hover:bg-red-100' }, 
  { id: 'verduras', name: 'Verduras', color: 'bg-green-50 text-green-600 hover:bg-green-100' }, 
  { id: 'tuberculos', name: 'Tubérculos', color: 'bg-amber-50 text-amber-700 hover:bg-amber-100' },
  { id: 'frutales', name: 'Frutales', color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  { id: 'hortalizas', name: 'Hortalizas', color: 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' },
  { id: 'bulbos', name: 'Bulbos', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { id: 'legumbres', name: 'Legumbres', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
  { id: 'citricos', name: 'Cítricos', color: 'bg-lime-50 text-lime-700 hover:bg-lime-100' },
  { id: 'tropicales', name: 'Tropicales', color: 'bg-rose-50 text-rose-600 hover:bg-rose-100' },
  { id: 'hierbas', name: 'Hierbas', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
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

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ 
  isBlurred = false,
  userRole = null
}) => {
  
  const [products, setProducts] = useState<Product[]>([]); 
  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [view, setView] = useState<ViewState>('pos');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [tenderAmount, setTenderAmount] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // --- SCALE STATE ---
  const [scaleWeight, setScaleWeight] = useState(0.000);
  const [scaleConfig, setScaleConfig] = useState<ScaleConfig>({ mode: 'simulation', autoStability: true });
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const scaleIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- LOAD PRODUCTS ---
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
          unit: 'kg', // Asumimos KG por defecto para verdulería
          category: item.categories?.name || 'Varios',
          image: item.image_url || 'https://via.placeholder.com/150'
        }));
        setProducts(productosReales);
      }
    };
    fetchProducts();
  }, []);

  // --- SCALE SIMULATION LOGIC ---
  useEffect(() => {
    if (scaleConfig.mode === 'simulation') {
      scaleIntervalRef.current = setInterval(() => {
        // Simular fluctuación pequeña si está "estable" o cambio grande aleatorio
        const randomChange = (Math.random() - 0.5) * 0.010; // +/- 5g
        setScaleWeight(prev => {
            const newVal = Math.max(0, prev + randomChange);
            return parseFloat(newVal.toFixed(3));
        });
      }, 500);
    } else {
      if (scaleIntervalRef.current) clearInterval(scaleIntervalRef.current);
    }

    return () => {
      if (scaleIntervalRef.current) clearInterval(scaleIntervalRef.current);
    };
  }, [scaleConfig.mode]);

  // Simular poner un peso "real" al hacer clic en la balanza (en modo simulación)
  const simulateWeightOnScale = () => {
      // Generar un peso aleatorio entre 0.100 y 5.000 kg
      const randomWeight = (Math.random() * 4.9) + 0.1;
      setScaleWeight(parseFloat(randomWeight.toFixed(3)));
  };

  const filteredProducts = products.filter(p => {
      const matchesCategory = activeCategory === 'all' || p.category.toLowerCase() === activeCategory.toLowerCase();
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      
      // LOGICA DE PESO:
      // Si la balanza tiene peso > 0, usamos ese peso.
      // Si no, sumamos 1 unidad (o 1kg por defecto si es manual).
      let quantityToAdd = 1;
      
      if (scaleWeight > 0) {
          quantityToAdd = scaleWeight;
          // Opcional: Resetear balanza después de añadir?
          // setScaleWeight(0); 
      }

      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
          ? { ...item, qty: item.qty + quantityToAdd } 
          : item
        );
      }
      return [...prev, { product, qty: quantityToAdd }];
    });
  };

  const removeFromCart = (productId: number) => {
      setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateCartQty = (productId: number, newQty: number) => {
      if (newQty <= 0) {
          removeFromCart(productId);
          return;
      }
      setCart(prev => prev.map(item => item.product.id === productId ? { ...item, qty: newQty } : item));
  };

  const cartTotal = parseFloat(cart.reduce((sum, item) => sum + (item.product.price * item.qty), 0).toFixed(2));

  const handleTenderInput = (val: string) => {
      if (val === 'backspace') {
          setTenderAmount(prev => prev.slice(0, -1));
      } else {
          setTenderAmount(prev => prev + val);
      }
  };
  
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleNewOrder = () => {
      setCart([]);
      setTenderAmount('');
      setView('pos');
      setScaleWeight(0);
  };

  const tenderedValue = parseFloat(tenderAmount) || 0;
  const difference = cartTotal - tenderedValue;

  return (
    <div className={`flex flex-col h-screen bg-gray-900 text-gray-100 font-sans transition-all duration-300 ${isBlurred ? 'blur-[2px]' : ''}`}>
      <ScaleConfigModal 
        isOpen={isScaleModalOpen} 
        onClose={() => setIsScaleModalOpen(false)} 
        config={scaleConfig}
        onSave={(newConfig) => setScaleConfig(newConfig)}
      />

      {/* --- HEADER --- */}
      <header className="h-16 bg-gray-800 border-b border-gray-700 flex shrink-0 shadow-sm z-20 relative px-4">
        <div className="flex items-center gap-4 w-[420px] shrink-0 border-r border-gray-100 pr-4">
            <div className="w-10 h-10 bg-[#704559] rounded-lg flex items-center justify-center text-white font-bold shadow-md shadow-[#704559]/20">
                POS
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-800">Caja Principal</span>
                <span className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Online
                </span>
            </div>
        </div>

        <div className="flex-1 flex items-center justify-between pl-6">
            {/* SCALE DISPLAY */}
            <div 
                onClick={simulateWeightOnScale}
                className="group cursor-pointer relative overflow-hidden bg-gray-900 rounded-xl border border-gray-800 shadow-lg w-64 h-12 flex items-center justify-between px-4 transition-transform active:scale-95"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900"></div>
                <div className="relative z-10 flex items-center gap-2">
                    <ScaleIcon className="text-gray-400 group-hover:text-white transition-colors" size={20} />
                    <span className="text-gray-400 text-xs font-medium uppercase tracking-wider">Test Peso</span>
                </div>
                <div className="relative z-10 flex items-end gap-1">
                    <span className={`text-3xl font-mono font-bold tracking-widest ${scaleWeight > 0 ? 'text-[#39FF14]' : 'text-gray-600'}`}>
                        {scaleWeight.toFixed(3)}
                    </span>
                    <span className="text-gray-500 font-bold mb-1">kg</span>
                </div>
            </div>

            {/* SEARCH BAR */}
            <div className="flex-1 max-w-xl mx-6 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#704559] transition-colors" size={20} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Buscar productos (nombre, código)..." 
                    className="w-full pl-12 pr-4 py-3 bg-gray-100 border-transparent focus:bg-white focus:border-[#704559] focus:ring-4 focus:ring-[#704559]/10 rounded-xl text-sm font-medium transition-all outline-none" 
                />
            </div>

            {userRole === 'admin' && (
                <button 
                    onClick={() => setView('backend')}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-xs flex items-center gap-2"
                >
                    <Settings size={14} />
                    Panel Admin
                </button>
            )}

            {/* ACTIONS */}
            <div className="flex items-center gap-2">
                <button 
                    onClick={handleLogout}
                    className="p-2.5 text-gray-500 hover:text-red-500 rounded-lg transition-colors"
                    title="Cerrar Sesión"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </div>
      </header>

      {/* --- CONTENT --- */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* VIEW: POS */}
        {view === 'pos' && (
            <>
                {/* LEFT: CART */}
                <div className="w-[420px] bg-white border-r border-gray-200 flex flex-col z-10 shadow-xl">
                    {/* Cart Header */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-bold text-gray-800 flex items-center gap-2">
                            <ShoppingCart size={20} className="text-[#704559]" />
                            Carrito Actual
                        </h2>
                        <span className="bg-[#704559]/10 text-[#704559] text-xs font-bold px-2 py-1 rounded-full">
                            {cart.length} items
                        </span>
                    </div>

                    {/* Cart Items */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4 opacity-50">
                                <ShoppingCart size={64} strokeWidth={1} />
                                <p className="font-medium text-sm">Escanea o selecciona productos</p>
                            </div>
                        ) : (
                            cart.map((item, idx) => (
                                <div key={idx} className="group relative bg-white border border-gray-100 rounded-xl p-3 hover:border-[#704559]/30 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-gray-800 leading-tight">{item.product.name}</h4>
                                            <div className="text-xs text-gray-500 mt-1">
                                                S/ {item.product.price.toFixed(2)} x kg
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900 text-lg">
                                                S/ {(item.product.price * item.qty).toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center justify-between bg-gray-50 rounded-lg p-1">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => updateCartQty(item.product.id, item.qty - 0.1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 text-gray-600 font-bold"
                                            >-</button>
                                            <div className="w-20 text-center">
                                                <span className="font-bold text-gray-800">{item.qty.toFixed(3)}</span>
                                                <span className="text-[10px] text-gray-500 ml-1">kg</span>
                                            </div>
                                            <button 
                                                onClick={() => updateCartQty(item.product.id, item.qty + 0.1)}
                                                className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 rounded-md hover:bg-gray-100 text-gray-600 font-bold"
                                            >+</button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.product.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Cart Footer */}
                    <div className="bg-white border-t border-gray-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <div className="flex justify-between items-end mb-4">
                            <span className="text-gray-500 font-medium">Total a Pagar</span>
                            <span className="text-4xl font-bold text-[#704559] tracking-tight">
                                S/ {cartTotal.toFixed(2)}
                            </span>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <button 
                                onClick={() => setCart([])}
                                className="px-4 py-3 rounded-xl border border-gray-200 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={() => setView('payment')}
                                disabled={cart.length === 0}
                                className="px-4 py-3 rounded-xl bg-[#704559] text-white font-bold shadow-lg shadow-[#704559]/30 hover:bg-[#5a3748] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                            >
                                <Banknote size={20} />
                                Pagar
                            </button>
                        </div>
                    </div>
                </div>

                {/* RIGHT: PRODUCTS */}
                <div className="flex-1 flex flex-col bg-[#f8f9fa] overflow-hidden">
                    {/* Categories */}
                    <div className="p-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
                        <div className="flex gap-3">
                            {CATEGORIES.map(cat => (
                                <button 
                                    key={cat.id} 
                                    onClick={() => setActiveCategory(cat.id)} 
                                    className={`
                                        px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 border
                                        ${activeCategory === cat.id 
                                            ? 'bg-gray-800 text-white border-gray-800 shadow-lg scale-105' 
                                            : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:shadow-sm'
                                        }
                                    `}
                                >
                                    {cat.icon && <span>{cat.icon}</span>}
                                    <span>{cat.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Grid */}
                    <div className="flex-1 overflow-y-auto p-4 pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
                            {filteredProducts.map(product => (
                                <div 
                                    key={product.id} 
                                    onClick={() => addToCart(product)} 
                                    className="group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:border-[#704559]/20 hover:-translate-y-1 transition-all cursor-pointer flex flex-col h-[220px]"
                                >
                                    <div className="relative flex-1 bg-gray-50 rounded-xl overflow-hidden mb-3">
                                        <img 
                                            src={product.image} 
                                            alt={product.name} 
                                            className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                                            onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=Sin+Imagen'; }} 
                                        />
                                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-800 shadow-sm">
                                            S/ {product.price.toFixed(2)}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 truncate mb-1">{product.name}</h3>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">
                                                {product.category}
                                            </span>
                                            <span className="text-xs font-medium text-[#704559]">
                                                x {product.unit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        )}

        {/* VIEW: PAYMENT */}
        {view === 'payment' && (
            <div className="w-full h-full flex animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="w-[360px] bg-gray-800 border-r border-gray-700 p-6 flex flex-col gap-4 z-10 shadow-xl">
                    <button onClick={() => setView('pos')} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 transition-colors mb-4">
                        <ArrowLeft size={20} />
                        <span className="font-bold">Volver al POS</span>
                    </button>

                    <h3 className="text-lg font-bold text-gray-100">Método de Pago</h3>
                    
                    <div className="space-y-3">
                        <button onClick={() => setPaymentMethod('efectivo')} className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'efectivo' ? 'border-green-500 bg-green-50 text-green-700 shadow-md' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}>
                            <Banknote className="mr-3" size={24} />
                            <div className="text-left">
                                <span className="block font-bold">Efectivo</span>
                                <span className="text-xs opacity-75">Pago en cash</span>
                            </div>
                        </button>
                        <button onClick={() => setPaymentMethod('yape')} className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'yape' ? 'border-[#742284] bg-[#f3e5f5] text-[#742284] shadow-md' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}>
                            <Smartphone className="mr-3" size={24} />
                            <div className="text-left">
                                <span className="block font-bold">Yape / Plin</span>
                                <span className="text-xs opacity-75">QR Digital</span>
                            </div>
                        </button>
                        <button onClick={() => setPaymentMethod('tarjeta')} className={`w-full flex items-center p-4 rounded-xl border-2 transition-all ${paymentMethod === 'tarjeta' ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md' : 'border-gray-100 hover:bg-gray-50 text-gray-600'}`}>
                            <CreditCard className="mr-3" size={24} />
                            <div className="text-left">
                                <span className="block font-bold">Tarjeta</span>
                                <span className="text-xs opacity-75">Visa / Mastercard</span>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="flex-1 bg-gray-900 flex flex-col items-center justify-center p-12">
    <div className="bg-gray-800 p-8 rounded-3xl shadow-xl w-full max-w-2xl text-center border border-gray-700">
                        <span className="text-gray-400 font-medium uppercase tracking-widest text-sm">Total a Cobrar</span>
                        <div className="text-7xl font-black text-white mt-2 mb-8 tracking-tighter">
                            S/ {cartTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </div>

                        {paymentMethod === 'efectivo' && (
                            <div className="max-w-md mx-auto">
                                <div className="bg-gray-100 rounded-2xl p-2 flex items-center mb-6 border-2 border-transparent focus-within:border-[#704559] focus-within:bg-white transition-all">
                                    <span className="pl-4 text-gray-400 font-bold text-xl">S/</span>
                                    <input 
                                        type="text" 
                                        readOnly
                                        value={tenderAmount}
                                        placeholder="0.00"
                                        className="w-full bg-transparent text-4xl font-bold text-gray-800 text-right px-4 py-2 outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[1,2,3,4,5,6,7,8,9].map(n => (
                                        <button key={n} onClick={() => handleTenderInput(n.toString())} className="h-16 rounded-xl bg-white border border-gray-200 text-2xl font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all">
                                            {n}
                                        </button>
                                    ))}
                                    <button onClick={() => handleTenderInput('.')} className="h-16 rounded-xl bg-white border border-gray-200 text-2xl font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all">.</button>
                                    <button onClick={() => handleTenderInput('0')} className="h-16 rounded-xl bg-white border border-gray-200 text-2xl font-bold text-gray-700 hover:bg-gray-50 hover:shadow-md transition-all">0</button>
                                    <button onClick={() => handleTenderInput('backspace')} className="h-16 rounded-xl bg-red-50 border border-red-100 text-red-500 hover:bg-red-100 hover:shadow-md transition-all flex items-center justify-center">
                                        <Delete size={24} />
                                    </button>
                                </div>

                                {tenderedValue > 0 && (
                                    <div className={`p-4 rounded-xl mb-6 flex justify-between items-center ${difference <= 0 ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                        <span className="font-bold">{difference <= 0 ? 'Vuelto' : 'Faltante'}</span>
                                        <span className="text-2xl font-bold">S/ {Math.abs(difference).toFixed(2)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        <button 
                            onClick={handleValidateSale}
                            disabled={paymentMethod === 'efectivo' && difference > 0}
                            className="w-full py-5 bg-[#704559] text-white text-xl font-bold rounded-2xl shadow-xl shadow-[#704559]/30 hover:bg-[#5a3748] hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all flex items-center justify-center gap-3"
                        >
                            <CheckCircle size={28} />
                            Confirmar Pago
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* VIEW: RECEIPT */}
        {view === 'receipt' && (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
                <div className="bg-white w-full max-w-sm shadow-2xl rounded-xl overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="bg-[#4caf50] p-6 text-center text-white">
                        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <CheckCircle size={32} />
                        </div>
                        <h2 className="text-2xl font-bold">¡Venta Exitosa!</h2>
                        <p className="opacity-90">La transacción se guardó correctamente</p>
                    </div>
                    
                    <div className="p-8">
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between text-gray-600">
                                <span>Total Pagado</span>
                                <span className="font-bold text-gray-800">S/ {cartTotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Método</span>
                                <span className="font-bold text-gray-800 capitalize">{paymentMethod}</span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                                <span>Items</span>
                                <span className="font-bold text-gray-800">{cart.length}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button className="py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                                <Printer size={18} /> Imprimir
                            </button>
                            <button className="py-3 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2">
                                <Send size={18} /> Enviar
                            </button>
                        </div>

                        <button onClick={handleNewOrder} className="w-full mt-4 py-4 bg-[#704559] text-white font-bold rounded-xl hover:bg-[#5a3748] transition-colors">
                            Nueva Venta
                        </button>
                    </div>
                </div>
            </div>
        )}
        {/* VIEW: BACKEND */}
        {view === 'backend' && (
          <AdminDashboard onBack={() => setView('pos')} />
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;