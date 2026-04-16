"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import ActiveBadge from "@/components/ui/ActiveBadge";
import toast from "react-hot-toast";

const CATEGORY_LABELS: Record<string, string> = {
  OSOBNI: "Osobní vůz",
  NAKLADNI: "Nákladní",
  PRIPOJNE: "Přípojné vozidlo",
  TRAKTOR: "Traktor",
  NAKLADAC: "Nakladač",
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
  OLEJ: "Výměna oleje",
  OLEJ_FILTRY: "Olej + filtry",
  STK: "STK",
  PNEUSERVIS: "Pneuservis",
  OPRAVA: "Oprava závady",
  BEZNY_SERVIS: "Běžný servis",
  MIMORADNY: "Mimořádný servis",
  DETAILING: "Detailing",
  KLIMATIZACE: "Klimatizace",
  EOBD: "EOBD",
  KAROSERIE: "Oprava karoserie",
  JINY: "Jiný",
};

const SERVICE_TYPE_OPTIONS = Object.entries(SERVICE_TYPE_LABELS).map(([value, label]) => ({ value, label }));

const PRIORITY_LABELS: Record<string, string> = {
  LOW: "Nízká",
  NORMAL: "Normální",
  HIGH: "Vysoká",
  URGENT: "Urgentní",
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: "bg-gray-100 text-gray-700",
  NORMAL: "bg-blue-100 text-blue-700",
  HIGH: "bg-orange-100 text-orange-700",
  URGENT: "bg-red-100 text-red-700",
};

const STATUS_LABELS: Record<string, string> = {
  OTEVRENY: "Otevřený",
  V_RESENI: "V řešení",
  HOTOVO: "Hotovo",
  ZRUSENO: "Zrušeno",
};

const STATUS_COLORS: Record<string, string> = {
  OTEVRENY: "bg-yellow-100 text-yellow-700",
  V_RESENI: "bg-blue-100 text-blue-700",
  HOTOVO: "bg-green-100 text-green-700",
  ZRUSENO: "bg-gray-100 text-gray-500",
};

const PRIORITY_OPTIONS = Object.entries(PRIORITY_LABELS).map(([value, label]) => ({ value, label }));
const STATUS_OPTIONS = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

function getDateStatus(date: string | null): { color: string; label: string } {
  if (!date) return { color: "bg-gray-100 text-gray-500", label: "Nenastaveno" };
  const d = new Date(date);
  const now = new Date();
  const diff = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (diff < 0) return { color: "bg-red-100 text-red-700", label: "Po termínu" };
  if (diff <= 30) return { color: "bg-yellow-100 text-yellow-700", label: `${Math.ceil(diff)} dní` };
  return { color: "bg-green-100 text-green-700", label: d.toLocaleDateString("cs-CZ") };
}

interface ServiceRecord {
  id: string;
  date: string;
  type: string;
  description: string | null;
  odometerKm: number | null;
  cost: number | null;
}

interface Task {
  id: string;
  title: string;
  priority: string;
  status: string;
  dueDate: string | null;
  assignedTo: string | null;
}

interface Vehicle {
  id: string;
  name: string;
  category: string;
  brand: string | null;
  model: string | null;
  variant: string | null;
  nickname: string | null;
  yearOfManufacture: number | null;
  spz: string | null;
  vin: string | null;
  color: string | null;
  active: boolean;
  engine: string | null;
  transmission: string | null;
  payload: number | null;
  grossWeight: number | null;
  operatingWeight: number | null;
  axleCount: number | null;
  tireSize: string | null;
  tireType: string | null;
  tireCondition: number | null;
  odometerKm: number | null;
  engineHours: number | null;
  assignedDriver: { name: string } | null;
  stkNextDate: string | null;
  oilNextDate: string | null;
  oilNextKm: number | null;
  nextServiceDate: string | null;
  nextServiceKm: number | null;
  tachographDownloadDate: string | null;
  tachographDownloadNextDate: string | null;
  tachographRevisionDate: string | null;
  tachographRevisionNextDate: string | null;
  note: string | null;
  serviceRecords: ServiceRecord[];
  tasks: Task[];
}

