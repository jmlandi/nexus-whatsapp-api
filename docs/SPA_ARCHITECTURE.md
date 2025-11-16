# Nexus SPA - Single Page Application

## 🎯 Arquitetura

O front-end foi completamente refatorado para uma **Single Page Application (SPA)** usando:
- **Vue 3** - Framework JavaScript reativo
- **Vue Router** - Navegação client-side
- **Tailwind CSS** - Framework CSS utilitário
- **Arquitetura modular** - Componentes e views separados

## 📁 Estrutura de Arquivos

```
public/
├── index.html                    # Ponto de entrada único do SPA
├── css/
│   └── main.css                  # CSS customizado mínimo
└── spa/
    ├── app.js                    # Configuração principal da aplicação
    ├── components/               # Componentes reutilizáveis
    │   ├── AppSidebar.js         # Sidebar de navegação
    │   ├── PageHeader.js         # Cabeçalho de página
    │   ├── Modal.js              # Modal genérico
    │   ├── Loading.js            # Indicador de carregamento
    │   ├── EmptyState.js         # Estado vazio
    │   └── Toast.js              # Notificações
    ├── views/                    # Páginas da aplicação
    │   ├── Login.js              # Tela de login
    │   ├── Dashboard.js          # Dashboard principal
    │   ├── Customers.js          # Gerenciamento de clientes
    │   ├── Documents.js          # Gerenciamento de documentos
    │   └── Simulator.js          # Simulador de chat
    ├── router/
    │   └── index.js              # Configuração de rotas
    ├── store/
    │   └── store.js              # Estado global reativo
    └── utils/
        ├── api.js                # Funções de requisição HTTP
        └── auth.js               # Funções de autenticação
```

## 🚀 Como Funciona

### 1. Ponto de Entrada Único
- Todas as requisições retornam `index.html`
- O Vue Router gerencia a navegação no client-side
- Sem recarregamento de página entre rotas

### 2. Roteamento Client-Side
```javascript
/ → redireciona para /dashboard
/login → Tela de login
/dashboard → Dashboard principal
/customers → Gerenciamento de clientes
/documents → Gerenciamento de documentos
/simulator → Simulador de chat
```

### 3. Proteção de Rotas
- `beforeEach` guard verifica autenticação
- Usuários não autenticados → `/login`
- Usuários autenticados em `/login` → `/dashboard`

### 4. Estado Global (Store)
```javascript
store = {
  user: null,              // Dados do usuário
  token: null,             // Token JWT
  isAuthenticated: false,  // Status de autenticação
  toast: { ... }           // Notificações
}
```

## 🎨 Componentes Reutilizáveis

### AppSidebar
- Sidebar com navegação
- Destacaautomaticamente a página atual
- Botão de logout

### PageHeader
- Cabeçalho consistente para todas as páginas
- Suporta botão de ação opcional
- Título e subtítulo

### Modal
- Modal genérico para formulários
- Estados de loading
- Botões de confirmar/cancelar

### Loading
- Spinner de carregamento centralizado

### EmptyState
- Estado vazio com ícone e mensagem
- Ícones customizáveis

### Toast
- Notificações temporárias
- Tipos: success, error, warning, info
- Auto-fechamento após 3 segundos

## 🔐 Autenticação

### Login
1. Usuário envia credenciais
2. API retorna token + dados do usuário
3. Store salva no localStorage
4. Redirecionamento para /dashboard

### Logout
1. Store limpa token e dados
2. Remove do localStorage
3. Redirecionamento para /login

### Proteção de Rotas
- Router verifica `store.isAuthenticated`
- Bloqueia acesso não autorizado

## 📡 API Client

### Métodos Disponíveis
```javascript
api.get(endpoint)
api.post(endpoint, body)
api.put(endpoint, body)
api.delete(endpoint)
```

### Headers Automáticos
- `Content-Type: application/json`
- `Authorization: Bearer {token}` (quando autenticado)

### Tratamento de Erros
- Erros lançados como exceptions
- Mensagens de erro extraídas da resposta

## 🎯 Views (Páginas)

### Login
- Formulário de login
- Validação de campos
- Mensagens de erro
- Redirecionamento automático se já autenticado

