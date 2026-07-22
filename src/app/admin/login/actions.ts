"use server";

import { redirect } from "next/navigation";
import { verifyPassword, createAdminSession } from "@/lib/admin-auth";

export async function login(formData: FormData) {
  const password = String(formData.get("password") ?? "");

  if (!verifyPassword(password)) {
    redirect("/admin/login?error=1");
  }

  await createAdminSession();
  redirect("/admin");
}
