import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  QrCode, 
  Camera, 
  Scan, 
  ShoppingCart,
  Plus,
  Minus,
  X,
  Image as ImageIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";
// Import Quagga for barcode scanning
import Quagga from 'quagga';

interface ScannedItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  barcode: string;
}

interface BarcodeScannerProps {
  onItemsScanned: (items: ScannedItem[]) => void;
  onCancel: () => void;
}

// Mock product database - in a real app, this would come from an API
const PRODUCT_DATABASE = [
  { id: "1", name: "Wireless Headphones", price: 99.99, barcode: "123456789012", stock: 25 },
  { id: "2", name: "Coffee Maker", price: 79.99, barcode: "234567890123", stock: 15 },
  { id: "3", name: "Running Shoes", price: 129.99, barcode: "345678901234", stock: 30 },
  { id: "4", name: "Smartphone Case", price: 24.99, barcode: "456789012345", stock: 50 },
  { id: "5", name: "Water Bottle", price: 19.99, barcode: "567890123456", stock: 40 },
  { id: "6", name: "Desk Lamp", price: 39.99, barcode: "678901234567", stock: 20 },
  { id: "7", name: "Notebook Set", price: 14.99, barcode: "789012345678", stock: 35 },
  { id: "8", name: "Bluetooth Speaker", price: 59.99, barcode: "890123456789", stock: 18 },
];

