/**
 * PDF Service - PDF Text Extraction
 *
 * Downloads PDF files from AWS S3 and extracts text content for AI analysis.
 * Used primarily to extract marketing report content for contextualized chat responses.
 *
 * @class PDFService
 * @example
 * const pdfService = new PDFService();
 * const text = await pdfService.processPDF('https://bucket.s3.amazonaws.com/reports/report.pdf');
 * // Returns: Full text content extracted from PDF
 */

const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const { PDFParse } = require('pdf-parse');
const logger = require('../utils/logger');

class PDFService {
  /**
   * Initialize PDF Service with S3 client
   *
   * @constructor
   * @throws {Error} If AWS credentials are missing
   */
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
   * Download PDF from S3 and return as Buffer
   *
   * Extracts the S3 key from a full S3 URL and downloads the file content.
   * Converts the S3 stream response into a Buffer for processing.
   *
   * @async
   * @param {string} s3Url - Full S3 URL (e.g., https://bucket.s3.amazonaws.com/reports/file.pdf)
   * @returns {Promise<Buffer>} PDF file content as Buffer
   * @throws {Error} If download fails or file not found
   *
   * @example
   * const buffer = await pdfService.downloadPDFFromS3('https://bucket.s3.amazonaws.com/reports/oct-2025.pdf');
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
   * Extract text content from PDF Buffer
   *
   * Uses pdf-parse library to extract all text content from a PDF file.
   * Returns raw text including page breaks and formatting artifacts.
   *
   * @async
   * @param {Buffer} pdfBuffer - PDF file content as Buffer
   * @returns {Promise<string>} Extracted text content
   * @throws {Error} If PDF is corrupted or extraction fails
   *
   * @example
   * const text = await pdfService.extractTextFromPDF(pdfBuffer);
   * // Returns: "Marketing Report\n\nOctober 2025\n\nCampaign Performance..."
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
   * Process PDF: download from S3 and extract text (main method)
   *
   * Orchestrates the complete PDF processing workflow: downloads from S3,
   * converts to Buffer, and extracts text content. This is the primary
   * method used by the AI service to get report content.
   *
   * @async
   * @param {string} s3Url - Full S3 URL of the PDF file
   * @returns {Promise<string>} Extracted text content from PDF
   * @throws {Error} If download or extraction fails
   *
   * @example
   * const reportText = await pdfService.processPDF('https://bucket.s3.amazonaws.com/reports/oct-2025.pdf');
   * // Returns: Full text content extracted from the report PDF
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
          text = `${text.substring(0, maxChars)}\n\n[... conteúdo truncado por tamanho ...]`;
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
