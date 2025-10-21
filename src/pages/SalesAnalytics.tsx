import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  Wallet, 
  ShoppingCart, 
  Users, 
  CreditCard,
  Activity
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { formatCurrency } from "@/lib/currency";

const salesData = [
  { name: 'Mon', sales: 4000, transactions: 24 },
  { name: 'Tue', sales: 3000, transactions: 13 },
  { name: 'Wed', sales: 2000, transactions: 18 },
  { name: 'Thu', sales: 2780, transactions: 12 },
  { name: 'Fri', sales: 1890, transactions: 19 },
  { name: 'Sat', sales: 2390, transactions: 38 },
  { name: 'Sun', sales: 3490, transactions: 43 },
];

const paymentData = [
  { name: 'Cash', value: 45, color: '#3b82f6' },
  { name: 'Credit Card', value: 35, color: '#10b981' },
  { name: 'Debit Card', value: 15, color: '#8b5cf6' },
  { name: 'Other', value: 5, color: '#f59e0b' },
];

export const SalesAnalytics = ({ username, onBack, onLogout }: { username: string; onBack: () => void; onLogout: () => void }) => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation 
        title="Sales Analytics" 
        onBack={onBack}
        onLogout={onLogout} 
        username={username}
      />
      
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Sales Analytics</h2>
          <p className="text-muted-foreground">Track your business performance and key metrics</p>
        </div>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(24231.89)}</div>
              <p className="text-xs text-muted-foreground">+12.5% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Transactions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+1,243</div>
              <p className="text-xs text-muted-foreground">+8.2% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(19.50)}</div>
              <p className="text-xs text-muted-foreground">+2.1% from last week</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+573</div>
              <p className="text-xs text-muted-foreground">+3.7% from last week</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Weekly Sales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="sales" fill="#3b82f6" name="Sales ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { id: 1, customer: "John Smith", amount: 129.99, time: "2 minutes ago", status: "completed" },
                { id: 2, customer: "Sarah Johnson", amount: 89.50, time: "15 minutes ago", status: "completed" },
                { id: 3, customer: "Mike Williams", amount: 245.75, time: "1 hour ago", status: "completed" },
                { id: 4, customer: "Emily Davis", amount: 67.25, time: "2 hours ago", status: "refunded" },
                { id: 5, customer: "Robert Brown", amount: 199.99, time: "3 hours ago", status: "completed" },
              ].map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{activity.customer}</div>
                    <div className="text-sm text-muted-foreground">{activity.time}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="font-medium">{formatCurrency(activity.amount)}</div>
                    <Badge 
                      variant={
                        activity.status === "completed" ? "default" : 
                        activity.status === "refunded" ? "destructive" : "outline"
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};