"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AddProduct } from "@/components/dashboard/AddProduct";
import { EditProduct } from "@/components/dashboard/EditProduct";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    stock: number;
    is_active: boolean;
    image_url: string;
};



export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);


    async function fetchProducts() {
        const { data, error } = await supabase.from("products").select("*");
        if (error) console.error("Fetch error:", error);
        else setProducts(data);
    }

    useEffect(() => {
        fetchProducts();
    }, []);

    async function handleDelete(productId: string) {
  const confirmed = confirm("Are you sure you want to delete this product?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);

  if (error) {
    console.error("Delete error:", error.message);
    alert("Failed to delete product.");
  } else {
    fetchProducts(); // refresh list after deletion
  }
}


    async function updateStock(id: string, delta: number) {
        const product = products.find((p) => p.id === id);
        if (!product) return;

        const newStock = product.stock + delta;
        const { error } = await supabase
            .from("products")
            .update({ stock: newStock })
            .eq("id", id);

        if (!error) {
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === id ? { ...p, stock: newStock } : p
                )
            );
        }
    }

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Products</h1>

                <AddProduct onProductAdded={() => fetchProducts()} />
            </div>
            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <img
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell className="flex items-center gap-4">
                                    <Button size="sm" className="bg-pink-600 text-white hover:bg-pink-400 p-3 m-2" onClick={() => updateStock(product.id, -1)}>-</Button>
                                    <div className="m-3">{product.stock}</div>
                                    <Button size="sm" className="bg-pink-600 text-white hover:bg-pink-400 p-3 m-2" onClick={() => updateStock(product.id, 1)}>+</Button>
                                </TableCell>
                                <TableCell>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${product.is_active ? 'bg-green-600' : 'bg-gray-400'}`}>
                                        {product.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <EditProduct product={product} onUpdated={fetchProducts} />
                                        <Button
                                            variant="ghost"
                                            className="text-red-500 hover:bg-red-100"
                                            onClick={() => handleDelete(product.id)}>
                                        Delete
                                    </Button>
                                </div>


                            </TableCell>
            </TableRow>
          ))}
                </TableBody>
            </Table>
        </div>
    </div >
  );
}
