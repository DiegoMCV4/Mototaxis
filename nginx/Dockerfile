FROM nginx:1.25-alpine

# Copiar la configuración personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Crear directorio para Certbot y para la app
RUN mkdir -p /var/www/certbot /var/www/html/app

# Exponer puertos HTTP y HTTPS
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
