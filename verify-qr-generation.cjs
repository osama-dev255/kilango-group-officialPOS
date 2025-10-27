// Test script to verify QR code generation like in printUtils.ts
const QRCode = require('qrcode');

async function testQRCodeGeneration() {
    console.log('Testing QR code generation like in printUtils.ts...');
    
    // Sample transaction data
    const transaction = {
        receiptNumber: 'TEST-001',
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
        console.log('QR code data:', qrCodeData);
        
        // First, try generating a simple test QR code to verify the library works
        testQrCode = await QRCode.toDataURL('TEST QR CODE', { 
            width: 100, 
            margin: 2,
            errorCorrectionLevel: 'M'
        });
        console.log('Test QR Code generated successfully, length:', testQrCode.length);
        console.log('Test QR Code preview:', testQrCode.substring(0, 50));
        
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
        
        console.log('QR Code Data URL generated successfully, length:', qrCodeDataUrl.length);
        console.log('QR Code Data URL preview:', qrCodeDataUrl.substring(0, 100));
        
        // Verify that the data URL is valid
        if (!qrCodeDataUrl.startsWith('data:image/png;base64,')) {
            console.error('Invalid QR code data URL format:', qrCodeDataUrl.substring(0, 50));
            qrCodeDataUrl = ''; // Reset if invalid
        } else {
            console.log('QR code generation successful!');
        }
    } catch (error) {
        console.error('Error generating QR code:', error);
        console.error('QR code data that failed:', qrCodeData);
        console.error('Test QR code result:', testQrCode);
        qrCodeDataUrl = ''; // Ensure it's empty on error
    }
    
    return qrCodeDataUrl;
}

// Run the test
testQRCodeGeneration().then(qrCodeDataUrl => {
    if (qrCodeDataUrl) {
        console.log('SUCCESS: QR code was generated properly');
        console.log('You can use this data URL in an img tag:');
        console.log(`<img src="${qrCodeDataUrl}" alt="Receipt QR Code" />`);
    } else {
        console.log('FAILURE: QR code generation failed');
    }
});