import { PrintUtils } from './src/utils/printUtils.ts';

// Test QR code generation in the actual application context
async function testQRCodeGeneration() {
    console.log('Testing QR code generation in application context...');
    
    // Mock transaction data
    const mockTransaction = {
        receiptNumber: 'TEST-001',
        items: [
            { name: 'Test Item 1', price: 10.00, quantity: 2, total: 20.00 },
            { name: 'Test Item 2', price: 15.00, quantity: 1, total: 15.00 }
        ],
        subtotal: 35.00,
        tax: 3.50,
        discount: 5.00,
        total: 33.50,
        amountReceived: 40.00,
        change: 6.50
    };
    
    try {
        // Test sales receipt QR code generation
        console.log('\n--- Testing Sales Receipt QR Code ---');
        const salesQRCode = await PrintUtils.generateReceiptQRCode(mockTransaction, 'sales');
        console.log('Sales QR Code Data URL length:', salesQRCode.length);
        console.log('Sales QR Code Data URL preview:', salesQRCode.substring(0, 100));
        
        // Test purchase receipt QR code generation
        console.log('\n--- Testing Purchase Receipt QR Code ---');
        const purchaseTransaction = {
            ...mockTransaction,
            orderNumber: 'PO-TEST-001',
            supplier: 'Test Supplier'
        };
        const purchaseQRCode = await PrintUtils.generateReceiptQRCode(purchaseTransaction, 'purchase');
        console.log('Purchase QR Code Data URL length:', purchaseQRCode.length);
        console.log('Purchase QR Code Data URL preview:', purchaseQRCode.substring(0, 100));
        
        // Validate the generated QR codes
        if (salesQRCode && salesQRCode.length > 100) {
            console.log('✅ Sales QR Code generation successful');
        } else {
            console.log('❌ Sales QR Code generation failed');
        }
        
        if (purchaseQRCode && purchaseQRCode.length > 100) {
            console.log('✅ Purchase QR Code generation successful');
        } else {
            console.log('❌ Purchase QR Code generation failed');
        }
        
        // Test the full print receipt function
        console.log('\n--- Testing Full Print Receipt Function ---');
        // This would normally open a new window, but we'll just check the QR code generation part
        
    } catch (error) {
        console.error('Error in QR code testing:', error);
    }
}

// Run the test
testQRCodeGeneration().catch(console.error);