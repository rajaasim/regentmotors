import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Staff sign in",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className="grid min-h-[70vh] place-items-center px-6 py-10 sm:py-14">
      <div className="w-full max-w-md rounded-2xl border border-border bg-surface p-7 shadow-2xl sm:p-9">
        <p className="eyebrow">Staff administration</p>
        <h1 className="mt-4 font-serif text-4xl font-medium text-white">
          Sign in securely
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          Authorized Regent Motors staff only. Customer accounts are not available.
        </p>
        <LoginForm />
      </div>
    </section>
  );
}
