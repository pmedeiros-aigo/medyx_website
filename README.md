# Medyx — Website

Site institucional da Medyx (medyx.com.br). HTML/CSS/JS estático, **sem build e sem
dependências** — o conteúdo de `medyx_website/` é exatamente o que vai para o bucket S3.

Fonte visual: projeto **"Medyx - Style tile Enterprise"** no Claude Design
(artboards `Medyx Site.dc.html`, `Medyx Contato.dc.html`, `Medyx Legal.dc.html`).
Os tokens de cor/espaço em `assets/css/site.css` espelham o `tokens.css` do projeto.

## Estrutura

```
index.html          home (hero, compromissos de método, como o sistema trabalha, contato)
contato.html        formulário "Falar com a Medyx"
legal.html          termos de uso + política de privacidade (abas, #termos / #privacidade / #dpo)
404.html            página de erro
favicon.svg
robots.txt
sitemap.xml
assets/css/site.css
assets/js/contato.js
assets/js/legal.js
assets/img/medyx-mark.svg
```

## Rodar localmente

```bash
cd medyx_website
python3 -m http.server 8080
# http://localhost:8080
```

> Os caminhos são absolutos (`/assets/...`), então abra pelo servidor local — abrir o
> arquivo direto com `file://` não carrega o CSS.

## Pendências antes de publicar

1. **Formulário de contato** (`assets/js/contato.js`, topo do arquivo).
   O site é estático e não tem backend. Dois modos:
   - `FORM_ENDPOINT = ''` (atual) → abre o cliente de e-mail do visitante com a mensagem
     preenchida para `CONTACT_EMAIL`, hoje `contato@medyx.com.br` — **confirmar este e-mail**.
   - `FORM_ENDPOINT = 'https://…'` → POST JSON `{nome, cargo, cooperativa, email, mensagem}`
     para o endpoint (API Gateway + Lambda + SES, ou serviço de formulário).
2. **Textos legais**: as cláusulas de `legal.html` estão como no design, em placeholders
   `[Definir: …]`. Trocar pelo texto jurídico definitivo antes de ir ao ar.
3. **Imagem de compartilhamento**: adicionar `og:image` (1200×630) quando houver arte.

## Deploy — S3

Configuração do bucket (site estático):

- Documento de índice: `index.html`
- Documento de erro: `404.html`

```bash
BUCKET=medyx.com.br

# assets com hash-free caching curto; HTML sempre revalidado
aws s3 sync . "s3://$BUCKET" \
  --delete \
  --exclude ".git/*" --exclude "README.md" --exclude ".gitignore" \
  --exclude "*.html" \
  --cache-control "public,max-age=86400"

aws s3 sync . "s3://$BUCKET" \
  --delete \
  --exclude "*" --include "*.html" \
  --cache-control "public,max-age=0,must-revalidate" \
  --content-type "text/html; charset=utf-8"
```

Com CloudFront na frente, invalidar após o sync:

```bash
aws cloudfront create-invalidation --distribution-id <ID> --paths "/*"
```

As URLs internas usam `.html` explícito (`/contato.html`), o que funciona tanto no
endpoint de website do S3 quanto em CloudFront + OAC sem CloudFront Function.
