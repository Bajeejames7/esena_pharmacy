import React, { useState, useEffect, useCallback } from 'react';
import { mpesaAPI } from '../services/api';

/**
 * M-Pesa STK Push Payment Modal
 * 
 * Shows when user selects M-Pesa and submits order.
 * Triggers STK Push, then polls for payment result.
 */
const MpesaPaymentModal = ({ orderId, orderToken, amount, defaultPhone, onSuccess, onClose }) => {
  const [step, setStep] = useState('enter_phone'); // 'enter_phone' | 'waiting' | 'success' | 'failed'
  const [phone, setPhone] = useState(defaultPhone || '');
  const [error, setError] = useState('');
  const [, setCheckoutRequestId] = useState(null);
  const [countdown, setCountdown] = useState(120); // 2 minutes
  const [mpesaReceipt, setMpesaReceipt] = useState('');
  const [pollIntervalRef] = useState({ current: null });
  const [countdownIntervalRef] = useState({ current: null });

  // Validate required props on mount
  useEffect(() => {
    if (!orderId || !amount) {
      setError('System error: Missing payment information. Please contact support.');
      setStep('failed');
    }
  }, [orderId, amount]);

  // Cleanup intervals on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [pollIntervalRef, countdownIntervalRef]);

  // Poll payment status from backend
  const startPolling = useCallback((reqId) => {
    // Start countdown timer
    countdownIntervalRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    // Poll every 3 seconds for up to 2 minutes
    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await mpesaAPI.checkStatus(reqId);
        const { status, mpesaReceipt: receipt } = response.data.payment;

        if (status === 'success') {
          clearInterval(pollIntervalRef.current);
          clearInterval(countdownIntervalRef.current);
          setMpesaReceipt(receipt || '');
          setStep('success');
          if (onSuccess) onSuccess({ orderId, orderToken, receipt });
        } else if (status === 'failed' || status === 'cancelled') {
          clearInterval(pollIntervalRef.current);
          clearInterval(countdownIntervalRef.current);
          setError(status === 'cancelled'
            ? 'Payment was cancelled. You can try again.'
            : 'Payment failed. Please try again or use a different payment method.'
          );
          setStep('failed');
        }
      } catch (err) {
        // Network error during polling — don't cancel, just wait
        console.error('Status poll error:', err);
      }
    }, 3000);

    // Auto-stop polling after 2 minutes
    setTimeout(() => {
      clearInterval(pollIntervalRef.current);
      clearInterval(countdownIntervalRef.current);
      setStep(prev => {
        if (prev === 'waiting') {
          setError('Payment timed out. If you completed the payment, it will still be processed. Otherwise, please try again.');
          return 'failed';
        }
        return prev;
      });
    }, 120000);
  }, [orderId, orderToken, onSuccess, pollIntervalRef, countdownIntervalRef]);

  const handleSendSTK = async () => {
    setError('');

    // Basic phone validation
    const cleanPhone = phone.replace(/\s/g, '');
    if (!cleanPhone) {
      setError('Please enter your M-Pesa phone number');
      return;
    }

    try {
      const response = await mpesaAPI.initiateSTKPush({
        orderId,
        phoneNumber: cleanPhone,
        amount
      });

      const { checkoutRequestId: reqId } = response.data;
      setCheckoutRequestId(reqId);
      setStep('waiting');
      startPolling(reqId);

    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send payment request. Please try again.';
      setError(msg);
    }
  };

  const handleRetry = () => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setCheckoutRequestId(null);
    setCountdown(120);
    setError('');
    setStep('enter_phone');
  };

  // Format countdown as mm:ss
  const formatCountdown = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mpesa-modal-title"
    >
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Close button — only available before payment starts or after final result */}
        {(step === 'enter_phone' || step === 'success' || step === 'failed') && step !== 'waiting' && (
          <button
            onClick={onClose}
            aria-label="Close M-Pesa payment dialog"
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-2xl leading-none"
          >
            &times;
          </button>
        )}

        {/* ── STEP 1: Enter Phone ───────────────────────── */}
        {step === 'enter_phone' && (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <svg className="w-6 h-6 text-green-700 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2
                  id="mpesa-modal-title"
                  className="text-xl font-bold text-gray-800 dark:text-white"
                >
                  Pay with M-Pesa
                </h2>
                <p className="text-sm text-gray-500">Till Number: 3611027</p>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
              <p className="text-sm text-green-800 dark:text-green-300">
                You will receive an STK Push prompt on your phone. Enter your M-Pesa PIN to complete payment.
              </p>
            </div>

            <div className="mb-4">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Amount to Pay
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                KSh {parseFloat(amount).toFixed(2)}
              </p>
            </div>

            <div className="mb-6">
              <label
                htmlFor="mpesa-phone"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                M-Pesa Phone Number
              </label>
              <input
                id="mpesa-phone"
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendSTK()}
                placeholder="e.g. 0712345678"
                autoFocus
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-describedby={error ? 'mpesa-error' : undefined}
              />
              {error && (
                <p id="mpesa-error" className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                  {error}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">Format: 07XX XXX XXX or 254XX XXX XXXX</p>
            </div>

            <button
              onClick={handleSendSTK}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              Send Payment Request
            </button>
          </div>
        )}

        {/* ── STEP 2: Waiting for Payment ───────────────── */}
        {step === 'waiting' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>

            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
              Waiting for Payment…
            </h2>

            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Check your phone <span className="font-semibold text-green-700 dark:text-green-400">{phone}</span> and enter your M-Pesa PIN.
            </p>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-3 mb-6">
              <p className="text-sm text-amber-800 dark:text-amber-300">
                Expires in{' '}
                <span className={`font-bold ${countdown <= 30 ? 'text-red-600' : 'text-amber-700 dark:text-amber-300'}`}>
                  {formatCountdown(countdown)}
                </span>
              </p>
            </div>

            <p className="text-xs text-gray-500 mb-6">
              Do not close this window. Payment is being confirmed automatically.
            </p>

            <button
              onClick={handleRetry}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 underline"
            >
              Wrong phone number? Start over
            </button>
          </div>
        )}

        {/* ── STEP 3: Success ────────────────────────────── */}
        {step === 'success' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
              Payment Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Your order has been paid and confirmed.
            </p>

            {mpesaReceipt && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">M-Pesa Receipt Number</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300 tracking-wider">
                  {mpesaReceipt}
                </p>
                <p className="text-xs text-gray-500 mt-1">Keep this for your records</p>
              </div>
            )}

            <button
              onClick={() => onSuccess({ orderId, orderToken, receipt: mpesaReceipt })}
              className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Track My Order
            </button>
          </div>
        )}

        {/* ── STEP 4: Failed ─────────────────────────────── */}
        {step === 'failed' && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
              <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">
              Payment Unsuccessful
            </h2>

            {error && (
              <p className="text-gray-600 dark:text-gray-300 mb-6 text-sm" role="alert">
                {error}
              </p>
            )}

            <div className="space-y-3">
              <button
                onClick={handleRetry}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Try Again
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Pay Later / Track My Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MpesaPaymentModal;
