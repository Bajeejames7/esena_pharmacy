/**
 * receiptGenerator.js
 * Generates a full HTML receipt for M-Pesa payments.
 * Used to attach the receipt as a downloadable HTML file in the payment confirmation email.
 */

const fs   = require('fs');
const path = require('path');

// Load logo as base64 data URI once at startup
let logoDataUri = '';
try {
  const logoPath = path.join(__dirname, '../../frontend/logo/logo.jpeg');
  const logoBuffer = fs.readFileSync(logoPath);
  logoDataUri = `data:image/jpeg;base64,${logoBuffer.toString('base64')}`;
} catch (_) {
  // Logo not found — receipt will render without it
}

/**
 * Generate an HTML receipt string
 * @param {object} order — order row from DB (includes customer_name, phone, email, delivery_address, total, shipping_cost, mpesa_receipt, created_at)
 * @param {Array}  items — order_items rows (name, quantity, price)
 * @returns {string} full HTML receipt
 */
const generateReceiptHTML = (order, items = []) => {
  const receipt  = order.mpesa_receipt || '—';
  const orderId  = order.id;
  const total    = parseFloat(order.total || 0);
  const shipping = parseFloat(order.shipping_cost || 0);
  const subtotal = items.length
    ? items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)
    : total - shipping;
  // Use actual M-Pesa transaction timestamp when available
  const paidAt = order.transaction_date || order.updated_at || order.created_at || new Date().toISOString();

  const paidAtStr = new Date(paidAt).toLocaleString('en-KE', {
    timeZone: 'Africa/Nairobi',
    dateStyle: 'long',
    timeStyle: 'short'
  });

  const itemRows = items.map(item => `
    <tr>
      <td>${item.name || 'Product'}</td>
      <td style="text-align:right">${item.quantity}</td>
      <td style="text-align:right">KSh ${parseFloat(item.price).toFixed(2)}</td>
      <td style="text-align:right">KSh ${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
    </tr>`).join('');

  const shippingRow = shipping > 0 ? `
    <tr>
      <td colspan="3" style="text-align:right;color:#555">Delivery</td>
      <td style="text-align:right">KSh ${shipping.toFixed(2)}</td>
    </tr>` : '';

  const deliveryLine = order.delivery_type === 'pickup'
    ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px"><span style="color:#555">Delivery</span><span>In-store Pickup</span></div>`
    : order.delivery_address
      ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px"><span style="color:#555">Address</span><span style="max-width:300px;text-align:right">${order.delivery_address}</span></div>`
      : '';

  const logoImg = logoDataUri
    ? `<img src="${logoDataUri}" alt="Esena Pharmacy" style="width:72px;height:72px;object-fit:contain;border-radius:6px">`
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt — Order #${orderId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:32px;max-width:620px;margin:0 auto}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{text-align:left;padding:7px 5px}
    th{border-bottom:2px solid #111;font-weight:bold}
    td{border-bottom:1px solid #eee}
    .total-row td{border-bottom:none;border-top:2px solid #111;font-weight:bold;font-size:14px;padding-top:9px}
  </style>
</head>
<body>
  <!-- Header -->
  <div style="display:flex;align-items:center;gap:18px;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:16px">
    ${logoImg}
    <div>
      <h1 style="font-size:20px;margin-bottom:3px">Esena Pharmacy</h1>
      <p style="font-size:11px;color:#555;margin-bottom:2px">Outering Road, Behind Eastmart Supermarket, Ruaraka, Nairobi</p>
      <p style="font-size:11px;color:#555;margin-bottom:2px">Tel: 0768103599 &nbsp;|&nbsp; esenapharmacy@gmail.com</p>
    </div>
  </div>

  <!-- Title -->
  <div style="text-align:center;margin-bottom:16px">
    <h2 style="font-size:15px;font-weight:bold;letter-spacing:.05em">PAYMENT RECEIPT</h2>
    <p style="font-size:11px;color:#555">${paidAtStr}</p>
  </div>

  <!-- Receipt badge -->
  <div style="background:#e6f9ee;border:1px solid #27ae60;border-radius:6px;padding:12px 16px;margin-bottom:16px">
    <div style="font-size:11px;color:#555">M-Pesa Receipt Number</div>
    <div style="font-size:20px;font-weight:bold;letter-spacing:.12em;color:#1a7a3a">${receipt}</div>
  </div>

  <!-- Order details -->
  <div style="margin-bottom:14px">
    <div style="font-weight:bold;font-size:11px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #ccc;padding-bottom:3px;margin-bottom:8px">Order Details</div>
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px"><span style="color:#555">Order #</span><span>${orderId}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px"><span style="color:#555">Customer</span><span>${order.customer_name}</span></div>
    <div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px"><span style="color:#555">Phone</span><span>${order.phone}</span></div>
    ${order.email ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px"><span style="color:#555">Email</span><span>${order.email}</span></div>` : ''}
    ${deliveryLine}
  </div>

  <!-- Items -->
  ${items.length > 0 ? `
  <div style="margin-bottom:14px">
    <div style="font-weight:bold;font-size:11px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #ccc;padding-bottom:3px;margin-bottom:8px">Items Purchased</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:right">Qty</th>
          <th style="text-align:right">Unit Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        ${shippingRow}
        <tr class="total-row">
          <td colspan="3" style="text-align:right">TOTAL PAID</td>
          <td style="text-align:right">KSh ${total.toFixed(2)}</td>
        </tr>
      </tbody>
    </table>
  </div>` : `
  <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:14px;margin-bottom:14px">
    <span>TOTAL PAID</span><span>KSh ${total.toFixed(2)}</span>
  </div>`}

  <!-- Footer -->
  <div style="text-align:center;margin-top:24px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:12px">
    <p>Payment received via M-Pesa. Thank you for shopping at Esena Pharmacy.</p>
    <p style="margin-top:4px">Your Trusted Healthcare Partner</p>
  </div>
</body>
</html>`;
};

module.exports = { generateReceiptHTML };
