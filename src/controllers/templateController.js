/**
 * Controller de Templates
 * Gerencia templates de mensagens do WhatsApp
 */

const logger = require('../utils/logger');
const whatsappService = require('../services/whatsappService');

class TemplateController {
  constructor() {
    // Bind all methods to preserve 'this' context when used as Express route handlers
    const methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(this)).filter(
      name => name !== 'constructor' && typeof this[name] === 'function'
    );
    methodNames.forEach(name => {
      this[name] = this[name].bind(this);
    });
  }

  /**
   * Cria um novo template de mensagem no WhatsApp
   * POST /api/template
   * Body: { name, category, language, components }
   *
   * Exemplo de body:
   * {
   *   "name": "welcome_message",
   *   "category": "MARKETING",
   *   "language": "pt_BR",
   *   "components": [
   *     {
   *       "type": "HEADER",
   *       "format": "TEXT",
   *       "text": "Bem-vindo {{1}}!"
   *     },
   *     {
   *       "type": "BODY",
   *       "text": "Olá {{1}}, tudo bem? Aqui está seu relatório de {{2}}."
   *     },
   *     {
   *       "type": "FOOTER",
   *       "text": "Enviado por WN7 Marketing"
   *     },
   *     {
   *       "type": "BUTTONS",
   *       "buttons": [
   *         {
   *           "type": "URL",
   *           "text": "Ver Relatório",
   *           "url": "https://exemplo.com/relatorio/{{1}}"
   *         }
   *       ]
   *     }
   *   ]
   * }
   */
  async create(req, res) {
    try {
      const { name, category, language, components } = req.body;

      // Validações
      if (!name || !category || !language || !components) {
        return res.status(400).json({
          error: 'name, category, language e components são obrigatórios'
        });
      }

      // Valida categoria
      const validCategories = ['MARKETING', 'UTILITY', 'AUTHENTICATION'];
      if (!validCategories.includes(category.toUpperCase())) {
        return res.status(400).json({
          error: `Categoria inválida. Use: ${validCategories.join(', ')}`
        });
      }

      // Valida componentes
      if (!Array.isArray(components) || components.length === 0) {
        return res.status(400).json({
          error: 'components deve ser um array não vazio'
        });
      }

      // Cria o template via API do WhatsApp
      const result = await whatsappService.createTemplate(name, category, language, components);

      logger.info(`Template criado: ${name}`);

      res.status(201).json({
        message: 'Template criado com sucesso',
        ...result,
        note: 'O template precisa ser aprovado pelo WhatsApp antes de ser usado'
      });
    } catch (error) {
      logger.error(`Erro ao criar template: ${error.message}`);
      res.status(500).json({
        error: 'Erro ao criar template',
        details: error.message
      });
    }
  }

  /**
   * Lista todos os templates disponíveis
   * GET /api/template?limit=100
   */
  async getAll(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 100;

      const result = await whatsappService.listTemplates(limit);

      res.json({
        message: 'Templates listados com sucesso',
        count: result.templates.length,
        templates: result.templates,
        paging: result.paging
      });
    } catch (error) {
      logger.error(`Erro ao listar templates: ${error.message}`);
      res.status(500).json({
        error: 'Erro ao listar templates',
        details: error.message
      });
    }
  }

  /**
   * Deleta um template
   * DELETE /api/template/:name
   */
  async delete(req, res) {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({
          error: 'Nome do template é obrigatório'
        });
      }

      await whatsappService.deleteTemplate(name);

      logger.info(`Template deletado: ${name}`);

      res.json({
        message: 'Template deletado com sucesso',
        templateName: name
      });
    } catch (error) {
      logger.error(`Erro ao deletar template: ${error.message}`);
      res.status(500).json({
        error: 'Erro ao deletar template',
        details: error.message
      });
    }
  }

  /**
   * Exemplo de criação de template para relatórios
   * POST /api/template/create-report-template
   *
   * Cria um template padrão para envio de relatórios
   */
  async createReportTemplate(req, res) {
    try {
      const templateName = req.body.name || 'wn7_relatorio_mensal';

      const components = [
        {
          type: 'HEADER',
          format: 'TEXT',
          text: 'Relatório de Marketing 📊'
        },
        {
          type: 'BODY',
          text: 'Olá {{1}}! 👋\n\nSeu relatório de {{2}} está pronto!\n\nConfira os principais resultados e insights sobre suas campanhas de marketing.\n\nQualquer dúvida, estou à disposição!'
        },
        {
          type: 'FOOTER',
          text: 'WN7 Marketing Digital'
        },
        {
          type: 'BUTTONS',
          buttons: [
            {
              type: 'QUICK_REPLY',
              text: 'Tenho dúvidas'
            },
            {
              type: 'QUICK_REPLY',
              text: 'Está ótimo!'
            }
          ]
        }
      ];

      const result = await whatsappService.createTemplate(templateName, 'MARKETING', 'pt_BR', components);

      logger.info(`Template de relatório criado: ${templateName}`);

      res.status(201).json({
        message: 'Template de relatório criado com sucesso',
        ...result,
        templateName,
        usage: {
          description: 'Use este template para enviar relatórios mensais',
          variables: ['{{1}} - Nome do cliente', '{{2}} - Período do relatório (ex: Janeiro 2024)']
        }
      });
    } catch (error) {
      logger.error(`Erro ao criar template de relatório: ${error.message}`);
      res.status(500).json({
        error: 'Erro ao criar template de relatório',
        details: error.message
      });
    }
  }
}

module.exports = new TemplateController();
