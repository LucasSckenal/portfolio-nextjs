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
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import Breadcrumb from '@/components/Breadcrumb';
import { StaggerContainer, StaggerItem } from '@/components/FadeIn';
import styles from './page.module.css';

/* ─── Data ─────────────────────────────────── */

const experience = [
  {
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Brasil',
    period: '2022 — Presente',
    type: 'CLT',
    desc: 'Liderança técnica de squad multidisciplinar. Arquitetura de microsserviços com Node.js e Next.js. Redução de 40% no tempo de carregamento das aplicações e implementação de CI/CD.',
    achievements: ['Liderou equipe de 6 devs', 'Reduziu TTL em 40%', '+3 produtos lançados'],
  },
  {
    title: 'Full Stack Developer',
    company: 'StartupXYZ',
    period: '2020 — 2022',
    type: 'CLT',
    desc: 'Desenvolvimento de plataforma SaaS do zero. Stack: React, Node.js, MongoDB. Crescimento de 200% de usuários em 18 meses, de 10k para 30k MAU.',
    achievements: ['30k usuários ativos', 'Série A conquistada', 'SaaS do zero'],
  },
  {
    title: 'Front-end Developer',
    company: 'Agência Digital',
    period: '2018 — 2020',
    type: 'CLT',
    desc: 'Criação de interfaces para clientes enterprise. Foco em performance, acessibilidade e design system. Projetos para segmentos financeiro e de saúde.',
    achievements: ['10+ clientes enterprise', 'Design system criado', 'WCAG 2.1 AA'],
  },
  {
    title: 'Desenvolvedor Júnior',
    company: 'Freelancer',
    period: '2016 — 2018',
    type: 'PJ',
    desc: 'Projetos web para pequenas e médias empresas. HTML, CSS, JavaScript, WordPress e PHP. Construção de base sólida em UX e boas práticas.',
    achievements: ['20+ projetos', 'Clientes fidelizados', 'Autodidatismo'],
  },
];

const skillGroups = [
  {
    category: 'Front-end',
    icon: '⬡',
    skills: [
      { name: 'React / Next.js', level: 95 },
      { name: 'TypeScript',      level: 90 },
      { name: 'TailwindCSS',     level: 88 },
      { name: 'Framer Motion',   level: 82 },
    ],
  },
  {
    category: 'Back-end',
    icon: '◈',
    skills: [
      { name: 'Node.js',         level: 92 },
      { name: 'PostgreSQL',      level: 85 },
      { name: 'Redis',           level: 78 },
      { name: 'GraphQL',         level: 80 },
    ],
  },
  {
    category: 'DevOps & Cloud',
    icon: '◎',
    skills: [
      { name: 'Docker',          level: 85 },
      { name: 'AWS',             level: 75 },
      { name: 'CI/CD',           level: 88 },
      { name: 'Kubernetes',      level: 65 },
    ],
  },
];

const education = [
  {
    degree: 'Bacharelado em Ciência da Computação',
    school: 'Universidade de São Paulo',
    period: '2012 — 2016',
    icon: '🎓',
    desc: 'Formação sólida em algoritmos, estruturas de dados, sistemas distribuídos e engenharia de software.',
  },
  {
    degree: 'AWS Certified Solutions Architect',
    school: 'Amazon Web Services',
    period: '2023',
    icon: '☁️',
    desc: 'Certificação profissional em arquitetura de soluções na nuvem AWS — Associate level.',
  },
  {
    degree: 'Full Stack JavaScript',
    school: 'The Odin Project / freeCodeCamp',
    period: '2015 — 2016',
    icon: '💻',
    desc: 'Formação complementar em desenvolvimento web moderno com foco no ecossistema JavaScript.',
  },
];

const quickFacts = [
  { icon: '📍', label: 'Localização',  value: 'São Paulo, Brasil'       },
  { icon: '💼', label: 'Status',       value: 'Disponível para projetos' },
  { icon: '🎓', label: 'Formação',     value: 'Ciência da Computação'    },
  { icon: '🌐', label: 'Idiomas',      value: 'PT, EN, ES'               },
  { icon: '⚡', label: 'Foco atual',   value: 'Next.js + AI integrations' },
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
            Dev apaixonado<br />
            por <span className={styles.heroAccent}>código limpo.</span>
          </motion.h1>

          <motion.p
            className={styles.heroDesc}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.44, delay: 0.26 }}
          >
            5+ anos construindo produtos que realmente importam — com foco em
            escalabilidade, performance e experiências que encantam usuários.
          </motion.p>

          {/* Floating stat chips */}
          <motion.div
            className={styles.heroChips}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.34 }}
          >
            {[
              { v: '5+',  l: 'Anos'      },
              { v: '40+', l: 'Projetos'  },
              { v: '15+', l: 'Stacks'    },
              { v: '100%',l: 'Dedicação' },
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
                Sou um desenvolvedor de software com mais de <strong>5 anos de experiência</strong>{' '}
                construindo aplicações web de alta performance. Minha especialidade está em criar
                sistemas escaláveis que unem código robusto no back‑end com experiências fluidas
                no front‑end.
              </p>
              <p>
                Atualmente trabalho como <strong>Senior Full Stack Developer</strong>, liderando
                equipes e tomando decisões de arquitetura que impactam diretamente no produto e no
                negócio. Acredito que bom software é aquele que resolve problemas reais com
                elegância técnica.
              </p>
              <p>
                Quando não estou codando, contribuo com projetos open source, escrevo sobre
                desenvolvimento web e exploro as interseções entre IA generativa e produto.
                Tenho especial interesse em DX (Developer Experience) e sistemas de design.
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
                <span>L</span>
                <div className={styles.avatarGlow} />
              </div>
              <h3 className={styles.factsName}>Luan</h3>
              <p className={styles.factsRole}>Senior Full Stack Developer</p>

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
              {['Express', 'MongoDB', 'Prisma', 'Jest', 'Git', 'Linux',
                'Figma', 'Storybook', 'Turborepo', 'Terraform'].map((t) => (
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
