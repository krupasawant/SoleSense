"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { AddProduct } from "@/components/dashboard/AddProduct";
import { EditProduct } from "@/components/dashboard/EditProduct";
import Image from "next/image"; 


import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

type ProductVariant = {
    id: string;
    product_id: string;
    size: string;
    stock: number;
};

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    is_active: boolean;
    image_url: string;
    variants: ProductVariant[];
    totalStock: number;
};

type ProductWithVariants = {
    id: string;
    name: string | null;
    price: number | null;
    category: string | null;
    is_active: boolean | null;
    image_url: string | null;
    product_variants: {
        id: string;
        size: string | null;
        stock: number | null;
    }[];
};


export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isAdmin] = useState(false);



    async function fetchProducts() {
        const { data, error } = await supabase.from("products").select(`
            id,
            name,
            price,
            category,
            is_active,
            image_url,
            product_variants(id, size, stock)
        `);

        if (error) return console.error("Fetch error:", error);

        setProducts(
            (data as ProductWithVariants[] || []).map(({ product_variants, ...rest }: any) => ({
                ...rest,
                variants: product_variants || [],
                totalStock: (product_variants || []).reduce(
                    (sum: number, v: any) => sum + v.stock,
                    0
                ),
            }))
        );
    }

    useEffect(() => {
        fetchProducts();
    }, []);



    async function handleDelete(productId: string) {
        if (!isAdmin) {
            alert("This is a demo. Only admin users can delete products.");
            return;
        }
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

    return (
        <div className="p-6 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Products</h1>
                <AddProduct onProductAdded={fetchProducts}  isAdmin={isAdmin}/>
            </div>

            <div className="overflow-hidden rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Total Stock</TableHead>
                            <TableHead>Sizes & Stock</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>
                                    <Image
                                        src={product.image_url}
                                        alt={product.name}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                </TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>₹{product.price.toFixed(2)}</TableCell>
                                <TableCell>{product.category}</TableCell>
                                <TableCell>{product.totalStock}</TableCell>
                                <TableCell>
                                    {product.variants.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {product.variants.map((variant) => (
                                                <span
                                                    key={variant.id}
                                                    className="px-2 py-1 bg-gray-100 rounded text-sm border"
                                                >
                                                    {variant.size}: {variant.stock}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-gray-400">No variants</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <span
                                        className={`px-2 py-1 rounded-full text-xs font-medium text-white ${product.is_active ? "bg-green-600" : "bg-gray-400"
                                            }`}
                                    >
                                        {product.is_active ? "Active" : "Inactive"}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <EditProduct product={product} onUpdated={fetchProducts}  isAdmin={isAdmin} />
                                        <Button
                                            variant="ghost"
                                            className="text-red-500 hover:bg-red-100"
                                            onClick={() => handleDelete(product.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}