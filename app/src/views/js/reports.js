document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  try {
    const authCheck = await fetch('/api/invoices');
    if (authCheck.status === 401) {
      window.location.href = '/login.html';
      return;
    }
  } catch (err) {
    window.location.href = '/login.html';
    return;
  }

  const reportType = document.getElementById('reportType');
  const reportMonth = document.getElementById('reportMonth');
  const reportQuarter = document.getElementById('reportQuarter');
  const reportYear = document.getElementById('reportYear');
  const dateFrom = document.getElementById('dateFrom');
  const dateTo = document.getElementById('dateTo');
  const statusFilterReport = document.getElementById('statusFilterReport');
  const generateReportBtn = document.getElementById('generateReportBtn');
  const exportReportBtn = document.getElementById('exportReportBtn');
  
  const monthFilterGroup = document.getElementById('monthFilterGroup');
  const quarterFilterGroup = document.getElementById('quarterFilterGroup');
  const customDateRange = document.getElementById('customDateRange');
  
  const reportSummary = document.getElementById('reportSummary');
  const reportTableSection = document.getElementById('reportTableSection');
  const reportTableBody = document.getElementById('reportTableBody');
  
  const summaryCount = document.getElementById('summaryCount');
  const summaryTotal = document.getElementById('summaryTotal');
  const summaryPaid = document.getElementById('summaryPaid');
  const summaryUnpaid = document.getElementById('summaryUnpaid');

  let currentReportData = [];

  // Set default year to current year
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  reportYear.value = currentYear;
  reportMonth.value = currentMonth;

  // Handle report type change
  reportType.addEventListener('change', () => {
    const type = reportType.value;
    monthFilterGroup.style.display = type === 'monthly' ? 'flex' : 'none';
    quarterFilterGroup.style.display = type === 'quarterly' ? 'flex' : 'none';
    customDateRange.style.display = type === 'custom' ? 'flex' : 'none';
  });

  // Generate report
  generateReportBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) throw new Error('Failed to fetch invoices');
      
      const allInvoices = await res.json();
      const filtered = filterInvoices(allInvoices);
      currentReportData = filtered;
      
      displayReport(filtered);
    } catch (err) {
      console.error(err);
      alert('Napaka pri generiranju poročila');
    }
  });

  // Filter invoices based on selected criteria
  function filterInvoices(invoices) {
    const type = reportType.value;
    const year = parseInt(reportYear.value);
    const status = statusFilterReport.value;
    
    let filtered = invoices;

    // Filter by date range
    if (type === 'monthly') {
      const month = parseInt(reportMonth.value);
      filtered = filtered.filter(inv => {
        const d = new Date(inv.date);
        return d.getFullYear() === year && (d.getMonth() + 1) === month;
      });
    } else if (type === 'quarterly') {
      const quarter = parseInt(reportQuarter.value);
      const startMonth = (quarter - 1) * 3 + 1;
      const endMonth = quarter * 3;
      filtered = filtered.filter(inv => {
        const d = new Date(inv.date);
        const m = d.getMonth() + 1;
        return d.getFullYear() === year && m >= startMonth && m <= endMonth;
      });
    } else if (type === 'annual') {
      filtered = filtered.filter(inv => {
        const d = new Date(inv.date);
        return d.getFullYear() === year;
      });
    } else if (type === 'custom') {
      const from = dateFrom.value ? new Date(dateFrom.value) : null;
      const to = dateTo.value ? new Date(dateTo.value) : null;
      filtered = filtered.filter(inv => {
        const d = new Date(inv.date);
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      });
    }

    // Filter by status
    if (status) {
      filtered = filtered.filter(inv => inv.status === status);
    }

    return filtered;
  }

  // Display report
  function displayReport(invoices) {
    // Calculate summary
    const count = invoices.length;
    const total = invoices.reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const paid = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
    const unpaid = total - paid;

    summaryCount.textContent = count;
    summaryTotal.textContent = total.toFixed(2) + ' €';
    summaryPaid.textContent = paid.toFixed(2) + ' €';
    summaryUnpaid.textContent = unpaid.toFixed(2) + ' €';

    // Show summary
    reportSummary.style.display = 'block';
    reportTableSection.style.display = 'block';

    // Render table
    if (invoices.length === 0) {
      reportTableBody.innerHTML = '<tr><td colspan="6">Ni računov za izbrano obdobje</td></tr>';
      return;
    }

    reportTableBody.innerHTML = invoices.map(inv => `
      <tr>
        <td>${escapeHtml(inv.invoice_number || '')}</td>
        <td>${formatDate(inv.date)}</td>
        <td>${escapeHtml(inv.client_name || '')}</td>
        <td>${parseFloat(inv.amount || 0).toFixed(2)} €</td>
        <td>${escapeHtml(inv.status || '')}</td>
        <td>${formatDate(inv.due_date)}</td>
      </tr>
    `).join('');
  }

  // Export report to CSV
  exportReportBtn.addEventListener('click', () => {
    if (currentReportData.length === 0) {
      alert('Ni podatkov za izvoz');
      return;
    }

    const headers = ['Številka', 'Datum', 'Stranka', 'Znesek', 'Stanje', 'Rok plačila'];
    const rows = currentReportData.map(inv => [
      inv.invoice_number || '',
      inv.date || '',
      inv.client_name || '',
      parseFloat(inv.amount || 0).toFixed(2),
      inv.status || '',
      inv.due_date || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
      csv += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    // Create download
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `porocilo_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  });

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d)) return dateStr;
    return d.toLocaleDateString('sl-SI', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
});
