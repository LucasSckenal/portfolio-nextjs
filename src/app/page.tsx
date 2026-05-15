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
"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useInView,
  AnimatePresence,
} from "framer-motion";
import { StaggerContainer, StaggerItem } from "@/components/FadeIn";
import styles from "./page.module.css";
import HeroScene from "@/components/HeroScene";

/* ─── Data ─────────────────────────────────── */

const techStack = [
  "Python",
  "Java",
  "Crystal",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "Git",
  "Linux",
  "Docker",
  "REST APIs",
  "FastAPI",
  "Spring",
  "JUnit",
  "Pytest",
  "GitHub",
];

const services = [
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Back-end",
    desc: "Foco principal — desenvolvimento de APIs e lógica de negócio com Python e Java. Código limpo, testado e organizado.",
    techs: ["Python", "Java", "FastAPI", "Spring"],
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
      </svg>
    ),
    title: "Banco de Dados",
    desc: "Modelagem relacional, escrita de queries SQL e integração com aplicações back-end. Foco em estrutura clara e consultas eficientes.",
    techs: ["SQL", "PostgreSQL", "MySQL", "SQLite"],
  },
  {
    icon: (
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M8 21h8m-4-4v4" />
      </svg>
    ),
    title: "Estudo & Aprendizado",
    desc: "Habilidade comprovada de aprender rápido. Explorando linguagens novas como Crystal e fundamentos de algoritmos e estruturas de dados.",
    techs: ["Crystal", "Algoritmos", "Git", "Linux"],
  },
];

const featured = [
  {
    num: "01",
    title: "API REST em Python",
    desc: "Estudo de construção de API REST com FastAPI — autenticação, rotas CRUD e integração com banco de dados relacional.",
    tags: ["Python", "FastAPI", "PostgreSQL"],
    href: "/projects",
  },
  {
    num: "02",
    title: "Sistema em Java",
    desc: "Aplicação back-end em Java explorando POO, persistência com JDBC e arquitetura em camadas.",
    tags: ["Java", "Spring", "MySQL"],
    href: "/projects",
  },
  {
    num: "03",
    title: "Experimentos em Crystal",
    desc: "Explorando a linguagem Crystal — sintaxe Ruby-like com performance de C. Pequenas ferramentas e estudos.",
    tags: ["Crystal", "CLI", "Estudos"],
    href: "/projects",
  },
];

const stats = [
  { value: 4, suffix: "", label: "Linguagens principais" },
  { value: 100, suffix: "%", label: "Foco em aprendizado" },
  { value: 0, suffix: "+", label: "Procurando 1ª vaga" },
  { value: 24, suffix: "/7", label: "Disponibilidade" },
];

const serviceHighlights = [
  {
    icon: services[0].icon,
    title: "Back-end",
    desc: "Construção de APIs, regras de negócio e integrações com foco em clareza, validação e manutenção.",
    techs: ["Python", "Java", "FastAPI", "Spring"],
  },
  {
    icon: services[1].icon,
    title: "Banco de Dados",
    desc: "Modelagem relacional, consultas SQL e integração com aplicações pensando em consistência e leitura do domínio.",
    techs: ["SQL", "PostgreSQL", "MySQL", "SQLite"],
  },
  {
    icon: services[2].icon,
    title: "Infra & Qualidade",
    desc: "Uso de Git, Linux, Docker e testes para aproximar projetos de um fluxo real de desenvolvimento.",
    techs: ["Docker", "Git", "Linux", "Pytest"],
  },
];

const featuredProjects = [
  {
    num: "01",
    title: "API REST em Python",
    status: "API study",
    desc: "API com autenticação, rotas CRUD e persistência relacional, construída para praticar contratos HTTP claros e separação de responsabilidades.",
    tags: ["Python", "FastAPI", "PostgreSQL", "JWT"],
    proof: ["Auth e validação", "Camada de serviços", "Queries relacionais"],
    metrics: [
      { label: "Rotas", value: "REST" },
      { label: "Banco", value: "SQL" },
    ],
    visual: ["POST /auth/login 200", "GET /users/{id} 304", "SELECT profile 12ms"],
    href: "/projects",
  },
  {
    num: "02",
    title: "Sistema em Java",
    status: "Layered app",
    desc: "Aplicação back-end em Java explorando POO, persistência e arquitetura em camadas para organizar domínio, repositórios e regras.",
    tags: ["Java", "Spring", "MySQL", "JUnit"],
    proof: ["Arquitetura em camadas", "Persistência JDBC", "Testes unitários"],
    metrics: [
      { label: "Design", value: "OO" },
      { label: "Testes", value: "JUnit" },
    ],
    visual: ["service.validate()", "repository.save(entity)", "assert status == 201"],
    href: "/projects",
  },
  {
    num: "03",
    title: "Experimentos em Crystal",
    status: "Language lab",
    desc: "Pequenas ferramentas e estudos para entender sintaxe, compilação e performance, ampliando repertório técnico além da stack principal.",
    tags: ["Crystal", "CLI", "Linux", "Estudos"],
    proof: ["Ferramentas CLI", "Manipulação de arquivos", "Base de algoritmos"],
    metrics: [
      { label: "Modo", value: "CLI" },
      { label: "Foco", value: "Core" },
    ],
    visual: ["crystal build tool.cr", "./bin/parser input.txt", "elapsed 8ms"],
    href: "/projects",
  },
];

