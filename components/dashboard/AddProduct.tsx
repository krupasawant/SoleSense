"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase/client";
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function AddProduct({ onProductAdded, isAdmin, }: { onProductAdded: () => void, isAdmin: boolean; }) {
    const [form, setForm] = useState({
        name: "",
        description: "",
        price: "",
        category: "",
        image_url: "",
        is_active: true,
    });

    // Fixed sizes 6,7,8 with stock 0 by default
    const [variants, setVariants] = useState([
        { size: "6", stock: "0" },
        { size: "7", stock: "0" },
        { size: "8", stock: "0" },
    ]);

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleStockChange = (index: number, value: string) => {
        const newVariants = [...variants];
        newVariants[index].stock = value;
        setVariants(newVariants);
    };

    const handleSubmit = async () => {
        if (!isAdmin) {
            alert("Only admin users can add products. This is just a demo.");
            return;
        }
        setLoading(true);

        const variantsToInsert = variants
            .filter((v) => parseInt(v.stock) > 0)
            .map((v) => ({ ...v, stock: parseInt(v.stock) }));

        if (variantsToInsert.length === 0) {
            alert("Please add stock for at least one size!");
            setLoading(false);
            return;
        }

        const { data: product, error: productError } = await supabase
            .from("products")
            .insert({
                name: form.name.trim(),
                price: parseFloat(form.price),
                category: form.category.trim() || null,
                image_url: form.image_url.trim() || null,
                is_active: form.is_active ?? true,
            })
            .select()
            .single();

        if (productError || !product) {
            console.error(productError);
            setLoading(false);
            return;
        }

        const variantsData = variantsToInsert.map((v) => ({
            product_id: product.id,
            size: v.size,
            stock: v.stock,
        }));

        const { error: variantsError } = await supabase
            .from("product_variants")
            .insert(variantsData);

        setLoading(false);

        if (!variantsError) {
            onProductAdded();
            // Reset form and variants
            setForm({
                name: "",
                price: "",
                description: "",
                category: "",
                image_url: "",
                is_active: true,
            });
            setVariants([
                { size: "6", stock: "0" },
                { size: "7", stock: "0" },
                { size: "8", stock: "0" },
            ]);
        } else {
            console.error(variantsError);
        }
        // Close dialog
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-[#fb8f4b] text-white hover:bg-[#e67a38]" >
                    + Add Product
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div>
                        <Label>Name</Label>
                        <Input name="name" value={form.name} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Description</Label>
                        <Input
                            name="description" value={form.description} onChange={handleChange}
                        />
                    </div>

                    <div>
                        <Label>Price</Label>
                        <Input name="price" value={form.price} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Category</Label>
                        <Input name="category" value={form.category} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Image URL</Label>
                        <Input name="image_url" value={form.image_url} onChange={handleChange} />
                    </div>
                    <div>
                        <Label>Stock per Size</Label>
                        {variants.map((v, idx) => (
                            <div key={v.size} className="flex gap-2 mb-2 items-center">
                                <span className="w-8">{v.size}</span>
                                <Input
                                    placeholder="Stock"
                                    value={v.stock}
                                    onChange={(e) => handleStockChange(idx, e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Checkbox
                            checked={form.is_active}
                            onCheckedChange={(checked) =>
                                setForm({ ...form, is_active: !!checked })
                            }
                        />
                        <Label>Active</Label>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Adding..." : "Add Product"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
