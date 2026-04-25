/**
 * Contact page — redesigned with improved UX and visual polish
 *
 * Improvements:
 *  - Hero: cleaner, with animated status indicator + social links row
 *  - Form: character counter on textarea, better micro-interactions
 *  - Left column: rich info cards with hover effects, map-like visual
 *  - "Quick connect" social strip with icon buttons
 *  - FAQ accordion improved with better animation
 *  - Removed heroOpacity scroll transform (caused black screen bug)
 */
'use client';

import { useState, FormEvent, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import Breadcrumb from '@/components/Breadcrumb';
import { StaggerContainer, StaggerItem } from '@/components/FadeIn';
import styles from './page.module.css';

type Status = 'idle' | 'sending' | 'sent';
interface FormState { name: string; email: string; subject: string; message: string; }
interface Errors    { name?: string; email?: string; subject?: string; message?: string; }

const MESSAGE_MAX = 600;

function validate(f: FormState): Errors {
  const e: Errors = {};
  if (!f.name.trim())                        e.name    = 'Nome é obrigatório.';
  if (!f.email.trim())                       e.email   = 'Email é obrigatório.';
  else if (!/\S+@\S+\.\S+/.test(f.email))   e.email   = 'Email inválido.';
  if (!f.subject.trim())                     e.subject = 'Assunto é obrigatório.';
  if (!f.message.trim())                     e.message = 'Mensagem é obrigatória.';
  else if (f.message.trim().length < 20)     e.message = 'Mín. 20 caracteres.';
  return e;
}

/* Social links */
const socials = [
  {
    name: 'Email', href: 'mailto:luan@email.com', color: '#00E5FF',
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  {
    name: 'LinkedIn', href: 'https://linkedin.com', color: '#0077B5', external: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>,
  },
  {
    name: 'GitHub', href: 'https://github.com', color: '#e6e6e6', external: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>,
  },
  {
    name: 'Twitter / X', href: 'https://twitter.com', color: '#1DA1F2', external: true,
    icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"/></svg>,
  },
];

const infoItems = [
  { icon: '📍', label: 'Localização',    value: 'São Paulo, Brasil', sub: 'GMT-3 (BRT)' },
  { icon: '⚡', label: 'Resposta',       value: '< 24 horas',       sub: 'dias úteis'   },
  { icon: '🌐', label: 'Idiomas',        value: 'PT · EN · ES',     sub: 'fluente'      },
  { icon: '💼', label: 'Disponível',     value: 'Freelance & CLT',  sub: 'remoto'       },
];

const faq = [
  {
    q: 'Quais tipos de projeto você aceita?',
    a: 'Desenvolvimento web full stack — MVPs para startups, sistemas enterprise, refatorações, design systems e consultoria técnica. Avaliamos juntos o escopo antes de qualquer compromisso.',
  },
  {
    q: 'Qual é o seu modelo de trabalho?',
    a: 'Trabalho tanto CLT quanto PJ (freelance/contrato). 100% remoto, com disponibilidade para reuniões no fuso de São Paulo (GMT-3).',
  },
  {
    q: 'Você faz projetos pequenos também?',
    a: 'Sim! Desde uma landing page até um sistema completo. O tamanho não importa — o que importa é o alinhamento com o objetivo do projeto.',
  },
  {
    q: 'Como funciona o processo após o contato?',
    a: 'Após a mensagem inicial, agendo uma call de 30 min para entender o contexto. Na sequência, envio uma proposta com escopo, prazo e investimento.',
  },
];

/* ─── FAQ item ── */
function FAQItem({ item, index }: { item: typeof faq[0]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className={styles.faqItem}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.36, delay: index * 0.05 }}
    >
      <button
        className={`${styles.faqBtn} ${open ? styles.faqBtnOpen : ''}`}
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls={`faq-body-${index}`}
      >
        <span className={styles.faqQ}>{item.q}</span>
        <motion.span
          className={styles.faqToggle}
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ duration: 0.18 }}
          aria-hidden="true"
        >+</motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`faq-body-${index}`}
            className={styles.faqBody}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{    height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
          >
            <p className={styles.faqA}>{item.a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Form field ── */
interface FieldProps {
  id: keyof FormState; label: string; value: string;
  error?: string; touched?: boolean; required?: boolean;
  type?: string; isTextarea?: boolean;
  placeholder?: string; autoComplete?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onBlur:   (e: React.FocusEvent<HTMLInputElement  | HTMLTextAreaElement>) => void;
}

function Field({ id, label, value, error, touched, required, type = 'text',
  isTextarea, placeholder, autoComplete, onChange, onBlur }: FieldProps) {
  const hasError = !!error;
  const cls = `${styles.input} ${isTextarea ? styles.textarea : ''} ${hasError ? styles.inputError : ''}`;
  const base = {
    id, name: id, value, placeholder, autoComplete, onChange, onBlur,
    'aria-required': required,
    'aria-invalid': hasError,
    'aria-describedby': hasError ? `${id}-err` : undefined,
    className: cls,
  };

  return (
    <div className={styles.fieldWrap}>
      <label htmlFor={id} className={styles.label}>
        {label}
        {required && <span className={styles.req} aria-hidden="true"> *</span>}
      </label>
      {isTextarea ? <textarea {...base} rows={5} /> : <input {...base} type={type} />}
      {/* Character counter only on message */}
      {isTextarea && (
        <div className={styles.charCount}>
          <span className={value.length > MESSAGE_MAX * 0.9 ? styles.charWarn : ''}>
            {value.length}
          </span>
          /{MESSAGE_MAX}
        </div>
      )}
      <AnimatePresence>
        {hasError && (
          <motion.p id={`${id}-err`} className={styles.fieldErr} role="alert"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{    opacity: 0, height: 0 }}
            transition={{ duration: 0.16 }}>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ── */
export default function Contact() {
  const [status,  setStatus]  = useState<Status>('idle');
  const [form,    setForm]    = useState<FormState>({ name: '', email: '', subject: '', message: '' });
  const [errors,  setErrors]  = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  const heroRef = useRef<HTMLElement>(null);
  /* Parallax only on background — NOT on content (avoids opacity=0 on mount) */
  const { scrollY } = useScroll();
  const heroBgY = useTransform(scrollY, [0, 500], [0, 100]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    if (name === 'message' && value.length > MESSAGE_MAX) return;
    setForm(p => ({ ...p, [name]: value }));
    if (touched[name as keyof FormState]) {
      setErrors(p => ({ ...p, [name]: validate({ ...form, [name]: value })[name as keyof Errors] }));
    }
  }
  function handleBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name } = e.target;
    setTouched(p => ({ ...p, [name]: true }));
    setErrors(p => ({ ...p, [name]: validate(form)[name as keyof Errors] }));
  }
  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, subject: true, message: true });
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setStatus('sending');
    setTimeout(() => setStatus('sent'), 1800);
  }
  function reset() {
    setStatus('idle');
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({}); setTouched({});
  }

  return (
    <div className={styles.page}>

      {/* ══════════════════════════════════════
          HERO
      ══════════════════════════════════════ */}
      <section ref={heroRef} className={styles.hero}>
        {/* Parallax bg only — content NOT affected */}
        <motion.div className={styles.heroBg} style={{ y: heroBgY }} aria-hidden="true">
          <div className={styles.heroDot} />
          <div className={styles.heroGrid} />
          <div className={styles.heroGlow} />
          <div className={styles.heroGlow2} />
        </motion.div>

        <div className={`container ${styles.heroInner}`}>
          <Breadcrumb crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]} />

          <div className={styles.heroContent}>
            {/* Left: text */}
            <div className={styles.heroLeft}>
              <motion.span className={styles.heroEyebrow}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.08 }}>
                Vamos trabalhar juntos
              </motion.span>

              <motion.h1 className={styles.heroTitle}
                initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.14, ease: [0.16, 1, 0.3, 1] }}>
                Tem um projeto<br />em mente?
              </motion.h1>

              <motion.p className={styles.heroDesc}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.22 }}>
                Estou disponível para novos projetos, oportunidades e colaborações.
                Preencha o formulário ou use um dos canais diretos abaixo.
              </motion.p>

              {/* Availability */}
              <motion.div className={styles.availRow}
                initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.3 }}>
                <div className={styles.availBadge} aria-label="Status: disponível">
                  <span className={styles.availDot} aria-hidden="true" />
                  <span>Disponível para projetos</span>
                </div>
                <span className={styles.availSep} aria-hidden="true">·</span>
                <span className={styles.availTime}>Resposta em menos de 24h</span>
              </motion.div>
            </div>

            {/* Right: quick-connect social strip */}
            <motion.div
              className={styles.heroRight}
              initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className={styles.quickLabel}>Canais diretos</p>
              <div className={styles.socialGrid}>
                {socials.map((s) => (
                  <motion.a
                    key={s.name}
                    href={s.href}
                    className={styles.socialCard}
                    {...(s.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    aria-label={s.name}
                    whileHover={{ scale: 1.04, y: -3 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{ '--social-color': s.color } as React.CSSProperties}
                  >
                    <span className={styles.socialIcon}>{s.icon}</span>
                    <span className={styles.socialName}>{s.name}</span>
                    <svg className={styles.socialArrow} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          MAIN: INFO + FORM
      ══════════════════════════════════════ */}
      <section className={styles.mainSection} aria-labelledby="form-heading">
        <div className="container">
          <div className={styles.layout}>

            {/* ── LEFT: info cards ── */}
            <div className={styles.infoCol}>
              {/* Info grid */}
              <motion.div
                className={styles.infoGrid}
                initial={{ opacity: 0, x: -24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                {infoItems.map(({ icon, label, value, sub }) => (
                  <div key={label} className={styles.infoCard}>
                    <span className={styles.infoIcon} aria-hidden="true">{icon}</span>
                    <div>
                      <p className={styles.infoLabel}>{label}</p>
                      <p className={styles.infoValue}>{value}</p>
                      <p className={styles.infoSub}>{sub}</p>
                    </div>
                  </div>
                ))}
              </motion.div>

              {/* Decorative "terminal" card */}
              <motion.div
                className={styles.terminalCard}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.44, delay: 0.1 }}
                aria-hidden="true"
              >
                <div className={styles.terminalBar}>
                  <span className={styles.dot} style={{ background: '#FF5F57' }} />
                  <span className={styles.dot} style={{ background: '#FEBC2E' }} />
                  <span className={styles.dot} style={{ background: '#28C840' }} />
                  <span className={styles.terminalTitle}>luan@portfolio ~ </span>
                </div>
                <div className={styles.terminalBody}>
                  <p><span className={styles.tc}>$</span> status</p>
                  <p className={styles.td}>▸ Disponível para novos projetos</p>
                  <p><span className={styles.tc}>$</span> stack --primary</p>
                  <p className={styles.td}>▸ Next.js · Node.js · PostgreSQL</p>
                  <p><span className={styles.tc}>$</span> contact --send</p>
                  <p className={styles.tCursor}>█</p>
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT: form ── */}
            <motion.div
              className={styles.formCard}
              initial={{ opacity: 0, x: 32 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.52, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
            >
              <div aria-live="polite" aria-atomic="true">
                <AnimatePresence mode="wait">
                  {status === 'sent' ? (
                    /* ── Success ── */
                    <motion.div key="success" className={styles.success}
                      initial={{ opacity: 0, scale: 0.92 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      role="status"
                    >
                      <motion.div
                        className={styles.successRing}
                        initial={{ scale: 0, rotate: -30 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
                        aria-hidden="true"
                      >
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </motion.div>
                      <h3 className={styles.successTitle}>Mensagem enviada!</h3>
                      <p className={styles.successText}>
                        Obrigado pelo contato, <strong>{form.name.split(' ')[0] || 'amigo'}</strong>!<br />
                        Responderei em breve.
                      </p>
                      <div className={styles.successMeta}>
                        <span>📧 Cópia enviada para {form.email}</span>
                      </div>
                      <button className={styles.btnPrimary} onClick={reset}>
                        Enviar outra mensagem
                      </button>
                    </motion.div>
                  ) : (
                    /* ── Form ── */
                    <motion.form
                      key="form" onSubmit={handleSubmit}
                      className={styles.form} noValidate
                      aria-label="Formulário de contato"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className={styles.formTop}>
                        <h2 id="form-heading" className={styles.formTitle}>Enviar mensagem</h2>
                        <p className={styles.formSub}>Todos os campos marcados com * são obrigatórios.</p>
                      </div>

                      <div className={styles.formRow}>
                        <Field id="name" label="Nome" required
                          value={form.name} error={errors.name} touched={touched.name}
                          onChange={handleChange} onBlur={handleBlur}
                          placeholder="Seu nome" autoComplete="name" />
                        <Field id="email" label="Email" type="email" required
                          value={form.email} error={errors.email} touched={touched.email}
                          onChange={handleChange} onBlur={handleBlur}
                          placeholder="seu@email.com" autoComplete="email" />
                      </div>

                      <Field id="subject" label="Assunto" required
                        value={form.subject} error={errors.subject} touched={touched.subject}
                        onChange={handleChange} onBlur={handleBlur}
                        placeholder="Ex: Desenvolvimento de landing page" />

                      <Field id="message" label="Mensagem" required isTextarea
                        value={form.message} error={errors.message} touched={touched.message}
                        onChange={handleChange} onBlur={handleBlur}
                        placeholder="Conte sobre seu projeto: objetivo, prazo, orçamento aproximado..." />

                      <motion.button
                        type="submit"
                        className={styles.btnPrimary}
                        disabled={status === 'sending'}
                        aria-busy={status === 'sending'}
                        whileHover={status !== 'sending' ? { scale: 1.02, y: -2 } : {}}
                        whileTap={status  !== 'sending' ? { scale: 0.98 }        : {}}
                        transition={{ duration: 0.14 }}
                      >
                        {status === 'sending' ? (
                          <><span className={styles.spinner} aria-hidden="true" />Enviando...</>
                        ) : (
                          <>
                            Enviar Mensagem
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <line x1="22" y1="2" x2="11" y2="13"/>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                            </svg>
                          </>
                        )}
                      </motion.button>

                      <p className={styles.formPrivacy}>
                        🔒 Seus dados são usados apenas para responder sua mensagem.
                      </p>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          FAQ
      ══════════════════════════════════════ */}
      <section className={styles.faqSection} aria-labelledby="faq-title">
        <div className="container">
          <div className={styles.faqLayout}>
            <motion.div
              className={styles.faqLeft}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.44 }}
            >
              <span className={styles.faqEyebrow}>FAQ</span>
              <h2 id="faq-title" className={styles.faqTitle}>Perguntas frequentes</h2>
              <p className={styles.faqDesc}>
                Ainda tem dúvidas? Manda uma mensagem — respondo tudo.
              </p>
              <Link href="#form-heading" className={styles.faqCta}>
                Fazer uma pergunta →
              </Link>
            </motion.div>

            <div className={styles.faqRight}>
              {faq.map((item, i) => <FAQItem key={i} item={item} index={i} />)}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
