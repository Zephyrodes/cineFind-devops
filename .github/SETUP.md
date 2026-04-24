# GitHub Actions — Configuración

## Prerequisitos

- [ ] Workflows presentes en `.github/workflows/`
- [ ] GitHub Actions habilitado en el repositorio
- [ ] Permiso `security-events: write` declarado en `security-scan.yml`
- [ ] Secret `AZURE_CREDENTIALS` configurado

---

## Gestión de secretos

### Vía GitHub Web

1. Navegar a **Settings > Secrets and variables > Actions**
2. Seleccionar **New repository secret**
3. Ingresar nombre y valor

### Vía GitHub CLI

```bash
gh auth login

gh secret set AZURE_CREDENTIALS < azure_credentials.json

gh secret list

gh secret delete AZURE_CREDENTIALS
```

---

## AZURE_CREDENTIALS

Crear un Service Principal en Azure y registrar el JSON resultante como secret en el repositorio.

```bash
az ad sp create-for-rbac \
  --name "cineFind-github-actions" \
  --role "Contributor" \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID \
  --json-auth
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

## CodeQL — `Resource not accessible by integration`

El job `code-scan` falla al subir resultados SARIF porque el `GITHUB_TOKEN` no tiene
el permiso `security-events: write` declarado. Sin declaración explícita, el token
opera en modo de solo lectura por defecto.

### Corrección en `security-scan.yml`

```yaml
code-scan:
  runs-on: ubuntu-latest
  name: CodeQL Scan
  permissions:
    actions: read
    contents: read
    security-events: write    # requerido para cargar resultados SARIF
  strategy:
    matrix:
      language: [ 'javascript' ]
  steps:
    - uses: actions/checkout@v4
    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3    # v2 está deprecado
      with:
        languages: ${{ matrix.language }}
    - name: Autobuild
      uses: github/codeql-action/autobuild@v3
    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
```

Si múltiples jobs requieren los mismos permisos, pueden declararse a nivel de workflow
antes de la sección `jobs:`:

```yaml
permissions:
  actions: read
  contents: read
  security-events: write
```

### Verificar permisos del repositorio

Si el error persiste, verificar en **Settings > Actions > General > Workflow permissions**
que el valor sea **"Read and write permissions"**.

---

## Ejecución local de workflows

### act

```bash
# Instalación
brew install act        # macOS
curl https://raw.githubusercontent.com/nektos/act/master/install.sh | bash

# Uso
act -l                                   # listar workflows disponibles
act push -j test-all                     # ejecutar job específico
act -s AZURE_CREDENTIALS='...' push      # ejecutar con secretos
```

### Validación de YAML

```bash
pip install yamllint

yamllint .github/workflows/              # validar todos los workflows
yamllint .github/workflows/react-ci.yml  # validar archivo específico
```

---

## Monitoreo

### GitHub CLI

```bash
gh run list --limit 10                    # listar runs recientes
gh run view RUN_ID                        # detalle de un run
gh run view RUN_ID --log                  # logs completos
gh run view RUN_ID --log --job JOB_ID    # logs de un job específico
gh run download RUN_ID -n ARTIFACT_NAME  # descargar artifact
```

### GraphQL

```bash
gh api graphql -f owner='{owner}' -f name='{repo}' < query.graphql
```

---

## Despliegue automático a Azure

1. Configurar el secret `AZURE_CREDENTIALS` según la sección anterior.

2. Descomentar el job `deploy-to-azure` en `deploy.yml`:

   ```yaml
   deploy-to-azure:
     runs-on: ubuntu-latest
     name: Deploy to Azure
     needs: [test-all, validate-infrastructure]
     if: github.ref == 'refs/heads/main' && needs.test-all.result == 'success'
     environment: production
   ```

3. Hacer merge a `main`. El deploy se ejecutará automáticamente.

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| `Resource not accessible by integration` | Token sin `security-events: write` | Agregar bloque `permissions` al job `code-scan` |
| CodeQL actions deprecadas | Uso de `codeql-action/v2` | Migrar a `codeql-action/v3` |
| `npm: command not found` | Node.js no disponible en el runner | Agregar step `actions/setup-node@v4` |
| Terraform plan falla | State local no inicializado | Ejecutar `terraform init -backend=false` |
| Ansible syntax error | Playbook mal formado | Verificar con `ansible-playbook --syntax-check` |
| Secrets detectados falsamente | Patrones coinciden con palabras del código | Ajustar configuración en `security-scan.yml` |

### Workflow no se ejecuta

```bash
yamllint .github/workflows/react-ci.yml
cat .github/workflows/react-ci.yml | grep -A 5 "on:"
git status
```

### Job falla sin causa clara

```bash
gh run rerun RUN_ID
gh run rerun RUN_ID --debug
```

### Timeout

Ajustar el límite en el job afectado:

```yaml
timeout-minutes: 30
```

### Secret no disponible en el runner

Para verificar si un secret está configurado sin exponerlo:

```yaml
- name: Verificar secret
  run: |
    if [ -z "${{ secrets.MY_SECRET }}" ]; then
      echo "Secret no configurado"
    else
      echo "Secret configurado"
    fi
```

---

## Referencias

- [GitHub Actions — Workflow syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [GitHub Actions — Events that trigger workflows](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows)
- [GitHub Actions — Environment variables](https://docs.github.com/en/actions/learn-github-actions/environment-variables)
- [CodeQL Action v3 — Migration guide](https://github.blog/changelog/2024-01-12-code-scanning-deprecation-of-codeql-action-v2/)
