const xlsx = require('xlsx');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const validateDataset = require('../utils/validateDataset');

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Global store for file paths
let filePaths = {
  ledger: null,
  bank: null
};

// In-memory cache for pagination (clears on server restart)
let dataCache = {
  ledger: [],
  bank: []
};

/**
 * Normalizes and cleans the data
 * @param {Array} data 
 * @param {string} type 
 * @returns {Array}
 */
const cleanData = (data, type) => {
  return data
    .filter(row => Object.values(row).some(val => val !== null && val !== undefined && val !== '')) // Remove empty rows
    .map((row, index) => {
      const normalizedRow = { row_index: index + 1 };
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

const getPreview = async (req, res) => {
  const { type, page = 1, limit = 100 } = req.query;
  const dataset = dataCache[type];

  if (!dataset || dataset.length === 0) {
    return res.status(404).json({
      success: false,
      message: 'No data found in cache. Please upload files first.'
    });
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const totalRows = dataset.length;
  const totalPages = Math.ceil(totalRows / limitNum);
  
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = pageNum * limitNum;
  const data = dataset.slice(startIndex, endIndex);

  return res.status(200).json({
    success: true,
    total_rows: totalRows,
    page: pageNum,
    limit: limitNum,
    total_pages: totalPages,
    data
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
      // Save original file to disk for native bridge
      const ext = path.extname(file.originalname) || '.xlsx';
      const fileName = `${type}_${Date.now()}${ext}`;
      const fullPath = path.join(UPLOADS_DIR, fileName);
      
      fs.writeFileSync(fullPath, file.buffer);
      filePaths[type] = fullPath;
      console.log(`[Persistence] Saved ${type} to ${fullPath}`);

      const workbook = xlsx.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

      const validation = validateDataset(data, type);
      
      const cleaned = cleanData(data, type);
      return cleaned;
    };

    let ledgerData, bankData;
    try {
      ledgerData = processFile(req.files.ledger[0], 'ledger');
      bankData = processFile(req.files.bank[0], 'bank');
      
      // Update cache
      dataCache.ledger = ledgerData;
      dataCache.bank = bankData;
      
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    // Prepare response structure with default values
    let responseData = {
      success: true,
      summary: {
        total_records: ledgerData.length + bankData.length,
        total_anomalies: 0,
        high_risk_count: 0,
        medium_risk_count: 0,
        low_risk_count: 0
      },
      insights: {
        top_risky_vendor: null,
        top_risky_approver: null,
        most_shared_bank_account: null
      },
      reconciliation: {
        matched_count: 0,
        partial_count: 0,
        missing_count: 0
      },
      charts: {
        vendor_risk_top10: [],
        approver_risk_top10: []
      },
      anomalies: [],
      risk_scores: [],
      issues: [],
      preview: {
        ledger_preview: ledgerData.slice(0, 5),
        bank_preview: bankData.slice(0, 5)
      },
      warning: null
    };

    // Call Python AI Service
    try {
      console.log(`[${new Date().toISOString()}] Sending data to AI Service (port 8000)...`);
      
      const aiResponse = await axios.post('http://localhost:8000/analyze', {
        ledger: ledgerData,
        bank: bankData,
        contamination: req.body.contamination || 0.05
      }, {
        timeout: 20000 // 20 seconds timeout
      });

      // Merge AI Service results into the final structure
      const ai = aiResponse.data;
      responseData.summary = ai.summary;
      responseData.insights = ai.insights;
      responseData.reconciliation = ai.reconciliation;
      responseData.charts = ai.charts;
      responseData.anomalies = ai.anomalies;
      responseData.risk_scores = ai.risk_scores;
      responseData.issues = ai.issues;
      responseData.forensic = ai.forensic;
      responseData.reconciliation_list = ai.reconciliation_list;

      console.log(`[${new Date().toISOString()}] AI Analysis completed successfully.`);

    } catch (aiError) {
      console.error('AI Service Error:', aiError.message);
      
      if (aiError.code === 'ECONNABORTED') {
        responseData.warning = "AI analysis timeout (exceeded 60s). Returning preview only.";
      } else if (aiError.code === 'ECONNREFUSED' || !aiError.response) {
        responseData.warning = "AI Analysis service is currently unavailable. Returning preview only.";
      } else {
        responseData.warning = `AI Analysis failed: ${aiError.response?.data?.error || aiError.message}`;
      }
    }

    res.status(200).json(responseData);

  } catch (error) {
    console.error('Upload Error:', error);
    res.status(500).json({
      success: false,
      message: 'An internal server error occurred during file processing.'
    });
  }
};

const openAtRow = async (req, res) => {
  const { type, rowIndex } = req.body;
  const filePath = filePaths[type];

  if (!filePath) {
    return res.status(404).json({ 
      success: false, 
      message: 'Source file not found on disk. Please re-upload the file to establish a native bridge.' 
    });
  }

  // Adjust for header: row_index 1 in app = row 2 in native apps
  const targetRow = parseInt(rowIndex) + 1;

  // Precision AppleScript (v3) with delays and active window targeting
  const script = `
    set targetPosixPath to "${filePath}"
    set targetRow to ${targetRow}

    try
        -- Try Microsoft Excel
        tell application "Microsoft Excel"
            activate
            open (POSIX file targetPosixPath)
            delay 0.5 -- Essential delay for file load
            tell active workbook
                tell active sheet
                    select range ("A" & targetRow)
                    -- Force scrolling to the selection
                    goto (range ("A" & targetRow))
                end tell
            end tell
        end tell
    on error
        try
            -- Fallback to Apple Numbers
            tell application "Numbers"
                activate
                open (POSIX file targetPosixPath)
                delay 0.5 -- Essential delay for file load
                tell document 1
                    tell sheet 1
                        tell table 1
                            set selection range to range ("A" & targetRow & ":Z" & targetRow)
                        end tell
                    end tell
                end tell
            end tell
        on error
            -- Final Fallback: Simple system open
            do shell script ("open " & quoted form of targetPosixPath)
        end try
    end try
  `;

  exec(`osascript -e '${script}'`, (err) => {
    if (err) {
      console.error('[Native Forge] Ultimate script failure:', err.message);
      exec(`open "${filePath}"`);
    }
  });

  return res.status(200).json({ 
    success: true, 
    message: `Executing Deep Sync: Opening ${type} at row ${targetRow}` 
  });
};

const generateMemo = async (req, res) => {
  console.log(`[${new Date().toISOString()}] Proxying AI Memo request...`);
  try {
    const aiResponse = await axios.post('http://localhost:8000/generate-memo', req.body);
    return res.status(200).json(aiResponse.data);
  } catch (error) {
    console.error('AI Memo Proxy Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to communicate with local AI service.'
    });
  }
};

module.exports = {
  uploadFiles,
  getPreview,
  generateMemo,
  openAtRow
};

