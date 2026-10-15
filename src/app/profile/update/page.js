'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import styles from '../page.module.css';

export default function UpdateProfilePage() {
  const router = useRouter();

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user;

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) setName(user.name || '');
  }, [user]);


  useEffect(() => {
    if (!isPending && !session) {
      toast.error('আগে সাইন ইন করুন।', { id: 'protected-route' });
      router.replace('/signin?protected=1&redirect=/profile/update');
    }
  }, [isPending, session, router]);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!name.trim()) {
      toast.error('আপনার নাম লিখুন।');
      return;
    }

    setLoading(true);

    try {
      
      const result = await authClient.updateUser({ name: name.trim() });

      if (result.error) {
        throw new Error(result.error.message || 'তথ্য আপডেট করা যায়নি।');
      }

      toast.success('তথ্য সফলভাবে আপডেট হয়েছে।');
      router.push('/profile');
      router.refresh();
    } catch (error) {
      console.error('Update user error:', error);
      toast.error(error.message || 'একটি সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  }

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
          <span className={styles.eyebrow}>UPDATE INFORMATION</span>
          <h1>তথ্য আপডেট করুন</h1>
          <p>আপনার নাম পরিবর্তন করুন।</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="name">আপনার নাম</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={event => setName(event.target.value)}
              placeholder="আপনার নাম লিখুন"
              maxLength={100}
              autoComplete="name"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className={styles.saveButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className={styles.spinner} />
                আপডেট হচ্ছে...
              </>
            ) : (
              'Update Information'
            )}
          </button>
        </form>
      </section>

      <Link href="/profile" className={styles.back}>
        <span aria-hidden="true">←</span>
        প্রোফাইলে ফিরে যান
      </Link>
    </main>
  );
}
