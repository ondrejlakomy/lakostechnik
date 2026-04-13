"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

export default function NovyOdberatelPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", ico: "", address: "", contactPerson: "", phone: "", email: "", note: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/odberatele", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Odběratel vytvořen");
      router.push("/odberatele");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Nový odběratel" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Název" name="name" value={form.name} onChange={handleChange} required placeholder="Název odběratele" />
        <FormField label="IČO" name="ico" value={form.ico} onChange={handleChange} placeholder="IČO" />
        <FormField label="Adresa" name="address" value={form.address} onChange={handleChange} placeholder="Adresa" />
        <FormField label="Kontaktní osoba" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Jméno kontaktní osoby" />
        <FormField label="Telefon" name="phone" value={form.phone} onChange={handleChange} placeholder="Telefon" />
        <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} placeholder="E-mail" />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/odberatele")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zrušit
          </button>
        </div>
      </form>
    </>
  );
}
