import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut, User } from "lucide-react";

interface NavigationProps {
  title: string;
  onBack?: () => void;
  onLogout: () => void;
  username?: string;
}

export const Navigation = ({ title, onBack, onLogout, username }: NavigationProps) => {
  return (
    <header className="border-b bg-card">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-2 sm:space-x-4">
          {onBack && (
            <Button variant="ghost" size="sm" onClick={onBack} className="px-2 sm:px-4">
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          )}
          <h1 className="text-lg sm:text-xl font-semibold truncate max-w-[150px] sm:max-w-none">{title}</h1>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-4">
          {username && (
            <div className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm text-muted-foreground">
              <User className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden md:inline">{username}</span>
              <span className="md:hidden max-w-[80px] truncate">{username}</span>
            </div>
          )}
          <Button variant="outline" size="sm" onClick={onLogout} className="px-2 sm:px-4">
            <LogOut className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  );
};