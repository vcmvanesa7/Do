# Proyecto - Estructura multi-backend conectada a Supabase

Estructura de carpetas preparada para un ejemplo simple con 3 backends (login, niveles, ejercicios) y un frontend estático.

**Importante**: Reemplaza `SUPABASE_URL` y `SUPABASE_KEY` en `supabaseClient.js` por las credenciales de tu proyecto Supabase (usa las keys de servicio en entornos backend, y las anon/public para frontend si corresponde).

Mapping de tablas (ajusta según tu esquema):
- Backend1 -> `users` (auth / registro)
- Backend2 -> `levels`
- Backend3 -> `exercises`

Cómo usar (ejemplo):
1. Entrar a cada backend y ejecutar `npm install`.
2. Ejecutar `node index.js` en cada carpeta (o usar nodemon).
3. Abrir `frontend/index.html` en un navegador (puede ser servido con Live Server).

Puertos:
- Backend1: 3001 (Auth / Registro)
- Backend2: 3002 (Niveles)
- Backend3: 3003 (Ejercicios / Validaciones)

Este paquete contiene código de ejemplo — adáptalo a tus tablas y políticas RLS de Supabase.


# SYKER Demo - Backend + Frontend con Supabase

Este proyecto incluye un backend en Node.js/Express y un frontend estático que consumen datos desde Supabase.

## Estructura del proyecto

```
Do/
├── backend/
│   ├── .env
│   ├── index.js
│   ├── package.json
│   ├── config/
│   │   ├── db.js
│   │   ├── jwt.js
│   ├── middlewares/
│   │   └── authMiddleware
│   ├── controllers/
│   │   └── authControllers.js
│   └── routes/
│       ├── authRoutes.js
│       ├── exercisesRouter.js
│       ├── index.js
│       └── levelsRoutes.js
└── frontend/
    ├── index.html
    ├── css/
    ├── img/
    └── js/
        └── main.js
```

## Instalación y configuración

### 1. Clona el repositorio

```sh
git clone <URL-del-repo>
cd Do
```

### 2. Instala las dependencias del backend

```sh
cd backend
npm install
```

### 3. Configura Supabase

Edita el archivo `.env` en la carpeta `backend` y coloca tus credenciales de Supabase:

```
SUPABASE_URL=<tu-url>
SUPABASE_KEY=<tu-key>
```

Estas variables se usan en [`config/db.js`](backend/config/db.js).

### 4. Inicia el servidor backend

```sh
npm start
```
El backend se ejecuta en el puerto **3001** por defecto.

### 5. Abre el frontend

Abre [`frontend/index.html`](frontend/index.html) en tu navegador. Puedes usar la extensión Live Server de VS Code para recarga automática.

## Endpoints disponibles

- **Autenticación:** `http://localhost:3001/auth`
- **Niveles:** `http://localhost:3001/levels`
- **Ejercicios:** `http://localhost:3001/exercises`

El frontend consume los endpoints de niveles y ejercicios desde [`main.js`](frontend/js/main.js).

## Personalización

- Adapta las rutas y controladores según tu lógica y tablas en Supabase.
- Revisa las políticas RLS y los permisos en tu proyecto Supabase.

---

Este proyecto es una base para conectar un backend Express con Supabase y un frontend simple.





# 📘 Frontend SPA 

Este proyecto es un **SPA (Single Page Application)** construido con **Vite + Vanilla JS**.  

## 🚀 Requisitos previos  
Antes de comenzar asegúrate de tener instalado en tu PC:  

- [Node.js](https://nodejs.org/) (v18 o superior recomendado)  
- npm (se instala junto con Node.js)  

Verifica las versiones instaladas:  
```bash
node -v
npm -v
```

---

## 📂 Instalación  

1. **Clonar el repositorio**  
   ```bash
   git clone https://github.com/vcmvanesa7/Do.git
   cd Do/frontend
   ```

2. **Instalar dependencias**  
   ```bash
   npm install
   ```

---

## ▶️ Ejecutar en modo desarrollo  

```bash
npm run dev
```

Esto iniciará un servidor de desarrollo con **Vite**.  
La terminal mostrará una URL parecida a:  
```
  ➜  Local:   http://localhost:5173/
```

Abre esa dirección en tu navegador para ver la app en acción.  

---

## 🏗️ Build de producción  

Para generar la versión optimizada para producción:  

```bash
npm run build
```

Esto creará una carpeta `/dist` lista para desplegar en un hosting.  

Si quieres **probar localmente el build**:  
```bash
npm run preview
```

---

## 📁 Estructura del proyecto  

```
frontend/
├── assets/                # Recursos estáticos (imágenes, íconos, etc.)
├── node_modules/          # Dependencias instaladas por npm
├── public/                # Archivos públicos accesibles directamente (favicons, etc.)
├── src/                   # Código fuente principal del frontend
│   ├── viewsjs/           # Vistas principales de la app
│   │   ├── course.js      # Vista curso individual
│   │   ├── dashboard.js   # Vista principal con todos los cursos
│   │   ├── level.js       # Vista de niveles (teoría + ejercicios)
│   │   ├── login.js       # Vista de login
│   │   ├── profile.js     # Vista de perfil de usuario
│   │   ├── public.js      # Vista pública (landing inicial)
│   │   └── register.js    # Vista de registro
│   ├── main.js            # Punto de entrada de la aplicación
│   └── router.js          # Manejo de rutas entre vistas
├── index.html             # HTML principal
├── package.json           # Dependencias y scripts del proyecto
├── package-lock.json      # Bloqueo de versiones de dependencias
└── README.md              # Documentación del proyecto

```

---

## 🔑 Notas importantes  

- Todo el código de la app está en `src/`.  
- Los estilos globales se encuentran en `src/assets/css/styles.css`.  
- Las vistas de la app se encuentran en `src/views/`.  
- El enrutador `router.js` se encarga de cargar dinámicamente cada vista en el SPA.  
