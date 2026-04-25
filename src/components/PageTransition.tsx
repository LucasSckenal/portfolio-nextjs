/**
 * PageTransition.tsx — definitive fix
 * ─────────────────────────────────────────────────────────
 * PREVIOUS BUGS:
 *
 *  1. mode="wait"  → black screen
 *     AnimatePresence waits for exit to finish before mounting
 *     the new page. In App Router, React unmounts immediately,
 *     so there's a gap with no children → black screen.
 *
 *  2. AnimatePresence (any mode) → content duplication
 *     AnimatePresence keeps BOTH the old and new keyed elements
 *     in the DOM simultaneously while it decides what to do.
 *     Without an exit animation the old element lingers, stacking
 *     visually on top of (or below) the new one → duplicated content.
 *
 * DEFINITIVE FIX:
 *   Remove AnimatePresence entirely. A plain motion.div with a
 *   key prop is sufficient:
 *     - When pathname changes, React sees a new key → unmounts old
 *       motion.div, mounts new one. One element at a time, always.
 *     - The new element runs initial → animate (fade-in).
 *     - No exit animation = no gap = no duplication.
 *
 * This is the recommended pattern for Next.js App Router + Framer Motion.
 * ─────────────────────────────────────────────────────────
 */
'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <motion.div
      key={pathname}                    // key change → React unmounts old, mounts new
      initial={{ opacity: 0 }}          // start invisible
      animate={{ opacity: 1 }}          // fade in
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
    >
      {children}
    </motion.div>
  );
}
