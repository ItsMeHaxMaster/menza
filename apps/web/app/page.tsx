'use client';
import Image from "next/image";
import styles from "./page.module.css";
import { Info, ShoppingCart, User, Utensils } from "lucide-react";

export default function Home() {
  return (
    <div className={styles.page}>
      <header>
        <h1>Logiker Menza</h1>
        <button className={"navButton"}><User size={40}/></button>
        <button className={"navButton"} style={{ marginLeft: '1rem'}}><ShoppingCart size={40}/></button>
      </header>
      <main className={styles.main}>
        <table>
          <thead>
            <tr>
              <th><Utensils/></th>
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
              <td> <span>Gulyás</span> <div> 
                Összetevők
Az allergének vastag betűvel jelölve
padlizsán, vöröshagyma, paradicsom, pritaminpaprika, napraforgóolaj, olívaolaj, aszalt paradicsom (paradicsom, napraforgóolaj, borecet, fuszerek, citromsav, aszkorbinsav. szulfitokat tartalmazhat), kapribogyó, halloumi grillsajt (paszt. tehéntej; paszt. kecsketej és juhtej; só; oltóenzim; szárított mentalevél), fokhagyma, steakfűszer (só, bors, vöröshagyma, fokhagyma, mustármag, fűszerek) a fűszer nyomokban gluténtartalmú gabonaféléket, tojást, tejet (laktóz), zellert, szóját, mustárt és szezámmagot tartalmazhat, menta, balzsamecet (fehérborecet, szőlőlésűrítmény, almalésűr., tölgyfaforgács kivonat, kálium-metabiszulfit, ammóniás karamell),barnacukor, bazsalikom, só,bors, zellerszár
</div>
<button className={"infoButton"}><Info /></button>
</td>
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
