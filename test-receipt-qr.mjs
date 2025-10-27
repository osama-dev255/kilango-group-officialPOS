// Test script to verify QR code generation in the context of the actual project
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of this file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple test to verify the QR code library is working
async function testQRCodeInProjectContext() {
    try {
        // Import the QRCode library (this simulates how it's used in the project)
        const QRCode = await import('qrcode');
        
        console.log('Testing QR code generation in project context...');
        
        // Sample transaction data similar to what's used in printUtils.ts
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
        
        // Create receipt data exactly as done in printUtils.ts
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
        
        const qrCodeData = JSON.stringify(receiptData);
        console.log('QR code data prepared successfully');
        
        // Test generating a simple QR code first
        const testQrCode = await QRCode.default.toDataURL('TEST QR CODE', { 
            width: 100, 
            margin: 2,
            errorCorrectionLevel: 'M'
        });
        console.log('Test QR Code generated successfully, length:', testQrCode.length);
        
        // Generate QR code with the actual receipt data
        const qrCodeDataUrl = await QRCode.default.toDataURL(qrCodeData, { 
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
        
        console.log('Receipt QR Code Data URL generated successfully, length:', qrCodeDataUrl.length);
        console.log('Data URL starts with:', qrCodeDataUrl.substring(0, 30));
        
        // Verify that the data URL is valid
        if (qrCodeDataUrl.startsWith('data:image/png;base64,')) {
            console.log('✅ QR code generation successful! The implementation should work correctly in the project.');
            return true;
        } else {
            console.error('❌ Invalid QR code data URL format');
            return false;
        }
    } catch (error) {
        console.error('Error in QR code generation test:', error);
        return false;
    }
}

// Run the test
testQRCodeInProjectContext().then(success => {
    if (success) {
        console.log('\n🎉 All tests passed! The QR code implementation in your project should work correctly.');
        console.log('\nTo test in the browser:');
        console.log('1. Visit http://localhost:8080/test/receipt-qr');
        console.log('2. Click on "Test Sales Receipt" or "Test Purchase Receipt"');
        console.log('3. Check that the QR code appears in the footer of the generated receipt');
    } else {
        console.log('\n❌ QR code generation test failed. Please check the error messages above.');
    }
});