// Simple Node.js script to test QR code generation
const QRCode = require('qrcode');

async function testQRCode() {
  try {
    console.log('Testing QR code generation...');
    
    // Test with simple text
    const testQR = await QRCode.toDataURL('TEST QR CODE', { 
      width: 100, 
      margin: 2,
      errorCorrectionLevel: 'M'
    });
    
    console.log('Test QR Code generated successfully');
    console.log('Length:', testQR.length);
    console.log('Preview:', testQR.substring(0, 50));
    
    // Test with JSON data
    const testData = {
      type: 'sales',
      receiptNumber: 'TEST-001',
      date: new Date().toISOString(),
      items: [
        { name: 'Product 1', quantity: 2, price: 10.00, total: 20.00 },
        { name: 'Product 2', quantity: 1, price: 15.00, total: 15.00 }
      ],
      total: 35.00
    };
    
    const dataQR = await QRCode.toDataURL(JSON.stringify(testData), { 
      width: 120, 
      margin: 2,
      errorCorrectionLevel: 'M'
    });
    
    console.log('\nData QR Code generated successfully');
    console.log('Length:', dataQR.length);
    console.log('Preview:', dataQR.substring(0, 50));
    
    console.log('\nQR code generation test completed successfully!');
  } catch (error) {
    console.error('Error generating QR codes:', error);
  }
}

testQRCode();