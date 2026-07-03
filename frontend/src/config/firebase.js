import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBPjCXMEiqy6PTCa6eZ6R60WcaHlG2XDvw',
  authDomain: 'esena-web-login.firebaseapp.com',
  projectId: 'esena-web-login',
  storageBucket: 'esena-web-login.firebasestorage.app',
  messagingSenderId: '134338672806',
  appId: '1:134338672806:web:82268ee119f76ecca35c67',
  measurementId: 'G-KL2MMR08TK'
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Request these scopes so we get the user's name + email from Google
googleProvider.addScope('profile');
googleProvider.addScope('email');

export default app;
