import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/pages/shipping.css";
import { api } from "../services/api";
import { createOrder } from "../services/order";

//la fecha y hora de entrega ahora se maneja en shipping
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const toInputDate = (d) => d.toISOString().slice(0, 10);

export default function Shipping() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // 🧹 Limpiar los datos guardados al entrar o refrescar
  useEffect(() => {
    localStorage.removeItem("shipping");
  }, []);

  // Campos del formulario
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [timeStr, setTimeStr] = useState("");

  // Estados de interacción y submit
  const [touchedName, setTouchedName] = useState(false);
  const [touchedPhone, setTouchedPhone] = useState(false);
  const [touchedAddress, setTouchedAddress] = useState(false);
  const [touchedDate, setTouchedDate] = useState(false);
  const [touchedTime, setTouchedTime] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Fecha mínima: 48 horas desde ahora
  const minDate = useMemo(() => addDays(new Date(), 2), []);
  const minDateStr = toInputDate(minDate);

  // Validaciones
  const isValidName = fullName.trim().length >= 4;
  const isValidPhone = /^\+?51?\s?9\d{8}$/.test(phone.trim()); // +51 9xxxxxxxx o 51 9xxxxxxxx
  const isValidAddress = address.trim().length >= 6;

  // Validar fecha/hora (mínimo 48h)
  const isValidDateTime = useMemo(() => {
    if (!dateStr || !timeStr) return false;
    const [y, m, d] = dateStr.split("-").map(Number);
    const [hh, mm] = timeStr.split(":").map(Number);
    const delivery = new Date(y, m - 1, d, hh, mm, 0, 0);
    return delivery.getTime() >= minDate.getTime();
  }, [dateStr, timeStr, minDate]);

  const isFormValid = isValidName && isValidPhone && isValidAddress && isValidDateTime;

  // Mostrar errores
  const showNameError = (touchedName || submitted) && !isValidName;
  const showPhoneError = (touchedPhone || submitted) && !isValidPhone;
  const showAddressError = (touchedAddress || submitted) && !isValidAddress;
  const showDateError = (touchedDate || submitted) && !dateStr;
  const showTimeError = (touchedTime || submitted) && !timeStr;
  const showDateTimeError = (touchedDate || touchedTime || submitted) && dateStr && timeStr && !isValidDateTime;

  const handleNext = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (!isFormValid) return;

    try {
      // Construir fecha/hora de entrega
      const [y, m, d] = dateStr.split("-").map(Number);
      const [hh, mm] = timeStr.split(":").map(Number);
      const fechaEntrega = new Date(y, m - 1, d, hh, mm, 0, 0);

      // Crear destinatario
      const destRes = await api.post("/api/destinatarios/create", {
        id_usuario: state.id_usuario,
        nombre_destinatario: fullName.trim(),
        direccion_destinatario: address.trim(),
        celular_destinatario: phone.trim(),
      });

      const id_destinatario = destRes.id_destinatario;

      //Crear pedido con fecha de entrega
      const id_pedido = await createOrder({
        id_usuario: state.id_usuario,
        id_destinatario,
        productos: state.productos,
        fecha_entrega: fechaEntrega.toISOString(),
      });

      //Navegar a Payment.jsx con el id_pedido
      navigate("/pago", { state: { id_pedido } });
    } catch (err) {
      console.error("Error en envío:", err);
      alert("No se pudo procesar el envío.");
    }
  };

  // Texto del aviso general
  const missing = [];
  if (submitted && !isValidName) missing.push("nombre");
  if (submitted && !isValidPhone) missing.push("celular (+51 9XXXXXXXX)");
  if (submitted && !isValidAddress) missing.push("dirección");
  if (submitted && !dateStr) missing.push("fecha de entrega");
  if (submitted && !timeStr) missing.push("hora de entrega");

  return (
    <section className="checkout-page">
      <h2 className="checkout-title">Datos del destinatario</h2>

      <form className="form" onSubmit={handleNext} noValidate>
        <div className="grid-2">
          {/* Nombre */}
          <label className="field">
            <span>Nombre Completo</span>
            <input
              type="text"
              placeholder="Nombres y apellidos"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={() => setTouchedName(true)}
              aria-invalid={showNameError}
            />
            <small
              className={`msg ${showNameError ? "is-visible" : ""}`}
              aria-live="polite"
            >
              {showNameError
                ? "Ingresa un nombre válido (mínimo 4 caracteres)."
                : "\u00A0"}
            </small>
          </label>

          {/* Celular */}
          <label className="field">
            <span>Celular</span>
            <input
              type="tel"
              placeholder="+51 9xxxxxxxx"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onBlur={() => setTouchedPhone(true)}
              aria-invalid={showPhoneError}
            />
            <small
              className={`msg ${showPhoneError ? "is-visible" : ""}`}
              aria-live="polite"
            >
              {showPhoneError
                ? "Formato válido: +51 9XXXXXXXX (9 y 8 dígitos más)."
                : "\u00A0"}
            </small>
          </label>
        </div>

        {/* Dirección */}
        <label className="field">
          <span>Dirección</span>
          <input
            type="text"
            placeholder="Calle, número, referencia"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onBlur={() => setTouchedAddress(true)}
            aria-invalid={showAddressError}
          />
          <small
            className={`msg ${showAddressError ? "is-visible" : ""}`}
            aria-live="polite"
          >
            {showAddressError
              ? "Ingresa una dirección más detallada (mínimo 6 caracteres)."
              : "\u00A0"}
          </small>
        </label>

        {/* Fecha / Hora */}
          <div className="grid-2 detail-when">
            <label className="field">
              <span>Fecha de Entrega</span>
              <input
                type="date"
                min={minDateStr}
                value={dateStr}
                onChange={(e) => setDateStr(e.target.value)}
                onBlur={() => setTouchedDate(true)}
                aria-invalid={showDateError}
              />
              <small className={`msg ${showDateError ? "is-visible" : ""}`} aria-live="polite">
                {showDateError ? "Selecciona una fecha de entrega." : "\u00A0"}
              </small>
            </label>

            <label className="field">
              <span>Hora de Entrega</span>
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                onBlur={() => setTouchedTime(true)}
                aria-invalid={showTimeError}
              />
              <small className={`msg ${showTimeError ? "is-visible" : ""}`} aria-live="polite">
                {showTimeError ? "Selecciona una hora de entrega." : "\u00A0"}
              </small>
            </label>
          </div>

        {/* Error de validación 48h */}
        {showDateTimeError && (
          <p className="hint" role="alert" style={{color: 'red'}}>
            La entrega debe ser con al menos 48 horas de anticipación.
          </p>
        )}

        {/* Aviso general */}
        {submitted && !isFormValid && (
          <p className="hint" role="alert">
            Falta completar: {missing.join(", ")}.
          </p>
        )}

        <button
          className="btn btn--block btn--primary"
          type="submit"
          disabled={!isFormValid}
        >
          Siguiente <span className="btn-arrow" aria-hidden>›</span>
        </button>
      </form>
    </section>
  );
}