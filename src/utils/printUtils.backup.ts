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
      try {
        receiptWindow.print();
        // Don't close immediately on mobile to avoid issues
        if (!this.isMobileDevice()) {
          receiptWindow.close();
        }
      } catch (error) {
        console.error('Print error:', error);
        // Fallback method
        this.printReceiptFallback(transaction);
      }
    }, 500);
  }

  // Mobile-optimized printing method
  static printReceiptMobile(transaction: any) {
    // Check if there's already a print container to prevent multiple instances
    if (document.querySelector('#mobilePrintContainer')) {
      console.warn('Print operation already in progress');
      return;
    }

    try {
      // Create a temporary print-friendly element in the current document
      const printContainer = document.createElement('div');
      printContainer.id = 'mobilePrintContainer';
      printContainer.style.position = 'fixed';
      printContainer.style.top = '0';
      printContainer.style.left = '0';
      printContainer.style.width = '100%';
      printContainer.style.height = '100%';
      printContainer.style.backgroundColor = 'white';
      printContainer.style.zIndex = '9999';
      printContainer.style.padding = '20px';
      printContainer.style.fontFamily = "'Courier New', monospace";
      printContainer.style.fontSize = '12px';
      printContainer.style.overflowY = 'auto';
      
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
      
      printContainer.innerHTML = `
        <div style="max-width: 320px; margin: 0 auto;">
          <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">POS BUSINESS</div>
            <div style="font-size: 10px; margin-bottom: 5px;">123 Business St, City, Country</div>
            <div style="font-size: 10px; margin-bottom: 5px;">Phone: (123) 456-7890</div>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 10px;">
            <div>Receipt #: ${transaction.id || 'TXN-' + Date.now()}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Time: ${new Date().toLocaleTimeString()}</div>
          </div>
          
          ${transaction.customer ? `
          <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Customer:</strong></div>
              <div>${transaction.customer.name}</div>
            </div>
            ${transaction.customer.address ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Address:</strong></div>
              <div>${transaction.customer.address}</div>
            </div>
            ` : ''}
            ${transaction.customer.email ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Email:</strong></div>
              <div>${transaction.customer.email}</div>
            </div>
            ` : ''}
            ${transaction.customer.phone ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Phone:</strong></div>
              <div>${transaction.customer.phone}</div>
            </div>
            ` : ''}
            ${transaction.customer.loyaltyPoints ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Loyalty Points:</strong></div>
              <div>${transaction.customer.loyaltyPoints}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div style="margin-bottom: 10px;">
            ${formattedItems.map((item: any) => `
              <div style="display: flex; margin-bottom: 5px;">
                <div style="flex: 2;">${item.name}</div>
              </div>
              <div style="display: flex; margin-bottom: 5px;">
                <div style="flex: 1; text-align: right;">
                  <span>${item.quantity}</span>
                  <span style="margin: 0 5px;">@</span>
                  <span>${item.price.toFixed(2)}</span>
                  <span style="font-weight: bold; margin-left: 10px;">${item.total.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Subtotal:</div>
              <div>${subtotal.toFixed(2)}</div>
            </div>
            ${tax > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Tax:</div>
              <div>${tax.toFixed(2)}</div>
            </div>
            ` : ''}
            ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Discount:</div>
              <div>-${discount.toFixed(2)}</div>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 14px;">
              <div>TOTAL:</div>
              <div>${total.toFixed(2)}</div>
            </div>
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Payment Method:</div>
              <div>${transaction.paymentMethod || 'Cash'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Amount Received:</div>
              <div>${amountReceived.toFixed(2)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Change:</div>
              <div>${change.toFixed(2)}</div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 10px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Thank you for your business!</div>
            <div>Items sold are not returnable</div>
            <div>Visit us again soon</div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; display: flex; justify-content: center; gap: 10px;">
            <button id="printButton" style="padding: 10px 20px; background-color: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print Receipt
            </button>
            <button id="closePrint" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Close
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(printContainer);
      
      // Add event listener to print button
      const printButton = printContainer.querySelector('#printButton');
      if (printButton) {
        printButton.addEventListener('click', () => {
          // Disable the print button temporarily to prevent multiple clicks
          (printButton as HTMLButtonElement).disabled = true;
          (printButton as HTMLButtonElement).textContent = 'Printing...';
          (printButton as HTMLButtonElement).style.backgroundColor = '#6c757d';
          
          // Trigger print after a short delay to ensure content is rendered
          setTimeout(() => {
            try {
              window.print();
              // Re-enable the print button after printing
              setTimeout(() => {
                if (printButton) {
                  (printButton as HTMLButtonElement).disabled = false;
                  (printButton as HTMLButtonElement).textContent = 'Print Receipt';
                  (printButton as HTMLButtonElement).style.backgroundColor = '#28a745';
                }
              }, 1000);
            } catch (error) {
              console.error('Mobile print error:', error);
              // Re-enable the print button on error
              if (printButton) {
                (printButton as HTMLButtonElement).disabled = false;
                (printButton as HTMLButtonElement).textContent = 'Print Receipt';
                (printButton as HTMLButtonElement).style.backgroundColor = '#28a745';
              }
              this.showPrintError(transaction);
            }
          }, 300);
        });
      }
      
      // Add event listener to close button
      const closeButton = printContainer.querySelector('#closePrint');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          document.body.removeChild(printContainer);
        });
      }
      
      // Trigger print automatically on first display
      setTimeout(() => {
        try {
          window.print();
        } catch (error) {
          console.error('Mobile print error:', error);
          this.showPrintError(transaction);
        }
      }, 500);
    } catch (error) {
      console.error('Mobile print setup error:', error);
      // Remove any existing print container on error
      const existingContainer = document.querySelector('#mobilePrintContainer');
      if (existingContainer) {
        document.body.removeChild(existingContainer);
      }
      this.printReceiptFallback(transaction);
    }
  }

  // Show print error message with retry option
  static showPrintError(transaction?: any) {
    // Remove any existing error messages
    const existingError = document.querySelector('#printErrorContainer');
    if (existingError) {
      document.body.removeChild(existingError);
    }
    
    const errorContainer = document.createElement('div');
    errorContainer.id = 'printErrorContainer';
    errorContainer.style.position = 'fixed';
    errorContainer.style.top = '50%';
    errorContainer.style.left = '50%';
    errorContainer.style.transform = 'translate(-50%, -50%)';
    errorContainer.style.backgroundColor = '#f8d7da';
    errorContainer.style.color = '#721c24';
    errorContainer.style.padding = '20px';
    errorContainer.style.borderRadius = '5px';
    errorContainer.style.zIndex = '10000';
    errorContainer.style.maxWidth = '90%';
    errorContainer.style.textAlign = 'center';
    errorContainer.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
      <div style="margin-bottom: 15px;">There was a problem printing the receipt. Please try again.</div>
      <div style="display: flex; justify-content: center; gap: 10px;">
        <button id="retryPrint" style="padding: 8px 15px; background-color: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Retry Print
        </button>
        <button id="errorClose" style="padding: 8px 15px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
          Close
        </button>
      </div>
    `;
    
    document.body.appendChild(errorContainer);
    
    const retryButton = errorContainer.querySelector('#retryPrint');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        document.body.removeChild(errorContainer);
        // Try to print again
        try {
          if (transaction) {
            // If we have transaction data, reprint the receipt
            this.printReceipt(transaction);
          } else {
            // Otherwise, try to print the current window content
            window.print();
          }
        } catch (error) {
          console.error('Retry print error:', error);
          this.showPrintError(transaction);
        }
      });
    }
    
    const errorClose = errorContainer.querySelector('#errorClose');
    if (errorClose) {
      errorClose.addEventListener('click', () => {
        document.body.removeChild(errorContainer);
      });
    }
    
    // Auto-remove error after 10 seconds
    setTimeout(() => {
      if (document.body.contains(errorContainer)) {
        document.body.removeChild(errorContainer);
      }
    }, 10000);
  }

  // Fallback printing method for when popups are blocked
  static printReceiptFallback(transaction: any) {
    try {
      // Create a print-friendly version in the current window
      const originalContent = document.body.innerHTML;
      
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
      
      const printContent = `
        <div style="font-family: 'Courier New', monospace; font-size: 12px; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px;">
            <div style="font-size: 16px; font-weight: bold; margin-bottom: 5px;">POS BUSINESS</div>
            <div style="font-size: 10px; margin-bottom: 5px;">123 Business St, City, Country</div>
            <div style="font-size: 10px; margin-bottom: 5px;">Phone: (123) 456-7890</div>
          </div>
          
          <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 10px;">
            <div>Receipt #: ${transaction.id || 'TXN-' + Date.now()}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Time: ${new Date().toLocaleTimeString()}</div>
          </div>
          
          ${transaction.customer ? `
          <div style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px dashed #000;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Customer:</strong></div>
              <div>${transaction.customer.name}</div>
            </div>
            ${transaction.customer.address ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Address:</strong></div>
              <div>${transaction.customer.address}</div>
            </div>
            ` : ''}
            ${transaction.customer.email ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Email:</strong></div>
              <div>${transaction.customer.email}</div>
            </div>
            ` : ''}
            ${transaction.customer.phone ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Phone:</strong></div>
              <div>${transaction.customer.phone}</div>
            </div>
            ` : ''}
            ${transaction.customer.loyaltyPoints ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div><strong>Loyalty Points:</strong></div>
              <div>${transaction.customer.loyaltyPoints}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}
          
          <div style="margin-bottom: 10px;">
            ${formattedItems.map((item: any) => `
              <div style="display: flex; margin-bottom: 5px;">
                <div style="flex: 2;">${item.name}</div>
              </div>
              <div style="display: flex; margin-bottom: 5px;">
                <div style="flex: 1; text-align: right;">
                  <span>${item.quantity}</span>
                  <span style="margin: 0 5px;">@</span>
                  <span>${item.price.toFixed(2)}</span>
                  <span style="font-weight: bold; margin-left: 10px;">${item.total.toFixed(2)}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Subtotal:</div>
              <div>${subtotal.toFixed(2)}</div>
            </div>
            ${tax > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Tax:</div>
              <div>${tax.toFixed(2)}</div>
            </div>
            ` : ''}
            ${discount > 0 ? `
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Discount:</div>
              <div>-${discount.toFixed(2)}</div>
            </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 14px;">
              <div>TOTAL:</div>
              <div>${total.toFixed(2)}</div>
            </div>
          </div>
          
          <div style="border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Payment Method:</div>
              <div>${transaction.paymentMethod || 'Cash'}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Amount Received:</div>
              <div>${amountReceived.toFixed(2)}</div>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
              <div>Change:</div>
              <div>${change.toFixed(2)}</div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; font-size: 10px;">
            <div style="font-weight: bold; margin-bottom: 10px;">Thank you for your business!</div>
            <div>Items sold are not returnable</div>
            <div>Visit us again soon</div>
          </div>
        </div>
      `;
      
      document.body.innerHTML = printContent;
      
      // Trigger print
      setTimeout(() => {
        try {
          window.print();
          // Restore original content after print
          setTimeout(() => {
            document.body.innerHTML = originalContent;
          }, 1000);
        } catch (error) {
          console.error('Fallback print error:', error);
          // Restore original content
          document.body.innerHTML = originalContent;
          this.showPrintError(transaction);
        }
      }, 500);
    } catch (error) {
      console.error("Fallback print error:", error);
    }
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

  // Print sales report with mobile support
  static printSalesReport(transactions: any[]) {
    // For mobile devices, use a more reliable printing approach
    if (this.isMobileDevice()) {
      return this.printSalesReportMobile(transactions);
    }
    
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      // Fallback for popup blockers
      this.printSalesReportFallback(transactions);
      return;
    }
    
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
      try {
        reportWindow.print();
        // Don't close immediately on mobile to avoid issues
        if (!this.isMobileDevice()) {
          reportWindow.close();
        }
      } catch (error) {
        console.error('Print error:', error);
        // Fallback method
        this.printSalesReportFallback(transactions);
      }
    }, 500);
  }

  // Mobile-optimized sales report printing
  static printSalesReportMobile(transactions: any[]) {
    try {
      // Create a temporary print-friendly element in the current document
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.top = '0';
      printContainer.style.left = '0';
      printContainer.style.width = '100%';
      printContainer.style.height = '100%';
      printContainer.style.backgroundColor = 'white';
      printContainer.style.zIndex = '9999';
      printContainer.style.padding = '20px';
      printContainer.style.fontFamily = 'Arial, sans-serif';
      printContainer.style.overflowY = 'auto';
      
      const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
      const totalTransactions = transactions.length;
      
      printContainer.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1>Sales Report</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
          </div>
          
          <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <h2>Summary</h2>
            <p><strong>Total Sales:</strong> $${totalSales.toFixed(2)}</p>
            <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
            <p><strong>Average Transaction:</strong> $${(totalSales / totalTransactions).toFixed(2)}</p>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
            <thead>
              <tr>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Date</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Transaction ID</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Items</th>
                <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${transactions.map(transaction => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${new Date(transaction.date).toLocaleDateString()}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${transaction.id}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${transaction.items.length} items</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">$${transaction.total.toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div style="text-align: center; margin-top: 20px;">
            <button id="closePrint" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Close
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(printContainer);
      
      // Add event listener to close button
      const closeButton = printContainer.querySelector('#closePrint');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          document.body.removeChild(printContainer);
        });
      }
      
      // Trigger print after a short delay to ensure content is rendered
      setTimeout(() => {
        try {
          window.print();
        } catch (error) {
          console.error('Mobile print error:', error);
          // Show error message
          const errorDiv = document.createElement('div');
          errorDiv.style.position = 'fixed';
          errorDiv.style.top = '50%';
          errorDiv.style.left = '50%';
          errorDiv.style.transform = 'translate(-50%, -50%)';
          errorDiv.style.backgroundColor = '#f8d7da';
          errorDiv.style.color = '#721c24';
          errorDiv.style.padding = '20px';
          errorDiv.style.borderRadius = '5px';
          errorDiv.style.zIndex = '10000';
          errorDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
            <div>There was a problem printing the report. Please try again or save as PDF.</div>
            <div style="margin-top: 10px; text-align: center;">
              <button id="errorClose" style="padding: 5px 10px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
                Close
              </button>
            </div>
          `;
          
          document.body.appendChild(errorDiv);
          
          const errorClose = errorDiv.querySelector('#errorClose');
          if (errorClose) {
            errorClose.addEventListener('click', () => {
              document.body.removeChild(errorDiv);
            });
          }
          
          // Auto-remove error after 5 seconds
          setTimeout(() => {
            if (document.body.contains(errorDiv)) {
              document.body.removeChild(errorDiv);
            }
          }, 5000);
        }
      }, 500);
    } catch (error) {
      console.error('Mobile print setup error:', error);
      this.printSalesReportFallback(transactions);
    }
  }

  // Fallback printing method for sales report
  static printSalesReportFallback(transactions: any[]) {
    try {
      const originalContent = document.body.innerHTML;
      
      const totalSales = transactions.reduce((sum, t) => sum + t.total, 0);
      const totalTransactions = transactions.length;
      
      const printContent = `
        <div style="font-family: Arial, sans-serif; margin: 20px; max-width: 1000px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1>Sales Report</h1>
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
      try {
        reportWindow.print();
        reportWindow.close();
      } catch (error) {
        console.error('Print error:', error);
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '10000';
        errorDiv.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
          <div>There was a problem printing the report. Please try again or save as PDF.</div>
          <div style="margin-top: 10px; text-align: center;">
            <button id="errorClose" style="padding: 5px 10px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Close
            </button>
          </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        const errorClose = errorDiv.querySelector('#errorClose');
        if (errorClose) {
          errorClose.addEventListener('click', () => {
            document.body.removeChild(errorDiv);
          });
        }
        
        // Auto-remove error after 5 seconds
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 5000);
      }
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
      try {
        reportWindow.print();
        reportWindow.close();
      } catch (error) {
        console.error('Print error:', error);
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '10000';
        errorDiv.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
          <div>There was a problem printing the report. Please try again or save as PDF.</div>
          <div style="margin-top: 10px; text-align: center;">
            <button id="errorClose" style="padding: 5px 10px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Close
            </button>
          </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        const errorClose = errorDiv.querySelector('#errorClose');
        if (errorClose) {
          errorClose.addEventListener('click', () => {
            document.body.removeChild(errorDiv);
          });
        }
        
        // Auto-remove error after 5 seconds
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 5000);
      }
    }, 250);
  }

  // Print income statement with mobile support
  static printIncomeStatement(data: any) {
    
    const printContent = `
      <div style="font-family: Arial, sans-serif; margin: 20px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1>Income Statement</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
        </div>
        
        <div style="margin: 20px 0; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
          <h2>Summary</h2>
          <p><strong>Total Sales:</strong> $${totalSales.toFixed(2)}</p>
          <p><strong>Total Transactions:</strong> ${totalTransactions}</p>
          <p><strong>Average Transaction:</strong> $${(totalSales / totalTransactions).toFixed(2)}</p>
        </div>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Date</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Transaction ID</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Items</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left; background-color: #f2f2f2;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${transactions.map(transaction => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${new Date(transaction.date).toLocaleDateString()}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${transaction.id}</td>
                <td style="border: 1px solid #ddd; padding: 8px;">${transaction.items.length} items</td>
                <td style="border: 1px solid #ddd; padding: 8px;">$${transaction.total.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div style="text-align: center; margin-top: 20px;">
          <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
            Back to Application
          </button>
        </div>
      </div>
    `;
    
    document.body.innerHTML = printContent;
    
    // Trigger print
    setTimeout(() => {
      try {
        window.print();
        // Restore original content after print
        setTimeout(() => {
          document.body.innerHTML = originalContent;
        }, 1000);
      } catch (error) {
        console.error('Fallback print error:', error);
        // Restore original content
        document.body.innerHTML = originalContent;
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '10000';
        errorDiv.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
          <div>There was a problem printing the report. Please try again or save as PDF.</div>
          <div style="margin-top: 10px; text-align: center;">
            <button id="errorClose" style="padding: 5px 10px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Close
            </button>
          </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        const errorClose = errorDiv.querySelector('#errorClose');
        if (errorClose) {
          errorClose.addEventListener('click', () => {
            document.body.removeChild(errorDiv);
          });
        }
        
        // Auto-remove error after 5 seconds
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 5000);
      }
    }, 500);
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
      try {
        reportWindow.print();
        reportWindow.close();
      } catch (error) {
        console.error('Print error:', error);
        // Show error message
        const errorDiv = document.createElement('div');
        errorDiv.style.position = 'fixed';
        errorDiv.style.top = '50%';
        errorDiv.style.left = '50%';
        errorDiv.style.transform = 'translate(-50%, -50%)';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.color = '#721c24';
        errorDiv.style.padding = '20px';
        errorDiv.style.borderRadius = '5px';
        errorDiv.style.zIndex = '10000';
        errorDiv.innerHTML = `
          <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
          <div>There was a problem printing the report. Please try again or save as PDF.</div>
          <div style="margin-top: 10px; text-align: center;">
            <button id="errorClose" style="padding: 5px 10px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
              Close
            </button>
          </div>
        `;
        
        document.body.appendChild(errorDiv);
        
        const errorClose = errorDiv.querySelector('#errorClose');
        if (errorClose) {
          errorClose.addEventListener('click', () => {
            document.body.removeChild(errorDiv);
          });
        }
        
        // Auto-remove error after 5 seconds
        setTimeout(() => {
          if (document.body.contains(errorDiv)) {
            document.body.removeChild(errorDiv);
          }
        }, 5000);
      }
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

  // Print income statement with mobile support
  static printIncomeStatement(data: any) {
    // For mobile devices, use a more reliable printing approach
    if (this.isMobileDevice()) {
      return this.printIncomeStatementMobile(data);
    }
    
    const reportWindow = window.open('', '_blank');
    if (!reportWindow) {
      // Fallback for popup blockers
      this.printIncomeStatementFallback(data);
      return;
    }
    
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
      try {
        reportWindow.print();
        // Don't close immediately on mobile to avoid issues
        if (!this.isMobileDevice()) {
          reportWindow.close();
        }
      } catch (error) {
        console.error('Print error:', error);
        // Fallback method
        this.printIncomeStatementFallback(data);
      }
    }, 500);
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

  // Generate sales receipt message for display
  static generateSalesReceiptMessage(transaction: any): string {
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
    
    // Generate a formatted receipt message
    let receiptMessage = `
POS BUSINESS
123 Business St, City, Country
Phone: (123) 456-7890

Receipt #: ${transaction.id || 'TXN-' + Date.now()}
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

${transaction.customer ? `
Customer: ${transaction.customer.name}
${transaction.customer.address ? `Address: ${transaction.customer.address}` : ''}
${transaction.customer.email ? `Email: ${transaction.customer.email}` : ''}
${transaction.customer.phone ? `Phone: ${transaction.customer.phone}` : ''}
${transaction.customer.loyaltyPoints ? `Loyalty Points: ${transaction.customer.loyaltyPoints}` : ''}
` : ''}

Items:
${formattedItems.map((item: any) => 
  `${item.name}
   ${item.quantity} @ ${item.price.toFixed(2)} = ${item.total.toFixed(2)}`
).join('\n')}

Subtotal: ${subtotal.toFixed(2)}
${tax > 0 ? `Tax: ${tax.toFixed(2)}\n` : ''}
${discount > 0 ? `Discount: -${discount.toFixed(2)}\n` : ''}
TOTAL: ${total.toFixed(2)}

Payment Method: ${transaction.paymentMethod || 'Cash'}
Amount Received: ${(transaction.amountReceived || total).toFixed(2)}
Change: ${(transaction.change || ((transaction.amountReceived || total) - total)).toFixed(2)}

Thank you for your business!
Items sold are not returnable
Visit us again soon
    `.trim();
    
    return receiptMessage;
  }

  // Mobile-optimized income statement printing
  static printIncomeStatementMobile(data: any) {
    try {
      // Create a temporary print-friendly element in the current document
      const printContainer = document.createElement('div');
      printContainer.style.position = 'fixed';
      printContainer.style.top = '0';
      printContainer.style.left = '0';
      printContainer.style.width = '100%';
      printContainer.style.height = '100%';
      printContainer.style.backgroundColor = 'white';
      printContainer.style.zIndex = '9999';
      printContainer.style.padding = '20px';
      printContainer.style.fontFamily = 'Arial, sans-serif';
      printContainer.style.overflowY = 'auto';
      
      printContainer.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">${data.businessName}</div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">INCOME STATEMENT</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 20px;">For the period ended ${data.period}</div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 1px solid #333; padding: 8px 0;">Account</th>
                <th style="text-align: right; border-bottom: 1px solid #333; padding: 8px 0;">Amount (TZS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Revenue / Sales</td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Total Sales</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.revenue.totalSales.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Less: Sales Returns & Allowances</td>
                <td style="text-align: right; padding: 4px 0;">(${data.revenue.salesReturns.toLocaleString()})</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; font-weight: 600; border-bottom: 1px solid #ccc; padding: 4px 0;">Net Sales</td>
                <td></td>
                <td style="text-align: right; border-bottom: 1px solid #ccc; padding: 4px 0;">${data.revenue.netSales.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Cost of Goods Sold (COGS)</td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Opening Stock</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.cogs.openingStock.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Add: Purchases</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.cogs.purchases.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Less: Closing Stock</td>
                <td style="text-align: right; padding: 4px 0;">(${data.cogs.closingStock.toLocaleString()})</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; font-weight: 600; border-bottom: 1px solid #ccc; padding: 4px 0;">Cost of Goods Sold</td>
                <td></td>
                <td style="text-align: right; border-bottom: 1px solid #ccc; padding: 4px 0;">${data.cogs.costOfGoodsSold.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Gross Profit</td>
                <td></td>
                <td style="text-align: right; font-weight: 600; padding: 4px 0;">${data.grossProfit.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Operating Expenses:</td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Salaries & Wages</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.salaries.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Rent Expense</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.rent.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Utilities (Electricity, Water, etc)</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.utilities.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Transport & Fuel</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.transport.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Office Supplies</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.officeSupplies.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Depreciation</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.depreciation.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Other Expenses</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.otherExpenses.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; font-weight: 600; border-bottom: 1px solid #ccc; padding: 4px 0;">Total Operating Expenses</td>
                <td></td>
                <td style="text-align: right; border-bottom: 1px solid #ccc; padding: 4px 0;">${data.operatingExpenses.totalOperatingExpenses.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Operating Profit (EBIT)</td>
                <td></td>
                <td style="text-align: right; font-weight: 600; padding: 4px 0;">${data.operatingProfit.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="padding: 4px 0;">Add: Other Income (e.g. interest)</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.otherIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Less: Other Losses (if any)</td>
                <td style="text-align: right; padding: 4px 0;">(${data.otherLosses.toLocaleString()})</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Profit Before Tax</td>
                <td></td>
                <td style="text-align: right; font-weight: 600; padding: 4px 0;">${data.profitBeforeTax.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="padding: 4px 0;">Less: Income Tax</td>
                <td style="text-align: right; padding: 4px 0;">(${data.incomeTax.toLocaleString()})</td>
              </tr>
              
              <tr>
                <td style="font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 4px 0;">Net Profit (Loss)</td>
                <td></td>
                <td style="text-align: right; font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 4px 0;">${data.netProfit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
            <p>Prepared on: ${new Date().toLocaleDateString()}</p>
            <p>Confidential - For Internal Use Only</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <button id="closePrint" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Close
            </button>
          </div>
        </div>
      `;
      
      document.body.appendChild(printContainer);
      
      // Add event listener to close button
      const closeButton = printContainer.querySelector('#closePrint');
      if (closeButton) {
        closeButton.addEventListener('click', () => {
          document.body.removeChild(printContainer);
        });
      }
      
      // Trigger print after a short delay to ensure content is rendered
      setTimeout(() => {
        try {
          window.print();
        } catch (error) {
          console.error('Mobile print error:', error);
          // Show error message
          const errorDiv = document.createElement('div');
          errorDiv.style.position = 'fixed';
          errorDiv.style.top = '50%';
          errorDiv.style.left = '50%';
          errorDiv.style.transform = 'translate(-50%, -50%)';
          errorDiv.style.backgroundColor = '#f8d7da';
          errorDiv.style.color = '#721c24';
          errorDiv.style.padding = '20px';
          errorDiv.style.borderRadius = '5px';
          errorDiv.style.zIndex = '10000';
          errorDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
            <div>There was a problem printing the report. Please try again or save as PDF.</div>
            <div style="margin-top: 10px; text-align: center;">
              <button id="errorClose" style="padding: 5px 10px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
                Close
              </button>
            </div>
          `;
          
          document.body.appendChild(errorDiv);
          
          const errorClose = errorDiv.querySelector('#errorClose');
          if (errorClose) {
            errorClose.addEventListener('click', () => {
              document.body.removeChild(errorDiv);
            });
          }
          
          // Auto-remove error after 5 seconds
          setTimeout(() => {
            if (document.body.contains(errorDiv)) {
              document.body.removeChild(errorDiv);
            }
          }, 5000);
        }
      }, 500);
    } catch (error) {
      console.error('Mobile print setup error:', error);
      this.printIncomeStatementFallback(data);
    }
  }

  // Fallback printing method for income statement
  static printIncomeStatementFallback(data: any) {
    try {
      const originalContent = document.body.innerHTML;
      
      const printContent = `
        <div style="font-family: Arial, sans-serif; margin: 20px; max-width: 1000px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 20px; font-weight: bold; margin-bottom: 5px;">${data.businessName}</div>
            <div style="font-size: 18px; font-weight: bold; margin-bottom: 5px;">INCOME STATEMENT</div>
            <div style="font-size: 14px; color: #666; margin-bottom: 20px;">For the period ended ${data.period}</div>
          </div>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <thead>
              <tr>
                <th style="text-align: left; border-bottom: 1px solid #333; padding: 8px 0;">Account</th>
                <th style="text-align: right; border-bottom: 1px solid #333; padding: 8px 0;">Amount (TZS)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Revenue / Sales</td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Total Sales</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.revenue.totalSales.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Less: Sales Returns & Allowances</td>
                <td style="text-align: right; padding: 4px 0;">(${data.revenue.salesReturns.toLocaleString()})</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; font-weight: 600; border-bottom: 1px solid #ccc; padding: 4px 0;">Net Sales</td>
                <td></td>
                <td style="text-align: right; border-bottom: 1px solid #ccc; padding: 4px 0;">${data.revenue.netSales.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Cost of Goods Sold (COGS)</td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Opening Stock</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.cogs.openingStock.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Add: Purchases</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.cogs.purchases.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Less: Closing Stock</td>
                <td style="text-align: right; padding: 4px 0;">(${data.cogs.closingStock.toLocaleString()})</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; font-weight: 600; border-bottom: 1px solid #ccc; padding: 4px 0;">Cost of Goods Sold</td>
                <td></td>
                <td style="text-align: right; border-bottom: 1px solid #ccc; padding: 4px 0;">${data.cogs.costOfGoodsSold.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Gross Profit</td>
                <td></td>
                <td style="text-align: right; font-weight: 600; padding: 4px 0;">${data.grossProfit.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Operating Expenses:</td>
                <td></td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Salaries & Wages</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.salaries.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Rent Expense</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.rent.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Utilities (Electricity, Water, etc)</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.utilities.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Transport & Fuel</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.transport.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Office Supplies</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.officeSupplies.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Depreciation</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.depreciation.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; padding: 4px 0;">Other Expenses</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.operatingExpenses.otherExpenses.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding-left: 30px; font-weight: 600; border-bottom: 1px solid #ccc; padding: 4px 0;">Total Operating Expenses</td>
                <td></td>
                <td style="text-align: right; border-bottom: 1px solid #ccc; padding: 4px 0;">${data.operatingExpenses.totalOperatingExpenses.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Operating Profit (EBIT)</td>
                <td></td>
                <td style="text-align: right; font-weight: 600; padding: 4px 0;">${data.operatingProfit.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="padding: 4px 0;">Add: Other Income (e.g. interest)</td>
                <td></td>
                <td style="text-align: right; padding: 4px 0;">${data.otherIncome.toLocaleString()}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0;">Less: Other Losses (if any)</td>
                <td style="text-align: right; padding: 4px 0;">(${data.otherLosses.toLocaleString()})</td>
              </tr>
              
              <tr>
                <td style="font-weight: 600; padding: 4px 0;">Profit Before Tax</td>
                <td></td>
                <td style="text-align: right; font-weight: 600; padding: 4px 0;">${data.profitBeforeTax.toLocaleString()}</td>
              </tr>
              
              <tr>
                <td style="padding: 4px 0;">Less: Income Tax</td>
                <td style="text-align: right; padding: 4px 0;">(${data.incomeTax.toLocaleString()})</td>
              </tr>
              
              <tr>
                <td style="font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 4px 0;">Net Profit (Loss)</td>
                <td></td>
                <td style="text-align: right; font-weight: bold; border-top: 2px solid #333; border-bottom: 2px solid #333; padding: 4px 0;">${data.netProfit.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
          
          <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
            <p>Prepared on: ${new Date().toLocaleDateString()}</p>
            <p>Confidential - For Internal Use Only</p>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <button onclick="window.location.reload()" style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Back to Application
            </button>
          </div>
        </div>
      `;
      
      document.body.innerHTML = printContent;
      
      // Trigger print
      setTimeout(() => {
        try {
          window.print();
          // Restore original content after print
          setTimeout(() => {
            document.body.innerHTML = originalContent;
          }, 1000);
        } catch (error) {
          console.error('Fallback print error:', error);
          // Restore original content
          document.body.innerHTML = originalContent;
          // Show error message
          const errorDiv = document.createElement('div');
          errorDiv.style.position = 'fixed';
          errorDiv.style.top = '50%';
          errorDiv.style.left = '50%';
          errorDiv.style.transform = 'translate(-50%, -50%)';
          errorDiv.style.backgroundColor = '#f8d7da';
          errorDiv.style.color = '#721c24';
          errorDiv.style.padding = '20px';
          errorDiv.style.borderRadius = '5px';
          errorDiv.style.zIndex = '10000';
          errorDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px;">Printing Error</div>
            <div>There was a problem printing the report. Please try again or save as PDF.</div>
            <div style="margin-top: 10px; text-align: center;">
              <button id="errorClose" style="padding: 5px 10px; background-color: #721c24; color: white; border: none; border-radius: 3px; cursor: pointer;">
                Close
              </button>
            </div>
          `;
          
          document.body.appendChild(errorDiv);
          
          const errorClose = errorDiv.querySelector('#errorClose');
          if (errorClose) {
            errorClose.addEventListener('click', () => {
              document.body.removeChild(errorDiv);
            });
          }
          
          // Auto-remove error after 5 seconds
          setTimeout(() => {
            if (document.body.contains(errorDiv)) {
              document.body.removeChild(errorDiv);
            }
          }, 5000);
        }
      }, 500);
    } catch (error) {
      console.error('Fallback print setup error:', error);
    }
  }
}
