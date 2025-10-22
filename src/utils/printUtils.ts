import { getTemplateConfig, generateCustomReceipt } from "@/utils/templateUtils";

// Utility functions for printing
export class PrintUtils {
  // Print receipt with enhanced formatting
  static printReceipt(transaction: any) {
    const receiptWindow = window.open('', '_blank');
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
}