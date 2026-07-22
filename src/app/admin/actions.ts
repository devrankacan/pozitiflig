"use server";

import { redirect } from "next/navigation";
import { requireAdmin, destroyAdminSession } from "@/lib/admin-auth";
import { createAnnouncement, updateAnnouncement, deleteAnnouncement } from "@/lib/announcements";

function extractImageFile(formData: FormData): File | null {
  const value = formData.get("image");
  return value instanceof File && value.size > 0 ? value : null;
}

export async function createAction(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!title || !body) return;
  await createAnnouncement(title, body, extractImageFile(formData));
}

export async function updateAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!id || !title || !body) return;
  const removeImage = formData.get("removeImage") === "on";
  await updateAnnouncement(id, title, body, {
    imageFile: extractImageFile(formData),
    removeImage,
  });
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
