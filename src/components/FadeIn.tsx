/**
 * FadeIn.tsx
 * ─────────────────────────────────────────────────────────
 * Lightweight wrapper for entrance animations.
 * Keeps animation logic in one place; pages import this
 * instead of duplicating motion props everywhere.
 *
 * Usage:
 *   <FadeIn>          // simple fade
 *   <FadeIn delay={0.1}>
 *   <FadeIn as="section">  // renders a <section>
 * ─────────────────────────────────────────────────────────
 */
'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ElementType } from 'react';

interface FadeInProps extends HTMLMotionProps<'div'> {
  delay?: number;
  duration?: number;
  y?: number;
  as?: ElementType;
}

export default function FadeIn({
  children,
  delay = 0,
  duration = 0.4,
  y = 18,
  as: Tag = 'div',
  ...rest
}: FadeInProps) {
  const MotionTag = motion(Tag as 'div');

  return (
    <MotionTag
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{
        duration,
        delay,
        ease: [0.4, 0, 0.2, 1],
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

/* ─────────────────────────────────────────────
   StaggerContainer — parent for staggered lists
   ───────────────────────────────────────────── */
const containerVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] as const },
  },
};

interface StaggerProps {
  children: React.ReactNode;
  className?: string;
  as?: ElementType;
}

export function StaggerContainer({ children, className, as: Tag = 'div' }: StaggerProps) {
  const MotionTag = motion(Tag as 'div');
  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-30px' }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({
  children,
  className,
  as: Tag = 'div',
  ...rest
}: StaggerProps & { [key: string]: unknown }) {
  const MotionTag = motion(Tag as 'div');
  return (
    <MotionTag className={className} variants={itemVariants} {...rest}>
      {children}
    </MotionTag>
  );
}

/* ─────────────────────────────────────────────
   PressableCard — whileHover + whileTap for
   interactive cards only (never static elements)
   ───────────────────────────────────────────── */
interface PressableProps extends HTMLMotionProps<'div'> {
  scale?: number;
}

export function PressableCard({ children, scale = 1.025, ...rest }: PressableProps) {
  return (
    <motion.div
      whileHover={{ scale, y: -3 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
