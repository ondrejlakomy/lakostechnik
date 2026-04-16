"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import KpiCard from "@/components/ui/KpiCard";

const CATEGORY_LABELS: Record<string, string> = {
  OSOBNI: "Osobní vůz",
  NAKLADNI: "Nákladní",
  PRIPOJNE: "Přípojné vozidlo",
  TRAKTOR: "Traktor",
  NAKLADAC: "Nakladač",
};

function getDateStatus(date: string | null): { color: string; label: string } {
  if (!date) return { color: "bg-gray-100 text-gray-500", label: "Nenastaveno" };
  const d = new Date(date);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return { color: "bg-red-100 text-red-700", label: "Po termínu" };
  if (diff <= 30) return { color: "bg-yellow-100 text-yellow-700", label: `${Math.ceil(diff)} dní` };
  return { color: "bg-green-100 text-green-700", label: d.toLocaleDateString("cs-CZ") };
}

interface AlertVehicle {
  id: string;
  name: string;
  spz: string | null;
  category: string;
  stkNextDate?: string;
  oilNextDate?: string;
  oilNextKm?: number;
  oilNextHours?: number;
  tachographDownloadNextDate?: string;
  tachographDownloadDate?: string;
  tachographRevisionNextDate?: string;
  tachographRevisionDate?: string;
}

interface DashboardData {
  totalVehicles: number;
  activeVehicles: number;
  stkExpired: number;
  urgentTasks: number;
  openTasks: number;
  byCategory: Record<string, number>;
  stkAlertVehicles: AlertVehicle[];
  oilAlertVehicles: AlertVehicle[];
  tachDownloadAlertVehicles: AlertVehicle[];
  tachRevisionAlertVehicles: AlertVehicle[];
  upcomingDeadlines: {
    vehicleId: string;
    vehicleName: string;
    spz: string | null;
    deadlineType: string;
    deadlineDate: string;
  }[];
}

