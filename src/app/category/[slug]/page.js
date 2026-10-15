import Link from 'next/link';
import { notFound } from 'next/navigation';
import CategoryProducts from '@/components/CategoryProducts';
import { fetchCategories, fetchProductsByCategory } from '@/lib/market-data';
import styles from './page.module.css';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const categories = await fetchCategories();
  const category = categories.find(item => item.slug === slug);

  return {
    title: category
      ? `${category.nameBn} | বাজারদর`
      : 'ক্যাটাগরি পাওয়া যায়নি | বাজারদর',
  };
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  const categories = await fetchCategories();
  const category = categories.find(item => item.slug === slug);

  // ভুল slug হলে 404 page
  if (!category) {
    notFound();
  }

  const categoryProducts = await fetchProductsByCategory(slug);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">হোম</Link>
        <span>/</span>
        <span>{category.nameBn}</span>
      </nav>

      <header className={styles.categoryHeading}>
        <div className={styles.categoryIcon} aria-hidden="true">
          {category.icon || '🛒'}
        </div>

        <div>
          <h1>{category.nameBn} এর বাজারদর</h1>
          <p>এই ক্যাটাগরির সব পণ্যের দাম এক জায়গায় দেখুন।</p>
        </div>
      </header>

      <CategoryProducts products={categoryProducts} />

      <div className={styles.categoryFooterLink}>
        <Link href="/">← হোম পেজে ফিরে যান</Link>
      </div>
    </div>
  );
}
