/**
 * Validates if the required fields exist in the dataset headers.
 * @param {Array} data - Array of objects (rows)
 * @param {string} type - 'ledger' or 'bank'
 * @returns {Object} - { isValid: boolean, missingFields: string[] }
 */
const validateDataset = (data, type) => {
  if (!data || data.length === 0) {
    return { isValid: false, message: 'File is empty' };
  }

  // Get columns from the first row
  const headers = Object.keys(data[0]);
  let requiredFields = [];

  if (type === 'ledger') {
    requiredFields = ['Transaction_Ref', 'Amount', 'Vendor_Name', 'Vendor_Bank_Account'];
  } else if (type === 'bank') {
    requiredFields = ['Transaction_Ref', 'Bank_Amount'];
  } else {
    return { isValid: false, message: 'Invalid dataset type provided for validation' };
  }

  const missingFields = requiredFields.filter(field => !headers.includes(field));

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields
  };
};

module.exports = validateDataset;
