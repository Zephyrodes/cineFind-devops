# CineFind - Movie Discovery

Proyecto fullstack que integra infraestructura como código, automatización de configuración y una aplicación web moderna. Demuestra prácticas de DevOps y arquitectura escalable.

## Estructura del Proyecto

```
.
├── terraform-azure/          # Infrastructure as Code
│   ├── main.tf              # Definición de recursos Azure
│   ├── variables.tf         # Variables de configuración
│   └── outputs.tf           # Outputs del despliegue
│
├── ansible-project/         # Configuration Management
│   ├── inventory.ini        # Definición de hosts
│   ├── setup.yml            # Playbook principal
│   └── roles/               # Roles reutilizables
│       ├── base/            # Setup inicial del sistema
│       ├── ssh/             # Configuración SSH
│       ├── nginx/           # Servidor web
│       └── app/             # Despliegue de aplicación
│
└── movie-app/               # Frontend React TypeScript
    ├── src/                 # Código fuente
    ├── dist/                # Build de producción
    └── package.json         # Dependencias
```

## Descripción

Aplicación de descubrimiento de películas que permite:

- Búsqueda en tiempo real de películas (con debounce para optimizar)
- Visualización de películas trending semanales
- Sistema de favoritos con persistencia en localStorage
- Interfaz responsiva con tema oscuro

Integrada con API de TMDB para datos de películas.

## Despliegue

### Paso 1: Crear infraestructura

```bash
cd terraform-azure
terraform init
terraform apply
```

Provisiona:
- Virtual machine Ubuntu 22.04 LTS
- Red virtual con subnet
- Security group con reglas HTTP y SSH
- IP pública estática

### Paso 2: Configurar servidor

```bash
cd ../ansible-project
ansible-playbook -i inventory.ini setup.yml
```

Ejecuta roles para:
- Actualización de paquetes del sistema
- Configuración SSH
- Instalación y configuración de nginx
- Despliegue de la aplicación

### Paso 3: Build de aplicación

```bash
cd ../movie-app
npm install
npm run build
```

Genera carpeta `dist/` con assets optimizados:
- HTML principal (0.47 KB)
- CSS compilado (12.65 KB gzipped)
- JavaScript compilado (202.29 KB gzipped)

## Desarrollo Local

```bash
cd movie-app
npm run dev          # Servidor development con HMR
npm run build        # Build para producción
npm run lint         # Análisis estático
npm run preview      # Preview del build
```

## Stack Técnico

Frontend:
- React 18.3.1
- TypeScript 5.2.2
- Vite 8.0.8
- CSS custom properties para theming

DevOps:
- Terraform >= 1.0 (IaC)
- Ansible >= 2.10 (Configuration management)
- Azure (Cloud provider)
- Nginx (Web server)

## Configuración

Variable de entorno requerida en `movie-app/.env`:

```
VITE_TMDB_API_KEY=your_api_key
```

Obtener API key: https://www.themoviedb.org/settings/api

## Nginx Configuration

```nginx
server {
    listen 80;
    root /var/www/html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|gif)$ {
        expires 1y;
        cache-control: public, immutable;
    }
}
```

La configuración SPA permite que todas las rutas se redirijan a index.html para que React Router funcione correctamente.

## Despliegue en Producción

URL actual: http://20.122.134.117/

Consideraciones para producción:
- Certificado SSL/TLS (Let's Encrypt)
- Variable de API key en Azure Key Vault
- Limitar acceso SSH por IP
- Habilitar monitoring (Azure Monitor, Application Insights)
- WAF para protección contra ataques comunes

## Notas Importantes

- `terraform.tfstate` contiene estado sensible de infraestructura
- `.env` con credenciales nunca debe commitirse
- El archivo `.gitignore` previene commits accidentales de archivos sensibles
- Estado remoto de Terraform recomendado para ambientes compartidos

---

Última actualización: Abril 2026
