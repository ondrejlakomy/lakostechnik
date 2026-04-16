"use client";

import { useEffect, useState } from "react";
import KpiCard from "@/components/ui/KpiCard";

interface DashData {
  totalStock: number;
  totalTransports: number;
  totalWeight: number;
  totalKm: number;
  totalPrm: number;
  warehouses: { id: string; name: string; code: string; currentStock: number; unit: string }[];
  byPowerPlant: { name: string; weight: number; count: number }[];
  byCustomer: { name: string; weight: number; count: number }[];
  byDriver: { name: string; weight: number; km: number; count: number }[];
  byChipper: { name: string; weight: number; count: number }[];
  byLocation: { name: string; weight: number; count: number }[];
  byShift: { name: string; weight: number; count: number }[];
  weeklyPlans: { powerPlantName: string; targetPrm: number; deliveredPrm: number; percentage: number; remaining: number }[];
  vehicleCritical: { vehicleId: string; vehicleName: string; spz: string | null; type: string; date: string }[];
}

type Period = "today" | "week" | "month" | "custom";

function getDateRange(period: Period): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split("T")[0];
  let from = to;

  if (period === "week") {
    const d = new Date(now);
    d.setDate(d.getDate() - 7);
    from = d.toISOString().split("T")[0];
  } else if (period === "month") {
    const d = new Date(now);
    d.setMonth(d.getMonth() - 1);
    from = d.toISOString().split("T")[0];
  }

  return { from, to };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [period, setPeriod] = useState<Period>("month");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const fetchData = async () => {
    const range = period === "custom"
      ? { from: customFrom, to: customTo }
      : getDateRange(period);

    const params = new URLSearchParams();
    if (range.from) params.set("dateFrom", range.from);
    if (range.to) params.set("dateTo", range.to);

    const res = await fetch(`/api/dashboard?${params}`);
    if (res.ok) setData(await res.json());
  };

  useEffect(() => {
    if (period !== "custom" || (customFrom && customTo)) {
      fetchData();
    }
  }, [period, customFrom, customTo]);

  if (!data) return <div className="text-gray-500">Načítání dashboardu...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex flex-wrap gap-2">
          {(["today", "week", "month", "custom"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-sm rounded-lg font-medium transition ${
                period === p
                  ? "bg-green-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {{ today: "Dnes", week: "Týden", month: "Měsíc", custom: "Vlastní" }[p]}
            </button>
          ))}
          {period === "custom" && (
            <div className="flex gap-2">
              <input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} className="px-2 py-1 text-sm border rounded-lg" />
              <input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} className="px-2 py-1 text-sm border rounded-lg" />
            </div>
          )}
        </div>
      </div>

      {/* KPI karty */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <KpiCard title="Zásoby celkem" value={data.totalStock.toFixed(1)} unit="t" />
        <KpiCard title="Přeprav" value={data.totalTransports} />
        <KpiCard title="Odvezeno" value={data.totalWeight.toFixed(1)} unit="t" />
        <KpiCard title="Najeto km" value={Math.round(data.totalKm).toLocaleString("cs-CZ")} unit="km" />
        <KpiCard title="PRM celkem" value={data.totalPrm.toFixed(1)} />
      </div>

      {/* Vozidla – kritické termíny */}
      {data.vehicleCritical && data.vehicleCritical.length > 0 && (
        <div className="bg-white rounded-xl border border-red-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            Vozidla – kritické termíny
            <span className="bg-red-100 text-red-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{data.vehicleCritical.length}</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Vozidlo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">SPZ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Typ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Termín</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Stav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(showAllAlerts ? data.vehicleCritical : data.vehicleCritical.slice(0, 5)).map((item, i) => {
                  const d = new Date(item.date);
                  const now = new Date();
                  const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                  const isExpired = diff < 0;
                  const statusColor = isExpired ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";
                  const statusLabel = isExpired ? `${Math.abs(diff)} dní po termínu` : `za ${diff} dní`;
                  return (
                    <tr key={`${item.vehicleId}-${item.type}-${i}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2.5 text-sm">
                        <a href={`/vozidla/${item.vehicleId}`} className="text-green-600 hover:text-green-700 font-medium">{item.vehicleName}</a>
                      </td>
                      <td className="px-3 py-2.5 text-sm text-gray-500">{item.spz || "–"}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-900">{item.type}</td>
                      <td className="px-3 py-2.5 text-sm text-gray-700">{d.toLocaleDateString("cs-CZ")}</td>
                      <td className="px-3 py-2.5 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                          {statusLabel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {data.vehicleCritical.length > 5 && !showAllAlerts && (
            <button
              onClick={() => setShowAllAlerts(true)}
              className="mt-3 w-full py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              Zobrazit více ({data.vehicleCritical.length - 5} dalších)
            </button>
          )}
          {showAllAlerts && data.vehicleCritical.length > 5 && (
            <button
              onClick={() => setShowAllAlerts(false)}
              className="mt-3 w-full py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition"
            >
              Zobrazit méně
            </button>
          )}
        </div>
      )}

      {/* Týdenní plány elektráren */}
      {data.weeklyPlans && data.weeklyPlans.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Plnění týdenních plánů (tento týden)</h2>
          <div className="space-y-4">
            {data.weeklyPlans.map((plan) => {
              const color = plan.percentage >= 100 ? "bg-green-500" : plan.percentage >= 70 ? "bg-yellow-500" : plan.percentage >= 40 ? "bg-orange-500" : "bg-red-500";
              const statusCls = plan.percentage >= 100 ? "text-green-700 bg-green-100" : plan.percentage >= 70 ? "text-yellow-700 bg-yellow-100" : plan.percentage >= 40 ? "text-orange-700 bg-orange-100" : "text-red-700 bg-red-100";
              const statusText = plan.percentage >= 100 ? "Splněno" : plan.percentage >= 70 ? "Na dobré cestě" : plan.percentage >= 40 ? "Pozor" : "Kritické";
              return (
                <div key={plan.powerPlantName}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900">{plan.powerPlantName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">{plan.deliveredPrm.toFixed(0)} / {plan.targetPrm.toFixed(0)} PRM</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusCls}`}>{statusText}</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`h-2.5 rounded-full transition-all ${color}`} style={{ width: `${Math.min(plan.percentage, 100)}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Zbývá: {plan.remaining.toFixed(0)} PRM ({plan.percentage} %)</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Zásoby na skladech */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Zásoby na skladech</h2>
        {data.warehouses.length === 0 ? (
          <p className="text-gray-500 text-sm">Žádné sklady</p>
        ) : (
          <div className="space-y-3">
            {data.warehouses.map((w) => (
              <div key={w.id} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{w.code} – {w.name}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-100 rounded-full h-2.5">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${Math.min((w.currentStock / Math.max(data.totalStock, 1)) * 100, 100)}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    {w.currentStock.toFixed(1)} {w.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tabulky agregací */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AggTable title="Odvozy do elektráren" data={data.byPowerPlant} />
        <AggTable title="Podle odběratelů" data={data.byCustomer} />
        <AggTableDriver title="Podle řidičů" data={data.byDriver} />
        <AggTable title="Podle štěpkovačů" data={data.byChipper} />
        <AggTable title="Podle lokací" data={data.byLocation} />
        <AggTable title="Podle turnusů" data={data.byShift} />
      </div>
    </div>
  );
}

function AggTable({
  title,
  data,
}: {
  title: string;
  data: { name: string; weight: number; count: number }[];
}) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left py-2">Název</th>
            <th className="text-right py-2">Váha (t)</th>
            <th className="text-right py-2">Počet</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name} className="border-b border-gray-50">
              <td className="py-2 text-gray-900">{item.name}</td>
              <td className="py-2 text-right font-medium">{item.weight.toFixed(1)}</td>
              <td className="py-2 text-right text-gray-500">{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AggTableDriver({
  title,
  data,
}: {
  title: string;
  data: { name: string; weight: number; km: number; count: number }[];
}) {
  if (data.length === 0) return null;
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-3">{title}</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-gray-500 border-b">
            <th className="text-left py-2">Řidič</th>
            <th className="text-right py-2">Váha (t)</th>
            <th className="text-right py-2">Km</th>
            <th className="text-right py-2">Počet</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.name} className="border-b border-gray-50">
              <td className="py-2 text-gray-900">{item.name}</td>
              <td className="py-2 text-right font-medium">{item.weight.toFixed(1)}</td>
              <td className="py-2 text-right">{Math.round(item.km)}</td>
              <td className="py-2 text-right text-gray-500">{item.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
