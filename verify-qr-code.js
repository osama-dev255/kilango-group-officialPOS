const QRCode = require('qrcode');

async function testQRCodeGeneration() {
  try {
    console.log('Testing QR code generation...');
    
    // Test simple string
    const simpleQR = await QRCode.toDataURL('Hello World');
    console.log('Simple QR code generated successfully');
    console.log('Length:', simpleQR.length);
    console.log('Preview:', simpleQR.substring(0, 50));
    
    // Test complex data
    const testData = {
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

    const complexQR = await QRCode.toDataURL(JSON.stringify(testData), {
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
    
    console.log('Complex QR code generated successfully');
    console.log('Length:', complexQR.length);
    console.log('Preview:', complexQR.substring(0, 50));
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error during QR code generation:', error);
  }
}

testQRCodeGeneration();