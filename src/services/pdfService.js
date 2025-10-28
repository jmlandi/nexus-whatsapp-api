/**
 * Service de PDF - Extração de texto de PDFs
 * Baixa PDFs do S3 e extrai conteúdo para análise da IA
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { PDFParse } = require('pdf-parse');
const logger = require('../utils/logger');

class PDFService {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    this.bucket = process.env.AWS_S3_BUCKET_NAME;
  }

  /**
   * Baixa PDF do S3 e retorna como Buffer
   * @param {string} s3Url - URL completa do S3
   * @returns {Promise<Buffer>}
   */
  async downloadPDFFromS3(s3Url) {
    try {
      // Extrai o key do S3 da URL
      const url = new URL(s3Url);
      const key = url.pathname.substring(1); // Remove a barra inicial
      
      logger.info(`Baixando PDF do S3: ${key}`);

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key
      });

      const response = await this.s3Client.send(command);
      
      // Converte stream para buffer
      const chunks = [];
      for await (const chunk of response.Body) {
        chunks.push(chunk);
      }
      
      return Buffer.concat(chunks);
    } catch (error) {
      logger.error(`Erro ao baixar PDF do S3: ${error.message}`);
      throw new Error('Não foi possível baixar o arquivo PDF');
    }
  }

  /**
   * Extrai texto de um PDF
   * @param {Buffer} pdfBuffer - Buffer contendo o PDF
   * @returns {Promise<string>}
   */
  async extractTextFromPDF(pdfBuffer) {
    try {
      logger.info('Extraindo texto do PDF...');
      
      const parser = new PDFParse({ data: pdfBuffer });
      const result = await parser.getText();
      
      logger.info(`Texto extraído: ${result.text.length} caracteres, ${result.numPages} páginas`);
      
      return result.text;
    } catch (error) {
      logger.error(`Erro ao extrair texto do PDF: ${error.message}`);
      throw new Error('Não foi possível extrair texto do PDF');
    }
  }

  /**
   * Processa um PDF completo: baixa do S3 e extrai texto
   * @param {string} s3Url - URL do PDF no S3
   * @returns {Promise<string>}
   */
  async processPDF(s3Url) {
    try {
      const pdfBuffer = await this.downloadPDFFromS3(s3Url);
      const text = await this.extractTextFromPDF(pdfBuffer);
      
      return text;
    } catch (error) {
      logger.error(`Erro ao processar PDF: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extrai e sumariza conteúdo de múltiplos PDFs
   * @param {Array<string>} s3Urls - Array de URLs dos PDFs
   * @param {number} maxChars - Máximo de caracteres por PDF (para não sobrecarregar IA)
   * @returns {Promise<Array<{url: string, text: string, error: string}>>}
   */
  async processMultiplePDFs(s3Urls, maxChars = 8000) {
    const results = [];
    
    for (const url of s3Urls) {
      try {
        let text = await this.processPDF(url);
        
        // Limita o tamanho do texto para não sobrecarregar a IA
        if (text.length > maxChars) {
          text = text.substring(0, maxChars) + '\n\n[... conteúdo truncado por tamanho ...]';
        }
        
        results.push({
          url,
          text,
          error: null
        });
      } catch (error) {
        results.push({
          url,
          text: null,
          error: error.message
        });
      }
    }
    
    return results;
  }

  /**
   * Limpa e formata texto extraído do PDF
   * @param {string} text - Texto bruto extraído
   * @returns {string}
   */
  cleanText(text) {
    return text
      .replace(/\s+/g, ' ') // Remove múltiplos espaços
      .replace(/\n{3,}/g, '\n\n') // Limita quebras de linha
      .trim();
  }
}

module.exports = new PDFService();
