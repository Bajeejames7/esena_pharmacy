import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { validateOrderForm, validateField } from '../utils/validation';
import { ordersAPI } from '../services/api';
import GlassCard from '../components/GlassCard';
import { countyOptions, getTownOptions } from '../utils/kenyaLocations';
import GlassInput from '../components/forms/GlassInput';
import GlassSelect from '../components/forms/GlassSelect';
import GlassButton from '../components/forms/GlassButton';

const PICKUP_ADDRESS = 'Esena Pharmacy, Outering Road, Behind Eastmart Supermarket, Ruaraka, Nairobi';

const Checkout = () => {
  const { items, total, itemCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '',
    deliveryType: 'delivery', // 'delivery' | 'pickup'
    deliveryZone: 'nairobi',  // 'nairobi' | 'outside_nairobi'
    address: '', city: '', state: '', landmark: '',
    paymentMethod: 'mpesa'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deliveryPrices, setDeliveryPrices] = useState({
    delivery_nairobi: 150,
    delivery_outside_nairobi: 350,
    pickup_cost: 0
  });
  const [loadingPrices, setLoadingPrices] = useState(true);

  const paymentOptions = [
    { value: 'mpesa', label: 'M-Pesa' },
    { value: 'card', label: 'Credit/Debit Card' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  // Fetch live delivery prices from backend
  useEffect(() => {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/settings/delivery`)
      .then(r => r.json())
      .then(data => setDeliveryPrices(data))
      .catch(() => {}) // keep defaults on error
      .finally(() => setLoadingPrices(false));
  }, []);

  const getShippingCost = () => {
    if (formData.deliveryType === 'pickup') return parseFloat(deliveryPrices.pickup_cost) || 0;
    if (formData.deliveryZone === 'outside_nairobi') return parseFloat(deliveryPrices.delivery_outside_nairobi) || 350;
    return parseFloat(deliveryPrices.delivery_nairobi) || 150;
  };

  const safeTotal = parseFloat(total) || 0;
  const shippingCost = getShippingCost();
  const finalTotal = safeTotal + shippingCost;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      const validation = validateField(name, value, formData);
      setErrors(prev => ({ ...prev, [name]: validation.isValid ? null : validation.error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const validation = validateField(name, value, formData);
    setErrors(prev => ({ ...prev, [name]: validation.isValid ? null : validation.error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // For pickup, address fields aren't required
    const dataToValidate = formData.deliveryType === 'pickup'
      ? { ...formData, address: 'In-store pickup', city: 'Nairobi', state: 'Nairobi', landmark: 'pickup' }
      : formData;

    const validation = validateOrderForm(dataToValidate);
    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const deliveryAddress = formData.deliveryType === 'pickup'
        ? PICKUP_ADDRESS
        : `${formData.address}, ${formData.city}, ${formData.state}${formData.landmark ? ', ' + formData.landmark : ''}`;

      const orderPayload = {
        customer_name: formData.name,
        email: formData.email,
        phone: formData.phone,
        delivery_address: deliveryAddress,
        delivery_type: formData.deliveryType,
        delivery_zone: formData.deliveryType === 'pickup' ? 'pickup' : formData.deliveryZone,
        shipping_cost: shippingCost,
        notes: formData.paymentMethod,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        }))
      };

      const response = await ordersAPI.create(orderPayload);
      clearCart();
      navigate('/order-success', {
        state: {
          orderData: {
            ...formData,
            items,
            subtotal: safeTotal,
            shipping: shippingCost,
            total: finalTotal,
            orderId: response.orderId,
            trackingToken: response.token,
            deliveryType: formData.deliveryType,
            deliveryZone: formData.deliveryZone,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error) {
      console.error('Order submission error:', error);
      setErrors({ submit: error.response?.data?.message || 'Failed to process order. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h1 className="text-gray-800 mb-4">Checkout</h1>
            <p className="text-gray-600 mb-6">Your cart is empty. Add some items before checkout.</p>
            <GlassButton onClick={() => navigate('/products')}>Browse Products</GlassButton>
          </GlassCard>
        </div>
      </div>
    );
  }

  const deliveryZoneLabel = formData.deliveryType === 'pickup'
    ? 'In-store Pickup'
    : formData.deliveryZone === 'outside_nairobi'
      ? 'Outside Nairobi'
      : 'Within Nairobi';

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8">
              <h1 className="text-gray-800 mb-6">Checkout</h1>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Information */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Customer Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <GlassInput label="Full Name" name="name" value={formData.name} onChange={handleChange} onBlur={handleBlur} error={errors.name} required autoComplete="name" />
                    <GlassInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} onBlur={handleBlur} error={errors.email} required autoComplete="email" />
                    <GlassInput label="Phone Number" name="phone" type="tel" value={formData.phone} onChange={handleChange} onBlur={handleBlur} error={errors.phone} required autoComplete="tel" className="md:col-span-2" />
                  </div>
                </div>

                {/* Delivery Type */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Option</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    {/* Delivery card */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'delivery' }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.deliveryType === 'delivery'
                          ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-900/20'
                          : 'border-white/30 bg-white/10 hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">🚚</span>
                        <span className="font-semibold text-gray-800 dark:text-white">Home Delivery</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">We deliver to your address</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {loadingPrices ? 'Loading...' : `Nairobi: KSh ${deliveryPrices.delivery_nairobi} · Outside: KSh ${deliveryPrices.delivery_outside_nairobi}`}
                      </p>
                    </button>

                    {/* Pickup card */}
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, deliveryType: 'pickup' }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.deliveryType === 'pickup'
                          ? 'border-green-500 bg-green-50/60 dark:bg-green-900/20'
                          : 'border-white/30 bg-white/10 hover:border-green-300'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">🏪</span>
                        <span className="font-semibold text-gray-800 dark:text-white">Pick Up In-Store</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Collect from our pharmacy</p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">FREE</p>
                    </button>
                  </div>

                  {/* Pickup address info */}
                  {formData.deliveryType === 'pickup' && (
                    <div className="p-4 bg-green-50/60 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg text-sm">
                      <p className="font-medium text-green-800 dark:text-green-200 mb-1">📍 Pickup Location</p>
                      <p className="text-green-700 dark:text-green-300">{PICKUP_ADDRESS}</p>
                      <p className="text-green-600 dark:text-green-400 text-xs mt-1">Mon–Sat, 8:00 AM – 6:00 PM · Call 0768103599 before coming</p>
                    </div>
                  )}

                  {/* Delivery zone selector */}
                  {formData.deliveryType === 'delivery' && (
                    <div className="mt-4">
                      <GlassSelect
                        label="Delivery Zone"
                        name="deliveryZone"
                        value={formData.deliveryZone}
                        onChange={handleChange}
                        options={[
                          { value: 'nairobi', label: `Within Nairobi — KSh ${deliveryPrices.delivery_nairobi}` },
                          { value: 'outside_nairobi', label: `Outside Nairobi — KSh ${deliveryPrices.delivery_outside_nairobi}` }
                        ]}
                      />
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                        ⚠️ Delivery cost is an estimate and may be adjusted based on your exact location. You will be notified before dispatch.
                      </p>
                    </div>
                  )}
                </div>

                {/* Delivery Address — only for home delivery */}
                {formData.deliveryType === 'delivery' && (
                  <div>
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Delivery Address</h2>
                    <div className="space-y-6">
                      <GlassInput label="Street Address" name="address" value={formData.address} onChange={handleChange} onBlur={handleBlur} error={errors.address} required autoComplete="street-address" />
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <GlassSelect
                          label="County"
                          name="state"
                          value={formData.state}
                          onChange={(e) => { handleChange(e); setFormData(prev => ({ ...prev, city: '' })); }}
                          options={countyOptions}
                          placeholder="Select County"
                          error={errors.state}
                          required
                        />
                        <GlassSelect
                          label="Town / City"
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          options={getTownOptions(formData.state)}
                          error={errors.city}
                          required
                          disabled={!formData.state}
                          placeholder={formData.state ? 'Select Town / City' : 'Select a county first'}
                        />
                        <GlassInput
                          label="Nearest Landmark"
                          name="landmark"
                          value={formData.landmark}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={errors.landmark}
                          placeholder="e.g. Near St. Mary's School"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Payment Method</h2>
                  <GlassSelect label="Payment Method" name="paymentMethod" value={formData.paymentMethod} onChange={handleChange} options={paymentOptions} required />
                </div>

                {errors.submit && (
                  <div className="p-4 bg-red-100/50 border border-red-200 rounded-lg text-red-700">{errors.submit}</div>
                )}

                <GlassButton type="submit" loading={isSubmitting} disabled={isSubmitting} className="w-full" size="lg">
                  {isSubmitting ? 'Processing Order...' : `Place Order — KSh ${finalTotal.toFixed(2)}`}                </GlassButton>
              </form>
            </GlassCard>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-24">
              <h2 className="text-gray-800 mb-6">Order Summary</h2>

              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-800 dark:text-gray-100 text-sm truncate">{item.name}</p>
                      <p className="text-gray-500 dark:text-gray-400 text-xs">Qty: {item.quantity} × KSh {parseFloat(item.price || 0).toFixed(2)}</p>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm flex-shrink-0">
                      KSh {(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-t border-white/20 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Products Subtotal</span>
                  <span className="text-gray-800 dark:text-white">KSh {safeTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {deliveryZoneLabel}
                    {formData.deliveryType === 'delivery' && <span className="text-xs text-amber-500 block">*estimate</span>}
                  </span>
                  <span className={`${shippingCost === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                    {shippingCost === 0 ? 'FREE' : `KSh ${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-white/20 pt-3">
                  <span className="text-gray-800">Estimated Total</span>
                  <span className="text-gray-800 dark:text-white">KSh {finalTotal.toFixed(2)}</span>
                </div>
              </div>

              {formData.deliveryType === 'delivery' && (
                <div className="mt-4 p-3 bg-amber-50/60 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg">
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    ⚠️ Delivery cost is subject to change based on your exact location. Our team will confirm the final amount before dispatch.
                  </p>
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
