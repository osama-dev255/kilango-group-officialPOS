// Test script to simulate the actual receipt generation process
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testReceiptGeneration() {
    console.log('🧪 Receipt Generation Test\n');
    
    // Mock transaction data
    const mockTransaction = {
        receiptNumber: 'TEST-001',
        items: [
            { name: 'Test Item 1', price: 10.00, quantity: 2, total: 20.00 },
            { name: 'Test Item 2', price: 15.00, quantity: 1, total: 15.00 }
        ],
        subtotal: 35.00,
        tax: 3.50,
        discount: 5.00,
        total: 33.50,
        amountReceived: 40.00,
        change: 6.50
    };
    
    // Generate QR code
    let qrCodeDataUrl = '';
    let qrGenerationError = '';
    
    try {
        const receiptData = {
            type: 'sales',
            receiptNumber: mockTransaction.receiptNumber || Date.now(),
            date: new Date().toISOString(),
            items: mockTransaction.items,
            subtotal: mockTransaction.subtotal,
            tax: mockTransaction.tax,
            discount: mockTransaction.discount,
            total: mockTransaction.total,
            amountReceived: mockTransaction.amountReceived,
            change: mockTransaction.change
        };
        
        const qrCodeData = JSON.stringify(receiptData);
        console.log('📝 Generating QR code with data length:', qrCodeData.length);
        
        // Generate QR code with better error handling
        qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { 
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
        
        // Validate the generated QR code
        if (!qrCodeDataUrl || qrCodeDataUrl.length < 100) {
            throw new Error('Invalid QR code generated - data URL too short');
        }
        
        console.log('✅ QR Code Data URL generated successfully');
        console.log('   Length:', qrCodeDataUrl.length);
        console.log('   Preview:', qrCodeDataUrl.substring(0, 100));
        
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
        qrGenerationError = error.message;
        qrCodeDataUrl = ''; // Ensure it's empty on error
    }
    
    // Format items for receipt
    const formattedItems = mockTransaction.items.map((item) => {
        const total = item.price * item.quantity;
        return {
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            total: total
        };
    });
    
    // Calculate totals
    const subtotal = mockTransaction.subtotal || formattedItems.reduce((sum, item) => sum + item.total, 0);
    const tax = mockTransaction.tax || 0;
    const discount = mockTransaction.discount || 0;
    const total = mockTransaction.total || (subtotal + tax - discount);
    const amountReceived = mockTransaction.amountReceived || total;
    const change = mockTransaction.change || (amountReceived - total);
    
    // Generate the complete receipt HTML
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
        width: 120px;
        height: 120px;
        margin: 10px auto;
        display: block;
        border: 1px solid #ccc;
        background: #f9f9f9;
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
      <div>Receipt #: ${mockTransaction.receiptNumber || Date.now()}</div>
      <div>Date: ${new Date().toLocaleDateString()}</div>
      <div>Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    
    <div class="items">
      ${formattedItems.map((item) => `
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
        <div>${subtotal.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Tax:</div>
        <div>${tax.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Discount:</div>
        <div>${discount.toFixed(2)}</div>
      </div>
      <div class="total-row">
        <div>Total:</div>
        <div>${total.toFixed(2)}</div>
      </div>
    </div>
    
    <div class="payment-info">
      <div>Amount Received:</div>
      <div>${amountReceived.toFixed(2)}</div>
      <div>Change:</div>
      <div>${change.toFixed(2)}</div>
    </div>
    
    <div class="footer">
      <div class="thank-you">Thank You!</div>
      <div>For more info, visit us at www.posbusiness.com</div>
    </div>
    
    <div class="qr-section">
      <div class="qr-label">Scan for Details</div>
      ${qrCodeDataUrl && qrCodeDataUrl.length > 100 ? 
        `<div style="margin: 10px 0; text-align: center;">
           <img src="${qrCodeDataUrl}" width="120" height="120" class="qr-code-img" alt="Receipt QR Code" 
                style="max-width: 120px; height: auto; width: 120px; height: 120px; margin: 10px auto; display: block; border: 1px solid #ccc; background: #f9f9f9;"
                onerror="console.error('QR Code failed to load - Data URL length:', this.src?.length || 0); 
                        console.error('QR Code Data URL preview:', this.src?.substring(0, 100) || 'No src'); 
                        this.style.display='none'; 
                        var errorDiv = this.parentNode.querySelector('.qr-error'); 
                        if (errorDiv) errorDiv.style.display='block';
                        console.log('QR Code onerror triggered - src length:', this.src?.length || 0);" 
                onload="console.log('QR Code loaded successfully - src length:', this.src?.length || 0); 
                        console.log('QR Code dimensions - naturalWidth:', this.naturalWidth, 'naturalHeight:', this.naturalHeight);" />
           <div class="qr-error" style="font-size: 8px; color: #666; margin: 5px 0; display: none;">QR Code failed to load</div>
         </div>` : 
        `<div style="margin: 10px 0; text-align: center;">
           <div style="font-size: 8px; color: #666;">
             ${qrGenerationError ? 
               `QR Code generation failed: ${qrGenerationError.substring(0, 50)}...` : 
               'QR Code not available'}
           </div>
         </div>`}
      <div style="font-size: 8px; margin-top: 5px;">Receipt #: ${mockTransaction.receiptNumber || Date.now()}</div>
    </div>
  </body>
</html>`;
    
    console.log('\n📄 Receipt Generation Results:');
    console.log('   Receipt content length:', receiptContent.length);
    console.log('   Contains QR code img tag:', receiptContent.includes('<img src='));
    console.log('   Contains QR data URL:', receiptContent.includes('data:image/png;base64'));
    
    // Save the receipt to a file
    const outputPath = path.join(__dirname, 'test-receipt-output.html');
    fs.writeFileSync(outputPath, receiptContent);
    
    console.log('\n💾 Test receipt saved to:', outputPath);
    console.log('   Open this file in your browser to verify QR code display');
    
    // Verify the QR code section
    const qrSectionMatch = receiptContent.match(/<div class="qr-section">[\s\S]*?<\/div>/);
    if (qrSectionMatch) {
        const qrSection = qrSectionMatch[0];
        console.log('\n🔍 QR Section Analysis:');
        console.log('   Contains img tag:', qrSection.includes('<img src='));
        console.log('   Contains onload handler:', qrSection.includes('onload='));
        console.log('   Contains onerror handler:', qrSection.includes('onerror='));
        console.log('   Contains error div:', qrSection.includes('qr-error'));
    }
}

// Run the test
testReceiptGeneration().catch(console.error);