import Link from 'next/link';
import styles from './not-found.module.css';

export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={`container ${styles.content}`}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.sub}>
          A página que você procura não existe ou foi movida.
        </p>
        <Link href="/" className={styles.btn}>
          ← Voltar para Home
        </Link>
      </div>
    </div>
  );
}
