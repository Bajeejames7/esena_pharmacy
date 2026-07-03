import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import MpesaPaymentModal from '../components/MpesaPaymentModal';
import PaymentReceipt from '../components/PaymentReceipt';

const OrderSuccess = () => {
  const location = useLocation();
  const orderData = location.state?.orderData;

  const [showMpesaModal, setShowMpesaModal] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);
  const [mpesaReceipt, setMpesaReceipt] = useState(orderData?.mpesaReceipt || '');
  const [statusChecked, setStatusChecked] = useState(false);

  // On mount: for M-Pesa pending orders, immediately check the real order status
  // from the backend. The Safaricom callback may have already arrived and marked
  // the order as paid while the modal countdown was still running.
  useEffect(() => {
    if (!orderData) { setStatusChecked(true); return; }
    if (orderData.paymentMethod !== 'mpesa') { setStatusChecked(true); return; }
    if (orderData.paymentStatus === 'paid') { setStatusChecked(true); return; }

    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    fetch(`${apiUrl}/orders/${orderData.trackingToken}`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.status === 'paid') {
          setMpesaReceipt(data.mpesa_receipt || '');
          setPaymentDone(true);
        }
      })
      .catch(() => {})
      .finally(() => setStatusChecked(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Called when the retry modal confirms payment
  const onMpesaSuccess = ({ receipt }) => {
    setMpesaReceipt(receipt || '');
    setPaymentDone(true);
    setShowMpesaModal(false);
  };

  // Brief spinner while we verify payment status with the backend
  if (!statusChecked && orderData?.paymentMethod === 'mpesa' && orderData?.paymentStatus !== 'paid') {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-2xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Checking payment status...</p>
          </GlassCard>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <h1 className="text-gray-800 mb-4">Order Not Found</h1>
            <p className="text-gray-600 mb-6">
              We couldn't find your order information. Please check your email for confirmation details.
            </p>
            <Link to="/"><GlassButton>Return Home</GlassButton></Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  const isMpesa = orderData.paymentMethod === 'mpesa';
  const isPaid = paymentDone || orderData.paymentStatus === 'paid';
  const isMpesaPending = isMpesa && !isPaid;

  // ── M-Pesa: payment still pending — show retry page ───────────────────────
  if (isMpesaPending) {
    return (
      <div className="pt-24 pb-16">
        {showMpesaModal && (
          <MpesaPaymentModal
            orderId={orderData.orderId}
            orderToken={orderData.trackingToken}
            amount={orderData.total}
            defaultPhone={orderData.phone}
            onSuccess={onMpesaSuccess}
            onClose={() => setShowMpesaModal(false)}
          />
        )}

        <div className="max-w-2xl mx-auto px-4">
          <GlassCard className="p-8 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <svg className="w-10 h-10 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
              Payment Not Completed
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-1">
              Your order <span className="font-semibold text-gray-800 dark:text-white">#{orderData.orderId}</span> is saved but payment was not received.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
              Your items are still reserved. Complete payment to confirm your order.
            </p>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-8">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-500">Amount due</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">
                  KSh {parseFloat(orderData.total).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment method</span>
                <span className="font-semibold text-green-700 dark:text-green-400">M-Pesa</span>
              </div>
            </div>

            <button
              onClick={() => setShowMpesaModal(true)}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-base transition-colors mb-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Retry M-Pesa Payment
            </button>

            {orderData.trackingToken && (
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 mb-4 text-left">
                <p className="text-xs text-gray-500 mb-1">Order tracking token</p>
                <p className="font-mono font-bold text-blue-700 dark:text-blue-400 text-sm break-all">
                  {orderData.trackingToken}
                </p>
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Keep this private — it gives access to your order details.
                </p>
              </div>
            )}

            <Link to="/track-order">
              <GlassButton variant="secondary" className="w-full">
                Track My Order
              </GlassButton>
            </Link>
          </GlassCard>
        </div>
      </div>
    );
  }

  // ── Paid or non-M-Pesa: full success page ─────────────────────────────────
  const receipt = mpesaReceipt || orderData.mpesaReceipt;

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4">
        <GlassCard className="p-8 text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {isPaid && isMpesa ? (
            <>
              <h1 className="text-gray-800 mb-2">Payment Confirmed!</h1>
              <p className="text-gray-600 mb-3">
                Your M-Pesa payment was received. Your order is now being prepared.
              </p>
              {receipt && (
                <div className="inline-block bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg px-4 py-2 mb-4">
                  <p className="text-xs text-gray-500 mb-0.5">M-Pesa Receipt</p>
                  <p className="font-mono font-bold text-green-700 dark:text-green-400 tracking-wider">
                    {receipt}
                  </p>
                </div>
              )}
              <div className="flex justify-center mt-2 mb-2">
                <PaymentReceipt order={{
                  ...orderData,
                  mpesaReceipt: receipt,
                  customer_name: orderData.name,
                  items: orderData.items || []
                }} />
              </div>
            </>
          ) : (
            <>
              <h1 className="text-gray-800 mb-2">Order Placed Successfully!</h1>
              <p className="text-gray-600 mb-4">
                Thank you for your order. We've received it and will process it shortly.
              </p>
            </>
          )}

          <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 mb-4 text-sm">
            <p className="text-gray-700 mb-1">
              A confirmation has been sent to <span className="font-medium">{orderData.email}</span>.
            </p>
            <p className="text-xs text-amber-600">Keep your tracking token private — do not share it with anyone.</p>
          </div>

          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-700">
            Can't find the email? Check your <span className="font-semibold">Spam / Junk</span> folder.
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/track-order">
              <GlassButton variant="primary">Track Your Order</GlassButton>
            </Link>
            <Link to="/products">
              <GlassButton variant="secondary">Continue Shopping</GlassButton>
            </Link>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <GlassCard className="p-6">
            <h2 className="text-gray-800 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-6">
              {orderData.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/10 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-800">{item.name}</p>
                    <p className="text-gray-600 text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-gray-800">
                    KSh {(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
            <div className="space-y-2 border-t border-white/20 pt-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-800">KSh {parseFloat(orderData.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Delivery</span>
                <span className="text-gray-800">
                  {parseFloat(orderData.shipping) === 0 ? 'FREE' : `KSh ${parseFloat(orderData.shipping).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t border-white/20 pt-2">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">KSh {parseFloat(orderData.total).toFixed(2)}</span>
              </div>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-gray-800 mb-4">Delivery Information</h2>
              <div className="space-y-2 text-gray-600 text-sm">
                <p className="font-medium text-gray-800">{orderData.name}</p>
                {orderData.deliveryType === 'pickup' ? (
                  <p className="text-green-700 dark:text-green-400">
                    In-store pickup — Esena Pharmacy, Outering Rd, Ruaraka
                  </p>
                ) : (
                  <>
                    {orderData.address && <p>{orderData.address}</p>}
                    {(orderData.city || orderData.state) && (
                      <p>{[orderData.city, orderData.state].filter(Boolean).join(', ')}</p>
                    )}
                  </>
                )}
                <p className="mt-2"><span className="font-medium text-gray-700">Phone:</span> {orderData.phone}</p>
                <p><span className="font-medium text-gray-700">Email:</span> {orderData.email}</p>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-gray-800 mb-4">What's Next?</h2>
              <div className="space-y-3 text-gray-600 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Order Confirmed</p>
                    <p>Check your email for confirmation details</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Processing</p>
                    <p>We'll prepare your order for {orderData.deliveryType === 'pickup' ? 'pickup' : 'dispatch'}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-bold">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {orderData.deliveryType === 'pickup' ? 'Ready for Pickup' : 'Delivery'}
                    </p>
                    <p>
                      {orderData.deliveryType === 'pickup'
                        ? "We'll notify you when your order is ready"
                        : 'Delivered within 1–3 business days'}
                    </p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;
