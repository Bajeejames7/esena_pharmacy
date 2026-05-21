import React, { useState, useEffect, useCallback } from 'react';
import { useBreakpoint } from '../utils/responsive';
import AdminSidebar from '../components/AdminSidebar';
import AdminHeader from '../components/AdminHeader';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/forms/GlassButton';
import ThemeToggle from '../components/ThemeToggle';
import { reportsAPI } from '../services/api';

const PERIODS = [
  { value: 'today',      label: 'Today' },
  { value: 'week',       label: 'Last 7 days' },
  { value: 'last_week',  label: 'Previous week' },
  { value: 'month',      label: 'Last 30 days' },
  { value: 'last_month', label: 'Previous month' },
  { value: 'year',       label: 'Last 365 days' },
  { value: 'custom',     label: 'Custom range' },
];

const fmt = (n) =>
  `KSh ${parseFloat(n || 0).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const num = (n) => parseInt(n || 0).toLocaleString();

// ── Stat card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'blue' }) => {
  const colors = {
    blue:   'from-blue-500/20 to-blue-600/10 border-blue-200 dark:border-blue-800/40',
    green:  'from-green-500/20 to-green-600/10 border-green-200 dark:border-green-800/40',
    purple: 'from-purple-500/20 to-purple-600/10 border-purple-200 dark:border-purple-800/40',
    orange: 'from-orange-500/20 to-orange-600/10 border-orange-200 dark:border-orange-800/40',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[color]} border rounded-xl p-4`}>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className="text-xl font-bold text-gray-800 dark:text-gray-100">{value}</p>
      {sub && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{sub}</p>}
    </div>
  );
};

// ── Nice Y-axis ticks ────────────────────────────────────────────────────────
function niceYTicks(max, count = 4) {
  if (max === 0) return [0, 1];
  const raw = max / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const nice = Math.ceil(raw / mag) * mag;
  return Array.from({ length: count + 1 }, (_, i) => i * nice);
}

