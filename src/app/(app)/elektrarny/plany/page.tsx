"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import toast from "react-hot-toast";

interface SelectOption { value: string; label: string }

interface Plan {
  id: string;
  powerPlantId: string;
  powerPlant: { name: string };
  weekStart: string;
  targetPrm: number;
  unit: string;
  deliveredPrm: number;
  percentage: number;
  remaining: number;
  note: string | null;
}

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + diff);
  return date;
}

function formatWeek(dateStr: string): string {
  const d = new Date(dateStr);
  const friday = new Date(d);
  friday.setDate(friday.getDate() + 4);
  return `${d.toLocaleDateString("cs-CZ")} – ${friday.toLocaleDateString("cs-CZ")}`;
}

function getWeekOptions(): { value: string; label: string }[] {
  const options = [];
  const now = new Date();
  // Minulé 2 týdny + aktuální + příštích 4
  for (let i = -2; i <= 4; i++) {
    const monday = getMonday(now);
    monday.setDate(monday.getDate() + i * 7);
    const friday = new Date(monday);
    friday.setDate(friday.getDate() + 4);
    const label = `${monday.toLocaleDateString("cs-CZ")} – ${friday.toLocaleDateString("cs-CZ")}${i === 0 ? " (tento týden)" : ""}`;
    options.push({ value: monday.toISOString().split("T")[0], label });
  }
  return options;
}

export default function PlanyElektrarenPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [powerPlants, setPowerPlants] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    powerPlantId: "",
    weekStart: getMonday(new Date()).toISOString().split("T")[0],
    targetPrm: "",
    unit: "PRM",
    note: "",
  });

  const weekOptions = getWeekOptions();

  const fetchData = async () => {
    const [plansRes, ppRes] = await Promise.all([
      fetch("/api/elektrarny/plany"),
      fetch("/api/elektrarny"),
    ]);
    if (plansRes.ok) setPlans(await plansRes.json());
    if (ppRes.ok) {
      const pp = await ppRes.json();
      setPowerPlants(pp.filter((p: any) => p.active).map((p: any) => ({ value: p.id, label: p.name })));
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/elektrarny/plany", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Týdenní plán uložen");
      setShowForm(false);
      setForm({ ...form, targetPrm: "", note: "" });
      fetchData();
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  const getProgressColor = (pct: number) => {
    if (pct >= 100) return "bg-green-500";
    if (pct >= 70) return "bg-yellow-500";
    if (pct >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  const getStatusLabel = (pct: number) => {
    if (pct >= 100) return { text: "Splněno", cls: "text-green-700 bg-green-100" };
    if (pct >= 70) return { text: "Na dobré cestě", cls: "text-yellow-700 bg-yellow-100" };
    if (pct >= 40) return { text: "Pozor", cls: "text-orange-700 bg-orange-100" };
    return { text: "Kritické", cls: "text-red-700 bg-red-100" };
  };

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  // Seskupit plány podle týdne
  const currentMonday = getMonday(new Date()).toISOString().split("T")[0];

  const currentWeekPlans = plans.filter((p) => p.weekStart.startsWith(currentMonday));
  const otherPlans = plans.filter((p) => !p.weekStart.startsWith(currentMonday));

  return (
    <>
      <PageHeader title="Týdenní plány elektráren" description="Plánované a skutečné odvozy (Po–Pá)" />

      <button
        onClick={() => setShowForm(!showForm)}
        className="mb-6 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
      >
        {showForm ? "Zavřít formulář" : "+ Nastavit plán"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} className="max-w-xl bg-white rounded-xl border border-gray-200 p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Elektrárna <span className="text-red-500">*</span></label>
            <select name="powerPlantId" value={form.powerPlantId} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="">-- Vyberte --</option>
              {powerPlants.map((pp) => (
                <option key={pp.value} value={pp.value}>{pp.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Týden (Po–Pá) <span className="text-red-500">*</span></label>
            <select name="weekStart" value={form.weekStart} onChange={handleChange} required className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
              {weekOptions.map((w) => (
                <option key={w.value} value={w.value}>{w.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jednotka <span className="text-red-500">*</span></label>
            <select name="unit" value={form.unit} onChange={handleChange} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500">
              <option value="PRM">PRM</option>
              <option value="t">Tuny (t)</option>
              <option value="LKW">Počet aut (LKW)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cílová hodnota <span className="text-red-500">*</span></label>
            <input name="targetPrm" type="number" inputMode="decimal" value={form.targetPrm} onChange={handleChange} required step={form.unit === "LKW" ? "1" : "0.01"} min="0" placeholder={form.unit === "LKW" ? "Počet aut" : `Např. 500 ${form.unit}`} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poznámka</label>
            <textarea name="note" value={form.note} onChange={handleChange} rows={2} className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" />
          </div>
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit plán"}
          </button>
        </form>
      )}

      {/* Aktuální týden */}
      {currentWeekPlans.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tento týden ({formatWeek(currentMonday)})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentWeekPlans.map((plan) => {
              const status = getStatusLabel(plan.percentage);
              return (
                <div key={plan.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">{plan.powerPlant.name}</h3>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                      {status.text}
                    </span>
                  </div>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">{plan.unit === "LKW" ? plan.deliveredPrm : plan.deliveredPrm.toFixed(0)}</span>
                      <span className="text-gray-500 ml-1">/ {plan.unit === "LKW" ? plan.targetPrm : plan.targetPrm.toFixed(0)} {plan.unit}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-700">{plan.percentage} %</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
                    <div
                      className={`h-3 rounded-full transition-all ${getProgressColor(plan.percentage)}`}
                      style={{ width: `${Math.min(plan.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Zbývá: <span className="font-medium text-gray-700">{plan.unit === "LKW" ? plan.remaining : plan.remaining.toFixed(0)} {plan.unit}</span>
                  </p>
                  {plan.note && <p className="text-xs text-gray-400 mt-2">{plan.note}</p>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ostatní týdny */}
      {otherPlans.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Další týdny</h2>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Elektrárna</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Týden</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Jednotka</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Cíl</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Odvezeno</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Plnění</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stav</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {otherPlans.map((plan) => {
                    const status = getStatusLabel(plan.percentage);
                    return (
                      <tr key={plan.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{plan.powerPlant.name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{formatWeek(plan.weekStart)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{plan.unit}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{plan.targetPrm.toFixed(0)}</td>
                        <td className="px-4 py-3 text-sm text-right">{plan.deliveredPrm.toFixed(0)}</td>
                        <td className="px-4 py-3 text-sm text-right font-medium">{plan.percentage} %</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${status.cls}`}>
                            {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {plans.length === 0 && !showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          Zatím nejsou nastaveny žádné týdenní plány. Klikněte na &quot;Nastavit plán&quot;.
        </div>
      )}
    </>
  );
}
