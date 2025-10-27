import { getTemplateConfig, generateCustomReceipt, getPurchaseTemplateConfig, generateCustomPurchaseReceipt } from "@/utils/templateUtils";

// Utility functions for printing
export class PrintUtils {
  // Check if we're on a mobile device
  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  // Print receipt with enhanced formatting and mobile support
  static printReceipt(transaction: any) {
    // For mobile devices, use a more reliable printing approach
    if (this.isMobileDevice()) {
      return this.printReceiptMobile(transaction);
    }

    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      // Fallback for popup blockers
      this.printReceiptFallback(transaction);
      return;
    }
    if (!receiptWindow) return;
    
    // Get template configuration
    const templateConfig = getTemplateConfig();
    
    let receiptContent;
    
    // Use custom template if enabled
    if (templateConfig.customTemplate) {
      receiptContent = generateCustomReceipt(transaction, templateConfig);
    } else {
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
      
      receiptContent = `
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
            
            ${transaction.customer ? `
            <div class="customer-info" style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000;">
              <div class="total-row">
                <div><strong>Customer:</strong></div>
                <div>${transaction.customer.name}</div>
              </div>
              ${transaction.customer.address ? `
              <div class="total-row">
                <div><strong>Address:</strong></div>
                <div>${transaction.customer.address}</div>
              </div>
              ` : ''}
              ${transaction.customer.email ? `
              <div class="total-row">
                <div><strong>Email:</strong></div>
                <div>${transaction.customer.email}</div>
              </div>
              ` : ''}
              ${transaction.customer.phone ? `
              <div class="total-row">
                <div><strong>Phone:</strong></div>
                <div>${transaction.customer.phone}</div>
              </div>
              ` : ''}
              ${transaction.customer.loyaltyPoints ? `
              <div class="total-row">
                <div><strong>Loyalty Points:</strong></div>
                <div>${transaction.customer.loyaltyPoints}</div>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
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
    }
    
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      receiptWindow.print();
      receiptWindow.close();
    }, 250);
  }

  // Print inventory report
  static printInventoryReport(products: any[]) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Inventory Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Inventory Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Cost</th>
                <th>Stock</th>
                <th>Barcode</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.category}</td>
                  <td>${product.price.toFixed(2)}</td>
                  <td>${product.cost.toFixed(2)}</td>
                  <td>${product.stock}</td>
                  <td>${product.barcode || 'N/A'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print sales report
  static printSalesReport(transactions: any[]) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sales Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sales Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Sales:</strong> $${totalSales.toFixed(2)}</p>
            <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
            <p><strong>Average Transaction:</strong> $${(totalSales / totalTransactions).toFixed(2)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Items</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td>${new Date(transaction.date).toLocaleDateString()}</td>
                  <td>${transaction.id}</td>
                  <td>${transaction.items.length} items</td>
                  <td>$${transaction.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print purchase report
  static printPurchaseReport(transactions: any[]) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const totalPurchases = transactions.reduce((sum, t) => sum + t.total, 0);
    const totalTransactions = transactions.length;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .summary {
              margin: 20px 0;
              padding: 15px;
              background-color: #f9f9f9;
              border-radius: 5px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Purchase Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="summary">
            <h2>Summary</h2>
            <p><strong>Total Purchases:</strong> $${totalPurchases.toFixed(2)}</p>
            <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
            <p><strong>Average Transaction:</strong> $${(totalPurchases / totalTransactions).toFixed(2)}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td>${new Date(transaction.date).toLocaleDateString()}</td>
                  <td>${transaction.id}</td>
                  <td>${transaction.supplier}</td>
                  <td>${transaction.items} items</td>
                  <td>$${transaction.total.toFixed(2)}</td>
                  <td>${transaction.status}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print purchase receipt for a single transaction
  static printPurchaseReceipt(transaction: any) {
    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) return;
    
    // Get purchase template configuration
    const templateConfig = getPurchaseTemplateConfig();
    
    let receiptContent;
    
    // Use custom template if enabled
    if (templateConfig.customTemplate) {
      receiptContent = generateCustomPurchaseReceipt(transaction, templateConfig);
    } else {
      // Format items for receipt
      const formattedItems = transaction.items || [];
      
      // Calculate totals
      const subtotal = transaction.subtotal || formattedItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
      // Display only tax (18% of subtotal) - for informational purposes only
      const displayTax = subtotal * 0.18;
      const discount = transaction.discount || 0;
      // Actual total calculation (tax not included in computation)
      const total = transaction.total || (subtotal - discount);
      const amountReceived = transaction.amountReceived || total;
      const change = transaction.change || (amountReceived - total);
      
      receiptContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Purchase Receipt</title>
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
              .note {
                font-size: 9px;
                font-style: italic;
                margin-top: 5px;
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
              <div>Purchase Order #: ${transaction.orderNumber || 'PO-' + Date.now()}</div>
              <div>Date: ${new Date(transaction.date || Date.now()).toLocaleDateString()}</div>
              <div>Time: ${new Date(transaction.date || Date.now()).toLocaleTimeString()}</div>
            </div>
            
            ${transaction.supplier ? `
            <div class="supplier-info" style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000;">
              <div class="total-row">
                <div><strong>Supplier:</strong></div>
                <div>${transaction.supplier.name}</div>
              </div>
              ${transaction.supplier.contactPerson ? `
              <div class="total-row">
                <div><strong>Contact:</strong></div>
                <div>${transaction.supplier.contactPerson}</div>
              </div>
              ` : ''}
            </div>
            ` : ''}
            
            <div class="items">
              ${formattedItems.map((item: any) => `
                <div class="item">
                  <div class="item-name">${item.name}</div>
                </div>
                <div class="item">
                  <div class="item-details">
                    <span class="item-quantity">${item.quantity}</span>
                    <span class="item-price">${item.price.toFixed(2)}</span>
                    <span class="item-total">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <div>Subtotal:</div>
                <div>${subtotal.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div>Tax (18%):</div>
                <div>${displayTax.toFixed(2)}</div>
              </div>
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
              <div class="note">Note: Tax is for display purposes only and not included in calculations</div>
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
              <div>Items purchased are not returnable</div>
              <div>Visit us again soon</div>
            </div>
          </body>
        </html>
      `;
    }
    
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      receiptWindow.print();
      receiptWindow.close();
    }, 250);
  }

  // Print financial report
  static printFinancialReport(reportData: any) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${reportData.title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
            .report-title {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-period {
              font-size: 16px;
              color: #666;
              margin-bottom: 10px;
            }
            .report-data {
              margin: 20px 0;
            }
            .data-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid #eee;
            }
            .data-label {
              font-weight: bold;
            }
            .data-value {
              font-weight: bold;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="report-title">${reportData.title}</div>
            <div class="report-period">${reportData.period || 'Current Period'}</div>
          </div>
          
          <div class="report-data">
            ${reportData.data.map((item: any) => `
              <div class="data-row">
                <span class="data-label">${item.name}:</span>
                <span class="data-value">$${item.value.toLocaleString()}</span>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Confidential - For Internal Use Only</p>
          </div>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print income statement
  static printIncomeStatement(data: any) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Income Statement</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
            }
            .business-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-period {
              font-size: 14px;
              color: #666;
              margin-bottom: 20px;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .report-table th {
              text-align: left;
              border-bottom: 1px solid #333;
              padding: 8px 0;
            }
            .report-table td {
              padding: 4px 0;
            }
            .text-right {
              text-align: right;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-bold {
              font-weight: bold;
            }
            .pl-4 {
              padding-left: 30px;
            }
            .border-b {
              border-bottom: 1px solid #ccc;
            }
            .border-t-2 {
              border-top: 2px solid #333;
            }
            .border-b-2 {
              border-bottom: 2px solid #333;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">${data.businessName}</div>
            <div class="report-title">INCOME STATEMENT</div>
            <div class="report-period">For the period ended ${data.period}</div>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                <th>Account</th>
                <th class="text-right">Amount (TZS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="font-semibold">Revenue / Sales</td>
                <td></td>
              </tr>
              <tr>
                <td class="pl-4">Total Sales</td>
                <td></td>
                <td class="text-right">${data.revenue.totalSales.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Less: Sales Returns & Allowances</td>
                <td class="text-right">(${data.revenue.salesReturns.toLocaleString()})</td>
              </tr>
              <tr>
                <td class="pl-4 font-semibold border-b">Net Sales</td>
                <td></td>
                <td class="text-right border-b">${data.revenue.netSales.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td class="font-semibold">Cost of Goods Sold (COGS)</td>
                <td></td>
              </tr>
              <tr>
                <td class="pl-4">Opening Stock</td>
                <td></td>
                <td class="text-right">${data.cogs.openingStock.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Add: Purchases</td>
                <td></td>
                <td class="text-right">${data.cogs.purchases.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Less: Closing Stock</td>
                <td class="text-right">(${data.cogs.closingStock.toLocaleString()})</td>
              </tr>
              <tr>
                <td class="pl-4 font-semibold border-b">Cost of Goods Sold</td>
                <td></td>
                <td class="text-right border-b">${data.cogs.costOfGoodsSold.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td class="font-semibold">Gross Profit</td>
                <td></td>
                <td class="text-right font-semibold">${data.grossProfit.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td class="font-semibold">Operating Expenses:</td>
                <td></td>
              </tr>
              <tr>
                <td class="pl-4">Salaries & Wages</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.salaries.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Rent Expense</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.rent.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Utilities (Electricity, Water, etc)</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.utilities.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Transport & Fuel</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.transport.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Office Supplies</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.officeSupplies.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Depreciation</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.depreciation.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4">Other Expenses</td>
                <td></td>
                <td class="text-right">${data.operatingExpenses.otherExpenses.toLocaleString()}</td>
              </tr>
              <tr>
                <td class="pl-4 font-semibold border-b">Total Operating Expenses</td>
                <td></td>
                <td class="text-right border-b">${data.operatingExpenses.totalOperatingExpenses.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td class="font-semibold">Operating Profit (EBIT)</td>
                <td></td>
                <td class="text-right font-semibold">${data.operatingProfit.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td>Add: Other Income (e.g. interest)</td>
                <td></td>
                <td class="text-right">${data.otherIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Less: Other Losses (if any)</td>
                <td class="text-right">(${data.otherLosses.toLocaleString()})</td>
              </tr>
              
              <tr>
                <td class="font-semibold">Profit Before Tax</td>
                <td></td>
                <td class="text-right font-semibold">${data.profitBeforeTax.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td>Less: Income Tax</td>
                <td class="text-right">(${data.incomeTax.toLocaleString()})</td>
              </tr>
              
              <tr>
                <td class="font-bold border-t-2 border-b-2">Net Profit (Loss)</td>
                <td></td>
                <td class="text-right font-bold border-t-2 border-b-2">${data.netProfit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="footer">
            <p>Prepared on: ${new Date().toLocaleDateString()}</p>
            <p>Confidential - For Internal Use Only</p>
          </div>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }

  // Print purchase order
  static printPurchaseOrder(poData: any) {
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) return;
    
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Purchase Order ${poData.orderNumber}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              font-size: 14px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .business-name {
              font-size: 20px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-title {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 20px;
            }
            .info-section {
              flex: 1;
            }
            .info-label {
              font-weight: bold;
              margin-bottom: 5px;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            .report-table th {
              text-align: left;
              border-bottom: 1px solid #333;
              padding: 8px;
              background-color: #f5f5f5;
            }
            .report-table td {
              padding: 8px;
              border-bottom: 1px solid #eee;
            }
            .text-right {
              text-align: right;
            }
            .font-semibold {
              font-weight: 600;
            }
            .font-bold {
              font-weight: bold;
            }
            .border-t {
              border-top: 1px solid #333;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #999;
            }
            .total-section {
              margin-top: 20px;
              text-align: right;
            }
            .total-row {
              display: flex;
              justify-content: flex-end;
              margin-bottom: 5px;
            }
            .total-label {
              width: 150px;
              font-weight: bold;
            }
            .total-value {
              width: 100px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="business-name">POS BUSINESS</div>
            <div class="report-title">PURCHASE ORDER</div>
            <div>Order #: ${poData.orderNumber}</div>
          </div>
          
          <div class="report-info">
            <div class="info-section">
              <div class="info-label">Supplier</div>
              <div>${poData.supplier.name}</div>
            </div>
            <div class="info-section">
              <div class="info-label">Date</div>
              <div>${new Date(poData.date).toLocaleDateString()}</div>
            </div>
          </div>
          
          <table class="report-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${poData.items.map((item: any) => `
                <tr>
                  <td>${item.productName}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unitPrice.toFixed(2)}</td>
                  <td class="text-right">${item.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total-section">
            <div class="total-row">
              <div class="total-label">Total:</div>
              <div class="total-value">${poData.total.toFixed(2)}</div>
            </div>
          </div>
          
          <div class="footer">
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Thank you for your business!</p>
          </div>
        </body>
      </html>
    `;
    
    reportWindow.document.write(reportContent);
    reportWindow.document.close();
    reportWindow.focus();
    
    // Give time for content to load before printing
    setTimeout(() => {
      reportWindow.print();
      reportWindow.close();
    }, 250);
  }
}
