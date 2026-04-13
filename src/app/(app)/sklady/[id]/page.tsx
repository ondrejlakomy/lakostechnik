"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

interface LocationOption {
  id: string;
  name: string;
}

export default function EditSkladPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ name: "", code: "", type: "SKLAD", locationId: "", address: "", unit: "t", note: "", active: true });
  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/sklady/${params.id}`).then((r) => r.json()),
      fetch("/api/lokace").then((r) => r.json()),
    ]).then(([warehouse, locs]) => {
      setForm({
        name: warehouse.name,
        code: warehouse.code,
        type: warehouse.type,
        locationId: warehouse.locationId || "",
        address: warehouse.address || "",
        unit: warehouse.unit || "t",
        note: warehouse.note || "",
        active: warehouse.active,
      });
      setLocations(locs);
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
    const res = await fetch(`/api/sklady/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Sklad uložen");
      router.push("/sklady");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Upravit sklad" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Název" name="name" value={form.name} onChange={handleChange} required />
        <FormField label="Kód" name="code" value={form.code} onChange={handleChange} required />
        <FormField label="Typ" name="type" value={form.type} onChange={handleChange} options={[
          { value: "MEZISKLAD", label: "Mezisklad" },
          { value: "SKLAD", label: "Sklad" },
          { value: "JINY", label: "Jiný" },
        ]} />
        <FormField label="Lokace" name="locationId" value={form.locationId} onChange={handleChange} options={[
          { value: "", label: "– Bez lokace –" },
          ...locations.map((l) => ({ value: l.id, label: l.name })),
        ]} />
        <FormField label="Adresa" name="address" value={form.address} onChange={handleChange} />
        <FormField label="Jednotka" name="unit" value={form.unit} onChange={handleChange} options={[
          { value: "t", label: "t (tuny)" },
          { value: "PRM", label: "PRM" },
          { value: "m3", label: "m3" },
        ]} />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
          <label htmlFor="active" className="text-sm text-gray-700">Aktivní</label>
        </div>
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
