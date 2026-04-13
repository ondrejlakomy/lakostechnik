"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

const CATEGORY_OPTIONS = [
  { value: "OSOBNI", label: "Osobn\u00ed v\u016fz" },
  { value: "NAKLADNI", label: "N\u00e1kladn\u00ed" },
  { value: "PRIPOJNE", label: "P\u0159\u00edpojn\u00e9 vozidlo" },
  { value: "TRAKTOR", label: "Traktor" },
  { value: "NAKLADAC", label: "Naklada\u010d" },
];

const TIRE_TYPE_OPTIONS = [
  { value: "LETNI", label: "Letn\u00ed" },
  { value: "ZIMNI", label: "Zimn\u00ed" },
  { value: "CELOROCNI", label: "Celoro\u010dn\u00ed" },
];

interface Driver {
  id: string;
  name: string;
}

export default function UpravitVozidloPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({
    name: "",
    category: "",
    brand: "",
    model: "",
    variant: "",
    nickname: "",
    yearOfManufacture: "",
    spz: "",
    vin: "",
    color: "",
    active: true,
    engine: "",
    transmission: "",
    payload: "",
    grossWeight: "",
    operatingWeight: "",
    axleCount: "",
    tireSize: "",
    tireType: "",
    tireCondition: "100",
    odometerKm: "",
    engineHours: "",
    assignedDriverId: "",
    stkNextDate: "",
    oilNextDate: "",
    oilNextKm: "",
    nextServiceDate: "",
    nextServiceKm: "",
    note: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [drivers, setDrivers] = useState<Driver[]>([]);

  useEffect(() => {
    fetch("/api/ridici")
      .then((r) => r.json())
      .then((d) => setDrivers(Array.isArray(d) ? d : []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`/api/vozidla/${params.id}`)
      .then((r) => r.json())
      .then((d) => {
        setForm({
          name: d.name || "",
          category: d.category || "",
          brand: d.brand || "",
          model: d.model || "",
          variant: d.variant || "",
          nickname: d.nickname || "",
          yearOfManufacture: d.yearOfManufacture != null ? String(d.yearOfManufacture) : "",
          spz: d.spz || "",
          vin: d.vin || "",
          color: d.color || "",
          active: d.active ?? true,
          engine: d.engine || "",
          transmission: d.transmission || "",
          payload: d.payload != null ? String(d.payload) : "",
          grossWeight: d.grossWeight != null ? String(d.grossWeight) : "",
          operatingWeight: d.operatingWeight != null ? String(d.operatingWeight) : "",
          axleCount: d.axleCount != null ? String(d.axleCount) : "",
          tireSize: d.tireSize || "",
          tireType: d.tireType || "",
          tireCondition: d.tireCondition != null ? String(d.tireCondition) : "100",
          odometerKm: d.odometerKm != null ? String(d.odometerKm) : "",
          engineHours: d.engineHours != null ? String(d.engineHours) : "",
          assignedDriverId: d.assignedDriverId || "",
          stkNextDate: d.stkNextDate ? d.stkNextDate.split("T")[0] : "",
          oilNextDate: d.oilNextDate ? d.oilNextDate.split("T")[0] : "",
          oilNextKm: d.oilNextKm != null ? String(d.oilNextKm) : "",
          nextServiceDate: d.nextServiceDate ? d.nextServiceDate.split("T")[0] : "",
          nextServiceKm: d.nextServiceKm != null ? String(d.nextServiceKm) : "",
          note: d.note || "",
        });
        setLoading(false);
      });
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const target = e.target;
    const val = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setForm({ ...form, [target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload: Record<string, unknown> = { ...form };
    // Convert numeric fields
    if (payload.yearOfManufacture) payload.yearOfManufacture = Number(payload.yearOfManufacture);
    else delete payload.yearOfManufacture;
    if (payload.payload) payload.payload = Number(payload.payload);
    else delete payload.payload;
    if (payload.grossWeight) payload.grossWeight = Number(payload.grossWeight);
    else delete payload.grossWeight;
    if (payload.operatingWeight) payload.operatingWeight = Number(payload.operatingWeight);
    else delete payload.operatingWeight;
    if (payload.axleCount) payload.axleCount = Number(payload.axleCount);
    else delete payload.axleCount;
    if (payload.tireCondition) payload.tireCondition = Number(payload.tireCondition);
    else delete payload.tireCondition;
    if (payload.odometerKm) payload.odometerKm = Number(payload.odometerKm);
    else delete payload.odometerKm;
    if (payload.engineHours) payload.engineHours = Number(payload.engineHours);
    else delete payload.engineHours;
    if (payload.oilNextKm) payload.oilNextKm = Number(payload.oilNextKm);
    else delete payload.oilNextKm;
    if (payload.nextServiceKm) payload.nextServiceKm = Number(payload.nextServiceKm);
    else delete payload.nextServiceKm;
    // Remove empty strings
    Object.keys(payload).forEach((k) => {
      if (payload[k] === "") delete payload[k];
    });

    const res = await fetch(`/api/vozidla/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      toast.success("Vozidlo ulo\u017eeno");
      router.push(`/vozidla/${params.id}`);
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba p\u0159i ukl\u00e1d\u00e1n\u00ed");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500">Na\u010d\u00edt\u00e1n\u00ed...</div>;

  const cat = form.category;
  const showKm = ["OSOBNI", "NAKLADNI", "PRIPOJNE"].includes(cat);
  const showMth = ["TRAKTOR", "NAKLADAC"].includes(cat);
  const showAxle = cat === "PRIPOJNE";

  return (
    <>
      <PageHeader title="Upravit vozidlo" />
      <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
        {/* Z\u00e1kladn\u00ed \u00fadaje */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Z\u00e1kladn\u00ed \u00fadaje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="N\u00e1zev" name="name" value={form.name} onChange={handleChange} required placeholder="N\u00e1zev vozidla" />
            <FormField label="Kategorie" name="category" value={form.category} onChange={handleChange} required options={CATEGORY_OPTIONS} />
            <FormField label="Zna\u010dka" name="brand" value={form.brand} onChange={handleChange} />
            <FormField label="Model" name="model" value={form.model} onChange={handleChange} />
            <FormField label="Varianta" name="variant" value={form.variant} onChange={handleChange} />
            <FormField label="P\u0159ezd\u00edvka" name="nickname" value={form.nickname} onChange={handleChange} />
            <FormField label="Rok v\u00fdroby" name="yearOfManufacture" type="number" value={form.yearOfManufacture} onChange={handleChange} min="1900" />
            <FormField label="SPZ" name="spz" value={form.spz} onChange={handleChange} />
            <FormField label="VIN" name="vin" value={form.vin} onChange={handleChange} />
            <FormField label="Barva" name="color" value={form.color} onChange={handleChange} />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <input type="checkbox" id="active" name="active" checked={form.active as unknown as boolean} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
            <label htmlFor="active" className="text-sm text-gray-700">Aktivn\u00ed</label>
          </div>
        </div>

        {/* Technick\u00e9 \u00fadaje */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Technick\u00e9 \u00fadaje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Motor" name="engine" value={form.engine} onChange={handleChange} />
            <FormField label="P\u0159evodovka" name="transmission" value={form.transmission} onChange={handleChange} />
            <FormField label="U\u017eite\u010dn\u00e1 hmotnost (kg)" name="payload" type="number" value={form.payload} onChange={handleChange} min="0" />
            <FormField label="Celkov\u00e1 hmotnost (kg)" name="grossWeight" type="number" value={form.grossWeight} onChange={handleChange} min="0" />
            <FormField label="Provozn\u00ed hmotnost (kg)" name="operatingWeight" type="number" value={form.operatingWeight} onChange={handleChange} min="0" />
            {showAxle && (
              <FormField label="Po\u010det n\u00e1prav" name="axleCount" type="number" value={form.axleCount} onChange={handleChange} min="1" />
            )}
            <FormField label="Rozm\u011br pneumatik" name="tireSize" value={form.tireSize} onChange={handleChange} />
            <FormField label="Typ pneumatik" name="tireType" value={form.tireType} onChange={handleChange} options={TIRE_TYPE_OPTIONS} />
            <div>
              <label htmlFor="tireCondition" className="block text-sm font-medium text-gray-700 mb-1">
                Stav pneumatik: {form.tireCondition}%
              </label>
              <input
                type="range"
                id="tireCondition"
                name="tireCondition"
                min="0"
                max="100"
                value={form.tireCondition}
                onChange={handleChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
              />
            </div>
          </div>
        </div>

        {/* Provozn\u00ed \u00fadaje */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Provozn\u00ed \u00fadaje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {showKm && (
              <FormField label="Stav tachometru (km)" name="odometerKm" type="number" value={form.odometerKm} onChange={handleChange} min="0" />
            )}
            {showMth && (
              <FormField label="Motohodiny" name="engineHours" type="number" value={form.engineHours} onChange={handleChange} min="0" />
            )}
            <FormField
              label="P\u0159i\u0159azen\u00fd \u0159idi\u010d"
              name="assignedDriverId"
              value={form.assignedDriverId}
              onChange={handleChange}
              options={drivers.map((d) => ({ value: d.id, label: d.name }))}
            />
          </div>
        </div>

        {/* Servisn\u00ed term\u00edny */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Servisn\u00ed term\u00edny</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="P\u0159\u00ed\u0161t\u00ed STK" name="stkNextDate" type="date" value={form.stkNextDate} onChange={handleChange} />
            <FormField label="P\u0159\u00ed\u0161t\u00ed v\u00fdm\u011bna oleje (datum)" name="oilNextDate" type="date" value={form.oilNextDate} onChange={handleChange} />
            <FormField label="P\u0159\u00ed\u0161t\u00ed v\u00fdm\u011bna oleje (km)" name="oilNextKm" type="number" value={form.oilNextKm} onChange={handleChange} min="0" />
            <FormField label="P\u0159\u00ed\u0161t\u00ed servis (datum)" name="nextServiceDate" type="date" value={form.nextServiceDate} onChange={handleChange} />
            <FormField label="P\u0159\u00ed\u0161t\u00ed servis (km)" name="nextServiceKm" type="number" value={form.nextServiceKm} onChange={handleChange} min="0" />
          </div>
        </div>

        {/* Pozn\u00e1mka */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Pozn\u00e1mka</h2>
          <FormField label="Pozn\u00e1mka" name="note" value={form.note} onChange={handleChange} textarea />
        </div>

        <div className="flex gap-3 pb-8">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukl\u00e1d\u00e1m..." : "Ulo\u017eit"}
          </button>
          <button type="button" onClick={() => router.push(`/vozidla/${params.id}`)} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zru\u0161it
          </button>
        </div>
      </form>
    </>
  );
}
