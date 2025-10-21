// Utility functions for managing receipt templates
export interface ReceiptTemplateConfig {
  customTemplate: boolean;
  templateHeader: string;
  templateFooter: string;
  showBusinessInfo: boolean;
  showTransactionDetails: boolean;
  showItemDetails: boolean;
  showTotals: boolean;
  showPaymentInfo: boolean;
  fontSize: string;
  paperWidth: string;
}

// Default template configuration
export const DEFAULT_TEMPLATE_CONFIG: ReceiptTemplateConfig = {
  customTemplate: false,
  templateHeader: "POS BUSINESS\n123 Business St, City, Country\nPhone: (123) 456-7890",
  templateFooter: "Thank you for your business!\nItems sold are not returnable\nVisit us again soon",
  showBusinessInfo: true,
  showTransactionDetails: true,
  showItemDetails: true,
  showTotals: true,
  showPaymentInfo: true,
  fontSize: "12px",
  paperWidth: "320px"
};

// Get template configuration from localStorage or return default
export const getTemplateConfig = (): ReceiptTemplateConfig => {
  try {
    const config = localStorage.getItem('receiptTemplateConfig');
    return config ? { ...DEFAULT_TEMPLATE_CONFIG, ...JSON.parse(config) } : DEFAULT_TEMPLATE_CONFIG;
  } catch (error) {
    console.error('Error loading template config:', error);
    return DEFAULT_TEMPLATE_CONFIG;
  }
};

// Save template configuration to localStorage
export const saveTemplateConfig = (config: ReceiptTemplateConfig) => {
  try {
    localStorage.setItem('receiptTemplateConfig', JSON.stringify(config));
  } catch (error) {
    console.error('Error saving template config:', error);
  }
};

// Generate receipt HTML using custom template
export const generateCustomReceipt = (transaction: any, config: ReceiptTemplateConfig) => {
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
  
  // Split header and footer into lines
  const headerLines = config.templateHeader.split('\n');
  const footerLines = config.templateFooter.split('\n');
  
  // Generate business info section
  let businessInfoHtml = '';
  if (config.showBusinessInfo) {
    businessInfoHtml = `
      <div class="header">
        ${headerLines.map(line => `<div>${line}</div>`).join('')}
      </div>
    `;
  }
  
  // Generate transaction details section
  let transactionDetailsHtml = '';
  if (config.showTransactionDetails) {
    transactionDetailsHtml = `
      <div class="receipt-info">
        <div>Receipt #: ${transaction.id || 'TXN-' + Date.now()}</div>
        <div>Date: ${new Date().toLocaleDateString()}</div>
        <div>Time: ${new Date().toLocaleTimeString()}</div>
      </div>
    `;
  }
  
  // Generate item details section
  let itemDetailsHtml = '';
  if (config.showItemDetails) {
    itemDetailsHtml = `
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
    `;
  }
  
  // Generate totals section
  let totalsHtml = '';
  if (config.showTotals) {
    totalsHtml = `
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
    `;
  }
  
  // Generate payment info section
  let paymentInfoHtml = '';
  if (config.showPaymentInfo) {
    paymentInfoHtml = `
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
    `;
  }
  
  // Generate footer section
  let footerHtml = '';
  if (config.templateFooter) {
    footerHtml = `
      <div class="footer">
        ${footerLines.map(line => `<div>${line}</div>`).join('')}
      </div>
    `;
  }
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Receipt</title>
        <style>
          body {
            font-family: 'Courier New', monospace;
            font-size: ${config.fontSize};
            max-width: ${config.paperWidth};
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
            font-size: calc(${config.fontSize} + 4px);
            font-weight: bold;
            margin-bottom: 5px;
          }
          .business-info {
            font-size: calc(${config.fontSize} - 2px);
            margin-bottom: 5px;
          }
          .receipt-info {
            display: flex;
            justify-content: space-between;
            font-size: calc(${config.fontSize} - 2px);
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
            font-size: calc(${config.fontSize} + 2px);
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
            font-size: calc(${config.fontSize} - 2px);
          }
          .thank-you {
            font-weight: bold;
            margin-bottom: 10px;
          }
        </style>
      </head>
      <body>
        ${businessInfoHtml}
        ${transactionDetailsHtml}
        ${itemDetailsHtml}
        ${totalsHtml}
        ${paymentInfoHtml}
        ${footerHtml}
      </body>
    </html>
  `;
};