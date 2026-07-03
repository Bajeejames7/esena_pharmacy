import React, { useRef } from 'react';

/**
 * PaymentReceipt
 * Renders a printable M-Pesa payment receipt.
 * Used from OrderSuccess (after payment) and TrackOrder (for paid orders).
 *
 * Props:
 *   order  — object with id, customer_name, phone, email, delivery_address,
 *             total, mpesa_receipt (or mpesaReceipt), items[], created_at
 */
const PaymentReceipt = ({ order }) => {
  const printRef = useRef(null);

  const receipt     = order.mpesa_receipt || order.mpesaReceipt || '—';
  const items       = order.items || [];
  const total       = parseFloat(order.total || 0);
  const shipping    = parseFloat(order.shipping_cost || order.shipping || 0);
  const subtotal    = items.length
    ? items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)
    : total - shipping;
  const paidAt      = order.updated_at || order.created_at || new Date().toISOString();

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;

    const win = window.open('', '_blank', 'width=600,height=800');
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt — Order #${order.id}</title>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 32px; }
          .header { text-align: center; border-bottom: 2px solid #111; padding-bottom: 16px; margin-bottom: 16px; }
          .header h1 { font-size: 20px; margin-bottom: 4px; }
          .header p  { font-size: 11px; color: #555; }
          .section   { margin-bottom: 14px; }
          .section-title { font-weight: bold; font-size: 12px; text-transform: uppercase;
                           letter-spacing: 0.05em; border-bottom: 1px solid #ccc;
                           padding-bottom: 4px; margin-bottom: 8px; }
          .row  { display: flex; justify-content: space-between; margin-bottom: 4px; }
          .row .label { color: #555; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 6px 4px; font-size: 12px; }
          th { border-bottom: 2px solid #111; font-weight: bold; }
          td { border-bottom: 1px solid #eee; }
          td.right, th.right { text-align: right; }
          .total-row td { border-bottom: none; border-top: 2px solid #111;
                          font-weight: bold; font-size: 14px; padding-top: 8px; }
          .receipt-badge { background: #e6f9ee; border: 1px solid #27ae60;
                           border-radius: 6px; padding: 10px 14px; margin-bottom: 16px; }
          .receipt-badge .label { font-size: 11px; color: #555; }
          .receipt-badge .value { font-size: 18px; font-weight: bold;
                                  letter-spacing: 0.1em; color: #1a7a3a; }
          .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #888;
                    border-top: 1px solid #eee; padding-top: 12px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>${content}</body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  return (
    <div>
      {/* Trigger button */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print Receipt
      </button>

      {/* Hidden printable content */}
      <div ref={printRef} style={{ display: 'none' }}>
        <div className="header">
          <h1>Esena Pharmacy</h1>
          <p>Outering Road, Behind Eastmart Supermarket, Ruaraka, Nairobi</p>
          <p>Tel: 0768103599 &nbsp;|&nbsp; esenapharmacy@gmail.com</p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 15, fontWeight: 'bold' }}>PAYMENT RECEIPT</p>
          <p style={{ fontSize: 11, color: '#555' }}>
            {new Date(paidAt).toLocaleString('en-KE', {
              dateStyle: 'long', timeStyle: 'short'
            })}
          </p>
        </div>

        {/* M-Pesa receipt number */}
        <div className="receipt-badge">
          <div className="label">M-Pesa Receipt Number</div>
          <div className="value">{receipt}</div>
        </div>

        {/* Customer info */}
        <div className="section">
          <div className="section-title">Customer Details</div>
          <div className="row"><span className="label">Name</span><span>{order.customer_name || order.name}</span></div>
          <div className="row"><span className="label">Phone</span><span>{order.phone}</span></div>
          {order.email && <div className="row"><span className="label">Email</span><span>{order.email}</span></div>}
          <div className="row"><span className="label">Order #</span><span>{order.id}</span></div>
          {order.delivery_type === 'pickup'
            ? <div className="row"><span className="label">Delivery</span><span>In-store Pickup</span></div>
            : order.delivery_address && <div className="row"><span className="label">Address</span><span>{order.delivery_address}</span></div>
          }
        </div>

        {/* Items */}
        {items.length > 0 && (
          <div className="section">
            <div className="section-title">Items</div>
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th className="right">Qty</th>
                  <th className="right">Price</th>
                  <th className="right">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i}>
                    <td>{item.name || 'Product'}</td>
                    <td className="right">{item.quantity}</td>
                    <td className="right">KSh {parseFloat(item.price).toFixed(2)}</td>
                    <td className="right">KSh {(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                  </tr>
                ))}
                {shipping > 0 && (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'right', color: '#555' }}>Delivery</td>
                    <td className="right">KSh {shipping.toFixed(2)}</td>
                  </tr>
                )}
                <tr className="total-row">
                  <td colSpan={3} style={{ textAlign: 'right' }}>TOTAL PAID</td>
                  <td className="right">KSh {total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {items.length === 0 && (
          <div className="section">
            <div className="row" style={{ fontWeight: 'bold', fontSize: 14 }}>
              <span>TOTAL PAID</span>
              <span>KSh {total.toFixed(2)}</span>
            </div>
          </div>
        )}

        <div className="footer">
          <p>Payment received via M-Pesa. Thank you for shopping at Esena Pharmacy.</p>
          <p style={{ marginTop: 4 }}>Your Trusted Healthcare Partner</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentReceipt;
