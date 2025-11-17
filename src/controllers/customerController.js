/**
 * Controller de Customers
 * Gerencia operações CRUD de clientes
 */

const prisma = require('../utils/prisma');
const BaseController = require('../utils/BaseController');
const { isValidUUID } = require('../utils/validators');

class CustomerController extends BaseController {
  /**
   * Lista todos os clientes com paginação
   * GET /api/customer
   */
  async getAll(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const pagination = this.parsePagination(req);

        // Busca clientes e total
        const [customers, total] = await Promise.all([
          prisma.customer.findMany({
            where: { isActive: true },
            skip: pagination.skip,
            take: pagination.pageSize,
            orderBy: { createdAt: 'desc' },
            include: {
              phoneNumbers: true,
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

        return this.paginatedResponse(res, customers, total, pagination, 'customers');
      },
      'listar clientes'
    );
  }

  /**
   * Busca cliente específico por ID
   * GET /api/customer/:id
   */
  async getById(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const { id } = req.params;

        if (!id || !isValidUUID(id)) {
          return this.errorResponse(res, 'ID inválido', 'ID do cliente é inválido', 400);
        }

        const customer = await prisma.customer.findUnique({
          where: { id },
          include: {
            phoneNumbers: {
              where: { isActive: true }
            },
            reports: {
              where: { isActive: true },
              orderBy: { startDate: 'desc' },
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
          return this.errorResponse(res, 'Cliente não encontrado', 'Cliente não existe ou foi removido', 404);
        }

        return res.json(customer);
      },
      'buscar cliente'
    );
  }

  /**
   * Cria novos clientes
   * POST /api/customer
   * Body: { firstName, lastName, nickname?, phoneNumbers: [string] }
   * ou { customers: [{ firstName, lastName, nickname?, phoneNumbers: [string] }] }
   */
  async create(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        let customers;

        // Aceita tanto um único cliente quanto uma lista
        if (req.body.customers && Array.isArray(req.body.customers)) {
          customers = req.body.customers;
        } else if (req.body.firstName && req.body.lastName) {
          customers = [req.body];
        } else {
          return this.errorResponse(
            res,
            'Dados inválidos',
            'Envie um cliente com firstName e lastName, ou uma lista de clientes',
            400
          );
        }

        if (customers.length === 0) {
          return this.errorResponse(res, 'Dados inválidos', 'Lista de clientes não pode estar vazia', 400);
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
        }

        // Se criou apenas um, retorna objeto único, senão retorna array
        if (createdCustomers.length === 1) {
          return this.successResponse(res, { customer: createdCustomers[0] }, 'Cliente criado com sucesso', 201);
        } else {
          return this.successResponse(
            res,
            { customers: createdCustomers },
            `${createdCustomers.length} cliente(s) criado(s)`,
            201
          );
        }
      },
      'criar clientes'
    );
  }

  /**
   * Atualiza cliente específico
   * PUT /api/customer/:id
   */
  async update(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const { id } = req.params;
        const { firstName, lastName, nickname, isActive, phoneNumbers } = req.body;

        if (!id || !isValidUUID(id)) {
          return this.errorResponse(res, 'ID inválido', 'ID do cliente é inválido', 400);
        }

        // Monta objeto de atualização apenas com campos fornecidos
        const updateData = {};
        if (firstName !== undefined) updateData.firstName = firstName;
        if (lastName !== undefined) updateData.lastName = lastName;
        if (nickname !== undefined) updateData.nickname = nickname;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Atualiza dados básicos do cliente
        await prisma.customer.update({
          where: { id },
          data: updateData
        });

        // Se phoneNumbers foi fornecido, atualiza os telefones
        if (phoneNumbers !== undefined && Array.isArray(phoneNumbers) && phoneNumbers.length > 0) {
          // Deleta telefones antigos do cliente
          await prisma.phoneNumber.deleteMany({
            where: { customerId: id }
          });

          // Cria os novos telefones
          await prisma.phoneNumber.createMany({
            data: phoneNumbers.map(phone => ({
              customerId: id,
              phoneNumber: phone,
              isActive: true
            }))
          });
        }

        // Busca cliente atualizado com telefones
        const customer = await prisma.customer.findUnique({
          where: { id },
          include: {
            phoneNumbers: true
          }
        });

        return this.successResponse(res, { customer }, 'Cliente atualizado com sucesso');
      },
      'atualizar cliente'
    );
  }

  /**
   * Remove cliente (soft delete)
   * DELETE /api/customer/:id
   */
  async delete(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const { id } = req.params;

        if (!id || !isValidUUID(id)) {
          return this.errorResponse(res, 'ID inválido', 'ID do cliente é inválido', 400);
        }

        // Soft delete - apenas marca como inativo
        await prisma.customer.update({
          where: { id },
          data: { isActive: false }
        });

        return this.successResponse(res, null, 'Cliente removido com sucesso');
      },
      'remover cliente'
    );
  }
}

module.exports = new CustomerController();
