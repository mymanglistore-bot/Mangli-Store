"use client";

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Redirects from the legacy uppercase /Adminpanel to the lowercase /adminpanel
 */
export default function RedirectToAdminPanel() {
  useEffect(() => {
    redirect('/adminpanel');
  }, []);

  return null;
}
