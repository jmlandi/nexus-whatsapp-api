/**
 * Controller de Reports
 * Gerencia operações CRUD de relatórios e integração com S3
 */

const prisma = require('../utils/prisma');
const BaseController = require('../utils/BaseController');
const s3Service = require('../services/s3Service');
const { isValidUUID, validateDateRange } = require('../utils/validators');

class ReportController extends BaseController {
  /**
   * Lista todos os relatórios com paginação
   * GET /api/report
   */
  async getAll(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const pagination = this.parsePagination(req);
        const filters = this.extractFilters(req.query, ['customerId']);

        const [reports, total] = await Promise.all([
          prisma.report.findMany({
            where: filters,
            skip: pagination.skip,
            take: pagination.pageSize,
            orderBy: { startDate: 'desc' },
            include: {
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  nickname: true
                }
              }
            }
          }),
          prisma.report.count({ where: filters })
        ]);

        return this.paginatedResponse(res, reports, total, pagination, 'reports');
      },
      'listar relatórios'
    );
  }

  /**
   * Busca relatório específico por ID
   * GET /api/report?id=report_id
   */
  async getById(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const { id } = req.query;

        if (!id || !isValidUUID(id)) {
          return this.errorResponse(res, 'ID inválido', 'ID do relatório é inválido', 400);
        }

        const report = await prisma.report.findUnique({
          where: { id },
          include: {
            customer: {
              include: {
                phoneNumbers: {
                  where: { isActive: true }
                }
              }
            }
          }
        });

        if (!report) {
          return this.errorResponse(res, 'Relatório não encontrado', 'Relatório não existe ou foi removido', 404);
        }

        // Gera URL assinada para download
        const key = s3Service.extractKeyFromUrl(report.reportUrl);
        if (key) {
          report.downloadUrl = await s3Service.getSignedDownloadUrl(key);
        }

        return res.json(report);
      },
      'buscar relatório'
    );
  }

  /**
   * Cria novos relatórios e faz upload para S3
   * POST /api/report
   * Body: { reports: [{ customerId, startDate, endDate, observations?, file: base64 ou buffer }] }
   */
  async create(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const { reports } = req.body;

        if (!reports || !Array.isArray(reports) || reports.length === 0) {
          return this.errorResponse(res, 'Dados inválidos', 'Lista de relatórios é obrigatória', 400);
        }

        const createdReports = [];
        const errors = [];

        for (const reportData of reports) {
          const { customerId, startDate, endDate, observations, file, fileName } = reportData;

          if (!customerId || !startDate || !endDate || !file) {
            errors.push({ customerId, error: 'customerId, startDate, endDate e file são obrigatórios' });
            continue;
          }

          // Valida o range de datas
          const dateValidation = validateDateRange(startDate, endDate);
          if (!dateValidation.valid) {
            errors.push({ customerId, error: dateValidation.error });
            continue;
          }

          try {
            // Verifica se cliente existe
            const customer = await prisma.customer.findUnique({
              where: { id: customerId }
            });

            if (!customer) {
              errors.push({ customerId, error: 'Cliente não encontrado' });
              continue;
            }

            // Converte base64 para buffer se necessário
            let fileBuffer;
            if (typeof file === 'string') {
              const base64Data = file.replace(/^data:application\/pdf;base64,/, '');
              fileBuffer = Buffer.from(base64Data, 'base64');
            } else {
              fileBuffer = file;
            }

            // Upload para S3
            const uploadResult = await s3Service.uploadReport(
              fileBuffer,
              customerId,
              fileName || `report_${Date.now()}.pdf`
            );

            // Cria registro no banco
            const report = await prisma.report.create({
              data: {
                customerId,
                reportUrl: uploadResult.url,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                observations
              },
              include: {
                customer: {
                  select: {
                    firstName: true,
                    lastName: true,
                    nickname: true
                  }
                }
              }
            });

            createdReports.push(report);
          } catch (error) {
            errors.push({ customerId, error: error.message });
          }
        }

        return this.successResponse(
          res,
          { reports: createdReports, errors: errors.length > 0 ? errors : undefined },
          `${createdReports.length} relatório(s) criado(s)`,
          201
        );
      },
      'criar relatórios'
    );
  }

  /**
   * Atualiza relatório específico
   * PUT /api/report?id=report_id
   */
  async update(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const { id } = req.query;
        const { startDate, endDate, observations, isActive } = req.body;

        if (!id || !isValidUUID(id)) {
          return this.errorResponse(res, 'ID inválido', 'ID do relatório é inválido', 400);
        }

        const updateData = {};
        if (startDate !== undefined) updateData.startDate = new Date(startDate);
        if (endDate !== undefined) updateData.endDate = new Date(endDate);
        if (observations !== undefined) updateData.observations = observations;
        if (isActive !== undefined) updateData.isActive = isActive;

        // Valida range de datas se ambos fornecidos
        if (startDate && endDate) {
          const dateValidation = validateDateRange(startDate, endDate);
          if (!dateValidation.valid) {
            return this.errorResponse(res, 'Dados inválidos', dateValidation.error, 400);
          }
        }

        const report = await prisma.report.update({
          where: { id },
          data: updateData,
          include: {
            customer: true
          }
        });

        return this.successResponse(res, { report }, 'Relatório atualizado com sucesso');
      },
      'atualizar relatório'
    );
  }

  /**
   * Remove relatório (soft delete) e opcionalmente do S3
   * DELETE /api/report?id=report_id&deleteFromS3=true
   */
  async delete(req, res) {
    return this.handleRequest(
      req,
      res,
      async () => {
        const { id } = req.query;
        const deleteFromS3 = req.query.deleteFromS3 === 'true';

        if (!id || !isValidUUID(id)) {
          return this.errorResponse(res, 'ID inválido', 'ID do relatório é inválido', 400);
        }

        const report = await prisma.report.findUnique({
          where: { id }
        });

        if (!report) {
          return this.errorResponse(res, 'Relatório não encontrado', 'Relatório não existe ou foi removido', 404);
        }

        // Soft delete no banco
        await prisma.report.update({
          where: { id },
          data: { isActive: false }
        });

        // Se solicitado, remove do S3
        if (deleteFromS3) {
          const key = s3Service.extractKeyFromUrl(report.reportUrl);
          if (key) {
            await s3Service.deleteReport(key);
          }
        }

        return this.successResponse(
          res,
          null,
          `Relatório removido com sucesso${deleteFromS3 ? ' (incluindo S3)' : ''}`
        );
      },
      'remover relatório'
    );
  }
}

module.exports = new ReportController();
