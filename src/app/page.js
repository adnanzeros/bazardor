import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';
import {
  fetchCategories,
  fetchProducts,
  getTopRisers,
  getTopFallers,
  getChange,
  bn,
  formatTaka,
  unitLabel,
} from '@/lib/market-data';

function ProductCard({ product }) {
  const change = getChange(product.change);
  const badgeClass =
    change.dir === 'up'
      ? styles.up
      : change.dir === 'down'
        ? styles.down
        : styles.flat;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={styles.productCard}
      aria-label={`${product.nameBn}, আজকের দাম ${formatTaka(product.today)}`}
    >
      <div className={styles.productVisual}>
        <span className={styles.productEmoji}>
          {product.image || product.categoryIcon || '🛒'}
        </span>
      </div>

      <div className={styles.productInfo}>
        <h3>{product.nameBn}</h3>
        <p className={styles.unitLine}>{unitLabel(product.unit)}</p>

        <div className={styles.priceRow}>
          <span className={styles.priceLabel}>আজকের দাম</span>
          <strong>{formatTaka(product.today)}</strong>
        </div>

        <span
          className={`${styles.changeBadge} ${styles.badgeInline} ${badgeClass}`}
        >
          {change.label}
        </span>
      </div>
    </Link>
  );
}

function ProductSection({ id, title, subtitle, products, count }) {
  return (
    <section className={styles.section} id={id}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>

        {count !== undefined && (
          <span className={styles.count}>মোট {bn(count)}টি পণ্য</span>
        )}
      </div>

      {products.length > 0 ? (
        <div className={styles.productGrid}>
          {products.map(product => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <span>📦</span>
          <h3>এখন পণ্যের তথ্য পাওয়া যাচ্ছে না</h3>
          <p>কিছুক্ষণ পর আবার চেষ্টা করুন।</p>
        </div>
      )}
    </section>
  );
}

export default async function HomePage() {
  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const risers = getTopRisers(products, 6);
  const fallers = getTopFallers(products, 6);

  return (
    <div className={styles.page}>
      {/* Hero  */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <span className={styles.eyebrow}>🇧🇩 বাংলাদেশের বাজারদর</span>
          <h1>আজকের বাজারে, কোন পণ্যের দাম কত?</h1>
          <p>
            নিত্যপ্রয়োজনীয় পণ্যের দাম দেখুন এক জায়গায়। দাম বাড়ছে নাকি কমছে,
            জেনে নিন সহজেই।
          </p>

          {/* route  */}
          <a href="#সব-পণ্য" className={styles.heroCta}>
            সব পণ্যের দাম দেখুন ↓
          </a>
        </div>

        <div className={styles.heroImageWrap}>
          <Image
            src="/bazar-hero.png"
            alt="বাজারের সবজি ও নিত্যপণ্য"
            width={315}
            height={263}
            priority
            className={styles.heroImage}
          />
        </div>
      </section>

      {/* Categories */}
      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <div>
            <h2>পণ্যের বিভাগ</h2>
            <p>আপনার প্রয়োজনীয় বিভাগ বেছে নিন</p>
          </div>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map(category => (
            <Link
              key={category.id || category.slug}
              href={`/category/${category.slug}`}
              className={styles.categoryCard}
            >
              <span>{category.icon || '🛍️'}</span>
              <strong>{category.nameBn}</strong>
              <span className={styles.categoryArrow}>↗</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ===== Section A ===== */}
      <ProductSection
        id="দাম-বেড়েছে"
        title="আজ দাম বেড়েছে ▲"
        subtitle="গতকালের তুলনায় সবচেয়ে বেশি দাম বেড়েছে যেসব পণ্যের"
        products={risers}
      />

      {/*  Section B*/}
      <ProductSection
        id="দাম-কমেছে"
        title="আজ দাম কমেছে ▼"
        subtitle="গতকালের তুলনায় সবচেয়ে বেশি দাম কমেছে যেসব পণ্যের"
        products={fallers}
      />

      {/* Section C */}
      <ProductSection
        id="সব-পণ্য"
        title="সব পণ্য"
        subtitle="আজকের দাম ও গতকালের তুলনায় পরিবর্তন"
        products={products}
        count={products.length}
      />
    </div>
  );
}
