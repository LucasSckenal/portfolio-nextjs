'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './Breadcrumb.module.css';

interface Crumb { label: string; href?: string; }

export default function Breadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <motion.nav
      className={styles.breadcrumb}
      aria-label="Breadcrumb"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
    >
      <ol className={styles.list}>
        {crumbs.map((crumb, i) => (
          <li key={i} className={styles.item}>
            {i > 0 && <span className={styles.sep} aria-hidden="true">/</span>}
            {crumb.href ? (
              <Link href={crumb.href} className={styles.link}>{crumb.label}</Link>
            ) : (
              <span className={styles.current} aria-current="page">{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </motion.nav>
  );
}
