const Invoice = require('../models/invoiceModel');

function getInvoicesByUser(userId) {
	// delegate to the model which returns a promise
	return Invoice.getInvoicesByUser(userId);
}

module.exports = { getInvoicesByUser };