const backendSystems = [
  {
    label: "API Design",
    metric: "REST",
    desc: "Rotas previsíveis, validação de entrada e respostas legíveis para consumo front-end.",
  },
  {
    label: "Database Modeling",
    metric: "SQL",
    desc: "Entidades, relações e consultas pensadas para representar o domínio com consistência.",
  },
  {
    label: "Auth & Security",
    metric: "JWT",
    desc: "Fluxos de autenticação, autorização básica e cuidado com contratos protegidos.",
  },
  {
    label: "Testing",
    metric: "JUnit",
    desc: "Testes unitários e cenários principais para reduzir regressões em lógica de negócio.",
  },
  {
    label: "Infra",
    metric: "Docker",
    desc: "Ambientes reproduzíveis, Git e Linux para um fluxo de desenvolvimento mais próximo do real.",
  },
  {
    label: "Observability",
    metric: "Logs",
    desc: "Leitura de logs, métricas e traces como parte da rotina de depuração e melhoria.",
  },
];

const credibilityStats = [
  { value: 4, suffix: "", label: "Linguagens principais" },
  { value: 3, suffix: "+", label: "Projetos em evolução" },
  { value: 2, suffix: "", label: "Stacks back-end" },
  { value: 24, suffix: "/7", label: "Aprendizado contínuo" },
];

const process = [
  {
    step: "01",
    title: "Descoberta",
    desc: "Entendo os objetivos, usuários e restrições técnicas antes de escrever uma linha de código.",
  },
  {
    step: "02",
    title: "Arquitetura",
    desc: "Projeto a stack, modelagem de dados e fluxo de dados para suportar o crescimento sem refatoração dolorosa.",
  },
  {
    step: "03",
    title: "Desenvolvimento",
    desc: "Código limpo, testado e documentado. Entrego em sprints curtos com feedback contínuo.",
  },
  {
    step: "04",
    title: "Deploy & Monitor",
    desc: "CI/CD automatizado, observabilidade com métricas e logs — produto estável desde o primeiro dia.",
  },
];

/* ─── Sub-components ───────────────────────── */

/** Animated count-up number */
function CountUp({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 1400; // ms
    const step = 16;
    const increment = target / (duration / step);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else setCount(Math.floor(start));
    }, step);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/** Infinite marquee strip */
