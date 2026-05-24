"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const ShippingAddressSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  line1: z.string().min(5, "Address is required"),
  line2: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().optional(),
  postalCode: z.string().min(2, "Postal code is required"),
  country: z.string().min(2, "Country is required"),
  phone: z.string().min(5, "Phone number is required"),
});

export type ShippingAddressFormValues = z.infer<typeof ShippingAddressSchema>;

interface CheckoutFormProps {
  onSubmit: (data: ShippingAddressFormValues) => void;
  isSubmitting: boolean;
}

export function CheckoutForm({ onSubmit, isSubmitting }: CheckoutFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShippingAddressFormValues>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: {
      fullName: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      phone: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 rounded-xl border shadow-sm">
      <h2 className="text-xl font-semibold border-b pb-4">Shipping Address</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" {...register("fullName")} placeholder="John Doe" />
          {errors.fullName && <p className="text-sm text-red-500">{errors.fullName.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="line1">Address Line 1</Label>
          <Input id="line1" {...register("line1")} placeholder="123 Main St" />
          {errors.line1 && <p className="text-sm text-red-500">{errors.line1.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="line2">Address Line 2 (Optional)</Label>
          <Input id="line2" {...register("line2")} placeholder="Apt 4B" />
          {errors.line2 && <p className="text-sm text-red-500">{errors.line2.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" {...register("city")} placeholder="New York" />
            {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State / Province (Optional)</Label>
            <Input id="state" {...register("state")} placeholder="NY" />
            {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" {...register("postalCode")} placeholder="10001" />
            {errors.postalCode && <p className="text-sm text-red-500">{errors.postalCode.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" {...register("country")} placeholder="United States" />
            {errors.country && <p className="text-sm text-red-500">{errors.country.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <Input id="phone" {...register("phone")} placeholder="+1 (555) 000-0000" />
          {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
        </div>
      </div>

      <div className="pt-4 border-t mt-6">
        <h3 className="font-medium text-lg mb-4">Payment Method</h3>
        <div className="p-4 border rounded-lg bg-gray-50 flex items-center gap-3">
          <div className="w-4 h-4 rounded-full border-4 border-primary bg-white flex-shrink-0" />
          <span>Cash on Delivery (COD)</span>
        </div>
        <p className="text-sm text-gray-500 mt-2 ml-1">You will pay when your order is delivered.</p>
      </div>

      <Button type="submit" className="w-full h-12 text-base mt-6" disabled={isSubmitting}>
        {isSubmitting ? "Placing Order..." : "Place Order"}
      </Button>
    </form>
  );
}
