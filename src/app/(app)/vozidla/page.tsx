"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import ActiveBadge from "@/components/ui/ActiveBadge";

const CATEGORY_LABELS: Record<string, string> = {
  OSOBNI: "Osobn\u00ed v\u016fz",
  NAKLADNI: "N\u00e1kladn\u00ed",
  PRIPOJNE: "P\u0159\u00edpojn\u00e9 vozidlo",
  TRAKTOR: "Traktor",
  NAKLADAC: "Naklada\u010d",
};

function getDateStatus(date: string | null): { color: string; label: string } {
  if (!date) return { color: "bg-gray-100 text-gray-500", label: "Nenastaveno" };
  const d = new Date(date);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return { color: "bg-red-100 text-red-700", label: "Po term\u00ednu" };
  if (diff <= 30) return { color: "bg-yellow-100 text-yellow-700", label: `${Math.ceil(diff)} dn\u00ed` };
  return { color: "bg-green-100 text-green-700", label: d.toLocaleDateString("cs-CZ") };
}

interface Vehicle {
  id: string;
  name: string;
  category: string;
  spz: string | null;
  brand: string | null;
  model: string | null;
  odometerKm: number | null;
  engineHours: number | null;
  stkNextDate: string | null;
  oilNextDate: string | null;
  active: boolean;
  assignedDriver?: { name: string } | null;
  _count?: { tasks: number };
  openTaskCount?: number;
}

export default function VozidlaPage() {
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    if (activeOnly) params.set("active", "true");
    const res = await fetch(`/api/vozidla?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  }, [debouncedSearch, category, activeOnly]);

  useEffect(() => { fetchData(); }, [fetchData]);

  return (
    <>
      <PageHeader
        title="Vozidla a technika"
        action={{ label: "Nov\u00e9 vozidlo", href: "/vozidla/nova" }}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
        >
          <option value="">V\u0161echny kategorie</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Hledat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none w-64"
        />

        <button
          onClick={() => setActiveOnly(!activeOnly)}
          className={`px-3 py-2 text-sm font-medium rounded-lg transition ${
            activeOnly
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {activeOnly ? "Pouze aktivn\u00ed" : "V\u0161echna vozidla"}
        </button>
      </div>

      {loading ? (
        <div className="text-gray-500">Na\u010d\u00edt\u00e1n\u00ed...</div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">
          \u017d\u00e1dn\u00e1 vozidla
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">N\u00e1zev</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategorie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SPZ</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Zna\u010dka / Model</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Km / Mth</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STK</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Olej</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">\u00dakoly</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">\u0158idi\u010d</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Stav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.map((v) => {
                  const stk = getDateStatus(v.stkNextDate);
                  const oil = getDateStatus(v.oilNextDate);
                  const openTasks = v.openTaskCount ?? v._count?.tasks ?? 0;
                  const showKm = ["OSOBNI", "NAKLADNI"].includes(v.category);
                  return (
                    <tr key={v.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/vozidla/${v.id}`} className="text-green-600 hover:text-green-700 font-medium">
                          {v.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {CATEGORY_LABELS[v.category] || v.category}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{v.spz || "\u2013"}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {[v.brand, v.model].filter(Boolean).join(" ") || "\u2013"}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {showKm
                          ? (v.odometerKm != null ? `${v.odometerKm.toLocaleString("cs-CZ")} km` : "\u2013")
                          : (v.engineHours != null ? `${v.engineHours.toLocaleString("cs-CZ")} mth` : "\u2013")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stk.color}`}>
                          {stk.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${oil.color}`}>
                          {oil.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {openTasks > 0 ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                            {openTasks}
                          </span>
                        ) : (
                          <span className="text-gray-400">0</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {v.assignedDriver?.name || "\u2013"}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <ActiveBadge active={v.active} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
