const Invoice = require('../models/invoiceModel');

function getInvoicesByUser(userId) {
	// delegate to the model which returns a promise
	return Invoice.getInvoicesByUser(userId);
}

function createInvoice({ user_id, invoice_number, date, amount, description, due_date, client_name, status }) {
	return Invoice.createInvoice({ user_id, invoice_number, date, amount, description, due_date, client_name, status });
}

function deleteInvoice(id) {
	return Invoice.deleteInvoice(id);
}

function updateInvoice(data) {
	console.log('controller.updateInvoice data=', data);
	return Invoice.updateInvoice(data);
}

module.exports = { getInvoicesByUser, createInvoice, deleteInvoice, updateInvoice };
