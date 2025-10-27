// Debug script to verify QR code template interpolation
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import QRCode from 'qrcode';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function debugQRCodeTemplate() {
    console.log('🔍 QR Code Template Debug\n');
    
    // Generate a sample QR code
    const sampleData = JSON.stringify({
        type: 'sales',
        receiptNumber: 'DEBUG-001',
        date: new Date().toISOString(),
        items: [{ name: 'Test Item', price: 10.00, quantity: 1, total: 10.00 }],
        total: 10.00
    });
    
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(sampleData, {
            width: 120,
            margin: 2,
            errorCorrectionLevel: 'M',
            type: 'image/png',
            quality: 1
        });
        
        console.log('✅ QR Code generated successfully');
        console.log('   Data URL length:', qrCodeDataUrl.length);
        console.log('   Data URL preview:', qrCodeDataUrl.substring(0, 100));
        
        // Simulate the template interpolation
        const simulatedTemplate = `
        <div class="qr-section">
          <div class="qr-label">Scan for Details</div>
          ${qrCodeDataUrl && qrCodeDataUrl.length > 100 ? 
            `<div style="margin: 10px 0; text-align: center;">
               <img src="${qrCodeDataUrl}" width="120" height="120" class="qr-code-img" alt="Receipt QR Code" 
                    style="max-width: 120px; height: auto; width: 120px; height: 120px; margin: 10px auto; display: block; border: 1px solid #ccc; background: #f9f9f9;"
                    onerror="console.error('QR Code failed to load - Data URL length:', this.src?.length || 0); 
                            console.error('QR Code Data URL preview:', this.src?.substring(0, 100) || 'No src'); 
                            this.style.display='none'; 
                            var errorDiv = this.parentNode.querySelector('.qr-error'); 
                            if (errorDiv) errorDiv.style.display='block';
                            console.log('QR Code onerror triggered - src length:', this.src?.length || 0);" 
                    onload="console.log('QR Code loaded successfully - src length:', this.src?.length || 0); 
                            console.log('QR Code dimensions - naturalWidth:', this.naturalWidth, 'naturalHeight:', this.naturalHeight);" />
               <div class="qr-error" style="font-size: 8px; color: #666; margin: 5px 0; display: none;">QR Code failed to load</div>
             </div>` : 
            `<div style="margin: 10px 0; text-align: center;">
               <div style="font-size: 8px; color: #666;">
                 QR Code not available
               </div>
             </div>`}
          <div style="font-size: 8px; margin-top: 5px;">Receipt #: DEBUG-001</div>
        </div>`;
        
        console.log('\n📋 Simulated Template Output:');
        console.log('   Template contains img tag:', simulatedTemplate.includes('<img src='));
        console.log('   Template contains QR data URL:', simulatedTemplate.includes('data:image/png;base64'));
        console.log('   Template length:', simulatedTemplate.length);
        
        // Write the simulated template to a file for inspection
        const outputPath = path.join(__dirname, 'qr-template-output.html');
        fs.writeFileSync(outputPath, `
        <!DOCTYPE html>
        <html>
        <head>
            <title>QR Template Debug</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .qr-section { border: 1px solid #ccc; padding: 15px; margin: 20px 0; }
                .qr-code-img { max-width: 120px; height: auto; width: 120px; height: 120px; margin: 10px auto; display: block; border: 1px solid #ccc; background: #f9f9f9; }
            </style>
        </head>
        <body>
            <h1>QR Template Debug Output</h1>
            ${simulatedTemplate}
        </body>
        </html>`);
        
        console.log('\n💾 Template output saved to:', outputPath);
        console.log('   Open this file in your browser to verify QR code display');
        
    } catch (error) {
        console.error('❌ Error generating QR code:', error);
    }
}

// Run the debug function
debugQRCodeTemplate().catch(console.error);