import { useState } from "react";
import styles from "./InfoButton.module.css";
import { Info } from "lucide-react";

export default function InfoButton({ text }: { text: string }) {
    const [isOpen, setIsOpen] = useState(false);
  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className={styles.button}><Info/></button>

      <div data-open={isOpen} className={styles.container}>
        <div className={styles.overlay} onClick={() => setIsOpen(false)} />
        <div className={styles.info}><h1>Összetevők</h1>{text}</div>
      </div>
    </>
  );
}