export default function VozidlaDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    fetch("/api/vozidla/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleTachographDone = async (vehicleId: string, type: "download" | "revision") => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setMonth(nextDate.getMonth() + (type === "download" ? 3 : 24));

    const body = type === "download"
      ? { tachographDownloadDate: now.toISOString(), tachographDownloadNextDate: nextDate.toISOString() }
      : { tachographRevisionDate: now.toISOString(), tachographRevisionNextDate: nextDate.toISOString() };

    const res = await fetch(`/api/vozidla/${vehicleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const toast = (await import("react-hot-toast")).default;
      toast.success(type === "download" ? "Stažení tachografu potvrzeno" : "Revize tachografu potvrzena");
      fetchData();
    }
  };

  if (loading) return <div className="text-gray-500">Načítání...</div>;
  if (!data) return <div className="text-red-500">Chyba při načítání dat</div>;

  return (
    <>
      <PageHeader title="Dashboard vozidel" description="Přehled stavu flotily" />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <KpiCard title="Celkem vozidel" value={data.totalVehicles} />
        <KpiCard title="Aktivní" value={data.activeVehicles} />
        <div className={`bg-white rounded-xl border border-gray-200 p-5 ${data.stkExpired > 0 ? "ring-2 ring-red-300" : ""}`}>
          <p className="text-sm font-medium text-gray-500">Po termínu STK</p>
          <p className={`mt-2 text-2xl font-bold ${data.stkExpired > 0 ? "text-red-600" : "text-gray-900"}`}>{data.stkExpired}</p>
        </div>
        <div className={`bg-white rounded-xl border border-gray-200 p-5 ${data.urgentTasks > 0 ? "ring-2 ring-red-300" : ""}`}>
          <p className="text-sm font-medium text-gray-500">Urgentní úkoly</p>
          <p className={`mt-2 text-2xl font-bold ${data.urgentTasks > 0 ? "text-red-600" : "text-gray-900"}`}>{data.urgentTasks}</p>
        </div>
        <KpiCard title="Otevřené úkoly" value={data.openTasks} />
      </div>

      {/* STK a Olej alerty */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* STK */}
        <div className={`bg-white rounded-xl border p-5 ${data.stkAlertVehicles.length > 0 ? "border-red-200" : "border-gray-200"}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            STK – akutní
            {data.stkAlertVehicles.length > 0 && (
              <span className="bg-red-100 text-red-700 text-xs font-medium px-2 py-0.5 rounded-full">{data.stkAlertVehicles.length}</span>
            )}
          </h2>
          {data.stkAlertVehicles.length === 0 ? (
            <p className="text-green-600 text-sm font-medium">Vše v pořádku</p>
          ) : (
            <div className="space-y-2">
              {data.stkAlertVehicles.map((v) => {
                const status = getDateStatus(v.stkNextDate || null);
                return (
                  <a key={v.id} href={`/vozidla/${v.id}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <div>
                      <span className="font-medium text-gray-900">{v.name}</span>
                      {v.spz && <span className="text-gray-500 ml-2 text-sm">{v.spz}</span>}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {v.stkNextDate ? new Date(v.stkNextDate).toLocaleDateString("cs-CZ") : "–"} · {status.label}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>

        {/* Olej */}
        <div className={`bg-white rounded-xl border p-5 ${data.oilAlertVehicles.length > 0 ? "border-orange-200" : "border-gray-200"}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Olej – akutní
            {data.oilAlertVehicles.length > 0 && (
              <span className="bg-orange-100 text-orange-700 text-xs font-medium px-2 py-0.5 rounded-full">{data.oilAlertVehicles.length}</span>
            )}
          </h2>
          {data.oilAlertVehicles.length === 0 ? (
            <p className="text-green-600 text-sm font-medium">Vše v pořádku</p>
          ) : (
            <div className="space-y-2">
              {data.oilAlertVehicles.map((v) => {
                const status = getDateStatus(v.oilNextDate || null);
                return (
                  <a key={v.id} href={`/vozidla/${v.id}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                    <div>
                      <span className="font-medium text-gray-900">{v.name}</span>
                      {v.spz && <span className="text-gray-500 ml-2 text-sm">{v.spz}</span>}
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                      {v.oilNextDate ? new Date(v.oilNextDate).toLocaleDateString("cs-CZ") : "–"} · {status.label}
                    </span>
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Tachograf */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Stažení tachografu - 3 měsíce */}
        <div className={`bg-white rounded-xl border p-5 ${data.tachDownloadAlertVehicles?.length > 0 ? "border-purple-200" : "border-gray-200"}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Stažení tachografu
            <span className="text-xs font-normal text-gray-400">co 3 měsíce</span>
            {data.tachDownloadAlertVehicles?.length > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">{data.tachDownloadAlertVehicles.length}</span>
            )}
          </h2>
          {!data.tachDownloadAlertVehicles?.length ? (
            <p className="text-green-600 text-sm font-medium">Vše v pořádku</p>
          ) : (
            <div className="space-y-2">
              {data.tachDownloadAlertVehicles.map((v) => {
                const status = getDateStatus(v.tachographDownloadNextDate || null);
                return (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <a href={`/vozidla/${v.id}`} className="flex-1">
                      <span className="font-medium text-gray-900">{v.name}</span>
                      {v.spz && <span className="text-gray-500 ml-2 text-sm">{v.spz}</span>}
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {v.tachographDownloadNextDate ? new Date(v.tachographDownloadNextDate).toLocaleDateString("cs-CZ") : "–"} · {status.label}
                      </span>
                    </a>
                    <button
                      onClick={() => handleTachographDone(v.id, "download")}
                      className="ml-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition flex-shrink-0"
                    >
                      Staženo
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Revize tachografu - 24 měsíců */}
        <div className={`bg-white rounded-xl border p-5 ${data.tachRevisionAlertVehicles?.length > 0 ? "border-purple-200" : "border-gray-200"}`}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            Revize tachografu
            <span className="text-xs font-normal text-gray-400">co 24 měsíců</span>
            {data.tachRevisionAlertVehicles?.length > 0 && (
              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded-full">{data.tachRevisionAlertVehicles.length}</span>
            )}
          </h2>
          {!data.tachRevisionAlertVehicles?.length ? (
            <p className="text-green-600 text-sm font-medium">Vše v pořádku</p>
          ) : (
            <div className="space-y-2">
              {data.tachRevisionAlertVehicles.map((v) => {
                const status = getDateStatus(v.tachographRevisionNextDate || null);
                return (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <a href={`/vozidla/${v.id}`} className="flex-1">
                      <span className="font-medium text-gray-900">{v.name}</span>
                      {v.spz && <span className="text-gray-500 ml-2 text-sm">{v.spz}</span>}
                      <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {v.tachographRevisionNextDate ? new Date(v.tachographRevisionNextDate).toLocaleDateString("cs-CZ") : "–"} · {status.label}
                      </span>
                    </a>
                    <button
                      onClick={() => handleTachographDone(v.id, "revision")}
                      className="ml-3 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded-lg transition flex-shrink-0"
                    >
                      Provedeno
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Podle kategorií */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Podle kategorií</h2>
        <div className="space-y-3">
          {Object.entries(data.byCategory).map(([cat, count]) => {
            const maxCount = Math.max(...Object.values(data.byCategory), 1);
            const pct = Math.round(((count as number) / maxCount) * 100);
            return (
              <div key={cat}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-gray-700">{CATEGORY_LABELS[cat] || cat}</span>
                  <span className="text-gray-500">{count as number}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3">
                  <div className="bg-green-500 h-3 rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Blížící se termíny */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Blížící se termíny</h2>
        {data.upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500 text-sm">Žádné blížící se termíny</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Vozidlo</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">SPZ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Typ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Datum</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Stav</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.upcomingDeadlines.map((dl, i) => {
                  const status = getDateStatus(dl.deadlineDate);
                  return (
                    <tr key={`${dl.vehicleId}-${dl.deadlineType}-${i}`} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-sm">
                        <a href={`/vozidla/${dl.vehicleId}`} className="text-green-600 hover:text-green-700 font-medium">{dl.vehicleName}</a>
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-500">{dl.spz || "–"}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{dl.deadlineType}</td>
                      <td className="px-3 py-2 text-sm text-gray-700">{new Date(dl.deadlineDate).toLocaleDateString("cs-CZ")}</td>
                      <td className="px-3 py-2 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>{status.label}</span>
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
