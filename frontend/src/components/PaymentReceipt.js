import React, { useRef } from 'react';
import logoDataUri from '../utils/logoBase64';

/**
 * PaymentReceipt
 *
 * Renders a printable / downloadable M-Pesa payment receipt.
 * - Print: opens browser print dialog
 * - Download: saves as HTML file (opens as formatted page, can save as PDF via browser)
 *
 * Props:
 *   order — { id, customer_name, phone, email, delivery_address, delivery_type,
 *             total, shipping_cost, mpesa_receipt (or mpesaReceipt),
 *             items[], created_at, updated_at }
 */
const PaymentReceipt = ({ order }) => {
  const printRef = useRef(null);

  const receipt  = order.mpesa_receipt || order.mpesaReceipt || '—';
  const orderId  = order.id;
  const items    = order.items || [];
  const total    = parseFloat(order.total || 0);
  const shipping = parseFloat(order.shipping_cost || order.shipping || 0);
  const subtotal = items.length
    ? items.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0)
    : total - shipping;

  // Use the actual M-Pesa transaction timestamp (when Safaricom processed the payment)
  // Falls back to updated_at, then created_at, then now
  const paidAt = order.transaction_date || order.updated_at || order.created_at || new Date().toISOString();

  // Shared HTML for both print and download
  const buildReceiptHTML = (autoPrint = false) => {
    const itemRows = items.map(item => `
      <tr>
        <td>${item.name || 'Product'}</td>
        <td class="right">${item.quantity}</td>
        <td class="right">KSh ${parseFloat(item.price).toFixed(2)}</td>
        <td class="right">KSh ${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
      </tr>`).join('');

    const shippingRow = shipping > 0 ? `
      <tr>
        <td colspan="3" class="right muted">Delivery</td>
        <td class="right">KSh ${shipping.toFixed(2)}</td>
      </tr>` : '';

    const totalRow = `
      <tr class="total-row">
        <td colspan="3" class="right">TOTAL PAID</td>
        <td class="right">KSh ${total.toFixed(2)}</td>
      </tr>`;

    const deliveryLine = order.delivery_type === 'pickup'
      ? '<div class="row"><span class="lbl">Delivery</span><span>In-store Pickup</span></div>'
      : order.delivery_address
        ? `<div class="row"><span class="lbl">Address</span><span>${order.delivery_address}</span></div>`
        : '';

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Receipt — Order #${orderId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:32px;max-width:620px;margin:0 auto}
    .header{display:flex;align-items:center;gap:20px;border-bottom:2px solid #111;padding-bottom:16px;margin-bottom:16px}
    .header img{width:72px;height:72px;object-fit:contain;border-radius:6px}
    .header-text h1{font-size:20px;margin-bottom:3px}
    .header-text p{font-size:11px;color:#555;margin-bottom:2px}
    .title{text-align:center;margin-bottom:16px}
    .title h2{font-size:15px;font-weight:bold;letter-spacing:.05em}
    .title p{font-size:11px;color:#555}
    .badge{background:#e6f9ee;border:1px solid #27ae60;border-radius:6px;padding:12px 16px;margin-bottom:16px}
    .badge .lbl{font-size:11px;color:#555}
    .badge .val{font-size:20px;font-weight:bold;letter-spacing:.12em;color:#1a7a3a}
    .section{margin-bottom:14px}
    .section-title{font-weight:bold;font-size:11px;text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid #ccc;padding-bottom:3px;margin-bottom:8px}
    .row{display:flex;justify-content:space-between;margin-bottom:4px;font-size:12px}
    .lbl{color:#555}
    .right{text-align:right}
    .muted{color:#555}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th,td{text-align:left;padding:6px 4px}
    th{border-bottom:2px solid #111;font-weight:bold}
    td{border-bottom:1px solid #eee}
    .total-row td{border-bottom:none;border-top:2px solid #111;font-weight:bold;font-size:14px;padding-top:8px}
    .footer{text-align:center;margin-top:24px;font-size:11px;color:#888;border-top:1px solid #eee;padding-top:12px}
    @page{size:A4;margin:20mm}
    @media print{
      button{display:none}
      body{padding:0;max-width:100%}
      .badge{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    }
  </style>
</head>
<body>
  <div class="header">
    <img src="${logoDataUri}" alt="Esena Pharmacy Logo">
    <div class="header-text">
      <h1>Esena Pharmacy</h1>
      <p>Outering Road, Behind Eastmart Supermarket</p>
      <p>Ruaraka, Nairobi</p>
      <p>Tel: 0768103599 &nbsp;|&nbsp; esenapharmacy@gmail.com</p>
    </div>
  </div>

  <div class="title">
    <h2>PAYMENT RECEIPT</h2>
    <p>${new Date(paidAt).toLocaleString('en-KE', { dateStyle: 'long', timeStyle: 'short' })}</p>
  </div>

  <div class="badge">
    <div class="lbl">M-Pesa Receipt Number</div>
    <div class="val">${receipt}</div>
  </div>

  <div class="section">
    <div class="section-title">Order Details</div>
    <div class="row"><span class="lbl">Order #</span><span>${orderId}</span></div>
    <div class="row"><span class="lbl">Customer</span><span>${order.customer_name || order.name || '—'}</span></div>
    <div class="row"><span class="lbl">Phone</span><span>${order.phone || '—'}</span></div>
    ${order.email ? `<div class="row"><span class="lbl">Email</span><span>${order.email}</span></div>` : ''}
    ${deliveryLine}
  </div>

  ${items.length > 0 ? `
  <div class="section">
    <div class="section-title">Items Purchased</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th class="right">Qty</th>
          <th class="right">Unit Price</th>
          <th class="right">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
        ${shippingRow}
        ${totalRow}
      </tbody>
    </table>
  </div>` : `
  <div class="section">
    <div class="row" style="font-weight:bold;font-size:14px">
      <span>TOTAL PAID</span><span>KSh ${total.toFixed(2)}</span>
    </div>
  </div>`}

  <div class="footer">
    <p>Payment received via M-Pesa. Thank you for shopping at Esena Pharmacy.</p>
    <p style="margin-top:4px">Your Trusted Healthcare Partner</p>
  </div>
  ${autoPrint ? '' : `
  <div style="text-align:center;margin-top:20px">
    <p style="font-size:12px;color:#555;margin-bottom:8px">To save as PDF: Click <strong>Print</strong> below, then choose <strong>Save as PDF</strong> as the destination.</p>
    <button onclick="window.print()" style="background:#27ae60;color:white;border:none;padding:10px 28px;border-radius:6px;font-size:14px;font-weight:bold;cursor:pointer">Print / Save as PDF</button>
  </div>`}
</body>
</html>`;
  };

  // Both print and download use the same print window — browser handles PDF saving
  const openPrintWindow = (autoPrint = false) => {
    const html = buildReceiptHTML(autoPrint);
    const win = window.open('', '_blank', 'width=700,height=950');
    if (!win) {
      alert('Please allow popups to print/download the receipt.');
      return;
    }
    win.document.write(html);
    win.document.close();
    win.focus();
    if (autoPrint) {
      // Slight delay lets the logo image load before printing
      setTimeout(() => { win.print(); }, 600);
    }
  };

  const handlePrint = () => openPrintWindow(true);

  // "Download as PDF" — opens receipt in a new tab with a print dialog
  // User clicks "Save as PDF" in the print dialog (works in all modern browsers)
  const handleDownload = () => openPrintWindow(false);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Print */}
      <button
        onClick={handlePrint}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Print receipt"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        Print
      </button>

      {/* Download / Save as PDF */}
      <button
        onClick={handleDownload}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        title="Opens receipt in a new tab — choose 'Save as PDF' in the print dialog"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Save as PDF
      </button>
    </div>
  );
};

export default PaymentReceipt;
