/**
 * Controller de Reports
 * Gerencia operações CRUD de relatórios e integração com S3
 */

const prisma = require('../utils/prisma');
const logger = require('../utils/logger');
const s3Service = require('../services/s3Service');

class ReportController {
  /**
   * Lista todos os relatórios com paginação
   * GET /api/report
   */
  async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || parseInt(process.env.DEFAULT_PAGE_SIZE) || 20;
      const maxLimit = parseInt(process.env.MAX_PAGE_SIZE) || 100;
      const customerId = req.query.customerId;
      
      const pageSize = Math.min(limit, maxLimit);
      const skip = (page - 1) * pageSize;

      // Filtro por cliente se fornecido
      const where = { isActive: true };
      if (customerId) {
        where.customerId = customerId;
      }

      const [reports, total] = await Promise.all([
        prisma.report.findMany({
          where,
          skip,
          take: pageSize,
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
        prisma.report.count({ where })
      ]);

      res.json({
        reports,
        pagination: {
          page,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (error) {
      logger.error(`Erro ao listar relatórios: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar relatórios' });
    }
  }

  /**
   * Busca relatório específico por ID
   * GET /api/report?id=report_id
   */
  async getById(req, res) {
    try {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: 'ID do relatório é obrigatório' });
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
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }

      // Gera URL assinada para download
      const key = s3Service.extractKeyFromUrl(report.reportUrl);
      if (key) {
        report.downloadUrl = await s3Service.getSignedDownloadUrl(key);
      }

      res.json(report);
    } catch (error) {
      logger.error(`Erro ao buscar relatório: ${error.message}`);
      res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
  }

  /**
   * Cria novos relatórios e faz upload para S3
   * POST /api/report
   * Body: { reports: [{ customerId, reportTimestamp, observations?, file: base64 ou buffer }] }
   * Ou com multipart/form-data para upload de arquivos
   */
  async create(req, res) {
    try {
      const { reports } = req.body;

      if (!reports || !Array.isArray(reports) || reports.length === 0) {
        return res.status(400).json({ error: 'Lista de relatórios é obrigatória' });
      }

      const createdReports = [];
      const errors = [];

      for (const reportData of reports) {
        const { customerId, reportTimestamp, observations, file, fileName } = reportData;

        if (!customerId || !reportTimestamp || !file) {
          errors.push({ customerId, error: 'customerId, reportTimestamp e file são obrigatórios' });
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
            // Remove prefixo data:application/pdf;base64, se existir
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
              reportTimestamp: new Date(reportTimestamp),
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
          logger.info(`Relatório criado: ${report.id}`);
        } catch (error) {
          errors.push({ customerId, error: error.message });
        }
      }

      res.status(201).json({
        message: `${createdReports.length} relatório(s) criado(s)`,
        data: createdReports,
        errors: errors.length > 0 ? errors : undefined
      });
    } catch (error) {
      logger.error(`Erro ao criar relatórios: ${error.message}`);
      res.status(500).json({ error: 'Erro ao criar relatórios' });
    }
  }

  /**
   * Atualiza relatório específico
   * PUT /api/report?id=report_id
   */
  async update(req, res) {
    try {
      const { id } = req.query;
      const { reportTimestamp, observations, isActive } = req.body;

      if (!id) {
        return res.status(400).json({ error: 'ID do relatório é obrigatório' });
      }

      const updateData = {};
      if (reportTimestamp !== undefined) {
        updateData.reportTimestamp = new Date(reportTimestamp);
      }
      if (observations !== undefined) updateData.observations = observations;
      if (isActive !== undefined) updateData.isActive = isActive;

      const report = await prisma.report.update({
        where: { id },
        data: updateData,
        include: {
          customer: true
        }
      });

      logger.info(`Relatório atualizado: ${id}`);
      res.json(report);
    } catch (error) {
      if (error.code === 'P2025') {
        return res.status(404).json({ error: 'Relatório não encontrado' });
      }
      logger.error(`Erro ao atualizar relatório: ${error.message}`);
      res.status(500).json({ error: 'Erro ao atualizar relatório' });
    }
  }

  /**
   * Remove relatório (soft delete) e opcionalmente do S3
   * DELETE /api/report?id=report_id&deleteFromS3=true
   */
  async delete(req, res) {
    try {
      const { id } = req.query;
      const deleteFromS3 = req.query.deleteFromS3 === 'true';

      if (!id) {
        return res.status(400).json({ error: 'ID do relatório é obrigatório' });
      }

      const report = await prisma.report.findUnique({
        where: { id }
      });

      if (!report) {
        return res.status(404).json({ error: 'Relatório não encontrado' });
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

      logger.info(`Relatório removido: ${id}${deleteFromS3 ? ' (incluindo S3)' : ''}`);
      res.json({ message: 'Relatório removido com sucesso' });
    } catch (error) {
      logger.error(`Erro ao remover relatório: ${error.message}`);
      res.status(500).json({ error: 'Erro ao remover relatório' });
    }
  }
}

module.exports = new ReportController();
