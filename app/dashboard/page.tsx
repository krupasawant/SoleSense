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

  // Fetch stock data (sum of stock grouped by product name)
  const fetchStock = async () => {
    const { data, error } = await supabase
      .from("product_variants")
      .select("stock, product_id, products(name)");

    if (error) {
      console.error("Error fetching stock data:", error.message);
      return;
    }

    const stockMap: Record<string, number> = {};
    (data || []).forEach((v) => {
      const name = (v as any).products?.name || "Unknown";
      stockMap[name] = (stockMap[name] || 0) + (v as any).stock;
    });

    const stock = Object.entries(stockMap).map(([product_name, total_stock]) => ({
      product_name,
      total_stock,
    }));

    setStockData(stock);
  };

  // Fetch product categories and count
  const fetchCategories = async () => {
    const { data, error } = await supabase.from("products").select("category");

    if (error) {
      console.error("Error fetching categories:", error.message);
      return;
    }

    const categoryMap: Record<string, number> = {};
    data?.forEach((p) => {
      const category = p.category || "Uncategorized";
      categoryMap[category] = (categoryMap[category] || 0) + 1;
    });

    const categories = Object.entries(categoryMap).map(([category, count]) => ({
      category,
      count,
    }));

    setCategoryData(categories);
  };

  // Fetch order statuses and count
  const fetchOrderStatus = async () => {
    const { data, error } = await supabase.from("orders").select("status");

    if (error) {
      console.error("Error fetching order statuses:", error.message);
      return;
    }

    const statusMap: Record<string, number> = {};
    data?.forEach((order) => {
      const status = order.status || "unknown";
      statusMap[status] = (statusMap[status] || 0) + 1;
    });

    const statuses = Object.entries(statusMap).map(([status, count]) => ({
      status,
      count,
    }));

    setStatusData(statuses);
  };

  // Fetch top selling products based on order items
  const fetchTopProducts = async () => {
    const { data, error } = await supabase
      .from("order_items")
      .select("quantity, product_variants(product_id, products(name))");

    if (error) {
      console.error("Error fetching top products:", error.message);
      return;
    }

    const productMap: Record<string, number> = {};
    (data || []).forEach((item: any) => {
      const name = item.product_variants?.products?.name || "Unknown";
      productMap[name] = (productMap[name] || 0) + item.quantity;
    });

    const top = Object.entries(productMap)
      .map(([product_name, quantity]) => ({ product_name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    setTopProducts(top);
  };

  useEffect(() => {
    fetchStock();
    fetchCategories();
    fetchOrderStatus();
    fetchTopProducts();
  }, []);

return (
  <div className="flex flex-col md:ml-48 p-4">
    {/* Stock per Product */}
    <Card>
      <CardHeader>
        <CardTitle>Stock per Product</CardTitle>
      </CardHeader>
      <CardContent className="w-full overflow-x-auto">
        <ResponsiveContainer width="100%" height={Math.min(stockData.length * 45, 400)}>
          <BarChart
            data={stockData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
          >
            <XAxis type="number" />
            <YAxis
              type="category"
              dataKey="product_name"
              tick={{ fontSize: 12 }}
              width={Math.min(170, window.innerWidth / 3)}
            />
            <Tooltip />
            <Bar dataKey="total_stock" fill="#e60076" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>

    {/* 3 charts grid: category, status, top selling */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Product Category Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Product Category Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                dataKey="count"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cat-${index}`} fill={PINK_SHADES[index % PINK_SHADES.length]} />
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
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {statusData.map((entry, index) => (
                  <Cell key={`stat-${index}`} fill={PINK_SHADES[index % PINK_SHADES.length]} />
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
        <CardContent className="w-full overflow-x-auto">
          <ResponsiveContainer width="100%" height={Math.min(topProducts.length * 45, 400)}>
            <BarChart
              data={topProducts}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 80, bottom: 20 }}
            >
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="product_name"
                tickFormatter={shortenName}
                width={Math.min(150, window.innerWidth / 3)}
              />
              <Tooltip
                formatter={(value: number, name, props) => [value, props.payload.product_name]}
              />
              <Bar dataKey="quantity" fill="#e60076" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  </div>
);
}