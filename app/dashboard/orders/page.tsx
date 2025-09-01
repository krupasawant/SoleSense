"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import React from "react";

type Order = {
  id: string;
  user_id: string;
  total_amount: number;
  status: string;
  created_at: string;
  shipping_address: string;
  order_items?: {
    product_id: string;
    quantity: number;
    price: number;
  }[];
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        id,
        user_id,
        total_amount,
        status,
        created_at,
        shipping_address,
        order_items (
          product_id,
          quantity,
          price
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch orders:", error.message);
    } else {
      setOrders(data as unknown as Order[]);
    }
  }

  const toggleExpand = (orderId: string) => {
    setExpanded((prev) => (prev === orderId ? null : orderId));
  };

  const paginatedOrders = orders.slice(
    (currentPage - 1) * ordersPerPage,
    currentPage * ordersPerPage
  );

  const totalPages = Math.ceil(orders.length / ordersPerPage);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold mb-4">Orders</h1>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-100">
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Shipping</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {paginatedOrders.map((order) => (
              <React.Fragment key={order.id}>
                <TableRow>
                  <TableCell className="font-mono text-xs">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="text-xs font-mono">
                    {order.user_id.slice(0, 8)}...
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                  <TableCell>₹{order.total_amount}</TableCell>
                  <TableCell>
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {order.shipping_address}
                  </TableCell>
                  <TableCell>
                    {order.order_items?.length ? (
                      <Button
                        variant="outline"
                        onClick={() => toggleExpand(order.id)}
                      >
                        {expanded === order.id ? "Hide Items" : "View Items"}
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>

                {expanded === order.id && (
                  <TableRow className="bg-gray-50">
                    <TableCell colSpan={7}>
                      <div className="p-4 space-y-2">
                        <h3 className="font-semibold mb-2">Order Items:</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Product ID</TableHead>
                              <TableHead>Qty</TableHead>
                              <TableHead>Price</TableHead>
                              <TableHead>Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.order_items?.map((item, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{item.product_id}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>₹{item.price}</TableCell>
                                <TableCell>
                                  ₹{item.price * item.quantity}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex justify-end gap-4 mt-4">
        <Button
          variant="outline"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