// ── SVG Revenue Chart ────────────────────────────────────────────────────────
const RevenueChart = ({ data }) => {
  const [tooltip, setTooltip] = useState(null);

  const W = 600, H = 220;
  const PAD = { top: 16, right: 16, bottom: 52, left: 72 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxRev = Math.max(...data.map(d => parseFloat(d.revenue)), 0);
  const ticks = niceYTicks(maxRev, 4);
  const yMax = ticks[ticks.length - 1] || 1;

  const xStep = chartW / Math.max(data.length, 1);
  const barW = Math.max(4, Math.min(36, xStep - 6));

  const xPos = (i) => PAD.left + i * xStep + xStep / 2;
  const yPos = (v) => PAD.top + chartH - (parseFloat(v) / yMax) * chartH;
  const barH = (v) => Math.max(2, (parseFloat(v) / yMax) * chartH);

  const labelEvery = data.length <= 7 ? 1 : data.length <= 14 ? 2 : data.length <= 31 ? 4 : 7;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ minWidth: Math.max(320, data.length * 18) }}
        onMouseLeave={() => setTooltip(null)}
      >
        {ticks.map((t, i) => {
          const y = yPos(t);
          return (
            <g key={i}>
              <line x1={PAD.left} y1={y} x2={W - PAD.right} y2={y}
                stroke="currentColor" strokeOpacity="0.08" strokeWidth="1" strokeDasharray="4 3" />
              <text x={PAD.left - 8} y={y + 4} textAnchor="end" fill="#9ca3af" style={{ fontSize: 10 }}>
                {t >= 1000000
                  ? `${(t / 1000000).toFixed(t % 1000000 === 0 ? 0 : 1)}M`
                  : t >= 1000
                  ? `${(t / 1000).toFixed(t % 1000 === 0 ? 0 : 1)}k`
                  : t}
              </text>
            </g>
          );
        })}

        {data.map((d, i) => {
          const cx = xPos(i);
          const bx = cx - barW / 2;
          const h = barH(d.revenue);
          const y = yPos(d.revenue);
          const hovered = tooltip?.i === i;
          return (
            <g key={i} onMouseEnter={() => setTooltip({ i, d, cx })} style={{ cursor: 'default' }}>
              <rect x={PAD.left + i * xStep} y={PAD.top} width={xStep} height={chartH} fill="transparent" />
              <rect x={bx} y={y} width={barW} height={h} rx="3"
                fill={hovered ? '#2563eb' : '#60a5fa'} fillOpacity={hovered ? 1 : 0.75} />
              {hovered && (
                <text x={cx} y={y - 6} textAnchor="middle" fill="#2563eb" style={{ fontSize: 10, fontWeight: 600 }}>
                  {parseFloat(d.revenue) >= 1000000
                    ? `${(parseFloat(d.revenue) / 1000000).toFixed(1)}M`
                    : parseFloat(d.revenue) >= 1000
                    ? `${(parseFloat(d.revenue) / 1000).toFixed(1)}k`
                    : parseFloat(d.revenue).toFixed(0)}
                </text>
              )}
            </g>
          );
        })}

        <line x1={PAD.left} y1={PAD.top + chartH} x2={W - PAD.right} y2={PAD.top + chartH}
          stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />

        {data.map((d, i) => {
          if (i % labelEvery !== 0) return null;
          const label = new Date(d.date + 'T00:00:00').toLocaleDateString('en-KE', { month: 'short', day: 'numeric' });
          return (
            <text key={i} x={xPos(i)} y={H - PAD.bottom + 18} textAnchor="middle" fill="#9ca3af" style={{ fontSize: 10 }}>
              {label}
            </text>
          );
        })}
      </svg>

      {tooltip && (
        <div
          className="absolute pointer-events-none z-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl"
          style={{ left: `clamp(60px, ${(tooltip.cx / W) * 100}%, calc(100% - 120px))`, top: '4px', transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}
        >
          <p className="font-semibold mb-0.5">
            {new Date(tooltip.d.date + 'T00:00:00').toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
          <p className="text-green-300">{fmt(tooltip.d.revenue)}</p>
          <p className="text-gray-400">{tooltip.d.orders} order{tooltip.d.orders !== 1 ? 's' : ''}</p>
        </div>
      )}
    </div>
  );
};

