/**
 * Projects page — elevated design matching Home quality
 *
 * Sections:
 *  1. Hero banner    — parallax bg, large title, scroll fade
 *  2. Filter tabs    — animated underline active filter
 *  3. Project grid   — staggered cards with whileHover/whileTap + modal
 *  4. Stats strip    — quick numbers
 *  5. CTA            — hire me strip
 */
'use client';

import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import Breadcrumb from '@/components/Breadcrumb';
import ProjectModal, { type Project } from '@/components/ProjectModal';
import styles from './page.module.css';

/* ─── Data ─────────────────────────────────── */
const projects: Project[] = [
  {
    title: 'E-Commerce Platform',
    desc: 'Plataforma completa de vendas com carrinho, checkout Stripe, painel admin e relatórios em tempo real.',
    longDesc: 'Desenvolvimento de uma plataforma de e-commerce completa do zero, cobrindo desde a vitrine de produtos até o processamento de pagamentos com Stripe. O sistema conta com gestão de estoque, painel administrativo com métricas em tempo real, e integração com sistemas de entrega.',
    tags: ['Next.js', 'Stripe', 'PostgreSQL', 'Prisma', 'TailwindCSS', 'Vercel'],
    category: 'Full Stack', year: '2024', github: '#', demo: '#',
    highlights: [
      'Checkout em 3 etapas com Stripe Elements e webhooks para confirmação de pagamento',
      'Dashboard admin com gráficos de vendas, estoque e performance em tempo real',
      'Sistema de busca com filtros avançados e paginação server-side',
      'Autenticação com NextAuth.js e roles de acesso (admin, vendedor, cliente)',
    ],
  },
  {
    title: 'Task Manager App',
    desc: 'Gerenciador de tarefas colaborativo com atualização em tempo real, drag-and-drop e notificações push.',
    longDesc: 'Aplicação de gerenciamento de tarefas focada em times de desenvolvimento. Permite criar boards no estilo Kanban, atribuir tarefas, definir prazos e colaborar em tempo real.',
    tags: ['React', 'Node.js', 'Socket.io', 'MongoDB', 'Express', 'Docker'],
    category: 'Full Stack', year: '2024', github: '#', demo: '#',
    highlights: [
      'Sincronização em tempo real com Socket.io — zero refresh necessário',
      'Drag-and-drop nativo entre colunas com persistência automática',
      'Notificações push via Web Push API e service workers',
      'Suporte offline com sincronização ao reconectar',
    ],
  },
  {
    title: 'API REST Microservices',
    desc: 'Arquitetura distribuída com autenticação JWT, rate limiting, logs centralizados e deploy automatizado.',
    longDesc: 'Projeto de arquitetura de microsserviços escalável construído para suportar alto volume de requisições. Cada serviço é independente, comunicam-se via mensageria assíncrona com RabbitMQ.',
    tags: ['Node.js', 'Docker', 'Redis', 'RabbitMQ', 'PostgreSQL', 'Prometheus'],
    category: 'Back-end', year: '2023', github: '#', demo: '#',
    highlights: [
      'Gateway unificado com autenticação JWT e rate limiting por IP/usuário',
      'Comunicação assíncrona com RabbitMQ para operações de longa duração',
      'Cache distribuído com Redis reduzindo 70% das queries ao banco',
      'Pipeline CI/CD com GitHub Actions e deploy automático no Kubernetes',
    ],
  },
  {
    title: 'Design System UI Kit',
    desc: 'Biblioteca de componentes React reutilizáveis com Storybook, testes automatizados e documentação completa.',
    longDesc: 'Design system construído para padronizar a interface de múltiplos produtos de uma empresa. Inclui mais de 40 componentes documentados no Storybook e cobertura de testes acima de 90%.',
    tags: ['React', 'TypeScript', 'Storybook', 'Jest', 'Chromatic', 'Figma API'],
    category: 'Front-end', year: '2023', github: '#', demo: '#',
    highlights: [
      '+40 componentes acessíveis (WCAG 2.1 AA) documentados no Storybook',
      'Tokens de design sincronizados automaticamente via Figma REST API',
      '92% de cobertura de testes com Jest e Testing Library',
      'Visual regression testing com Chromatic em cada PR',
    ],
  },
  {
    title: 'Analytics Dashboard',
    desc: 'Dashboard de métricas em tempo real com gráficos interativos, filtros avançados e exportação de dados.',
    longDesc: 'Painel de analytics para acompanhamento de KPIs de negócio. Os dados são apresentados em gráficos interativos com D3.js e suporta múltiplos workspaces.',
    tags: ['Next.js', 'D3.js', 'PostgreSQL', 'AWS Lambda', 'S3', 'CloudFront'],
    category: 'Full Stack', year: '2022', github: '#', demo: '#',
    highlights: [
      'Gráficos interativos com zoom, pan e tooltip customizado via D3.js',
      'Exportação de relatórios em PDF, CSV e Excel com geração server-side',
      'Arquitetura serverless na AWS com Lambda para processamento de eventos',
      'Cache de queries pesadas com invalidação automática a cada 15 minutos',
    ],
  },
  {
    title: 'CLI Dev Toolkit',
    desc: 'Ferramenta de linha de comando para automação de workflows, scaffolding e deploy em um clique.',
    longDesc: 'Ferramenta CLI open source publicada no npm para automatizar tarefas repetitivas do dia a dia. Permite criar estruturas de projetos personalizadas e fazer deploy com um único comando.',
    tags: ['Node.js', 'TypeScript', 'Commander.js', 'Inquirer', 'npm', 'Bash'],
    category: 'Tooling', year: '2022', github: '#', demo: '#',
    highlights: [
      '+2.000 downloads/mês no npm com 98% de satisfação nos reviews',
      'Scaffolding interativo com templates customizáveis por projeto',
      'Integração com GitHub API para criação automática de repositórios',
      'Plugin system para extensão de comandos por equipes',
    ],
  },
];

