"use client";

import dynamic from "next/dynamic";
import TerminalBackground from "./TerminalBackground";
import styles from "./HeroScene.module.css";

const LiquidOrb = dynamic(() => import("./LiquidOrb"), {
  ssr: false,
  loading: () => null,
});

export default function HeroScene() {
  return (
    <div className={styles.scene} aria-hidden="true">
      <div className={styles.orbLayer}>
        <LiquidOrb />
      </div>
      <div className={styles.terminalLayer}>
        <TerminalBackground />
      </div>
      <div className={styles.atmosphere} />
    </div>
  );
}
