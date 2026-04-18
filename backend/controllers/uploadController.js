const xlsx = require('xlsx');
const validateDataset = require('../utils/validateDataset');

/**
 * Normalizes and cleans the data
 * @param {Array} data 
 * @param {string} type 
 * @returns {Array}
 */
const cleanData = (data, type) => {
  return data
    .filter(row => Object.values(row).some(val => val !== null && val !== undefined && val !== '')) // Remove empty rows
    .map(row => {
      const normalizedRow = {};
      for (const [key, value] of Object.entries(row)) {
        let cleanValue = typeof value === 'string' ? value.trim() : value;

        // Convert Amount fields to numbers
        if ((key === 'Amount' || key === 'Bank_Amount') && cleanValue !== '') {
          const num = Number(cleanValue);
          cleanValue = isNaN(num) ? cleanValue : num;
        }

        // Parse Dates (handle Excel serial dates and YYYY-MM-DD strings)
        if (key === 'Date' && cleanValue) {
          let date;
          if (typeof cleanValue === 'number') {
            // Excel serial date conversion
            date = new Date((cleanValue - 25569) * 86400 * 1000);
          } else {
            // String parsing (assuming YYYY-MM-DD or standard JS-parseable string)
            date = new Date(cleanValue);
          }
          cleanValue = isNaN(date.getTime()) ? null : date;
        }

        normalizedRow[key] = cleanValue;
      }
      return normalizedRow;
    });
};

const uploadFiles = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Received dual upload request...`);
  try {
    if (!req.files || !req.files.ledger || !req.files.bank) {
      console.warn('Upload error: Missing files');
      return res.status(400).json({
        success: false,
        message: 'Both ledger and bank files are required.'
      });
    }

    const processFile = (file, type) => {
      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const validation = validateDataset(data, type);
      if (!validation.isValid) {
        throw new Error(`Validation failed for ${type}: Missing columns [${validation.missingFields.join(', ')}]`);
      }

      const cleaned = cleanData(data, type);
      return cleaned;
    };

    let ledgerData, bankData;
    try {
      ledgerData = processFile(req.files.ledger[0], 'ledger');
      bankData = processFile(req.files.bank[0], 'bank');
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    res.status(200).json({
      success: true,
      ledger_count: ledgerData.length,
      bank_count: bankData.length,
      ledger_preview: ledgerData.slice(0, 10),
      bank_preview: bankData.slice(0, 10)
    });

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred during file processing.'
    });
  }
};

module.exports = {
  uploadFiles
};
