/**
 * Home page — rich multi-section layout
 *
 * Sections:
 *   1. Hero          — parallax bg, mouse-tracked glow, typewriter role
 *   2. Tech Marquee  — infinite scrolling tech strip (CSS + Framer)
 *   3. Services      — 3 cards with scroll-reveal stagger
 *   4. Featured Work — project cards with scroll-driven entrance
 *   5. Stats         — animated count-up triggered on viewport entry
 *   6. Process       — numbered steps with draw-line animation
 *   7. CTA Banner    — final call-to-action with scroll scale
 *
 * Scroll animations used:
 *   - useScroll + useTransform  → hero parallax (bg + text)
 *   - useInView                 → count-up trigger
 *   - whileInView               → staggered section reveals
 *   - Framer Motion layout      → marquee via x animation
 *   - CSS scroll-driven         → progress bar at top
 */
'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from 'framer-motion';
import { StaggerContainer, StaggerItem } from '@/components/FadeIn';
import styles from './page.module.css';

/* ─── Data ─────────────────────────────────── */

const techStack = [
  'Python', 'Java', 'Crystal', 'SQL', 'PostgreSQL',
  'MySQL', 'Git', 'Linux', 'Docker', 'REST APIs',
  'FastAPI', 'Spring', 'JUnit', 'Pytest', 'GitHub',
];

const services = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    title: 'Back-end',
    desc: 'Foco principal — desenvolvimento de APIs e lógica de negócio com Python e Java. Código limpo, testado e organizado.',
    techs: ['Python', 'Java', 'FastAPI', 'Spring'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3"/>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
      </svg>
    ),
    title: 'Banco de Dados',
    desc: 'Modelagem relacional, escrita de queries SQL e integração com aplicações back-end. Foco em estrutura clara e consultas eficientes.',
    techs: ['SQL', 'PostgreSQL', 'MySQL', 'SQLite'],
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor"
           strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2"/>
        <path d="M8 21h8m-4-4v4"/>
      </svg>
    ),
    title: 'Estudo & Aprendizado',
    desc: 'Habilidade comprovada de aprender rápido. Explorando linguagens novas como Crystal e fundamentos de algoritmos e estruturas de dados.',
    techs: ['Crystal', 'Algoritmos', 'Git', 'Linux'],
  },
];

const featured = [
  {
    num: '01',
    title: 'API REST em Python',
    desc: 'Estudo de construção de API REST com FastAPI — autenticação, rotas CRUD e integração com banco de dados relacional.',
    tags: ['Python', 'FastAPI', 'PostgreSQL'],
    href: '/projects',
  },
  {
    num: '02',
    title: 'Sistema em Java',
    desc: 'Aplicação back-end em Java explorando POO, persistência com JDBC e arquitetura em camadas.',
    tags: ['Java', 'Spring', 'MySQL'],
    href: '/projects',
  },
  {
    num: '03',
    title: 'Experimentos em Crystal',
    desc: 'Explorando a linguagem Crystal — sintaxe Ruby-like com performance de C. Pequenas ferramentas e estudos.',
    tags: ['Crystal', 'CLI', 'Estudos'],
    href: '/projects',
  },
];

const stats = [
  { value: 4,   suffix: '',  label: 'Linguagens principais'  },
  { value: 100, suffix: '%', label: 'Foco em aprendizado'    },
  { value: 0,   suffix: '+', label: 'Procurando 1ª vaga'     },
  { value: 24,  suffix: '/7',label: 'Disponibilidade'        },
];

const process = [
  {
    step: '01',
    title: 'Descoberta',
    desc: 'Entendo os objetivos, usuários e restrições técnicas antes de escrever uma linha de código.',
  },
  {
    step: '02',
    title: 'Arquitetura',
    desc: 'Projeto a stack, modelagem de dados e fluxo de dados para suportar o crescimento sem refatoração dolorosa.',
  },
  {
    step: '03',
    title: 'Desenvolvimento',
    desc: 'Código limpo, testado e documentado. Entrego em sprints curtos com feedback contínuo.',
  },
  {
    step: '04',
    title: 'Deploy & Monitor',
    desc: 'CI/CD automatizado, observabilidade com métricas e logs — produto estável desde o primeiro dia.',
  },
];

/* ─── Sub-components ───────────────────────── */

