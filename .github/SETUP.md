# Configuración de GitHub Actions - Guía Setup

## ✅ Checklist de Configuración

- [ ] Workflows creados en `.github/workflows/`
- [ ] Repositorio público o privado en GitHub
- [ ] GitHub Actions análisis habilitado
- [ ] Permisos de `security-events: write` configurados en `security-scan.yml`
- [ ] Secretos de Azure configurados

---

## 🔐 Agregar Secretos a GitHub

### Vía GitHub Web

1. Ve a tu repositorio en GitHub
2. **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**

### Vía GitHub CLI

```bash
# Requerimientos previos
gh auth login

# Agregar secreto
gh secret set AZURE_CREDENTIALS < azure_credentials.json

# Listar secretos
gh secret list

# Eliminar secreto
gh secret delete AZURE_CREDENTIALS
```

---

## 🔑 Secretos

### AZURE_CREDENTIALS (para deploy automático)

```bash
# 1. Crear Service Principal
az ad sp create-for-rbac \
  --name "cineFind-github-actions" \
  --role "Contributor" \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
  --json-auth

# 2. Copiar el JSON completo resultante
# 3. En GitHub: Settings > Secrets > New repository secret
# 4. Nombre: AZURE_CREDENTIALS
# 5. Pegar JSON
```

Formato esperado:
```json
{
  "clientId": "____",
  "clientSecret": "____",
  "subscriptionId": "____",
  "tenantId": "____"
}
```

---

## ⚠️ Fix: CodeQL - `Resource not accessible by integration`

Si el job `code-scan` falla con este error al subir resultados SARIF, es porque
el `GITHUB_TOKEN` no tiene permiso `security-events: write` declarado explícitamente.

### Causa

Sin declarar permisos, el token opera en modo de solo lectura por defecto,
bloqueando la carga de resultados al tab de Security.

### Solución: actualizar el job `code-scan` en `security-scan.yml`

```yaml
  code-scan:
    runs-on: ubuntu-latest
    name: CodeQL Scan
    permissions:               # ← Agregar este bloque
      actions: read
      contents: read
      security-events: write   # ← Requerido para subir resultados SARIF
    strategy:
      matrix:
        language: [ 'javascript' ]
    steps:
      - uses: actions/checkout@v4
      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3       # ← v2 → v3 (v2 está deprecado)
        with:
          languages: ${{ matrix.language }}
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3  # ← v2 → v3
      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3    # ← v2 → v3
```

### Alternativa: permisos globales en el workflow

Si varios jobs necesitan estos permisos, puedes declararlos una sola vez
antes de la sección `jobs:`:

```yaml
permissions:
  actions: read
  contents: read
  security-events: write
```

### Verificar permisos del repositorio

Si el error persiste, revisa la configuración en:

**Settings → Actions → General → Workflow permissions**

Asegúrate de que esté en **"Read and write permissions"**, o que la opción
**"Allow GitHub Actions to create and approve pull requests"** esté habilitada.

---

## 🧪 Probar Workflows Localmente

### Usar `act` para simular GitHub Actions

```bash
# Instalar act
brew install act  # macOS
# o
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

# Ejecutar un workflow
act push -j test-all

# Ver workflows disponibles
act -l

# Ejecutar con secretos
act -s TMDB_API_KEY='tu-key-aqui' push
```

### Validar YAML

```bash
# Instalar yamllint
pip install yamllint

# Validar todos los workflows
yamllint .github/workflows/

# Validar un workflow específico
yamllint .github/workflows/react-ci.yml
```

---

## 📊 Monitorear Workflows

### GitHub Web

1. Ve a **Actions** en tu repositorio
2. Ver estado de todos los runs
3. Click en un run para ver detalles

### GitHub CLI

```bash
# Ver últimos runs
gh run list --limit 10

# Ver detalles de un run
gh run view RUN_ID

# Ver logs de un job
gh run view RUN_ID --log

# Ver logs de un job específico
gh run view RUN_ID --log --job JOB_ID

# Descargar artifact
gh run download RUN_ID -n ARTIFACT_NAME
```

### API GraphQL

```bash
# Usar gh para GraphQL queries
gh api graphql -f owner='{owner}' -f name='{repo}' < query.graphql
```

---

## 🚀 Habilitar Despliegue Automático a Azure

1. **Configura AZURE_CREDENTIALS:**
   ```bash
   # Seguir pasos en sección anterior
   ```

2. **Descomenta la sección `deploy-to-azure` en `deploy.yml`:**
   ```yaml
   deploy-to-azure:
     runs-on: ubuntu-latest
     name: Deploy to Azure
     needs: [test-all, validate-infrastructure]
     if: github.ref == 'refs/heads/main' && needs.test-all.result == 'success'
     environment: production
   ```

3. **Merge a main** - El deploy automático se ejecutará

---

## 🛠️ Troubleshooting

### Workflow no se ejecuta

```bash
# Verificar syntax
yamllint .github/workflows/react-ci.yml

# Verificar triggers
cat .github/workflows/react-ci.yml | grep -A 5 "on:"

# Verificar paths si usa path trigger
git status  # Ver si los archivos modificados match paths
```

### Job falla sin razón clara

```bash
# Re-run el job
gh run rerun RUN_ID

# Re-run con debug
gh run rerun RUN_ID --debug
```

### Timeout en workflow

- Aumentar timeout: `timeout-minutes: 30`
- Optimizar steps: paralelizar jobs
- Usar `if: always()` para continuar si hay fallos

### Secreto no se pasa correctamente

```bash
# Debug: no imprimas el secreto nunca!
# En su lugar, usa:
- name: Debug (seguro)
  run: |
    if [ -z "${{ secrets.MY_SECRET }}" ]; then
      echo "Secret no configurado"
    else
      echo "Secret configurado correctamente"
    fi
```

| Problema | Causa | Solución |
|----------|-------|----------|
| `Resource not accessible by integration` | Token sin `security-events: write` | Agregar bloque `permissions` al job `code-scan` |
| CodeQL actions deprecadas | Uso de `codeql-action/v2` | Migrar a `codeql-action/v3` |
| `npm: command not found` | Node.js no instalado en runner | Usar `actions/setup-node@v4` |
| Terraform plan falla | State local no inicializado | Usar `terraform init -backend=false` |
| Ansible syntax error | Playbook mal formado | Ejecutar localmente: `ansible-playbook --syntax-check` |
| Secrets detectados falsamente | Palabras coinciden con patrones | Ajustar configuración en `security-scan.yml` |

---

## 📖 Documentación Adicional

- [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that Trigger Workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)
- [CodeQL Action v3 Migration](https://github.blog/changelog/2024-01-12-code-scanning-deprecation-of-codeql-action-v2/)

---

## 🚀 Ejemplo Completo: Deploy Push to Action

```bash
# 1. Hacer cambios
echo "export const VERSION = '1.0.0';" >> movie-app/src/version.ts

# 2. Commit
git add .
git commit -m "Release v1.0.0"

# 3. Push
git push origin main

# 4. Ver la magia ✨
gh run list --limit 1
gh run view $(gh run list --limit 1 --json databaseId -q .[0].databaseId)
```

---
