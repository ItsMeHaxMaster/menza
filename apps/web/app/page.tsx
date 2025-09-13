'use client';
import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  function desc() {
    return "A Logiker menza alkalmazás webes felülete.";
  }
  return (
    <div className={styles.page}>
      <header>
        <h1>Logiker Menza</h1>
        <img src="./imgs/account.png" alt="Account" />
      </header>
      <main className={styles.main}>

        <table>
          <thead>
            <tr>
              <th></th>
              <th>Hétfő</th>
              <th>Kedd</th>
              <th>Szerda</th>
              <th>Csütörtök</th>
              <th>Péntek</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Menü 1</td>
              <td>Gulyás</td>
              <td>Pörkölt</td>
              <td>Rántott hús</td>
              <td>Halászlé</td>
              <td>Töltött káposzta</td>
            </tr>
            <tr>
              <td>Menü 2</td>
              <td>Csirkepaprikás</td>
              <td>Brassói aprópecsenye</td>
              <td>Lencsefőzelék fasírttal</td>
              <td>Rántott sajt</td>
              <td>Húsleves</td>
            </tr>
            <tr>
              <td>Menü 3</td>
              <td>Halászlé</td>
              <td>Töltött káposzta</td>
              <td>Rántott gomba</td>
              <td>Gyümölcsleves</td>
              <td>Főzelék</td>
            </tr>
          </tbody>
        </table>
      </main>
    </div>
  );
}
