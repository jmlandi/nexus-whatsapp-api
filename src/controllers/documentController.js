const multer = require('multer');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const prisma = require('../utils/prisma');
const logger = require('../utils/logger');

/**
 * Cria um cliente S3 com a configuração atual
 * Recria a cada chamada para garantir que usa as env vars corretas
 */
function getS3Client() {
  const awsRegion = process.env.AWS_REGION || 'us-east-2';

  return new S3Client({
    region: awsRegion,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    },
    // Força o uso do endpoint regional correto
    forcePathStyle: false,
    useAccelerateEndpoint: false
  });
}

// Configuração do Multer para armazenar em memória
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Aceita apenas PDFs
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos PDF são permitidos'), false);
    }
  }
});

/**
 * Upload de documento (PDF) para um cliente
 * POST /api/document/upload
 */
const uploadDocument = async (req, res) => {
  try {
    const { customerId, observations, startDate, endDate } = req.body;
    const file = req.file;

    // Validação
    if (!customerId) {
      return res.status(400).json({
        error: 'Cliente não especificado',
        message: 'O ID do cliente é obrigatório'
      });
    }

    if (!file) {
      return res.status(400).json({
        error: 'Arquivo não enviado',
        message: 'É necessário enviar um arquivo PDF'
      });
    }

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Datas não especificadas',
        message: 'As datas de início e fim são obrigatórias'
      });
    }

    // Verifica se o cliente existe
    const customer = await prisma.customer.findUnique({
      where: { id: customerId }
    });

    if (!customer) {
      return res.status(404).json({
        error: 'Cliente não encontrado',
        message: 'O cliente especificado não existe'
      });
    }

    // Gera nome único para o arquivo
    const timestamp = Date.now();
    const fileName = `reports/${customerId}/${timestamp}-${file.originalname}`;

    // Obtém região e cria cliente S3
    const awsRegion = process.env.AWS_REGION || 'us-east-2';
    const s3Client = getS3Client();

    // Upload para o S3
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    logger.info('Tentando upload para S3', {
      bucket: uploadParams.Bucket,
      key: uploadParams.Key,
      size: file.buffer.length,
      region: awsRegion,
      awsRegionEnv: process.env.AWS_REGION
    });

    await s3Client.send(new PutObjectCommand(uploadParams));

    logger.info('Upload S3 bem-sucedido', {
      bucket: uploadParams.Bucket,
      key: fileName
    });

    // URL do arquivo no S3
    const reportUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${awsRegion}.amazonaws.com/${fileName}`;

    // Salva o registro no banco
    const report = await prisma.report.create({
      data: {
        customerId,
        reportUrl,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        observations: observations || null
      },
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
    });

    logger.info('Documento enviado com sucesso', {
      reportId: report.id,
      customerId,
      fileName
    });

    res.status(201).json({
      message: 'Documento enviado com sucesso',
      report
    });
  } catch (error) {
    logger.error('Erro ao fazer upload do documento', {
      error: error.message,
      stack: error.stack,
      code: error.code,
      name: error.name,
      Code: error.Code,
      awsRegion: process.env.AWS_REGION,
      bucket: process.env.AWS_S3_BUCKET_NAME
    });

    // Retorna detalhes específicos baseado no tipo de erro
    const errorResponse = {
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao fazer upload do documento'
    };

    // Erros específicos do AWS S3
    if (error.name === 'NoSuchBucket') {
      errorResponse.message = 'Bucket S3 não encontrado';
      errorResponse.details = `Bucket: ${process.env.AWS_S3_BUCKET_NAME}`;
    } else if (error.name === 'InvalidAccessKeyId') {
      errorResponse.message = 'Credenciais AWS inválidas';
      errorResponse.details = 'Verifique AWS_ACCESS_KEY_ID';
    } else if (error.name === 'SignatureDoesNotMatch') {
      errorResponse.message = 'Credenciais AWS inválidas';
      errorResponse.details = 'Verifique AWS_SECRET_ACCESS_KEY';
    } else if (error.code === 'NetworkingError') {
      errorResponse.message = 'Erro de conexão com AWS S3';
      errorResponse.details = `Região: ${process.env.AWS_REGION}`;
    } else if (error.Code === 'PermanentRedirect' || error.message?.includes('endpoint')) {
      errorResponse.message = 'Erro de região do bucket S3';
      errorResponse.details = `Bucket ${process.env.AWS_S3_BUCKET_NAME} não está na região ${process.env.AWS_REGION}. Verifique a região correta no AWS Console.`;
    } else if (error.message) {
      errorResponse.details = error.message;
    }

    // Em desenvolvimento, retorna o stack trace
    if (process.env.NODE_ENV === 'development') {
      errorResponse.stack = error.stack;
    }

    res.status(500).json(errorResponse);
  }
};

/**
 * Lista documentos de um cliente
 * GET /api/document/customer/:customerId
 */
const getCustomerDocuments = async (req, res) => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, parseInt(process.env.MAX_PAGE_SIZE) || 100);

    const skip = (page - 1) * pageSize;

    // Busca os documentos
    const [documents, total] = await Promise.all([
      prisma.report.findMany({
        where: {
          customerId,
          isActive: true
        },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nickname: true
            }
          }
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.report.count({
        where: {
          customerId,
          isActive: true
        }
      })
    ]);

    res.json({
      documents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar documentos', { error: error.message });
    res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao buscar os documentos'
    });
  }
};

/**
 * Lista todos os documentos
 * GET /api/document
 */
const getAllDocuments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = Math.min(parseInt(req.query.pageSize) || 20, parseInt(process.env.MAX_PAGE_SIZE) || 100);

    const skip = (page - 1) * pageSize;

    // Busca os documentos
    const [documents, total] = await Promise.all([
      prisma.report.findMany({
        where: { isActive: true },
        include: {
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              nickname: true
            }
          }
        },
        orderBy: { startDate: 'desc' },
        skip,
        take: pageSize
      }),
      prisma.report.count({
        where: { isActive: true }
      })
    ]);

    res.json({
      documents,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize)
      }
    });
  } catch (error) {
    logger.error('Erro ao buscar documentos', { error: error.message });
    res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao buscar os documentos'
    });
  }
};

/**
 * Deleta um documento (soft delete)
 * DELETE /api/document/:id
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o documento existe
    const document = await prisma.report.findUnique({
      where: { id }
    });

    if (!document) {
      return res.status(404).json({
        error: 'Documento não encontrado',
        message: 'O documento especificado não existe'
      });
    }

    // Soft delete
    await prisma.report.update({
      where: { id },
      data: { isActive: false }
    });

    logger.info('Documento deletado', { reportId: id });

    res.json({
      message: 'Documento deletado com sucesso'
    });
  } catch (error) {
    logger.error('Erro ao deletar documento', { error: error.message });
    res.status(500).json({
      error: 'Erro no servidor',
      message: 'Ocorreu um erro ao deletar o documento'
    });
  }
};

module.exports = {
  upload,
  uploadDocument,
  getCustomerDocuments,
  getAllDocuments,
  deleteDocument
};
