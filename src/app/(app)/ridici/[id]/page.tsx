"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

interface Vehicle {
  id: string;
  spz: string;
  name: string;
  active: boolean;
}

export default function EditRidicPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", code: "", note: "", active: true });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [newVehicle, setNewVehicle] = useState({ spz: "", name: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`/api/ridici/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({ firstName: d.firstName, lastName: d.lastName, phone: d.phone || "", code: d.code, note: d.note || "", active: d.active });
        setVehicles((d.vehicles || []).map((v: any) => ({ id: v.id, spz: v.spz, name: v.name || "", active: v.active })));
        setLoading(false);
      });
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleAddVehicle = async () => {
    if (!newVehicle.spz.trim()) { toast.error("Zadejte SPZ"); return; }
    const res = await fetch(`/api/ridici/${params.id}/vozidla`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVehicle),
    });
    if (res.ok) {
      const v = await res.json();
      setVehicles([...vehicles, { id: v.id, spz: v.spz, name: v.name || "", active: true }]);
      setNewVehicle({ spz: "", name: "" });
      toast.success("Vozidlo přidáno");
    }
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    const res = await fetch(`/api/ridici/${params.id}/vozidla?vehicleId=${vehicleId}`, { method: "DELETE" });
    if (res.ok) {
      setVehicles(vehicles.filter((v) => v.id !== vehicleId));
      toast.success("Vozidlo odebráno");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/ridici/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Řidič uložen");
      router.push("/ridici");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Upravit řidiče" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Jméno" name="firstName" value={form.firstName} onChange={handleChange} required />
        <FormField label="Příjmení" name="lastName" value={form.lastName} onChange={handleChange} required />
        <FormField label="Kód (PIN)" name="code" value={form.code} onChange={handleChange} required />
        <FormField label="Telefon" name="phone" value={form.phone} onChange={handleChange} />
        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
          <label htmlFor="active" className="text-sm text-gray-700">Aktivní</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/ridici")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zpět
          </button>
        </div>
      </form>

      {/* Vozidla */}
      <div className="max-w-2xl mt-6 bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Vozidla</h3>

        {vehicles.length > 0 ? (
          <div className="space-y-2 mb-4">
            {vehicles.map((v) => (
              <div key={v.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                <div>
                  <span className="font-medium text-gray-900">{v.spz}</span>
                  {v.name && <span className="text-gray-500 ml-2">({v.name})</span>}
                </div>
                <button
                  onClick={() => handleRemoveVehicle(v.id)}
                  className="text-red-500 hover:text-red-700 text-sm font-medium"
                >
                  Odebrat
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm mb-4">Žádná vozidla</p>
        )}

        <div className="flex gap-2">
          <input
            value={newVehicle.spz}
            onChange={(e) => setNewVehicle({ ...newVehicle, spz: e.target.value })}
            placeholder="SPZ"
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase"
          />
          <input
            value={newVehicle.name}
            onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
            placeholder="Název / typ (volitelně)"
            className="flex-1 px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button
            type="button"
            onClick={handleAddVehicle}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
          >
            Přidat
          </button>
        </div>
      </div>
    </>
  );
}
