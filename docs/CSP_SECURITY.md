# CSP (Content Security Policy) - Segurança Implementada

## 📋 Visão Geral

Este documento descreve as alterações de segurança implementadas para eliminar vulnerabilidades XSS através de uma Content Security Policy (CSP) rigorosa.

## 🔒 O Problema

Anteriormente, a aplicação permitia:
- `'unsafe-inline'` em `script-src` - permitia JavaScript inline no HTML
- Event handlers inline (`onclick`, `onsubmit`, etc.)
- Vulnerabilidades a ataques XSS (Cross-Site Scripting)

**Erro que ocorria:**
```
Refused to execute inline event handler because it violates the following 
Content Security Policy directive: 'script-src-attr 'none'
```

## ✅ Solução Implementada

### 1. **Nonce Criptográfico por Requisição**

Cada requisição HTTP agora gera um nonce único e seguro:

```javascript
// src/server.js
app.use((req, res, next) => {
  res.locals.nonce = crypto.randomBytes(16).toString('base64');
  next();
});
```

### 2. **CSP Rigorosa com Helmet**

```javascript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${res.locals.nonce}'`],
      scriptSrcAttr: ["'none'"],  // ⚠️ BLOQUEIA event handlers inline
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
}));
```

**Diretivas Críticas:**
- `script-src-attr 'none'`: Bloqueia completamente `onclick="..."`, `onsubmit="..."`, etc.
- `script-src 'self' 'nonce-...'`: Permite apenas scripts do próprio domínio OU com nonce válido
- **NÃO usa** `'unsafe-inline'` - código inline só roda com nonce correto

### 3. **Injeção Automática de Nonce nos Scripts**

Middleware intercepta arquivos `.html` e injeta o nonce automaticamente:

```javascript
app.use((req, res, next) => {
  if (req.path.endsWith('.html')) {
    const filePath = path.join(__dirname, '../public', req.path);
    
    if (fs.existsSync(filePath)) {
      let html = fs.readFileSync(filePath, 'utf-8');
      // Adiciona nonce em <script> inline (sem src=)
      html = html.replace(/<script(?!.*src=)/g, `<script nonce="${res.locals.nonce}"`);
      
      res.setHeader('Content-Type', 'text/html');
      return res.send(html);
    }
  }
  next();
});
```

### 4. **Remoção de Event Handlers Inline**

Todos os event handlers foram migrados para `addEventListener`:

#### ❌ Antes (INSEGURO):
```html
<button onclick="logout()">Sair</button>
<button onclick="openCustomerModal()">Novo Cliente</button>
<form onsubmit="handleSubmit()">...</form>
```

#### ✅ Depois (SEGURO):
```html
<button id="logoutBtn">Sair</button>
<button id="newCustomerBtn">Novo Cliente</button>
<form id="customerForm">...</form>
```

```javascript
// No JavaScript
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('logoutBtn').addEventListener('click', logout);
  document.getElementById('newCustomerBtn').addEventListener('click', openCustomerModal);
  document.getElementById('customerForm').addEventListener('submit', handleSubmit);
});
```

## 📝 Arquivos Modificados

### Backend
- **src/server.js**: Configuração CSP com nonce, middleware de injeção

### Frontend (HTML)
- **public/dashboard.html**: Removidos `onclick` nos botões
- **public/customers.html**: Removidos `onclick` em botões e modal
- **public/documents.html**: Removidos `onclick` em botões de upload
- **public/simulator.html**: Removidos `onclick` de iniciar/encerrar simulação

### Frontend (JavaScript)
- **public/js/dashboard.js**: Adicionados event listeners para logout
- **public/js/customers.js**: Event listeners para todos os botões (novo, editar, fechar, adicionar telefone)
- **public/js/documents.js**: Event listeners para upload, visualizar, deletar documentos
- **public/js/simulator.js**: Event listeners para iniciar/encerrar simulação

## 🎯 Benefícios de Segurança

### 1. **Proteção contra XSS**
- Ataques XSS não podem injetar e executar código malicioso
- Mesmo que um atacante injete `<script>alert('XSS')</script>`, o CSP bloqueia

### 2. **Nonce Único por Requisição**
- Cada página tem um nonce diferente
- Impossível reusar nonces em ataques
- Scripts maliciosos não têm como saber o nonce válido

### 3. **Event Handlers Seguros**
- `script-src-attr 'none'` bloqueia `onclick`, `onerror`, `onload`, etc.
- Elimina vetor de ataque comum em XSS

### 4. **Defesa em Camadas**
- `defaultSrc 'self'`: Restringe todos os recursos por padrão
- `objectSrc 'none'`: Bloqueia Flash e outros plugins
- `frameAncestors 'self'`: Previne clickjacking
- `upgradeInsecureRequests`: Força HTTPS quando disponível

## 🔍 Como Verificar

### 1. **Console do Navegador**
Antes você via:
```
Refused to execute inline event handler...
```

Agora **não há erros de CSP**!

### 2. **Inspecionar Headers HTTP**
```bash
curl -I http://localhost:3000/dashboard.html
```

Deve incluir:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-xxx'; script-src-attr 'none'; ...
```

### 3. **DevTools > Network > Headers**
Verificar response headers da página HTML e confirmar presença do nonce nos `<script>`.

## 📚 Referências

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator (Google)](https://csp-evaluator.withgoogle.com/)
- [Helmet.js Documentation](https://helmetjs.github.io/)
- [OWASP: Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)

## ⚠️ Observações Importantes

### CSS Inline ainda permitido
```javascript
styleSrc: ["'self'", "'unsafe-inline'"]
```
- CSS inline é menos arriscado que JS inline
- Se quiser endurecer mais, remova `'unsafe-inline'` e use classes CSS

### Trusted Types (Opcional)
Para segurança adicional, considere:
```javascript
"require-trusted-types-for 'script'"
```
Isso força validação de todas as strings que viram código JS.

### Imagens Externas
```javascript
imgSrc: ["'self'", "data:", "https:"]
```
- Permite imagens de qualquer HTTPS (CDNs)
- Ajuste se quiser restringir a domínios específicos

## 🚀 Próximos Passos (Opcional)

1. **Subresource Integrity (SRI)**: Adicionar hashes para scripts externos
2. **Trusted Types**: Habilitar para proteção adicional contra XSS
3. **Report-URI**: Configurar endpoint para receber violações de CSP
4. **CSP Report-Only Mode**: Testar CSP mais restritiva sem quebrar produção

---

**Data da Implementação:** 27 de Outubro de 2025  
**Autor:** Sistema Nexus - WhatsApp Business Manager
