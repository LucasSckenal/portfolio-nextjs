/**
 * About page — full redesign matching Home quality
 *
 * Sections:
 *  1. Hero banner      — parallax bg, large title, scroll-driven opacity
 *  2. Sobre (Bio)      — photo + text + quick-facts card
 *  3. Experiência      — enhanced timeline with scroll-draw lines
 *  4. Habilidades      — grouped skill categories with fill-bar animations
 *  5. Educação         — cards de formação/certificações
 *  6. CTA strip        — download CV + contact
 */
'use client';

import { useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import Breadcrumb from '@/components/Breadcrumb';
import { StaggerContainer, StaggerItem } from '@/components/FadeIn';
import styles from './page.module.css';

/* 3D scene: client-only, loaded lazily so Three.js never hits SSR */
const Scene3D = dynamic(() => import('@/components/Scene3D'), {
  ssr: false,
  loading: () => null,
});

/* ─── Data ─────────────────────────────────── */

const experience = [
  {
    title: 'Estudante de Ciência da Computação',
    company: 'Graduação em andamento',
    period: 'Atual',
    type: 'Acadêmico',
    desc: 'Formação superior em Ciência da Computação com base em algoritmos, estruturas de dados, programação orientada a objetos, banco de dados e engenharia de software.',
    achievements: ['Algoritmos e ED', 'POO em Java', 'Banco de Dados / SQL'],
  },
  {
    title: 'Desenvolvimento Back-End (Auto-estudo)',
    company: 'Projetos pessoais',
    period: 'Em andamento',
    type: 'Estudo',
    desc: 'Aprofundamento em desenvolvimento back-end com Python e Java — construção de APIs REST, integração com bancos relacionais e práticas de código limpo.',
    achievements: ['APIs REST', 'Python + Java', 'SQL relacional'],
  },
  {
    title: 'Exploração da linguagem Crystal',
    company: 'Aprendizado contínuo',
    period: 'Em andamento',
    type: 'Estudo',
    desc: 'Explorando a linguagem Crystal — sintaxe expressiva inspirada em Ruby com performance compilada. Pequenos experimentos e ferramentas de linha de comando.',
    achievements: ['Sintaxe Ruby-like', 'Performance compilada', 'Tooling CLI'],
  },
  {
    title: 'Em busca da primeira oportunidade',
    company: 'Open to work',
    period: 'Disponível',
    type: 'CLT / Estágio',
    desc: 'Procurando a primeira oportunidade de emprego para aplicar os conhecimentos adquiridos, contribuir com a empresa e desenvolver habilidades práticas no ambiente profissional.',
    achievements: ['Proativo', 'Aprendizado rápido', 'Disponível imediatamente'],
  },
];

const skillGroups = [
  {
    category: 'Linguagens',
    icon: '⬡',
    skills: [
      { name: 'Python',          level: 80 },
      { name: 'Java',            level: 75 },
      { name: 'SQL',             level: 78 },
      { name: 'Crystal',         level: 55 },
    ],
  },
  {
    category: 'Back-end',
    icon: '◈',
    skills: [
      { name: 'APIs REST',       level: 70 },
      { name: 'FastAPI / Flask', level: 65 },
      { name: 'Spring (Java)',   level: 55 },
      { name: 'POO',             level: 80 },
    ],
  },
  {
    category: 'Banco & Ferramentas',
    icon: '◎',
    skills: [
      { name: 'PostgreSQL / MySQL', level: 72 },
      { name: 'Git / GitHub',       level: 80 },
      { name: 'Linux',              level: 65 },
      { name: 'Docker',             level: 50 },
    ],
  },
];

const education = [
  {
    degree: 'Bacharelado em Ciência da Computação',
    school: 'Em andamento',
    period: 'Atual',
    icon: '🎓',
    desc: 'Graduação com foco em algoritmos, estruturas de dados, programação orientada a objetos, banco de dados e engenharia de software.',
  },
  {
    degree: 'Estudo autodidata em Back-End',
    school: 'Documentações oficiais e projetos práticos',
    period: 'Contínuo',
    icon: '💻',
    desc: 'Aprofundamento prático em Python (FastAPI, Flask), Java (Spring) e modelagem de banco de dados relacional.',
  },
  {
    degree: 'Exploração de novas linguagens',
    school: 'Comunidade open source',
    period: 'Contínuo',
    icon: '🔬',
    desc: 'Estudo da linguagem Crystal e fundamentos de outras tecnologias para ampliar o repertório técnico.',
  },
];

const quickFacts = [
  { icon: '📍', label: 'Localização',  value: 'Brasil'                   },
  { icon: '💼', label: 'Status',       value: 'Open to work · 1ª vaga'   },
  { icon: '🎓', label: 'Formação',     value: 'Ciência da Computação'    },
  { icon: '⚙️', label: 'Foco',         value: 'Back-End'                 },
  { icon: '⚡', label: 'Linguagens',   value: 'Python · Java · Crystal · SQL' },
];

/* ─── SkillBar — animated fill on viewport entry ── */
function SkillBar({ name, level }: { name: string; level: number }) {
  return (
    <div className={styles.skillBarItem}>
      <div className={styles.skillBarHeader}>
        <span className={styles.skillBarName}>{name}</span>
        <span className={styles.skillBarPct}>{level}%</span>
      </div>
      <div className={styles.skillBarTrack}>
        <motion.div
          className={styles.skillBarFill}
          initial={{ width: 0 }}
          whileInView={{ width: `${level}%` }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </div>
  );
}

/* ─── TimelineItem — draw line on scroll ── */
function TimelineItem({
  job, index, isLast,
}: { job: typeof experience[0]; index: number; isLast: boolean }) {
  return (
    <motion.div
      className={styles.timelineItem}
      initial={{ opacity: 0, x: -24 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={styles.timelineLine} aria-hidden="true">
        <div className={styles.timelineDot}>
          <div className={styles.timelineDotInner} />
        </div>
        {!isLast && (
          <motion.div
            className={styles.timelineTrack}
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.08 + 0.25, ease: 'easeOut' }}
          />
        )}
      </div>

      <div className={styles.timelineContent}>
        <div className={styles.timelineHeader}>
          <div>
            <h3 className={styles.jobTitle}>{job.title}</h3>
            <p className={styles.jobCompany}>
              {job.company}
              <span className={styles.jobType}>{job.type}</span>
            </p>
          </div>
          <span className={styles.jobPeriod}>{job.period}</span>
        </div>
        <p className={styles.jobDesc}>{job.desc}</p>
        <div className={styles.jobAchievements}>
          {job.achievements.map((a) => (
            <span key={a} className={styles.achievement}>
              <span className={styles.achievementDot} aria-hidden="true">▹</span>
              {a}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Page ──────────────────────────────────── */
export default function About() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const heroBgY    = useTransform(scrollY, [0, 500], [0, 100]);

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
            <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]} />
          </div>

          <motion.span
            className={styles.heroEyebrow}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            Sobre mim
          </motion.span>

          <motion.h1
            className={styles.heroTitle}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            Estudante apaixonado<br />
            por <span className={styles.heroAccent}>back-end.</span>
          </motion.h1>

          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.26 }}
          >
            Estudante de Ciências da Computação com sólida base em Back-End.
            Proativo, autodidata e em busca da primeira oportunidade para
            crescer junto com uma equipe.
          </motion.p>

          {/* Floating stat chips */}
          <motion.div
            className={styles.heroChips}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.34 }}
          >
            {[
              { v: 'CC',     l: 'Estudante'  },
              { v: 'Back',   l: 'Foco'       },
              { v: '4',      l: 'Linguagens' },
              { v: '100%',   l: 'Dedicação'  },
            ].map(({ v, l }) => (
              <div key={l} className={styles.heroChip}>
                <span className={styles.heroChipVal}>{v}</span>
                <span className={styles.heroChipLabel}>{l}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════════
          BIO + QUICK FACTS
      ══════════════════════════════════════ */}
      <section className={styles.section} aria-labelledby="bio-title">
        <div className="container">
          <motion.div
            className={styles.sectionLabel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.44 }}
          >
            <span className={styles.labelNumber}>01</span>
            <h2 id="bio-title" className={styles.sectionTitle}>Sobre</h2>
          </motion.div>

          <div className={styles.bioGrid}>
            {/* Text */}
            <motion.div
              className={styles.bioText}
              initial={{ opacity: 0, x: -28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1] }}
            >
              <p>
                Sou estudante de <strong>Ciências da Computação</strong> com uma sólida base de
                conhecimentos em desenvolvimento <strong>Back-End</strong>. Trabalho com Python,
                Java e SQL como tecnologias principais, e venho explorando a linguagem Crystal
                para ampliar minha visão sobre paradigmas de programação.
              </p>
              <p>
                Sou <strong>proativo</strong> e tenho forte habilidade de aprendizado rápido —
                gosto de me aprofundar em problemas, ler documentação oficial e construir soluções
                a partir dos fundamentos. Acredito que entender o "porquê" das coisas é tão
                importante quanto saber usá-las.
              </p>
              <p>
                Estou em busca da <strong>primeira oportunidade de emprego</strong> para
                contribuir com a empresa que me der a chance e desenvolver habilidades práticas no
                ambiente de trabalho. Disponível para estágio, júnior, CLT ou PJ — remoto ou
                presencial.
              </p>

              <div className={styles.bioActions}>
                <Link href="/contact" className={styles.btnPrimary}>
                  Falar comigo
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
                <a href="/cv.pdf" className={styles.btnSecondary} download aria-label="Baixar currículo em PDF">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Baixar CV
                </a>
              </div>
            </motion.div>

            {/* Quick-facts card */}
            <motion.div
              className={styles.factsCard}
              initial={{ opacity: 0, x: 28 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.52, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.avatar} aria-hidden="true">
                <Scene3D />
                <div className={styles.avatarGlow} />
              </div>
              <h3 className={styles.factsName}>Luan</h3>
              <p className={styles.factsRole}>Estudante de CC · Back-End Developer</p>

              <div className={styles.factsList}>
                {quickFacts.map(({ icon, label, value }) => (
                  <div key={label} className={styles.factItem}>
                    <span className={styles.factIcon} aria-hidden="true">{icon}</span>
                    <div>
                      <p className={styles.factLabel}>{label}</p>
                      <p className={styles.factValue}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EXPERIENCE — animated timeline
      ══════════════════════════════════════ */}
      <section className={styles.sectionAlt} aria-labelledby="exp-title">
        <div className="container">
          <motion.div
            className={styles.sectionLabel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.44 }}
          >
            <span className={styles.labelNumber}>02</span>
            <h2 id="exp-title" className={styles.sectionTitle}>Experiência</h2>
          </motion.div>

          <div className={styles.timeline}>
            {experience.map((job, i) => (
              <TimelineItem
                key={i} job={job} index={i}
                isLast={i === experience.length - 1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SKILLS — grouped with progress bars
      ══════════════════════════════════════ */}
      <section className={styles.section} aria-labelledby="skills-title">
        <div className="container">
          <motion.div
            className={styles.sectionLabel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.44 }}
          >
            <span className={styles.labelNumber}>03</span>
            <h2 id="skills-title" className={styles.sectionTitle}>Habilidades</h2>
          </motion.div>

          <StaggerContainer className={styles.skillsGrid}>
            {skillGroups.map((group, gi) => (
              <StaggerItem key={gi} className={styles.skillGroup}>
                <div className={styles.skillGroupHeader}>
                  <span className={styles.skillGroupIcon} aria-hidden="true">{group.icon}</span>
                  <h3 className={styles.skillGroupName}>{group.category}</h3>
                </div>
                <div className={styles.skillBars}>
                  {group.skills.map((s) => (
                    <SkillBar key={s.name} name={s.name} level={s.level} />
                  ))}
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* All tech pills */}
          <motion.div
            className={styles.pillsWrap}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.44, delay: 0.15 }}
          >
            <p className={styles.pillsLabel}>Outras tecnologias:</p>
            <div className={styles.pills}>
              {['Pytest', 'JUnit', 'SQLite', 'Bash', 'VSCode',
                'IntelliJ', 'POO', 'Lógica', 'REST', 'JSON'].map((t) => (
                <span key={t} className={styles.pill}>{t}</span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          EDUCATION
      ══════════════════════════════════════ */}
      <section className={styles.sectionAlt} aria-labelledby="edu-title">
        <div className="container">
          <motion.div
            className={styles.sectionLabel}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.44 }}
          >
            <span className={styles.labelNumber}>04</span>
            <h2 id="edu-title" className={styles.sectionTitle}>Formação</h2>
          </motion.div>

          <StaggerContainer className={styles.eduGrid}>
            {education.map((edu, i) => (
              <StaggerItem key={i} className={styles.eduCard}>
                <span className={styles.eduIcon} aria-hidden="true">{edu.icon}</span>
                <div>
                  <span className={styles.eduPeriod}>{edu.period}</span>
                  <h3 className={styles.eduDegree}>{edu.degree}</h3>
                  <p className={styles.eduSchool}>{edu.school}</p>
                  <p className={styles.eduDesc}>{edu.desc}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CTA
      ══════════════════════════════════════ */}
      <section className={styles.ctaStrip} aria-labelledby="cta-about-title">
        <div className="container">
          <motion.div
            className={styles.ctaInner}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.48 }}
          >
            <div>
              <h2 id="cta-about-title" className={styles.ctaTitle}>
                Gostou do perfil?
              </h2>
              <p className={styles.ctaDesc}>
                Vamos conversar sobre como posso contribuir com o seu projeto.
              </p>
            </div>
            <div className={styles.ctaButtons}>
              <Link href="/contact" className={styles.btnPrimary}>
                Entrar em contato →
              </Link>
              <Link href="/projects" className={styles.btnGhost}>
                Ver projetos
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
