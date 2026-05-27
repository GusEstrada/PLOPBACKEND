# PLOP - Backend

API REST para la app PLOP: una mancha nueva cada día, dibújala a tu manera.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Runtime | Node.js + TypeScript |
| Framework | Express |
| Autenticación | JWT (jsonwebtoken + bcryptjs) |
| BD Relacional | PostgreSQL + TypeORM |
| BD No-Relacional | MongoDB + Mongoose |
| Archivos | Multer (avatares) |
| Validación | Zod |
| Deploy | Railway |

---

## Arquitectura de Base de Datos

### PostgreSQL — 7 tablas (relacional)

```
users           → id, name, email, passwordHash, bio, createdAt
daily_blots     → id, date, mainBlot (JSON), satellites (JSON), imageUrl, createdAt
drawings        → id, userId, blotId, lines (JSON), createdAt
avatar_configs  → id, userId, headUrl, eyesUrl, mouthUrl, accessoryUrl, skinColor
forum_posts     → id, userId, title, content, createdAt
forum_comments  → id, postId, userId, content, createdAt
stats           → id, date, totalDrawings, todayDrawings, totalUsers, createdAt
```

### MongoDB — 5 colecciones (no-relacional)

```
notifications       → userId, type, message, read, relatedId, createdAt
drawing_sessions    → userId, blotId, strokes[], lastActive, createdAt
analytics           → event, page, userId?, metadata, timestamp
gallery_likes       → userId, drawingId, createdAt  (unique compound index)
achievements        → userId, code, title, description, icon, unlockedAt
```

**Total: 12 tablas/colecciones**

---

## Endpoints

### Auth
```
POST /api/auth/register   → { name, email, password } → { token, user }
POST /api/auth/login      → { email, password } → { token, user }
GET  /api/auth/me         → perfil del usuario autenticado (requiere token)
```

### Blot (mancha diaria)
```
GET  /api/blot/today            → mancha del día
GET  /api/blot/:date            → mancha por fecha (YYYY-MM-DD)
POST /api/blot                  → crear/programar mancha (requiere token)
POST /api/blot/upload-image     → subir PNG de mancha + asignar a fecha (requiere token + multipart)
```

### Drawings
```
POST /api/drawings               → subir dibujo (requiere token)
GET  /api/drawings               → todos los dibujos (paginado)
GET  /api/drawings/:id           → dibujo específico
GET  /api/drawings/user/:userId  → dibujos de un usuario
POST /api/drawings/draft         → guardar borrador (requiere token)
GET  /api/drawings/draft/:blotId → recuperar borrador (requiere token)
```

### Gallery
```
GET    /api/gallery/feed             → feed paginado (?page=&limit=&date=)
POST   /api/gallery/:drawingId/like  → dar like (requiere token)
DELETE /api/gallery/:drawingId/like  → quitar like (requiere token)
GET    /api/gallery/:drawingId/likes → conteo de likes
```

### Profile
```
GET  /api/profile/:userId        → perfil público con avatar
PUT  /api/profile                → actualizar nombre/bio (requiere token)
PUT  /api/profile/avatar         → actualizar avatar (requiere token)
```

### Forum
```
POST /api/forum/posts                → crear post (requiere token)
GET  /api/forum/posts                → listar posts (paginado)
GET  /api/forum/posts/:id            → post + comentarios
POST /api/forum/posts/:id/comments   → comentar (requiere token)
```

### Stats
```
GET /api/stats → { totalDrawings, todayDrawings, totalUsers, daysActive }
```

### Avatar Catalog
```
GET /api/avatar-catalog   → lista todas las imágenes de avatar disponibles (carpeta uploads/avatars/)
```

### Upload
```
POST /api/upload/avatar-component   → subir SVG/PNG de avatar (requiere token + multipart)
```

---

## Imágenes

### Avatares (Mii Creator)
Pon tus archivos en `uploads/avatars/` con nombres como:

```
uploads/avatars/
├── head_redonda.svg
├── eyes_dots.svg
├── eyes_starry.svg
├── mouth_smile.svg
├── acc_crown.svg
└── acc_partyhat.svg
```

El endpoint `GET /api/avatar-catalog` lee la carpeta y agrupa por tipo (`head_`, `eyes_`, `mouth_`, `acc_`) para que el frontend las muestre.

### Manchas diarias (PNG)
Puedes subir tu PNG de la mancha via `POST /api/blot/upload-image` (o directamente a `uploads/blots/`) y asignarlo a una fecha con `POST /api/blot`.

---

## Cómo correr local

### Prerrequisitos
- Node.js 20+
- PostgreSQL (o Docker)
- MongoDB (o Docker)

### 1. Iniciar bases de datos (con Docker)
```bash
docker run -d --name plop-postgres -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=plop -p 5434:5432 postgres:16-alpine
docker run -d --name plop-mongo -p 27017:27017 mongo:7
```

### 2. Configurar variables de entorno
Editar `.env` (ya viene con defaults para local):
```
PORT=4000
PG_HOST=localhost
PG_PORT=5434
PG_USERNAME=postgres
PG_PASSWORD=postgres
PG_DATABASE=plop
MONGO_URI=mongodb://localhost:27017/plop
JWT_SECRET=plop-secret-key
CORS_ORIGIN=http://localhost:3000
```

### 3. Instalar y correr
```bash
npm install
npm run seed      # crea admin + 30 manchas diarias
npm run dev       # servidor en http://localhost:4000
```

### 4. Probar
```bash
curl http://localhost:4000/api/stats
curl http://localhost:4000/api/blot/today
```

---

## Credenciales de prueba (seed)

| Email | Password | Rol |
|-------|----------|-----|
| admin@plop.app | plop123 | Admin |

---

## Deploy en Railway

### Backend
1. Subir repo a GitHub
2. Railway → New Project → Deploy from GitHub repo
3. Agregar variables de entorno en Railway Dashboard:
   ```
   NODE_ENV=production
   PORT=4000
   JWT_SECRET=<clave-segura-aleatoria>
   PG_HOST=<host-supabase>
   PG_PORT=5432
   PG_USERNAME=postgres
   PG_PASSWORD=<password-supabase>
   PG_DATABASE=postgres
   MONGO_URI=<connection-string-mongodb-atlas>
   CORS_ORIGIN=<url-vercel>
   ```

### Frontend (Next.js)
- Subir a Vercel
- Agregar variable: `NEXT_PUBLIC_API_URL=https://<back-end>.railway.app`

### Servicios externos gratis
- **Supabase** → PostgreSQL gratis (500MB)
- **MongoDB Atlas M0** → MongoDB gratis (512MB)

---

## Frontend

Repositorio del frontend: [plop-frontend](https://github.com/tuusuario/plop-frontend) (Next.js + React + TypeScript + Tailwind + Konva)

---
