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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function AddProduct({ onProductAdded }: { onProductAdded: () => void }) {
    const [form, setForm] = useState({
        name: "",
        price: "",
        category: "",
        image_url: "",
        stock: "",
        is_active: true,
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async () => {
        setLoading(true);
        const { error, data } = await supabase.from("products").insert({
            name: form.name.trim(),
            price: parseFloat(form.price),
            stock: parseInt(form.stock),
            category: form.category.trim() || null,
            image_url: form.image_url.trim() || null,
            is_active: form.is_active ?? true,
        });


        setLoading(false);
        if (!error) {
            onProductAdded();
            setForm({
                name: "",
                price: "",
                category: "",
                image_url: "",
                stock: "",
                is_active: true,
            });
        } else {
            console.error(error);
        }
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="bg-[#fb8f4b] text-white hover:bg-[#e67a38]">
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
                        <Label>Stock</Label>
                        <Input name="stock" value={form.stock} onChange={handleChange} />
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
                    <Button onClick={handleSubmit} disabled={loading}>
                        {loading ? "Adding..." : "Add Product"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
