/**
 * Controller de Customers
 * Gerencia operações CRUD de clientes
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

class CustomerController {
  /**
   * Lista todos os clientes com paginação
   * GET /api/customer
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
      const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;
      
      // Limita o tamanho máximo da página
      const pageSize = Math.min(limit, maxLimit);
      const skip = (page - 1) * pageSize;

      // Busca clientes e total
      const [customers, total] = await Promise.all([
        prisma.customer.findMany({
          where: { isActive: true },
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          include: {
            phoneNumbers: {
              where: { isActive: true }
            },
            _count: {
              select: {
                reports: true,
                chats: true
              }
            }
          }
        }),
        prisma.customer.count({ where: { isActive: true } })
      ]);

      res.json({
        customers,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      logger.error(`Erro ao listar clientes: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar clientes' });
    }
  }

  /**
   * Busca cliente específico por ID
   * GET /api/customer/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório' });
      }

      const customer = await prisma.customer.findUnique({
        where: { id },
        include: {
          phoneNumbers: {
            where: { isActive: true }
          },
          reports: {
            where: { isActive: true },
            orderBy: { reportTimestamp: 'desc' },
            take: 10
          },
          chats: {
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
              phoneNumber: true,
              _count: {
                select: { messages: true }
              }
            }
          }
        }
      });

      if (!customer) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json(customer);
    } catch (error) {
      logger.error(`Erro ao buscar cliente: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar cliente' });
    }
  }

  /**
   * Cria novos clientes
   * POST /api/customer
   * Body: { firstName, lastName, nickname?, phoneNumbers: [string] }
   * ou { customers: [{ firstName, lastName, nickname?, phoneNumbers: [string] }] }
   */
  async create(req, res) {
    try {
      let customers;
      
      // Aceita tanto um único cliente quanto uma lista
      if (req.body.customers && Array.isArray(req.body.customers)) {
        customers = req.body.customers;
      } else if (req.body.firstName && req.body.lastName) {
        // Recebeu um único cliente, coloca em array
        customers = [req.body];
      } else {
        return res.status(400).json({ 
          error: 'Dados inválidos',
          message: 'Envie um cliente com firstName e lastName, ou uma lista de clientes'
        });
      }

      if (customers.length === 0) {
        return res.status(400).json({ error: 'Lista de clientes não pode estar vazia' });
      }

      const createdCustomers = [];

      // Processa cada cliente
      for (const customerData of customers) {
        const { firstName, lastName, nickname, phoneNumbers } = customerData;

        if (!firstName || !lastName) {
          continue; // Pula clientes inválidos
        }

        // Cria cliente com números de telefone
        const customer = await prisma.customer.create({
          data: {
            firstName,
            lastName,
            nickname,
            phoneNumbers: {
              create: phoneNumbers?.map(phone => ({ phoneNumber: phone })) || []
            }
          },
          include: {
            phoneNumbers: true
          }
        });

        createdCustomers.push(customer);
        logger.info(`Cliente criado: ${customer.id}`);
      }

      // Se criou apenas um, retorna objeto único, senão retorna array
      if (createdCustomers.length === 1) {
        res.status(201).json({
          message: 'Cliente criado com sucesso',
          customer: createdCustomers[0]
        });
      } else {
        res.status(201).json({
          message: `${createdCustomers.length} cliente(s) criado(s)`,
          customers: createdCustomers
        });
      }
    } catch (error) {
      logger.error(`Erro ao criar clientes: ${error.message}`);
      res.status(500).json({ 
        error: 'Erro ao criar clientes',
        message: error.message 
      });
    }
  }

  /**
   * Atualiza cliente específico
   * PUT /api/customer/:id
   */
  async update(req, res) {
    try {
      const { id } = req.params;
      const { firstName, lastName, nickname, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório' });
      }

      // Monta objeto de atualização apenas com campos fornecidos
      const updateData = {};
      if (firstName !== undefined) updateData.firstName = firstName;
      if (lastName !== undefined) updateData.lastName = lastName;
      if (nickname !== undefined) updateData.nickname = nickname;
      if (isActive !== undefined) updateData.isActive = isActive;

      const customer = await prisma.customer.update({
        where: { id },
        data: updateData,
        include: {
          phoneNumbers: true
        }
      });

      logger.info(`Cliente atualizado: ${id}`);
      res.json({
        message: 'Cliente atualizado com sucesso',
        customer
      });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      logger.error(`Erro ao atualizar cliente: ${error.message}`);
      res.status(500).json({ error: 'Erro ao atualizar cliente' });
    }
  }

  /**
   * Remove cliente (soft delete)
   * DELETE /api/customer/:id
   */
  async delete(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório' });
      }

      // Soft delete - apenas marca como inativo
      await prisma.customer.update({
        where: { id },
        data: { isActive: false }
      });

      logger.info(`Cliente removido (soft delete): ${id}`);
      res.json({ message: 'Cliente removido com sucesso' });
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      logger.error(`Erro ao remover cliente: ${error.message}`);
      res.status(500).json({ error: 'Erro ao remover cliente' });
    }
  }
}

module.exports = new CustomerController();
