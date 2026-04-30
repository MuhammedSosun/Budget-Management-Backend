export interface TransactionRequest {
  title: string;
  input_details: {
    amount: number;
    currency: "TRY" | "USD" | "EUR";
  };
  type: "income" | "expense";
  category: string;
  date: Date;
  description?: string;
  userId: string;
}
