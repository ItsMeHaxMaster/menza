import "../globals.css";
import "./page.modules.css";

export default function CartPage() {
  return (
    <main className="cart-container">
      <h1 className="cart-title">Kosár és fizetés</h1>

      <div className="cart-elements">
        {}
        <p className="empty-cart">A kosár jelenleg üres.</p>
      </div>


      <div className="cart-buttons">
        <button className="btn btn-blue">Fizetés</button>
        <button className="btn btn-back"><a href=""></a>Vissza a menühöz</button>
      </div>
    </main>
  );
}