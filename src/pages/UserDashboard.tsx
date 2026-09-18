import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, MapPin, Heart, Settings, LogOut } from 'lucide-react';

export default function UserDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
      navigate('/login');
      return;
    }

    // Fetch user data
    fetchUser(userId);
  }, []);

  const fetchUser = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/users/${userId}`);
      const data = await response.json();
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/');
  };

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl font-bold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-bold text-lg">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
              </div>

              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'overview' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} />
                  <span>Overview</span>
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'orders' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Package size={20} />
                  <span>My Orders</span>
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'addresses' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <MapPin size={20} />
                  <span>Addresses</span>
                </button>
                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'wishlist' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Heart size={20} />
                  <span>Wishlist</span>
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === 'settings' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  <Settings size={20} />
                  <span>Settings</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Pending Orders</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <p className="text-sm text-gray-600 mb-1">Wishlist Items</p>
                    <p className="text-3xl font-bold">0</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm">
                  <h3 className="font-bold text-lg mb-4">Recent Orders</h3>
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Orders</h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-gray-500 text-center py-8">No orders yet</p>
                </div>
              </div>
            )}

            {activeTab === 'addresses' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">My Addresses</h2>
                  <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                    Add New Address
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-gray-500 text-center py-8">No addresses saved</p>
                </div>
              </div>
            )}

            {activeTab === 'wishlist' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">My Wishlist</h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <p className="text-gray-500 text-center py-8">Your wishlist is empty</p>
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Account Settings</h2>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Name</label>
                      <input
                        type="text"
                        defaultValue={user.name}
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full px-4 py-3 border-2 rounded-lg bg-gray-100 cursor-not-allowed"
                      />
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Phone</label>
                      <input
                        type="tel"
                        defaultValue={user.phone || ''}
                        placeholder="03001234567"
                        className="w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>
                    <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
