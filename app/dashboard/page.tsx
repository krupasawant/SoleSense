"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// --- Types ---
type StockData = { product_name: string; total_stock: number };
type CategoryData = { category: string; count: number };
type StatusData = { status: string; count: number };
type TopProductData = { product_name: string; quantity: number };

// --- Colors & helpers ---
const PINK_SHADES = ["#e60076", "#ff2d95", "#ff66b3", "#ff99c2", "#ffcce0", "#ffe6f0"];
const shortenName = (name: string) => (name.length > 20 ? name.slice(0, 17) + "…" : name);

// --- Fetch functions ---

const fetchStock = async (): Promise<StockData[]> => {
  const { data, error } = await supabase
    .from("product_variants")
    .select("stock, products(name)");

  if (error) {
    console.error(error.message);
    return [];
  }

  const stockMap: Record<string, number> = {};
  data?.forEach((v) => {
    const name = v.products?.name ?? "Unknown";
    stockMap[name] = (stockMap[name] || 0) + v.stock;
  });

  return Object.entries(stockMap).map(([product_name, total_stock]) => ({ product_name, total_stock }));
};

const fetchCategories = async (): Promise<CategoryData[]> => {
  const { data, error } = await supabase
    .from("products")
    .select("category");

  if (error) {
    console.error(error.message);
    return [];
  }

  const categoryMap: Record<string, number> = {};
  data?.forEach((p) => {
    const category = p.category ?? "Uncategorized";
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  return Object.entries(categoryMap).map(([category, count]) => ({ category, count }));
};

const fetchOrderStatus = async (): Promise<StatusData[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("status");

  if (error) {
    console.error(error.message);
    return [];
  }

  const statusMap: Record<string, number> = {};
  data?.forEach((o) => {
    statusMap[o.status] = (statusMap[o.status] || 0) + 1;
  });

  return Object.entries(statusMap).map(([status, count]) => ({ status, count }));
};

const fetchTopProducts = async (): Promise<TopProductData[]> => {
  const { data, error } = await supabase
    .from("order_items")
    .select("quantity, product_variants(products(name))");

  if (error) {
    console.error(error.message);
    return [];
  }

  const productMap: Record<string, number> = {};
  data?.forEach((item) => {
    const name = item.product_variants?.products?.name ?? "Unknown";
    productMap[name] = (productMap[name] || 0) + item.quantity;
  });

  return Object.entries(productMap)
    .map(([product_name, quantity]) => ({ product_name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);
};

// --- Component ---
export default function DashboardCharts() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);

  useEffect(() => {
    const fetchAll = async () => {
      const [stock, categories, status, topProducts] = await Promise.all([
        fetchStock(),
        fetchCategories(),
        fetchOrderStatus(),
        fetchTopProducts(),
      ]);

      setStockData(stock);
      setCategoryData(categories);
      setStatusData(status);
      setTopProducts(topProducts);
    };
    fetchAll();
  }, []);

  return (
    <div className="flex flex-col md:ml-48 p-4">
      {/* Stock per Product */}
      <Card>
        <CardHeader><CardTitle>Stock per Product</CardTitle></CardHeader>
        <CardContent className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={Math.min(stockData.length * 45, 400)}>
            <BarChart data={stockData} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="product_name" tick={{ fontSize: 12 }} width={Math.min(170, window.innerWidth / 3)} />
              <Tooltip />
              <Bar dataKey="total_stock" fill="#e60076" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 3 Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Categories */}
        <Card>
          <CardHeader><CardTitle>Product Category Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={categoryData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label>
                  {categoryData.map((entry, index) => <Cell key={index} fill={PINK_SHADES[index % PINK_SHADES.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardHeader><CardTitle>Order Status Distribution</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={80} label>
                  {statusData.map((entry, index) => <Cell key={index} fill={PINK_SHADES[index % PINK_SHADES.length]} />)}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader><CardTitle>Top Selling Products</CardTitle></CardHeader>
          <CardContent className="w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height={Math.min(topProducts.length * 45, 400)}>
              <BarChart data={topProducts} layout="vertical" margin={{ top: 20, right: 30, left: 80, bottom: 20 }}>
                <XAxis type="number" />
                <YAxis type="category" dataKey="product_name" tickFormatter={shortenName} width={Math.min(150, window.innerWidth / 3)} />
                <Tooltip formatter={(value: number, name, props) => [value, props.payload.product_name]} />
                <Bar dataKey="quantity" fill="#e60076" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
