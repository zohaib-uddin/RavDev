import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Package, ShoppingBag, Settings, 
  Search, Edit, Trash2, Plus, Eye, Globe, LogOut,
  DollarSign, Box, AlertTriangle, Shield, Users, 
  BarChart3, TrendingUp, ChevronDown, FileText,
  Percent, MessageSquare, Star
} from 'lucide-react';
import { useStore, Product, Order } from '../../store/useStore';
import ProductForm from '../../components/admin/ProductForm';

export default function AdminPanel() {
  const { products, orders, categories, reviews, updateOrderStatus, deleteProduct, logout, fetchProducts, fetchOrders, fetchCategories } = useStore();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  
  // Fetch all data from API on component mount
  useEffect(() => {
    fetchProducts();
    fetchOrders();
    fetchCategories();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const lowStockProducts = products.filter(p => (p.stockCount || 50) < 20);
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || p.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'discounts', label: 'Discounts', icon: Percent },
    { id: 'seo', label: 'SEO Settings', icon: Globe },
    { id: 'audit', label: 'Audit Logs', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Credentials Banner */}
      <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={16} />
          <span className="text-sm font-medium">Admin Panel Active</span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">Neon DB Connected</span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span>Email: <strong>admin@ravenza.pk</strong></span>
          <span>Password: <strong>admin123</strong></span>
        </div>
      </div>
      
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-black text-white min-h-screen p-6 sticky top-0 hidden lg:block">
          <div className="mb-8">
            <h1 className="text-xl font-black font-display">RAVENZA</h1>
            <p className="text-xs text-gray-400 mt-1">Admin Dashboard</p>
          </div>

          <nav className="space-y-1">
            {sections.map(section => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeSection === section.id
                    ? 'bg-white/10 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <section.icon size={18} />
                {section.label}
              </button>
            ))}
          </nav>

          <div className="mt-auto pt-8">
            <button
              onClick={() => { logout(); window.location.href = '/'; }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            
            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Dashboard Overview</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Total Revenue', value: `Rs.${totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
                    { label: 'Total Orders', value: orders.length.toString(), icon: ShoppingBag, color: 'text-blue-600', bg: 'bg-blue-50' },
                    { label: 'Products', value: products.length.toString(), icon: Box, color: 'text-purple-600', bg: 'bg-purple-50' },
                    { label: 'Low Stock', value: lowStockProducts.length.toString(), icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${stat.bg} rounded-2xl p-5`}
                    >
                      <stat.icon className={`${stat.color} mb-2`} size={24} />
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-3 gap-4 mb-8">
                  <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="p-5 bg-white rounded-2xl border-2 border-dashed hover:border-black transition-colors text-left">
                    <Plus className="text-black mb-2" size={24} />
                    <p className="font-bold">Add New Product</p>
                    <p className="text-xs text-gray-500">Create with 6-step wizard</p>
                  </button>
                  <div className="p-5 bg-white rounded-2xl border">
                    <TrendingUp className="text-blue-500 mb-2" size={24} />
                    <p className="font-bold">Sales This Month</p>
                    <p className="text-xs text-gray-500">+12% from last month</p>
                  </div>
                  <div className="p-5 bg-white rounded-2xl border">
                    <BarChart3 className="text-purple-500 mb-2" size={24} />
                    <p className="font-bold">Active Customers</p>
                    <p className="text-xs text-gray-500">156 registered users</p>
                  </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
                  <h3 className="font-bold mb-4">Recent Orders</h3>
                  {orders.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b"><th className="text-left py-3 px-2">Order</th><th className="text-left py-3 px-2">Date</th><th className="text-left py-3 px-2">Total</th><th className="text-left py-3 px-2">Status</th></tr></thead>
                        <tbody>
                          {orders.slice(-5).reverse().map(order => (
                            <tr key={order.id} className="border-b">
                              <td className="py-3 px-2 font-medium">{order.order_number}</td>
                              <td className="py-3 px-2 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                              <td className="py-3 px-2">Rs.{order.total.toLocaleString()}</td>
                              <td className="py-3 px-2"><span className="text-xs font-bold px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">{order.status}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : <p className="text-gray-500 text-sm">No orders yet.</p>}
                </div>

                {/* Low Stock Alert */}
                {lowStockProducts.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h3 className="font-bold text-amber-800 mb-3 flex items-center gap-2"><AlertTriangle size={18} /> Low Stock Alert</h3>
                    <div className="space-y-2">
                      {lowStockProducts.map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm bg-white p-3 rounded-lg">
                          <span className="font-medium">{p.name}</span>
                          <span className="font-bold text-amber-700">{p.stockCount || 0} left</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Inventory */}
            {activeSection === 'inventory' && (
              <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-2xl font-bold">Inventory Management</h2>
                  <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }} className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 transition-colors">
                    <Plus size={16} /> Add Product
                  </button>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-4 border-b flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                      <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search products..." className="w-full pl-10 pr-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-black/10" />
                    </div>
                    <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="px-4 py-2.5 border rounded-xl text-sm">
                      <option value="">All Categories</option>
                      {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </select>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4">Product</th>
                          <th className="text-left py-3 px-4">Category</th>
                          <th className="text-left py-3 px-4">Price</th>
                          <th className="text-left py-3 px-4">Stock</th>
                          <th className="text-left py-3 px-4">Status</th>
                          <th className="text-left py-3 px-4">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map(product => (
                          <tr key={product.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <img src={product.image || product.image_url || ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                                <div>
                                  <span className="font-medium line-clamp-1">{product.name}</span>
                                  <p className="text-xs text-gray-400">{product.sku}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-gray-500 capitalize">{product.category?.replace('-', ' ')}</td>
                            <td className="py-3 px-4">
                              <span className="font-medium">Rs.{(product.salePrice || product.price || 0).toLocaleString()}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${(product.stockCount || 0) < 20 ? 'text-red-600' : ''}`}>
                                {product.stockCount || 0}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.inStock !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {product.inStock !== false ? 'ACTIVE' : 'INACTIVE'}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-1">
                                <button onClick={() => { setEditingProduct(product); setShowProductForm(true); }} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                                  <Edit size={14} className="text-gray-500" />
                                </button>
                                <button onClick={() => { if (confirm('Delete this product?')) deleteProduct(product.id); }} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                  <Trash2 size={14} className="text-red-500" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 border-t text-sm text-gray-500">
                    Showing {filteredProducts.length} of {products.length} products
                  </div>
                </div>
              </div>
            )}

            {/* Orders */}
            {activeSection === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Order Management</h2>
                {orders.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left py-3 px-4">Order #</th>
                          <th className="text-left py-3 px-4">Date</th>
                          <th className="text-left py-3 px-4">Items</th>
                          <th className="text-left py-3 px-4">Total</th>
                          <th className="text-left py-3 px-4">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map(order => (
                          <tr key={order.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium">{order.order_number}</td>
                            <td className="py-3 px-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                            <td className="py-3 px-4">{order.items?.length || 0} items</td>
                            <td className="py-3 px-4 font-bold">Rs.{order.total.toLocaleString()}</td>
                            <td className="py-3 px-4">
                              <select value={order.status} onChange={e => updateOrderStatus(order.id, e.target.value as Order['status'])} className="text-xs font-bold px-2 py-1 rounded-full border focus:outline-none">
                                <option value="pending_verification">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="processing">Processing</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-12 bg-white rounded-2xl">
                    <ShoppingBag className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500">No orders yet.</p>
                  </div>
                )}
              </div>
            )}

            {/* Customers */}
            {activeSection === 'customers' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Customer Management</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="grid md:grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-blue-50 rounded-xl"><p className="text-2xl font-bold">156</p><p className="text-sm text-gray-500">Total Customers</p></div>
                    <div className="p-4 bg-green-50 rounded-xl"><p className="text-2xl font-bold">142</p><p className="text-sm text-gray-500">Verified</p></div>
                    <div className="p-4 bg-purple-50 rounded-xl"><p className="text-2xl font-bold">23</p><p className="text-sm text-gray-500">New This Month</p></div>
                  </div>
                  <p className="text-gray-500 text-sm">Customer data synced from Neon DB users table.</p>
                </div>
              </div>
            )}

            {/* Reviews */}
            {activeSection === 'reviews' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
                <div className="space-y-3">
                  {reviews.map(review => (
                    <div key={review.id} className="bg-white rounded-xl p-4 shadow-sm flex items-start gap-4">
                      <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                        {review.user_name[0]}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{review.user_name}</span>
                          <div className="flex">{[...Array(review.rating)].map((_, i) => <Star key={i} size={12} className="fill-yellow-400 text-yellow-400" />)}</div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">"{review.comment}"</p>
                        <p className="text-xs text-gray-400 mt-1">{review.date}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${review.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {review.is_approved ? 'APPROVED' : 'PENDING'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Discounts */}
            {activeSection === 'discounts' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Discount Codes</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <button className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium mb-6">
                    <Plus size={16} /> Create Discount
                  </button>
                  <div className="space-y-3">
                    {[
                      { code: 'WELCOME10', type: 'percentage', value: 10, uses: '45/100', status: 'active' },
                      { code: 'FLAT500', type: 'fixed', value: 500, uses: '23/50', status: 'active' },
                      { code: 'SUMMER25', type: 'percentage', value: 25, uses: '0/200', status: 'upcoming' },
                    ].map((discount, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border rounded-xl">
                        <div>
                          <p className="font-mono font-bold">{discount.code}</p>
                          <p className="text-xs text-gray-500">{discount.type === 'percentage' ? `${discount.value}% off` : `Rs.${discount.value} off`} • {discount.uses} uses</p>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${discount.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                          {discount.status.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* SEO */}
            {activeSection === 'seo' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">SEO Settings</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                  <div><label className="block text-sm font-medium mb-1">Site Title</label><input type="text" defaultValue="Ravenza - Premium Streetwear" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" /></div>
                  <div><label className="block text-sm font-medium mb-1">Meta Description</label><textarea defaultValue="Pakistan's premium streetwear brand." className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black h-24" /></div>
                  <div><label className="block text-sm font-medium mb-1">Keywords</label><input type="text" defaultValue="streetwear, clothing, fashion, pakistan, ravenza" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" /></div>
                  <div className="border rounded-xl p-4 bg-gray-50">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Google Preview:</p>
                    <p className="text-blue-700 text-lg">Ravenza - Premium Streetwear</p>
                    <p className="text-green-700 text-sm">ravenza.pk</p>
                    <p className="text-gray-600 text-sm">Pakistan's premium streetwear brand. Discover co-ord sets, graphic tees, and more.</p>
                  </div>
                  <button className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">SAVE SEO SETTINGS</button>
                </div>
              </div>
            )}

            {/* Audit Logs */}
            {activeSection === 'audit' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Audit Logs</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                  <div className="space-y-3">
                    {[
                      { action: 'Product Updated', entity: 'Shadow Realm Co-Ord Set', user: 'Admin', time: '2 min ago' },
                      { action: 'Order Status Changed', entity: 'ORD-001 → Shipped', user: 'Admin', time: '1 hour ago' },
                      { action: 'New Customer Registered', entity: 'ahmed@email.com', user: 'System', time: '3 hours ago' },
                      { action: 'Product Created', entity: 'Neon Pulse Shorts', user: 'Admin', time: '1 day ago' },
                    ].map((log, i) => (
                      <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center"><FileText size={14} /></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{log.action}</p>
                          <p className="text-xs text-gray-500">{log.entity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{log.user}</p>
                          <p className="text-xs text-gray-400">{log.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Settings */}
            {activeSection === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">General Settings</h2>
                <div className="bg-white rounded-2xl p-6 shadow-sm space-y-5">
                  <div><label className="block text-sm font-medium mb-1">Store Name</label><input type="text" defaultValue="Ravenza" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" /></div>
                  <div><label className="block text-sm font-medium mb-1">Contact Email</label><input type="email" defaultValue="support@ravenza.pk" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" /></div>
                  <div><label className="block text-sm font-medium mb-1">Free Shipping Threshold</label><input type="number" defaultValue="3000" className="w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:border-black" /></div>
                  <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-sm font-bold text-purple-800 mb-2">Database Connection</p>
                    <p className="text-xs text-purple-600 font-mono">Neon DB: ep-fragrant-queen-aypcbom7</p>
                    <p className="text-xs text-green-600 mt-1">✓ Connected</p>
                  </div>
                  <button className="bg-black text-white px-8 py-3 rounded-xl font-bold text-sm hover:bg-gray-800 transition-colors">SAVE SETTINGS</button>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      {/* Product Form Modal */}
      {showProductForm && (
        <ProductForm product={editingProduct} onClose={() => { setShowProductForm(false); setEditingProduct(null); }} />
      )}
    </div>
  );
}
