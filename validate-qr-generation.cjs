const QRCode = require('qrcode');

async function validateQRCodeGeneration() {
    console.log('Validating QR code generation...');
    
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
        const qrCodeData = JSON.stringify(receiptData);
        console.log('QR Code data length:', qrCodeData.length);
        
        // Generate QR code with the same settings as in printUtils.ts
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
        
        console.log('QR Code Data URL generated successfully');
        console.log('Data URL length:', qrCodeDataUrl.length);
        
        // Verify that the data URL is valid
        if (!qrCodeDataUrl.startsWith('data:image/png;base64,')) {
            console.error('Invalid QR code data URL format');
            return;
        }
        
        // Extract the base64 part
        const base64Data = qrCodeDataUrl.substring('data:image/png;base64,'.length);
        console.log('Base64 data length:', base64Data.length);
        
        // Validate base64 format
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
            console.error('Invalid base64 format');
            return;
        }
        
        console.log('QR code generation and validation PASSED');
        console.log('First 100 characters of data URL:', qrCodeDataUrl.substring(0, 100));
    } catch (error) {
        console.error('Error generating QR code:', error);
    }
}

validateQRCodeGeneration();