# Dev Portfolio — Next.js 14 + Framer Motion

Portfólio de desenvolvedor com 4 páginas distintas. **Next.js 14 (App Router)**, **TypeScript**, **CSS Modules** e **Framer Motion**.

---

## 🚀 Como rodar

```bash
npm install   # instala dependências incluindo framer-motion
npm run dev   # http://localhost:3000
```

---

## 📁 Estrutura

```
src/
├── app/
│   ├── layout.tsx              # Layout raiz — Header, PageTransition, Footer
│   ├── page.tsx                # Home (/)
│   ├── not-found.tsx           # 404
│   ├── about/page.tsx          # About (/about)
│   ├── projects/page.tsx       # Projects (/projects)
│   └── contact/page.tsx        # Contact (/contact)
├── components/
│   ├── Header.tsx              # Sticky header com Framer Motion
│   ├── Footer.tsx              # Footer sempre no fundo
│   ├── Breadcrumb.tsx          # Breadcrumb animado
│   ├── PageTransition.tsx  ★   # AnimatePresence para troca de rota
│   ├── FadeIn.tsx          ★   # FadeIn, StaggerContainer, StaggerItem, PressableCard
│   └── ProjectModal.tsx        # Modal com AnimatePresence
└── styles/
    └── globals.css             # Design tokens (Cyan system)
```
★ = novos arquivos desta versão

---

## 🎨 Design Tokens

| Token          | Valor                    | Uso                          |
|----------------|--------------------------|------------------------------|
| `--cyan`       | `#00E5FF`                | Accent principal             |
| `--cyan-light` | `#33F0FF`                | Hover de botões              |
| `--cyan-dim`   | `rgba(0,229,255,0.10)`   | Fundos de badge/pill         |
| `--cyan-border`| `rgba(0,229,255,0.35)`   | Bordas de destaque           |
| `--bg`         | `#0A0A0A`                | Background                   |
| `--bg-card`    | `#151515`                | Cards e formulários          |
| `--white`      | `#FFFFFF`                | Texto principal              |
| `--gray`       | `#CCCCCC`                | Texto secundário             |

---

## ✨ Animações (Framer Motion)

| Tipo                  | Onde                                    | Detalhes                              |
|-----------------------|-----------------------------------------|---------------------------------------|
| Page transition       | Todas as rotas                          | fade + y(14→0), `AnimatePresence`     |
| Fade entrance         | Hero, breadcrumb, cabeçalhos de seção  | `whileInView`, `once: true`           |
| Stagger (cards)       | Home featured + Projects grid          | `staggerChildren: 0.08`              |
| Stagger (timeline)    | About — experiência                    | cada item entra com delay encadeado   |
| Stagger (skills)      | About — habilidades                    | idem                                  |
| Modal open/close      | ProjectModal                           | spring scale + slide, backdrop fade   |
| Highlights stagger    | Dentro do modal                        | x(-10→0), staggerChildren: 0.055      |
| Mobile sheet          | Modal em mobile                        | `y(100%→0)` bottom sheet             |
| Nav active bar        | Header                                 | `layoutId="activeBar"` sliding        |
| Hamburger → X         | Header mobile                          | rotate + opacity                      |
| Hover/Tap             | Cards de projeto, botão submit         | `whileHover scale(1.025)`, `whileTap` |
| Close button rotate   | Modal                                  | `whileHover rotate(90)`              |
| Form success          | Contact                               | spring scale(0→1)                     |
| Field errors          | Contact                               | height(0→auto) + opacity              |

---

## ✅ Regras de UX (hover apenas em elementos interativos)

| Elemento            | Interativo? | Hover? | cursor:pointer? |
|---------------------|-------------|--------|-----------------|
| Botões / Links      | ✅           | ✅      | ✅               |
| Cards de projeto    | ✅ (abre modal) | ✅   | ✅               |
| Contact items (a)   | ✅           | ✅      | ✅               |
| Stats (home)        | ❌           | ❌      | ❌               |
| Badge de cargo      | ❌           | ❌      | ❌               |
| Foto / chips        | ❌           | ❌      | ❌               |
| Timeline items      | ❌           | ❌      | ❌               |
| Skill pills         | ❌           | ❌      | `cursor:default` |
| Tags dentro de cards| ❌           | ❌      | ❌               |
| Bio card            | ❌           | ❌      | ❌               |

---

## 📸 Adicionar foto de perfil

1. Coloque sua foto em `/public/profile.jpg`
2. Abra `src/app/page.tsx`
3. Descomente o bloco `<Image>` e remova o `<div className={styles.photoPlaceholder}>`

---

## 💡 3 melhorias UX sugeridas (próximos passos)

1. **`prefers-reduced-motion`** — Use `useReducedMotion()` do Framer Motion para desativar animações para usuários que optam por menos movimento no SO.
2. **Skip-to-content** — Adicione `<a href="#main" class="sr-only focus:not-sr-only">Ir ao conteúdo</a>` no topo do layout para navegação por teclado.
3. **OG Image** — Adicione `opengraph-image.tsx` em `src/app/` para preview rico ao compartilhar o link nas redes sociais.
