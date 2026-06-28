# 🤝 Manos Venezuela

Aplicación web (PWA) solidaria para **conectar directamente a personas voluntarias con damnificados** por la catástrofe en Venezuela. Sin intermediarios: alguien publica qué necesita, un voluntario lo encuentra cerca, y coordinan por chat o WhatsApp.

> Herramienta gratuita y sin fines de lucro.

## ✨ Funciones

- **Publicar y buscar solicitudes** de ayuda con categoría (agua, alimentos, refugio, medicina, rescate…) y nivel de urgencia.
- **Mapa** con las solicitudes geolocalizadas (OpenStreetMap, sin API key).
- **Contacto directo** por WhatsApp / llamada y **chat en tiempo real** dentro de la app.
- **Gestión de ofertas**: el damnificado ve quién ofrece ayuda y acepta/rechaza.
- **PWA instalable** en el móvil, ligera y pensada para conexiones limitadas.
- Interfaz 100% en español.

## 🧱 Tecnología

| Capa | Herramienta |
|------|-------------|
| Frontend | Next.js 14 (App Router) + React 18 + TypeScript |
| Estilos | Tailwind CSS |
| Backend | Supabase (PostgreSQL, Auth, Realtime, Row Level Security) |
| Mapa | Leaflet + OpenStreetMap |
| PWA | Manifest + Service Worker |

## ✅ Estado: backend ya provisionado

Este paquete incluye un `.env.local` ya conectado a un proyecto Supabase
**dedicado** (`manos-venezuela`) con el esquema y la seguridad (RLS) aplicados.
Solo tienes que `npm install` y `npm run dev` para verla funcionando.

> Acceso instantáneo (opcional, recomendado en emergencia): en Supabase →
> **Authentication → Sign In / Providers**, activa **Anonymous sign-ins** o
> desactiva **Confirm email**. Sin ese cambio, el registro por correo funciona
> igual, con un email de confirmación de por medio.

## 🚀 Puesta en marcha

### 1. Instala dependencias

```bash
npm install
```

### 2. Crea un proyecto en Supabase

1. Entra en [supabase.com](https://supabase.com) y crea un **proyecto nuevo** (plan gratuito).
2. Ve a **SQL Editor**, pega el contenido de [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) y ejecútalo. Esto crea las tablas, la seguridad (RLS) y el tiempo real.
3. (Recomendado para emergencias) En **Authentication > Providers**:
   - Desactiva *Confirm email* para que la gente pueda entrar al instante, **o**
   - Activa *Anonymous sign-ins* para permitir el acceso rápido sin cuenta.

### 3. Configura las variables de entorno

```bash
cp .env.example .env.local
```

Rellena con los valores de **Project Settings > API**:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Arranca

```bash
npm run dev
```

Abre <http://localhost:3000>. Si no configuras Supabase, la app muestra una pantalla guiada explicando estos pasos.

## ☁️ Despliegue

Despliega gratis en [Vercel](https://vercel.com):

1. Sube este repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Añade las dos variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Deploy. ✅

## 🔐 Seguridad y privacidad

- Toda la base de datos está protegida con **Row Level Security**: cada persona solo puede editar sus propias solicitudes y leer los chats en los que participa.
- Las solicitudes solo son visibles para usuarios autenticados (protege a personas vulnerables del scraping).
- El teléfono de contacto se comparte porque es la vía para recibir ayuda; anima a los usuarios a no incluir datos sensibles innecesarios.

## 📁 Estructura

```
src/
  app/                 Rutas (App Router)
    page.tsx           Feed de solicitudes
    mapa/              Vista de mapa
    solicitudes/
      nueva/           Publicar solicitud
      [id]/            Detalle + ofertas + chat
    mensajes/          Conversaciones
    perfil/            Editar perfil
    entrar/            Autenticación
  components/          UI (tarjetas, filtros, mapa, chat…)
  lib/                 Cliente Supabase, tipos, constantes, utilidades
supabase/migrations/   Esquema SQL (tablas + RLS + realtime)
public/                Manifiesto PWA, íconos, service worker
```

## 🛟 Ideas para siguientes versiones

- Notificaciones push cuando alguien responde.
- Verificación de damnificados/voluntarios.
- Filtro por distancia a tu ubicación.
- Panel para organizaciones y refugios.
- Soporte multilingüe.
