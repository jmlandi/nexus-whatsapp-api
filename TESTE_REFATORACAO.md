# 🧪 Guia de Teste - Refatoração Nexus

## Checklist de Testes

### ✅ Preparação
- [ ] Banco de dados está rodando (`./start-db.sh`)
- [ ] Servidor está rodando (`npm start`)
- [ ] Navegador aberto em `http://localhost:3000`

---

## 🔐 1. Teste de Login

### Passos
1. Acesse `http://localhost:3000/login.html`
2. Faça login com credenciais válidas
3. Verifique redirecionamento para dashboard

### Esperado
- ✅ Login bem-sucedido
- ✅ Token armazenado no localStorage
- ✅ Redirecionamento automático

---

## 📊 2. Teste do Dashboard (Vue.js)

### Passos
1. Observe o carregamento inicial
2. Verifique estatísticas exibidas
3. Clique nas ações rápidas

### Esperado
- ✅ Spinner de loading aparece durante carregamento
- ✅ Estatísticas carregam corretamente
- ✅ Cards estão responsivos
- ✅ Links das ações rápidas funcionam
- ✅ Botão "Sair" funciona
- ✅ Sidebar está visível e funcional

---

## 👥 3. Teste de Clientes (Vue.js)

### Criar Cliente
1. Clique em "Novo Cliente"
2. Preencha os campos:
   - Nome: "João"
   - Sobrenome: "Silva"
   - Apelido: "JS" (opcional)
   - Telefone: "(11) 99999-9999"
3. Clique em "Adicionar Telefone"
4. Adicione mais um telefone
5. Clique em "Confirmar"

### Esperado
- ✅ Modal abre corretamente
- ✅ Campos de telefone são adicionados dinamicamente
- ✅ Validação funciona (campos obrigatórios)
- ✅ Toast de sucesso aparece
- ✅ Cliente aparece na tabela
- ✅ Modal fecha automaticamente

### Editar Cliente
1. Clique no botão de editar (lápis)
2. Altere algum campo
3. Salve

### Esperado
- ✅ Modal abre com dados preenchidos
- ✅ Alterações são salvas
- ✅ Tabela atualiza

### Excluir Cliente
1. Clique no botão de excluir (lixeira)
2. Confirme a exclusão

### Esperado
- ✅ Confirmação aparece
- ✅ Cliente é removido
- ✅ Toast de sucesso aparece

---

## 📄 4. Teste de Documentos (Vue.js + Período de Datas)

### Upload de Documento
1. Clique em "Upload PDF"
2. Preencha o formulário:
   - **Cliente**: Selecione um cliente
   - **Data de Início**: 01/10/2024
   - **Data de Fim**: 31/10/2024
   - **Observações**: "Relatório de outubro"
   - **Arquivo**: Selecione um PDF
3. Clique em "Upload"

### Esperado
- ✅ Modal abre com todos os campos
- ✅ **Campos de data de início e fim estão presentes**
- ✅ Select de clientes carrega
- ✅ Validação de campos obrigatórios funciona
- ✅ Botão "Upload" fica desabilitado durante envio
- ✅ Toast de sucesso aparece
- ✅ Documento aparece no grid
- ✅ **Período de datas é exibido corretamente** (DD/MM/YYYY - DD/MM/YYYY)

### Visualizar Documento
1. Clique no botão de visualizar (olho)

### Esperado
- ✅ PDF abre em nova aba

### Excluir Documento
1. Clique no botão de excluir (lixeira)
2. Confirme

### Esperado
- ✅ Confirmação aparece
- ✅ Documento é removido
- ✅ Grid atualiza

---

## 🎨 5. Teste de Componentes Vue

### Sidebar
- [ ] Navegação entre páginas funciona
- [ ] Item ativo está destacado
- [ ] Botão "Sair" funciona
- [ ] Responsivo em telas menores

### Modals
- [ ] Abrem e fecham corretamente
- [ ] Botão X fecha o modal
- [ ] Clicar fora do modal fecha (overlay)
- [ ] Conteúdo é renderizado
- [ ] Estados de loading funcionam

### Toast Notifications
- [ ] Toast de sucesso (verde) aparece
- [ ] Toast de erro (vermelho) aparece
- [ ] Toast desaparece após 3 segundos
- [ ] Múltiplos toasts funcionam

