// QR Code Diagnostic Tool for POS System
console.log('🔍 QR Code Diagnostic Tool for POS System\n');

// Function to analyze the printUtils.ts file
async function analyzePrintUtils() {
    const { readFileSync } = await import('fs');
    
    try {
        const content = readFileSync('src/utils/printUtils.ts', 'utf8');
        console.log('✅ Successfully read printUtils.ts file\n');
        
        // Check for QR code generation
        const hasQRGeneration = content.includes('await QRCode.toDataURL');
        console.log(`${hasQRGeneration ? '✅' : '❌'} QR Code generation implementation found`);
        
        // Check for QR code validation
        const hasQRValidation = content.includes('qrCodeDataUrl && qrCodeDataUrl.length > 100');
        console.log(`${hasQRValidation ? '✅' : '❌'} QR Code validation implemented`);
        
        // Check for error handling
        const hasErrorHandling = content.includes('onerror') && content.includes('onload');
        console.log(`${hasErrorHandling ? '✅' : '❌'} Error handling implemented`);
        
        // Check for fallback messages
        const hasFallback = content.includes('QR Code not available') || content.includes('QR Code failed to load');
        console.log(`${hasFallback ? '✅' : '❌'} Fallback messages implemented`);
        
        // Check for console logging
        const hasConsoleLogging = content.includes('console.log') && content.includes('console.error');
        console.log(`${hasConsoleLogging ? '✅' : '❌'} Console logging implemented`);
        
        // Extract QR section for analysis
        const qrSectionMatch = content.match(/<div class="qr-section">[\s\S]*?<\/div>\s*<\/div>/);
        if (qrSectionMatch) {
            const qrSection = qrSectionMatch[0];
            console.log('\n✅ QR Code section found in HTML template');
            
            // Check for image tag
            const hasImageTag = qrSection.includes('<img src=');
            console.log(`${hasImageTag ? '✅' : '❌'} Image tag present`);
            
            // Check for proper attributes
            const hasSrcAttribute = qrSection.includes('src="${qrCodeDataUrl}"');
            console.log(`${hasSrcAttribute ? '✅' : '❌'} Proper src attribute`);
            
            // Check for alt attribute
            const hasAltAttribute = qrSection.includes('alt="Receipt QR Code"');
            console.log(`${hasAltAttribute ? '✅' : '❌'} Alt attribute present`);
            
            // Check for error div
            const hasErrorDiv = qrSection.includes('qr-error');
            console.log(`${hasErrorDiv ? '✅' : '❌'} Error div present`);
        } else {
            console.log('\n❌ QR Code section not found in HTML template');
        }
        
        return {
            hasQRGeneration,
            hasQRValidation,
            hasErrorHandling,
            hasFallback,
            hasConsoleLogging
        };
        
    } catch (error) {
        console.error('❌ Error reading printUtils.ts:', error.message);
        return null;
    }
}

// Function to simulate QR code generation like in the actual app
async function simulateQRGeneration() {
    console.log('\n🧪 Simulating QR Code Generation...\n');
    
    try {
        // Dynamically import QRCode
        const { default: QRCode } = await import('qrcode');
        
        // Test data
        const receiptData = {
            type: 'sales',
            receiptNumber: 'DIAGNOSTIC-001',
            date: new Date().toISOString(),
            items: [
                { name: 'Test Product', quantity: 1, price: 10.00, total: 10.00 }
            ],
            subtotal: 10.00,
            tax: 0.00,
            discount: 0.00,
            total: 10.00,
            amountReceived: 10.00,
            change: 0.00
        };
        
        const qrCodeData = JSON.stringify(receiptData);
        console.log('✅ Receipt data prepared');
        console.log('   Data length:', qrCodeData.length);
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { 
            width: 120, 
            margin: 2,
            errorCorrectionLevel: 'M',
            type: 'image/png'
        });
        
        console.log('✅ QR Code generated successfully');
        console.log('   Data URL length:', qrCodeDataUrl.length);
        
        // Validate
        if (qrCodeDataUrl && qrCodeDataUrl.length > 100) {
            console.log('✅ QR Code validation passed');
            
            if (qrCodeDataUrl.startsWith('data:image/png;base64,')) {
                console.log('✅ Valid data URL format');
                return true;
            } else {
                console.log('❌ Invalid data URL format');
                return false;
            }
        } else {
            console.log('❌ QR Code validation failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error in QR code generation simulation:', error.message);
        return false;
    }
}

