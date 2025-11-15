import { useState, useEffect } from "react";
import { Navigation } from "@/components/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Search, Plus, Edit, Trash2, User, Shield, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getUsers, 
  getUserById, 
  createUser, 
  updateUser, 
  deleteUser 
} from "@/services/databaseService";
import { signUp, getCurrentUser } from "@/services/authService";

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "staff";
  status: "active" | "inactive";
  hireDate: string;
  lastLogin?: string;
  permissions: string[];
  password?: string;
}

const roles = [
  { id: "admin", name: "Administrator", description: "Full access to all system features" },
  { id: "manager", name: "Manager", description: "Manage sales, inventory, and staff" },
  { id: "cashier", name: "Cashier/Salesman", description: "Process sales and handle transactions" },
  { id: "staff", name: "Staff", description: "Limited access to basic functions" },
];

const permissionsList = [
  "manage_products",
  "process_sales",
  "view_reports",
  "manage_customers",
  "manage_employees",
  "manage_inventory",
  "view_financials",
  "refund_transactions",
  "manage_suppliers",
  "manage_expenses",
  "manage_discounts",
  "view_audit_logs"
];

export const EmployeeManagement = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [newEmployee, setNewEmployee] = useState<Omit<Employee, "id">>({
    name: "",
    email: "",
    role: "staff",
    status: "active",
    hireDate: new Date().toISOString().split('T')[0],
    permissions: [],
    password: ""
  });
  const { toast } = useToast();

  // Load employees from database
  useEffect(() => {
    const loadEmployees = async () => {
      try {
        setLoading(true);
        const userData = await getUsers();
        
        // Transform database user data to Employee format
        const employeeData: Employee[] = userData.map(user => ({
          id: user.id || '',
          name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
          email: user.email || '',
          role: (user.role as "admin" | "manager" | "cashier" | "staff") || 'staff',
          status: user.is_active ? "active" : "inactive",
          hireDate: user.created_at ? new Date(user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          // Note: Last login and permissions would need to be handled separately
          // This is a simplified implementation
          lastLogin: undefined,
          permissions: []
        }));
        
        setEmployees(employeeData);
      } catch (error) {
        console.error("Error loading employees:", error);
        toast({
          title: "Error",
          description: "Failed to load employees",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (!newEmployee.name || !newEmployee.email || !newEmployee.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if email already exists
    if (employees.some(emp => emp.email === newEmployee.email)) {
      toast({
        title: "Error",
        description: "An employee with this email already exists",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create user with password using signUp function
      const [firstName, ...lastNameParts] = newEmployee.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const userData = {
        username: newEmployee.email.split('@')[0],
        email: newEmployee.email,
        first_name: firstName,
        last_name: lastName,
        role: newEmployee.role,
        is_active: newEmployee.status === "active"
      };

      const signUpResult = await signUp(newEmployee.email, newEmployee.password, userData);
      
      if (signUpResult.error) {
        throw new Error(signUpResult.error.message);
      }

      // Check if email confirmation is required
      if (signUpResult.user && !signUpResult.user.confirmed_at) {
        toast({
          title: "Email Confirmation Required",
          description: "An email confirmation has been sent to the user. They must confirm their email before they can log in.",
          variant: "destructive"
        });
        // Still add the user to the list for display purposes
        const employee: Employee = {
          id: signUpResult.user.id || '',
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown',
          email: signUpResult.user.email || '',
          role: (userData.role as "admin" | "manager" | "cashier" | "staff") || 'staff',
          status: userData.is_active ? "active" : "inactive",
          hireDate: signUpResult.user.created_at ? new Date(signUpResult.user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          permissions: []
        };

        setEmployees([...employees, employee]);
        resetForm();
        setIsDialogOpen(false);
        return;
      }

      if (signUpResult.user) {
        // Transform created user back to Employee format
        const employee: Employee = {
          id: signUpResult.user.id || '',
          name: `${userData.first_name || ''} ${userData.last_name || ''}`.trim() || 'Unknown',
          email: signUpResult.user.email || '',
          role: (userData.role as "admin" | "manager" | "cashier" | "staff") || 'staff',
          status: userData.is_active ? "active" : "inactive",
          hireDate: signUpResult.user.created_at ? new Date(signUpResult.user.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          permissions: []
        };

        setEmployees([...employees, employee]);
        resetForm();
        setIsDialogOpen(false);
        
        toast({
          title: "Success",
          description: "Employee added successfully. If email confirmation is enabled, the user must confirm their email before logging in."
        });
      } else {
        throw new Error("Failed to create user");
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      toast({
        title: "Error",
        description: "Failed to add employee: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee || !editingEmployee.name || !editingEmployee.email) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    // Check if email already exists (excluding current employee)
    if (employees.some(emp => emp.email === editingEmployee.email && emp.id !== editingEmployee.id)) {
      toast({
        title: "Error",
        description: "An employee with this email already exists",
        variant: "destructive"
      });
      return;
    }

    try {
      // Transform Employee data to User format
      const [firstName, ...lastNameParts] = editingEmployee.name.split(' ');
      const lastName = lastNameParts.join(' ') || '';
      
      const userData = {
        username: editingEmployee.email.split('@')[0],
        email: editingEmployee.email,
        first_name: firstName,
        last_name: lastName,
        role: editingEmployee.role,
        is_active: editingEmployee.status === "active"
      };

      const updatedUser = await updateUser(editingEmployee.id, userData);
      
      if (updatedUser) {
        // Transform updated user back to Employee format
        const employee: Employee = {
          id: updatedUser.id || '',
          name: `${updatedUser.first_name || ''} ${updatedUser.last_name || ''}`.trim() || 'Unknown',
          email: updatedUser.email || '',
          role: (updatedUser.role as "admin" | "manager" | "cashier" | "staff") || 'staff',
          status: updatedUser.is_active ? "active" : "inactive",
          hireDate: updatedUser.created_at ? new Date(updatedUser.created_at).toISOString().split('T')[0] : editingEmployee.hireDate,
          permissions: editingEmployee.permissions
        };

        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? employee : emp));
        resetForm();
        setIsDialogOpen(false);
        
        toast({
          title: "Success",
          description: "Employee updated successfully"
        });
      } else {
        throw new Error("Failed to update user");
      }
    } catch (error) {
      console.error("Error updating employee:", error);
      toast({
        title: "Error",
        description: "Failed to update employee: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    // Prevent deleting the current user
    if (employees.find(emp => emp.id === id)?.email === username) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const result = await deleteUser(id);
      
      if (result) {
        setEmployees(employees.filter(emp => emp.id !== id));
        toast({
          title: "Success",
          description: "Employee deleted successfully"
        });
      } else {
        throw new Error("Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Error",
        description: "Failed to delete employee: " + (error as Error).message,
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setNewEmployee({
      name: "",
      email: "",
      role: "staff",
      status: "active",
      hireDate: new Date().toISOString().split('T')[0],
      permissions: [],
      password: ""
    });
    setEditingEmployee(null);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee({
      ...employee,
      password: ""
    });
    setIsDialogOpen(true);
  };

  const togglePermission = (permission: string) => {
    if (editingEmployee) {
      const updatedPermissions = editingEmployee.permissions.includes(permission)
        ? editingEmployee.permissions.filter(p => p !== permission)
        : [...editingEmployee.permissions, permission];
      
      setEditingEmployee({
        ...editingEmployee,
        permissions: updatedPermissions
      });
    } else {
      const updatedPermissions = newEmployee.permissions.includes(permission)
        ? newEmployee.permissions.filter(p => p !== permission)
        : [...newEmployee.permissions, permission];
      
      setNewEmployee({
        ...newEmployee,
        permissions: updatedPermissions
      });
    }
  };

  const filteredEmployees = employees.filter(employee =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const getRoleDescription = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.description : "";
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Employee Management" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Employee Management</h1>
            <p className="text-muted-foreground">Manage your team members and their permissions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8 w-full md:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? "Edit Employee" : "Add New Employee"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={editingEmployee ? editingEmployee.name : newEmployee.name}
                        onChange={(e) => 
                          editingEmployee 
                            ? setEditingEmployee({...editingEmployee, name: e.target.value})
                            : setNewEmployee({...newEmployee, name: e.target.value})
                        }
                        placeholder="Enter full name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={editingEmployee ? editingEmployee.email : newEmployee.email}
                        onChange={(e) => 
                          editingEmployee 
                            ? setEditingEmployee({...editingEmployee, email: e.target.value})
                            : setNewEmployee({...newEmployee, email: e.target.value})
                        }
                        placeholder="Enter email"
                        disabled={!!editingEmployee}
                      />
                    </div>
                  </div>
                  
                  {!editingEmployee && (
                    <div className="space-y-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input
                        id="password"
                        type="password"
                        value={newEmployee.password || ""}
                        onChange={(e) => setNewEmployee({...newEmployee, password: e.target.value})}
                        placeholder="Enter password"
                      />
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Select
                        value={editingEmployee ? editingEmployee.role : newEmployee.role}
                        onValueChange={(value: "admin" | "manager" | "cashier" | "staff") => 
                          editingEmployee 
                            ? setEditingEmployee({...editingEmployee, role: value})
                            : setNewEmployee({...newEmployee, role: value})
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {roles.map((role) => (
                            <SelectItem key={role.id} value={role.id}>
                              {role.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">
                        {getRoleDescription(editingEmployee ? editingEmployee.role : newEmployee.role)}
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="hireDate">Hire Date</Label>
                      <Input
                        id="hireDate"
                        type="date"
                        value={editingEmployee ? editingEmployee.hireDate : newEmployee.hireDate}
                        onChange={(e) => 
                          editingEmployee 
                            ? setEditingEmployee({...editingEmployee, hireDate: e.target.value})
                            : setNewEmployee({...newEmployee, hireDate: e.target.value})
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="status"
                        checked={editingEmployee 
                          ? editingEmployee.status === "active" 
                          : newEmployee.status === "active"
                        }
                        onCheckedChange={(checked) => 
                          editingEmployee 
                            ? setEditingEmployee({...editingEmployee, status: checked ? "active" : "inactive"})
                            : setNewEmployee({...newEmployee, status: checked ? "active" : "inactive"})
                        }
                      />
                      <Label htmlFor="status">
                        {editingEmployee 
                          ? editingEmployee.status === "active" ? "Active" : "Inactive"
                          : newEmployee.status === "active" ? "Active" : "Inactive"
                        }
                      </Label>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Permissions</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {permissionsList.map((permission) => (
                        <div key={permission} className="flex items-center space-x-2">
                          <Switch
                            id={permission}
                            checked={editingEmployee 
                              ? editingEmployee.permissions.includes(permission)
                              : newEmployee.permissions.includes(permission)
                            }
                            onCheckedChange={() => togglePermission(permission)}
                          />
                          <Label 
                            htmlFor={permission} 
                            className="text-sm font-normal capitalize"
                          >
                            {permission.replace(/_/g, ' ')}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}
                    disabled={loading}
                  >
                    {editingEmployee ? "Update" : "Add"} Employee
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Employee List</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>{employee.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getRoleName(employee.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.status === "active" ? "default" : "destructive"}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{employee.hireDate}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteEmployee(employee.id)}
                              disabled={employee.email === username}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <User className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-medium">No employees found</h3>
                        <p className="text-muted-foreground">
                          {searchTerm 
                            ? "No employees match your search criteria" 
                            : "Get started by adding a new employee"}
                        </p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};