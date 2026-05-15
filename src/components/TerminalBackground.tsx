"use client";

import { motion } from "framer-motion";
import styles from "./TerminalBackground.module.css";

const logs = [
  "[api] POST /auth/login 200 34ms",
  "[api] GET /v1/profile 304 edge-sfo",
  "[ws] connected :: shard-02 latency=18ms",
  "[ws] heartbeat ack seq=8402",
  "[db] query users.by_email completed in 12ms",
  "[db] pool checkout 4/20 idle",
  "[docker] api-01 container healthy",
  "[docker] worker queue depth=03",
  "[deploy] build successful checksum=8f31",
  "[deploy] release promoted region=iad1",
  "[cache] redis hit key=session:luan",
  "[cache] stale-while-revalidate /projects",
  "[trace] span api.auth.verify 7.4ms",
  "[trace] ingest batch accepted",
  "[metrics] p95 latency 41ms",
  "[metrics] cpu 18% mem 412mb",
  "[gateway] response 204 upstream=api",
  "[gateway] rate-limit budget 97%",
];

export default function TerminalBackground() {
  return (
    <div className={styles.terminal} aria-hidden="true">
      <div className={styles.overlay} />
      <div className={styles.beam} />

      <motion.div
        className={styles.logs}
        animate={{
          y: ["0%", "-50%"],
        }}
        transition={{
          duration: 18,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[...logs, ...logs, ...logs].map((log, i) => (
          <div key={i} className={styles.line}>
            <span className={styles.prompt}>$</span>
            {log}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
