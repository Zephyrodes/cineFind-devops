# GitHub Actions Workflows

Este directorio contiene los workflow de CI/CD para el proyecto CineFind DevOps.

## 📋 Workflows Implementados

### 1. **react-ci.yml** - CI de la Aplicación React
Ejecuta en cada push/PR a archivos en `movie-app/`

**Acciones:**
- ✓ Instala dependencias
- ✓ Ejecuta ESLint
- ✓ Compila la aplicación
- ✓ Verifica que `dist/` se genere correctamente
- ✓ Guarda el artifact del build por 5 días

**Disparadores:**
- Push a `main` en `movie-app/**`
- Pull requests a `main` en `movie-app/**`

---

### 2. **terraform-validation.yml** - Validación de Terraform
Ejecuta en cada push/PR a archivos en `terraform-azure/`

**Acciones:**
- ✓ Valida sintaxis de Terraform
- ✓ Verifica formato (`terraform fmt`)
- ✓ Genera plan de cambios (`terraform plan`)
- ✓ Comenta en PRs con resultados

**Disparadores:**
- Push a `main` en `terraform-azure/**`
- Pull requests a `main` en `terraform-azure/**`

---

### 3. **ansible-validation.yml** - Validación de Ansible
Ejecuta en cada push/PR a archivos en `ansible-project/`

**Acciones:**
- ✓ Instala Ansible y ansible-lint
- ✓ Valida sintaxis de playbooks
- ✓ Verifica inventory.ini existe
- ✓ Revisa roles y variables

**Disparadores:**
- Push a `main` en `ansible-project/**`
- Pull requests a `main` en `ansible-project/**`

---

### 4. **security-scan.yml** - Escaneo de Seguridad
Ejecuta en cada push/PR a cualquier rama

**Acciones:**
- 🔐 Detecta secretos con `detect-secrets`
- 🔐 Valida que API keys no estén expuestas
- 🔐 Ejecuta `npm audit` en dependencias
- 🔐 Ejecuta análisis CodeQL
- 🔐 Verifica permisos de archivos
- 🔐 Verifica `.gitignore` cubre secretos

**Disparadores:**
- Push a `main`
- Pull requests a `main`
- Ejecución semanal cada domingo (scheduled)

---

### 5. **deploy.yml** - Despliegue Automático
Ejecuta en push a `main` después de que todos los tests pasen

**Acciones:**
- 🚀 Ejecuta todos los tests
- 🚀 Valida infraestructura
- 🚀 Notifica estado
- 🚀 Crea release automática en GitHub

**Disparadores:**
- Push a `main`
- Manual (workflow_dispatch)

**Nota:** El despliegue actual crea releases. Para activar despliegue automático a Azure:
1. Configura `AZURE_CREDENTIALS` en los secrets del repo
2. Descomenta las secciones `deploy-to-azure` en `deploy.yml`

---

## 🔧 Configuración Requerida

### Secrets de GitHub

Aunque los workflows funcionan sin secretos, para activar despliegue automático necesitas:

```
AZURE_CREDENTIALS: JSON con credenciales de Azure Service Principal
TMDB_API_KEY: (Opcional) Clave de API de TMDB
```

Para agregar secre:

1. Ve a **Settings** > **Secrets and variables** > **Actions**
2. Click **New repository secret**
3. Configura `AZURE_CREDENTIALS` con tu Service Principal

### Obtener AZURE_CREDENTIALS

```bash
az ad sp create-for-rbac \
  --name cineFind-ci \
  --role Contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID
```

Copiar el JSON resultante como secret `AZURE_CREDENTIALS`.

---

## 📊 Estado de los Workflows

Todos los workflows están **ACTIVOS** por defecto.

Para desactivar uno:
1. Abre el archivo `.yml`
2. Comenta las líneas `on:` al inicio
3. Haz commit

Para ver resultados:
- Ve a la pestaña **Actions** en el repo de GitHub

---

## 🚀 Ejemplos de Uso

### Ejecutar workflow manualmente

```bash
# Desde GitHub CLI
gh workflow run deploy.yml

# Especificar ambiente
gh workflow run deploy.yml -f environment=staging
```

### Ver logs

```bash
# Listar workflows
gh run list

# Ver logs de un run específico
gh run view RUN_ID --log
```

### Descargar artifacts

```bash
# Listar artifacts
gh run list --limit 1

# Descargar build de React
gh run download RUN_ID -n react-build
```

---

## ⚠️ Problemas Comunes

| Problema | Causa | Solución |
|----------|-------|----------|
| "npm: command not found" | Node.js no instalado en runner | Usa `actions/setup-node@v4` |
| Terraform plan falla | State local no inicializado | Usa `terraform init -backend=false` |
| Ansible syntax error | Playbook mal formado | Ejecuta localmente antes: `ansible-playbook --syntax-check` |
| CodeQL timeout | Código muy complejo | Reduce análisis o aumenta timeout |
| Secrets detectados falsamente | Palabras coinciden con patrones | Ajusta configuración en security-scan.yml |

---

## 📝 Próximos Pasos

1. **Activar SAST:** Descomentar `codeql-analysis` en `security-scan.yml`
2. **Notificaciones:** Integrar Slack o email para alertas
3. **Aprovación manual:** Agregar approval para cambios en producción
4. **Badges:** Agregar state badges en README principal
5. **Dependency updates:** Configurar Dependabot para actualizar deps automáticamente

---

## 🔗 Referencias

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Terraform GitHub Actions](https://registry.terraform.io/modules/hashicorp/setup-terraform/gh/latest)
- [Ansible Testing](https://docs.ansible.com/ansible/latest/cli/)
- [CodeQL Analysis](https://codeql.github.com/)
