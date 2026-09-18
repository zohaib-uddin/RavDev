import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Mail, MapPin, CreditCard, Loader2 } from 'lucide-react';
import { useCart } from '../context/CartContext';

const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 
  'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 'Hyderabad', 'Bahawalpur',
  'Sargodha', 'Sukkur', 'Larkana', 'Abbottabad', 'Mardan', 'Bannu',
  'Dera Ismail Khan', 'Dera Ghazi Khan', 'Sahiwal', 'Mianwali', 'Jhelum',
  'Chakwal', 'Attock', 'Jhang', 'Rahim Yar Khan', 'Kasur', 'Okara',
  'Vehari', 'Bahawalnagar', 'Khushab', 'Muzaffargarh', 'Layyah', 'Bhakkar',
  'Swabi', 'Nowshera', 'Haripur', 'Mansehra', 'Swat', 'Dir', 'Chitral',
  'Gilgit', 'Skardu'
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items: cartItems, clearCart } = useCart();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Email & OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Step 2: Shipping & Billing
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [saveAddress, setSaveAddress] = useState(false);
  const [shippingData, setShippingData] = useState({
    name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: '',
    order_notes: ''
  });
  const [billingData, setBillingData] = useState({
    name: '',
    phone: '',
    address_line_1: '',
    address_line_2: '',
    city: '',
    postal_code: ''
  });
  const [formErrors, setFormErrors] = useState<any>({});
  
  // Step 3: Payment
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  
  // Order Success
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Validation functions
  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone: string) => {
    const regex = /^03[0-9]{9}$/;
    return regex.test(phone);
  };

  const handleSendOTP = async () => {
    setEmailError('');
    
    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'checkout' })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setResendCooldown(60);
        // For testing, show OTP in console (in production, this would be sent via email)
        console.log('OTP for testing:', data.otp);
      } else {
        setEmailError(data.message || 'Failed to send OTP');
      }
    } catch (error) {
      setEmailError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpError('');
    
    if (otp.length !== 6) {
      setOtpError('Please enter 6-digit OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await response.json();

      if (data.success) {
        setCurrentStep(2);
      } else {
        setOtpError(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return;
    await handleSendOTP();
    setOtp('');
    setOtpError('');
  };

  const validateStep2 = () => {
    const errors: any = {};

    // Shipping validation
    if (!shippingData.name.trim()) errors.shipping_name = 'Name is required';
    if (!shippingData.phone.trim()) errors.shipping_phone = 'Phone is required';
    else if (!validatePhone(shippingData.phone)) errors.shipping_phone = 'Invalid phone number (e.g., 03001234567)';
    if (!shippingData.address_line_1.trim()) errors.shipping_address = 'Address is required';
    if (!shippingData.city) errors.shipping_city = 'City is required';
    if (!shippingData.postal_code.trim()) errors.shipping_postal = 'Postal code is required';
    if (!shippingData.order_notes.trim() || shippingData.order_notes.length < 10) {
      errors.shipping_notes = 'Order notes must be at least 10 characters';
    }

    // Billing validation (if different)
    if (!sameAsShipping) {
      if (!billingData.name.trim()) errors.billing_name = 'Name is required';
      if (!billingData.phone.trim()) errors.billing_phone = 'Phone is required';
      else if (!validatePhone(billingData.phone)) errors.billing_phone = 'Invalid phone number';
      if (!billingData.address_line_1.trim()) errors.billing_address = 'Address is required';
      if (!billingData.city) errors.billing_city = 'City is required';
      if (!billingData.postal_code.trim()) errors.billing_postal = 'Postal code is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToPayment = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.product.actual_price * item.quantity), 0);
    const shippingCost = shippingMethod === 'standard' ? 300 : 600;
    const discount = 0; // TODO: Implement coupon logic
    const total = subtotal + shippingCost - discount;
    
    return { subtotal, shippingCost, discount, total };
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    
    try {
      const { subtotal, shippingCost, discount, total } = calculateTotals();
      
      const orderPayload = {
        customer_email: email,
        customer_name: shippingData.name,
        customer_phone: shippingData.phone,
        shipping: shippingData,
        billing: sameAsShipping ? shippingData : billingData,
        items: cartItems.map(item => ({
          product_id: item.product.id,
          name: item.product.name,
          image: item.product.thumbnail_image,
          quantity: item.quantity,
          size: item.size,
          color: item.color.name,
          price: item.product.actual_price
        })),
        subtotal,
        shipping_method: shippingMethod,
        shipping_cost: shippingCost,
        discount,
        total,
        payment_method: paymentMethod,
        order_notes: shippingData.order_notes,
        save_address: saveAddress
      };

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await response.json();

      if (data.success) {
        setOrderData(data.order);
        setOrderSuccess(true);
        clearCart();
      } else {
        alert('Failed to place order: ' + data.message);
      }
    } catch (error) {
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, shippingCost, discount, total } = calculateTotals();

  // Order Success Modal
  if (orderSuccess && orderData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-md w-full shadow-xl text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
          >
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">Order Placed Successfully!</h2>
          <p className="text-gray-600 mb-6">
            A confirmation email has been sent to <strong>{email}</strong>
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Order Number:</span>
              <span className="font-bold">{orderData.order_number}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tracking ID:</span>
              <span className="font-bold">{orderData.tracking_id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total:</span>
              <span className="font-bold">Rs. {orderData.total.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
            >
              View Order Details
            </button>
            <button
              onClick={() => navigate('/')}
              className="flex-1 border-2 border-black py-3 rounded-lg font-semibold hover:bg-gray-50"
            >
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[
            { num: 1, label: 'Email Verification', icon: Mail },
            { num: 2, label: 'Shipping Details', icon: MapPin },
            { num: 3, label: 'Payment', icon: CreditCard }
          ].map((step, idx) => (
            <div key={step.num} className="flex items-center">
              <div className={`flex items-center gap-2 ${currentStep >= step.num ? 'text-black' : 'text-gray-400'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep > step.num ? 'bg-green-500 text-white' :
                  currentStep === step.num ? 'bg-black text-white' : 'bg-gray-200'
                }`}>
                  {currentStep > step.num ? <CheckCircle size={20} /> : <step.icon size={20} />}
                </div>
                <span className="font-medium hidden md:block">{step.label}</span>
              </div>
              {idx < 2 && (
                <div className={`w-16 h-1 mx-2 ${currentStep > step.num ? 'bg-green-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Side - Form */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">
              {/* Step 1: Email & OTP */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-6">Email Verification</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Email Address *</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={otpSent}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black ${
                          emailError ? 'border-red-500' : 'border-gray-200'
                        }`}
                        placeholder="your@email.com"
                      />
                      {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
                    </div>

                    {!otpSent ? (
                      <button
                        onClick={handleSendOTP}
                        disabled={loading || !email}
                        className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Send OTP'}
                      </button>
                    ) : (
                      <>
                        <div>
                          <label className="block text-sm font-medium mb-2">Enter OTP *</label>
                          <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            maxLength={6}
                            className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black text-center text-2xl tracking-widest ${
                              otpError ? 'border-red-500' : 'border-gray-200'
                            }`}
                            placeholder="------"
                          />
                          {otpError && <p className="text-red-500 text-sm mt-1">{otpError}</p>}
                        </div>
                        
                        <div className="flex gap-3">
                          <button
                            onClick={handleVerifyOTP}
                            disabled={loading || otp.length !== 6}
                            className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300"
                          >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Verify OTP'}
                          </button>
                          <button
                            onClick={handleResendOTP}
                            disabled={resendCooldown > 0}
                            className="px-6 py-3 border-2 border-black rounded-lg font-semibold hover:bg-gray-50 disabled:border-gray-300 disabled:text-gray-300"
                          >
                            {resendCooldown > 0 ? `Resend (${resendCooldown}s)` : 'Resend OTP'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Step 2: Shipping & Billing */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={shippingData.name}
                        onChange={(e) => setShippingData({...shippingData, name: e.target.value})}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black ${
                          formErrors.shipping_name ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.shipping_name && <p className="text-red-500 text-sm mt-1">{formErrors.shipping_name}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Phone Number *</label>
                      <input
                        type="tel"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({...shippingData, phone: e.target.value})}
                        placeholder="03001234567"
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black ${
                          formErrors.shipping_phone ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.shipping_phone && <p className="text-red-500 text-sm mt-1">{formErrors.shipping_phone}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 1 *</label>
                      <input
                        type="text"
                        value={shippingData.address_line_1}
                        onChange={(e) => setShippingData({...shippingData, address_line_1: e.target.value})}
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black ${
                          formErrors.shipping_address ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.shipping_address && <p className="text-red-500 text-sm mt-1">{formErrors.shipping_address}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Address Line 2 (Optional)</label>
                      <input
                        type="text"
                        value={shippingData.address_line_2}
                        onChange={(e) => setShippingData({...shippingData, address_line_2: e.target.value})}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-black"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">City *</label>
                        <select
                          value={shippingData.city}
                          onChange={(e) => setShippingData({...shippingData, city: e.target.value})}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black ${
                            formErrors.shipping_city ? 'border-red-500' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select City</option>
                          {PAKISTAN_CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                        {formErrors.shipping_city && <p className="text-red-500 text-sm mt-1">{formErrors.shipping_city}</p>}
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Postal Code *</label>
                        <input
                          type="text"
                          value={shippingData.postal_code}
                          onChange={(e) => setShippingData({...shippingData, postal_code: e.target.value})}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black ${
                            formErrors.shipping_postal ? 'border-red-500' : 'border-gray-200'
                          }`}
                        />
                        {formErrors.shipping_postal && <p className="text-red-500 text-sm mt-1">{formErrors.shipping_postal}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Order Notes *</label>
                      <textarea
                        value={shippingData.order_notes}
                        onChange={(e) => setShippingData({...shippingData, order_notes: e.target.value})}
                        rows={3}
                        placeholder="Any special instructions for your order..."
                        className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-black ${
                          formErrors.shipping_notes ? 'border-red-500' : 'border-gray-200'
                        }`}
                      />
                      {formErrors.shipping_notes && <p className="text-red-500 text-sm mt-1">{formErrors.shipping_notes}</p>}
                    </div>

                    {/* Billing Address */}
                    <div className="border-t pt-6 mt-6">
                      <label className="flex items-center gap-3 cursor-pointer mb-4">
                        <input
                          type="checkbox"
                          checked={sameAsShipping}
                          onChange={(e) => setSameAsShipping(e.target.checked)}
                          className="w-5 h-5"
                        />
                        <span className="font-medium">Billing address same as shipping</span>
                      </label>

                      <AnimatePresence>
                        {!sameAsShipping && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                          >
                            <h3 className="font-bold">Billing Information</h3>
                            {/* Billing fields similar to shipping */}
                            <input
                              type="text"
                              placeholder="Billing Name"
                              value={billingData.name}
                              onChange={(e) => setBillingData({...billingData, name: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                            />
                            <input
                              type="tel"
                              placeholder="Billing Phone"
                              value={billingData.phone}
                              onChange={(e) => setBillingData({...billingData, phone: e.target.value})}
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg"
                            />
                            {/* Add more billing fields as needed */}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={saveAddress}
                        onChange={(e) => setSaveAddress(e.target.checked)}
                        className="w-5 h-5"
                      />
                      <span>Save this address to my profile for future orders</span>
                    </label>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setCurrentStep(1)}
                        className="flex-1 border-2 border-black py-3 rounded-lg font-semibold hover:bg-gray-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleProceedToPayment}
                        className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800"
                      >
                        Continue to Payment
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="bg-white rounded-xl p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold mb-6">Payment Method</h2>
                  
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold">Shipping Method</h3>
                    <label className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:border-black">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="standard"
                          checked={shippingMethod === 'standard'}
                          onChange={(e) => setShippingMethod(e.target.value as any)}
                          className="w-5 h-5"
                        />
                        <div>
                          <p className="font-medium">Standard Delivery</p>
                          <p className="text-sm text-gray-600">3-5 business days</p>
                        </div>
                      </div>
                      <span className="font-bold">Rs. 300</span>
                    </label>
                    <label className="flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer hover:border-black">
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="shipping"
                          value="express"
                          checked={shippingMethod === 'express'}
                          onChange={(e) => setShippingMethod(e.target.value as any)}
                          className="w-5 h-5"
                        />
                        <div>
                          <p className="font-medium">Express Delivery</p>
                          <p className="text-sm text-gray-600">1-2 business days</p>
                        </div>
                      </div>
                      <span className="font-bold">Rs. 600</span>
                    </label>
                  </div>

                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold">Payment Method</h3>
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-black">
                      <input
                        type="radio"
                        name="payment"
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-5 h-5"
                      />
                      <span className="font-medium">Cash on Delivery (COD)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-black opacity-50">
                      <input
                        type="radio"
                        name="payment"
                        value="online"
                        checked={paymentMethod === 'online'}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-5 h-5"
                        disabled
                      />
                      <span className="font-medium">Online Payment (Coming Soon)</span>
                    </label>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="flex-1 border-2 border-black py-3 rounded-lg font-semibold hover:bg-gray-50"
                    >
                      Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 disabled:bg-gray-300"
                    >
                      {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : `Place Order - Rs. ${total.toLocaleString()}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Side - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-6 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              
              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <img
                      src={item.product.thumbnail_image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium line-clamp-2">{item.product.name}</p>
                      <p className="text-xs text-gray-600">Size: {item.size} | Color: {item.color.name}</p>
                      <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                      <p className="text-sm font-bold">Rs. {(item.product.actual_price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Rs. {subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping ({shippingMethod})</span>
                  <span>Rs. {shippingCost.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-Rs. {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span>Rs. {total.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