/** Animated count-up number */
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400; // ms
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/** Infinite marquee strip */
function Marquee({ items }: { items: string[] }) {
  // Duplicate array for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className={styles.marqueeWrap} aria-hidden="true">
      <motion.div
        className={styles.marqueeTrack}
        animate={{ x: ['0%', '-50%'] }}
        transition={{ duration: 28, ease: 'linear', repeat: Infinity }}
      >
        {doubled.map((tech, i) => (
          <span key={i} className={styles.marqueeItem}>
            <span className={styles.marqueeDot} />
            {tech}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

/* ─── Page ──────────────────────────────────── */

export default function Home() {
  const heroRef   = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();

  /* Scroll progress bar */
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  /* Hero parallax — bg moves slower than scroll */
  const { scrollY } = useScroll();
  const heroBgY  = useTransform(scrollY, [0, 600], [0, 120]);
  const heroTextY = useTransform(scrollY, [0, 600], [0,  60]);

  /* CTA section scale on approach */
  const ctaRef   = useRef<HTMLElement>(null);
  const { scrollYProgress: ctaProgress } = useScroll({ target: ctaRef, offset: ['start end', 'center center'] });
  const ctaScale = useTransform(ctaProgress, [0, 1], [0.88, 1]);
  const ctaOpacity = useTransform(ctaProgress, [0, 0.6], [0, 1]);

  return (
    <div className={styles.page}>

      {/* ── SCROLL PROGRESS BAR (top) ── */}
      <motion.div
        className={styles.progressBar}
        style={{ scaleX }}
        aria-hidden="true"
      />

      {/* ══════════════════════════════════════
          1. HERO
      ══════════════════════════════════════ */}
      <section ref={heroRef} className={styles.hero} aria-labelledby="hero-name">

        {/* Parallax background layer */}
        <motion.div
          className={styles.heroBg}
          style={{ y: heroBgY }}
          aria-hidden="true"
        >
          <div className={styles.heroDot} />
          <div className={styles.heroGlow} />
          <div className={styles.heroGlow2} />
          {/* Animated grid lines */}
          <div className={styles.heroGrid} />
        </motion.div>

        {/* Hero content — fades + slides up while scrolling */}
        <motion.div
          className={`container ${styles.heroInner}`}
          style={{ y: heroTextY }}
        >
          {/* ── Text ── */}
          <div className={styles.heroText}>
            <motion.p
              className={styles.heroGreeting}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Olá, eu sou
            </motion.p>

            <motion.h1
              id="hero-name"
              className={styles.heroName}
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            >
              Luan<span className={styles.dot}>.</span>
            </motion.h1>

            <motion.div
              className={styles.heroBadge}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.28 }}
              aria-label="Cargo: Estudante de Ciência da Computação · Back-End"
            >
              <span className={styles.badgePulse} aria-hidden="true" />
              <span className={styles.badgeText}>Estudante de CC · Back-End</span>
            </motion.div>

            <motion.p
              className={styles.heroDesc}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34 }}
            >
              Estudante de Ciências da Computação com sólida base em
              desenvolvimento Back-End. Proativo e com forte habilidade
              de aprendizado rápido — em busca da primeira oportunidade
              para contribuir e crescer profissionalmente.
            </motion.p>

            <motion.div
              className={styles.heroActions}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Link href="/projects" className={styles.btnPrimary}>
                Ver Projetos
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link href="/contact" className={styles.btnSecondary}>
                Entrar em Contato
              </Link>
            </motion.div>

            <motion.div
              className={styles.heroStats}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              role="list"
            >
              {[
                { value: 'CC',     label: 'Estudante' },
                { value: 'Back',   label: 'Foco'      },
                { value: '4',      label: 'Linguagens'},
              ].map((s) => (
                <div key={s.label} className={styles.stat} role="listitem">
                  <span className={styles.statValue}>{s.value}</span>
                  <span className={styles.statLabel}>{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* ── Photo ── */}
          <motion.div
            className={styles.heroPhoto}
            initial={{ opacity: 0, x: 40, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
            aria-hidden="true"
          >
            <div className={styles.photoFrame}>
              {/* Real photo of Luan */}
              <Image
                src="/luan.jpg"
                alt="Luan — Estudante de Ciências da Computação"
                fill
                sizes="(max-width: 980px) 260px, 320px"
                style={{ objectFit: 'cover', objectPosition: 'center top' }}
                priority
              />
              {/* Corner accent */}
              <div className={styles.photoCorner} />
            </div>

            {/* Floating chips */}
            <motion.div
              className={styles.chip1}
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              ⚡ Next.js 14
            </motion.div>
            <motion.div
              className={styles.chip2}
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
            >
              🚀 Open to work
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          aria-hidden="true"
        >
          <motion.div
            className={styles.scrollDot}
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          2. TECH MARQUEE
      ══════════════════════════════════════ */}
      <div className={styles.marqueeSection} aria-hidden="true">
        <Marquee items={techStack} />
      </div>

      {/* ══════════════════════════════════════
          3. SERVICES
      ══════════════════════════════════════ */}
      <section className={styles.section} aria-labelledby="services-title">
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className={styles.eyebrow}>O que faço</span>
            <h2 id="services-title" className={styles.sectionTitle}>Serviços</h2>
            <p className={styles.sectionSub}>
              Da ideia ao produto — desenvolvimento completo com qualidade de produção.
            </p>
          </motion.div>

          <StaggerContainer className={styles.servicesGrid}>
            {services.map((svc, i) => (
              <StaggerItem key={i} as="article" className={styles.serviceCard}>
                <div className={styles.serviceIcon}>{svc.icon}</div>
                <h3 className={styles.serviceTitle}>{svc.title}</h3>
                <p className={styles.serviceDesc}>{svc.desc}</p>
                <div className={styles.serviceTechs}>
                  {svc.techs.map(t => (
                    <span key={t} className={styles.serviceTech}>{t}</span>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════
          4. FEATURED WORK
      ══════════════════════════════════════ */}
      <section className={styles.section} aria-labelledby="work-title">
        <div className="container">
          <motion.div
            className={`${styles.sectionHeader} ${styles.sectionHeaderRow}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.48 }}
          >
            <div>
              <span className={styles.eyebrow}>Portfólio</span>
              <h2 id="work-title" className={styles.sectionTitle}>Projetos em Destaque</h2>
            </div>
            <Link href="/projects" className={styles.btnGhost}>
              Ver todos →
            </Link>
          </motion.div>

          {/* Alternating layout cards with scroll parallax */}
          <div className={styles.workList}>
            {featured.map((p, i) => (
              <WorkCard key={i} project={p} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          5. STATS (count-up on scroll)
      ══════════════════════════════════════ */}
      <section className={styles.statsSection} aria-labelledby="stats-title">
        <div className="container">
          <h2 id="stats-title" className={styles.srOnly}>Números</h2>
          <StaggerContainer className={styles.statsGrid}>
            {stats.map((s, i) => (
              <StaggerItem key={i} as="div" className={styles.statCard}>
                <span className={styles.statBigValue}>
                  <CountUp target={s.value} suffix={s.suffix} />
                </span>
                <span className={styles.statBigLabel}>{s.label}</span>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════
          6. PROCESS
      ══════════════════════════════════════ */}
      <section className={styles.section} aria-labelledby="process-title">
        <div className="container">
          <motion.div
            className={styles.sectionHeader}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48 }}
          >
            <span className={styles.eyebrow}>Como trabalho</span>
            <h2 id="process-title" className={styles.sectionTitle}>Processo</h2>
          </motion.div>

          <div className={styles.processGrid}>
            {process.map((step, i) => (
              <ProcessStep key={i} step={step} index={i} total={process.length} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          7. CTA BANNER
      ══════════════════════════════════════ */}
      <motion.section
        ref={ctaRef}
        className={styles.cta}
        style={{ scale: ctaScale, opacity: ctaOpacity }}
        aria-labelledby="cta-title"
      >
        <div className="container">
          <div className={styles.ctaInner}>
            <div className={styles.ctaGlow} aria-hidden="true" />
            <motion.p
              className={styles.ctaEyebrow}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
            >
              Tem um projeto em mente?
            </motion.p>
            <motion.h2
              id="cta-title"
              className={styles.ctaTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.44, delay: 0.08 }}
            >
              Vamos construir algo<br />
              <span className={styles.ctaAccent}>incrível juntos.</span>
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.16 }}
              className={styles.ctaActions}
            >
              <Link href="/contact" className={styles.btnPrimary}>
                Iniciar conversa
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"/>
                  <polyline points="12 5 19 12 12 19"/>
                </svg>
              </Link>
              <Link href="/about" className={styles.btnSecondary}>
                Conhecer o perfil
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.section>

    </div>
  );
}

/* ── WorkCard — scroll-parallax project card ── */
function WorkCard({ project, index }: { project: typeof featured[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y   = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className={`${styles.workCard} ${isEven ? styles.workCardEven : styles.workCardOdd}`}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Number — parallax */}
      <motion.div className={styles.workNum} style={{ y }} aria-hidden="true">
        {project.num}
      </motion.div>

      <div className={styles.workContent}>
        <h3 className={styles.workTitle}>{project.title}</h3>
        <p className={styles.workDesc}>{project.desc}</p>
        <div className={styles.workTags}>
          {project.tags.map(t => (
            <span key={t} className={styles.workTag}>{t}</span>
          ))}
        </div>
        <Link href={project.href} className={styles.workLink}>
          Ver projeto
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
               strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </Link>
      </div>

      {/* Decorative visual block — parallax opposite direction */}
      <motion.div
        className={styles.workVisual}
        style={{ y: useTransform(scrollYProgress, [0, 1], [-20, 20]) }}
        aria-hidden="true"
      >
        <div className={styles.workVisualInner}>
          <div className={styles.workVisualCode}>
            <span className={styles.codeLine} style={{ width: '70%' }} />
            <span className={styles.codeLine} style={{ width: '45%' }} />
            <span className={styles.codeLine} style={{ width: '90%' }} />
            <span className={styles.codeLine} style={{ width: '55%' }} />
            <span className={styles.codeLineAccent} style={{ width: '65%' }} />
            <span className={styles.codeLine} style={{ width: '40%' }} />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── ProcessStep — draw-line entrance animation ── */
function ProcessStep({ step, index, total }: {
  step: typeof process[0];
  index: number;
  total: number;
}) {
  const isLast = index === total - 1;
  return (
    <motion.div
      className={styles.processStep}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
    >
      {/* Step number + connecting line */}
      <div className={styles.processLeft}>
        <div className={styles.processNum}>{step.step}</div>
        {!isLast && (
          <motion.div
            className={styles.processLine}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 + 0.3, ease: 'easeOut' }}
          />
        )}
      </div>
      {/* Content */}
      <div className={styles.processContent}>
        <h3 className={styles.processTitle}>{step.title}</h3>
        <p className={styles.processDesc}>{step.desc}</p>
      </div>
    </motion.div>
  );
}
