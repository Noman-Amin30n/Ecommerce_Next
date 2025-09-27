"use server";
import { cookies } from "next/headers";

async function setCookie(name: string, value: string) {
  (await cookies()).set(name, value, {
    path: "/", // ✅ global by default (change if you want /shop only)
    httpOnly: false, // ✅ allow client-side reading if needed
    sameSite: "lax",
  });
}

export async function setSortByCookie(sortBy: string) {
  setCookie("sortBy", sortBy);
}

export async function setItemsPerPageCookie(itemsPerPage: number) {
  setCookie("itemsPerPage", itemsPerPage.toString());
}

export async function setMaxPriceFilterCookie(maxPrice: number) {
  setCookie("maxPrice", maxPrice.toString());
}

export async function setProductsLayoutCookie(layout: string) {
  setCookie("productsLayout", layout);
}

export async function setPageCookie(page: number) {
  setCookie("page", page.toString());
}

export async function setTotalProductsCookie(totalProducts: number) {
  setCookie("totalProducts", totalProducts.toString());
}