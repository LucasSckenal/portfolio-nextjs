/**
 * Header.tsx — Option A: Refined sticky top-nav
 * ─────────────────────────────────────────────
 * Decision rationale: A sidebar on a 4-page portfolio steals
 * horizontal real-estate and over-engineers a simple problem.
 * A polished pill-nav header with clear active state, availability
 * badge, and smooth scroll-shadow is the right UX at this scale.
 *
 * Changes from previous version:
 * - Cyan design tokens (no blue)
 * - Framer Motion for nav link active indicator (layout animation)
 * - Better focus states (cyan outline)
 * - Mobile menu with AnimatePresence
 * - scroll-based border/shadow (no opacity jump)
 * ─────────────────────────────────────────────
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import styles from "./Header.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close mobile menu on navigation
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
      <div className={`container ${styles.inner}`}>
        {/* ── Logo ── */}
        <Link href="/" className={styles.logo} aria-label="Home">
          <div className={styles.logoMark}>
            <span className={styles.logoText}>
              LU<span className={styles.delta}>Δ</span>N
            </span>

            <span className={styles.logoGlow}></span>
          </div>
        </Link>

        {/* ── Desktop Nav ── */}
        <nav className={styles.nav} aria-label="Navegação principal">
          <ul className={styles.navList} role="list">
            {navLinks.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <li key={href} className={styles.navItem}>
                  <Link
                    href={href}
                    className={`${styles.navLink} ${active ? styles.active : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    {label}
                    {/* Animated underline — LayoutId makes it slide between links */}
                    {active && (
                      <motion.span
                        className={styles.activeBar}
                        layoutId="activeBar"
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        aria-hidden="true"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* ── Right: Badge + CTA ── */}
        <div className={styles.right}>
          <div className={styles.badge} aria-label="Disponível para projetos">
            <span className={styles.badgeDot} aria-hidden="true" />
            <span className={styles.badgeLabel}>Disponível</span>
          </div>

          <Link href="/contact" className={styles.cta}>
            Iniciar projeto
          </Link>

          {/* ── Hamburger (mobile only) ── */}
          <button
            className={styles.hamburger}
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
          >
            <motion.span
              className={styles.bar}
              animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
            <motion.span
              className={styles.bar}
              animate={
                open ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }
              }
              transition={{ duration: 0.15 }}
            />
            <motion.span
              className={styles.bar}
              animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
              transition={{ duration: 0.2 }}
            />
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <nav aria-label="Menu mobile">
              <ul className={styles.mobileList} role="list">
                {navLinks.map(({ href, label }, i) => (
                  <motion.li
                    key={href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.2 }}
                  >
                    <Link
                      href={href}
                      className={`${styles.mobileLink} ${pathname === href ? styles.mobileLinkActive : ""}`}
                      aria-current={pathname === href ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
