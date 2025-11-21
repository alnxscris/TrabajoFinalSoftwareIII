# Proyecto Ecommerce - Sistemas Operativos

Aplicación web de comercio electrónico ("Miari Detalles") dockerizada, implementada con una arquitectura de microservicios y base de datos externa.

## Arquitectura

El sistema se compone de tres partes principales:
1.  **Frontend:** React + Vite (Servido con Nginx en Docker).
2.  **Backend:** Node.js + Express (Ejecutado en Docker).
3.  **Base de Datos:** MariaDB (Ejecutada en una Máquina Virtual Debian externa).

## Requisitos Previos

* Docker y Docker Compose instalados.
* Acceso a una instancia de MariaDB (local o en VM).
* Node.js (opcional, solo para desarrollo local sin Docker).

## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone <URL_DE_TU_REPO>
cd Ecommerce