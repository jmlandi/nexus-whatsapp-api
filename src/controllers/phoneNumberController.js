/**
 * Controller de PhoneNumbers
 * Gerencia operações CRUD de números de telefone
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const whatsappService = require('../services/whatsappService');

class PhoneNumberController {
  /**
   * Lista todos os números com paginação
   * GET /api/phone_number
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
      const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;
      
      const pageSize = Math.min(limit, maxLimit);
      const skip = (page - 1) * pageSize;

      const [phoneNumbers, total] = await Promise.all([
        prisma.phoneNumber.findMany({
          where: { isActive: true },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true
              }
            },
            _count: {
              select: { chats: true }
            }
          }
        }),
        prisma.phoneNumber.count({ where: { isActive: true } })
      ]);

      res.json({
        data: phoneNumbers,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      logger.error(`Erro ao listar números: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar números' });
    }
  }

  /**
   * Busca número específico por ID
   * GET /api/phone_number?id=phone_number_id
   */
  async getById(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do número é obrigatório' });
      }

      const phoneNumber = await prisma.phoneNumber.findUnique({
        where: { id },
        include: {
          customer: true,
          chats: {
            orderBy: { updatedAt: 'desc' },
            take: 10
          }
        }
      });

      if (!phoneNumber) {
        return res.status(404).json({ error: 'Número não encontrado' });
      }

      res.json(phoneNumber);
    } catch (error) {
      logger.error(`Erro ao buscar número: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar número' });
    }
  }

  /**
   * Cria novos números de telefone
   * POST /api/phone_number
   * Body: { phoneNumbers: [{ customerId, phoneNumber }] }
   */
  async create(req, res) {
    try {
      const { phoneNumbers } = req.body;

      if (!phoneNumbers || !Array.isArray(phoneNumbers) || phoneNumbers.length === 0) {
        return res.status(400).json({ error: 'Lista de números é obrigatória' });
      }

      const createdNumbers = [];
      const errors = [];

      for (const phoneData of phoneNumbers) {
        const { customerId, phoneNumber } = phoneData;

        if (!customerId || !phoneNumber) {
          errors.push({ phoneNumber, error: 'customerId e phoneNumber são obrigatórios' });
          continue;
        }

        // Valida formato do número
        if (!whatsappService.validatePhoneNumber(phoneNumber)) {
          errors.push({ phoneNumber, error: 'Formato de número inválido' });
          continue;
        }

        try {
          // Verifica se número já existe para este cliente
          const existing = await prisma.phoneNumber.findFirst({
            where: { customerId, phoneNumber }
          });

          if (existing) {
            errors.push({ phoneNumber, error: 'Número já cadastrado para este cliente' });
            continue;
          }

          const created = await prisma.phoneNumber.create({
            data: {
              customerId,
              phoneNumber
            },
            include: {
              customer: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          });

          createdNumbers.push(created);
          logger.info(`Número criado: ${created.id}`);
        } catch (error) {
          errors.push({ phoneNumber, error: error.message });
        }
      }

      res.status(201).json({
        message: `${createdNumbers.length} número(s) criado(s)`,
        data: createdNumbers,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      logger.error(`Erro ao criar números: ${error.message}`);
      res.status(500).json({ error: 'Erro ao criar números' });
    }
  }

  /**
   * Atualiza número específico
   * PUT /api/phone_number?id=phone_number_id
   */
  async update(req, res) {
    try {
      const { id } = req.query;
      const { phoneNumber, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID do número é obrigatório' });
      }

      const updateData = {};
      if (phoneNumber !== undefined) {
        // Valida formato se fornecido
        if (!whatsappService.validatePhoneNumber(phoneNumber)) {
          return res.status(400).json({ error: 'Formato de número inválido' });
        }
        updateData.phoneNumber = phoneNumber;
      }
      if (isActive !== undefined) updateData.isActive = isActive;

      const updated = await prisma.phoneNumber.update({
        where: { id },
        data: updateData,
        include: {
          customer: true
        }
      });

      logger.info(`Número atualizado: ${id}`);
      res.json(updated);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Número não encontrado' });
      }
      logger.error(`Erro ao atualizar número: ${error.message}`);
      res.status(500).json({ error: 'Erro ao atualizar número' });
    }
  }

  /**
   * Remove número (soft delete)
   * DELETE /api/phone_number?id=phone_number_id
   */
  async delete(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do número é obrigatório' });
      }

      await prisma.phoneNumber.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Número removido (soft delete): ${id}`);
      res.json({ message: 'Número removido com sucesso' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Número não encontrado' });
      }
      logger.error(`Erro ao remover número: ${error.message}`);
      res.status(500).json({ error: 'Erro ao remover número' });
    }
  }
}

module.exports = new PhoneNumberController();
