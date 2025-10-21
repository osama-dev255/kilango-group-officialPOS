import { useState, useEffect } from "react";
import { ShoppingCart, Package, Users, Truck } from "lucide-react";
import "../App.css";

export const SplashScreen = () => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000); // Hide splash screen after 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center z-50">
      <div className="text-center text-white">
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="absolute -inset-4 bg-white rounded-full opacity-20 blur"></div>
            <div className="relative bg-white rounded-full p-6">
              <ShoppingCart className="h-16 w-16 text-primary" />
            </div>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold mb-4 splash-fade-in">
          Bulletproof POS
        </h1>

        <p className="text-xl mb-8 opacity-90 splash-fade-in">
          Comprehensive Point of Sale System
        </p>

        <div className="flex justify-center space-x-4 mb-8">
          <div className="flex space-x-2">
            {[Package, Users, Truck].map((Icon, index) => (
              <div
                key={index}
                className="bg-white/20 p-3 rounded-full splash-fade-in"
                style={{ animationDelay: `${0.8 + index * 0.1}s` }}
              >
                <Icon className="h-6 w-6" />
              </div>
            ))}
          </div>
        </div>

        <div className="h-1 bg-white/30 rounded-full overflow-hidden mx-auto w-64">
          <div 
            className="h-full bg-white rounded-full splash-progress"
          />
        </div>
      </div>
    </div>
  );
};