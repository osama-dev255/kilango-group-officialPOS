import QRCode from 'qrcode';
import { writeFile } from 'fs/promises';

// Simulate the exact process that happens in printUtils.ts
async function debugReceiptPrint() {
    console.log('Debugging receipt print process...\n');
    
    // Test transaction data
    const testTransaction = {
        receiptNumber: "TEST-001",
        items: [
            { name: "Product 1", quantity: 2, price: 10.00, total: 20.00 },
            { name: "Product 2", quantity: 1, price: 15.00, total: 15.00 }
        ],
        subtotal: 35.00,
        tax: 0.00,
        discount: 0.00,
        total: 35.00,
        amountReceived: 40.00,
        change: 5.00
    };
    
    try {
        // Step 1: Generate receipt data (exactly like in printUtils.ts)
        const receiptData = {
            type: 'sales',
            receiptNumber: testTransaction.receiptNumber,
            date: new Date().toISOString(),
            items: testTransaction.items,
            subtotal: testTransaction.subtotal,
            tax: testTransaction.tax,
            discount: testTransaction.discount,
            total: testTransaction.total,
            amountReceived: testTransaction.amountReceived,
            change: testTransaction.change
        };
        
        console.log('Step 1: Receipt data generated');
        console.log('Receipt data length:', JSON.stringify(receiptData).length);
        
        // Step 2: Generate QR code (exactly like in printUtils.ts)
        const qrCodeData = JSON.stringify(receiptData);
        console.log('Step 2: QR code data created');
        console.log('QR code data length:', qrCodeData.length);
        
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { 
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
        
        console.log('Step 3: QR code generated successfully');
        console.log('QR code data URL length:', qrCodeDataUrl.length);
        console.log('QR code data URL preview:', qrCodeDataUrl.substring(0, 100));
        
        // Step 3: Create the exact HTML that would be used in printUtils.ts
        const receiptContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Receipt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media print {
        @page {
          margin: 0.5in;
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
      <div>Receipt #: ${testTransaction.receiptNumber}</div>
      <div>Date: ${new Date().toLocaleDateString()}</div>
      <div>Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    
    <div class="items">
      ${testTransaction.items.map((item) => `
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
        <div>${testTransaction.subtotal.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Tax:</div>
        <div>${testTransaction.tax.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Discount:</div>
        <div>${testTransaction.discount.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Total:</div>
        <div>${testTransaction.total.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="payment-info">
      <div>Amount Received:</div>
      <div>${testTransaction.amountReceived.toFixed(2)}</div>
      <div>Change:</div>
      <div>${testTransaction.change.toFixed(2)}</div>
    </div>
    
    <div class="footer">
      <div class="thank-you">Thank You!</div>
      <div>For more info, visit us at www.posbusiness.com</div>
    </div>
    
    <div class="qr-section">
      <div class="qr-label">Scan for Details</div>
      <div style="margin: 10px 0; text-align: center;">
        <img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" 
             onerror="console.error('QR Code failed to load - Data URL length:', this.src?.length || 0); 
                     console.error('QR Code Data URL preview:', this.src?.substring(0, 100) || 'No src'); 
                     this.style.display='none'; 
                     var errorDiv = this.parentNode.querySelector('.qr-error'); 
                     if (errorDiv) errorDiv.style.display='block';" 
             onload="console.log('QR Code loaded successfully')" />
        <div class="qr-error" style="font-size: 8px; color: #666; margin: 5px 0; display: none;">QR Code failed to load</div>
      </div>
      <div style="font-size: 8px; margin-top: 5px;">Receipt #: ${testTransaction.receiptNumber}</div>
    </div>
  </body>
</html>`;
        
        console.log('Step 4: Receipt HTML content generated');
        console.log('Receipt content length:', receiptContent.length);
        
        // Write to a file to test in browser
        await writeFile('debug-receipt-output.html', receiptContent);
        console.log('Step 5: Debug receipt written to debug-receipt-output.html');
        
        // Verify the QR code section
        const qrSectionStart = receiptContent.indexOf('<div class="qr-section">');
        const qrSectionEnd = receiptContent.indexOf('</div>', receiptContent.indexOf('<div style="font-size: 8px; margin-top: 5px;">Receipt #:'));
        
        if (qrSectionStart !== -1 && qrSectionEnd !== -1) {
            const qrSection = receiptContent.substring(qrSectionStart, qrSectionEnd + 6);
            console.log('Step 6: QR section extracted successfully');
            console.log('QR section length:', qrSection.length);
            
            // Check if QR code data URL is present
            if (qrSection.includes(qrCodeDataUrl.substring(0, 50))) {
                console.log('✓ QR code data URL is present in the HTML');
            } else {
                console.log('✗ QR code data URL is missing from the HTML');
            }
            
            // Check if onerror handler is present
            if (qrSection.includes('onerror')) {
                console.log('✓ Error handler is present in the HTML');
            } else {
                console.log('✗ Error handler is missing from the HTML');
            }
        }
        
        console.log('\n🎉 Debug process completed successfully!');
        console.log('Open debug-receipt-output.html in your browser to see the receipt');
        
    } catch (error) {
        console.error('Error in debug process:', error.message);
        console.error(error.stack);
    }
}

// Run the debug process
debugReceiptPrint();