# Autodiagnóstico de Liderança

Aplicação de autodiagnóstico construída com FastAPI e uma interface web estática.

## Desenvolvimento local

```bash
python -m pip install -r requirements.txt
uvicorn app:app --reload --port 8080
```

Acesse `http://127.0.0.1:8080`.

## Publicação no Netlify

O Netlify usa o arquivo `netlify.toml` para executar:

```bash
python build_static.py
```

O resultado é gravado em `dist/`. As rotas da SPA são direcionadas para
`index.html`, portanto URLs como `/equipe` e `/instrumento-de-autodiagnostico`
funcionam também quando acessadas diretamente.

### Configuração inicial

1. No Netlify, importe o repositório do GitHub.
2. O Netlify detectará automaticamente o comando e a pasta de publicação pelo
   `netlify.toml`.
3. Confirme `main` como a branch de produção e conclua a criação do projeto.

Cada envio para a branch `main` é validado pelo workflow
`.github/workflows/deploy-prod.yaml`. Com o repositório conectado, o próprio
Netlify gera e publica automaticamente a nova versão.
