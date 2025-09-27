"use server";
import { cookies } from "next/headers";

export async function setSortByCookie(sortBy: string) {
    const cookieStore = await cookies();
    cookieStore.set("sortBy", sortBy, { path: "/shop" });
}

export async function setItemsPerPageCookie(itemsPerPage: number) {
    const cookieStore = await cookies();
    cookieStore.set("itemsPerPage", itemsPerPage.toString(), { path: "/shop" });
}

export async function setMaxPriceFilterCookie(maxPrice: number) {
    const cookieStore = await cookies();
    cookieStore.set("maxPrice", maxPrice.toString(), { path: "/shop" });
}

export async function setProductsLayoutCookie(layout: string) {
    const cookieStore = await cookies();
    cookieStore.set("productsLayout", layout, { path: "/shop" });
}

export async function setPageCookie(page: number) {
    const cookieStore = await cookies();
    cookieStore.set("page", page.toString(), { path: "/shop" });
}

export async function setTotalProductsCookie(totalProducts: number) {
    const cookieStore = await cookies();
    cookieStore.set("totalProducts", totalProducts.toString(), { path: "/shop" });
}