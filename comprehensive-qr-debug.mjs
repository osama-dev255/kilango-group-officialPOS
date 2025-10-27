// Comprehensive QR Code Debug Test
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the printUtils.ts file to analyze the QR code implementation
const printUtilsPath = path.join(__dirname, 'src', 'utils', 'printUtils.ts');
const printUtilsContent = fs.readFileSync(printUtilsPath, 'utf8');

console.log('=== COMPREHENSIVE QR CODE DEBUG ANALYSIS ===\n');

// Extract QR code related sections
const qrSections = printUtilsContent.split('\n').reduce((sections, line, index) => {
    if (line.includes('generateReceiptQRCode') || line.includes('printReceipt') || line.includes('printPurchaseReceipt')) {
        sections.current = line.trim();
        sections[line.trim()] = { start: index, content: [] };
    }
    if (sections.current) {
        sections[sections.current].content.push(line);
    }
    return sections;
}, { current: null });

// Analyze QR code generation
console.log('1. QR CODE GENERATION ANALYSIS:');
const generateFunction = printUtilsContent.match(/static async generateReceiptQRCode\([^}]+}/s);
if (generateFunction) {
    console.log('   ✅ generateReceiptQRCode function found');
    if (generateFunction[0].includes('QRCode.toDataURL')) {
        console.log('   ✅ Uses QRCode.toDataURL for generation');
    }
    if (generateFunction[0].includes('errorCorrectionLevel')) {
        console.log('   ✅ Uses errorCorrectionLevel setting');
    }
    if (generateFunction[0].includes('width: 120')) {
        console.log('   ✅ Uses appropriate width setting');
    }
    if (generateFunction[0].includes('margin: 2')) {
        console.log('   ✅ Uses margin setting');
    }
}

// Analyze sales receipt QR code implementation
console.log('\n2. SALES RECEIPT QR CODE IMPLEMENTATION:');
const salesReceipt = printUtilsContent.match(/static async printReceipt\([^}]+}/s);
if (salesReceipt) {
    console.log('   ✅ printReceipt function found');
    const qrSection = salesReceipt[0].match(/<div class="qr-section">[\s\S]*?<\/div>/);
    if (qrSection) {
        console.log('   ✅ QR section found in sales receipt');
        if (qrSection[0].includes('qr-code-img')) {
            console.log('   ✅ Uses qr-code-img class');
        }
        if (qrSection[0].includes('onload=')) {
            console.log('   ✅ Has onload handler');
        }
        if (qrSection[0].includes('onerror=')) {
            console.log('   ✅ Has onerror handler');
        }
        if (qrSection[0].includes('max-width: 120px')) {
            console.log('   ✅ Has explicit max-width styling');
        }
        if (qrSection[0].includes('display: block')) {
            console.log('   ✅ Has explicit display styling');
        }
    }
}

// Analyze purchase receipt QR code implementation
console.log('\n3. PURCHASE RECEIPT QR CODE IMPLEMENTATION:');
const purchaseReceipt = printUtilsContent.match(/static async printPurchaseReceipt\([^}]+}/s);
if (purchaseReceipt) {
    console.log('   ✅ printPurchaseReceipt function found');
    const qrSection = purchaseReceipt[0].match(/<div class="qr-section">[\s\S]*?<\/div>/);
    if (qrSection) {
        console.log('   ✅ QR section found in purchase receipt');
        if (qrSection[0].includes('qr-code-img')) {
            console.log('   ✅ Uses qr-code-img class');
        }
        if (qrSection[0].includes('onload=')) {
            console.log('   ✅ Has onload handler');
        }
        if (qrSection[0].includes('onerror=')) {
            console.log('   ✅ Has onerror handler');
        }
    }
}

// Check for potential issues
console.log('\n4. POTENTIAL ISSUE ANALYSIS:');

// Check for data URL validation
if (printUtilsContent.includes('dataUrl.length < 100')) {
    console.log('   ✅ Has data URL validation (length check)');
} else {
    console.log('   ⚠️  Missing data URL validation');
}

// Check for error handling
if (printUtilsContent.includes('qrGenerationError')) {
    console.log('   ✅ Has QR generation error handling');
} else {
    console.log('   ⚠️  Missing QR generation error handling');
}

// Check for proper image attributes
if (printUtilsContent.includes('alt="Receipt QR Code"')) {
    console.log('   ✅ Has proper alt attribute');
} else {
    console.log('   ⚠️  Missing proper alt attribute');
}

// Check for CSS styling
if (printUtilsContent.includes('.qr-code-img')) {
    console.log('   ✅ Has QR code CSS styling');
} else {
    console.log('   ⚠️  Missing QR code CSS styling');
}

console.log('\n5. DEBUG RECOMMENDATIONS:');

console.log('\nBased on your output showing "QR Code loaded successfully - src length: 5698", the QR code is being generated correctly.');
console.log('However, since it\'s not visually displaying, here are some debugging steps:');

console.log('\n   A. Browser Console Debugging:');
console.log('      1. Open browser developer tools (F12)');
console.log('      2. Check the Console tab for any errors when generating receipts');
console.log('      3. Look for Content Security Policy (CSP) violations');
console.log('      4. Check for any JavaScript errors that might prevent rendering');

console.log('\n   B. Network Tab Analysis:');
console.log('      1. Open Network tab in developer tools');
console.log('      2. Generate a receipt');
console.log('      3. Look for the data URL request (it should appear as a very long data:image/png;base64,... URL)');
console.log('      4. Check if the request is being blocked or if there are any errors');

console.log('\n   C. Elements Tab Inspection:');
console.log('      1. Open Elements tab in developer tools');
console.log('      2. Generate a receipt and inspect the QR code img element');
console.log('      3. Check if the src attribute is properly set');
console.log('      4. Verify computed styles - check if display is set to none or if there are any visibility issues');
console.log('      5. Check if the image has zero dimensions');

console.log('\n   D. Environment Testing:');
console.log('      1. Try generating receipts in different browsers (Chrome, Firefox, Edge)');
console.log('      2. Disable browser extensions, especially ad blockers or privacy tools');
console.log('      3. Try in incognito/private browsing mode');
console.log('      4. Clear browser cache and try again');

console.log('\n   E. Code Modifications:');
console.log('      1. Add explicit width/height attributes to the img tag:');
console.log('         <img src="${qrCodeDataUrl}" width="120" height="120" ... />');
console.log('      2. Add a fallback background color to see if the element is being rendered:');
console.log('         .qr-code-img { background-color: #f00; ... }');
console.log('      3. Add more detailed console logging to track the rendering process');

console.log('\n=== DEBUG ANALYSIS COMPLETE ===');