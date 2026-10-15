import Link from 'next/link';
import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import styles from './page.module.css';
import {
  fetchCategories,
  fetchProducts,
  getChange,
  getPriceStats,
  groupMarketsByDivision,
  formatTaka,
  unitLabel,
  bn,
} from '@/lib/market-data';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const products = await fetchProducts();
  const product = products.find(item => item.slug === slug);

  return {
    title: product
      ? `${product.nameBn} এর বাজারদর | বাজার দর`
      : 'পণ্য পাওয়া যায়নি | বাজার দর',
  };
}

export default async function ProductPage({ params }) {
  const { slug } = await params;

  // Protected route: login না থাকলে /signin-এ পাঠানো হবে (সেখানে toast দেখাবে)
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(
      `/signin?protected=1&redirect=${encodeURIComponent(`/product/${slug}`)}`,
    );
  }

  const [products, categories] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
  ]);

  const product = products.find(item => item.slug === slug);
  if (!product) notFound();

  const categorySlug = product.categorySlug || product.category;
  const category = categories.find(
    item => item.slug === categorySlug || item.id === categorySlug,
  );

  const relatedProducts = products
    .filter(
      item =>
        item.slug !== product.slug &&
        (item.category === categorySlug || item.categorySlug === categorySlug),
    )
    .slice(0, 4);

  const change = getChange(product.change);
  const stats = getPriceStats(product);
  const divisions = groupMarketsByDivision(product.markets);

  const changeClass =
    change.dir === 'up'
      ? styles.priceUp
      : change.dir === 'down'
        ? styles.priceDown
        : styles.priceStable;

  const summary =
    stats.marketCount > 0
      ? `${product.nameBn} আজ ${bn(stats.marketCount)}টি বাজারে ${formatTaka(
          stats.min,
        )} থেকে ${formatTaka(stats.max)} দামে পাওয়া যাচ্ছে।`
      : `${product.nameBn} এর বর্তমান বাজারদরের তথ্য দেখুন।`;

  const history = [
    { label: 'গতকাল', value: product.yesterday },
    { label: 'গত সপ্তাহ', value: product.lastWeek },
    { label: 'গত মাস', value: product.lastMonth },
  ].filter(item => item.value !== undefined && item.value !== null);

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
        <Link href="/">হোম</Link>
        <span>/</span>

        {category && (
          <>
            <Link href={`/category/${category.slug}`}>{category.nameBn}</Link>
            <span>/</span>
          </>
        )}

        <span>{product.nameBn}</span>
      </nav>

      {/* ===== Top summary ===== */}
      <section className={styles.productPanel}>
        <div className={styles.productIcon} aria-hidden="true">
          {product.image || category?.icon || '🛒'}
        </div>

        <div className={styles.productInfo}>
          <div className={styles.tagRow}>
            {category && (
              <Link
                href={`/category/${category.slug}`}
                className={styles.categoryTag}
              >
                {category.icon || '🛒'} {category.nameBn}
              </Link>
            )}
            <span className={styles.categoryTag}>
              {unitLabel(product.unit)}
            </span>
          </div>

          <h1>{product.nameBn}</h1>
          <p className={styles.description}>{summary}</p>

          <div className={styles.priceBox}>
            <span className={styles.priceLabel}>আজকের গড় দাম</span>

            <p className={styles.price}>
              {formatTaka(product.today)}
              <span>/ {unitLabel(product.unit).replace('প্রতি ', '')}</span>
            </p>

            <p className={`${styles.priceChange} ${changeClass}`}>
              {change.label}
            </p>
          </div>
        </div>
      </section>

      {/* ===== Price summary ===== */}
      <section className={styles.infoSection}>
        <h2>দামের সারসংক্ষেপ</h2>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span>সর্বনিম্ন দাম</span>
            <strong>{formatTaka(stats.min)}</strong>
          </div>
          <div className={styles.statCard}>
            <span>সর্বোচ্চ দাম</span>
            <strong>{formatTaka(stats.max)}</strong>
          </div>
          <div className={styles.statCard}>
            <span>গড় দাম</span>
            <strong>{formatTaka(Math.round(stats.avg))}</strong>
          </div>
          <div className={styles.statCard}>
            <span>একক</span>
            <strong>{unitLabel(product.unit)}</strong>
          </div>
        </div>

        {history.length > 0 && (
          <div className={styles.historyRow}>
            {history.map(item => (
              <span key={item.label}>
                {item.label}: <strong>{formatTaka(item.value)}</strong>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ===== Market wise price ===== */}
      <section className={styles.infoSection}>
        <h2>বাজারভিত্তিক আজকের দাম</h2>

        {divisions.length > 0 ? (
          divisions.map(group => (
            <div key={group.division} className={styles.divisionBlock}>
              <h3>{group.division} বিভাগ</h3>

              <div className={styles.tableWrap}>
                <table className={styles.marketTable}>
                  <thead>
                    <tr>
                      <th>বাজার</th>
                      <th>সর্বনিম্ন</th>
                      <th>সর্বোচ্চ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.markets.map(market => (
                      <tr key={market.market}>
                        <td>{market.market}</td>
                        <td>{formatTaka(market.min)}</td>
                        <td>{formatTaka(market.max)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.disclaimer}>
            এই পণ্যের বাজারভিত্তিক তথ্য এখনো পাওয়া যায়নি।
          </p>
        )}

        <p className={styles.disclaimer}>
          নোট: সকল দাম সম্ভাব্য; কেনাকাটার আগে স্থানীয় বাজারে দাম যাচাই করে
          নিন।
        </p>
      </section>

      {/* ===== Related ===== */}
      {relatedProducts.length > 0 && (
        <section className={styles.relatedSection}>
          <div className={styles.sectionHeading}>
            <div>
              <h2>একই ক্যাটাগরির পণ্য</h2>
              <p>এই ক্যাটাগরির আরও পণ্যের দাম দেখুন।</p>
            </div>

            {category && (
              <Link href={`/category/${category.slug}`}>সব দেখুন →</Link>
            )}
          </div>

          <div className={styles.relatedGrid}>
            {relatedProducts.map(item => (
              <Link
                href={`/product/${item.slug}`}
                key={item.slug}
                className={styles.relatedCard}
              >
                <h3>
                  {item.image} {item.nameBn}
                </h3>
                <p className={styles.relatedPrice}>{formatTaka(item.today)}</p>
                <span>{unitLabel(item.unit)}</span>
                <span className={styles.viewLink}>বিস্তারিত দেখুন →</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className={styles.backLink}>
        <Link href={category ? `/category/${category.slug}` : '/'}>
          ←{' '}
          {category
            ? `${category.nameBn} ক্যাটাগরিতে ফিরে যান`
            : 'হোম পেজে ফিরে যান'}
        </Link>
      </div>
    </div>
  );
}
