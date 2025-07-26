import React, { useState } from 'react';
import { useAuth } from '../App';
import { Navigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';

type AuthMode = 'login' | 'signup';

interface AuthPageProps {
  initialMode?: AuthMode;
}

export const AuthPage = ({ initialMode = 'login' }: AuthPageProps) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState(''); // for signup
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { currentUser } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let userCredential;

      if (mode === 'signup') {
        if (!name) {
          setError('Please enter your name.');
          setLoading(false);
          return;
        }

        userCredential = await createUserWithEmailAndPassword(auth, email, password);

        if (auth.currentUser) {
          await updateProfile(auth.currentUser, { displayName: name });
        }
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      }

      const user = userCredential.user;

      // 🔥 Ensure /users/{uid} exists
      const userDocRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          displayName: user.displayName || name,
          email: user.email,
          createdAt: new Date().toISOString()
        });
      }

    } catch (err: any) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  if (currentUser) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-dark">
      <div className="w-full max-w-sm p-8 space-y-6 bg-brand-secondary-dark rounded-2xl shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-brand-light">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-center text-sm text-brand-accent-light">
            {mode === 'login' ? 'Sign in to continue' : 'Get started with CWTracker'}
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            {mode === 'signup' && (
              <div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-brand-accent bg-brand-dark text-brand-light placeholder-brand-accent-light focus:outline-none focus:ring-brand-accent-light focus:border-brand-accent-light focus:z-10 sm:text-sm rounded-t-md"
                  placeholder="Your Name"
                />
              </div>
            )}
            <div>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-3 border border-brand-accent bg-brand-dark text-brand-light placeholder-brand-accent-light focus:outline-none focus:ring-brand-accent-light focus:border-brand-accent-light focus:z-10 sm:text-sm ${mode === 'signup' ? '' : 'rounded-t-md'}`}
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-brand-accent bg-brand-dark text-brand-light placeholder-brand-accent-light focus:outline-none focus:ring-brand-accent-light focus:border-brand-accent-light focus:z-10 sm:text-sm rounded-b-md"
                placeholder="Password"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-brand-accent hover:bg-brand-accent-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-accent-light focus:ring-offset-brand-dark transition-colors disabled:opacity-50"
            >
              {loading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Sign Up')}
            </button>
          </div>
        </form>
        <p className="mt-2 text-center text-sm text-brand-accent-light">
          {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="font-medium text-brand-accent-light hover:text-brand-light"
          >
            {mode === 'login' ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};
