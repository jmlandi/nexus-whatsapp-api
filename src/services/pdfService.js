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
const logger = require('../utils/logger');

// Use pdfjs-dist instead of pdf-parse for better reliability
let pdfjsLib = null;
const loadPDFJS = async () => {
  if (!pdfjsLib) {
    try {
      pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
      console.log('✅ pdfjs-dist library loaded successfully');
      logger.info('pdfjs-dist library loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load pdfjs-dist:', error.message);
      logger.error('Failed to load pdfjs-dist library', { error: error.message });
      throw new Error('PDF processing library not available');
    }
  }
  return pdfjsLib;
};class PDFService {
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
   * Uses pdfjs-dist library to extract all text content from a PDF file.
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
      // Validate that we received a valid buffer
      if (!Buffer.isBuffer(pdfBuffer)) {
        throw new Error(`Invalid input: expected Buffer, got ${typeof pdfBuffer}`);
      }

      if (pdfBuffer.length === 0) {
        throw new Error('PDF buffer is empty');
      }

      logger.info('Starting PDF text extraction...');
      console.log('📖 Loading PDF with pdfjs-dist...');

      // Lazy-load pdfjs-dist only when needed
      const pdfjsLib = await loadPDFJS();

      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({
        data: new Uint8Array(pdfBuffer),
        useSystemFonts: true,
        standardFontDataUrl: null
      });

      const pdfDocument = await loadingTask.promise;
      console.log('✅ PDF document loaded, pages:', pdfDocument.numPages);

      let fullText = '';

      // Extract text from each page
      for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
        const page = await pdfDocument.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        // Combine all text items from the page
        const pageText = textContent.items.map(item => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      if (!fullText || fullText.trim().length === 0) {
        throw new Error('No text content extracted from PDF');
      }

      console.log('✅ Text extracted successfully');
      logger.info(`Successfully extracted ${fullText.length} characters from PDF`);
      return fullText.trim();
    } catch (error) {
      console.error('❌ PDF extraction error:', error.message);
      logger.error('Error extracting text from PDF', { error: error.message, stack: error.stack });
      throw error;
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
      console.log('🔵 PDFService.processPDF START');
      console.log('S3 URL:', s3Url);

      const pdfBuffer = await this.downloadPDFFromS3(s3Url);
      console.log('✅ PDF downloaded, buffer size:', pdfBuffer.length);

      const text = await this.extractTextFromPDF(pdfBuffer);
      console.log('✅ Text extracted, length:', text.length);
      console.log('🔵 PDFService.processPDF END');

      return text;
    } catch (error) {
      console.error('❌ PDFService.processPDF ERROR:', error.message);
      console.error('Error stack:', error.stack);
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
