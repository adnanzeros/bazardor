
'use client';

import { useState } from 'react';
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

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email and password signup
  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('আপনার নাম লিখুন।');
      toast.error('আপনার নাম লিখুন।');
      return;
    }

    if (!email.trim()) {
      setError('আপনার ইমেইল লিখুন।');
      toast.error('আপনার ইমেইল লিখুন।');
      return;
    }

    if (password.length < 8) {
      setError('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      toast.error('পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।');
      return;
    }

    if (password !== confirmPassword) {
      setError('দুটি পাসওয়ার্ড মিলছে না।');
      toast.error('দুটি পাসওয়ার্ড মিলছে না।');
      return;
    }

    setLoading(true);

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (result.error) {
        const text = getErrorText(
          result.error,
          'অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন.',
        );

        setError(text);
        toast.error(text);
        return;
      }

      toast.success('অ্যাকাউন্ট তৈরি হয়েছে। এখন সাইন ইন করুন।');
      router.push('/signin');
    } catch (err) {
      console.error('Sign-up error:', err);
      setError('অ্যাকাউন্ট তৈরি করা যায়নি। আবার চেষ্টা করুন।');
      toast.error('অ্যাকাউন্ট তৈরি করা যায়নি।');
    } finally {
      setLoading(false);
    }
  }

  // Google sign-in handler
  async function handleGoogleSignIn() {
    setError('');
    setSocialLoading('google');

    try {
      const result = await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/',
        errorCallbackURL: '/signup',
      });

      if (result.error) {
        console.error('Google sign-in error:', result.error);

        const text = getErrorText(
          result.error,
          'Google দিয়ে অ্যাকাউন্ট তৈরি করা যায়নি।',
        );

        setError(text);
        toast.error(text);
        setSocialLoading('');
      }
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Google দিয়ে সাইন আপ করতে সমস্যা হয়েছে।');
      toast.error('Google দিয়ে সাইন আপ করতে সমস্যা হয়েছে।');
      setSocialLoading('');
    }
  }


  async function handleGithubSignIn() {
    setError('');
    setSocialLoading('github');

    try {
      const result = await authClient.signIn.social({
        provider: 'github',
        callbackURL: '/',
        errorCallbackURL: '/signup',
      });

      if (result.error) {
        console.error('GitHub sign-in error:', result.error);

        const text = getErrorText(
          result.error,
          'GitHub দিয়ে অ্যাকাউন্ট তৈরি করা যায়নি।',
        );

        setError(text);
        toast.error(text);
        setSocialLoading('');
      }
    } catch (err) {
      console.error('GitHub sign-in error:', err);
      setError('GitHub দিয়ে সাইন আপ করতে সমস্যা হয়েছে।');
      toast.error('GitHub দিয়ে সাইন আপ করতে সমস্যা হয়েছে।');
      setSocialLoading('');
    }
  }

  const isLoading = loading || Boolean(socialLoading);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <h1>অ্যাকাউন্ট তৈরি করুন</h1>
        <p>বিনা খরচে সাইন আপ করে বাজারের তথ্য দেখুন।</p>
      </header>

      <section className={styles.card}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">নাম</label>

            <input
              id="name"
              type="text"
              placeholder="যেমন: রহিম উদ্দিন"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">ইমেইল</label>

            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password">পাসওয়ার্ড</label>

            <div className={styles.passwordWrap}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="কমপক্ষে ৮ অক্ষর"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
                disabled={isLoading}
              />

              <button
                type="button"
                className={styles.togglePassword}
                onClick={() =>
                  setShowPassword((prev) => !prev)
                }
                aria-label={
                  showPassword
                    ? 'পাসওয়ার্ড লুকান'
                    : 'পাসওয়ার্ড দেখুন'
                }
                disabled={isLoading}
              >
                {showPassword ? 'লুকান' : 'দেখুন'}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="confirmPassword">
              পাসওয়ার্ড নিশ্চিত করুন
            </label>

            <input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="আবার লিখুন"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              disabled={isLoading}
            />
          </div>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {loading
              ? 'অ্যাকাউন্ট তৈরি হচ্ছে...'
              : 'অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </form>

        <div className={styles.divider}>
          <span>অথবা</span>
        </div>

        <div className={styles.socialButtons}>
          {/* Google signup button */}
          <button
            type="button"
            className={styles.socialButton}
            onClick={handleGoogleSignIn}
            disabled={isLoading}
          >
            <span className={styles.googleIcon} aria-hidden="true">
              G
            </span>

            <span>
              {socialLoading === 'google'
                ? 'Google-এ পাঠানো হচ্ছে...'
                : 'Google দিয়ে চালিয়ে যান'}
            </span>
          </button>

          {/* GitHub signup button */}
          <button
            type="button"
            className={styles.socialButton}
            onClick={handleGithubSignIn}
            disabled={isLoading}
          >
            <span className={styles.githubIcon} aria-hidden="true">
              ●
            </span>

            <span>
              {socialLoading === 'github'
                ? 'GitHub-এ পাঠানো হচ্ছে...'
                : 'GitHub দিয়ে চালিয়ে যান'}
            </span>
          </button>
        </div>

        <p className={styles.footer}>
          অ্যাকাউন্ট আছে?{' '}
          <Link href="/signin">সাইন ইন করুন</Link>
        </p>
      </section>

      <Link href="/" className={styles.backLink}>
        ← হোম পেজে ফিরে যান
      </Link>
    </main>
  );
}
