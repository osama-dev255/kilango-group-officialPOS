import QRCode from 'qrcode';

// Test the exact approach used in printUtils.ts
async function testQRImplementation() {
    console.log('Testing QR Code implementation from printUtils.ts...\n');
    
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
        console.log(`QR Code data length: ${qrCodeData.length}`);
        console.log(`QR Code data preview: ${qrCodeData.substring(0, 100)}...`);
        
        // Generate QR code using the same approach as printUtils.ts
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
        
        console.log(`\nQR Code generated successfully!`);
        console.log(`Data URL length: ${qrCodeDataUrl.length}`);
        console.log(`Data URL preview: ${qrCodeDataUrl.substring(0, 100)}...`);
        
        // Verify the data URL format
        if (qrCodeDataUrl.startsWith('data:image/png;base64,')) {
            console.log(`\n✓ Data URL format is correct`);
            console.log(`✓ Base64 data length: ${qrCodeDataUrl.substring(22).length} characters`);
        } else {
            console.log(`\n✗ Data URL format is incorrect`);
            return false;
        }
        
        // Test HTML template that would be used in printUtils.ts
        const htmlTemplate = `
            <div style="margin: 10px 0; text-align: center;">
                <img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" 
                     onerror="console.error('QR Code failed to load'); this.style.display='none'; 
                             var errorDiv = this.parentNode.querySelector('.qr-error'); 
                             if (errorDiv) errorDiv.style.display='block';" 
                     onload="console.log('QR Code loaded successfully')" />
                <div class="qr-error" style="font-size: 8px; color: #666; margin: 5px 0; display: none;">QR Code failed to load</div>
            </div>
        `;
        
        console.log(`\nHTML template generated successfully`);
        console.log(`Template length: ${htmlTemplate.length} characters`);
        
        // Check for common issues
        if (htmlTemplate.includes('onerror') && htmlTemplate.includes('onload')) {
            console.log(`✓ Error handling attributes present`);
        }
        
        if (htmlTemplate.includes('qr-error')) {
            console.log(`✓ Error message div present`);
        }
        
        console.log(`\n🎉 QR Code implementation test completed successfully!`);
        return true;
        
    } catch (error) {
        console.error(`Error: ${error.message}`);
        console.error(error.stack);
        return false;
    }
}

// Run the test
testQRImplementation().then(success => {
    if (success) {
        console.log('\n✅ All tests passed!');
    } else {
        console.log('\n❌ Some tests failed!');
    }
});