// ── Main page ────────────────────────────────────────────────────────────────
const SalesReport = () => {
  const { breakpoint } = useBreakpoint();
  const isMobile = breakpoint === 'mobile';
  const isTablet = breakpoint === 'tablet';
  const shouldShowMenuButton = isMobile || isTablet;
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const [period, setPeriod] = useState('month');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllProducts, setShowAllProducts] = useState(false);

  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  const load = useCallback(async () => {
    if (period === 'custom' && (!dateFrom || !dateTo)) return;
    setLoading(true);
    setError(null);
    try {
      const res = await reportsAPI.getSales({
        period,
        date_from: period === 'custom' ? dateFrom : undefined,
        date_to:   period === 'custom' ? dateTo   : undefined,
      });
      setData(res.data);
      setShowAllProducts(false);
    } catch {
      setError('Failed to load report. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [period, dateFrom, dateTo]);

  useEffect(() => {
    if (period !== 'custom') load();
  }, [period, load]);

  const handlePrint = () => {
    if (!data) return;

    const periodLabel = PERIODS.find(p => p.value === period)?.label || period;
    const generated = new Date().toLocaleString('en-KE', { dateStyle: 'full', timeStyle: 'short' });

    const topProductsRows = (data.top_products || []).map((p, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${p.product_name}</td>
        <td style="text-transform:capitalize">${p.category}</td>
        <td class="num">${num(p.units_sold)}</td>
        <td class="num">${fmt(p.revenue)}</td>
        <td class="num">${p.order_count}</td>
      </tr>`).join('');

    const totalCatRev = (data.by_category || []).reduce((s, c) => s + parseFloat(c.revenue), 0);
    const categoryRows = (data.by_category || []).map(c => {
      const pct = totalCatRev > 0 ? Math.round((parseFloat(c.revenue) / totalCatRev) * 100) : 0;
      return `<tr>
        <td style="text-transform:capitalize">${c.category}</td>
        <td class="num">${num(c.units_sold)}</td>
        <td class="num">${fmt(c.revenue)}</td>
        <td class="num">${pct}%</td>
      </tr>`;
    }).join('');

    const statusRows = (data.status_breakdown || []).map(s => `
      <tr>
        <td style="text-transform:capitalize">${(s.status || '').replace(/_/g, ' ')}</td>
        <td class="num">${num(s.count)}</td>
        <td class="num">${fmt(s.revenue)}</td>
      </tr>`).join('');

    const dailyRows = (data.daily_revenue || []).map(d => `
      <tr>
        <td>${new Date(d.date + 'T00:00:00').toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</td>
        <td class="num">${d.orders}</td>
        <td class="num">${fmt(d.revenue)}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Sales Report — ${periodLabel}</title>
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: white; }

    .header { border-bottom: 2px solid #1d4ed8; padding-bottom: 10px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
    .header .brand { font-size: 18px; font-weight: bold; color: #1d4ed8; }
    .header .report-title { font-size: 13px; font-weight: bold; margin-top: 3px; }
    .header .sub { font-size: 10px; color: #6b7280; margin-top: 2px; }
    .header .meta { text-align: right; font-size: 10px; color: #6b7280; }

    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 18px; }
    .summary-box { border: 1px solid #d1d5db; border-radius: 4px; padding: 10px; text-align: center; }
    .summary-box .label { font-size: 9px; color: #6b7280; margin-bottom: 3px; }
    .summary-box .value { font-size: 14px; font-weight: bold; color: #111; }

    .section-title { font-size: 12px; font-weight: bold; color: #1d4ed8; margin: 16px 0 6px; border-left: 3px solid #1d4ed8; padding-left: 6px; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 4px; page-break-inside: avoid; }
    th { background: #1d4ed8; color: white; padding: 6px 8px; text-align: left; font-size: 10px; }
    td { padding: 5px 8px; border-bottom: 1px solid #e5e7eb; font-size: 10px; }
    tr:nth-child(even) td { background: #f9fafb; }
    .num { text-align: right; }

    .footer { margin-top: 24px; border-top: 1px solid #e5e7eb; padding-top: 8px; font-size: 9px; color: #9ca3af; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Esena Pharmacy</div>
      <div class="report-title">Sales Report — ${periodLabel}</div>
      <div class="sub">Completed orders only</div>
    </div>
    <div class="meta">
      <div>Generated: ${generated}</div>
    </div>
  </div>

  <div class="section-title">Summary</div>
  <div class="summary-grid">
    <div class="summary-box"><div class="label">Total Revenue</div><div class="value">${fmt(data.summary.total_revenue)}</div></div>
    <div class="summary-box"><div class="label">Units Sold</div><div class="value">${num(data.summary.total_units_sold)}</div></div>
    <div class="summary-box"><div class="label">Avg Order Value</div><div class="value">${fmt(data.summary.avg_order_value)}</div></div>
    <div class="summary-box"><div class="label">Delivery Fees</div><div class="value">${fmt(data.summary.total_shipping)}</div></div>
  </div>

  ${topProductsRows ? `
  <div class="section-title">Top Selling Products</div>
  <table>
    <thead><tr><th>#</th><th>Product</th><th>Category</th><th class="num">Units</th><th class="num">Revenue</th><th class="num">Orders</th></tr></thead>
    <tbody>${topProductsRows}</tbody>
  </table>` : ''}

  ${categoryRows ? `
  <div class="section-title">Revenue by Category</div>
  <table>
    <thead><tr><th>Category</th><th class="num">Units</th><th class="num">Revenue</th><th class="num">Share</th></tr></thead>
    <tbody>${categoryRows}</tbody>
  </table>` : ''}

  ${statusRows ? `
  <div class="section-title">All Orders by Status</div>
  <table>
    <thead><tr><th>Status</th><th class="num">Orders</th><th class="num">Revenue</th></tr></thead>
    <tbody>${statusRows}</tbody>
  </table>` : ''}

  ${dailyRows ? `
  <div class="section-title">Daily Revenue Breakdown</div>
  <table>
    <thead><tr><th>Date</th><th class="num">Orders</th><th class="num">Revenue</th></tr></thead>
    <tbody>${dailyRows}</tbody>
  </table>` : ''}

  <div class="footer">
    Esena Pharmacy &nbsp;·&nbsp; Outering Road, Behind Eastmart Supermarket, Ruaraka, Nairobi &nbsp;·&nbsp; esenapharmacy@gmail.com
  </div>
</body>
</html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 400);
  };

  const periodLabel = PERIODS.find(p => p.value === period)?.label || period;

  const statusColors = {
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300',
    paid: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300',
    dispatched: 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300',
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300',
    payment_requested: 'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-glass-blue/20 via-glass-green/20 to-glass-white dark:from-slate-900/50 dark:via-slate-800/50 dark:to-slate-900 flex flex-col">
      <AdminHeader onMenuToggle={() => setSidebarOpen(true)} showMenuButton={shouldShowMenuButton} />
      <div className="flex flex-1">
        <AdminSidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex-1 transition-all duration-300 ${!shouldShowMenuButton && sidebarOpen ? 'ml-64' : !shouldShowMenuButton ? 'ml-16' : ''}`}>
          <div className="p-4 sm:p-6">

            {/* Page header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Sales Report</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {data ? `${periodLabel} · completed orders only` : 'Select a period to view sales data'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden lg:block"><ThemeToggle showLabel={true} /></div>
                {data && (
                  <GlassButton size="sm" variant="secondary" onClick={handlePrint}>
                    <svg className="w-4 h-4 mr-1.5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print / PDF
                  </GlassButton>
                )}
              </div>
            </div>

            {/* Period filters */}
            <GlassCard className="p-4 mb-6">
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex flex-wrap gap-1">
                  {PERIODS.map(p => (
                    <button key={p.value} onClick={() => setPeriod(p.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${period === p.value ? 'bg-glass-blue text-white' : 'bg-white/20 dark:bg-slate-700/40 text-gray-700 dark:text-gray-300 hover:bg-white/30'}`}>
                      {p.label}
                    </button>
                  ))}
                </div>

                {period === 'custom' && (
                  <div className="flex flex-wrap gap-2 items-end ml-2">
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                      <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-white/30 dark:border-slate-600/30 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-glass-blue/50" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                      <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                        className="px-3 py-2 rounded-lg bg-white/70 dark:bg-slate-800/70 border border-white/30 dark:border-slate-600/30 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-glass-blue/50" />
                    </div>
                    <GlassButton size="sm" onClick={load} disabled={!dateFrom || !dateTo || loading}>
                      {loading ? 'Loading...' : 'Apply'}
                    </GlassButton>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Loading */}
            {loading && (
              <GlassCard className="p-12 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading report...</p>
              </GlassCard>
            )}

            {/* Error */}
            {!loading && error && (
              <GlassCard className="p-8 text-center">
                <p className="text-red-600 dark:text-red-400 mb-3">{error}</p>
                <GlassButton onClick={load}>Retry</GlassButton>
              </GlassCard>
            )}

            {/* Report */}
            {!loading && !error && data && (
              <div className="space-y-6">

                {/* Summary cards — completed orders only */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <StatCard
                    label="Total Revenue"
                    value={fmt(data.summary.total_revenue)}
                    sub={`${num(data.summary.total_orders)} completed orders`}
                    color="green"
                  />
                  <StatCard
                    label="Units Sold"
                    value={num(data.summary.total_units_sold)}
                    sub="from completed orders"
                    color="blue"
                  />
                  <StatCard
                    label="Avg Order Value"
                    value={fmt(data.summary.avg_order_value)}
                    sub="per completed order"
                    color="purple"
                  />
                  <StatCard
                    label="Delivery Fees Collected"
                    value={fmt(data.summary.total_shipping)}
                    sub={`Products: ${fmt(data.summary.total_subtotal)}`}
                    color="orange"
                  />
                </div>

                {/* Revenue chart */}
                {data.daily_revenue?.length > 0 && (
                  <GlassCard className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="font-semibold text-gray-800 dark:text-gray-100">Revenue Over Time</h2>
                      <span className="text-xs text-gray-400 dark:text-gray-500">
                        {data.daily_revenue.length} day{data.daily_revenue.length !== 1 ? 's' : ''} · hover bars for details
                      </span>
                    </div>
                    <RevenueChart data={data.daily_revenue} />
                  </GlassCard>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Top selling products */}
                  <GlassCard className="p-5">
                    <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Top Selling Products</h2>
                    {data.top_products?.length === 0 ? (
                      <p className="text-gray-500 dark:text-gray-400 text-sm">No completed sales in this period.</p>
                    ) : (
                      <>
                        <div className="space-y-2">
                          {(showAllProducts ? data.top_products : data.top_products.slice(0, 10)).map((p, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
                              <span className="text-xs font-bold text-gray-400 dark:text-gray-500 w-5 text-right flex-shrink-0">#{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{p.product_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{p.category} · {p.order_count} order{p.order_count !== 1 ? 's' : ''}</p>
                              </div>
                              <div className="text-right flex-shrink-0">
                                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{num(p.units_sold)} units</p>
                                <p className="text-xs text-green-600 dark:text-green-400">{fmt(p.revenue)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                        {data.top_products.length > 10 && (
                          <button
                            onClick={() => setShowAllProducts(v => !v)}
                            className="mt-3 w-full text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 py-1.5 border border-blue-200 dark:border-blue-800/40 rounded-lg transition-colors"
                          >
                            {showAllProducts
                              ? 'Show top 10 only'
                              : `Show all ${data.top_products.length} products`}
                          </button>
                        )}
                      </>
                    )}
                  </GlassCard>

                  <div className="space-y-6">

                    {/* Revenue by category */}
                    <GlassCard className="p-5">
                      <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Revenue by Category</h2>
                      {data.by_category?.length === 0 ? (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No data.</p>
                      ) : (
                        <div className="space-y-3">
                          {data.by_category.map((c, i) => {
                            const totalRev = data.by_category.reduce((s, x) => s + parseFloat(x.revenue), 0);
                            const pct = totalRev > 0 ? Math.round((parseFloat(c.revenue) / totalRev) * 100) : 0;
                            return (
                              <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-gray-700 dark:text-gray-300 capitalize">{c.category}</span>
                                  <span className="text-gray-800 dark:text-gray-100 font-medium">
                                    {fmt(c.revenue)} <span className="text-xs text-gray-400">({pct}%)</span>
                                  </span>
                                </div>
                                <div className="h-2 bg-white/20 dark:bg-slate-700/40 rounded-full overflow-hidden">
                                  <div className="h-full bg-glass-blue/70 dark:bg-blue-500/60 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </GlassCard>

                    {/* All orders by status in this date range */}
                    <GlassCard className="p-5">
                      <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">All Orders by Status</h2>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">All statuses in this date range</p>
                      <div className="space-y-2">
                        {data.status_breakdown?.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/10 dark:bg-slate-700/20">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[s.status] || 'bg-gray-100 text-gray-700'}`}>
                              {(s.status || '').replace(/_/g, ' ')}
                            </span>
                            <div className="text-right">
                              <span className="font-medium text-gray-800 dark:text-gray-100">{num(s.count)} order{s.count !== 1 ? 's' : ''}</span>
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{fmt(s.revenue)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>

                  </div>
                </div>

              </div>
            )}

            {/* Empty state */}
            {!loading && !error && !data && (
              <GlassCard className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">Select a time period above to generate the report.</p>
              </GlassCard>
            )}

          </div>
        </div>
      </div>

    </div>
  );
};

export default SalesReport;
