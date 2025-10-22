# Contribuindo para o Nexus API

Obrigado por considerar contribuir para o projeto Nexus!

## 🤝 Como Contribuir

### Reportar Bugs

1. Verifique se o bug já não foi reportado nas Issues
2. Crie uma nova Issue com:
   - Título descritivo
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Versão do Node.js, Docker, etc.
   - Logs relevantes

### Sugerir Melhorias

1. Abra uma Issue descrevendo:
   - O problema atual
   - Sua solução proposta
   - Benefícios da implementação

### Pull Requests

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/minha-feature`
3. Commit suas mudanças: `git commit -m 'feat: adiciona nova feature'`
4. Push para a branch: `git push origin feature/minha-feature`
5. Abra um Pull Request

## 📝 Padrões de Código

### Commits

Seguimos [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação, ponto e vírgula, etc
refactor: refatoração de código
test: adiciona testes
chore: atualiza dependências, config, etc
```

### JavaScript

- Use `const` e `let` ao invés de `var`
- Prefira arrow functions quando apropriado
- Use async/await ao invés de callbacks
- Comente código complexo
- Nomes descritivos para variáveis e funções

### Estrutura de Arquivos

- Controllers: Lógica de rotas
- Services: Lógica de negócio
- Utils: Funções auxiliares
- Routes: Definição de endpoints

## 🧪 Testes

Antes de submeter PR:

1. Teste manualmente todas as rotas afetadas
2. Verifique logs de erro
3. Teste com Docker limpo: `docker-compose down -v && docker-compose up`

## 📖 Documentação

Ao adicionar features:

1. Atualize README.md
2. Adicione exemplos em API_EXAMPLES.md
3. Comente o código adequadamente
4. Atualize o schema Prisma se necessário

## 🔍 Code Review

Todos os PRs passam por review. Espere:

- Feedback construtivo
- Sugestões de melhorias
- Discussão sobre implementação

## 📞 Dúvidas?

- Abra uma Issue com sua dúvida
- Entre em contato com a equipe WN7

Obrigado pela contribuição! 🚀
