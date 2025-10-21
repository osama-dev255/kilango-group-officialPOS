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
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/currency";

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
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize camera for scanning
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "environment" } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
        setIsScanning(true);
      } catch (err) {
        console.error("Error accessing camera:", err);
        toast({
          title: "Camera Access Denied",
          description: "Please enable camera access to use the scanner",
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
    };
  }, [isScanning, toast]);

  // Simulate barcode scanning (in a real app, you would use a library like jsQR or QuaggaJS)
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
                      <p className="text-muted-foreground mb-4">
                        Camera access required for scanning
                      </p>
                      <Button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setIsScanning(true);
                        }}
                      >
                        <Camera className="mr-2 h-4 w-4" />
                        Enable Camera
                      </Button>
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