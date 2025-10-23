import { useState, useEffect } from "react";
import { getSales, getCustomers } from "@/services/databaseService";

export const TestDataDisplay = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const salesData = await getSales();
        const customersData = await getCustomers();
        
        setSales(salesData);
        setCustomers(customersData);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return <div>Loading data...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Sales Data</h1>
      <pre>{JSON.stringify(sales, null, 2)}</pre>
      
      <h1>Customers Data</h1>
      <pre>{JSON.stringify(customers, null, 2)}</pre>
    </div>
  );
};