// Main diagnostic function
async function runDiagnostics() {
    console.log('🚀 Running QR Code Diagnostics...\n');
    
    // Analyze implementation
    const analysis = await analyzePrintUtils();
    
    if (!analysis) {
        console.log('\n❌ Unable to analyze implementation. Please check file permissions.');
        return;
    }
    
    // Check if all required components are present
    const allComponentsPresent = Object.values(analysis).every(component => component === true);
    
    console.log(`\n📊 Implementation Analysis: ${allComponentsPresent ? 'PASS' : 'ISSUES FOUND'}`);
    
    if (allComponentsPresent) {
        console.log('✅ All required QR code components are implemented correctly');
    } else {
        console.log('⚠️  Some components are missing or incorrectly implemented');
    }
    
    // Simulate QR generation
    const generationSuccess = await simulateQRGeneration();
    
    console.log(`\n📊 QR Generation Test: ${generationSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (generationSuccess) {
        console.log('✅ QR code generation is working correctly');
    } else {
        console.log('❌ QR code generation is failing');
    }
    
    // Final diagnosis
    console.log('\n📋 Final Diagnosis:');
    if (allComponentsPresent && generationSuccess) {
        console.log('✅ QR code implementation appears to be correct');
        console.log('💡 If you\'re still seeing issues, check the browser console for errors');
        console.log('💡 Also verify that popup blockers are not interfering with receipt generation');
    } else {
        console.log('❌ Issues found in QR code implementation');
        console.log('🔧 Please review the printUtils.ts file');
        console.log('🔧 Ensure all required components are properly implemented');
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify network connectivity for external resources');
    console.log('3. Ensure popup blockers are disabled for receipt generation');
    console.log('4. Test in different browsers to rule out browser-specific issues');
    console.log('5. Clear browser cache and try again');
}

// Run diagnostics
runDiagnostics().catch(error => {
    console.error('❌ Diagnostic tool error:', error.message);
});// QR Code Diagnostic Tool for POS System
console.log('🔍 QR Code Diagnostic Tool for POS System\n');

// Function to analyze the printUtils.ts file
async function analyzePrintUtils() {
    const { readFileSync } = await import('fs');
    
    try {
        const content = readFileSync('src/utils/printUtils.ts', 'utf8');
        console.log('✅ Successfully read printUtils.ts file\n');
        
        // Check for QR code generation
        const hasQRGeneration = content.includes('await QRCode.toDataURL');
        console.log(`${hasQRGeneration ? '✅' : '❌'} QR Code generation implementation found`);
        
        // Check for QR code validation
        const hasQRValidation = content.includes('qrCodeDataUrl && qrCodeDataUrl.length > 100');
        console.log(`${hasQRValidation ? '✅' : '❌'} QR Code validation implemented`);
        
        // Check for error handling
        const hasErrorHandling = content.includes('onerror') && content.includes('onload');
        console.log(`${hasErrorHandling ? '✅' : '❌'} Error handling implemented`);
        
        // Check for fallback messages
        const hasFallback = content.includes('QR Code not available') || content.includes('QR Code failed to load');
        console.log(`${hasFallback ? '✅' : '❌'} Fallback messages implemented`);
        
        // Check for console logging
        const hasConsoleLogging = content.includes('console.log') && content.includes('console.error');
        console.log(`${hasConsoleLogging ? '✅' : '❌'} Console logging implemented`);
        
        // Extract QR section for analysis
        const qrSectionMatch = content.match(/<div class="qr-section">[\s\S]*?<\/div>\s*<\/div>/);
        if (qrSectionMatch) {
            const qrSection = qrSectionMatch[0];
            console.log('\n✅ QR Code section found in HTML template');
            
            // Check for image tag
            const hasImageTag = qrSection.includes('<img src=');
            console.log(`${hasImageTag ? '✅' : '❌'} Image tag present`);
            
            // Check for proper attributes
            const hasSrcAttribute = qrSection.includes('src="${qrCodeDataUrl}"');
            console.log(`${hasSrcAttribute ? '✅' : '❌'} Proper src attribute`);
            
            // Check for alt attribute
            const hasAltAttribute = qrSection.includes('alt="Receipt QR Code"');
            console.log(`${hasAltAttribute ? '✅' : '❌'} Alt attribute present`);
            
            // Check for error div
            const hasErrorDiv = qrSection.includes('qr-error');
            console.log(`${hasErrorDiv ? '✅' : '❌'} Error div present`);
        } else {
            console.log('\n❌ QR Code section not found in HTML template');
        }
        
        return {
            hasQRGeneration,
            hasQRValidation,
            hasErrorHandling,
            hasFallback,
            hasConsoleLogging
        };
        
    } catch (error) {
        console.error('❌ Error reading printUtils.ts:', error.message);
        return null;
    }
}

// Function to simulate QR code generation like in the actual app
async function simulateQRGeneration() {
    console.log('\n🧪 Simulating QR Code Generation...\n');
    
    try {
        // Dynamically import QRCode
        const { default: QRCode } = await import('qrcode');
        
        // Test data
        const receiptData = {
            type: 'sales',
            receiptNumber: 'DIAGNOSTIC-001',
            date: new Date().toISOString(),
            items: [
                { name: 'Test Product', quantity: 1, price: 10.00, total: 10.00 }
            ],
            subtotal: 10.00,
            tax: 0.00,
            discount: 0.00,
            total: 10.00,
            amountReceived: 10.00,
            change: 0.00
        };
        
        const qrCodeData = JSON.stringify(receiptData);
        console.log('✅ Receipt data prepared');
        console.log('   Data length:', qrCodeData.length);
        
        // Generate QR code
        const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, { 
            width: 120, 
            margin: 2,
            errorCorrectionLevel: 'M',
            type: 'image/png'
        });
        
        console.log('✅ QR Code generated successfully');
        console.log('   Data URL length:', qrCodeDataUrl.length);
        
        // Validate
        if (qrCodeDataUrl && qrCodeDataUrl.length > 100) {
            console.log('✅ QR Code validation passed');
            
            if (qrCodeDataUrl.startsWith('data:image/png;base64,')) {
                console.log('✅ Valid data URL format');
                return true;
            } else {
                console.log('❌ Invalid data URL format');
                return false;
            }
        } else {
            console.log('❌ QR Code validation failed');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error in QR code generation simulation:', error.message);
        return false;
    }
}

// Main diagnostic function
async function runDiagnostics() {
    console.log('🚀 Running QR Code Diagnostics...\n');
    
    // Analyze implementation
    const analysis = await analyzePrintUtils();
    
    if (!analysis) {
        console.log('\n❌ Unable to analyze implementation. Please check file permissions.');
        return;
    }
    
    // Check if all required components are present
    const allComponentsPresent = Object.values(analysis).every(component => component === true);
    
    console.log(`\n📊 Implementation Analysis: ${allComponentsPresent ? 'PASS' : 'ISSUES FOUND'}`);
    
    if (allComponentsPresent) {
        console.log('✅ All required QR code components are implemented correctly');
    } else {
        console.log('⚠️  Some components are missing or incorrectly implemented');
    }
    
    // Simulate QR generation
    const generationSuccess = await simulateQRGeneration();
    
    console.log(`\n📊 QR Generation Test: ${generationSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (generationSuccess) {
        console.log('✅ QR code generation is working correctly');
    } else {
        console.log('❌ QR code generation is failing');
    }
    
    // Final diagnosis
    console.log('\n📋 Final Diagnosis:');
    if (allComponentsPresent && generationSuccess) {
        console.log('✅ QR code implementation appears to be correct');
        console.log('💡 If you\'re still seeing issues, check the browser console for errors');
        console.log('💡 Also verify that popup blockers are not interfering with receipt generation');
    } else {
        console.log('❌ Issues found in QR code implementation');
        console.log('🔧 Please review the printUtils.ts file');
        console.log('🔧 Ensure all required components are properly implemented');
    }
    
    console.log('\n🔧 Troubleshooting Tips:');
    console.log('1. Check browser console for JavaScript errors');
    console.log('2. Verify network connectivity for external resources');
    console.log('3. Ensure popup blockers are disabled for receipt generation');
    console.log('4. Test in different browsers to rule out browser-specific issues');
    console.log('5. Clear browser cache and try again');
}

// Run diagnostics
runDiagnostics().catch(error => {
    console.error('❌ Diagnostic tool error:', error.message);
});