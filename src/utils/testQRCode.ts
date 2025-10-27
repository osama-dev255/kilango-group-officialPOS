import QRCode from "qrcode";

// Test QR code generation
export const testQRCodeGeneration = async () => {
  try {
    // Test with simple text
    const testQR = await QRCode.toDataURL('TEST QR CODE', { 
      width: 100, 
      margin: 2,
      errorCorrectionLevel: 'M'
    });
    
    console.log('Test QR Code generated successfully:', testQR.substring(0, 50));
    
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
    
    console.log('Data QR Code generated successfully:', dataQR.substring(0, 50));
    
    return { testQR, dataQR };
  } catch (error) {
    console.error('Error generating QR codes:', error);
    return null;
  }
};

// Run the test if this file is executed directly
if (typeof window !== 'undefined') {
  testQRCodeGeneration().then(result => {
    if (result) {
      console.log('QR Code generation test completed successfully');
    } else {
      console.log('QR Code generation test failed');
    }
  });
}