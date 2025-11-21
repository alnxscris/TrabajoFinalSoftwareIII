# Backend API - Ecommerce System

Servidor REST API desarrollado en **Node.js** con **Express**. Este servicio maneja la lógica de negocio, autenticación y la conexión con la base de datos MariaDB.

## Arquitectura de Conexión

Este backend está diseñado para funcionar en un entorno híbrido complejo:
1.  **El Backend** corre en un contenedor Docker dentro de una instancia AWS (Debian).
2.  **La Base de Datos** corre en una Máquina Virtual local (fuera de la nube).
3.  **La Conexión** se realiza mediante un **Túnel SSH Inverso**.

## Variables de Entorno (.env)

Es **obligatorio** crear un archivo `.env` en esta carpeta. La configuración cambia dependiendo de si estás probando localmente o desplegando en AWS.

### Variables Generales
| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (Default: `4000`) |
| `JWT_SECRET` | Clave secreta para firmar tokens de sesión |
| `NODE_ENV` | `development` o `production` |

### 🔌 Configuración de Base de Datos

**CASO 1: Despliegue en AWS (Con Túnel SSH)**
Para que el contenedor Docker pueda "ver" el túnel SSH que está en el host de AWS:

```env
DB_HOST=host.docker.internal
DB_PORT=3306
DB_USER=tu_usuario_bd
DB_PASS=tu_contraseña_bd
DB_NAME=ecommerce