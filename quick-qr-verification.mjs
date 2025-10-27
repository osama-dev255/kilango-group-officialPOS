import { readFileSync } from 'fs';

console.log('🔍 Quick QR Code Implementation Verification\n');

// Read the printUtils.ts file
const printUtilsContent = readFileSync('src/utils/printUtils.ts', 'utf8');

// Check for key implementation details
const checks = [
    {
        name: 'QR Code validation',
        pattern: 'qrCodeDataUrl && qrCodeDataUrl.length > 100',
        required: true
    },
    {
        name: 'Enhanced error handling',
        pattern: 'console.error(\'QR Code failed to load',
        required: true
    },
    {
        name: 'Clean fallback messages',
        pattern: 'QR Code not available',
        required: true
    },
    {
        name: 'Error div with class',
        pattern: 'qr-error',
        required: true
    },
    {
        name: 'Proper image onload handler',
        pattern: 'onload="console.log(\'QR Code loaded successfully\')"',
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

console.log('📋 Implementation Checks:');
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
    console.log('   - QR code validation');
    console.log('   - Enhanced error handling');
    console.log('   - Clean fallback messages');
    console.log('   - Proper structure for both sales and purchase receipts');
} else {
    console.log('\n⚠️  WARNING: Some implementation checks failed.');
    console.log('   Please review the printUtils.ts file to ensure all QR code');
    console.log('   implementation requirements are met.');
}

console.log('\n🧪 To test in your application:');
console.log('   1. Generate a sales receipt');
console.log('   2. Generate a purchase receipt');
console.log('   3. Check browser console for QR code messages');
console.log('   4. Verify QR codes display or show appropriate fallback');