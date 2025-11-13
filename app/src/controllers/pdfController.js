const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const { pool } = require('../../config/db');

async function generateInvoicePDF(invoiceId, res) {
  try {
    const [results] = await pool.promise().query(
      `SELECT i.*, u.name, u.email 
       FROM invoices i 
       JOIN users u ON i.user_id = u.id 
       WHERE i.id = ?`,
      [invoiceId]
    );

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = results[0];

    // Helper to remove diacritics / normalize to basic ASCII when using built-in PDF fonts
    function sanitizeText(input) {
      if (!input) return '';
      try {
        return String(input).normalize('NFKD').replace(/\p{M}/gu, '');
      } catch (e) {
        return String(input);
      }
    }

    // Build a QR payload. If you prefer a URL, we can change this to include a public invoice URL.
    const qrPayload = `INVOICE|id:${invoice.id}|no:${invoice.invoice_number}|amt:${invoice.amount}|date:${invoice.date || ''}|client:${invoice.client_name || ''}`;

    let qrBuffer = null;
    try {
      qrBuffer = await QRCode.toBuffer(qrPayload, { type: 'png', margin: 1, width: 160 });
    } catch (qrErr) {
      console.error('Error generating QR code:', qrErr);
      qrBuffer = null;
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=\"invoice-${invoice.invoice_number}.pdf\"`);

    // Pipe to response
    doc.pipe(res);

    // Header section - explicit positions to avoid overlap
    const headerY = 40;
    doc.fontSize(20).font('Helvetica-Bold').text(sanitizeText('RAČUN'), 0, headerY, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Stevilka racuna: ${sanitizeText(invoice.invoice_number)}`, 0, headerY + 36, { align: 'center' });

    // Company info (left side) and invoice details (right side)
    const infoStartY = headerY + 90; // lower than before to prevent overlap
    const rightX = 360;

    doc.fontSize(10).font('Helvetica-Bold').text('Izdajatelj:', 50, infoStartY);
    doc.fontSize(10).font('Helvetica');
    doc.text(sanitizeText(invoice.name) || 'N/A', 50, infoStartY + 20);
    doc.text(sanitizeText(invoice.email) || 'N/A', 50, infoStartY + 35);

    doc.fontSize(10).font('Helvetica-Bold').text('Podatki o racunu:', rightX, infoStartY);
    doc.fontSize(10).font('Helvetica');
    doc.text(`Datum: ${invoice.date ? new Date(invoice.date).toLocaleDateString('sl-SI') : ''}`, rightX, infoStartY + 20);
    doc.text(`Rok placila: ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString('sl-SI') : 'N/A'}`, rightX, infoStartY + 35);
    doc.text(`Stanje: ${sanitizeText(translateStatus(invoice.status))}`, rightX, infoStartY + 50);

    // If QR buffer present, draw it at the top-right area near invoice details
    if (qrBuffer) {
      try {
        const qrX = rightX + 120; // position to the right of invoice details
        const qrY = infoStartY;
        doc.image(qrBuffer, qrX, qrY, { width: 100 });
      } catch (imgErr) {
        console.error('Error embedding QR image into PDF:', imgErr);
      }
    }

    // Customer info
    doc.moveDown(4);
    doc.fontSize(10).font('Helvetica-Bold').text('Stranka:', 50);
    doc.fontSize(10).font('Helvetica');
    doc.text(sanitizeText(invoice.client_name) || 'N/A', 50, doc.y + 15);

    // Items table
    doc.moveDown(2);
    const tableTop = doc.y;
    const col1X = 50;
    const col2X = 300;
    const col3X = 450;

    // Table header
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('Opis', col1X, tableTop);
    doc.text('Znesek', col2X, tableTop);
    doc.text('Skupaj', col3X, tableTop);

    // Draw line
    doc.strokeColor('#CCCCCC').lineWidth(1);
    doc.moveTo(col1X, tableTop + 20).lineTo(550, tableTop + 20).stroke();

    // Items
    doc.fontSize(10).font('Helvetica');
    doc.text(sanitizeText(invoice.description) || 'Storitev', col1X, tableTop + 30);
    doc.text(`€ ${parseFloat(invoice.amount).toFixed(2)}`, col2X, tableTop + 30);
    doc.text(`€ ${parseFloat(invoice.amount).toFixed(2)}`, col3X, tableTop + 30);

    // Total section
    doc.moveDown(3);
    const totalY = doc.y;
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('SKUPAJ:', col2X, totalY);
    doc.text(`€ ${parseFloat(invoice.amount).toFixed(2)}`, col3X, totalY);

    // Footer: place messages near the bottom of the page
    const footerY = doc.page.height - 80; // position a bit above bottom
    doc.fontSize(9).font('Helvetica').fillColor('#999999');
    doc.text('Zahvaljujemo se vam za poslovanje!', 50, footerY - 20, { align: 'center' });
    doc.text(`Ustvarjeno: ${new Date().toLocaleDateString('sl-SI')}`, 50, footerY, { align: 'center' });

    // Finalize PDF
    doc.end();
  } catch (err) {
    console.error('Error generating invoice PDF:', err);
    return res.status(500).json({ message: 'Error generating PDF' });
  }
}

function translateStatus(status) {
  const statusMap = {
    'draft': 'Osnutek',
    'sent': 'Poslano',
    'paid': 'Plačano',
    'overdue': 'Prekoračeno',
    'cancelled': 'Odpoklicano'
  };
  return statusMap[status] || status;
}

// Generate CSV for a single invoice
async function generateInvoiceCSV(invoiceId, res) {
  try {
    const [results] = await pool.promise().query(
      `SELECT i.*, u.name, u.email 
       FROM invoices i 
       JOIN users u ON i.user_id = u.id 
       WHERE i.id = ?`,
      [invoiceId]
    );

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    const invoice = results[0];

    function csvEscape(val) {
      if (val == null) return '';
      const s = String(val).replace(/"/g, '""');
      return `"${s}"`;
    }

    const headers = ['invoice_number','date','due_date','status','client_name','description','amount','user_name','user_email'];
    const row = [
      invoice.invoice_number,
      invoice.date ? new Date(invoice.date).toISOString().slice(0,10) : '',
      invoice.due_date ? new Date(invoice.due_date).toISOString().slice(0,10) : '',
      invoice.status || '',
      invoice.client_name || '',
      invoice.description || '',
      invoice.amount != null ? parseFloat(invoice.amount).toFixed(2) : '',
      invoice.name || '',
      invoice.email || ''
    ];

    const csv = headers.join(',') + '\n' + row.map(csvEscape).join(',') + '\n';

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename=\"invoice-${invoice.invoice_number}.csv\"`);
    return res.send(csv);
  } catch (err) {
    console.error('Error generating CSV:', err);
    return res.status(500).json({ message: 'Error generating CSV' });
  }
}

module.exports = { generateInvoicePDF, generateInvoiceCSV };
