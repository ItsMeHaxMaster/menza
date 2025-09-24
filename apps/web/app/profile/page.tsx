import Link from "next/dist/client/link";
import styles from "./page.module.css";
import { House } from "lucide-react";


export default function Profile() {
  return (
    <div>
      <h1>
        Profilom
      </h1>
      <Link className={styles.navButton} href="/">
            <House size={24}/>
            <span>Menu</span>
          </Link>

    </div>
    
  );
}