### Dashboard
- Cards com estatísticas
- Total de clientes, documentos e chats
- Ações rápidas (links para outras páginas)

### Customers
- Listagem de clientes em tabela
- CRUD completo (Create, Read, Update, Delete)
- Modal para adicionar/editar
- Estado vazio quando não há clientes

### Documents
- Grid de documentos
- Upload (em desenvolvimento)
- Estado vazio quando não há documentos

### Simulator
- Em desenvolvimento
- Placeholder com ícone

## 🔧 Configuração do Servidor

### Express Middleware
```javascript
// Serve index.html para todas as rotas SPA
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile('index.html');
  }
});
```

### Content Security Policy (CSP)
```javascript
scriptSrc: [
  "'self'",
  "https://cdn.tailwindcss.com",
  "https://unpkg.com"
]
```

## 🚀 Vantagens do SPA

### Performance
- ✅ Carregamento inicial único
- ✅ Navegação instantânea entre páginas
- ✅ Menos requisições ao servidor
- ✅ Cache eficiente dos assets

### Experiência do Usuário
- ✅ Sem flash de conteúdo entre páginas
- ✅ Transições suaves
- ✅ Estado preservado durante navegação
- ✅ Notificações contextuais (toast)

### Desenvolvimento
- ✅ Código organizado e modular
- ✅ Componentes reutilizáveis
- ✅ Fácil manutenção
- ✅ Estado centralizado

### SEO & Acessibilidade
- ⚠️ Requer SSR para SEO (não implementado)
- ✅ URLs amigáveis
- ✅ History API para navegação

## 🔄 Fluxo de Dados

```
User Action → Component Method → API Call → Store Update → UI Update
```

### Exemplo: Criar Cliente
1. Usuário preenche formulário
2. Clica em "Salvar"
3. `saveCustomer()` chama `api.post('/api/customers')`
4. Sucesso → `store.showToast('success')`
5. `loadCustomers()` atualiza lista
6. UI re-renderiza com novo cliente

## 📝 Próximas Melhorias

### Funcionalidades
- [ ] Upload de documentos
- [ ] Simulador de chat funcional
- [ ] Página de registro
- [ ] Perfil do usuário
- [ ] Configurações

### Técnicas
- [ ] Lazy loading de componentes
- [ ] Pré-carregamento de rotas
- [ ] Service Workers (PWA)
- [ ] Build otimizado com Vite
- [ ] TypeScript
- [ ] Testes unitários (Vitest)

### UI/UX
- [ ] Tema escuro
- [ ] Animações de transição
- [ ] Skeleton loaders
- [ ] Paginação de tabelas
- [ ] Filtros e busca

## 🛠️ Desenvolvimento Local

### Iniciar Servidor
```bash
npm run dev
```

### Acessar Aplicação
```
http://localhost:3000
```

### Hot Reload
- Servidor: Nodemon detecta mudanças
- Client: Recarregar página para ver mudanças

### Debug
- Console do navegador: `Ctrl+Shift+I`
- Vue DevTools: Extensão do Chrome
- Network tab: Monitorar requisições API

## 📚 Tecnologias

| Tecnologia | Versão | Uso |
|------------|--------|-----|
| Vue 3 | 3.x | Framework JavaScript |
| Vue Router | 4.x | Roteamento SPA |
| Tailwind CSS | 3.x | Framework CSS |
| Express | 4.x | Servidor backend |
| Node.js | 18+ | Runtime JavaScript |

## 🎓 Convenções de Código

### Nomenclatura
- **Componentes**: PascalCase (`AppSidebar.js`)
- **Views**: PascalCase (`Dashboard.js`)
- **Utils**: camelCase (`api.js`, `auth.js`)
- **CSS**: kebab-case (`main.css`)

### Estrutura de Componentes
```javascript
const ComponentName = {
  name: 'ComponentName',
  components: { ... },
  props: { ... },
  data() { ... },
  computed: { ... },
  template: `...`,
  mounted() { ... },
  methods: { ... }
};
```

### Mensagens de Commit
- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `refactor:` Refatoração de código
- `docs:` Documentação
- `style:` Formatação/estilo

---

**Desenvolvido com ❤️ usando Vue 3 + Tailwind CSS**
