import './globals.css';

import Link from 'next/link';
import { Hind_Siliguri } from 'next/font/google';

import Navbar from '@/components/Navbar';

import {
  fetchCategories,
  fetchProducts,
  bn,
  unitShort,
  getChange,
  parseNumber,
} from '@/lib/market-data';



const hindSiliguri = Hind_Siliguri({
  subsets: ['bengali', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-hind-siliguri',
  display: 'swap',
});



export const metadata = {
  title: 'বাজার দর | BazarDor',

  description: 'বাংলাদেশের প্রয়োজনীয় পণ্যের দাম এক নজরে দেখুন।',

  icons: {
    icon: [
      {
        url: '/logo-icon.png',
        type: 'image/png',
      },
    ],
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
};



function PriceTickerItem({ product }) {
  const change = getChange(product.change);

  return (
    <span className="ticker-item">
      {/* Product Icon */}
      <span className="ticker-product-icon">
        {product.image || product.categoryIcon || '🛒'}
      </span>

      {/* Product Name */}
      <span className="ticker-product-name">{product.nameBn}</span>

      {/* Product Price */}
      <strong className="ticker-price">
        {bn(product.today)} টাকা
        <small>/{unitShort(product.unit)}</small>
      </strong>

      {/* Price Change */}
      <span className={`ticker-change price-${change.dir}`}>
        {change.label}
      </span>
    </span>
  );
}


export default async function RootLayout({ children }) {


  const [categoriesResult, productsResult] = await Promise.allSettled([
    fetchCategories(),
    fetchProducts(),
  ]);

  const categoriesData =
    categoriesResult.status === 'fulfilled' &&
    Array.isArray(categoriesResult.value)
      ? categoriesResult.value
      : [];

  const productsData =
    productsResult.status === 'fulfilled' && Array.isArray(productsResult.value)
      ? productsResult.value
      : [];



  const categories = categoriesData
    .filter(category => category && category.slug && category.nameBn)
    .map(({ id, slug, nameBn, icon }) => ({
      id,
      slug,
      nameBn,
      icon,
    }));



  const products = productsData.filter(
    product =>
      product && product.nameBn && Number.isFinite(parseNumber(product.today)),
  );



  const banglaDate = new Intl.DateTimeFormat('bn-BD', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Dhaka',
  }).format(new Date());



  const tickerProducts = products.length > 0 ? [...products, ...products] : [];



  return (
    <html lang="bn" className={hindSiliguri.variable}>
      <body>
        {/* 
            Header
        */}

        <header className="site-header">
          {/* Navbar */}
          <Navbar categories={categories} banglaDate={banglaDate} />

          {/* 
              Live Price Ticker
          */}

          <div className="ticker-placeholder" aria-label="আজকের বাজারদর">
            {/* Ticker Label */}
            <span className="ticker-label">
              <span className="ticker-live-dot" aria-hidden="true" />
              আজকের বাজার
            </span>

            {/* Ticker Window */}
            <div className="ticker-window">
              {products.length > 0 ? (
                <div className="ticker-track">
                  {tickerProducts.map((product, index) => (
                    <PriceTickerItem
                      key={`${product.id ?? product.nameBn}-${index}`}
                      product={product}
                    />
                  ))}
                </div>
              ) : (
                <div className="ticker-empty">
                  বাজারদরের তথ্য এখন পাওয়া যাচ্ছে না।
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 
            Main Content
        */}

        <main id="main-content">{children}</main>

        {/* 
            Footer
      */}

        <footer className="site-footer">
          <div className="footer-container">
            {/* Footer Brand */}
            <Link href="/" className="footer-brand">
              <strong>বাজার দর</strong>

              <span>প্রয়োজনীয় পণ্যের দাম এক নজরে।</span>
            </Link>

            {/* Disclaimer */}
            <p className="footer-disclaimer">
              সকল দাম সম্ভাব্য; বাজার অবস্থার ওপর নির্ভর করে পরিবর্তিত হয়।
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
