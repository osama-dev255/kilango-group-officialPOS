// Utility functions for exporting data
export class ExportUtils {
  // Export data to CSV
  static exportToCSV(data: any[], filename: string) {
    if (!data || data.length === 0) return;

    // Create CSV content
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).map(value => {
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    );
    
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export data to JSON
  static exportToJSON(data: any[], filename: string) {
    if (!data) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export data to PDF (simplified version)
  static exportToPDF(data: any[], filename: string, title: string) {
    if (!data || data.length === 0) return;

    // Create a simple HTML table for PDF
    let htmlContent = `
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <table>
            <thead>
              <tr>
    `;

    // Add headers
    Object.keys(data[0]).forEach(key => {
      htmlContent += `<th>${key}</th>`;
    });

    htmlContent += `
              </tr>
            </thead>
            <tbody>
    `;

    // Add rows
    data.forEach(row => {
      htmlContent += '<tr>';
      Object.values(row).forEach(value => {
        htmlContent += `<td>${value}</td>`;
      });
      htmlContent += '</tr>';
    });

    htmlContent += `
            </tbody>
          </table>
        </body>
      </html>
    `;

    // Create PDF using browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.focus();
      // Give time for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }

  // Export transaction receipt
  static exportReceipt(transaction: any, filename: string) {
    const receiptContent = `
      ================================
              SALE RECEIPT
      ================================
      Date: ${new Date().toLocaleDateString()}
      Time: ${new Date().toLocaleTimeString()}
      
      Items:
      ${transaction.items.map((item: any) => 
        `${item.name} x${item.quantity} @ ${item.price.toFixed(2)} = ${(item.price * item.quantity).toFixed(2)}`
      ).join('\n      ')}
      
      -------------------------------
      Subtotal: ${transaction.subtotal.toFixed(2)}
      Tax: ${transaction.tax.toFixed(2)}
      Discount: ${transaction.discount.toFixed(2)}
      Total: ${transaction.total.toFixed(2)}
      -------------------------------
      
      Payment Method: ${transaction.paymentMethod}
      Amount Received: ${transaction.amountReceived.toFixed(2)}
      Change: ${transaction.change.toFixed(2)}
      
      Thank you for your business!
      ================================
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}.txt`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export receipt as PDF
  static exportReceiptAsPDF(transaction: any, filename: string) {
    if (!transaction) return;

    // Format items for receipt
    const formattedItems = transaction.items.map((item: any) => {
      const total = item.price * item.quantity;
      return {
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: total
      };
    });
    
    // Calculate totals
    const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + item.total, 0);
    const tax = transaction.tax || 0;
    const discount = transaction.discount || 0;
    const total = transaction.total || (subtotal + tax - discount);
    const amountReceived = transaction.amountReceived || total;
    const change = transaction.change || (amountReceived - total);
    
    const receiptContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              max-width: 320px;
              margin: 0 auto;
              padding: 10px;
            }
            .header {
              text-align: center;
              border-bottom: 1px dashed #000;
              padding-bottom: 10px;
              margin-bottom: 10px;
            }
            .business-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .business-info {
              font-size: 10px;
              margin-bottom: 5px;
            }
            .receipt-info {
              display: flex;
              justify-content: space-between;
              font-size: 10px;
              margin-bottom: 10px;
            }
            .items {
              margin-bottom: 10px;
            }
            .item {
              display: flex;
              margin-bottom: 5px;
            }
            .item-name {
              flex: 2;
            }
            .item-details {
              flex: 1;
              text-align: right;
            }
            .item-price::before {
              content: "@ ";
            }
            .item-total {
              font-weight: bold;
            }
            .totals {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
            }
            .final-total {
              font-weight: bold;
              font-size: 14px;
              margin: 10px 0;
            }
            .payment-info {
              border-top: 1px dashed #000;
              padding-top: 10px;
              margin-top: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 20px;
              font-size: 10px;
            }
            .thank-you {
              font-weight: bold;
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">POS BUSINESS</div>
            <div class="business-info">123 Business St, City, Country</div>
            <div class="business-info">Phone: (123) 456-7890</div>
          </div>
          
          <div class="receipt-info">
            <div>Receipt #: ${transaction.id || 'TXN-' + Date.now()}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Time: ${new Date().toLocaleTimeString()}</div>
          </div>
          
          <div class="items">
            ${formattedItems.map((item: any) => `
              <div class="item">
                <div class="item-name">${item.name}</div>
              </div>
              <div class="item">
                <div class="item-details">
                  <span class="item-quantity">${item.quantity}</span>
                  <span class="item-price">${item.price.toFixed(2)}</span>
                  <span class="item-total">${item.total.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="totals">
            <div class="total-row">
              <div>Subtotal:</div>
              <div>${subtotal.toFixed(2)}</div>
            </div>
            ${tax > 0 ? `
            <div class="total-row">
              <div>Tax:</div>
              <div>${tax.toFixed(2)}</div>
            </div>
            ` : ''}
            ${discount > 0 ? `
            <div class="total-row">
              <div>Discount:</div>
              <div>-${discount.toFixed(2)}</div>
            </div>
            ` : ''}
            <div class="total-row final-total">
              <div>TOTAL:</div>
              <div>${total.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="total-row">
              <div>Payment Method:</div>
              <div>${transaction.paymentMethod || 'Cash'}</div>
            </div>
            <div class="total-row">
              <div>Amount Received:</div>
              <div>${amountReceived.toFixed(2)}</div>
            </div>
            <div class="total-row">
              <div>Change:</div>
              <div>${change.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="footer">
            <div class="thank-you">Thank you for your business!</div>
            <div>Items sold are not returnable</div>
            <div>Visit us again soon</div>
          </div>
        </body>
      </html>
    `;
    
    // Create PDF using browser's print functionality
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(receiptContent);
      printWindow.document.close();
      printWindow.focus();
      // Give time for content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    }
  }
}