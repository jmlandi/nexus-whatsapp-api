/**
 * Service do AWS S3
 * Gerencia upload e download de relatórios em PDF
 */

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class S3Service {
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
   * Faz upload de arquivo PDF para o S3
   * @param {Buffer} fileBuffer - Buffer do arquivo
   * @param {string} customerId - ID do cliente
   * @param {string} fileName - Nome original do arquivo
   * @returns {Promise<Object>} URL e chave do arquivo no S3
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
   * Gera URL assinada temporária para download
   * @param {string} key - Chave do arquivo no S3
   * @param {number} expiresIn - Tempo de expiração em segundos (padrão: 1 hora)
   * @returns {Promise<string>} URL assinada
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
