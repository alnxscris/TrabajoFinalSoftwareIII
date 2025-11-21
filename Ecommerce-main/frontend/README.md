## SO Frontend (Linux‑ready)

## Linux (Debian) tu sistema base.

## Node LTS  el entorno de ejecución de JavaScript (necesario para Vite y React).

## Se recomienda usar nvm (Node Version Manager), que es la forma más limpia y flexible de instalar Node en Linux.

## Requisitos
- Linux (Debian)
- Node LTS (usa nvm)

## Más adelante,**cuando estés en en MobaXterm despues de conectarse al debian**, ahí sí se **copian y ejecutan en la terminal los siguientes comandos** (una sola vez por máquina):

```bash
# Descarga e instala nvm (Node Version Manager) desde su repositorio oficial.
# NVM permite instalar y cambiar versiones de Node fácilmente sin usar sudo.
curl -fsSL https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# Actualiza el entorno de la terminal para que los cambios de NVM se apliquen (esto hace que el comando nvm quede disponible sin reiniciar).
source ~/.bashrc

# Instala la última versión LTS (Long Term Support) de Node y la selecciona como activa.
Esto asegura que todos los miembros del equipo tengan la misma versión estable de Node.js, ideal para entornos Linux.
nvm install --lts
nvm use --lts




# cd frontend para entrar a la carpeta 
# iniciar el servidor   npm run dev   	levanta Vite y abre el navegador
# Local:   http://localhost:5173/
# detenerlo	   Ctrl + C	    detiene el servidor
# compilar para producción  	npm run build	  crea carpeta dist/ (se usa en Debian luego)
# probar build localmente    	npm run preview	  sirve la carpeta dist/ localmente