### Loading/Spinner
- [ ] Aparece durante carregamento
- [ ] Animação está suave
- [ ] Centralizado na página

### Empty State
- [ ] Aparece quando não há dados
- [ ] Ícone e mensagem corretos
- [ ] Design consistente

---

## 🔧 6. Teste de API (Backend)

### Verificar Endpoints Atualizados

#### POST /api/document/upload
```bash
# Teste com curl (ajuste o token e paths)
curl -X POST http://localhost:3000/api/document/upload \
  -H "Authorization: Bearer SEU_TOKEN" \
  -F "file=@/path/to/file.pdf" \
  -F "customerId=UUID_DO_CLIENTE" \
  -F "startDate=2024-10-01T00:00:00.000Z" \
  -F "endDate=2024-10-31T23:59:59.999Z" \
  -F "observations=Teste"
```

### Esperado
- ✅ Status 201
- ✅ Retorna objeto com startDate e endDate
- ✅ Erro se faltar startDate ou endDate

#### GET /api/document
```bash
curl http://localhost:3000/api/document \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Esperado
- ✅ Lista de documentos
- ✅ Cada documento tem startDate e endDate
- ✅ Ordenados por startDate desc

---

## 🗄️ 7. Teste do Banco de Dados

### Verificar Estrutura
```bash
npx prisma studio
```

### Esperado
- ✅ Tabela `reports` tem campos:
  - `start_date` (DateTime)
  - `end_date` (DateTime)
- ✅ Campo `report_timestamp` não existe mais
- ✅ Índices criados em start_date e end_date

---

## 🤖 8. Teste de Contexto da IA

### Simular Conversa
1. Acesse o simulador
2. Envie mensagem relacionada a relatórios
3. Verifique resposta da IA

### Esperado
- ✅ IA menciona período do relatório (não apenas data única)
- ✅ Contexto mais rico com "Período: DD/MM a DD/MM"

---

## 📱 9. Teste de Responsividade

### Desktop (>1024px)
- [ ] Layout em 3 colunas (stats)
- [ ] Sidebar visível
- [ ] Tabelas completas

### Tablet (768px - 1024px)
- [ ] Layout em 2 colunas
- [ ] Sidebar funcional
- [ ] Scroll horizontal em tabelas

### Mobile (<768px)
- [ ] Layout em 1 coluna
- [ ] Menu hamburguer (se implementado)
- [ ] Cards empilhados verticalmente

---

## 🚨 10. Teste de Erros

### Teste Validações Front-end
- [ ] Campos obrigatórios vazios
- [ ] Arquivo não-PDF no upload
- [ ] Datas inválidas

### Teste Erros de API
- [ ] Token inválido
- [ ] Cliente inexistente
- [ ] Arquivo muito grande
- [ ] Campos faltando

### Esperado
- ✅ Mensagens de erro claras
- ✅ Toast de erro aparece
- ✅ Formulário não submete
- ✅ Usuário é informado do problema

---

## ✅ Checklist Final

- [ ] Todas as páginas carregam sem erros no console
- [ ] Navegação entre páginas funciona
- [ ] CRUD completo de clientes funciona
- [ ] Upload de documentos com período funciona
- [ ] Visualização de documentos mostra período correto
- [ ] Dashboard mostra estatísticas corretas
- [ ] Todos os componentes Vue renderizam
- [ ] Notificações toast funcionam
- [ ] Estados de loading aparecem
- [ ] Validações funcionam
- [ ] API retorna dados corretos
- [ ] Banco de dados tem estrutura correta

---

## 🐛 Resolução de Problemas

### Erro: "Cannot read property of undefined"
- Verifique se Vue.js carregou (CDN)
- Verifique se components.js está importado

### Erro: "401 Unauthorized"
- Faça login novamente
- Verifique se token está no localStorage

### Documento não aparece após upload
- Verifique console do navegador
- Verifique logs do servidor
- Verifique se S3 está configurado

### Período de datas não aparece
- Verifique se migração foi aplicada
- Verifique se campos startDate/endDate existem no response

---

## 📊 Resultado Esperado

✅ **Todas as funcionalidades funcionando**  
✅ **Interface Vue.js responsiva e reativa**  
✅ **Período de datas implementado**  
✅ **Sem erros no console**  
✅ **Experiência do usuário melhorada**

---

**Tempo estimado de teste**: 30-45 minutos
