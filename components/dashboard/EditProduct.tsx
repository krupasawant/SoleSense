"use client";

import { useState, useEffect } from "react";
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

export function EditProduct({
  product,
  onUpdated,
}: {
  product: any;
  onUpdated: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ ...product });

  useEffect(() => {
    if (open) {
      setForm({ ...product });
    }
  }, [open, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const { error } = await supabase
      .from("products")
      .update({
        name: form.name.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        category: form.category ? form.category.trim() : null,
        image_url: form.image_url ? form.image_url.trim() : null,
        is_active: form.is_active ?? true,
      })
      .eq("id", product.id);

    if (!error) {
      onUpdated();
      setOpen(false);
    } else {
      console.error("Update error:", error.message || error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="text-sm text-[#e60076] border-[#e60076] hover:bg-[#fce6ef]">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div>
            <Label className="text-[#e60076]">Name *</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-[#e60076]">Price *</Label>
            <Input name="price" value={form.price} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-[#e60076]">Stock *</Label>
            <Input name="stock" value={form.stock} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-[#e60076]">Category</Label>
            <Input name="category" value={form.category || ""} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-[#e60076]">Image URL</Label>
            <Input name="image_url" value={form.image_url || ""} onChange={handleChange} />
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
          <Button onClick={handleSubmit} className="bg-[#fb8f4b] text-white">
            Update Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
