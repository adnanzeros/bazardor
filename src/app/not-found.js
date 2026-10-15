import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <div className={styles.icon}>🛒</div>

        <p className={styles.code}>404 — PAGE NOT FOUND</p>

        <h1>দুঃখিত! পেজটি খুঁজে পাওয়া যায়নি</h1>

        <p className={styles.description}>
          আপনি যে পেজটি খুঁজছেন, সেটি সরানো হয়েছে, ঠিকানা পরিবর্তন হয়েছে অথবা
          পেজটি আর নেই।
        </p>

        <Link href="/" className={styles.button}>
          ← হোম পেজে ফিরে যান
        </Link>
      </div>
    </main>
  );
}