function Marquee({ items }: { items: string[] }) {
  // Duplicate array for seamless loop
  const doubled = [...items, ...items];
  return (
    <div className={styles.marqueeWrap} aria-hidden="true">
      <motion.div
        className={styles.marqueeTrack}
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, ease: "linear", repeat: Infinity }}
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
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll();

  /* Scroll progress bar */
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  /* Hero parallax — bg moves slower than scroll */
  const { scrollY } = useScroll();
  const heroBgY = useTransform(scrollY, [0, 600], [0, 120]);
  const heroTextY = useTransform(scrollY, [0, 600], [0, 60]);

  /* CTA section scale on approach */
  const ctaRef = useRef<HTMLElement>(null);
  const { scrollYProgress: ctaProgress } = useScroll({
    target: ctaRef,
    offset: ["start end", "center center"],
  });
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
      <section
        ref={heroRef}
        className={styles.hero}
        aria-labelledby="hero-name"
      >
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

        <div className={styles.heroSystemBg} aria-hidden="true">
          <HeroScene />
        </div>

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
              transition={{
                duration: 0.55,
                delay: 0.18,
                ease: [0.16, 1, 0.3, 1],
              }}
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
              <span className={styles.badgeText}>
                Back-end Developer · APIs · SQL · Docker
              </span>
            </motion.div>

            <motion.p
              className={styles.heroDesc}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.34 }}
            >
              Estudante de Ciência da Computação focado em APIs, bancos de
              dados e sistemas confiáveis. Construo projetos práticos com
              fundamentos sólidos, código organizado e atenção a qualidade.
            </motion.p>

            <motion.div
              className={styles.heroActions}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Link href="/projects" className={styles.btnPrimary}>
                Ver Projetos
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
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
                { value: "CC", label: "Estudante" },
                { value: "API", label: "Back-end" },
                { value: "SQL", label: "Dados" },
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
              <Image
                src="/luan.jpg"
                alt="Luan — Estudante de Ciências da Computação"
                className={styles.photoImg}
                fill
                sizes="(max-width: 980px) 260px, 320px"
                style={{
                  objectFit: "cover",
                  objectPosition: "center top",
                  zIndex: 3,
                }}
                priority
              />
              {/* Corner accent */}
              <div className={styles.photoCorner} />
            </div>

            {/* Floating chips */}
            <motion.div
              className={styles.chip1}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 3.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              ⚡ Next.js 14
            </motion.div>
            <motion.div
              className={styles.chip2}
              animate={{ y: [0, 6, 0] }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1,
              }}
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
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
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
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.48, ease: [0.4, 0, 0.2, 1] }}
          >
            <span className={styles.eyebrow}>O que faço</span>
            <h2 id="services-title" className={styles.sectionTitle}>
              Especialidades
            </h2>
            <p className={styles.sectionSub}>
              Back-end com base em fundamentos, organização de código e leitura
              clara do problema.
            </p>
          </motion.div>

          <StaggerContainer className={styles.servicesGrid}>
            {serviceHighlights.map((svc, i) => (
              <StaggerItem key={i} as="article" className={styles.serviceCard}>
                <div className={styles.serviceIcon}>{svc.icon}</div>
                <h3 className={styles.serviceTitle}>{svc.title}</h3>
                <p className={styles.serviceDesc}>{svc.desc}</p>
                <div className={styles.serviceTechs}>
                  {svc.techs.map((t) => (
                    <span key={t} className={styles.serviceTech}>
                      {t}
                    </span>
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <section className={styles.systemSection} aria-labelledby="system-title">
        <div className="container">
          <motion.div
            className={`${styles.sectionHeader} ${styles.systemHeader}`}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.48 }}
          >
            <div>
              <span className={styles.eyebrow}>Backend system</span>
              <h2 id="system-title" className={styles.sectionTitle}>
                O que eu busco dominar na prática
              </h2>
            </div>
            <p className={styles.systemIntro}>
              Um mapa técnico do meu foco: construir APIs úteis, entender dados,
              testar comportamento e operar o sistema com mais previsibilidade.
            </p>
          </motion.div>

          <StaggerContainer className={styles.systemGrid}>
            {backendSystems.map((item) => (
              <StaggerItem key={item.label} as="article" className={styles.systemCard}>
                <div className={styles.systemCardTop}>
                  <span className={styles.systemMetric}>{item.metric}</span>
                  <span className={styles.systemDot} />
                </div>
                <h3 className={styles.systemTitle}>{item.label}</h3>
                <p className={styles.systemDesc}>{item.desc}</p>
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
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.48 }}
          >
            <div>
              <span className={styles.eyebrow}>Portfólio</span>
              <h2 id="work-title" className={styles.sectionTitle}>
                Projetos com prova técnica
              </h2>
            </div>
            <Link href="/projects" className={styles.btnGhost}>
              Ver todos →
            </Link>
          </motion.div>

          {/* Alternating layout cards with scroll parallax */}
          <div className={styles.workList}>
            {featuredProjects.map((p, i) => (
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
          <h2 id="stats-title" className={styles.srOnly}>
            Números
          </h2>
          <StaggerContainer className={styles.statsGrid}>
            {credibilityStats.map((s, i) => (
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
            <h2 id="process-title" className={styles.sectionTitle}>
              Processo
            </h2>
          </motion.div>

          <div className={styles.processGrid}>
            {process.map((step, i) => (
              <ProcessStep
                key={i}
                step={step}
                index={i}
                total={process.length}
              />
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
              Vamos construir algo
              <br />
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
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
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
function WorkCard({
  project,
  index,
}: {
  project: (typeof featuredProjects)[0];
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const isEven = index % 2 === 0;

  return (
    <motion.div
      ref={ref}
      className={`${styles.workCard} ${isEven ? styles.workCardEven : styles.workCardOdd}`}
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.56, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Number — parallax */}
      <motion.div className={styles.workNum} style={{ y }} aria-hidden="true">
        {project.num}
      </motion.div>

      <div className={styles.workContent}>
        <h3 className={styles.workTitle}>{project.title}</h3>
        <span className={styles.workStatus}>{project.status}</span>
        <p className={styles.workDesc}>{project.desc}</p>
        <div className={styles.workProof} role="list">
          {project.proof.map((item) => (
            <span key={item} className={styles.workProofItem} role="listitem">
              {item}
            </span>
          ))}
        </div>
        <div className={styles.workTags}>
          {project.tags.map((t) => (
            <span key={t} className={styles.workTag}>
              {t}
            </span>
          ))}
        </div>
        <Link href={project.href} className={styles.workLink}>
          Ver projeto
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
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
          <div className={styles.workVisualHeader}>
            {project.metrics.map((metric) => (
              <div key={metric.label} className={styles.workMetric}>
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
          <div className={styles.workVisualCode}>
            {project.visual.map((line, i) => (
              <span
                key={line}
                className={i === 1 ? styles.codeLineAccent : styles.codeLine}
              >
                {line}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── ProcessStep — draw-line entrance animation ── */
function ProcessStep({
  step,
  index,
  total,
}: {
  step: (typeof process)[0];
  index: number;
  total: number;
}) {
  const isLast = index === total - 1;
  return (
    <motion.div
      className={styles.processStep}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.45,
        delay: index * 0.1,
        ease: [0.4, 0, 0.2, 1],
      }}
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
            transition={{
              duration: 0.5,
              delay: index * 0.1 + 0.3,
              ease: "easeOut",
            }}
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
