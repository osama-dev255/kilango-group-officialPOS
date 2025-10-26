import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export const DashboardCard = ({ 
  title, 
  description, 
  icon: Icon, 
  onClick, 
  className 
}: DashboardCardProps) => {
  const handleClick = () => {
    console.log("DashboardCard clicked:", title);
    onClick();
  };
  
  return (
    <Card 
      className={cn(
        "cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] group btn-touch h-full flex flex-col dashboard-card p-1.5 sm:p-2",
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-0.5 flex-shrink-0 px-0 pt-0">
        <div className="dashboard-card-header">
          <div className="flex items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0 dashboard-card-icon">
            <Icon className="text-primary flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
          </div>
          <div className="min-w-0 flex-grow">
            <CardTitle className="text-[0.65rem] xs:text-xs sm:text-sm md:text-base truncate font-medium card-title">{title}</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow pt-0.5 px-0 dashboard-card-content">
        <p className="text-[0.55rem] xs:text-[0.65rem] sm:text-xs text-muted-foreground leading-tight card-description truncate-multiline">{description}</p>
      </CardContent>
    </Card>
  );
};