export default function VozidloDetailPage() {
  const params = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [savingService, setSavingService] = useState(false);
  const [savingTask, setSavingTask] = useState(false);

  const [serviceForm, setServiceForm] = useState({
    date: new Date().toISOString().split("T")[0],
    type: "",
    description: "",
    odometerKm: "",
    cost: "",
  });

  const [taskForm, setTaskForm] = useState({
    title: "",
    priority: "NORMAL",
    status: "OTEVRENY",
    dueDate: "",
    assignedTo: "",
  });

  const fetchVehicle = async () => {
    const res = await fetch(`/api/vozidla/${params.id}`);
    if (res.ok) {
      setVehicle(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => { fetchVehicle(); }, [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleServiceChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setServiceForm({ ...serviceForm, [e.target.name]: e.target.value });
  };

  const handleTaskChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const submitService = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingService(true);
    const payload: Record<string, unknown> = { ...serviceForm };
    if (payload.odometerKm) payload.odometerKm = Number(payload.odometerKm);
    else delete payload.odometerKm;
    if (payload.cost) payload.cost = Number(payload.cost);
    else delete payload.cost;
    Object.keys(payload).forEach((k) => { if (payload[k] === "") delete payload[k]; });

    const res = await fetch(`/api/vozidla/${params.id}/servis`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Servisní záznam přidán");
      setShowServiceForm(false);
      setServiceForm({ date: new Date().toISOString().split("T")[0], type: "", description: "", odometerKm: "", cost: "" });
      fetchVehicle();
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSavingService(false);
  };

  const submitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTask(true);
    const payload: Record<string, unknown> = { ...taskForm };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") delete payload[k]; });

    const res = await fetch(`/api/vozidla/${params.id}/ukoly`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Úkol vytvořen");
      setShowTaskForm(false);
      setTaskForm({ title: "", priority: "NORMAL", status: "OTEVRENY", dueDate: "", assignedTo: "" });
      fetchVehicle();
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSavingTask(false);
  };

  const markTaskDone = async (taskId: string) => {
    const res = await fetch(`/api/vozidla/${params.id}/ukoly`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: taskId, status: "HOTOVO" }),
    });
    if (res.ok) {
      toast.success("Úkol označen jako hotový");
      fetchVehicle();
    } else {
      toast.error("Chyba při aktualizaci");
    }
  };

  if (loading) return <div className="text-gray-500">Načítání...</div>;
  if (!vehicle) return <div className="text-red-500">Vozidlo nenalezeno</div>;

  const stk = getDateStatus(vehicle.stkNextDate);
  const oil = getDateStatus(vehicle.oilNextDate);
  const srv = getDateStatus(vehicle.nextServiceDate);
  const tachDl = getDateStatus(vehicle.tachographDownloadNextDate);
  const tachRev = getDateStatus(vehicle.tachographRevisionNextDate);

  const handleTachographDone = async (type: "download" | "revision") => {
    const now = new Date();
    const nextDate = new Date(now);
    nextDate.setMonth(nextDate.getMonth() + (type === "download" ? 3 : 24));
    const body = type === "download"
      ? { tachographDownloadDate: now.toISOString(), tachographDownloadNextDate: nextDate.toISOString() }
      : { tachographRevisionDate: now.toISOString(), tachographRevisionNextDate: nextDate.toISOString() };
    const res = await fetch(`/api/vozidla/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      toast.success(type === "download" ? "Stažení tachografu potvrzeno" : "Revize tachografu potvrzena");
      fetchVehicle();
    }
  };

  const fields: { label: string; value: string | number | null }[] = [
    { label: "Značka", value: vehicle.brand },
    { label: "Model", value: vehicle.model },
    { label: "Varianta", value: vehicle.variant },
    { label: "Přezdívka", value: vehicle.nickname },
    { label: "Rok výroby", value: vehicle.yearOfManufacture },
    { label: "SPZ", value: vehicle.spz },
    { label: "VIN", value: vehicle.vin },
    { label: "Barva", value: vehicle.color },
    { label: "Motor", value: vehicle.engine },
    { label: "Převodovka", value: vehicle.transmission },
    { label: "Užitečná hmotnost", value: vehicle.payload ? `${vehicle.payload} kg` : null },
    { label: "Celková hmotnost", value: vehicle.grossWeight ? `${vehicle.grossWeight} kg` : null },
    { label: "Provozní hmotnost", value: vehicle.operatingWeight ? `${vehicle.operatingWeight} kg` : null },
    { label: "Počet náprav", value: vehicle.axleCount },
    { label: "Pneumatiky", value: vehicle.tireSize },
    { label: "Typ pneumatik", value: vehicle.tireType },
    { label: "Stav pneumatik", value: vehicle.tireCondition != null ? `${vehicle.tireCondition}%` : null },
    { label: "Tachometr", value: vehicle.odometerKm != null ? `${vehicle.odometerKm.toLocaleString("cs-CZ")} km` : null },
    { label: "Motohodiny", value: vehicle.engineHours != null ? `${vehicle.engineHours.toLocaleString("cs-CZ")} mth` : null },
    { label: "Řidič", value: vehicle.assignedDriver?.name || null },
    { label: "Poznámka", value: vehicle.note },
  ];

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
            {CATEGORY_LABELS[vehicle.category] || vehicle.category}
          </span>
          {vehicle.spz && (
            <span className="text-sm font-mono text-gray-500">{vehicle.spz}</span>
          )}
          <ActiveBadge active={vehicle.active} />
        </div>
        <Link
          href={`/vozidla/${vehicle.id}/upravit`}
          className="inline-flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
        >
          Upravit
        </Link>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
        <div className={`rounded-xl p-4 ${stk.color}`}>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75">STK</p>
          <p className="text-lg font-bold mt-1">{stk.label}</p>
          {vehicle.stkNextDate && (
            <p className="text-xs mt-1 opacity-75">{new Date(vehicle.stkNextDate).toLocaleDateString("cs-CZ")}</p>
          )}
        </div>
        <div className={`rounded-xl p-4 ${oil.color}`}>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Olej</p>
          <p className="text-lg font-bold mt-1">{oil.label}</p>
          {vehicle.oilNextDate && (
            <p className="text-xs mt-1 opacity-75">{new Date(vehicle.oilNextDate).toLocaleDateString("cs-CZ")}</p>
          )}
        </div>
        <div className={`rounded-xl p-4 ${srv.color}`}>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Servis</p>
          <p className="text-lg font-bold mt-1">{srv.label}</p>
          {vehicle.nextServiceDate && (
            <p className="text-xs mt-1 opacity-75">{new Date(vehicle.nextServiceDate).toLocaleDateString("cs-CZ")}</p>
          )}
        </div>
        <div className={`rounded-xl p-4 ${tachDl.color}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Stažení tach.</p>
          </div>
          <p className="text-lg font-bold mt-1">{tachDl.label}</p>
          {vehicle.tachographDownloadNextDate && (
            <p className="text-xs mt-1 opacity-75">{new Date(vehicle.tachographDownloadNextDate).toLocaleDateString("cs-CZ")}</p>
          )}
          {vehicle.tachographDownloadNextDate && (
            <button onClick={() => handleTachographDone("download")} className="mt-2 px-3 py-1 bg-white/80 hover:bg-white text-xs font-medium rounded-lg transition">
              Staženo
            </button>
          )}
        </div>
        <div className={`rounded-xl p-4 ${tachRev.color}`}>
          <p className="text-xs font-semibold uppercase tracking-wider opacity-75">Revize tach.</p>
          <p className="text-lg font-bold mt-1">{tachRev.label}</p>
          {vehicle.tachographRevisionNextDate && (
            <p className="text-xs mt-1 opacity-75">{new Date(vehicle.tachographRevisionNextDate).toLocaleDateString("cs-CZ")}</p>
          )}
          {vehicle.tachographRevisionNextDate && (
            <button onClick={() => handleTachographDone("revision")} className="mt-2 px-3 py-1 bg-white/80 hover:bg-white text-xs font-medium rounded-lg transition">
              Provedeno
            </button>
          )}
        </div>
      </div>

      {/* Základní údaje */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Základní údaje</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
          {fields.map((f) =>
            f.value != null ? (
              <div key={f.label}>
                <p className="text-xs text-gray-500">{f.label}</p>
                <p className="text-sm font-medium text-gray-900">{String(f.value)}</p>
              </div>
            ) : null
          )}
        </div>
      </div>

      {/* Servisní záznamy */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Servisní záznamy</h2>
          <button
            onClick={() => setShowServiceForm(!showServiceForm)}
            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            {showServiceForm ? "Zavřít" : "Přidat servis"}
          </button>
        </div>

        {showServiceForm && (
          <form onSubmit={submitService} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Datum" name="date" type="date" value={serviceForm.date} onChange={handleServiceChange} required />
              <FormField label="Typ" name="type" value={serviceForm.type} onChange={handleServiceChange} required options={SERVICE_TYPE_OPTIONS} />
              <FormField label="Km při servisu" name="odometerKm" type="number" value={serviceForm.odometerKm} onChange={handleServiceChange} min="0" />
              <FormField label="Cena (Kč)" name="cost" type="number" value={serviceForm.cost} onChange={handleServiceChange} min="0" />
            </div>
            <FormField label="Popis" name="description" value={serviceForm.description} onChange={handleServiceChange} textarea />
            <div className="flex gap-2">
              <button type="submit" disabled={savingService} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
                {savingService ? "Ukládám..." : "Uložit"}
              </button>
              <button type="button" onClick={() => setShowServiceForm(false)} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
                Zrušit
              </button>
            </div>
          </form>
        )}

        {vehicle.serviceRecords.length === 0 ? (
          <p className="text-gray-500 text-sm">Žádné servisní záznamy</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Datum</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Typ</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Popis</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Km</th>
                  <th className="px-3 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Cena</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {vehicle.serviceRecords.map((sr) => (
                  <tr key={sr.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 text-sm">{new Date(sr.date).toLocaleDateString("cs-CZ")}</td>
                    <td className="px-3 py-2 text-sm">{SERVICE_TYPE_LABELS[sr.type] || sr.type}</td>
                    <td className="px-3 py-2 text-sm text-gray-600">{sr.description || "–"}</td>
                    <td className="px-3 py-2 text-sm text-right">{sr.odometerKm != null ? sr.odometerKm.toLocaleString("cs-CZ") : "–"}</td>
                    <td className="px-3 py-2 text-sm text-right">{sr.cost != null ? `${sr.cost.toLocaleString("cs-CZ")} Kč` : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Úkoly */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Úkoly</h2>
          <button
            onClick={() => setShowTaskForm(!showTaskForm)}
            className="px-4 py-2 text-sm font-medium bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
          >
            {showTaskForm ? "Zavřít" : "Nový úkol"}
          </button>
        </div>

        {showTaskForm && (
          <form onSubmit={submitTask} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <FormField label="Název" name="title" value={taskForm.title} onChange={handleTaskChange} required placeholder="Název úkolu" />
              <FormField label="Priorita" name="priority" value={taskForm.priority} onChange={handleTaskChange} options={PRIORITY_OPTIONS} />
              <FormField label="Stav" name="status" value={taskForm.status} onChange={handleTaskChange} options={STATUS_OPTIONS} />
              <FormField label="Termín" name="dueDate" type="date" value={taskForm.dueDate} onChange={handleTaskChange} />
              <FormField label="Přiřazeno" name="assignedTo" value={taskForm.assignedTo} onChange={handleTaskChange} placeholder="Jméno osoby" />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={savingTask} className="px-4 py-2 text-sm bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
                {savingTask ? "Ukládám..." : "Uložit"}
              </button>
              <button type="button" onClick={() => setShowTaskForm(false)} className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
                Zrušit
              </button>
            </div>
          </form>
        )}

        {vehicle.tasks.length === 0 ? (
          <p className="text-gray-500 text-sm">Žádné úkoly</p>
        ) : (
          <div className="space-y-2">
            {vehicle.tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition">
                <div className="flex items-center gap-3">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${PRIORITY_COLORS[t.priority] || "bg-gray-100 text-gray-700"}`}>
                    {PRIORITY_LABELS[t.priority] || t.priority}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[t.status] || "bg-gray-100 text-gray-700"}`}>
                    {STATUS_LABELS[t.status] || t.status}
                  </span>
                  <span className="text-sm font-medium text-gray-900">{t.title}</span>
                </div>
                <div className="flex items-center gap-3">
                  {t.dueDate && (
                    <span className="text-xs text-gray-500">{new Date(t.dueDate).toLocaleDateString("cs-CZ")}</span>
                  )}
                  {t.assignedTo && (
                    <span className="text-xs text-gray-500">{t.assignedTo}</span>
                  )}
                  {t.status !== "HOTOVO" && t.status !== "ZRUSENO" && (
                    <button
                      onClick={() => markTaskDone(t.id)}
                      className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 font-medium rounded-lg transition"
                    >
                      Hotovo
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zpět */}
      <div className="pb-8">
        <Link href="/vozidla" className="text-sm text-green-600 hover:text-green-700 font-medium">
          &larr; Zpět na seznam
        </Link>
      </div>
    </>
  );
}
