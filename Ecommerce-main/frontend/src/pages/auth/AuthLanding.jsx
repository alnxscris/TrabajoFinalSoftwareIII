import { useState } from "react";
import Login from "./Login";
import Register from "./Register";


const AuthLanding = () => {
  const [activeForm, setActiveForm] = useState("login"); // "login" | "register"

  return (
    <section className="auth-landing">
      <div className="auth-wrap">
        {/* IZQUIERDA: imagen “phone/card” */}
        <aside className="auth-media">
          <div className="media-frame">
            <img
              src="/images/imagen1.jpg"       
              alt="Regalo destacado"
              className="media-img"
            />
          </div>
          <h2 className="media-title">MiAri Detalles</h2>
        </aside>

        {/* DERECHA: tabs + formulario en tarjeta */}
        <div className="auth-side">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${activeForm === "login" ? "is-active" : ""}`}
              onClick={() => setActiveForm("login")}
            >
              Iniciar Sesión
            </button>
            <button
              className={`auth-tab ${activeForm === "register" ? "is-active" : ""}`}
              onClick={() => setActiveForm("register")}
            >
              Registrarse
            </button>
          </div>

          <div className="auth-card">
            {activeForm === "login" ? <Login /> : <Register />}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AuthLanding;
