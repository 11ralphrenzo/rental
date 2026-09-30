"use server";

import { revalidatePath } from "next/cache";

export async function refreshRenterData(id: string) {
  revalidatePath(`/r/${id}`);
}
