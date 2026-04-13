"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

interface LocationOption {
  id: string;
  name: string;
}

export default function NovySkladPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", code: "", type: "SKLAD", locationId: "", address: "", unit: "PRM", note: "" });
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/lokace")
      .then((r) => r.json())
      .then((d) => setLocations(d));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/sklady", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Sklad vytvořen");
      router.push("/sklady");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Nový sklad" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Název" name="name" value={form.name} onChange={handleChange} required placeholder="Název skladu" />
        <FormField label="Kód" name="code" value={form.code} onChange={handleChange} required placeholder="Např. SKL01" />
        <FormField label="Typ" name="type" value={form.type} onChange={handleChange} options={[
          { value: "MEZISKLAD", label: "Mezisklad" },
          { value: "SKLAD", label: "Sklad" },
          { value: "JINY", label: "Jiný" },
        ]} />
        <FormField label="Lokace" name="locationId" value={form.locationId} onChange={handleChange} options={[
          { value: "", label: "– Bez lokace –" },
          ...locations.map((l) => ({ value: l.id, label: l.name })),
        ]} />
        <FormField label="Adresa" name="address" value={form.address} onChange={handleChange} placeholder="Adresa skladu" />
        <FormField label="Jednotka" name="unit" value={form.unit} onChange={handleChange} options={[
          { value: "t", label: "t (tuny)" },
          { value: "PRM", label: "PRM" },
          { value: "m3", label: "m3" },
        ]} />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/sklady")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zrušit
          </button>
        </div>
      </form>
    </>
  );
}
