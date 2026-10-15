
'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';
import { authClient } from '@/lib/auth-client';
import styles from './Navbar.module.css';

export default function Navbar({
  categories = [],
  banglaDate = '',
}) {
  const pathname = usePathname();
  const router = useRouter();
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);

  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  
  useEffect(() => {
    setOpen(false);
  }, [pathname]);


  useEffect(() => {
    function handleClick(e) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  // Sign out
  async function handleSignOut() {
    setOpen(false);

    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          toast.success('সাইন আউট হয়েছে।');
          router.push('/');
          router.refresh();
        },
        onError: () => {
          toast.error('সাইন আউট করা যায়নি।');
        },
      },
    });
  }

  const links = [
    {
      id: 'all',
      nameBn: 'সব পণ্য',
      icon: '🛒',
      href: '/#সব-পণ্য',
    },
    ...categories.map((category) => ({
      id: category.slug,
      nameBn: category.nameBn,
      icon: category.icon || '📦',
      href: `/category/${category.slug}`,
    })),
  ];

  const isActive = (link) => {
    if (link.id === 'all') {
      return pathname === '/';
    }

    return (
      pathname === link.href ||
      pathname.startsWith(`${link.href}/`)
    );
  };

  return (
    <div className="nav-container">
      <Toaster position="top-center" />

      {/* Main Navbar */}
      <div className="nav-main">
        {/* Logo */}
        <Link
          href="/"
          className="brand"
          aria-label="বাজার দর হোম পেজ"
        >
          <span className="brand-icon">
            <Image
              src="/logo-icon.png"
              alt="বাজার দর লোগো"
              width={48}
              height={48}
              priority
              className="brand-logo"
            />
          </span>

          <span className="brand-text">
            <strong>বাজার দর</strong>
            <small>{banglaDate}</small>
          </span>
        </Link>

        {/* Authentication */}
        <div className="nav-auth">
          {isPending ? (
            <span
              className={styles.skeleton}
              aria-hidden="true"
            />
          ) : user ? (
            <div className={styles.wrap} ref={menuRef}>
              <button
                type="button"
                className={styles.avatarBtn}
                onClick={() => setOpen((prev) => !prev)}
                aria-expanded={open}
                aria-haspopup="menu"
                aria-label="প্রোফাইল মেনু"
              >
                <span className={styles.avatar}>
                  {user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={user.image}
                      alt={user.name || 'প্রোফাইল'}
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    (user.name || 'U')
                      .charAt(0)
                      .toUpperCase()
                  )}
                </span>

                <span className={styles.name}>
                  {user.name || 'প্রোফাইল'}
                </span>

                <span aria-hidden="true">▾</span>
              </button>

              {open && (
                <div className={styles.menu} role="menu">
                  <div className={styles.menuHead}>
                    <strong>
                      {user.name || 'ব্যবহারকারী'}
                    </strong>

                    <span>{user.email}</span>
                  </div>

                  <Link
                    href="/profile"
                    className={styles.item}
                    role="menuitem"
                    onClick={() => setOpen(false)}
                  >
                    👤 আমার প্রোফাইল
                  </Link>

                  <button
                    type="button"
                    className={`${styles.item} ${styles.danger}`}
                    onClick={handleSignOut}
                    role="menuitem"
                  >
                    🚪 সাইন আউট
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/signin" className="btn-login">
                সাইন ইন
              </Link>

              <Link href="/signup" className="btn-signup">
                সাইন আপ
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Category Navigation */}
      <nav
        className="category-nav"
        aria-label="পণ্যের বিভাগ"
      >
        {links.map((link) => {
          const active = isActive(link);

          return (
            <Link
              key={link.id}
              href={link.href}
              className={`category-link ${
                active ? 'active' : ''
              }`}
              aria-current={active ? 'page' : undefined}
            >
              <span aria-hidden="true">{link.icon}</span>
              <span>{link.nameBn}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
