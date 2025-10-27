import { getTemplateConfig, generateCustomReceipt, getPurchaseTemplateConfig, generateCustomPurchaseReceipt } from "@/utils/templateUtils";
import QRCode from "qrcode";

// Utility functions for printing
export class PrintUtils {
  // Check if we're on a mobile device
  static isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // Generate QR code for receipt
  static async generateReceiptQRCode(transaction: any, type: 'sales' | 'purchase'): Promise<string> {
    try {
      // Create a URL that points to a page that displays the receipt details
      // For now, we'll create a data URL with the receipt information
      const receiptData = {
        type,
        receiptNumber: type === 'sales' ? transaction.receiptNumber : transaction.orderNumber,
        date: new Date().toISOString(),
        items: transaction.items,
        total: transaction.total,
        // Add other relevant receipt information here
      };
      
      const receiptDataString = JSON.stringify(receiptData);
      const dataUrl = await QRCode.toDataURL(receiptDataString, { width: 100 });
      return dataUrl;
    } catch (error) {
      console.error('Error generating QR code:', error);
      // Return a placeholder if QR code generation fails
      return '';
    }
  }

  // Print receipt with enhanced formatting and mobile support
  static async printReceipt(transaction: any) {
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    // Generate QR code for the receipt
    let qrCodeDataUrl = '';
    let qrCodeData = '';
    let testQrCode = '';
    try {
      const receiptData = {
        type: 'sales',
        receiptNumber: transaction.receiptNumber || Date.now(),
        date: new Date().toISOString(),
        items: transaction.items,
        subtotal: transaction.subtotal,
        tax: transaction.tax,
        discount: transaction.discount,
        total: transaction.total,
        amountReceived: transaction.amountReceived,
        change: transaction.change
      };
      
      qrCodeData = JSON.stringify(receiptData);
      console.log('Generating QR code with data:', qrCodeData); // Debugging line
      
      // First, try generating a simple test QR code to verify the library works
      testQrCode = await QRCode.toDataURL('TEST QR CODE', { 
        width: 100, 
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      console.log('Test QR Code generated:', testQrCode.substring(0, 50)); // Debugging line
      
      // Generate QR code with better settings for scanning
      qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { 
        width: 120, 
        margin: 2,
        errorCorrectionLevel: 'M', // Medium error correction
        type: 'image/png',
        quality: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      console.log('QR Code Data URL generated successfully, length:', qrCodeDataUrl.length); // Debugging line
      console.log('QR Code Data URL preview:', qrCodeDataUrl.substring(0, 100)); // Debugging line
      
      // Verify that the data URL is valid
      if (!qrCodeDataUrl.startsWith('data:image/png;base64,')) {
        console.error('Invalid QR code data URL format:', qrCodeDataUrl.substring(0, 50));
        qrCodeDataUrl = ''; // Reset if invalid
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      qrCodeDataUrl = ''; // Ensure it's empty on error
    }
    
    // For mobile devices, use a more reliable printing approach
    if (this.isMobileDevice()) {
      return this.printReceiptMobile(transaction, qrCodeDataUrl);
    }

    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      // Hide loading indicator
      this.hideLoadingIndicator();
      // Fallback for popup blockers
      this.printReceiptFallback(transaction, qrCodeDataUrl);
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
      
      receiptContent = `<!DOCTYPE html>
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
        filter: drop-shadow(2px 2px 2px #000);
        margin: 10px auto;
        padding: 5px;
        background-color: #fff;
        border: 1px solid #000;
        display: block;
      }
      .qr-code-fallback {
        font-family: monospace;
        font-size: 6px;
        line-height: 1.2;
        letter-spacing: 0px;
        padding: 5px;
        border: 1px solid #000;
        display: inline-block;
        margin: 5px 0;
        max-width: 100px;
        word-break: break-all;
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
      <div>Receipt #: ${transaction.receiptNumber || Date.now()}</div>
      <div>Date: ${new Date().toLocaleDateString()}</div>
      <div>Time: ${new Date().toLocaleTimeString()}</div>
    </div>
    
    <div class="items">
      ${formattedItems.map((item: any) => `
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
      ${qrCodeDataUrl ? 
        `<div style="margin: 10px 0;">
           <img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" style="max-width: 120px; height: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
           <div class="qr-code-fallback" style="display: none;">${qrCodeData.substring(0, 100)}...</div>
           <div style="font-size: 8px; margin-top: 5px;">QR Code Generated</div>
         </div>` : 
        `<div style="font-size: 8px; color: red; margin: 10px 0;">
           <div>QR Code not available</div>
           <div>Data: ${qrCodeData ? 'Data exists but QR failed' : 'No data'}</div>
           <div>Test QR: ${testQrCode ? 'Test QR works' : 'Test QR failed'}</div>
         </div>`}
    </div>
  </body>
</html>`;
    }
    
    
    receiptWindow.document.open();
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();
    // Hide loading indicator
    this.hideLoadingIndicator();
  }

  // Print purchase receipt for a single transaction
  static async printPurchaseReceipt(transaction: any) {
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    // Generate QR code for the receipt
    let qrCodeDataUrl = '';
    let qrCodeData = '';
    let testQrCode = '';
    try {
      const receiptData = {
        type: 'purchase',
        orderNumber: transaction.orderNumber || 'PO-' + Date.now(),
        date: new Date().toISOString(),
        items: transaction.items,
        supplier: transaction.supplier,
        subtotal: transaction.subtotal,
        discount: transaction.discount,
        total: transaction.total,
        paymentMethod: transaction.paymentMethod,
        amountReceived: transaction.amountReceived,
        change: transaction.change
      };
      
      qrCodeData = JSON.stringify(receiptData);
      console.log('Generating Purchase QR code with data:', qrCodeData); // Debugging line
      
      // First, try generating a simple test QR code to verify the library works
      testQrCode = await QRCode.toDataURL('TEST QR CODE', { 
        width: 100, 
        margin: 2,
        errorCorrectionLevel: 'M'
      });
      console.log('Purchase Test QR Code generated:', testQrCode.substring(0, 50)); // Debugging line
      
      // Generate QR code with better settings for scanning
      qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { 
        width: 120, 
        margin: 2,
        errorCorrectionLevel: 'M', // Medium error correction
        type: 'image/png',
        quality: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      
      console.log('Purchase QR Code Data URL generated successfully, length:', qrCodeDataUrl.length); // Debugging line
      console.log('Purchase QR Code Data URL preview:', qrCodeDataUrl.substring(0, 100)); // Debugging line
      
      // Verify that the data URL is valid
      if (!qrCodeDataUrl.startsWith('data:image/png;base64,')) {
        console.error('Invalid Purchase QR code data URL format:', qrCodeDataUrl.substring(0, 50));
        qrCodeDataUrl = ''; // Reset if invalid
      }
    } catch (error) {
      console.error('Error generating Purchase QR code:', error);
      qrCodeDataUrl = ''; // Ensure it's empty on error
    }
    
    // For mobile devices, use a more reliable printing approach
    if (this.isMobileDevice()) {
      return this.printPurchaseReceiptMobile(transaction, qrCodeDataUrl);
    }

    const receiptWindow = window.open('', '_blank');
    if (!receiptWindow) {
      // Hide loading indicator
      this.hideLoadingIndicator();
      // Fallback for popup blockers
      this.printPurchaseReceiptFallback(transaction, qrCodeDataUrl);
      return;
    }
    
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
                filter: drop-shadow(2px 2px 2px #000);
                margin: 10px auto;
                padding: 5px;
                background-color: #fff;
                border: 1px solid #000;
                display: block;
              }
              .qr-code-fallback {
                font-family: monospace;
                font-size: 6px;
                line-height: 1.2;
                letter-spacing: 0px;
                padding: 5px;
                border: 1px solid #000;
                display: inline-block;
                margin: 5px 0;
                max-width: 100px;
                word-break: break-all;
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
              <div>Order #: ${transaction.orderNumber || 'PO-' + Date.now()}</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
              <div>Time: ${new Date().toLocaleTimeString()}</div>
            </div>
            
            <div class="items">
              ${formattedItems.map((item: any) => `
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
                <div>Tax (18%):</div>
                <div>${displayTax.toFixed(2)}</div>
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
              <div>Payment Method:</div>
              <div>${transaction.paymentMethod}</div>
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
              ${qrCodeDataUrl ? 
                `<div style="margin: 10px 0;">
                   <img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" style="max-width: 120px; height: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
                   <div class="qr-code-fallback" style="display: none;">${qrCodeData.substring(0, 100)}...</div>
                   <div style="font-size: 8px; margin-top: 5px;">QR Code Generated</div>
                 </div>` : 
                `<div style="font-size: 8px; color: red; margin: 10px 0;">
                   <div>QR Code not available</div>
                   <div>Data: ${qrCodeData ? 'Data exists but QR failed' : 'No data'}</div>
                   <div>Test QR: ${testQrCode ? 'Test QR works' : 'Test QR failed'}</div>
                 </div>`}
            </div>
          </body>
        </html>
      `;
    }
    
    
    receiptWindow.document.open();
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();
    // Hide loading indicator
    this.hideLoadingIndicator();
  }
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
                filter: drop-shadow(2px 2px 2px #000);
                margin: 10px auto;
                padding: 5px;
                background-color: #fff;
                border: 1px solid #000;
                display: block;
              }
              .qr-code-fallback {
                font-family: monospace;
                font-size: 6px;
                line-height: 1.2;
                letter-spacing: 0px;
                padding: 5px;
                border: 1px solid #000;
                display: inline-block;
                margin: 5px 0;
                max-width: 100px;
                word-break: break-all;
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
              <div>Date: ${new Date().toLocaleDateString()}</div>
              <div>Time: ${new Date().toLocaleTimeString()}</div>
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
                  <div class="item-details">${item.quantity} x @ ${item.price.toFixed(2)}</div>
                  <div class="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <div>Subtotal:</div>
                <div>${subtotal.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div>Tax (18% of subtotal):</div>
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
            
            <div class="qr-section">
              <div class="qr-label">Scan for Details</div>
              ${qrCodeDataUrl ? 
                `<div style="margin: 10px 0;">
                   <img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" style="max-width: 120px; height: auto;" onerror="this.style.display='none'; this.nextElementSibling.style.display='block'" />
                   <div class="qr-code-fallback" style="display: none;">${qrCodeData.substring(0, 100)}...</div>
                   <div style="font-size: 8px; margin-top: 5px;">QR Code Generated</div>
                 </div>` : 
                `<div style="font-size: 8px; color: red; margin: 10px 0;">
                   <div>QR Code not available</div>
                   <div>Data: ${qrCodeData ? 'Data exists but QR failed' : 'No data'}</div>
                   <div>Test QR: ${testQrCode ? 'Test QR works' : 'Test QR failed'}</div>
                 </div>`}
            </div>
          </body>
        </html>
      `;
    }
    
    
    receiptWindow.document.open();
    receiptWindow.document.write(receiptContent);
    receiptWindow.document.close();
    receiptWindow.focus();
    receiptWindow.print();
    receiptWindow.close();
    // Hide loading indicator
    this.hideLoadingIndicator();
  }

  // Show loading indicator
  static showLoadingIndicator(message: string) {
    const loadingIndicator = document.createElement('div');
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '50%';
    loadingIndicator.style.left = '50%';
    loadingIndicator.style.transform = 'translate(-50%, -50%)';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    loadingIndicator.style.color = '#fff';
    loadingIndicator.style.padding = '10px';
    loadingIndicator.style.borderRadius = '5px';
    loadingIndicator.style.zIndex = '1000';
    loadingIndicator.textContent = message;
    document.body.appendChild(loadingIndicator);
  }

  // Hide loading indicator
  static hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('div[style*="position: fixed; top: 50%; left: 50%;"]');
    if (loadingIndicator) {
      document.body.removeChild(loadingIndicator);
    }
  }

  // Fallback method for printing on mobile devices
  static printReceiptMobile(transaction: any, qrCodeDataUrl: string) {
    console.log('Trying mobile print fallback...');
    // Implement mobile-specific printing logic here
    // For example, use a library like cordova-plugin-printer
    // Or use a different approach to trigger printing on mobile devices
  }

  // Fallback method for printing on mobile devices
  static printPurchaseReceiptMobile(transaction: any, qrCodeDataUrl: string) {
    console.log('Trying mobile print fallback for purchase...');
    // Implement mobile-specific printing logic here
    // For example, use a library like cordova-plugin-printer
    // Or use a different approach to trigger printing on mobile devices
  }

  // Fallback method for printing when popup blockers are enabled
  static printReceiptFallback(transaction: any, qrCodeDataUrl: string) {
    console.log('Popup blocked, trying fallback print...');
    // Implement fallback printing logic here
    // For example, prompt the user to copy the receipt content and print it manually
  }

  // Fallback method for printing when popup blockers are enabled
  static printPurchaseReceiptFallback(transaction: any, qrCodeDataUrl: string) {
    console.log('Popup blocked, trying fallback print for purchase...');
    // Implement fallback printing logic here
    // For example, prompt the user to copy the receipt content and print it manually
  }
    receiptWindow.print();
    receiptWindow.close();
    // Hide loading indicator
    this.hideLoadingIndicator();
  }

  // Print receipt on mobile devices
  static printReceiptMobile(transaction: any, qrCodeDataUrl: string = '') {
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    try {
      // Create a hidden iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-1000px';
      printFrame.style.left = '-1000px';
      document.body.appendChild(printFrame);
      
      const receiptContent = this.generateReceiptContent(transaction, qrCodeDataUrl);
      
      const printDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (printDoc) {
        printDoc.open();
        printDoc.write(receiptContent);
        printDoc.close();
        
        // Wait for content to load before printing
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          // Remove the iframe after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
            // Hide loading indicator
            this.hideLoadingIndicator();
          }, 1000);
        }, 500);
      } else {
        // Fallback to simple method if iframe doesn't work
        document.body.removeChild(printFrame);
        this.printReceiptFallback(transaction, qrCodeDataUrl);
      }
    } catch (error) {
      console.error('Mobile print error:', error);
      // Hide loading indicator
      this.hideLoadingIndicator();
      // Fallback to simple method
      this.printReceiptFallback(transaction, qrCodeDataUrl);
    }
  }

  // Print purchase receipt on mobile devices
  static printPurchaseReceiptMobile(transaction: any, qrCodeDataUrl: string = '') {
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    try {
      // Create a hidden iframe for printing
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'absolute';
      printFrame.style.top = '-1000px';
      printFrame.style.left = '-1000px';
      document.body.appendChild(printFrame);
      
      const receiptContent = this.generatePurchaseReceiptContent(transaction, qrCodeDataUrl);
      
      const printDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      if (printDoc) {
        printDoc.open();
        printDoc.write(receiptContent);
        printDoc.close();
        
        // Wait for content to load before printing
        setTimeout(() => {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          // Remove the iframe after printing
          setTimeout(() => {
            document.body.removeChild(printFrame);
            // Hide loading indicator
            this.hideLoadingIndicator();
          }, 1000);
        }, 500);
      } else {
        // Fallback to simple method if iframe doesn't work
        document.body.removeChild(printFrame);
        this.printPurchaseReceiptFallback(transaction, qrCodeDataUrl);
      }
    } catch (error) {
      console.error('Mobile print error:', error);
      // Hide loading indicator
      this.hideLoadingIndicator();
      // Fallback to simple method
      this.printPurchaseReceiptFallback(transaction, qrCodeDataUrl);
    }
  }

  // Fallback when popup blockers prevent window.open()
  static printReceiptFallback(transaction: any, qrCodeDataUrl: string = '') {
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    try {
      // Create a print-specific window with only the receipt content
      const receiptContent = this.generateReceiptContent(transaction, qrCodeDataUrl);
      
      // Open a new window with receipt content only
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        
        // Wait for content to load before printing
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // Close the window after printing
          setTimeout(() => {
            printWindow.close();
            // Hide loading indicator
            this.hideLoadingIndicator();
          }, 1000);
        }, 500);
      } else {
        // Final fallback - temporarily replace page content
        this.printReceiptFallbackSimple(transaction);
      }
    } catch (error) {
      console.error('Fallback print error:', error);
      // Hide loading indicator
      this.hideLoadingIndicator();
      // Final fallback - temporarily replace page content
      this.printReceiptFallbackSimple(transaction);
    }
  }

  // Fallback when popup blockers prevent window.open() for purchase receipt
  static printPurchaseReceiptFallback(transaction: any, qrCodeDataUrl: string = '') {
    // Show loading indicator
    this.showLoadingIndicator('Preparing print...');
    
    try {
      // Create a print-specific window with only the receipt content
      const receiptContent = this.generatePurchaseReceiptContent(transaction, qrCodeDataUrl);
      
      // Open a new window with receipt content only
      const printWindow = window.open('', '_blank', 'width=400,height=600');
      if (printWindow) {
        printWindow.document.open();
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        
        // Wait for content to load before printing
        setTimeout(() => {
          printWindow.focus();
          printWindow.print();
          // Close the window after printing
          setTimeout(() => {
            printWindow.close();
            // Hide loading indicator
            this.hideLoadingIndicator();
          }, 1000);
        }, 500);
      } else {
        // Final fallback - temporarily replace page content
        this.printPurchaseReceiptFallbackSimple(transaction);
      }
    } catch (error) {
      console.error('Fallback print error:', error);
      // Hide loading indicator
      this.hideLoadingIndicator();
      // Final fallback - temporarily replace page content
      this.printPurchaseReceiptFallbackSimple(transaction);
    }
  }

  // Simple fallback that temporarily replaces page content (last resort)
  static async printReceiptFallbackSimple(transaction: any) {
    try {
      // Generate QR code for the receipt
      let qrCodeDataUrl = '';
      try {
        const receiptData = {
          type: 'sales',
          receiptNumber: transaction.receiptNumber || Date.now(),
          date: new Date().toISOString(),
          items: transaction.items,
          subtotal: transaction.subtotal,
          tax: transaction.tax,
          discount: transaction.discount,
          total: transaction.total,
          amountReceived: transaction.amountReceived,
          change: transaction.change
        };
        
        qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(receiptData), { width: 100 });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
      
      // Generate receipt content
      const receiptContent = this.generateReceiptContent(transaction, qrCodeDataUrl);
      
      // Replace page content with receipt
      document.body.innerHTML = receiptContent;
      
      // Print
      window.print();
      
      // Restore original content after a delay
      setTimeout(() => {
        document.body.innerHTML = document.body.innerHTML; // This is a simplified approach
        // Hide loading indicator
        this.hideLoadingIndicator();
      }, 1000);
    } catch (error) {
      console.error('Simple fallback print error:', error);
      // Hide loading indicator
      this.hideLoadingIndicator();
    }
  }

  // Simple fallback that temporarily replaces page content (last resort) for purchase receipts
  static async printPurchaseReceiptFallbackSimple(transaction: any) {
    try {
      // Generate QR code for the receipt
      let qrCodeDataUrl = '';
      try {
        const receiptData = {
          type: 'purchase',
          orderNumber: transaction.orderNumber || 'PO-' + Date.now(),
          date: new Date().toISOString(),
          items: transaction.items,
          supplier: transaction.supplier,
          subtotal: transaction.subtotal,
          discount: transaction.discount,
          total: transaction.total,
          paymentMethod: transaction.paymentMethod,
          amountReceived: transaction.amountReceived,
          change: transaction.change
        };
        
        qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(receiptData), { width: 100 });
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
      
      // Generate receipt content
      const receiptContent = this.generatePurchaseReceiptContent(transaction, qrCodeDataUrl);
      
      // Replace page content with receipt
      document.body.innerHTML = receiptContent;
      
      // Print
      window.print();
      
      // Restore original content after a delay
      setTimeout(() => {
        document.body.innerHTML = document.body.innerHTML; // This is a simplified approach
        // Hide loading indicator
        this.hideLoadingIndicator();
      }, 1000);
    } catch (error) {
      console.error('Simple fallback print error:', error);
      // Hide loading indicator
      this.hideLoadingIndicator();
    }
  }

  static generateReceiptContent(transaction: any, qrCodeDataUrl: string = '') {
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
              .qr-code {
                font-family: monospace;
                font-size: 8px;
                line-height: 1.2;
                letter-spacing: 1px;
                padding: 5px;
                border: 1px solid #000;
                display: inline-block;
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
              <div>Receipt #: ${transaction.receiptNumber || Date.now()}</div>
              <div>Date: ${new Date().toLocaleDateString()}</div>
              <div>Time: ${new Date().toLocaleTimeString()}</div>
            </div>
            
            <div class="items">
              ${formattedItems.map((item: any) => `
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
              ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" />` : '<div>QR Code not available</div>'}
            </div>
          </body>
        </html>
      `;
    }
    return receiptContent;
  }

  static generatePurchaseReceiptContent(transaction: any, qrCodeDataUrl: string = '') {
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
                  <div class="item-details">${item.quantity} x @ ${item.price.toFixed(2)}</div>
                  <div class="item-total">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              `).join('')}
            </div>
            
            <div class="totals">
              <div class="total-row">
                <div>Subtotal:</div>
                <div>${subtotal.toFixed(2)}</div>
              </div>
              <div class="total-row">
                <div>Tax (18% of subtotal):</div>
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
            
            <div class="qr-section">
              <div class="qr-label">Scan for Details</div>
              ${qrCodeDataUrl ? `<img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" />` : '<div>QR Code not available</div>'}
            </div>
          </body>
        </html>
      `;
    }
    return receiptContent;
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
              ${products.map((product: any) => `
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
              ${transactions.map((transaction: any) => `
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
              ${transactions.map((transaction: any) => `
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

  // Show loading indicator during print operations
  static showLoadingIndicator(message: string = 'Processing...') {
    // Remove any existing loading indicator
    const existingIndicator = document.querySelector('#printLoadingIndicator');
    if (existingIndicator) {
      document.body.removeChild(existingIndicator);
    }
    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.id = 'printLoadingIndicator';
    loadingIndicator.style.position = 'fixed';
    loadingIndicator.style.top = '0';
    loadingIndicator.style.left = '0';
    loadingIndicator.style.width = '100%';
    loadingIndicator.style.height = '100%';
    loadingIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    loadingIndicator.style.zIndex = '10002';
    loadingIndicator.style.display = 'flex';
    loadingIndicator.style.alignItems = 'center';
    loadingIndicator.style.justifyContent = 'center';
    
    loadingIndicator.innerHTML = `
      <div style="background: white; padding: 20px; border-radius: 10px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <div style="display: inline-block; width: 24px; height: 24px; border: 3px solid #f3f3f3; border-top: 3px solid #28a745; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 10px;"></div>
        <div>${message}</div>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    
    document.body.appendChild(loadingIndicator);
  }

  // Hide loading indicator
  static hideLoadingIndicator() {
    const loadingIndicator = document.querySelector('#printLoadingIndicator');
    if (loadingIndicator && document.body.contains(loadingIndicator)) {
      // Add fade out effect
      (loadingIndicator as HTMLElement).style.transition = 'opacity 0.3s ease';
      (loadingIndicator as HTMLElement).style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(loadingIndicator)) {
          document.body.removeChild(loadingIndicator);
        }
      }, 300);
    }
  }

  // Show print error message
  static showPrintError(transaction: any) {
    const errorMessage = document.createElement('div');
    errorMessage.id = 'printErrorMessage';
    errorMessage.style.position = 'fixed';
    errorMessage.style.top = '50%';
    errorMessage.style.left = '50%';
    errorMessage.style.transform = 'translate(-50%, -50%)';
    errorMessage.style.backgroundColor = '#f8d7da';
    errorMessage.style.color = '#721c24';
    errorMessage.style.padding = '20px';
    errorMessage.style.borderRadius = '5px';
    errorMessage.style.zIndex = '10003';
    errorMessage.style.fontSize = '16px';
    errorMessage.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    errorMessage.style.maxWidth = '90%';
    errorMessage.style.textAlign = 'center';
    errorMessage.innerHTML = `
      <div style="margin-bottom: 15px; font-weight: bold;">Print Error</div>
      <div style="margin-bottom: 15px;">Unable to print receipt. Please try again.</div>
      <button id="closeError" style="padding: 8px 16px; background-color: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">Close</button>
    `;
    document.body.appendChild(errorMessage);
    
    // Add event listener to close button
    const closeBtn = errorMessage.querySelector('#closeError') as HTMLButtonElement;
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(errorMessage);
    });
    
    // Auto-hide error message after 5 seconds
    setTimeout(() => {
      if (document.body.contains(errorMessage)) {
        document.body.removeChild(errorMessage);
      }
    }, 5000);
  }
}