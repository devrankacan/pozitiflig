"use server";

import { redirect } from "next/navigation";
import { requireAdmin, destroyAdminSession } from "@/lib/admin-auth";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/announcements";

export async function createAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;
  await createAnnouncement(title, body);
}

export async function updateAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!id || !title || !body) return;
  await updateAnnouncement(id, title, body);
}

export async function deleteAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await deleteAnnouncement(id);
}

export async function logoutAction() {
  await destroyAdminSession();
  redirect("/admin/login");
}
