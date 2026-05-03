# 🔑 Guía de Configuración — GitHub Secrets & Git Push
## Proyecto MotoTaxi

---

## PASO 1 — Subir el proyecto a GitHub

Ejecuta estos comandos en la raíz del proyecto `c:\Moto`:

```bash
# 1. Inicializar Git (si aún no está)
git init

# 2. Agregar todos los archivos
git add .

# 3. Commit inicial
git commit -m "feat: arquitectura completa - 5 microservicios + MongoDB + Redis + CI/CD + Landing"

# 4. Crear el branch main
git branch -M main

# 5. Conectar a tu repositorio GitHub (reemplaza con tu URL)
git remote add origin https://github.com/TU-USUARIO/mototaxi.git

# 6. Subir
git push -u origin main
```

---

## PASO 2 — Crear las ramas de trabajo (Scrum)

```bash
# Crear rama develop (integración continua)
git checkout -b develop
git push -u origin develop

# Volver a main
git checkout main
```

---

## PASO 3 — Configurar GitHub Secrets

Ve a tu repositorio en GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Secrets de AWS

| Secret Name | Cómo obtenerlo |
|---|---|
| `AWS_ACCESS_KEY_ID` | AWS Console → IAM → Users → Tu usuario → Security credentials → Create access key |
| `AWS_SECRET_ACCESS_KEY` | Se muestra al crear el access key (guárdalo de inmediato) |
| `AWS_ACCOUNT_ID` | AWS Console → esquina superior derecha → tu número de cuenta (12 dígitos) |
| `S3_BUCKET_APP` | Nombre del bucket S3 que crees para el frontend (ej: `mototaxi-app-frontend`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | CloudFront → Distributions → ID de tu distribución |

### Secrets de Vercel

| Secret Name | Cómo obtenerlo |
|---|---|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create |
| `VERCEL_ORG_ID` | vercel.com → Settings → General → Team ID |
| `VERCEL_PROJECT_ID_LANDING` | En Vercel, abre el proyecto de la landing → Settings → Project ID |

### Variable de entorno del frontend

| Secret Name | Valor |
|---|---|
| `VITE_API_URL` | `https://mrt.viewdns.net/api` |

---

## PASO 4 — Conectar Landing Page con Vercel

1. Entra a **vercel.com** → **New Project**
2. Importa tu repositorio de GitHub
3. Configura:
   - **Root Directory:** `landing` ← muy importante
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Agrega la variable de entorno: `VITE_APP_URL = https://mrt.viewdns.net`
5. Deploy → Vercel te dará una URL como `mototaxi-landing.vercel.app`

---

## PASO 5 — Verificar que CI/CD funciona

Después de hacer push, ve a tu repositorio → **Actions** y verifica:

- ✅ **CI** corre automáticamente en cada push
- ✅ **Deploy Backend** corre solo cuando hay push a `main` con cambios en `services/`
- ✅ **Deploy Frontend** corre solo cuando hay push a `main` con cambios en `frontend/` o `landing/`

```bash
# Para hacer un push de prueba y activar CI:
echo "# test CI" >> README.md
git add README.md
git commit -m "ci: test github actions pipeline"
git push
```
