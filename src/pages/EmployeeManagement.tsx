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

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "salesman" | "cashier" | "staff";
  status: "active" | "inactive";
  hireDate: string;
  lastLogin?: string;
  permissions: string[];
}

const roles = [
  { id: "admin", name: "Administrator", description: "Full access to all system features" },
  { id: "manager", name: "Manager", description: "Manage sales, inventory, and staff" },
  { id: "salesman", name: "Salesman", description: "Process sales and handle transactions" },
  { id: "cashier", name: "Cashier", description: "Process sales and handle transactions" },
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
    permissions: []
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
          role: (user.role as "admin" | "manager" | "salesman" | "cashier" | "staff") || 'staff',
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
    if (!newEmployee.name || !newEmployee.email) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
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
      // Transform Employee data to User format
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

      const createdUser = await createUser(userData);
      
      if (createdUser) {
        // Transform created user back to Employee format
        const employee: Employee = {
          id: createdUser.id || '',
          name: `${createdUser.first_name || ''} ${createdUser.last_name || ''}`.trim() || 'Unknown',
          email: createdUser.email || '',
          role: (createdUser.role as "admin" | "manager" | "salesman" | "cashier" | "staff") || 'staff',
          status: createdUser.is_active ? "active" : "inactive",
          hireDate: createdUser.created_at ? new Date(createdUser.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
          permissions: []
        };

        setEmployees([...employees, employee]);
        resetForm();
        setIsDialogOpen(false);
        
        toast({
          title: "Success",
          description: "Employee added successfully"
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
          role: (updatedUser.role as "admin" | "manager" | "salesman" | "cashier" | "staff") || 'staff',
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
      permissions: []
    });
    setEditingEmployee(null);
  };

  const openEditDialog = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    resetForm();
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

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : roleId;
  };

  const filteredEmployees = employees.filter(employee => 
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getRoleName(employee.role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate summary statistics
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => emp.status === "active").length;
  const adminEmployees = employees.filter(emp => emp.role === "admin").length;

  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Employee Management" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold">Employees</h2>
            <p className="text-muted-foreground">Manage your team members and permissions</p>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
                className="pl-8 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openAddDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Employee
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingEmployee ? "Edit Employee" : "Add New Employee"}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={editingEmployee ? editingEmployee.name : newEmployee.name}
                      onChange={(e) => 
                        editingEmployee 
                          ? setEditingEmployee({...editingEmployee, name: e.target.value}) 
                          : setNewEmployee({...newEmployee, name: e.target.value})
                      }
                    />
                  </div>
                  
                  <div className="grid gap-2">
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
                    />
                  </div>
                  
                  <div className="grid gap-2">
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
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.id}>
                            <div>
                              <div>{role.name}</div>
                              <div className="text-xs text-muted-foreground">{role.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
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
                  
                  <div className="grid gap-2">
                    <Label>Status</Label>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">Active</div>
                        <div className="text-sm text-muted-foreground">
                          {editingEmployee 
                            ? editingEmployee.status === "active" 
                              ? "Employee can log in" 
                              : "Employee cannot log in"
                            : newEmployee.status === "active"
                              ? "Employee can log in"
                              : "Employee cannot log in"
                          }
                        </div>
                      </div>
                      <Switch
                        checked={editingEmployee 
                          ? editingEmployee.status === "active" 
                          : newEmployee.status === "active"
                        }
                        onCheckedChange={(checked) => 
                          editingEmployee 
                            ? setEditingEmployee({
                                ...editingEmployee, 
                                status: checked ? "active" : "inactive"
                              }) 
                            : setNewEmployee({
                                ...newEmployee, 
                                status: checked ? "active" : "inactive"
                              })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label>Permissions</Label>
                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto">
                      {permissionsList.map(permission => (
                        <div 
                          key={permission} 
                          className="flex items-center justify-between py-2 border-b last:border-b-0"
                        >
                          <div className="text-sm">
                            {permission.split('_').map(word => 
                              word.charAt(0).toUpperCase() + word.slice(1)
                            ).join(' ')}
                          </div>
                          <Switch
                            checked={editingEmployee 
                              ? editingEmployee.permissions.includes(permission)
                              : newEmployee.permissions.includes(permission)
                            }
                            onCheckedChange={() => togglePermission(permission)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={editingEmployee ? handleUpdateEmployee : handleAddEmployee}>
                    {editingEmployee ? "Update" : "Add"} Employee
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEmployees}</div>
              <p className="text-xs text-muted-foreground">All team members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">{activeEmployees}</div>
              <p className="text-xs text-muted-foreground">Currently working</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Administrators</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{adminEmployees}</div>
              <p className="text-xs text-muted-foreground">System administrators</p>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading employees...
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Permissions</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No employees found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredEmployees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">{employee.name}</div>
                            <div className="text-sm text-muted-foreground">{employee.email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            {getRoleName(employee.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.status === "active" ? "default" : "destructive"}>
                            {employee.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{employee.hireDate}</TableCell>
                        <TableCell>{employee.lastLogin || "Never"}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {employee.permissions.length} perms
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => openEditDialog(employee)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(employee)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="destructive" 
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