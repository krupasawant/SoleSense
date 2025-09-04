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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export function EditProduct({
  product,
  onUpdated,
  isAdmin,
}: {
  product: any;
  onUpdated: () => void;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ ...product });

  const [variants, setVariants] = useState([
    { size: "6", stock: "0" },
    { size: "7", stock: "0" },
    { size: "8", stock: "0" },
  ]);

  useEffect(() => {
    if (open) {
      setForm({ ...product });

      // Fetch variants for this product when dialog opens
      (async () => {
        const { data, error } = await supabase
          .from("product_variants")
          .select("size, stock")
          .eq("product_id", product.id);

        if (!error && data) {
          // Map existing stock values to fixed sizes
          const updated = ["6", "7", "8"].map((size) => {
            const match = data.find((v) => v.size === size);
            return { size, stock: match ? String(match.stock) : "0" };
          });
          setVariants(updated);
        }
      })();
    }
  }, [open, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleVariantChange = (index: number, value: string) => {
    const updated = [...variants];
    updated[index].stock = value;
    setVariants(updated);
  };

  const handleSubmit = async () => {
    if (!isAdmin) {
  alert("Only admin users can add products. This is just a demo.");
  return;
}
    setLoading(true);

    // 1. Update product
    const { error: productError } = await supabase
      .from("products")
      .update({
        name: form.name.trim(),
        price: parseFloat(form.price),
        category: form.category ? form.category.trim() : null,
        image_url: form.image_url ? form.image_url.trim() : null,
        is_active: form.is_active ?? true,
      })
      .eq("id", product.id);

    if (productError) {
      console.error("Product update error:", productError);
      setLoading(false);
      return;
    }

    // 2. Upsert product_variants
    const variantUpdates = variants.map((v) => ({
      product_id: product.id,
      size: v.size,
      stock: parseInt(v.stock),
    }));

    const { error: variantError } = await supabase
      .from("product_variants")
      .upsert(variantUpdates, { onConflict: "product_id,size" });

    if (variantError) {
      console.error("Variant update error:", variantError);
      setLoading(false);
      return;
    }

    setLoading(false);
    onUpdated();
    setOpen(false); // Close dialog
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-sm text-[#e60076] border-[#e60076] hover:bg-[#fce6ef]"
        >
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
            <Label className="text-[#e60076]">Category</Label>
            <Input name="category" value={form.category || ""} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-[#e60076]">Image URL</Label>
            <Input name="image_url" value={form.image_url || ""} onChange={handleChange} />
          </div>

          <div>
            <Label className="text-[#e60076]">Stock by Size</Label>
            <div className="space-y-2 mt-2">
              {variants.map((v, index) => (
                <div key={v.size} className="flex items-center gap-2">
                  <span className="w-8 font-semibold">{v.size}</span>
                  <Input
                    type="number"
                    value={v.stock}
                    onChange={(e) => handleVariantChange(index, e.target.value)}
                  />
                </div>
              ))}
            </div>
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
          <Button onClick={handleSubmit} disabled={loading} className="bg-[#fb8f4b] text-white">
            {loading ? "Updating..." : "Update Product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
