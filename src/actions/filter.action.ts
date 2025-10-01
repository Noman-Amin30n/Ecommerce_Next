"use server";
import { cookies } from "next/headers";
import { revalidateTag } from "next/cache";

export async function setSortByCookie(sortBy: string) {
    const cookieStore = await cookies();
    cookieStore.set("sortBy", sortBy, { path: "/shop", sameSite: "lax" });
    revalidateTag("getProducts");
}

export async function setItemsPerPageCookie(itemsPerPage: number) {
    const cookieStore = await cookies();
    cookieStore.set("itemsPerPage", itemsPerPage.toString(), { path: "/shop", sameSite: "lax" });
}

export async function setMaxPriceFilterCookie(maxPrice: number) {
    const cookieStore = await cookies();
    cookieStore.set("maxPrice", maxPrice.toString(), { path: "/shop", sameSite: "lax" });
}

export async function setProductsLayoutCookie(layout: string) {
    const cookieStore = await cookies();
    cookieStore.set("productsLayout", layout, { path: "/shop", sameSite: "lax" });
}

export async function setPageCookie(page: number) {
    const cookieStore = await cookies();
    cookieStore.set("page", page.toString(), { path: "/shop", sameSite: "lax" });
}

export async function setTotalProductsCookie(totalProducts: number) {
    const cookieStore = await cookies();
    cookieStore.set("totalProducts", totalProducts.toString(), { path: "/shop", sameSite: "lax" });
}