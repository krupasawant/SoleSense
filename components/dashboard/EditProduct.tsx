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

// --- Types ---
import type { Database } from "@/types/supabase";

export type ProductVariant = {
  id: string;
  product_id: string;
  size: string;
  stock: number;
};

export type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
  is_active: boolean;
  image_url: string;
  variants: ProductVariant[];
  totalStock: number;
};

type ProductVariantFromDB = {
  id: string;
  size: string | null;
  stock: number | null;
};

// Define the correct types for the update payload
type ProductsUpdate = Database['public']['Tables']['products']['Update'];
type ProductVariantsUpdate = Database['public']['Tables']['product_variants']['Update'];

// --- Component ---
export function EditProduct({
  product,
  onUpdated,
  isAdmin,
}: {
  product: Product;
  onUpdated: () => void;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(product);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    if (open) {
      setForm(product);
      setMessage(null);

      (async () => {
        const { data, error } = await supabase
          .from("product_variants")
          .select("id, size, stock")
          .eq("product_id", product.id);

        if (!error && data) {
          const typedData = data as ProductVariantFromDB[] | null;

          if (typedData) {
            const updated = ["6", "7", "8"].map((size) => {
              const match = typedData.find((v) => v.size === size);
              return {
                product_id: product.id,
                id: match?.id ?? '',
                size,
                stock: match?.stock ?? 0
              };
            });
            setVariants(updated);
          }
        }
      })();
    }
  }, [open, product]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleVariantChange = (index: number, value: string) => {
    const parsedValue = parseInt(value, 10);
    const newStock = isNaN(parsedValue) ? 0 : parsedValue;

    const updated = variants.map((v, i) =>
      i === index ? { ...v, stock: newStock } : v
    );
    setVariants(updated);
  };

// Define a new type for the upsert payload
// It uses the base `ProductVariantsUpdate` but forces product_id and size to be required
type VariantUpsertPayload = Omit<ProductVariantsUpdate, 'product_id' | 'size'> & {
    product_id: string;
    size: string;
};


const handleSubmit = async () => {
    if (!isAdmin) {
      setMessage({ text: "Only admin users can edit products. This is just a demo.", type: "error" });
      return;
    }

    const price = Number(form.price);
    if (isNaN(price)) {
      setMessage({ text: "Price must be a valid number.", type: "error" });
      return;
    }

    setLoading(true);

    const updatePayload: ProductsUpdate = {
      name: form.name.trim(),
      price: price,
      category: form.category ? form.category.trim() : null,
      image_url: form.image_url ? form.image_url.trim() : null,
      is_active: form.is_active,
    };

    const { error: productError } = await supabase
      .from("products")
      .update(updatePayload)
      .eq("id", product.id);

    if (productError) {
      console.error("Product update error:", productError);
      setMessage({ text: "Failed to update product.", type: "error" });
      setLoading(false);
      return;
    }

    // Map to the new, stricter type to satisfy upsert
    const variantUpdates: VariantUpsertPayload[] = variants.map((v) => ({
      product_id: v.product_id,
      size: v.size,
      stock: v.stock,
    }));

    const { error: variantError } = await supabase
      .from("product_variants")
      .upsert(variantUpdates, { onConflict: "product_id,size" });

    if (variantError) {
      console.error("Variant update error:", variantError);
      setMessage({ text: "Failed to update product variants.", type: "error" });
      setLoading(false);
      return;
    }

    setLoading(false);
    setMessage({ text: "Product updated successfully!", type: "success" });
    onUpdated();
    setOpen(false);
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
          {message && (
            <div
              className={`p-2 rounded text-sm ${
                message.type === "error" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
              }`}
            >
              {message.text}
            </div>
          )}

          <div>
            <Label className="text-[#e60076]">Name *</Label>
            <Input name="name" value={form.name} onChange={handleChange} />
          </div>
          <div>
            <Label className="text-[#e60076]">Price *</Label>
            <Input name="price" type="number" value={form.price} onChange={handleChange} />
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