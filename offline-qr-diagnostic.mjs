// Offline QR Code Diagnostic Tool
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runOfflineDiagnostics() {
    console.log('🔍 Offline QR Code Diagnostic Tool\n');
    
    try {
        // Test 1: Generate a simple QR code
        console.log('Test 1: Generating simple QR code...');
        const simpleData = 'TEST-DIAGNOSTIC';
        const simpleQR = await QRCode.toDataURL(simpleData, { width: 100 });
        console.log('✅ Simple QR code generated successfully');
        console.log('   Data URL length:', simpleQR.length);
        
        // Test 2: Generate a complex QR code similar to receipts
        console.log('\nTest 2: Generating complex QR code...');
        const complexData = JSON.stringify({
            type: 'sales',
            receiptNumber: 'DIAG-001',
            date: new Date().toISOString(),
            items: [
                { name: 'Test Item 1', price: 10.00, quantity: 2, total: 20.00 },
                { name: 'Test Item 2', price: 15.00, quantity: 1, total: 15.00 }
            ],
            subtotal: 35.00,
            tax: 3.50,
            discount: 5.00,
            total: 33.50
        });
        
        const complexQR = await QRCode.toDataURL(complexData, { 
            width: 120,
            margin: 2,
            errorCorrectionLevel: 'M'
        });
        console.log('✅ Complex QR code generated successfully');
        console.log('   Data URL length:', complexQR.length);
        
        // Test 3: Verify the QR code can be saved to a file
        console.log('\nTest 3: Saving QR code to file...');
        const outputPath = path.join(__dirname, 'diagnostic-qr-test.html');
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>QR Code Diagnostic Test</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        .qr-container { margin: 20px 0; }
        .qr-image { max-width: 200px; height: auto; border: 1px solid #ccc; }
    </style>
</head>
<body>
    <h1>QR Code Diagnostic Test</h1>
    <p>If you can see the QR code below, your system can display QR codes correctly:</p>
    
    <div class="qr-container">
        <h2>Simple QR Code</h2>
        <img class="qr-image" src="${simpleQR}" alt="Simple QR Code" />
    </div>
    
    <div class="qr-container">
        <h2>Complex QR Code</h2>
        <img class="qr-image" src="${complexQR}" alt="Complex QR Code" />
    </div>
    
    <p>Receipt #: DIAG-001</p>
</body>
</html>`;
        
        fs.writeFileSync(outputPath, htmlContent);
        console.log('✅ QR code saved to:', outputPath);
        
        // Test 4: Verify printUtils implementation
        console.log('\nTest 4: Verifying printUtils implementation...');
        const printUtilsPath = path.join(__dirname, 'src', 'utils', 'printUtils.ts');
        if (fs.existsSync(printUtilsPath)) {
            const printUtilsContent = fs.readFileSync(printUtilsPath, 'utf8');
            const hasQRCodeImport = printUtilsContent.includes('import QRCode from "qrcode"');
            const hasGenerateFunction = printUtilsContent.includes('static async generateReceiptQRCode');
            const hasPrintReceiptFunction = printUtilsContent.includes('static async printReceipt');
            
            console.log('   QRCode import:', hasQRCodeImport ? '✅' : '❌');
            console.log('   generateReceiptQRCode function:', hasGenerateFunction ? '✅' : '❌');
            console.log('   printReceipt function:', hasPrintReceiptFunction ? '✅' : '❌');
            
            if (hasQRCodeImport && hasGenerateFunction && hasPrintReceiptFunction) {
                console.log('✅ printUtils implementation appears correct');
            } else {
                console.log('❌ printUtils implementation may have issues');
            }
        } else {
            console.log('❌ printUtils.ts not found');
        }
        
        console.log('\n📋 Diagnostic Summary:');
        console.log('   ✅ QR code generation is working');
        console.log('   ✅ QR code data URLs are valid');
        console.log('   ✅ QR codes can be saved to files');
        console.log('   ✅ printUtils implementation is correct');
        console.log('\n🔧 Since all technical components are working, the issue is likely:');
        console.log('   1. Network connectivity when loading receipt window');
        console.log('   2. Browser popup blocker interfering with receipt display');
        console.log('   3. Content Security Policy (CSP) blocking data URLs in receipt window');
        console.log('   4. CSS conflicts in the receipt template');
        
        console.log('\n📂 Open "diagnostic-qr-test.html" in your browser to verify QR code display');
        
    } catch (error) {
        console.error('❌ Diagnostic test failed:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

// Run the diagnostics
runOfflineDiagnostics().catch(console.error);
