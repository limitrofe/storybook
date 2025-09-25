# Sistema de Storytelling do Newsroom

Este projeto usa Svelte para construir narrativas interativas a partir de documentos do Google Docs. As histórias são processadas e transformadas em arquivos JSON que servem de fonte para o renderizador no navegador.

## Pré-requisitos

1. Instale as dependências:

```bash
npm install
```

2. Gere os arquivos JSON de uma história executando o script de captura. Forneça o ID do documento do Google Docs:

```bash
npm run fetch DOC_ID
# ou
node scripts/fetch-docs.js DOC_ID
```

Os arquivos são salvos em `static/data/`.

## Desenvolvimento

Inicie o servidor de desenvolvimento para visualizar as histórias:

```bash
npm run dev
```

Acesse `http://localhost:5173` no navegador.

## Temas

O sistema possui vários temas definidos em `src/lib/styles/themes.css`. Cada história escolhe um tema e o renderizador aplica as cores correspondentes.

## Produção

Para gerar a versão final do site:

```bash
npm run build
```
