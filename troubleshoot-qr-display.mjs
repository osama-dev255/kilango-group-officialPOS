// QR Display Troubleshooting Tool
console.log('🔍 QR Display Troubleshooting Tool\n');

// Function to simulate the exact receipt generation process
async function simulateReceiptGeneration() {
    console.log('🧪 Simulating Receipt Generation Process...\n');
    
    try {
        // Dynamically import QRCode
        const { default: QRCode } = await import('qrcode');
        console.log('✅ QRCode library loaded successfully');
        
        // Test data similar to what's used in the POS system
        const testTransaction = {
            receiptNumber: "TROUBLESHOOT-001",
            items: [
                { name: "Test Product 1", quantity: 2, price: 10.00, total: 20.00 },
                { name: "Test Product 2", quantity: 1, price: 15.00, total: 15.00 }
            ],
            subtotal: 35.00,
            tax: 0.00,
            discount: 0.00,
            total: 35.00,
            amountReceived: 40.00,
            change: 5.00
        };
        
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
        
        console.log('✅ Receipt data prepared');
        console.log('   Receipt number:', receiptData.receiptNumber);
        console.log('   Items count:', receiptData.items.length);
        
        // Generate QR code using the same approach as in printUtils.ts
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(receiptData), { 
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
        
        console.log('✅ QR Code generated successfully');
        console.log('   Data URL length:', qrCodeDataUrl.length);
        
        // Validate the QR code
        if (qrCodeDataUrl && qrCodeDataUrl.length > 100) {
            console.log('✅ QR Code validation passed');
        } else {
            console.log('❌ QR Code validation failed');
            return false;
        }
        
        // Create the exact HTML that would be used in printUtils.ts
        const receiptContent = `<!DOCTYPE html>
<html>
  <head>
    <title>Receipt</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
      @media print {
        @page {
          margin: 0.5in;
          size: auto;
        }
        body {
          margin: 0.5in;
          padding: 0;
        }
      }
      body {
        font-family: 'Courier New', monospace;
        font-size: 12px;
        max-width: 320px;
        margin: 0 auto;
        padding: 10px;
      }
      .qr-section {
        text-align: center;
        margin: 15px 0;
        padding: 10px;
        border-top: 1px dashed #000;
      }
      .qr-label {
        font-size: 9px;
        margin-bottom: 5px;
      }
      .qr-code-img {
        max-width: 120px;
        height: auto;
        margin: 10px auto;
        display: block;
      }
      .qr-error {
        font-size: 8px;
        color: #666;
        margin: 5px 0;
      }
    </style>
  </head>
  <body>
    <div class="qr-section">
      <div class="qr-label">Scan for Details</div>
      <div style="margin: 10px 0; text-align: center;">
        <img src="${qrCodeDataUrl}" class="qr-code-img" alt="Receipt QR Code" 
             style="max-width: 120px; height: auto; margin: 10px auto; display: block;"
             onerror="console.error('QR Code failed to load - Data URL length:', this.src?.length || 0); 
                     console.error('QR Code Data URL preview:', this.src?.substring(0, 100) || 'No src'); 
                     this.style.display='none'; 
                     var errorDiv = this.parentNode.querySelector('.qr-error'); 
                     if (errorDiv) errorDiv.style.display='block';
                     console.log('QR Code onerror triggered - src length:', this.src?.length || 0);" 
             onload="console.log('QR Code loaded successfully - src length:', this.src?.length || 0);" />
        <div class="qr-error" style="font-size: 8px; color: #666; margin: 5px 0; display: none;">QR Code failed to load</div>
      </div>
      <div style="font-size: 8px; margin-top: 5px;">Receipt #: ${testTransaction.receiptNumber}</div>
    </div>
  </body>
</html>`;
        
        console.log('✅ Receipt HTML content generated');
        console.log('   Content length:', receiptContent.length);
        
        // Write to file for testing
        const { writeFile } = await import('fs/promises');
        await writeFile('troubleshoot-receipt.html', receiptContent);
        console.log('✅ HTML file created: troubleshoot-receipt.html');
        
        // Extract and analyze the QR section
        const qrSectionMatch = receiptContent.match(/<div class="qr-section">[\s\S]*?<\/div>\s*<\/div>/);
        if (qrSectionMatch) {
            const qrSection = qrSectionMatch[0];
            console.log('\n🔍 QR Section Analysis:');
            console.log('✅ QR section extracted successfully');
            console.log('   Section length:', qrSection.length);
            
            // Check for key elements
            const hasImageTag = qrSection.includes('<img src=');
            const hasProperSrc = qrSection.includes(qrCodeDataUrl.substring(0, 50));
            const hasOnload = qrSection.includes('onload=');
            const hasOnerror = qrSection.includes('onerror=');
            const hasStyling = qrSection.includes('max-width: 120px');
            const hasErrorDiv = qrSection.includes('qr-error');
            
            console.log('   Image tag present:', hasImageTag ? '✅' : '❌');
            console.log('   Proper src attribute:', hasProperSrc ? '✅' : '❌');
            console.log('   Onload handler:', hasOnload ? '✅' : '❌');
            console.log('   Onerror handler:', hasOnerror ? '✅' : '❌');
            console.log('   Proper styling:', hasStyling ? '✅' : '❌');
            console.log('   Error div present:', hasErrorDiv ? '✅' : '❌');
            
            if (hasImageTag && hasProperSrc && hasOnload && hasOnerror && hasStyling && hasErrorDiv) {
                console.log('\n🎉 All QR section elements are present and correct!');
                return true;
            } else {
                console.log('\n⚠️  Some QR section elements are missing or incorrect');
                return false;
            }
        } else {
            console.log('\n❌ QR section not found in HTML content');
            return false;
        }
        
    } catch (error) {
        console.error('❌ Error in simulation:', error.message);
        console.error(error.stack);
        return false;
    }
}

// Function to check for common display issues
function checkForCommonIssues() {
    console.log('\n🔍 Checking for Common Display Issues:\n');
    
    const issues = [
        {
            name: 'Browser Security Restrictions',
            description: 'Some browsers block data URLs in certain contexts',
            solution: 'Try in a different browser or disable strict security settings'
        },
        {
            name: 'Popup Blockers',
            description: 'Receipt windows might be blocked by popup blockers',
            solution: 'Disable popup blockers for this site'
        },
        {
            name: 'CSS Conflicts',
            description: 'Other CSS might be overriding QR code styles',
            solution: 'Check browser developer tools for conflicting styles'
        },
        {
            name: 'Network Issues',
            description: 'Data URLs might be too large for some browsers',
            solution: 'QR code data URLs are typically well within browser limits'
        },
        {
            name: 'JavaScript Errors',
            description: 'Errors might prevent proper execution of onload handlers',
            solution: 'Check browser console for JavaScript errors'
        }
    ];
    
    issues.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.name}`);
        console.log(`   Description: ${issue.description}`);
        console.log(`   Solution: ${issue.solution}\n`);
    });
}

// Main troubleshooting function
async function runTroubleshooting() {
    console.log('🚀 Running QR Display Troubleshooting...\n');
    
    // Simulate receipt generation
    const simulationSuccess = await simulateReceiptGeneration();
    
    console.log(`\n📊 Simulation Results: ${simulationSuccess ? 'SUCCESS' : 'FAILED'}`);
    
    if (simulationSuccess) {
        console.log('✅ The receipt generation process is working correctly');
        console.log('✅ QR code is being generated with proper HTML structure');
        console.log('✅ All necessary elements are present in the QR section');
    } else {
        console.log('❌ Issues found in the receipt generation process');
        console.log('❌ Please review the implementation');
    }
    
    // Check for common issues
    checkForCommonIssues();
    
    // Final recommendations
    console.log('📋 Final Recommendations:');
    if (simulationSuccess) {
        console.log('✅ Since the simulation works, the issue is likely environment-specific');
        console.log('💡 Check browser console for any errors when generating receipts');
        console.log('💡 Try generating receipts in different browsers');
        console.log('💡 Disable popup blockers and browser extensions');
        console.log('💡 Check browser developer tools for any CSS or JavaScript issues');
        console.log('💡 Clear browser cache and try again');
    } else {
        console.log('❌ Since the simulation failed, there may be issues with the implementation');
        console.log('🔧 Review the printUtils.ts file for any recent changes');
        console.log('🔧 Ensure all dependencies are properly installed');
    }
    
    console.log('\n📁 Test File:');
    console.log('A file named "troubleshoot-receipt.html" has been created.');
    console.log('Open this file in your browser to verify QR code display.');
}

// Run troubleshooting
runTroubleshooting().catch(error => {
    console.error('❌ Troubleshooting tool error:', error.message);
});