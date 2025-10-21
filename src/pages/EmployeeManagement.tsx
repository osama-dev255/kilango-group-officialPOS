import { useState } from "react";
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

interface Employee {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "cashier" | "staff";
  status: "active" | "inactive";
  hireDate: string;
  lastLogin?: string;
  permissions: string[];
}

const roles = [
  { id: "admin", name: "Administrator", description: "Full access to all system features" },
  { id: "manager", name: "Manager", description: "Manage sales, inventory, and staff" },
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
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: "1",
      name: "John Admin",
      email: "admin@pos.com",
      role: "admin",
      status: "active",
      hireDate: "2023-01-15",
      lastLogin: "2023-05-18 14:30",
      permissions: permissionsList
    },
    {
      id: "2",
      name: "Sarah Manager",
      email: "manager@pos.com",
      role: "manager",
      status: "active",
      hireDate: "2023-02-20",
      lastLogin: "2023-05-18 11:15",
      permissions: ["manage_products", "process_sales", "view_reports", "manage_customers", "manage_inventory"]
    },
    {
      id: "3",
      name: "Mike Cashier",
      email: "cashier@pos.com",
      role: "cashier",
      status: "active",
      hireDate: "2023-03-10",
      permissions: ["process_sales"]
    },
    {
      id: "4",
      name: "Lisa Staff",
      email: "staff@pos.com",
      role: "staff",
      status: "inactive",
      hireDate: "2023-04-05",
      permissions: ["process_sales"]
    }
  ]);
  
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

  const handleAddEmployee = () => {
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

    const employee: Employee = {
      ...newEmployee,
      id: Date.now().toString()
    };

    setEmployees([...employees, employee]);
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Employee added successfully"
    });
  };

  const handleUpdateEmployee = () => {
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

    setEmployees(employees.map(emp => emp.id === editingEmployee.id ? editingEmployee : emp));
    resetForm();
    setIsDialogOpen(false);
    
    toast({
      title: "Success",
      description: "Employee updated successfully"
    });
  };

  const handleDeleteEmployee = (id: string) => {
    // Prevent deleting the current user
    if (employees.find(emp => emp.id === id)?.email === username) {
      toast({
        title: "Error",
        description: "You cannot delete your own account",
        variant: "destructive"
      });
      return;
    }
    
    setEmployees(employees.filter(emp => emp.id !== id));
    toast({
      title: "Success",
      description: "Employee deleted successfully"
    });
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
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Employee Directory
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </main>
    </div>
  );
};