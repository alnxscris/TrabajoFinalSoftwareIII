import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerUser } from "../../services/auth";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setFormData((s) => ({ ...s, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    // Validación simple
    if (!formData.nombre || !formData.email || !formData.password) {
      setError('Por favor, complete todos los campos.');
      return;
    } try {
      setError('');
      setSuccess(false);

      console.log("Datos enviados", formData);

      const res = await registerUser(formData);

      console.log("Respuesta del backend", res);

      if (!res || res.error){
       setError(res.error || "No se pudo registrar el usuario.");
       setSuccess(false);
       return;
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/home"); //redirigimos al home
      }, 1500);
    } catch (err){
      console.error("Error al registrar:", err);
      setError(err.mensaje || "No se pudo registrar el usuario.");
    }
  };

  return (
    <section className="auth">
      <h2>Registro</h2>

      {/* Mensaje de error */}
      {error && <p className="error" role="alert">{error}</p>}

      {/* Mensaje de éxito */}
      {success && (
        <p
          style={{
            color: '#059669',
            backgroundColor: '#ecfdf5',
            padding: '8px 12px',
            borderRadius: '8px',
            fontWeight: '600',
            marginBottom: '10px'
          }}
        >
          ✅ Registro exitoso. Redirigiendo...
        </p>
      )}

      <form onSubmit={onSubmit} className="form">
        <label className="form__row">
          <span>Nombre</span>
          <input
            name="nombre"
            value={formData.nombre}
            onChange={onChange}
            required
          />
        </label>

        <label className="form__row">
          <span>Email</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            required
          />
        </label>

        <label className="form__row">
          <span>Contraseña</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            required
          />
        </label>

        <button className="btn" type="submit" disabled={success}>
          Crear cuenta
        </button>
      </form>
    </section>
  );
};

export default Register;