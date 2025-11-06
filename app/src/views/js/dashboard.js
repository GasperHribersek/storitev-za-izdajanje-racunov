// Fetch invoices for logged-in user and populate the table
async function loadInvoices() {
  try {
    const res = await fetch('/api/invoices');
    if (!res.ok) throw new Error('Failed to fetch invoices');

    const invoices = await res.json();
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = '';

    invoices.forEach(inv => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${inv.invoice_number}</td>
        <td>${inv.date}</td>
        <td>$${inv.amount}</td>
      `;
      tbody.appendChild(row);
    });

    // Update chart after fetching invoices
    updateChart(invoices);
  } catch (err) {
    console.error(err);
  }
}

// Render chart using Chart.js
function updateChart(invoices) {
  const ctx = document.getElementById('invoiceChart').getContext('2d');

  const labels = invoices.map(inv => inv.date);
  const data = invoices.map(inv => inv.amount);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Invoice Amount',
        data: data,
        backgroundColor: 'rgba(0, 123, 255, 0.7)'
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: true }
      }
    }
  });
}

// Initialize dashboard
window.addEventListener('DOMContentLoaded', loadInvoices);
