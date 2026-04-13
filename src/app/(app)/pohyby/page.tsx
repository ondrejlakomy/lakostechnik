"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

interface Movement {
  id: string;
  type: string;
  date: string;
  quantity: number;
  unit: string;
  note: string | null;
  location: { name: string } | null;
  sourceWarehouse: { name: string; code: string } | null;
  targetWarehouse: { name: string; code: string } | null;
  chipper: { name: string } | null;
  createdBy: { firstName: string; lastName: string } | null;
}

interface SelectOption { value: string; label: string }

const TYPE_LABELS: Record<string, string> = {
  VYROBA: "Výroba",
  PRIJEM: "Příjem",
  VYDEJ: "Výdej",
  PRESUN: "Přesun",
  ODVOZ: "Odvoz",
};

const TYPE_COLORS: Record<string, string> = {
  VYROBA: "bg-blue-100 text-blue-800",
  PRIJEM: "bg-green-100 text-green-800",
  VYDEJ: "bg-orange-100 text-orange-800",
  PRESUN: "bg-purple-100 text-purple-800",
  ODVOZ: "bg-red-100 text-red-800",
};

export default function PohybyPage() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const [chippers, setChippers] = useState<SelectOption[]>([]);

  const [form, setForm] = useState({
    type: "VYROBA",
    date: new Date().toISOString().split("T")[0],
    quantity: "",
    unit: "t",
    locationId: "",
    sourceWarehouseId: "",
    targetWarehouseId: "",
    chipperId: "",
    note: "",
  });

  const fetchData = async () => {
    const res = await fetch("/api/pohyby");
    if (res.ok) setMovements(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    Promise.all([
      fetch("/api/sklady").then((r) => r.json()),
      fetch("/api/lokace").then((r) => r.json()),
      fetch("/api/stepkovace").then((r) => r.json()),
    ]).then(([wh, loc, ch]) => {
      setWarehouses(wh.filter((w: any) => w.active).map((w: any) => ({ value: w.id, label: `${w.code} – ${w.name}` })));
      setLocations(loc.filter((l: any) => l.active).map((l: any) => ({ value: l.id, label: l.name })));
      setChippers(ch.filter((c: any) => c.active).map((c: any) => ({ value: c.id, label: c.name })));
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/pohyby", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Pohyb zaznamenán");
      setShowForm(false);
      setForm({ type: "VYROBA", date: new Date().toISOString().split("T")[0], quantity: "", unit: "t", locationId: "", sourceWarehouseId: "", targetWarehouseId: "", chipperId: "", note: "" });
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Pohyby materiálu" description="Evidence toku biomasy" />

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-4 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
      >
        {showForm ? "Zavřít formulář" : "+ Nový pohyb"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Typ pohybu"
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              options={Object.entries(TYPE_LABELS).map(([v, l]) => ({ value: v, label: l }))}
            />
            <FormField label="Datum" name="date" type="date" value={form.date} onChange={handleChange} required />
            <FormField label="Množství" name="quantity" type="number" value={form.quantity} onChange={handleChange} required step="0.01" min="0" />
            <FormField label="Jednotka" name="unit" value={form.unit} onChange={handleChange} options={[
              { value: "t", label: "t" },
              { value: "PRM", label: "PRM" },
              { value: "m3", label: "m³" },
            ]} />
            <FormField label="Lokace" name="locationId" value={form.locationId} onChange={handleChange} options={locations} />
            <FormField label="Štěpkovač" name="chipperId" value={form.chipperId} onChange={handleChange} options={chippers} />
            <FormField label="Zdrojový sklad" name="sourceWarehouseId" value={form.sourceWarehouseId} onChange={handleChange} options={warehouses} />
            <FormField label="Cílový sklad" name="targetWarehouseId" value={form.targetWarehouseId} onChange={handleChange} options={warehouses} />
          </div>
          <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Zaznamenat pohyb"}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-500">Načítání...</p>
      ) : movements.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">Žádné pohyby</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Typ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Datum</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Množství</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ze skladu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Do skladu</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Lokace</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Štěpkovač</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Poznámka</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[m.type] || ""}`}>
                        {TYPE_LABELS[m.type] || m.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{new Date(m.date).toLocaleDateString("cs-CZ")}</td>
                    <td className="px-4 py-3 text-sm text-right font-medium">{m.quantity} {m.unit}</td>
                    <td className="px-4 py-3 text-sm">{m.sourceWarehouse ? `${m.sourceWarehouse.code}` : "–"}</td>
                    <td className="px-4 py-3 text-sm">{m.targetWarehouse ? `${m.targetWarehouse.code}` : "–"}</td>
                    <td className="px-4 py-3 text-sm">{m.location?.name || "–"}</td>
                    <td className="px-4 py-3 text-sm">{m.chipper?.name || "–"}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{m.note || "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
