
"use client";

import { notFound } from 'next/navigation';

export default function LegacyAdminPage() {
  // Return a 404 for the old admin route to remove the "Admin" word/path from public view
  return notFound();
}
