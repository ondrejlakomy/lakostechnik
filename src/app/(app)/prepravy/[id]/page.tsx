"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

interface SelectOption { value: string; label: string }

export default function EditPrepravaPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    status: "KONCEPT",
    deliveryShiftId: "",
    deliveryNoteNumber: "",
    weighingTicketNumber: "",
    callNumber: "",
    loadingPlace: "",
    unloadingPlace: "",
    originLocationId: "",
    sourceWarehouseId: "",
    targetWarehouseId: "",
    powerPlantId: "",
    customerId: "",
    chipperName: "",
    chipperId: "",
    driverId: "",
    vehicleSpz: "",
    kilometers: "",
    nettoWeight: "",
    prm: "",
    note: "",
  });

  const [shifts, setShifts] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [powerPlants, setPowerPlants] = useState<SelectOption[]>([]);
  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const [chippers, setChippers] = useState<SelectOption[]>([]);
  const [drivers, setDrivers] = useState<SelectOption[]>([]);
  const [transportNumber, setTransportNumber] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/prepravy/${params.id}`).then((r) => r.json()),
      fetch("/api/turnusy").then((r) => r.json()),
      fetch("/api/lokace").then((r) => r.json()),
      fetch("/api/sklady").then((r) => r.json()),
      fetch("/api/elektrarny").then((r) => r.json()),
      fetch("/api/odberatele").then((r) => r.json()),
      fetch("/api/stepkovace").then((r) => r.json()),
      fetch("/api/ridici").then((r) => r.json()),
    ]).then(([t, sh, loc, wh, pp, cu, ch, dr]) => {
      setTransportNumber(t.number);
      setForm({
        status: t.status || "KONCEPT",
        deliveryShiftId: t.deliveryShiftId || "",
        deliveryNoteNumber: t.deliveryNoteNumber || "",
        weighingTicketNumber: t.weighingTicketNumber || "",
        callNumber: t.callNumber || "",
        loadingPlace: t.loadingPlace || "",
        unloadingPlace: t.unloadingPlace || "",
        originLocationId: t.originLocationId || "",
        sourceWarehouseId: t.sourceWarehouseId || "",
        targetWarehouseId: t.targetWarehouseId || "",
        powerPlantId: t.powerPlantId || "",
        customerId: t.customerId || "",
        chipperName: t.chipperName || "",
        chipperId: t.chipperId || "",
        driverId: t.driverId || "",
        vehicleSpz: t.vehicleSpz || "",
        kilometers: t.kilometers?.toString() || "",
        nettoWeight: t.nettoWeight?.toString() || "",
        prm: t.prm?.toString() || "",
        note: t.note || "",
      });
      setShifts(sh.filter((s: any) => s.active).map((s: any) => ({ value: s.id, label: s.name })));
      setLocations(loc.filter((l: any) => l.active).map((l: any) => ({ value: l.id, label: `${l.code} – ${l.name}` })));
      setWarehouses(wh.filter((w: any) => w.active).map((w: any) => ({ value: w.id, label: `${w.code} – ${w.name}` })));
      setPowerPlants(pp.filter((p: any) => p.active).map((p: any) => ({ value: p.id, label: p.name })));
      setCustomers(cu.filter((c: any) => c.active).map((c: any) => ({ value: c.id, label: c.name })));
      setChippers(ch.filter((c: any) => c.active).map((c: any) => ({ value: c.id, label: c.name })));
      setDrivers(dr.filter((d: any) => d.active).map((d: any) => ({ value: d.id, label: `${d.code} – ${d.firstName} ${d.lastName}` })));
      setLoading(false);
    });
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/prepravy/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Přeprava uložena");
      router.push("/prepravy");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title={`Přeprava ${transportNumber}`} />
      <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Turnus závozu" name="deliveryShiftId" value={form.deliveryShiftId} onChange={handleChange} options={shifts} />
          <FormField label="Stav" name="status" value={form.status} onChange={handleChange} options={[
            { value: "KONCEPT", label: "Koncept" },
            { value: "POTVRZENO", label: "Potvrzeno" },
            { value: "STORNOVANO", label: "Stornováno" },
          ]} />
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Identifikátory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Číslo dodacího listu" name="deliveryNoteNumber" value={form.deliveryNoteNumber} onChange={handleChange} />
          <FormField label="Číslo vážního lístku" name="weighingTicketNumber" value={form.weighingTicketNumber} onChange={handleChange} />
          <FormField label="Číslo výzvy" name="callNumber" value={form.callNumber} onChange={handleChange} />
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Trasa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Lokace původu" name="originLocationId" value={form.originLocationId} onChange={handleChange} options={locations} />
          <FormField label="Místo nakládky" name="loadingPlace" value={form.loadingPlace} onChange={handleChange} />
          <FormField label="Místo vykládky" name="unloadingPlace" value={form.unloadingPlace} onChange={handleChange} />
          <FormField label="Zdrojový sklad" name="sourceWarehouseId" value={form.sourceWarehouseId} onChange={handleChange} options={warehouses} />
          <FormField label="Cílový sklad" name="targetWarehouseId" value={form.targetWarehouseId} onChange={handleChange} options={warehouses} />
          <FormField label="Elektrárna" name="powerPlantId" value={form.powerPlantId} onChange={handleChange} options={powerPlants} />
          <FormField label="Odběratel" name="customerId" value={form.customerId} onChange={handleChange} options={customers} />
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Řidič a stroj</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Řidič" name="driverId" value={form.driverId} onChange={handleChange} options={drivers} />
          <FormField label="SPZ vozidla" name="vehicleSpz" value={form.vehicleSpz} onChange={handleChange} />
          <FormField label="Jméno štěpkaře" name="chipperName" value={form.chipperName} onChange={handleChange} />
          <FormField label="Štěpkovač" name="chipperId" value={form.chipperId} onChange={handleChange} options={chippers} />
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Údaje přepravy</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Počet ujetých km" name="kilometers" type="number" value={form.kilometers} onChange={handleChange} step="0.1" min="0" />
          <FormField label="Netto váha (t)" name="nettoWeight" type="number" value={form.nettoWeight} onChange={handleChange} step="0.01" min="0" />
          <FormField label="PRM" name="prm" type="number" value={form.prm} onChange={handleChange} step="0.01" min="0" />
        </div>

        <FormField label="Poznámka" name="note" value={form.note} onChange={handleChange} textarea />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/prepravy")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zpět
          </button>
        </div>
      </form>
    </>
  );
}
