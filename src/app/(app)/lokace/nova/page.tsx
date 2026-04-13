"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

export default function NovaLokacePage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", code: "", address: "", gps: "", note: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/lokace", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Lokace vytvořena");
      router.push("/lokace");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Nová lokace" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Název" name="name" value={form.name} onChange={handleChange} required placeholder="Název lokace" />
        <FormField label="Kód" name="code" value={form.code} onChange={handleChange} required placeholder="Např. LOK01" />
        <FormField label="Adresa / obec" name="address" value={form.address} onChange={handleChange} placeholder="Adresa" />
        <FormField label="GPS" name="gps" value={form.gps} onChange={handleChange} placeholder="Volitelně" />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/lokace")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zrušit
          </button>
        </div>
      </form>
    </>
  );
}
