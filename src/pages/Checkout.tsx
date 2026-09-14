import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, CreditCard, Truck } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Checkout() {
  const { cart, clearCart, addOrder, user } = useStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: user?.email || '', phone: '', address: '', city: '', postalCode: '', paymentMethod: 'cod' });
  const subtotal = cart.reduce((sum, item) => sum + (item.product.salePrice || item.product.price || 0) * item.quantity, 0);
  const shipping = subtotal >= 3000 ? 0 : 200;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) { setStep(2); return; }
    const order = { id: `ORD-${Date.now()}`, order_number: `RVZ-${Date.now().toString().slice(-6)}`, user_id: user?.id || 'guest', items: cart, total, subtotal, shipping_cost: shipping, status: 'pending_verification' as const, date: new Date().toISOString(), address: { ...formData } };
    addOrder(order);
    clearCart();
    setOrderPlaced(true);
  };

  if (cart.length === 0 && !orderPlaced) { navigate('/cart'); return null; }
  if (orderPlaced) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center max-w-md">
        <CheckCircle className="mx-auto text-green-500 mb-4" size={64} />
        <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-500 mb-6">Thank you for your order.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-black text-white px-8 py-3 rounded-full font-semibold text-sm">CONTINUE SHOPPING</Link>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>
        <div className="flex items-center justify-center mb-10">
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 ${step >= 1 ? 'text-black' : 'text-gray-400'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-black text-white' : 'bg-gray-200'}`}>1</div><span className="text-sm font-medium hidden sm:block">Shipping</span></div>
            <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-black' : 'bg-gray-200'}`} />
            <div className={`flex items-center gap-2 ${step >= 2 ? 'text-black' : 'text-gray-400'}`}><div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-black text-white' : 'bg-gray-200'}`}>2</div><span className="text-sm font-medium hidden sm:block">Payment</span></div>
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <motion.form key={step} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm">
            {step === 1 && (<>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Truck size={20} /> Shipping Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">First Name *</label><input type="text" required value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div><label className="block text-sm font-medium mb-1">Last Name *</label><input type="text" required value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div><label className="block text-sm font-medium mb-1">Phone *</label><input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div className="md:col-span-2"><label className="block text-sm font-medium mb-1">Address *</label><input type="text" required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div><label className="block text-sm font-medium mb-1">City *</label><input type="text" required value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
                <div><label className="block text-sm font-medium mb-1">Postal Code *</label><input type="text" required value={formData.postalCode} onChange={e => setFormData({...formData, postalCode: e.target.value})} className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black/10" /></div>
              </div>
              <button type="submit" className="mt-6 w-full bg-black text-white py-4 rounded-full font-bold text-sm">CONTINUE TO PAYMENT</button>
            </>)}
            {step === 2 && (<>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><CreditCard size={20} /> Payment Method</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-black"><input type="radio" name="payment" value="cod" checked={formData.paymentMethod === 'cod'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-4 h-4" /><div><span className="font-medium">Cash on Delivery</span><p className="text-xs text-gray-500">Pay when you receive</p></div></label>
                <label className="flex items-center gap-3 p-4 border rounded-xl cursor-pointer hover:border-black"><input type="radio" name="payment" value="bank" checked={formData.paymentMethod === 'bank'} onChange={e => setFormData({...formData, paymentMethod: e.target.value})} className="w-4 h-4" /><div><span className="font-medium">Bank Transfer</span><p className="text-xs text-gray-500">Transfer to our account</p></div></label>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 border-2 border-black py-4 rounded-full font-bold text-sm">BACK</button>
                <button type="submit" className="flex-1 bg-black text-white py-4 rounded-full font-bold text-sm">PLACE ORDER - Rs.{total.toLocaleString()}</button>
              </div>
            </>)}
          </motion.form>
          <div className="bg-white rounded-xl p-6 shadow-sm h-fit sticky top-24">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {cart.map(item => (<div key={`${item.product.id}-${item.size}`} className="flex gap-3"><img src={item.product.image} alt="" className="w-12 h-14 rounded object-cover" /><div className="flex-1"><p className="text-xs font-medium line-clamp-1">{item.product.name}</p><p className="text-xs text-gray-500">{item.size} × {item.quantity}</p></div><span className="text-xs font-bold">Rs.{((item.product.salePrice || item.product.price || 0) * item.quantity).toLocaleString()}</span></div>))}
            </div>
            <hr className="my-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>Rs.{subtotal.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>{shipping === 0 ? 'FREE' : `Rs.${shipping}`}</span></div>
              <hr /><div className="flex justify-between font-bold text-lg"><span>Total</span><span>Rs.{total.toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
