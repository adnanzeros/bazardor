'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import styles from './page.module.css';

function getErrorText(error, fallback) {
  const message = error?.message || fallback;
  const status = error?.status
    ? ` (${error.status}${error.statusText ? ' ' + error.statusText : ''})`
    : '';

  return `${message}${status}`;
}

// ?redirect=/product/xyz থাকলে login-এর পর সেখানে পাঠানো হবে
// (শুধু নিজের সাইটের path গ্রহণ করা হয়, বাইরের URL নয়)
function getRedirectPath() {
  if (typeof window === 'undefined') return '/';

  const target = new URLSearchParams(window.location.search).get('redirect');

  if (target && target.startsWith('/') && !target.startsWith('//')) {
    return target;
  }

  return '/';
}

export default function SignInPage() {
  const router = useRouter();
  const toastShown = useRef(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [error, setError] = useState('');

  // Protected route থেকে redirect হয়ে এলে / social login error হলে toast
  useEffect(() => {
    if (toastShown.current) return;
    toastShown.current = true;

    const params = new URLSearchParams(window.location.search);

    if (params.get('protected') === '1') {
      toast.error('এই পেজ দেখতে আগে সাইন ইন করুন।', { id: 'protected-route' });
    } else if (params.get('error')) {
      toast.error('সোশ্যাল লগইন করা যায়নি। আবার চেষ্টা করুন।', {
        id: 'social-error',
      });
    }
  }, []);

  function showError(text) {
    setError(text);
    toast.error(text);
  }

  // Email and password sign-in
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      showError('ইমেইল ও পাসওয়ার্ড দিন।');
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signIn.email({
        email: email.trim(),
        password,
      });

      if (result.error) {
        showError(
          getErrorText(
            result.error,
            'সাইন ইন করা যায়নি। ইমেইল ও পাসওয়ার্ড যাচাই করুন।',
          ),
        );
        return;
      }

      toast.success('সফলভাবে সাইন ইন হয়েছে।');
      router.push(getRedirectPath());
      router.refresh();
    } catch (err) {
      console.error('Email sign-in error:', err);
      showError('সাইন ইন করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }

  // Google / GitHub sign-in (একই function)
  async function handleSocialSignIn(provider, label) {
    setError('');
    setSocialLoading(provider);

    try {
      const result = await authClient.signIn.social({
        provider,
        callbackURL: getRedirectPath(),
        errorCallbackURL: '/signin',
      });

      if (result.error) {
        console.error(`${label} sign-in error:`, result.error);
        showError(
          getErrorText(result.error, `${label} দিয়ে লগইন করা যায়নি।`),
        );
        setSocialLoading('');
      }
    } catch (err) {
      console.error(`${label} sign-in error:`, err);
      showError(`${label} লগইনে সমস্যা হয়েছে। আবার চেষ্টা করুন।`);
      setSocialLoading('');
    }
  }

  const isLoading = loading || Boolean(socialLoading);

  return (
    <main className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>সাইন ইন</h1>
          <p>বাজারের তথ্য ও আপনার প্রোফাইল দেখতে অ্যাকাউন্টে প্রবেশ করুন।</p>
        </header>

        <div className={styles.card}>
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="email">ইমেইল</label>

              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={isLoading}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password">পাসওয়ার্ড</label>

              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="পাসওয়ার্ড দিন"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />

                <button
                  type="button"
                  className={styles.eyeButton}
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={
                    showPassword ? 'পাসওয়ার্ড লুকান' : 'পাসওয়ার্ড দেখুন'
                  }
                  disabled={isLoading}
                >
                  {showPassword ? 'লুকান' : 'দেখুন'}
                </button>
              </div>
            </div>

            {error && (
              <p className={styles.error} role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className={styles.signInButton}
              disabled={isLoading}
            >
              {loading ? 'অপেক্ষা করুন...' : 'সাইন ইন'}
            </button>
          </form>

          <div className={styles.divider}>
            <span>অথবা</span>
          </div>

          <div className={styles.socialButtons}>
            <button
              type="button"
              className={styles.socialButton}
              onClick={() => handleSocialSignIn('google', 'Google')}
              disabled={isLoading}
            >
              <span aria-hidden="true">G</span>

              <span>
                {socialLoading === 'google'
                  ? 'Google-এ পাঠানো হচ্ছে...'
                  : 'Google দিয়ে চালিয়ে যান'}
              </span>
            </button>

            <button
              type="button"
              className={styles.socialButton}
              onClick={() => handleSocialSignIn('github', 'GitHub')}
              disabled={isLoading}
            >
              <span aria-hidden="true">●</span>

              <span>
                {socialLoading === 'github'
                  ? 'GitHub-এ পাঠানো হচ্ছে...'
                  : 'GitHub দিয়ে চালিয়ে যান'}
              </span>
            </button>
          </div>

          <p className={styles.signupText}>
            অ্যাকাউন্ট নেই? <Link href="/signup">সাইন আপ করুন</Link>
          </p>
        </div>

        <Link href="/" className={styles.backLink}>
          ← হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
