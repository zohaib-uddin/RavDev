import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail_image?: string;
  banner_image?: string;
  parent_id?: string;
  is_main_category: boolean;
  product_count: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [showSubCategoryForm, setShowSubCategoryForm] = useState(false);
  const [showMainCategoryForm, setShowMainCategoryForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Sub-category form state
  const [subCategoryForm, setSubCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    thumbnail: null as File | null
  });
  
  // Main category form state
  const [mainCategoryForm, setMainCategoryForm] = useState({
    name: '',
    slug: '',
    description: '',
    banner: null as File | null,
    selectedSubCategories: [] as string[]
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/categories');
      const data = await response.json();
      setCategories(data);
      
      // Separate sub-categories (parent_id = null)
      const subs = data.filter((cat: Category) => !cat.is_main_category && !cat.parent_id);
      setSubCategories(subs);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSubCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', subCategoryForm.name);
    formData.append('slug', subCategoryForm.slug);
    formData.append('description', subCategoryForm.description);
    if (subCategoryForm.thumbnail) {
      formData.append('thumbnail', subCategoryForm.thumbnail);
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/sub-categories', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Sub-category created successfully!');
        setShowSubCategoryForm(false);
        setSubCategoryForm({ name: '', slug: '', description: '', thumbnail: null });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating sub-category:', error);
    }
  };

  const handleMainCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('name', mainCategoryForm.name);
    formData.append('slug', mainCategoryForm.slug);
    formData.append('description', mainCategoryForm.description);
    formData.append('sub_category_ids', JSON.stringify(mainCategoryForm.selectedSubCategories));
    if (mainCategoryForm.banner) {
      formData.append('banner', mainCategoryForm.banner);
    }
    
    try {
      const response = await fetch('http://localhost:3001/api/admin/main-categories', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        alert('Main category created successfully!');
        setShowMainCategoryForm(false);
        setMainCategoryForm({ name: '', slug: '', description: '', banner: null, selectedSubCategories: [] });
        fetchCategories();
      }
    } catch (error) {
      console.error('Error creating main category:', error);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const response = await fetch(`http://localhost:3001/api/admin/categories/${id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        alert('Category deleted successfully!');
        fetchCategories();
      }
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  };

  const mainCategories = categories.filter(cat => cat.is_main_category);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories Management</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSubCategoryForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} />
            Add Sub-Category
          </button>
          <button
            onClick={() => setShowMainCategoryForm(true)}
            className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
          >
            <Plus size={20} />
            Add Main Category
          </button>
        </div>
      </div>

      {/* Sub-Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Sub-Categories (Level 1)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {subCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              {category.thumbnail_image && (
                <img src={category.thumbnail_image} alt={category.name} className="w-full h-32 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <p className="text-xs text-gray-500">Products: {category.product_count}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowSubCategoryForm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-200 text-red-700 px-3 py-1 rounded hover:bg-red-300"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Main Categories Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Main Categories (Level 2)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mainCategories.map((category) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg shadow p-4"
            >
              {category.banner_image && (
                <img src={category.banner_image} alt={category.name} className="w-full h-40 object-cover rounded-lg mb-3" />
              )}
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{category.description}</p>
              <p className="text-xs text-gray-500">Products: {category.product_count}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowMainCategoryForm(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1 bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteCategory(category.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-red-200 text-red-700 px-3 py-1 rounded hover:bg-red-300"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sub-Category Form Modal */}
      {showSubCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Sub-Category' : 'Add Sub-Category'}
              </h2>
              <button onClick={() => { setShowSubCategoryForm(false); setEditingCategory(null); }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={subCategoryForm.name}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={subCategoryForm.slug}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={subCategoryForm.description}
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Thumbnail Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSubCategoryForm({ ...subCategoryForm, thumbnail: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                {editingCategory ? 'Update' : 'Create'} Sub-Category
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Main Category Form Modal */}
      {showMainCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingCategory ? 'Edit Main Category' : 'Add Main Category'}
              </h2>
              <button onClick={() => { setShowMainCategoryForm(false); setEditingCategory(null); }}>
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleMainCategorySubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name *</label>
                <input
                  type="text"
                  value={mainCategoryForm.name}
                  onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Slug *</label>
                <input
                  type="text"
                  value={mainCategoryForm.slug}
                  onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, slug: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={mainCategoryForm.description}
                  onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Banner Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setMainCategoryForm({ ...mainCategoryForm, banner: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Assign Sub-Categories</label>
                <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                  {subCategories.map((subCat) => (
                    <label key={subCat.id} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={mainCategoryForm.selectedSubCategories.includes(subCat.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setMainCategoryForm({
                              ...mainCategoryForm,
                              selectedSubCategories: [...mainCategoryForm.selectedSubCategories, subCat.id]
                            });
                          } else {
                            setMainCategoryForm({
                              ...mainCategoryForm,
                              selectedSubCategories: mainCategoryForm.selectedSubCategories.filter(id => id !== subCat.id)
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">{subCat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
              >
                {editingCategory ? 'Update' : 'Create'} Main Category
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
