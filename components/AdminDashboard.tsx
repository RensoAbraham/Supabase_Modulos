import React, { useState, useEffect } from 'react';
import { supabase } from '../src/lib/supabase';
import { 
  Package, 
  DollarSign,
  User,
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  X, 
  Save, 
  Image as ImageIcon,
  ArrowLeft
} from 'lucide-react';

interface AdminDashboardProps {
  onBack: () => void;
}

interface Product {
  id: number;
  name: string;
  price: number;
  unit: string;
  category: string;
  image_url: string;
}

interface Sale {
  id: number;
  created_at: string;
  total: number;
  payment_method: string;
  user_id: string;
  users?: {
    email: string;
  };
}

interface User {
  id: string;
  email: string;
  role: string;
  created_at: string;
}

const CATEGORIES = [
  'Frutas', 'Verduras', 'Tubérculos', 'Frutales', 'Hortalizas', 
  'Bulbos', 'Legumbres', 'Cítricos', 'Tropicales', 'Hierbas', 'Varios'
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'users'>('sales');
  
  // --- SALES STATE ---
  const [sales, setSales] = useState<Sale[]>([]);
  const [loadingSales, setLoadingSales] = useState(false);

  // --- USERS STATE ---
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // --- PRODUCTS STATE ---
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'Varios',
    image_url: ''
  });

  // --- FETCH DATA ---
  useEffect(() => {
    if (activeTab === 'sales') fetchSales();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab]);

  const fetchSales = async () => {
    setLoadingSales(true);
    const { data, error } = await supabase
      .from('sales_header')
      .select('*, users(email)')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) console.error('Error fetching sales:', error);
    else setSales(data || []);
    setLoadingSales(false);
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    const { data, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .order('name');

    if (error) console.error('Error fetching products:', error);
    else {
      const formatted = data?.map((p: any) => ({
        ...p,
        category: p.categories?.name || 'Varios'
      })) || [];
      setProducts(formatted);
    }
    setLoadingProducts(false);
  };

  const fetchUsers = async () => {
  setLoadingUsers(true);
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'cajero')
    .order('created_at', { ascending: false });
  
  if (error) console.error('Error fetching users:', error);
  else setUsers(data || []);
  setLoadingUsers(false);
};

  // --- PRODUCT CRUD ---
  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', price: '', category: 'Varios', image_url: '' });
    }
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async () => {
    try {
      // 1. Get Category ID
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .ilike('name', formData.category)
        .single();
      
      let categoryId = catData?.id;

      // If category doesn't exist, create it (simplified) or default to null
      if (!categoryId) {
          // For now, assume categories exist or handle error
          // You might want to create it if it doesn't exist
      }

      const payload = {
        name: formData.name,
        price: parseFloat(formData.price),
        category_id: categoryId, // Note: Schema might use category_id
        image_url: formData.image_url
      };

      let error;
      if (editingProduct) {
        const { error: updateError } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingProduct.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from('products')
          .insert(payload);
        error = insertError;
      }

      if (error) throw error;

      setIsProductModalOpen(false);
      fetchProducts();
      alert(editingProduct ? 'Producto actualizado' : 'Producto creado');

    } catch (err: any) {
      console.error('Error saving product:', err);
      alert('Error al guardar: ' + err.message);
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      fetchProducts();
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-full h-full bg-gray-900 text-gray-100 flex flex-col">
      {/* Header */}
      <div className="h-16 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Panel de Administración
          </h1>
        </div>
        
        <div className="flex bg-gray-700/50 rounded-lg p-1">
          <button 
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'sales' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <DollarSign size={16} /> Ventas
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'products' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <Package size={16} /> Productos
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'users' ? 'bg-gray-600 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}
          >
            <User size={16} /> Cajeros
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6">
        
        {/* SALES TAB */}
        {activeTab === 'sales' && (
          <div className="h-full flex flex-col bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="font-bold text-lg">Historial de Ventas</h2>
              <button onClick={fetchSales} className="text-sm text-blue-400 hover:underline">Actualizar</button>
            </div>
            <div className="flex-1 overflow-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-700/50 text-gray-400 text-xs uppercase sticky top-0">
                  <tr>
                    <th className="p-4 font-medium">ID</th>
                    <th className="p-4 font-medium">Fecha</th>
                    <th className="p-4 font-medium">Cajero</th>
                    <th className="p-4 font-medium">Método</th>
                    <th className="p-4 font-medium text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loadingSales ? (
                    <tr><td colSpan={5} className="p-8 text-center text-gray-500">Cargando ventas...</td></tr>
                  ) : sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-gray-300">#{sale.id}</td>
                      <td className="p-4 text-gray-300">{new Date(sale.created_at).toLocaleString()}</td>
                      <td className="p-4 text-gray-300">{sale.users?.email || 'Desconocido'}</td>
                      <td className="p-4"><span className="capitalize px-2 py-1 rounded bg-gray-700 text-xs font-bold">{sale.payment_method}</span></td>
                      <td className="p-4 text-right font-bold text-green-400">S/ {sale.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <div className="h-full flex flex-col bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-700 flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                <input 
                  type="text" 
                  placeholder="Buscar productos..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <button 
                onClick={() => handleOpenModal()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
              >
                <Plus size={18} /> Nuevo Producto
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map(product => (
                  <div key={product.id} className="bg-gray-700/30 border border-gray-600 rounded-xl p-4 flex gap-4 hover:border-gray-500 transition-colors group">
                    <div className="w-20 h-20 bg-gray-800 rounded-lg overflow-hidden shrink-0">
                      <img src={product.image_url || 'https://via.placeholder.com/150'} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-200 truncate">{product.name}</h3>
                      <p className="text-sm text-gray-400">{product.category}</p>
                      <p className="text-lg font-bold text-green-400 mt-1">S/ {product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenModal(product)} className="p-2 bg-gray-600 hover:bg-blue-600 rounded-lg text-white transition-colors"><Edit2 size={16} /></button>
                      <button onClick={() => handleDeleteProduct(product.id)} className="p-2 bg-gray-600 hover:bg-red-600 rounded-lg text-white transition-colors"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PRODUCT MODAL */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-800 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button onClick={() => setIsProductModalOpen(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Precio (S/)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1">Categoría</label>
                  <select 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-500 outline-none"
                  >
                    {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">URL Imagen</label>
                <div className="flex gap-2">
                    <input 
                    type="text" 
                    value={formData.image_url}
                    onChange={e => setFormData({...formData, image_url: e.target.value})}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:border-blue-500 outline-none"
                    placeholder="https://..."
                    />
                    <button className="p-2 bg-gray-700 rounded-lg border border-gray-600 hover:bg-gray-600">
                        <ImageIcon size={20} className="text-gray-400" />
                    </button>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-700 bg-gray-900/30 flex justify-end gap-3">
              <button 
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 text-gray-400 hover:text-white font-medium"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveProduct}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center gap-2"
              >
                <Save size={18} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div className="h-full flex flex-col bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="font-bold text-lg">Cajeros Registrados</h2>
            <button onClick={fetchUsers} className="text-sm text-blue-400 hover:underline">Actualizar</button>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-700/50 text-gray-400 text-xs uppercase sticky top-0">
                <tr>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Rol</th>
                  <th className="p-4 font-medium">Fecha Registro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {loadingUsers ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-500">Cargando cajeros...</td></tr>
                ) : users.map(user => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4 text-gray-300">{user.email}</td>
                    <td className="p-4"><span className="capitalize px-2 py-1 rounded bg-green-900/30 text-green-400 text-xs font-bold">{user.role}</span></td>
                    <td className="p-4 text-gray-300">{new Date(user.created_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
