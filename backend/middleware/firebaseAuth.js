/**
 * Firebase Auth Middleware
 * Verifies Firebase ID tokens from the Authorization: Bearer <token> header.
 * Attaches decoded Firebase user to req.firebaseUser
 */

let adminAuth = null;

const getAuth = () => {
  if (adminAuth) return adminAuth;

  try {
    const { cert, initializeApp, getApps } = require('firebase-admin/app');
    const { getAuth: _getAuth } = require('firebase-admin/auth');

    if (!getApps().length) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const projectId = process.env.FIREBASE_PROJECT_ID || 'esena-web-login';

      if (!privateKey || !clientEmail) {
        console.warn('[Firebase Admin] Missing FIREBASE_CLIENT_EMAIL or FIREBASE_PRIVATE_KEY — token verification disabled.');
        return null;
      }

      initializeApp({
        credential: cert({
          type: 'service_account',
          project_id: projectId,
          client_email: clientEmail,
          private_key: privateKey.replace(/\\n/g, '\n'),
        }),
      });

      console.log('[Firebase Admin] Initialised ✅');
    }

    adminAuth = _getAuth();
  } catch (err) {
    console.error('[Firebase Admin] Init error:', err.message);
    adminAuth = null;
  }

  return adminAuth;
};

// ── Strict: 401 if no valid token ─────────────────────────────
const firebaseAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const auth = getAuth();
  if (!auth) {
    return res.status(503).json({ error: 'Authentication service unavailable' });
  }

  try {
    req.firebaseUser = await auth.verifyIdToken(header.slice(7));
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token', detail: err.message });
  }
};

// ── Soft: passes through even without a token ─────────────────
const optionalFirebaseAuth = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return next();

  const auth = getAuth();
  if (!auth) return next();

  try {
    req.firebaseUser = await auth.verifyIdToken(header.slice(7));
  } catch (_) {}
  next();
};

module.exports = { firebaseAuth, optionalFirebaseAuth };
