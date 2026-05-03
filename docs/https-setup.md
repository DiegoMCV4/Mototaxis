# 🔒 Guía de Configuración HTTPS con Certbot
## Dominio: mrt.viewdns.net (No-IP)

Esta guía detalla cómo obtener y renovar certificados SSL gratuitos de Let's Encrypt usando Certbot en tu servidor AWS EC2.

---

## Prerrequisitos

- ✅ Instancia EC2 con Ubuntu 22.04 corriendo
- ✅ Dominio `mrt.viewdns.net` apuntando a la IP pública de tu EC2 (configurado en No-IP)
- ✅ Puerto 80 y 443 abiertos en el Security Group de AWS
- ✅ Docker y Docker Compose instalados

---

## Paso 1 — Verificar que el DNS resuelve tu IP

```bash
# Desde tu máquina local o desde EC2
nslookup mrt.viewdns.net
# Debe mostrar la IP pública de tu EC2

# Verificar también con ping
ping mrt.viewdns.net
```

> [!NOTE]
> Si No-IP aún no propagó los cambios, espera 5-15 minutos y repite.

---

## Paso 2 — Instalar Certbot en EC2

```bash
# Conectarte a tu EC2
ssh -i tu-clave.pem ubuntu@mrt.viewdns.net

# Instalar Certbot
sudo apt update
sudo apt install -y certbot

# (Opcional) Instalar plugin de Nginx si no usas Docker
# sudo apt install -y python3-certbot-nginx
```

---

## Paso 3 — Obtener el certificado SSL (modo standalone)

> [!IMPORTANT]
> Antes de correr Certbot, detén temporalmente el servicio Nginx si está en el puerto 80.

```bash
# Detener Nginx temporalmente
docker compose stop nginx

# Obtener certificado para tu dominio
sudo certbot certonly --standalone \
  --non-interactive \
  --agree-tos \
  --email tu-email@ejemplo.com \
  --domains mrt.viewdns.net

# Los certificados se guardan en:
# /etc/letsencrypt/live/mrt.viewdns.net/fullchain.pem
# /etc/letsencrypt/live/mrt.viewdns.net/privkey.pem
```

---

## Paso 4 — Actualizar docker-compose para montar los certificados

Agrega el servicio Nginx al `docker-compose.yml` con los volúmenes de SSL:

```bash
# En tu carpeta del proyecto
cd /home/ubuntu/Moto

# Agregar el servicio Nginx al docker-compose
# (ya está configurado en nginx/nginx.conf y nginx/Dockerfile)
```

Agrega esto al final del `docker-compose.yml` si no está ya:

```yaml
  nginx:
    build: ./nginx
    container_name: mototaxi-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
      - /var/www/certbot:/var/www/certbot:ro
      - ./frontend/dist:/var/www/html/app:ro
    depends_on:
      - api-gateway
    networks:
      - mototaxi-network
```

---

## Paso 5 — Levantar todo con HTTPS

```bash
# Levantar todos los servicios
docker compose up --build -d

# Verificar que Nginx arrancó correctamente
docker logs mototaxi-nginx

# Probar HTTPS
curl -I https://mrt.viewdns.net/nginx-health
# Debe responder: HTTP/2 200
```

---

## Paso 6 — Renovación Automática del Certificado

Los certificados de Let's Encrypt expiran cada **90 días**. Configura renovación automática:

```bash
# Crear script de renovación
sudo nano /etc/cron.d/certbot-renew

# Contenido del cron (ejecuta cada día a las 3 AM):
0 3 * * * root certbot renew --quiet --deploy-hook "docker compose -f /home/ubuntu/Moto/docker-compose.yml restart nginx"
```

Verificar que funciona:
```bash
# Simular renovación (sin aplicar)
sudo certbot renew --dry-run
```

---

## Verificación Final

```bash
# Test SSL con curl
curl -v https://mrt.viewdns.net/health

# Verificar headers de seguridad
curl -I https://mrt.viewdns.net | grep -E "Strict|X-Frame|X-Content"

# Verificar el certificado
echo | openssl s_client -connect mrt.viewdns.net:443 2>/dev/null | openssl x509 -noout -dates
```

---

## URLs del Sistema en Producción

| Recurso | URL |
|---|---|
| API Gateway | `https://mrt.viewdns.net/api/` |
| Swagger Docs | `https://mrt.viewdns.net/docs` |
| App Frontend | `https://mrt.viewdns.net/` |
| Landing Page | `https://tu-proyecto.vercel.app` |
| Health Check | `https://mrt.viewdns.net/nginx-health` |
| WebSocket | `wss://mrt.viewdns.net/socket.io/` |
