"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

export default function EditLokacePage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ name: "", code: "", address: "", gps: "", note: "", active: true });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/lokace/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({ name: d.name, code: d.code, address: d.address || "", gps: d.gps || "", note: d.note || "", active: d.active });
        setLoading(false);
      });
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/lokace/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Lokace uložena");
      router.push("/lokace");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Upravit lokaci" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Název" name="name" value={form.name} onChange={handleChange} required />
        <FormField label="Kód" name="code" value={form.code} onChange={handleChange} required />
        <FormField label="Adresa / obec" name="address" value={form.address} onChange={handleChange} />
        <FormField label="GPS" name="gps" value={form.gps} onChange={handleChange} />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
          <label htmlFor="active" className="text-sm text-gray-700">Aktivní</label>
        </div>
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
