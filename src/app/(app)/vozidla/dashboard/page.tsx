"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";

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

interface DashboardData {
  totalVehicles: number;
  activeVehicles: number;
  expiredStk: number;
  urgentTasks: number;
  openTasks: number;
  byCategory: { category: string; _count: number }[];
  upcomingDeadlines: {
    vehicleId: string;
    vehicleName: string;
    type: string;
    date: string;
  }[];
}

export default function VozidlaDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vozidla/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-gray-500">Na\u010d\u00edt\u00e1n\u00ed...</div>;
  if (!data) return <div className="text-red-500">Chyba p\u0159i na\u010d\u00edt\u00e1n\u00ed dat</div>;

  const TYPE_LABELS: Record<string, string> = {
    STK: "STK",
    OIL: "Olej",
    SERVICE: "Servis",
  };

  return (
    <>
      <PageHeader title="Dashboard vozidel" description="P\u0159ehled stavu flotily" />

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Celkem vozidel" value={data.totalVehicles} />
        <KpiCard title="Aktivn\u00ed" value={data.activeVehicles} />
        <div className={`bg-white rounded-xl border border-gray-200 p-5 ${data.expiredStk > 0 ? "ring-2 ring-red-300" : ""}`}>
          <p className="text-sm font-medium text-gray-500">Po term\u00ednu STK</p>
          <p className={`mt-2 text-2xl font-bold ${data.expiredStk > 0 ? "text-red-600" : "text-gray-900"}`}>
            {data.expiredStk}
          </p>
        </div>
        <div className={`bg-white rounded-xl border border-gray-200 p-5 ${data.urgentTasks > 0 ? "ring-2 ring-red-300" : ""}`}>
          <p className="text-sm font-medium text-gray-500">Urgentn\u00ed \u00fakoly</p>
          <p className={`mt-2 text-2xl font-bold ${data.urgentTasks > 0 ? "text-red-600" : "text-gray-900"}`}>
            {data.urgentTasks}
          </p>
        </div>
        <KpiCard title="Otev\u0159en\u00e9 \u00fakoly" value={data.openTasks} />
      </div>

      {/* Podle kategori\u00ed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Podle kategori\u00ed</h2>
        {data.byCategory.length === 0 ? (
          <p className="text-gray-500 text-sm">\u017d\u00e1dn\u00e1 data</p>
        ) : (
          <div className="space-y-3">
            {data.byCategory.map((item) => {
              const maxCount = Math.max(...data.byCategory.map((c) => c._count), 1);
              const pct = Math.round((item._count / maxCount) * 100);
              return (
                <div key={item.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{CATEGORY_LABELS[item.category] || item.category}</span>
                    <span className="text-gray-500">{item._count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bl\u00ed\u017e\u00edc\u00ed se term\u00edny */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Bl\u00ed\u017e\u00edc\u00ed se term\u00edny</h2>
        {data.upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500 text-sm">\u017d\u00e1dn\u00e9 bl\u00ed\u017e\u00edc\u00ed se term\u00edny</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Vozidlo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Typ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Datum</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Stav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.upcomingDeadlines.map((dl, i) => {
                  const status = getDateStatus(dl.date);
                  return (
                    <tr key={`${dl.vehicleId}-${dl.type}-${i}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm">
                        <a href={`/vozidla/${dl.vehicleId}`} className="text-green-600 hover:text-green-700 font-medium">
                          {dl.vehicleName}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-700">{TYPE_LABELS[dl.type] || dl.type}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{new Date(dl.date).toLocaleDateString("cs-CZ")}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
