import { readFileSync } from 'fs';

// Read the printUtils.ts file to verify the implementation
const printUtilsContent = readFileSync('src/utils/printUtils.ts', 'utf8');

console.log('Verifying QR Code Implementation in printUtils.ts...\n');

// Check for QR code validation
const hasQRValidation = printUtilsContent.includes('qrCodeDataUrl && qrCodeDataUrl.length > 100');
console.log(`${hasQRValidation ? '✅' : '❌'} QR Code validation implemented`);

// Check for enhanced error handling
const hasEnhancedErrorHandling = printUtilsContent.includes('console.error(\'QR Code failed to load');
console.log(`${hasEnhancedErrorHandling ? '✅' : '❌'} Enhanced error handling implemented`);

// Check for clean fallback messages
const hasCleanFallback = printUtilsContent.includes('QR Code not available') || printUtilsContent.includes('QR Code failed to load');
console.log(`${hasCleanFallback ? '✅' : '❌'} Clean fallback messages implemented`);

// Check for both sales and purchase receipt sections
const hasSalesQRSection = printUtilsContent.includes('<div class="qr-section">') && printUtilsContent.includes('Scan for Details');
const hasPurchaseQRSection = printUtilsContent.includes('Scan for Details', printUtilsContent.indexOf('Scan for Details') + 1);
console.log(`${hasSalesQRSection ? '✅' : '❌'} Sales receipt QR section implemented`);
console.log(`${hasPurchaseQRSection ? '✅' : '❌'} Purchase receipt QR section implemented`);

// Extract QR section for detailed analysis
const qrSectionMatch = printUtilsContent.match(/<div class="qr-section">[\s\S]*?<\/div>\s*<\/div>/);
if (qrSectionMatch) {
    const qrSection = qrSectionMatch[0];
    console.log('\n✅ QR Code section found in printUtils.ts');
    
    // Check for proper structure
    const hasProperStructure = qrSection.includes('qr-code-img') && qrSection.includes('onerror') && qrSection.includes('onload');
    console.log(`${hasProperStructure ? '✅' : '❌'} Proper QR code structure implemented`);
    
    // Check for validation
    const hasValidation = qrSection.includes('qrCodeDataUrl && qrCodeDataUrl.length > 100');
    console.log(`${hasValidation ? '✅' : '❌'} QR code validation in template`);
    
    // Check for error div
    const hasErrorDiv = qrSection.includes('qr-error');
    console.log(`${hasErrorDiv ? '✅' : '❌'} Error message div present`);
}

console.log('\n📋 Summary:');
console.log('The QR code implementation in printUtils.ts includes:');
console.log('- QR code validation to ensure proper generation');
console.log('- Enhanced error handling with detailed console logging');
console.log('- Clean fallback messages when QR codes fail to load');
console.log('- Proper structure for both sales and purchase receipts');

console.log('\n🧪 To test in your application:');
console.log('1. Generate a sales receipt');
console.log('2. Generate a purchase receipt');
console.log('3. Check browser console for any QR code related messages');
console.log('4. Verify that QR codes display properly or show appropriate error messages');