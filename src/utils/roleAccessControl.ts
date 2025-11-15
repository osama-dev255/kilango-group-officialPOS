import { getCurrentUserRole } from "@/utils/salesPermissionUtils";

// Define role-based access control
export type UserRole = "admin" | "manager" | "cashier" | "staff";

// Define which roles can access which modules
export const moduleAccessRules: Record<string, UserRole[]> = {
  // Sales modules - accessible by all roles
  "sales": ["admin", "manager", "cashier", "staff"],
  "sales-cart": ["admin", "manager", "cashier", "staff"],
  "sales-orders": ["admin", "manager", "cashier", "staff"],
  "test-sales-orders": ["admin", "manager", "cashier", "staff"],
  
  // Inventory modules - restricted to admin and manager
  "inventory": ["admin", "manager"],
  "products": ["admin", "manager"],
  
  // Purchase modules - restricted to admin and manager
  "purchase": ["admin", "manager"],
  "purchase-orders": ["admin", "manager"],
  "purchase-terminal": ["admin", "manager"],
  "purchase-transactions": ["admin", "manager"],
  "purchase-reports": ["admin", "manager"],
  
  // Finance modules - restricted to admin and manager
  "finance": ["admin", "manager"],
  "transactions": ["admin", "manager"],
  "financial-reports": ["admin", "manager"],
  "financial-statements": ["admin", "manager"],
  "income-statement": ["admin", "manager"],
  "statements-reports": ["admin", "manager"],
  "expenses": ["admin", "manager"],
  
  // Customer modules - accessible by all roles
  "customers": ["admin", "manager", "cashier", "staff"],
  "customer-settlements": ["admin", "manager"],
  
  // Supplier modules - restricted to admin and manager
  "suppliers": ["admin", "manager"],
  "supplier-settlements": ["admin", "manager"],
  
  // Returns and damages - restricted to admin and manager
  "returns": ["admin", "manager"],
  "debts": ["admin", "manager"],
  
  // Discount management - restricted to admin and manager
  "discounts": ["admin", "manager"],
  
  // Audit modules - restricted to admin and manager
  "audit": ["admin", "manager"],
  
  // Reports and analytics - restricted to admin and manager
  "reports": ["admin", "manager"],
  "analytics": ["admin", "manager"],
  "sales-analytics": ["admin", "manager"],
  "spending-analytics": ["admin", "manager"],
  
  // Employee management - restricted to admin only
  "employees": ["admin"],
  
  // Access logs - restricted to admin only
  "access-logs": ["admin"],
  
  // Settings - restricted to admin only
  "settings": ["admin"],
  
  // Scanner - accessible by all roles
  "scanner": ["admin", "manager", "cashier", "staff"],
  
  // Automated dashboard - restricted to admin and manager
  "automated": ["admin", "manager"],
  
  // Comprehensive dashboard - accessible by admin and manager
  "comprehensive": ["admin", "manager"],
};

// Check if a user role can access a specific module
export const canAccessModule = async (module: string): Promise<boolean> => {
  try {
    const userRole = await getCurrentUserRole();
    
    if (!userRole) {
      return false;
    }
    
    // If module is not defined in access rules, deny access by default
    if (!moduleAccessRules[module]) {
      return false;
    }
    
    // Check if user's role is in the allowed roles for this module
    return moduleAccessRules[module].includes(userRole as UserRole);
  } catch (error) {
    console.error("Error checking module access:", error);
    return false;
  }
};

// Get accessible modules for a user role
export const getAccessibleModules = async (): Promise<string[]> => {
  try {
    const userRole = await getCurrentUserRole();
    
    if (!userRole) {
      return [];
    }
    
    const accessibleModules: string[] = [];
    
    for (const [module, allowedRoles] of Object.entries(moduleAccessRules)) {
      if (allowedRoles.includes(userRole as UserRole)) {
        accessibleModules.push(module);
      }
    }
    
    return accessibleModules;
  } catch (error) {
    console.error("Error getting accessible modules:", error);
    return [];
  }
};