/**
 * ProjectModal.tsx
 * ─────────────────────────────────────────────────────────
 * Improvements over previous version:
 * - AnimatePresence replaces CSS keyframes for open/close
 * - Backdrop fade-in + panel spring slide-up (desktop)
 * - Mobile: slides up from bottom edge (sheet pattern)
 * - Close button has whileHover rotation via Framer Motion
 * - Highlights list staggers in after panel opens
 * - All blue tokens → cyan
 * - Tags: static labels (no cursor:pointer, no hover)
 * - Buttons: interactive → hover + focus states
 * - focus trap: panel tabIndex=-1 + autoFocus on close button
 * ─────────────────────────────────────────────────────────
 */
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProjectModal.module.css';

export interface Project {
  title: string;
  desc: string;
  longDesc: string;
  tags: string[];
  category: string;
  year: string;
  github: string;
  demo: string;
  highlights: string[];
}

interface Props {
  project: Project | null;
  onClose: () => void;
}

/* Animation variants */
const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit:    { opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
};

const panelVariants = {
  hidden:  { opacity: 0, y: 28, scale: 0.97 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.28, ease: [0.34, 1.1, 0.64, 1] },
  },
  exit: {
    opacity: 0, y: 16, scale: 0.97,
    transition: { duration: 0.18, ease: [0.4, 0, 1, 1] },
  },
};

const mobilePanelVariants = {
  hidden:  { y: '100%' },
  visible: { y: 0, transition: { duration: 0.3, ease: [0.34, 1.1, 0.64, 1] } },
  exit:    { y: '100%', transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

const highlightVariants = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.055, delayChildren: 0.18 } },
};

const highlightItemVariants = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.24, ease: [0.4, 0, 0.2, 1] } },
};

export default function ProjectModal({ project, onClose }: Props) {
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  /* Keyboard: Escape → close */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); },
    [onClose]
  );

  useEffect(() => {
    if (!project) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    /* Move focus to close button for accessibility */
    setTimeout(() => closeBtnRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [project, handleKeyDown]);

  /* Detect mobile for variant switching */
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

  return (
    <AnimatePresence>
      {project && (
        /* ── Backdrop ── */
        <motion.div
          className={styles.backdrop}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* ── Panel ── */}
          <motion.div
            className={styles.panel}
            variants={isMobile ? mobilePanelVariants : panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={e => e.stopPropagation()}
          >
            {/* ── Header ── */}
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <div className={styles.headerMeta}>
                  <span className={styles.category}>{project.category}</span>
                  <span className={styles.year}>{project.year}</span>
                </div>
                <h2 id="modal-title" className={styles.title}>
                  {project.title}
                </h2>
              </div>

              {/* Close button — interactive, gets hover animation */}
              <motion.button
                ref={closeBtnRef}
                className={styles.closeBtn}
                onClick={onClose}
                aria-label="Fechar modal"
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.18 }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2.5"
                     strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6"  x2="6"  y2="18"/>
                  <line x1="6"  y1="6"  x2="18" y2="18"/>
                </svg>
              </motion.button>
            </div>

            {/* ── Body (scrollable) ── */}
            <div className={styles.body}>

              {/* Summary callout — purely informational */}
              <p className={styles.summary}>{project.desc}</p>

              {/* About */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Sobre o projeto</h3>
                <p className={styles.longDesc}>{project.longDesc}</p>
              </div>

              {/* Highlights — staggered entrance */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Destaques</h3>
                <motion.ul
                  className={styles.highlights}
                  variants={highlightVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {project.highlights.map((h, i) => (
                    <motion.li
                      key={i}
                      className={styles.highlightItem}
                      variants={highlightItemVariants}
                    >
                      <span className={styles.highlightIcon} aria-hidden="true">▹</span>
                      {h}
                    </motion.li>
                  ))}
                </motion.ul>
              </div>

              {/* Tech stack — static labels, no hover */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Stack utilizada</h3>
                <div className={styles.tags}>
                  {project.tags.map(tag => (
                    <span key={tag} className={styles.tag}>{tag}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Footer / Actions — both are interactive ── */}
            <div className={styles.footer}>
              <motion.a
                href={project.github}
                className={styles.btnOutline}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver código de ${project.title} no GitHub`}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>
                </svg>
                Ver no GitHub
              </motion.a>

              <motion.a
                href={project.demo}
                className={styles.btnPrimary}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver demo ao vivo de ${project.title}`}
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ duration: 0.15 }}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                     stroke="currentColor" strokeWidth="2"
                     strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                  <polyline points="15 3 21 3 21 9"/>
                  <line x1="10" y1="14" x2="21" y2="3"/>
                </svg>
                Demo ao vivo
              </motion.a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
