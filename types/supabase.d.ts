export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: number;
          name: string;
          category?: string | null;
        };
        Insert: { name: string; category?: string | null };
        Update: { name?: string; category?: string | null };
      };
      product_variants: {
        Row: {
          id: number;
          product_id: number;
          stock: number;
          products?: { name: string } | null;
        };
        Insert: { product_id: number; stock: number };
        Update: { product_id?: number; stock?: number };
      };
      orders: {
        Row: { id: number; status: string };
        Insert: { status: string };
        Update: { status?: string };
      };
      order_items: {
        Row: {
          id: number;
          quantity: number;
          product_variants?: { products?: { name: string } | null };
        };
        Insert: { quantity: number; product_variants?: { products?: { name: string } | null } };
        Update: { quantity?: number; product_variants?: { products?: { name: string } | null } };
      };
    };
    Views: {};
    Functions: {};
  };
};
