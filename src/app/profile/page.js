'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import styles from './page.module.css';

export default function ProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  // Protected route: login না থাকলে signin-এ পাঠানো হবে
  useEffect(() => {
    if (!isPending && !session) {
      toast.error('প্রোফাইল দেখতে আগে সাইন ইন করুন।', {
        id: 'protected-route',
      });
      router.replace('/signin?protected=1&redirect=/profile');
    }
  }, [isPending, session, router]);

  if (isPending || !user) {
    return (
      <main className={styles.page}>
        <div className={styles.skeleton} />
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.heading}>
          <span className={styles.eyebrow}>MY PROFILE</span>
          <h1>আমার প্রোফাইল</h1>
          <p>আপনার অ্যাকাউন্টের তথ্য নিচে দেখুন।</p>
        </div>

        <div className={styles.form}>
          <div className={styles.photoSection}>
            <div className={styles.avatar}>
              {user.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name || 'প্রোফাইল'}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span>{(user.name || 'U').charAt(0).toUpperCase()}</span>
              )}
            </div>
          </div>

          <div className={styles.field}>
            <label htmlFor="name">নাম</label>
            <input id="name" type="text" value={user.name || ''} readOnly />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">ইমেইল ঠিকানা</label>
            <input id="email" type="email" value={user.email || ''} readOnly />
          </div>

          {/* Update button -> আলাদা route (/profile/update) */}
          <Link
            href="/profile/update"
            className={styles.saveButton}
            style={{ textDecoration: 'none', textAlign: 'center' }}
          >
            ✏️ তথ্য আপডেট করুন
          </Link>
        </div>
      </section>

      <Link href="/" className={styles.back}>
        <span aria-hidden="true">←</span>
        হোম পেজে ফিরে যান
      </Link>
    </main>
  );
}
