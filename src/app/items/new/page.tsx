"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemSchema, type ItemInput } from "@/lib/validations";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/auth-provider";
import { useCreateItem } from "@/hooks/use-items";
import { createSlug } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { ImageUpload } from "@/components/items/image-upload";
import { PageLoading } from "@/components/ui/loading";
import { Plus } from "lucide-react";
import type { Category } from "@/types";

export default function NewItemPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const createItem = useCreateItem();
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ItemInput>({
    resolver: zodResolver(itemSchema),
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("categories").select("*");
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  if (loading) return <PageLoading />;
  if (!user) {
    router.push("/auth/login");
    return null;
  }

  const onSubmit = async (data: ItemInput) => {
    setError(null);

    if (images.length === 0) {
      setError("Please upload at least one image");
      return;
    }

    try {
      const slug = createSlug(data.title);
      await createItem.mutateAsync({
        ...data,
        slug,
        images,
        owner_id: user.id,
      });
      router.push(`/items/${slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create listing");
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">List a New Item</h1>
      <p className="mt-2 text-gray-500">
        Share your items with your community and earn money
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <Input
          id="title"
          label="Title"
          placeholder="e.g. Canon EOS R5 Camera"
          error={errors.title?.message}
          {...register("title")}
        />

        <Textarea
          id="description"
          label="Description"
          placeholder="Describe your item, its condition, and what's included..."
          error={errors.description?.message}
          {...register("description")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select
            id="category_id"
            label="Category"
            placeholder="Select a category"
            options={categories.map((c) => ({
              value: c.id,
              label: c.name,
            }))}
            error={errors.category_id?.message}
            {...register("category_id")}
          />

          <Input
            id="price_per_day"
            label="Price per day (EUR)"
            type="number"
            step="0.01"
            placeholder="25.00"
            error={errors.price_per_day?.message}
            {...register("price_per_day")}
          />
        </div>

        <Input
          id="city"
          label="City"
          placeholder="e.g. Brussels"
          error={errors.city?.message}
          {...register("city")}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="latitude"
            label="Latitude"
            type="number"
            step="any"
            placeholder="50.8503"
            error={errors.latitude?.message}
            {...register("latitude")}
          />
          <Input
            id="longitude"
            label="Longitude"
            type="number"
            step="any"
            placeholder="4.3517"
            error={errors.longitude?.message}
            {...register("longitude")}
          />
        </div>

        <ImageUpload images={images} onChange={setImages} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={isSubmitting || createItem.isPending}
        >
          <Plus size={18} className="mr-2" />
          {isSubmitting ? "Creating..." : "Create Listing"}
        </Button>
      </form>
    </div>
  );
}
