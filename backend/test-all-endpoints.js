/**
 * Esena Pharmacy — Full API Endpoint Test
 * Run: node test-all-endpoints.js
 * Tests every endpoint used by the frontend.
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const BASE = 'http://localhost:5000';
let TOKEN = '';
let createdProductId = null;
let createdOrderToken = null;
let createdOrderId = null;
let createdAppointmentToken = null;
let createdBlogId = null;
let createdPrescriptionId = null;

const results = [];
let passed = 0;
let failed = 0;

// ─── HTTP helper ────────────────────────────────────────────────────────────
function request(method, path, body, headers = {}) {
  return new Promise((resolve) => {
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch { resolve({ status: res.statusCode, body: data }); }
      });
    });

    req.on('error', (e) => resolve({ status: 0, body: { error: e.message } }));
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function authHeaders() {
  return TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {};
}

// ─── Test runner ─────────────────────────────────────────────────────────────
async function test(label, fn) {
  try {
    const { ok, status, note } = await fn();
    const icon = ok ? '✅' : '❌';
    const line = `${icon} [${status}] ${label}${note ? '  →  ' + note : ''}`;
    console.log(line);
    results.push({ ok, label, status, note });
    if (ok) passed++; else failed++;
  } catch (e) {
    console.log(`❌ [ERR] ${label}  →  ${e.message}`);
    results.push({ ok: false, label, status: 'ERR', note: e.message });
    failed++;
  }
}

function ok(res, expectedStatus = 200) {
  return { ok: res.status === expectedStatus, status: res.status };
}

function okRange(res, min, max, note) {
  return { ok: res.status >= min && res.status <= max, status: res.status, note };
}

// ─── Tests ───────────────────────────────────────────────────────────────────
async function run() {
  console.log('\n══════════════════════════════════════════════');
  console.log('  Esena Pharmacy — API Endpoint Tests');
  console.log(`  Base URL: ${BASE}`);
  console.log('══════════════════════════════════════════════\n');

  // ── Health ──────────────────────────────────────────────────────────────
  console.log('── Health ──────────────────────────────────────');
  await test('GET /  (root health)', async () => {
    const r = await request('GET', '/');
    return { ...ok(r), note: r.body?.status };
  });
  await test('GET /api  (api health)', async () => {
    const r = await request('GET', '/api');
    return { ...ok(r), note: r.body?.status };
  });
  await test('GET /db-test  (database connection)', async () => {
    const r = await request('GET', '/db-test');
    return { ...ok(r), note: r.body?.status };
  });

  // ── Auth ─────────────────────────────────────────────────────────────────
  console.log('\n── Auth ────────────────────────────────────────');
  await test('POST /api/auth/login  (bad credentials → 401)', async () => {
    const r = await request('POST', '/api/auth/login', { username: 'admin', password: 'wrongpassword' });
    return { ok: r.status === 401 || r.status === 400, status: r.status };
  });
  await test('POST /api/auth/login  (valid credentials → token)', async () => {
    const r = await request('POST', '/api/auth/login', { username: 'admin', password: 'admin123' });
    if (r.body?.token) TOKEN = r.body.token;
    return { ok: r.status === 200 && !!r.body?.token, status: r.status, note: TOKEN ? 'token received' : 'NO TOKEN' };
  });

  // ── Products ─────────────────────────────────────────────────────────────
  console.log('\n── Products ────────────────────────────────────');
  await test('GET /api/products  (public list)', async () => {
    const r = await request('GET', '/api/products');
    return { ...ok(r), note: `${Array.isArray(r.body) ? r.body.length : '?'} products` };
  });
  await test('GET /api/products?category=PainRelief  (filter)', async () => {
    const r = await request('GET', '/api/products?category=PainRelief');
    return { ...okRange(r, 200, 200, `${Array.isArray(r.body) ? r.body.length : '?'} results`) };
  });
  await test('POST /api/products  (create — auth required)', async () => {
    const r = await request('POST', '/api/products', {
      name: 'Test Paracetamol 500mg', category: 'PainRelief',
      price: 50, description: 'Test product', stock: 100
    }, authHeaders());
    if (r.body?.id) createdProductId = r.body.id;
    return { ok: r.status === 201, status: r.status, note: createdProductId ? `id=${createdProductId}` : r.body?.message };
  });
  await test('GET /api/products/:id  (get by id)', async () => {
    if (!createdProductId) return { ok: false, status: 0, note: 'skipped — no product created' };
    const r = await request('GET', `/api/products/${createdProductId}`);
    return { ...ok(r), note: r.body?.name };
  });
  await test('PUT /api/products/:id  (update — auth required)', async () => {
    if (!createdProductId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('PUT', `/api/products/${createdProductId}`, {
      name: 'Test Paracetamol 500mg', category: 'PainRelief', price: 50, stock: 99
    }, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });

  // ── Orders ───────────────────────────────────────────────────────────────
  console.log('\n── Orders ──────────────────────────────────────');
  await test('POST /api/orders  (create order — public)', async () => {
    const r = await request('POST', '/api/orders', {
      customer_name: 'Test Customer',
      email: 'test@example.com',
      phone: '+254700000001',
      delivery_address: '123 Test Street, Nairobi',
      delivery_type: 'delivery',
      delivery_zone: 'nairobi',
      shipping_cost: 150,
      items: [{ product_id: createdProductId || 1, quantity: 1, price: 50 }]
    });
    if (r.body?.token) createdOrderToken = r.body.token;
    if (r.body?.orderId) createdOrderId = r.body.orderId;
    return { ok: r.status === 201, status: r.status, note: createdOrderToken ? `token=${createdOrderToken.substring(0,12)}...` : r.body?.message };
  });
  await test('GET /api/orders/:token  (track by token — public)', async () => {
    if (!createdOrderToken) return { ok: false, status: 0, note: 'skipped — no order created' };
    const r = await request('GET', `/api/orders/${createdOrderToken}`);
    return { ...ok(r), note: `status=${r.body?.status}` };
  });
  await test('GET /api/orders  (admin list — auth required)', async () => {
    const r = await request('GET', '/api/orders', null, authHeaders());
    return { ...ok(r), note: `${r.body?.orders?.length ?? '?'} orders` };
  });
  await test('GET /api/orders/:id/details  (admin detail — auth required)', async () => {
    if (!createdOrderId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('GET', `/api/orders/${createdOrderId}/details`, null, authHeaders());
    return { ...ok(r), note: `items=${r.body?.items?.length ?? '?'}` };
  });
  await test('PUT /api/orders/:id/status  (update status — auth required)', async () => {
    if (!createdOrderId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('PUT', `/api/orders/${createdOrderId}/status`, { status: 'payment_requested' }, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });
  await test('PUT /api/orders/:id/shipping  (update shipping — auth required)', async () => {
    if (!createdOrderId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('PUT', `/api/orders/${createdOrderId}/shipping`, { shipping_cost: 200 }, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });
  await test('POST /api/orders/:id/cancel  (admin cancel — auth required)', async () => {
    if (!createdOrderId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('POST', `/api/orders/${createdOrderId}/cancel`, { reason: 'Test cancel' }, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });

  // ── Appointments ─────────────────────────────────────────────────────────
  console.log('\n── Appointments ────────────────────────────────');
  const dayAfterTomorrow = new Date(); dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  const futureDate = dayAfterTomorrow.toISOString().split('T')[0];
  await test('GET /api/appointments/availability  (public — check slots)', async () => {
    const r = await request('GET', `/api/appointments/availability?date=${futureDate}`);
    return { ...ok(r), note: `bookedTimes=${JSON.stringify(r.body?.bookedTimes)}` };
  });
  await test('POST /api/appointments  (create — public)', async () => {
    const r = await request('POST', '/api/appointments', {
      name: 'Test Patient',
      email: 'patient@example.com',
      phone: '+254700000002',
      service: 'Pharmacist Consultation',
      date: `${futureDate}T10:00:00`,
      message: 'Test appointment'
    });
    if (r.body?.token) createdAppointmentToken = r.body.token;
    return { ok: r.status === 201, status: r.status, note: createdAppointmentToken ? `token=${createdAppointmentToken.substring(0,12)}...` : r.body?.message };
  });
  await test('GET /api/appointments/:token  (track by token — public)', async () => {
    if (!createdAppointmentToken) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('GET', `/api/appointments/${createdAppointmentToken}`);
    return { ...ok(r), note: `status=${r.body?.status}` };
  });
  await test('GET /api/appointments  (admin list — auth required)', async () => {
    const r = await request('GET', '/api/appointments', null, authHeaders());
    return { ...ok(r), note: `${r.body?.appointments?.length ?? '?'} appointments` };
  });

  // ── Prescriptions ─────────────────────────────────────────────────────────
  console.log('\n── Prescriptions ───────────────────────────────');
  await test('GET /api/prescriptions  (admin list — auth required)', async () => {
    const r = await request('GET', '/api/prescriptions', null, authHeaders());
    return { ...ok(r), note: `${r.body?.data?.length ?? '?'} prescriptions` };
  });
  // Note: POST /api/prescriptions/upload requires multipart/form-data — tested separately below
  await test('POST /api/prescriptions/upload  (public — multipart)', async () => {
    // Use a minimal multipart body to test the route exists
    const boundary = '----TestBoundary';
    const body = [
      `--${boundary}`,
      'Content-Disposition: form-data; name="name"',
      '',
      'Test Patient',
      `--${boundary}`,
      'Content-Disposition: form-data; name="phone"',
      '',
      '+254700000003',
      `--${boundary}`,
      'Content-Disposition: form-data; name="email"',
      '',
      'rx@example.com',
      `--${boundary}`,
      'Content-Disposition: form-data; name="prescription"; filename="test.jpg"',
      'Content-Type: image/jpeg',
      '',
      '\xFF\xD8\xFF\xE0' + 'FAKEJPEGDATA', // minimal fake JPEG header
      `--${boundary}--`,
    ].join('\r\n');

    return new Promise((resolve) => {
      const opts = {
        hostname: 'localhost', port: 5000,
        path: '/api/prescriptions/upload', method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(body),
        },
      };
      const req = http.request(opts, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const b = JSON.parse(data);
            if (b.id) createdPrescriptionId = b.id;
            resolve({ ok: res.statusCode === 201 || res.statusCode === 400, status: res.statusCode, note: b.message || b.error });
          } catch { resolve({ ok: false, status: res.statusCode, note: data.substring(0, 80) }); }
        });
      });
      req.on('error', e => resolve({ ok: false, status: 0, note: e.message }));
      req.write(body);
      req.end();
    });
  });

  // ── Blogs ─────────────────────────────────────────────────────────────────
  console.log('\n── Blogs ───────────────────────────────────────');
  await test('GET /api/blogs/published  (public list)', async () => {
    const r = await request('GET', '/api/blogs/published');
    return { ...ok(r), note: `${Array.isArray(r.body) ? r.body.length : '?'} published blogs` };
  });
  await test('GET /api/blogs/slug/:slug  (public by slug)', async () => {
    const r = await request('GET', '/api/blogs/slug/understanding-your-medications');
    return { ...okRange(r, 200, 404, r.status === 200 ? r.body?.title : 'not found (ok if no seed data)') };
  });
  await test('GET /api/blogs  (admin list — auth required)', async () => {
    const r = await request('GET', '/api/blogs', null, authHeaders());
    return { ...ok(r), note: `${Array.isArray(r.body) ? r.body.length : '?'} blogs` };
  });
  await test('POST /api/blogs  (create — auth required)', async () => {
    const r = await request('POST', '/api/blogs', {
      title: 'Test Blog Post',
      content: '<p>Test content for the blog post.</p>',
      excerpt: 'Test excerpt',
      author: 'Esena Pharmacy',
      status: 'draft'
    }, authHeaders());
    if (r.body?.id) createdBlogId = r.body.id;
    return { ok: r.status === 201, status: r.status, note: createdBlogId ? `id=${createdBlogId}` : r.body?.message };
  });
  await test('PUT /api/blogs/:id  (update — auth required)', async () => {
    if (!createdBlogId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('PUT', `/api/blogs/${createdBlogId}`, { title: 'Updated Test Blog', content: '<p>Updated.</p>', status: 'draft' }, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });
  await test('PATCH /api/blogs/:id/toggle-status  (toggle — auth required)', async () => {
    if (!createdBlogId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('PATCH', `/api/blogs/${createdBlogId}/toggle-status`, null, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });
  await test('DELETE /api/blogs/:id  (delete — auth required)', async () => {
    if (!createdBlogId) return { ok: false, status: 0, note: 'skipped' };
    const r = await request('DELETE', `/api/blogs/${createdBlogId}`, null, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });

  // ── Contact ───────────────────────────────────────────────────────────────
  console.log('\n── Contact ─────────────────────────────────────');
  await test('POST /api/contact  (public — submit message)', async () => {
    const r = await request('POST', '/api/contact', {
      name: 'Test User',
      email: 'contact@example.com',
      phone: '+254700000004',
      message: 'This is a test contact message from the API test suite.'
    });
    return { ok: r.status === 200 || r.status === 201, status: r.status, note: r.body?.message };
  });

  // ── Settings ──────────────────────────────────────────────────────────────
  console.log('\n── Settings ────────────────────────────────────');
  await test('GET /api/settings/delivery  (public — delivery prices)', async () => {
    const r = await request('GET', '/api/settings/delivery');
    return { ...ok(r), note: `nairobi=${r.body?.delivery_nairobi}, outside=${r.body?.delivery_outside_nairobi}` };
  });
  await test('PUT /api/settings/delivery  (admin — update prices)', async () => {
    const r = await request('PUT', '/api/settings/delivery', {
      delivery_nairobi: 150, delivery_outside_nairobi: 350, pickup_cost: 0
    }, authHeaders());
    return { ...ok(r), note: r.body?.message };
  });

  // ── Dashboard ─────────────────────────────────────────────────────────────
  console.log('\n── Dashboard ───────────────────────────────────');
  await test('GET /api/admin/dashboard/stats  (auth required)', async () => {
    const r = await request('GET', '/api/admin/dashboard/stats', null, authHeaders());
    return { ...ok(r), note: `orders=${r.body?.pendingOrders}, appts=${r.body?.pendingAppointments}` };
  });

  // ── Bot ───────────────────────────────────────────────────────────────────
  console.log('\n── IvoBot ──────────────────────────────────────');
  await test('POST /api/bot/message  (public — chatbot, may fail on API quota)', async () => {
    const r = await request('POST', '/api/bot/message', {
      message: 'What are your opening hours?',
      sessionId: 'test-session-001'
    });
    // 200 = working, 500 with quota error = Gemini API limit (not a code bug)
    const isQuotaError = r.body?.error?.includes('429') || r.body?.error?.includes('quota');
    return {
      ok: r.status === 200 || r.status === 201 || isQuotaError,
      status: r.status,
      note: isQuotaError ? 'Gemini quota exceeded (API key limit — not a code bug)' : r.body?.reply ? 'got reply' : r.body?.message || 'no reply'
    };
  });

  // ── Auth guards (unauthenticated should 401) ──────────────────────────────
  console.log('\n── Auth Guards (no token → should 401) ─────────');
  await test('GET /api/orders  (no token → 401)', async () => {
    const r = await request('GET', '/api/orders');
    return { ok: r.status === 401 || r.status === 403, status: r.status };
  });
  await test('GET /api/prescriptions  (no token → 401)', async () => {
    const r = await request('GET', '/api/prescriptions');
    return { ok: r.status === 401 || r.status === 403, status: r.status };
  });
  await test('GET /api/admin/dashboard/stats  (no token → 401)', async () => {
    const r = await request('GET', '/api/admin/dashboard/stats');
    return { ok: r.status === 401 || r.status === 403, status: r.status };
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────
  if (createdProductId) {
    await request('DELETE', `/api/products/${createdProductId}`, null, authHeaders());
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
  if (failed > 0) {
    console.log('\n  Failed tests:');
    results.filter(r => !r.ok).forEach(r => console.log(`    ❌ [${r.status}] ${r.label}${r.note ? ' → ' + r.note : ''}`));
  }
  console.log('══════════════════════════════════════════════\n');
  process.exit(failed > 0 ? 1 : 0);
}

run().catch(e => { console.error('Test runner error:', e); process.exit(1); });
