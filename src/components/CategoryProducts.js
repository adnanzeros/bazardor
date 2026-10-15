'use client';

import { useState } from 'react';
import Link from 'next/link';
import homeStyles from '@/app/page.module.css';
import {
  bn,
  formatTaka,
  getChange,
  sortProducts,
  unitLabel,
} from '@/lib/market-data';

function ProductCard({ product }) {
  const change = getChange(product.change);
  const badgeClass =
    change.dir === 'up'
      ? homeStyles.up
      : change.dir === 'down'
        ? homeStyles.down
        : homeStyles.flat;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={homeStyles.productCard}
      aria-label={`${product.nameBn}, আজকের দাম ${formatTaka(product.today)}`}
    >
      <div className={homeStyles.productVisual}>
        <span className={homeStyles.productEmoji}>
          {product.image || product.categoryIcon || '🛒'}
        </span>
      </div>

      <div className={homeStyles.productInfo}>
        <h3>{product.nameBn}</h3>
        <p className={homeStyles.unitLine}>{unitLabel(product.unit)}</p>

        <div className={homeStyles.priceRow}>
          <span className={homeStyles.priceLabel}>আজকের দাম</span>
          <strong>{formatTaka(product.today)}</strong>
        </div>

        <span
          className={`${homeStyles.changeBadge} ${homeStyles.badgeInline} ${badgeClass}`}
        >
          {change.label}
        </span>
      </div>
    </Link>
  );
}

export default function CategoryProducts({ products = [] }) {
  const [mode, setMode] = useState('default');


  const sorted = sortProducts(products, mode);

  if (products.length === 0) {
    return (
      <div className={homeStyles.emptyState}>
        <span>📦</span>
        <h3>এই ক্যাটাগরিতে এখনো কোনো পণ্য নেই</h3>
        <p>অন্য ক্যাটাগরি দেখুন অথবা হোম পেজে ফিরে যান।</p>
        <Link
          href="/"
          style={{
            display: 'inline-block',
            marginTop: 12,
            padding: '10px 18px',
            borderRadius: 8,
            background: '#087f46',
            color: '#fff',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          হোম পেজে ফিরে যান
        </Link>
      </div>
    );
  }

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          margin: '0 0 18px',
        }}
      >
        <p style={{ margin: 0 }}>
          মোট পণ্য: <strong>{bn(products.length)}</strong>
        </p>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 14,
          }}
        >
          <span>সাজান:</span>

          <span style={{ position: 'relative', display: 'inline-block' }}>
            <select
              value={mode}
              onChange={e => setMode(e.target.value)}
              style={{
                appearance: 'none',
                WebkitAppearance: 'none',
                padding: '8px 34px 8px 12px',
                border: '1px solid #cfdccf',
                borderRadius: 8,
                background: '#fff',
                fontFamily: 'inherit',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              <option value="default">ডিফল্ট</option>
              <option value="asc">দাম: কম থেকে বেশি</option>
              <option value="desc">দাম: বেশি থেকে কম</option>
            </select>

            {/* chevron icon */}
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
              }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </label>
      </div>

      <div className={homeStyles.productGrid}>
        {sorted.map(product => (
          <ProductCard key={product.id || product.slug} product={product} />
        ))}
      </div>
    </>
  );
}
