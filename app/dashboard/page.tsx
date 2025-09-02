"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
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

type StockData = { product_name: string; total_stock: number };
type CategoryData = { category: string; count: number };
type StatusData = { status: string; count: number };
type TopProductData = { product_name: string; quantity: number };

const PINK_SHADES = ["#e60076", "#ff2d95", "#ff66b3", "#ff99c2", "#ffcce0", "#ffe6f0"];
const shortenName = (name: string) => (name.length > 20 ? name.slice(0, 17) + "…" : name);

export default function DashboardCharts() {
  const [stockData, setStockData] = useState<StockData[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductData[]>([]);

  useEffect(() => {
    // Stock per product
    const fetchStock = async () => {
      const { data, error } = await supabase
        .from("product_variants")
        .select("stock, product_id, products(name)")
        .order("product_id", { ascending: true });
      if (error) return console.error(error.message);

      const stockMap: Record<string, number> = {};
      data?.forEach((v) => {
        const name = v.products.name;
        stockMap[name] = (stockMap[name] || 0) + v.stock;
      });
      setStockData(Object.entries(stockMap).map(([product_name, total_stock]) => ({ product_name, total_stock })));
    };

    // Product category distribution
    const fetchCategories = async () => {
      const { data, error } = await supabase.from("products").select("category");
      if (error) return console.error(error.message);

      const categoryMap: Record<string, number> = {};
      data?.forEach((p) => (categoryMap[p.category] = (categoryMap[p.category] || 0) + 1));
      setCategoryData(Object.entries(categoryMap).map(([category, count]) => ({ category, count })));
    };

    // Order status distribution
    const fetchOrderStatus = async () => {
      const { data, error } = await supabase.from("orders").select("status");
      if (error) return console.error(error.message);

      const counts: Record<string, number> = {};
      data?.forEach((o) => (counts[o.status] = (counts[o.status] || 0) + 1));
      setStatusData(Object.entries(counts).map(([status, count]) => ({ status, count })));
    };

    // Top selling products
    const fetchTopProducts = async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("quantity, product_variants(product_id, products(name))");
      if (error) return console.error(error.message);

      const productMap: Record<string, number> = {};
      data?.forEach((item) => {
        const name = item.product_variants.products.name;
        productMap[name] = (productMap[name] || 0) + item.quantity;
      });

      const sorted = Object.entries(productMap)
        .map(([product_name, quantity]) => ({ product_name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10); // top 10
      setTopProducts(sorted);
    };

    fetchStock();
    fetchCategories();
    fetchOrderStatus();
    fetchTopProducts();
  }, []);

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Stock per Product */}
      <Card>
        <CardHeader>
          <CardTitle>Stock per Product</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={stockData.length * 45}>
            <BarChart data={stockData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="product_name" tick={{ fontSize: 11, dx: -5 }} width={140} />
              <Tooltip />
              <Bar dataKey="total_stock" fill="#e60076" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Product Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Product Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={420}>
            <PieChart>
              <Pie data={categoryData} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={100} label>
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PINK_SHADES[index % PINK_SHADES.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Order Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Order Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie data={statusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label>
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PINK_SHADES[index % PINK_SHADES.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={topProducts.length * 45}>
            <BarChart data={topProducts} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis type="number" />
              <YAxis type="category" dataKey="product_name" tickFormatter={shortenName} width={150} />
              <Tooltip formatter={(value: number, name, props) => [value, props.payload.product_name]} />
              <Bar dataKey="quantity" fill="#e60076" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
