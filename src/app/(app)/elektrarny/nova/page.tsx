"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

export default function NovaElektrarnaPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", address: "", contactPerson: "", phone: "", email: "", note: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/elektrarny", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Elektrárna vytvořena");
      router.push("/elektrarny");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Nová elektrárna" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Název" name="name" value={form.name} onChange={handleChange} required placeholder="Název elektrárny" />
        <FormField label="Adresa" name="address" value={form.address} onChange={handleChange} placeholder="Adresa elektrárny" />
        <FormField label="Kontaktní osoba" name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Jméno kontaktní osoby" />
        <FormField label="Telefon" name="phone" value={form.phone} onChange={handleChange} placeholder="Telefonní číslo" />
        <FormField label="E-mail" name="email" value={form.email} onChange={handleChange} placeholder="E-mailová adresa" />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/elektrarny")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zrušit
          </button>
        </div>
      </form>
    </>
  );
}
