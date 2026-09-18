import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  is_main_category: boolean;
  parent_id?: string;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  thumbnail_image: string;
  main_category_id: string;
  sub_category_id: string;
  is_featured: boolean;
  main_category_name?: string;
  sub_category_name?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    main_category_id: '',
    sub_category_id: '',
    is_featured: false,
    thumbnail: null as File | null
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories');
      const data = await response.json();
      setMainCategories(data.filter((cat: Category) => cat.is_main_category));
      setSubCategories(data.filter((cat: Category) => !cat.is_main_category));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const getSubCategoriesForMain = (mainCategoryId: string) => {
    return subCategories.filter(sub => {
      const mainCat = mainCategories.find(m => m.id === mainCategoryId);
      return mainCat && sub.parent_id === mainCat.id;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('slug', form.slug);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('main_category_id', form.main_category_id);
    formData.append('sub_category_id', form.sub_category_id);
    formData.append('is_featured', form.is_featured.toString());
    
    if (form.thumbnail) {
      formData.append('thumbnail', form.thumbnail);
    }
    
    try {
      const url = editingProduct 
        ? `http://localhost:3001/api/products/${editingProduct.id}`
        : 'http://localhost:3001/api/products';
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        body: formData
      });
      
      if (response.ok) {
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
        setShowForm(false);
        setEditingProduct(null);
        setForm({
          name: '',
          slug: '',
          description: '',
          price: '',
          main_category_id: '',
          sub_category_id: '',
          is_featured: false,
          thumbnail: null
        });
        fetchProducts();
      }
    } catch (error) {
      console.error('Error saving product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/products/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Product deleted successfully!');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      main_category_id: product.main_category_id,
      sub_category_id: product.sub_category_id,
      is_featured: product.is_featured,
      thumbnail: null
    });
    setShowForm(true);
  };

  const filteredSubCategories = form.main_category_id 
    ? getSubCategoriesForMain(form.main_category_id)
    : [];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products Management</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus size={20} />
          Add Product
        </button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow p-4"
          >
            <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden mb-3">
              <img 
                src={product.thumbnail_image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{product.description}</p>
            <p className="text-lg font-bold text-gray-900 mb-2">Rs. {product.price}</p>
            <div className="text-xs text-gray-500 mb-2">
              <p>Main: {product.main_category_name}</p>
              <p>Sub: {product.sub_category_name}</p>
            </div>
            {product.is_featured && (
              <span className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mb-2">
                Featured
              </span>
            )}
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleEdit(product)}
                className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
              >
                <Edit size={16} />
                Edit
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="flex-1 flex items-center justify-center gap-1 bg-red-200 text-red-700 px-3 py-1 rounded hover:bg-red-300"
              >
                <Trash2 size={16} />
                Delete
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingProduct ? 'Edit Product' : 'Add Product'}
              </h2>
              <button onClick={() => { setShowForm(false); setEditingProduct(null); }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Price *</label>
                <input
                  type="text"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="e.g., 2500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Main Category *</label>
                <select
                  value={form.main_category_id}
                  onChange={(e) => setForm({ ...form, main_category_id: e.target.value, sub_category_id: '' })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                >
                  <option value="">Select Main Category</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Sub Category *</label>
                <select
                  value={form.sub_category_id}
                  onChange={(e) => setForm({ ...form, sub_category_id: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                  disabled={!form.main_category_id}
                >
                  <option value="">Select Sub Category</option>
                  {filteredSubCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail Image *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, thumbnail: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required={!editingProduct}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={form.is_featured}
                  onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_featured" className="text-sm font-medium">
                  Show in Mega Menu (Featured Product)
                </label>
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editingProduct ? 'Update' : 'Create'} Product
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
