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
    title: 'API REST em Python',
    desc: 'Estudo prático de construção de API REST com FastAPI — rotas CRUD, autenticação básica e integração com banco de dados relacional.',
    longDesc: 'Projeto de estudo focado em consolidar fundamentos de desenvolvimento back-end com Python. A API expõe endpoints CRUD, faz validação de dados com Pydantic e persiste informações em PostgreSQL.',
    tags: ['Python', 'FastAPI', 'PostgreSQL', 'Pydantic', 'Pytest', 'REST'],
    category: 'Back-end', year: '2025', github: 'https://github.com/Luan-Knachak4', demo: '#',
    highlights: [
      'Endpoints CRUD completos com validação de dados via Pydantic',
      'Persistência em PostgreSQL usando SQLAlchemy como ORM',
      'Testes automatizados de rotas com Pytest e cliente HTTP',
      'Estrutura em camadas (rotas, serviços, repositórios) para separação de responsabilidades',
    ],
  },
  {
    title: 'Sistema Back-End em Java',
    desc: 'Aplicação back-end em Java explorando POO, persistência com JDBC e arquitetura em camadas.',
    longDesc: 'Projeto de estudo em Java aplicando conceitos de programação orientada a objetos, padrões de projeto e modelagem de dados. Foco em escrever código limpo, testável e bem organizado.',
    tags: ['Java', 'Spring', 'JDBC', 'MySQL', 'JUnit', 'POO'],
    category: 'Back-end', year: '2025', github: 'https://github.com/Luan-Knachak4', demo: '#',
    highlights: [
      'Modelagem orientada a objetos com classes, herança e interfaces',
      'Persistência manual via JDBC e exploração de Spring Data',
      'Testes unitários com JUnit cobrindo lógica de negócio',
      'Arquitetura em camadas: controller, service, repository',
    ],
  },
  {
    title: 'Experimentos em Crystal',
    desc: 'Explorando a linguagem Crystal — sintaxe Ruby-like com performance compilada. Ferramentas e estudos pessoais.',
    longDesc: 'Conjunto de pequenos projetos para explorar a linguagem Crystal: tipagem estática, macros, fibers e a sintaxe expressiva inspirada em Ruby com performance próxima de C.',
    tags: ['Crystal', 'CLI', 'Tooling', 'Estudos'],
    category: 'Tooling', year: '2025', github: 'https://github.com/Luan-Knachak4', demo: '#',
    highlights: [
      'Pequenas ferramentas CLI para automatizar tarefas locais',
      'Exploração de tipagem estática com inferência de tipos',
      'Comparação prática de performance vs Ruby e Python',
      'Estudo de macros e metaprogramação na linguagem',
    ],
  },
  {
    title: 'Modelagem e Queries SQL',
    desc: 'Estudos práticos de modelagem relacional, normalização e escrita de queries SQL complexas para análise de dados.',
    longDesc: 'Conjunto de exercícios e estudos sobre modelagem de banco de dados relacional. Inclui normalização, índices, JOINs, subqueries, CTEs e funções de janela.',
    tags: ['SQL', 'PostgreSQL', 'MySQL', 'Modelagem', 'Normalização'],
    category: 'Banco de Dados', year: '2024', github: 'https://github.com/Luan-Knachak4', demo: '#',
    highlights: [
      'Modelagem de schemas seguindo as formas normais (1FN, 2FN, 3FN)',
      'Queries com múltiplos JOINs, subqueries e CTEs',
      'Funções de janela (ROW_NUMBER, RANK, PARTITION BY) para análise',
      'Otimização de consultas com índices e análise de planos de execução',
    ],
  },
  {
    title: 'Algoritmos & Estruturas de Dados',
    desc: 'Implementação de algoritmos clássicos e estruturas de dados em Python e Java, com foco em complexidade e legibilidade.',
    longDesc: 'Repositório de estudos com implementações próprias de algoritmos de ordenação, busca, grafos e estruturas como listas ligadas, árvores e tabelas hash. Cada solução vem documentada com análise de complexidade.',
    tags: ['Python', 'Java', 'Algoritmos', 'Estruturas de Dados', 'Big-O'],
    category: 'Estudos', year: '2024', github: 'https://github.com/Luan-Knachak4', demo: '#',
    highlights: [
      'Implementações próprias de ordenação (merge, quick, heap)',
      'Estruturas: listas ligadas, pilhas, filas, árvores, hash tables',
      'Algoritmos em grafos: BFS, DFS, Dijkstra',
      'Análise de complexidade temporal e espacial documentada',
    ],
  },
  {
    title: 'Scripts de Automação em Python',
    desc: 'Scripts utilitários para automatizar tarefas repetitivas — manipulação de arquivos, web scraping e processamento de dados.',
    longDesc: 'Coleção de pequenos scripts em Python para resolver problemas reais do dia a dia: organização de arquivos, leitura de planilhas, web scraping com requests/BeautifulSoup e geração de relatórios.',
    tags: ['Python', 'Automação', 'BeautifulSoup', 'Pandas', 'CLI'],
    category: 'Tooling', year: '2024', github: 'https://github.com/Luan-Knachak4', demo: '#',
    highlights: [
      'Scripts de organização e renomeação de arquivos em massa',
      'Web scraping de dados públicos com requests e BeautifulSoup',
      'Processamento de planilhas e CSVs com Pandas',
      'Geração de relatórios automatizados em PDF/CSV',
    ],
  },
];

const filters = ['Todos', 'Back-end', 'Banco de Dados', 'Tooling', 'Estudos'] as const;
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
            <a href="https://github.com/Luan-Knachak4" target="_blank" rel="noopener noreferrer" className={styles.osBtn}>
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