export const BarcodeScanner = ({ onItemsScanned, onCancel }: BarcodeScannerProps) => {
  const { toast } = useToast();
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const quaggaInitialized = useRef(false);

  // Initialize camera for scanning with better mobile support
  useEffect(() => {
    const initCamera = async () => {
      try {
        console.log("Attempting to access camera...");
        
        // Check if mediaDevices is available
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error("Camera API not supported in this browser. Please try a modern browser like Chrome, Firefox, or Safari.");
        }
        
        // Try different constraints as fallbacks
        const constraintsOptions = [
          { video: { facingMode: { exact: "environment" } } }, // Prefer back camera
          { video: { facingMode: "environment" } },
          { video: { facingMode: "user" } }, // Fallback to front camera
          { video: { width: { ideal: 1280 }, height: { ideal: 720 } } },
          { video: true }
        ];
        
        let stream;
        let error;
        let usedConstraints = {};
        
        for (const constraints of constraintsOptions) {
          try {
            console.log("Trying constraints:", constraints);
            stream = await navigator.mediaDevices.getUserMedia(constraints);
            usedConstraints = constraints;
            console.log("Camera access granted with constraints:", constraints);
            break;
          } catch (err) {
            error = err;
            console.warn("Failed with constraints:", constraints, err);
          }
        }
        
        if (!stream && error) {
          throw new Error(`Failed to access camera. Please ensure you've granted camera permissions. Error: ${error.message || error}`);
        }
        
        console.log("Using camera constraints:", usedConstraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
          
          // Play the video explicitly for mobile browsers
          try {
            await videoRef.current.play();
            console.log("Video playback started");
          } catch (playError) {
            console.warn("Video play failed:", playError);
            // This might happen on mobile browsers that require user interaction
          }
        }
        setIsScanning(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({
          title: "Camera Access Denied",
          description: err.message || "Please enable camera access to use the scanner",
          variant: "destructive",
        });
      }
    };

    if (isScanning) {
      initCamera();
    }

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Stop Quagga when component unmounts
      if (quaggaInitialized.current) {
        Quagga.stop();
        quaggaInitialized.current = false;
      }
    };
  }, [isScanning, toast]);

  // Initialize barcode detection (using modern Barcode Detection API if available, fallback to Quagga)
  useEffect(() => {
    if (isScanning && videoRef.current) {
      // Check if Barcode Detection API is available (Chrome only for now)
      if ('BarcodeDetector' in window) {
        console.log("Using modern Barcode Detection API");
        initModernBarcodeDetection();
      } else {
        console.log("Using Quagga.js for barcode detection");
        initQuaggaBarcodeDetection();
      }
    }

    return () => {
      // Clean up both detection methods
      if (quaggaInitialized.current) {
        Quagga.stop();
        quaggaInitialized.current = false;
      }
      
      // Stop modern detection if running
      if (barcodeDetectionInterval.current) {
        clearInterval(barcodeDetectionInterval.current);
        barcodeDetectionInterval.current = null;
      }
    };
  }, [isScanning]);

  // Reference for modern barcode detection interval
  const barcodeDetectionInterval = useRef<NodeJS.Timeout | null>(null);
  const barcodeDetectorRef = useRef<any>(null);

  // Initialize modern barcode detection (Chrome only)
  const initModernBarcodeDetection = async () => {
    try {
      // @ts-ignore - BarcodeDetector is not in TypeScript definitions yet
      barcodeDetectorRef.current = new BarcodeDetector({
        formats: ['code_128', 'ean_13', 'ean_8', 'code_39', 'code_93', 'codabar', 'upc_a', 'upc_e', 'qr_code']
      });
      
      console.log("Modern Barcode Detection API initialized");
      
      // Start detection loop
      const detectBarcodes = async () => {
        if (videoRef.current && barcodeDetectorRef.current) {
          try {
            const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            if (barcodes && barcodes.length > 0) {
              console.log("Barcodes detected:", barcodes);
              const barcode = barcodes[0].rawValue;
              if (barcode) {
                console.log("Scanned barcode:", barcode);
                simulateScan(barcode);
              }
            }
          } catch (err) {
            console.error("Error detecting barcodes:", err);
          }
        }
      };
      
      // Run detection every 500ms
      barcodeDetectionInterval.current = setInterval(detectBarcodes, 500);
    } catch (err) {
      console.error("Error initializing Barcode Detection API:", err);
      // Fallback to Quagga
      initQuaggaBarcodeDetection();
    }
  };

  // Initialize Quagga for barcode scanning (fallback)
  const initQuaggaBarcodeDetection = () => {
    if (quaggaInitialized.current) return;

    console.log("Initializing Quagga...");
    
    // Check if video element is ready
    if (!videoRef.current || videoRef.current.videoWidth === 0) {
      console.warn("Video element not ready, waiting...");
      setTimeout(initQuaggaBarcodeDetection, 500);
      return;
    }
    
    const config = {
      inputStream: {
        name: "Live",
        type: "LiveStream",
        target: videoRef.current,
        constraints: {
          width: { min: 640 },
          height: { min: 480 },
          facingMode: "environment"
        },
      },
      locator: {
        patchSize: "medium",
        halfSample: true
      },
      numOfWorkers: navigator.hardwareConcurrency ? navigator.hardwareConcurrency - 1 : 2,
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "code_39_reader",
          "code_39_vin_reader",
          "codabar_reader",
          "upc_reader",
          "upc_e_reader",
          "i2of5_reader"
        ]
      },
      locate: true
    };
    
    console.log("Quagga config:", config);
    
    Quagga.init(config, (err) => {
      if (err) {
        console.error("Error initializing Quagga:", err);
        toast({
          title: "Scanner Error",
          description: "Failed to initialize barcode scanner: " + (err.message || "Unknown error"),
          variant: "destructive",
        });
        return;
      }
      
      console.log("Quagga initialized successfully");
      
      // Check if camera is actually providing frames
      if (videoRef.current && videoRef.current.srcObject) {
        Quagga.start();
        quaggaInitialized.current = true;
        
        // Set up detection callback
        Quagga.onDetected((data) => {
          console.log("Barcode detected:", data);
          if (data && data.codeResult && data.codeResult.code) {
            const barcode = data.codeResult.code;
            console.log("Scanned barcode:", barcode);
            simulateScan(barcode);
            // Stop scanning after successful detection to prevent multiple scans
            Quagga.stop();
            quaggaInitialized.current = false;
            // Restart scanning after a delay
            setTimeout(() => {
              if (isScanning) {
                Quagga.start();
                quaggaInitialized.current = true;
              }
            }, 1000);
          }
        });
      } else {
        console.error("Camera stream not available");
        toast({
          title: "Scanner Error",
          description: "Camera stream not available",
          variant: "destructive",
        });
      }
    });
  };

  // Simulate barcode scanning (in a real app, this would be triggered by actual barcode detection)
  const simulateScan = (barcode: string) => {
    const product = PRODUCT_DATABASE.find(p => p.barcode === barcode);
    
    if (product) {
      // Check if item already exists in cart
      const existingItemIndex = scannedItems.findIndex(item => item.barcode === barcode);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item already exists
        const updatedItems = [...scannedItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + 1
        };
        setScannedItems(updatedItems);
      } else {
        // Add new item
        const newItem: ScannedItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          barcode: product.barcode
        };
        setScannedItems([...scannedItems, newItem]);
      }
      
      toast({
        title: "Item Scanned",
        description: `${product.name} added to cart`,
      });
    } else {
      toast({
        title: "Product Not Found",
        description: `No product found with barcode ${barcode}`,
        variant: "destructive",
      });
    }
  };

  // Handle manual barcode entry
  const handleManualEntry = () => {
    if (manualBarcode.trim()) {
      simulateScan(manualBarcode.trim());
      setManualBarcode("");
    }
  };

  // Handle quantity changes
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setScannedItems(scannedItems.filter(item => item.id !== id));
      return;
    }
    
    setScannedItems(
      scannedItems.map(item => 
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  // Remove item from cart
  const removeItem = (id: string) => {
    setScannedItems(scannedItems.filter(item => item.id !== id));
  };

  // Calculate total
  const calculateTotal = () => {
    return scannedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Handle scan completion
  const handleScanComplete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (scannedItems.length > 0) {
      onItemsScanned(scannedItems);
    } else {
      toast({
        title: "No Items Scanned",
        description: "Please scan at least one item before proceeding",
        variant: "destructive",
      });
    }
  };

  // Add a function to manually trigger scanning initialization
  const retryCameraAccess = async () => {
    // Stop any existing streams
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Reset states
    setIsScanning(false);
    quaggaInitialized.current = false;
    
    // Stop modern detection if running
    if (barcodeDetectionInterval.current) {
      clearInterval(barcodeDetectionInterval.current);
      barcodeDetectionInterval.current = null;
    }
    
    // Wait a bit for cleanup
    setTimeout(() => {
      setIsScanning(true);
    }, 100);
  };

  // Function to handle photo upload for barcode scanning
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    toast({
      title: "Feature Not Available",
      description: "Photo upload scanning is not currently supported. Please use the live camera scanner instead.",
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Function to trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Check if we're on a mobile device
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  // Function to check if we're in a secure context (HTTPS or localhost)
  const isSecureContext = window.isSecureContext;

  // Simulate scanning some sample barcodes for demo purposes
  const addSampleItems = () => {
    simulateScan("123456789012"); // Wireless Headphones
    simulateScan("234567890123"); // Coffee Maker
    simulateScan("456789012345"); // Smartphone Case
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <Scan className="mr-2 h-6 w-6" />
            Barcode Scanner
          </h2>
          <Button 
            variant="outline" 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        {isMobile && (
          <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="font-medium text-yellow-800">Mobile Device Detected</h3>
            <p className="text-sm text-yellow-700 mt-1">
              For best scanning experience on mobile:
            </p>
            <ul className="text-xs text-yellow-700 mt-1 list-disc pl-5 space-y-1">
              <li>Ensure you're using the latest version of Chrome, Safari, or Firefox</li>
              <li>Make sure you're accessing the app over HTTPS (not HTTP)</li>
              <li>Grant camera permissions when prompted</li>
              <li>Hold the device steady and ensure good lighting</li>
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Scanner Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="mr-2 h-5 w-5" />
                Scan Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Camera Preview */}
                <div className="relative bg-muted rounded-lg overflow-hidden aspect-video flex items-center justify-center">
                  {isScanning ? (
                    <>
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="border-2 border-primary rounded-lg w-64 h-48 animate-pulse"></div>
                      </div>
                      <div className="absolute bottom-4 left-0 right-0 text-center text-white bg-black bg-opacity-50 py-2">
                        Point camera at barcode
                      </div>
                    </>
                  ) : (
                    <div className="text-center p-8">
                      <QrCode className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      {!isSecureContext ? (
                        <>
                          <p className="text-muted-foreground mb-4">
                            Camera access requires a secure connection (HTTPS)
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            For mobile devices, please ensure you're accessing this app through a secure connection.
                          </p>
                        </>
                      ) : isMobile ? (
                        <>
                          <p className="text-muted-foreground mb-4">
                            Camera access required for scanning
                          </p>
                          <p className="text-sm text-muted-foreground mb-4">
                            On mobile devices, you may need to tap the button below and then allow camera access when prompted.
                          </p>
                        </>
                      ) : (
                        <p className="text-muted-foreground mb-4">
                          Camera access required for scanning
                        </p>
                      )}
                      <div className="flex flex-col gap-2">
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            retryCameraAccess();
                          }}
                        >
                          <Camera className="mr-2 h-4 w-4" />
                          {isMobile ? "Request Camera Access" : "Enable Camera"}
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            triggerFileInput();
                          }}
                        >
                          <ImageIcon className="mr-2 h-4 w-4" />
                          Upload Photo
                        </Button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          className="hidden"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                        />
                      </div>
                      {!isSecureContext && (
                        <p className="text-xs text-muted-foreground mt-4">
                          Note: Barcode scanning requires HTTPS connection on mobile devices.
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Manual Entry */}
                <div className="space-y-2">
                  <Label htmlFor="manual-barcode">Or enter barcode manually</Label>
                  <div className="flex gap-2">
                    <Input
                      id="manual-barcode"
                      placeholder="Enter barcode number"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.stopPropagation();
                          handleManualEntry();
                        }
                      }}
                    />
                    <Button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleManualEntry();
                      }}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Demo Button */}
                <Button 
                  variant="secondary" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addSampleItems();
                  }}
                  className="w-full"
                >
                  Add Sample Items (Demo)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Cart Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ShoppingCart className="mr-2 h-5 w-5" />
                Scanned Items
                {scannedItems.length > 0 && (
                  <Badge className="ml-2">{scannedItems.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scannedItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ShoppingCart className="mx-auto h-12 w-12 mb-4" />
                  <p>No items scanned yet</p>
                  <p className="text-sm mt-2">Scan items or enter barcodes manually</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="max-h-96 overflow-y-auto pr-2">
                    {scannedItems.map((item) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-3 border rounded-lg mb-2"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {formatCurrency(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity - 1);
                            }}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              updateQuantity(item.id, item.quantity + 1);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              removeItem(item.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={handleScanComplete}
                    disabled={scannedItems.length === 0}
                  >
                    Add to Cart
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};