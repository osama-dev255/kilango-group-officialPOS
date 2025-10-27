import QRCode from 'qrcode';
import { writeFile } from 'fs/promises';

// Test QR code generation with the exact approach used in printUtils.ts
async function testQRGeneration() {
    console.log('Testing QR Code Generation...\n');
    
    // Test data similar to what's used in the POS system
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
        // Create receipt data like in printUtils.ts
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
        
        const qrCodeData = JSON.stringify(receiptData);
        console.log('QR Code data length:', qrCodeData.length);
        console.log('QR Code data preview:', qrCodeData.substring(0, 100) + '...');
        
        // Generate QR code using the same approach as in printUtils.ts
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
        
        console.log('\n✅ QR Code generated successfully!');
        console.log('Data URL length:', qrCodeDataUrl.length);
        console.log('Data URL preview:', qrCodeDataUrl.substring(0, 100) + '...');
        
        // Validate the QR code
        if (qrCodeDataUrl && qrCodeDataUrl.length > 100) {
            console.log('✅ QR Code validation passed');
            
            // Check if it's a valid data URL
            if (qrCodeDataUrl.startsWith('data:image/png;base64,')) {
                console.log('✅ Valid data URL format');
                console.log('Base64 data length:', qrCodeDataUrl.substring(22).length);
            } else {
                console.log('❌ Invalid data URL format');
            }
        } else {
            console.log('❌ QR Code validation failed');
        }
        
        // Create a simple HTML file to test display
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <title>QR Code Test</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        .qr-container { margin: 20px 0; }
        .qr-image { max-width: 200px; height: auto; }
    </style>
</head>
<body>
    <h2>QR Code Display Test</h2>
    <div class="qr-container">
        <img src="${qrCodeDataUrl}" class="qr-image" alt="Test QR Code" 
             onerror="console.error('QR Code failed to load'); this.style.display='none';" 
             onload="console.log('QR Code loaded successfully');" />
    </div>
    <p>If you see a QR code above, the generation and display are working correctly.</p>
    <p>Data URL length: ${qrCodeDataUrl.length}</p>
</body>
</html>`;
        
        // Write to file
        await writeFile('qr-test-output.html', htmlContent);
        console.log('\n✅ HTML test file created: qr-test-output.html');
        console.log('Open this file in your browser to verify QR code display');
        
    } catch (error) {
        console.error('❌ Error generating QR code:', error.message);
        console.error(error.stack);
    }
}

// Run the test
testQRGeneration();