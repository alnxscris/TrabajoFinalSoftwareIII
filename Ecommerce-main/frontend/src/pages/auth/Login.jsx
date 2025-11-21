import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../services/auth'; //autenticacion de usuario

const Login = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Por favor, complete todos los campos.');
      return;
    } try {
      const res = await loginUser({ email, password });
      if (!res.token || !res.user) {
        //validar estructura de la respuesta
        console.error('Respuesta invalida del servidor.', res);
        setError('Ocurrio un error al iniciar sesión. Intente nuevamente');
        return;
      }
      
      //guarda datos del usuario en el almacenamiento local
      localStorage.setItem("user", JSON.stringify(res.user));
      navigate('/home');
    } catch (err) {
      console.error("Error en login:", err);
      setError(err.mensaje || 'Credenciales inválidas.');
    }
    
  };

  return (
    <section className="auth">
      <h2>Iniciar Sesión</h2>
      {error && <p className="error" role="alert">{error}</p>}

      <form onSubmit={onSubmit} className="form">
        <label className="form__row">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            required
          />
        </label>

        <label className="form__row">
          <span>Contraseña</span>
          <input
            type="password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            required
          />
        </label>

        <button className="btn" type="submit">Entrar</button>
      </form>
    </section>
  );
};

export default Login;
