import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../db.js';
import dotenv from 'dotenv';

dotenv.config();

// Registro de usuario
export const register = async (req, res) => {
  const {
    nombre: nombre_usuario,
    email: correo_usuario,
    password: contrasena
  } = req.body;

  try {
    const existe = await pool.query(
      'SELECT * FROM usuarios WHERE correo_usuario = ? OR nombre_usuario = ?',
      [correo_usuario, nombre_usuario]
    );
    if (existe.length > 0) {
      return res.status(409).json({ mensaje: 'El correo o nombre de usuario ya están registrados.' });
    }

    //Verificar si la contraseña ya está en uso
    const usuarios = await pool.query('SELECT contrasena_hash FROM usuarios');
    for (const u of usuarios) {
      const misma = await bcrypt.compare(contrasena, u.contrasena_hash);
      if (misma) {
        return res.status(400).json({ mensaje: 'Esa contraseña ya está en uso.' });
      }
    }

    //contraseña encriptada
    const salt = await bcrypt.genSalt(10);
    const contrasena_hash = await bcrypt.hash(contrasena, salt);

    console.log("Insertando usuario:", { nombre_usuario, correo_usuario, contrasena_hash });
    //insertar nuevo usuario
    await pool.query(
      'INSERT INTO usuarios (nombre_usuario, correo_usuario, contrasena_hash) VALUES (?, ?, ?)',
      [nombre_usuario, correo_usuario, contrasena_hash]
    );

    console.log("Usuario insertado correctamente");

    res.status(201).json({ mensaje: 'Usuario registrado correctamente.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar el usuario.' });
  }
};

//inicio de sesion
export const login = async (req, res) => {
  const {
    email: correo_usuario,
    password: contrasena
  } = req.body;

  console.log("Login recibido:", req.body);

  try {
    const rows = await pool.query('SELECT * FROM usuarios WHERE correo_usuario = ?', [correo_usuario]);
    
    console.log("Usuario encontrado:", rows);
    
    if (rows.length === 0) {
      return res.status(400).json({ mensaje: 'Correo no encontrado.' });
    }

    const usuario = rows[0];
    console.log("Comparando:", contrasena, usuario.contrasena_hash);

    const contrasenaValida = await bcrypt.compare(contrasena, usuario.contrasena_hash);
    console.log("¿Contraseña válida?", contrasenaValida);

    if (!contrasenaValida) {
      return res.status(401).json({ mensaje: 'Contraseña incorrecta.' });
    }

    //Crear token JWT
    const token = jwt.sign(
      { id_usuario: usuario.id_usuario, correo: usuario.correo_usuario },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      mensaje: 'Inicio de sesión exitoso.',
      token,
      user: {
        id_usuario: usuario.id_usuario,
        nombre_usuario: usuario.nombre_usuario,
        correo_usuario: usuario.correo_usuario,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    //console.error(error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión.' });
  }
};