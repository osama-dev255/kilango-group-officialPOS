import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessModule } from "@/utils/roleAccessControl";
import { useToast } from "@/hooks/use-toast";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredModule: string;
}

export const ProtectedRoute = ({ children, requiredModule }: ProtectedRouteProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const access = await canAccessModule(requiredModule);
        setHasAccess(access);
        
        if (!access) {
          toast({
            title: "Access Denied",
            description: "You don't have permission to access this page.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking access:", error);
        toast({
          title: "Error",
          description: "Failed to check access permissions.",
          variant: "destructive",
        });
        navigate("/");
      } finally {
        setIsChecking(false);
      }
    };

    checkAccess();
  }, [user, requiredModule, navigate, toast]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return hasAccess ? <>{children}</> : null;
};