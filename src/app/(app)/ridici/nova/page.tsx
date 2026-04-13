"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

export default function NovyRidicPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", code: "", defaultSpz: "", note: "" });
  const [saving, setSaving] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/ridici", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Řidič vytvořen");
      router.push("/ridici");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Nový řidič" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Jméno" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Křestní jméno" />
        <FormField label="Příjmení" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Příjmení" />
        <FormField label="Kód" name="code" value={form.code} onChange={handleChange} required placeholder="Např. RID01" />
        <FormField label="Telefon" name="phone" value={form.phone} onChange={handleChange} placeholder="Volitelně" />
        <FormField label="Výchozí SPZ" name="defaultSpz" value={form.defaultSpz} onChange={handleChange} placeholder="Volitelně" />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/ridici")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zrušit
          </button>
        </div>
      </form>
    </>
  );
}
