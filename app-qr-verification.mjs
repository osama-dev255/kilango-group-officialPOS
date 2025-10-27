// App QR Code Verification
import { readFileSync } from 'fs';

console.log('🔍 App QR Code Implementation Verification\n');

// Read the actual printUtils.ts file
const printUtilsContent = readFileSync('src/utils/printUtils.ts', 'utf8');

console.log('✅ Successfully read printUtils.ts\n');

// Check for key implementation details
const checks = [
    {
        name: 'QR Code generation',
        pattern: 'await QRCode.toDataURL',
        required: true
    },
    {
        name: 'QR Code validation',
        pattern: 'qrCodeDataUrl && qrCodeDataUrl.length > 100',
        required: true
    },
    {
        name: 'Image onload handler',
        pattern: 'onload="console.log(\'QR Code loaded successfully',
        required: true
    },
    {
        name: 'Image onerror handler',
        pattern: 'onerror="console.error(\'QR Code failed to load',
        required: true
    },
    {
        name: 'Error div with class',
        pattern: 'qr-error',
        required: true
    },
    {
        name: 'Proper image styling',
        pattern: 'max-width: 120px; height: auto; margin: 10px auto; display: block;',
        required: true
    },
    {
        name: 'Sales receipt QR section',
        pattern: '<div class="qr-section">\\s*<div class="qr-label">Scan for Details</div>',
        required: true,
        isRegex: true
    },
    {
        name: 'Purchase receipt QR section',
        pattern: 'Scan for Details[\\s\\S]*?<div style="font-size: 8px; margin-top: 5px;">Order #:',
        required: true,
        isRegex: true
    }
];

let passed = 0;
let total = checks.length;

console.log('📋 Implementation Verification:');
checks.forEach((check, index) => {
    const found = check.isRegex 
        ? new RegExp(check.pattern, 'g').test(printUtilsContent)
        : printUtilsContent.includes(check.pattern);
    
    const status = found ? '✅' : '❌';
    console.log(`  ${status} ${check.name}`);
    
    if (found) passed++;
});

console.log(`\n📊 Results: ${passed}/${total} checks passed`);

if (passed === total) {
    console.log('\n🎉 SUCCESS: All QR code implementation checks passed!');
    console.log('   Your printUtils.ts file is properly configured with:');
    console.log('   - QR code generation and validation');
    console.log('   - Proper image handling with onload/onerror');
    console.log('   - Error handling and fallback messages');
    console.log('   - Correct styling for QR code display');
    console.log('   - Implementation for both sales and purchase receipts');
} else {
    console.log('\n⚠️  WARNING: Some implementation checks failed.');
    console.log('   Please review the printUtils.ts file to ensure all QR code');
    console.log('   implementation requirements are met.');
}

// Extract and display the actual QR code sections
console.log('\n🔍 QR Code Section Analysis:');

// Sales receipt QR section
const salesQRMatch = printUtilsContent.match(/<div class="qr-section">[\s\S]*?Receipt #:/);
if (salesQRMatch) {
    console.log('✅ Sales receipt QR section found');
    const section = salesQRMatch[0];
    
    // Check for key elements
    const hasImageTag = section.includes('<img src=');
    const hasOnload = section.includes('onload=');
    const hasOnerror = section.includes('onerror=');
    const hasErrorDiv = section.includes('qr-error');
    
    console.log(`   Image tag: ${hasImageTag ? '✅' : '❌'}`);
    console.log(`   Onload handler: ${hasOnload ? '✅' : '❌'}`);
    console.log(`   Onerror handler: ${hasOnerror ? '✅' : '❌'}`);
    console.log(`   Error div: ${hasErrorDiv ? '✅' : '❌'}`);
} else {
    console.log('❌ Sales receipt QR section not found');
}

// Purchase receipt QR section
const purchaseQRMatch = printUtilsContent.match(/<div class="qr-section">[\s\S]*?Order #:/);
if (purchaseQRMatch) {
    console.log('✅ Purchase receipt QR section found');
    const section = purchaseQRMatch[0];
    
    // Check for key elements
    const hasImageTag = section.includes('<img src=');
    const hasOnload = section.includes('onload=');
    const hasOnerror = section.includes('onerror=');
    const hasErrorDiv = section.includes('qr-error');
    
    console.log(`   Image tag: ${hasImageTag ? '✅' : '❌'}`);
    console.log(`   Onload handler: ${hasOnload ? '✅' : '❌'}`);
    console.log(`   Onerror handler: ${hasOnerror ? '✅' : '❌'}`);
    console.log(`   Error div: ${hasErrorDiv ? '✅' : '❌'}`);
} else {
    console.log('❌ Purchase receipt QR section not found');
}

console.log('\n🔧 Troubleshooting Tips:');
console.log('1. If QR codes are not displaying, check browser console for errors');
console.log('2. Verify that popup blockers are not interfering with receipt generation');
console.log('3. Ensure the receipt window is not being blocked by browser security settings');
console.log('4. Test with different browsers to rule out browser-specific issues');
console.log('5. Clear browser cache and try again');

console.log('\n🧪 To test in your application:');
console.log('   1. Generate a sales receipt');
console.log('   2. Check browser console for "QR Code loaded successfully" message');
console.log('   3. Verify QR code appears below "Scan for Details"');
console.log('   4. If not, check for any error messages in console');