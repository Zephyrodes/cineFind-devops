# Configuración de GitHub Actions - Guía Setup

## ✅ Checklist de Configuración

- [ ] Workflows creados en `.github/workflows/`
- [ ] Repositorio público o privado en GitHub
- [ ] GitHub Actions análisis habilitado
- [ ] (Opcional) Secretos de Azure configurados
- [ ] (Opcional) Notificaciones configuradas

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

## 🔑 Secretos Recomendados

### 1. AZURE_CREDENTIALS (para deploy automático)

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

### 2. TMDB_API_KEY (para CI de React)

```bash
gh secret set TMDB_API_KEY
# Pegar tu API key de TMDB
```

### 3. PAT (Personal Access Token) - Opcional

```bash
# Para workflows que necesiten hacer commits
gh secret set GITHUB_TOKEN
```

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

3. **Configura environment de producción (opcional):**
   - Settings > Environments > New environment
   - Nombre: `production`
   - Add protection rule (require approval)

4. **Merge a main** - El deploy automático se ejecutará

---

## 🔔 Notificaciones

### Slack Integration

```bash
# 1. Crear webhook en Slack
# https://api.slack.com/apps > Create New App > Incoming Webhooks

# 2. Agregar secret
gh secret set SLACK_WEBHOOK_URL < webhook_url.txt

# 3. Agregar step en workflow
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK_URL }}
    payload: |
      {
        "text": "Deployment ${{ job.status }}"
      }
```

### Email Notifications

- Desde GitHub: Settings > Notifications > Email
- Tipo: All activity, Participating, Watching

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

---

## 📖 Documentación Adicional

- [GitHub Actions Best Practices](https://docs.github.com/en/actions/guides)
- [Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Events that Trigger Workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [Environment Variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)

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

**¡Listo!** Los workflows están configurados y listos para usar. 🎉
