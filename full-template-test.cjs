const QRCode = require('qrcode');

async function testFullTemplate() {
    console.log('Testing full template generation...');
    
    // Test data similar to what's used in printUtils.ts
    const receiptData = {
        type: 'sales',
        receiptNumber: 'TEST-001',
        date: new Date().toISOString(),
        items: [
            { name: 'Product 1', quantity: 2, price: 10.00, total: 20.00 },
            { name: 'Product 2', quantity: 1, price: 15.00, total: 15.00 }
        ],
        subtotal: 35.00,
        tax: 0.00,
        discount: 0.00,
        total: 35.00,
        amountReceived: 40.00,
        change: 5.00
    };
    
    try {
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(receiptData), { 
            width: 120, 
            margin: 2,
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 1,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });
        
        console.log('QR Code Data URL generated successfully');
        console.log('Data URL length:', qrCodeDataUrl.length);
        
        // Create the complete HTML template like in printUtils.ts
        const receiptContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Receipt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media print {
        @page {
          margin: 0.5in; /* Desktop-specific margin */
          size: auto;
        }
        body {
          margin: 0.5in;
          padding: 0;
        }
      }
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
      /* QR Code Styles */
      .qr-section {
        text-align: center;
        margin: 15px 0;
        padding: 10px;
        border-top: 1px dashed #000;
      }
      .qr-label {
        font-size: 9px;
        margin-bottom: 5px;
      }
      .qr-code-img {
        max-width: 120px;
        height: auto;
        margin: 10px auto;
        display: block;
      }
      .qr-error {
        font-size: 8px;
        color: #666;
        margin: 5px 0;
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
      <div>Receipt #: TEST-001</div>
      <div>Date: ${new Date().toLocaleDateString()}</div>
      <div>Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    
    <div class="items">
      ${receiptData.items.map((item) => `
        <div class="item">
          <div class="item-name">${item.name}</div>
          <div class="item-details">${item.quantity} x @ ${item.price.toFixed(2)}</div>
          <div class="item-total">${item.total.toFixed(2)}</div>
        </div>
      `).join('')}
    </div>
    
    <div class="totals">
      <div class="total-row">
        <div>Subtotal:</div>
        <div>${receiptData.subtotal.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Tax:</div>
        <div>${receiptData.tax.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Discount:</div>
        <div>${receiptData.discount.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Total:</div>
        <div>${receiptData.total.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="payment-info">
      <div>Amount Received:</div>
      <div>${receiptData.amountReceived.toFixed(2)}</div>
      <div>Change:</div>
      <div>${receiptData.change.toFixed(2)}</div>
    </div>
    
    <div class="footer">
      <div class="thank-you">Thank You!</div>
      <div>For more info, visit us at www.posbusiness.com</div>
    </div>
    
    <div class="qr-section">
      <div class="qr-label">Scan for Details</div>
      <div style="margin: 10px 0; text-align: center;">
        <img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
        <div style="display: none; font-size: 8px; color: #666; margin: 5px 0;">QR Code failed to load</div>
      </div>
      <div style="font-size: 8px; margin-top: 5px;">Receipt #: TEST-001</div>
    </div>
  </body>
</html>`;
        
        // Save the generated HTML to a file
        const fs = require('fs');
        fs.writeFileSync('generated-receipt.html', receiptContent);
        console.log('Generated receipt saved to generated-receipt.html');
        console.log('QR code data URL length in template:', qrCodeDataUrl.length);
        
        // Also save just the data URL to a file for testing
        fs.writeFileSync('qr-data-url.txt', qrCodeDataUrl);
        console.log('QR data URL saved to qr-data-url.txt');
        
    } catch (error) {
        console.error('Error generating full template:', error);
    }
}

testFullTemplate();