export type Category = {
  name: string;
  color?: string;
};

export type Income = {
  amount: number;
  categories?: Category;
};

export type Expense = {
  amount: number;
  categories?: Category;
};