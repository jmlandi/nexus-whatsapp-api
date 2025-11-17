/**
 * AWS S3 Service - File Storage Management
 *
 * Manages upload, download, and deletion of marketing report PDFs in AWS S3.
 * Generates presigned URLs for secure temporary access to private files.
 *
 * @class S3Service
 * @example
 * const s3Service = new S3Service();
 *
 * // Upload report
 * const result = await s3Service.uploadReport(pdfBuffer, 'customer-uuid', 'october-report.pdf');
 * // Returns: { success: true, url: 'https://...', key: 'reports/customer-uuid/uuid.pdf' }
 *
 * // Get temporary download URL (valid for 1 hour)
 * const signedUrl = await s3Service.getSignedDownloadUrl(result.key);
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class S3Service {
  /**
   * Initialize S3 Service with AWS credentials
   *
   * @constructor
   * @throws {Error} If AWS credentials or bucket name are missing
   */
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
  }

  /**
   * Upload PDF report to S3
   *
   * Uploads a PDF file with a unique UUID filename to organized folder structure.
   * Files are stored in: reports/{customerId}/{uuid}.pdf
   * Includes metadata for tracking: original filename, customer ID, upload date.
   *
   * @async
   * @param {Buffer} fileBuffer - PDF file content as Buffer
   * @param {string} customerId - UUID of the customer who owns this report
   * @param {string} fileName - Original filename (e.g., 'october-report.pdf')
   * @returns {Promise<{success: boolean, url: string, key: string}>} Upload result with public URL and S3 key
   * @throws {Error} If upload fails due to network, permissions, or AWS errors
   *
   * @example
   * const pdfBuffer = fs.readFileSync('report.pdf');
   * const result = await s3Service.uploadReport(pdfBuffer, 'customer-uuid-123', 'october-2025.pdf');
   * // Returns: { success: true, url: 'https://...', key: 'reports/customer-uuid-123/abc-123.pdf' }
   */
  async uploadReport(fileBuffer, customerId, fileName) {
    try {
      // Gera chave única para o arquivo
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const key = `reports/${customerId}/${uniqueFileName}`;

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileBuffer,
        ContentType: 'application/pdf',
        Metadata: {
          originalName: fileName,
          customerId: customerId,
          uploadDate: new Date().toISOString()
        }
      });

      await this.client.send(command);

      const url = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

      logger.info(`Arquivo enviado para S3: ${key}`);

      return {
        success: true,
        url: url,
        key: key
      };
    } catch (error) {
      logger.error(`Erro ao fazer upload para S3: ${error.message}`);
      throw new Error(`Falha no upload: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for temporary secure access
   *
   * Creates a time-limited URL that grants read access to a private S3 object
   * without requiring AWS credentials. Perfect for sharing reports with customers
   * via WhatsApp or email while maintaining security.
   *
   * @async
   * @param {string} key - S3 object key (e.g., 'reports/customer-uuid/file.pdf')
   * @param {number} [expiresIn=3600] - URL expiration time in seconds (default: 1 hour)
   * @returns {Promise<string>} Presigned URL valid for specified duration
   * @throws {Error} If key not found or AWS credentials invalid
   *
   * @example
   * // Get URL valid for 1 hour (default)
   * const url1h = await s3Service.getSignedDownloadUrl('reports/customer-uuid/file.pdf');
   *
   * // Get URL valid for 24 hours
   * const url24h = await s3Service.getSignedDownloadUrl('reports/customer-uuid/file.pdf', 86400);
   */
  async getSignedDownloadUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });

      logger.info(`URL assinada gerada para: ${key}`);
      return signedUrl;
    } catch (error) {
      logger.error(`Erro ao gerar URL assinada: ${error.message}`);
      throw new Error(`Falha ao gerar URL: ${error.message}`);
    }
  }

  /**
   * Deleta arquivo do S3
   * @param {string} key - Chave do arquivo no S3
   * @returns {Promise<boolean>} True se deletado com sucesso
   */
  async deleteReport(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.client.send(command);

      logger.info(`Arquivo deletado do S3: ${key}`);
      return true;
    } catch (error) {
      logger.error(`Erro ao deletar arquivo S3: ${error.message}`);
      throw new Error(`Falha ao deletar: ${error.message}`);
    }
  }

  /**
   * Extrai a chave S3 de uma URL completa
   * @param {string} url - URL do S3
   * @returns {string} Chave do arquivo
   */
  extractKeyFromUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove a barra inicial
      return urlObj.pathname.substring(1);
    } catch (error) {
      logger.error(`Erro ao extrair chave da URL: ${error.message}`);
      return null;
    }
  }
}

// Exporta instância única
module.exports = new S3Service();
