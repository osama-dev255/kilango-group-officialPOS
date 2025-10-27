// Debug script to test QR code generation
const QRCode = require('qrcode');

async function debugQRCode() {
    console.log('Starting QR code debug test...');
    
    try {
        // Test 1: Simple QR code
        console.log('\n--- Test 1: Simple QR Code ---');
        const simpleQR = await QRCode.toDataURL('Hello World', { width: 100 });
        console.log('Simple QR code generated successfully!');
        console.log('Length:', simpleQR.length);
        console.log('Starts with:', simpleQR.substring(0, 30));
        
        // Test 2: Complex data QR code
        console.log('\n--- Test 2: Complex Data QR Code ---');
        const complexData = {
            type: 'sales',
            receiptNumber: 'TEST-001',
            date: new Date().toISOString(),
            items: [
                { name: 'Product 1', quantity: 2, price: 10.00, total: 20.00 },
                { name: 'Product 2', quantity: 1, price: 15.00, total: 15.00 }
            ],
            total: 35.00
        };
        
        const complexQR = await QRCode.toDataURL(JSON.stringify(complexData), { 
            width: 120,
            margin: 2,
            errorCorrectionLevel: 'M'
        });
        console.log('Complex QR code generated successfully!');
        console.log('Length:', complexQR.length);
        console.log('Starts with:', complexQR.substring(0, 30));
        
        // Test 3: With all the options from your implementation
        console.log('\n--- Test 3: Full Options QR Code ---');
        const fullOptionsQR = await QRCode.toDataURL(JSON.stringify(complexData), { 
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
        console.log('Full options QR code generated successfully!');
        console.log('Length:', fullOptionsQR.length);
        console.log('Starts with:', fullOptionsQR.substring(0, 30));
        
        console.log('\n--- All tests passed! ---');
        console.log('QR code generation is working correctly in your environment.');
        
    } catch (error) {
        console.error('\n--- ERROR ---');
        console.error('QR code generation failed:', error);
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

debugQRCode();