const filters = ['Todos', 'Full Stack', 'Front-end', 'Back-end', 'Tooling'] as const;
type Filter = typeof filters[number];

/* ─── Page ──────────────────────────────────── */
export default function Projects() {
  const [selected, setSelected] = useState<Project | null>(null);
  const [activeFilter, setActiveFilter] = useState<Filter>('Todos');

  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroBgY     = useTransform(scrollY, [0, 500], [0, 100]);

  const filtered = useMemo(
    () => activeFilter === 'Todos'
      ? projects
      : projects.filter(p => p.category === activeFilter),
    [activeFilter],
  );

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════════
          HERO BANNER
      ══════════════════════════════════════ */}
      <section ref={heroRef} className={styles.hero}>
        <motion.div className={styles.heroBg} style={{ y: heroBgY }} aria-hidden="true">
          <div className={styles.heroDot} />
          <div className={styles.heroGrid} />
          <div className={styles.heroGlow} />
        </motion.div>

        <motion.div
          className={`container ${styles.heroInner}`}
          style={{}}
        >
          <div className={styles.heroCrumb}>
            <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Projects' }]} />
          </div>

          <motion.span
            className={styles.heroEyebrow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Portfólio
          </motion.span>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            Projetos que<br />
            <span className={styles.heroAccent}>falam por si.</span>
          </motion.h1>

          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.26 }}
          >
            Uma seleção de projetos reais — do back-end ao produto final. Clique
            em qualquer card para ver detalhes, stack e resultados.
          </motion.p>

          {/* Quick stats */}
          <motion.div
            className={styles.heroStats}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.34 }}
          >
            {[
              { v: projects.length,                           l: 'Projetos'  },
              { v: [...new Set(projects.map(p=>p.category))].length, l: 'Categorias' },
              { v: [...new Set(projects.flatMap(p=>p.tags))].length, l: 'Tecnologias' },
            ].map(({ v, l }) => (
              <div key={l} className={styles.heroStat}>
                <span className={styles.heroStatVal}>{v}</span>
                <span className={styles.heroStatLabel}>{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          FILTER TABS + GRID
      ══════════════════════════════════════ */}
      <section className={styles.gridSection} aria-labelledby="projects-list-title">
        <div className="container">
          <h2 id="projects-list-title" className={styles.srOnly}>Lista de projetos</h2>

          {/* Filter tabs */}
          <motion.div
            className={styles.filters}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            role="tablist"
            aria-label="Filtrar projetos por categoria"
          >
            {filters.map((f) => (
              <button
                key={f}
                className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ''}`}
                onClick={() => setActiveFilter(f)}
                role="tab"
                aria-selected={activeFilter === f}
              >
                {f}
                {activeFilter === f && (
                  <motion.span
                    className={styles.filterBar}
                    layoutId="filterBar"
                    transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
                  />
                )}
                {/* Count badge */}
                <span className={styles.filterCount}>
                  {f === 'Todos' ? projects.length : projects.filter(p => p.category === f).length}
                </span>
              </button>
            ))}
          </motion.div>

          {/* Grid with AnimatePresence for filter transitions */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeFilter}
              className={styles.grid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className={styles.gridInner}>
                {filtered.map((p, i) => (
                  <ProjectRow
                    key={p.title}
                    project={p}
                    index={i}
                    isLast={i === filtered.length - 1}
                    onClick={() => setSelected(p)}
                  />
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      {/* ══════════════════════════════════════
          OPEN SOURCE CTA
      ══════════════════════════════════════ */}
      <motion.section
        className={styles.openSource}
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.48 }}
        aria-labelledby="os-title"
      >
        <div className="container">
          <div className={styles.osInner}>
            <div className={styles.osIcon} aria-hidden="true">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
            </div>
            <div>
              <h2 id="os-title" className={styles.osTitle}>Também no GitHub</h2>
              <p className={styles.osDesc}>Confira contribuições open source, experimentos e projetos pessoais.</p>
            </div>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className={styles.osBtn}>
              Ver GitHub →
            </a>
          </div>
        </div>
      </motion.section>

      <ProjectModal project={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

/* ─── ProjectRow ────────────────────────────────────────────
   Full-width editorial row. Each element is tied to its own
   scroll-progress range so the content reveals in a natural
   cascade as the row enters the viewport:
     0.00 → 0.25  divider line draws left-to-right
     0.10 → 0.50  number + meta slide up
     0.20 → 0.60  title slides up
     0.35 → 0.72  description fades + rises
     0.50 → 0.85  tags + cta fade in
─────────────────────────────────────────────────────────── */
function ProjectRow({
  project,
  index,
  isLast,
  onClick,
}: {
  project: Project;
  index: number;
  isLast: boolean;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.95', 'start 0.20'],
  });

  const spring = useSpring(scrollYProgress, { stiffness: 60, damping: 18 });

  // Each element has a slightly different reveal window
  const lineScale  = useTransform(spring, [0.00, 0.25], [0, 1]);
  const leftY      = useTransform(spring, [0.10, 0.50], [28, 0]);
  const leftOp     = useTransform(spring, [0.10, 0.45], [0, 1]);
  const titleY     = useTransform(spring, [0.20, 0.60], [22, 0]);
  const titleOp    = useTransform(spring, [0.20, 0.55], [0, 1]);
  const descY      = useTransform(spring, [0.35, 0.72], [16, 0]);
  const descOp     = useTransform(spring, [0.35, 0.70], [0, 1]);
  const bottomOp   = useTransform(spring, [0.50, 0.85], [0, 1]);

  const num = String(index + 1).padStart(2, '0');

  return (
    <motion.div
      ref={ref}
      className={styles.row}
      role="button"
      tabIndex={0}
      aria-label={`Ver detalhes de ${project.title}`}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
      whileTap={{ scale: 0.995 }}
    >
      {/* Divider line — draws left → right */}
      <motion.div
        className={styles.rowDivider}
        style={{ scaleX: lineScale }}
      />

      {isLast && <div className={styles.rowDividerBottom} />}

      <div className={styles.rowInner}>

        {/* ── Left column: number + meta ── */}
        <motion.div
          className={styles.rowLeft}
          style={{ y: leftY, opacity: leftOp }}
        >
          <span className={styles.rowNumber}>{num}</span>
          <div className={styles.rowMeta}>
            <span className={styles.rowCategory}>{project.category}</span>
            <span className={styles.rowYear}>{project.year}</span>
          </div>
        </motion.div>

        {/* ── Right column: content ── */}
        <div className={styles.rowContent}>

          <div className={styles.rowTitleRow}>
            <motion.h2
              className={styles.rowTitle}
              style={{ y: titleY, opacity: titleOp }}
            >
              {project.title}
            </motion.h2>
            <motion.span
              className={styles.rowArrow}
              style={{ opacity: titleOp }}
              aria-hidden="true"
            >
              ↗
            </motion.span>
          </div>

          <motion.p
            className={styles.rowDesc}
            style={{ y: descY, opacity: descOp }}
          >
            {project.desc}
          </motion.p>

          <motion.div
            className={styles.rowBottom}
            style={{ opacity: bottomOp }}
          >
            <div className={styles.rowTags}>
              {project.tags.slice(0, 5).map((tag) => (
                <span key={tag} className={styles.tag}>{tag}</span>
              ))}
              {project.tags.length > 5 && (
                <span className={styles.tagMore}>+{project.tags.length - 5}</span>
              )}
            </div>
            <span className={styles.rowCta}>
              Ver detalhes
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}
