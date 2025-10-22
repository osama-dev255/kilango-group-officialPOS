import { createSale, Sale } from "@/services/databaseService";

// Function to create sample transactions for testing
export const createSampleTransactions = async () => {
  try {
    // Sample transaction data
    const sampleTransactions: Omit<Sale, 'id'>[] = [
      {
        customer_id: null,
        user_id: null,
        invoice_number: "INV-001",
        sale_date: new Date().toISOString(),
        subtotal: 150.00,
        discount_amount: 15.00,
        tax_amount: 13.50,
        total_amount: 148.50,
        amount_paid: 150.00,
        change_amount: 1.50,
        payment_method: "cash",
        payment_status: "paid",
        sale_status: "completed",
        notes: "Sample transaction for testing",
        reference_number: null
      },
      {
        customer_id: null,
        user_id: null,
        invoice_number: "INV-002",
        sale_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        subtotal: 89.99,
        discount_amount: 0,
        tax_amount: 8.10,
        total_amount: 98.09,
        amount_paid: 100.00,
        change_amount: 1.91,
        payment_method: "card",
        payment_status: "paid",
        sale_status: "completed",
        notes: "Card payment",
        reference_number: null
      },
      {
        customer_id: null,
        user_id: null,
        invoice_number: "INV-003",
        sale_date: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        subtotal: 250.00,
        discount_amount: 25.00,
        tax_amount: 22.50,
        total_amount: 247.50,
        amount_paid: 247.50,
        change_amount: 0,
        payment_method: "cash",
        payment_status: "paid",
        sale_status: "completed",
        notes: "Customer used exact amount",
        reference_number: null
      }
    ];

    // Create each sample transaction
    const createdTransactions = [];
    for (const transaction of sampleTransactions) {
      const created = await createSale(transaction);
      if (created) {
        createdTransactions.push(created);
      }
    }

    console.log(`Created ${createdTransactions.length} sample transactions`);
    return createdTransactions;
  } catch (error) {
    console.error("Error creating sample transactions:", error);
    throw error;
  }
};