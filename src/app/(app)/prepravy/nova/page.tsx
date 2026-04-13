"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import toast from "react-hot-toast";

interface SelectOption { value: string; label: string }

export default function NovaPrepravaPage() {
  const router = useRouter();
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
  const [driverVehiclesMap, setDriverVehiclesMap] = useState<Record<string, SelectOption[]>>({});
  const [locationCodeMap, setLocationCodeMap] = useState<Record<string, string>>({});
  const [driverCodeMap, setDriverCodeMap] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      fetch("/api/turnusy").then((r) => r.json()),
      fetch("/api/lokace").then((r) => r.json()),
      fetch("/api/sklady").then((r) => r.json()),
      fetch("/api/elektrarny").then((r) => r.json()),
      fetch("/api/odberatele").then((r) => r.json()),
      fetch("/api/stepkovace").then((r) => r.json()),
      fetch("/api/ridici").then((r) => r.json()),
    ]).then(([sh, loc, wh, pp, cu, ch, dr]) => {
      setShifts(sh.filter((s: any) => s.active).map((s: any) => ({ value: s.id, label: s.name })));
      setLocations(loc.filter((l: any) => l.active).map((l: any) => ({ value: l.id, label: `${l.code} – ${l.name}` })));
      setWarehouses(wh.filter((w: any) => w.active).map((w: any) => ({ value: w.id, label: `${w.code} – ${w.name}` })));
      setPowerPlants(pp.filter((p: any) => p.active).map((p: any) => ({ value: p.id, label: p.name })));
      setCustomers(cu.filter((c: any) => c.active).map((c: any) => ({ value: c.id, label: c.name })));
      setChippers(ch.filter((c: any) => c.active).map((c: any) => ({ value: c.id, label: c.name })));
      setDrivers(dr.filter((d: any) => d.active).map((d: any) => ({ value: d.id, label: `${d.code} – ${d.firstName} ${d.lastName}` })));

      const vehMap: Record<string, SelectOption[]> = {};
      const locCodeMap: Record<string, string> = {};
      const drCodeMap: Record<string, string> = {};
      dr.forEach((d: any) => {
        drCodeMap[d.id] = d.code;
        if (d.vehicles?.length) {
          vehMap[d.id] = d.vehicles.map((v: any) => ({ value: v.spz, label: v.name ? `${v.spz} (${v.name})` : v.spz }));
        }
      });
      loc.forEach((l: any) => { locCodeMap[l.id] = l.code; });
      setDriverVehiclesMap(vehMap);
      setLocationCodeMap(locCodeMap);
      setDriverCodeMap(drCodeMap);
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Auto-fill SPZ when driver selected (first vehicle)
      if (name === "driverId" && driverVehiclesMap[value]?.length) {
        next.vehicleSpz = driverVehiclesMap[value][0].value;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      locationCode: locationCodeMap[form.originLocationId] || "GEN",
      driverCode: driverCodeMap[form.driverId] || "GEN",
    };

    const res = await fetch("/api/prepravy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success("Přeprava vytvořena");
      router.push("/prepravy");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  return (
    <>
      <PageHeader title="Nová přeprava" />
      <form onSubmit={handleSubmit} className="max-w-4xl bg-white rounded-xl border border-gray-200 p-6 space-y-6">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Turnus závozu" name="deliveryShiftId" value={form.deliveryShiftId} onChange={handleChange} options={shifts} />
          <FormField label="Stav" name="status" value={form.status} onChange={handleChange} options={[
            { value: "KONCEPT", label: "Koncept" },
            { value: "POTVRZENO", label: "Potvrzeno" },
          ]} />
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Identifikátory</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField label="Číslo dodacího listu" name="deliveryNoteNumber" value={form.deliveryNoteNumber} onChange={handleChange} placeholder="Číslo DL" />
          <FormField label="Číslo vážního lístku" name="weighingTicketNumber" value={form.weighingTicketNumber} onChange={handleChange} placeholder="Číslo VL" />
          <FormField label="Číslo výzvy" name="callNumber" value={form.callNumber} onChange={handleChange} placeholder="Číslo výzvy" />
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Trasa</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Lokace původu" name="originLocationId" value={form.originLocationId} onChange={handleChange} options={locations} />
          <FormField label="Místo nakládky" name="loadingPlace" value={form.loadingPlace} onChange={handleChange} placeholder="Text místa nakládky" />
          <FormField label="Místo vykládky" name="unloadingPlace" value={form.unloadingPlace} onChange={handleChange} placeholder="Text místa vykládky" />
          <FormField label="Zdrojový sklad" name="sourceWarehouseId" value={form.sourceWarehouseId} onChange={handleChange} options={warehouses} />
          <FormField label="Cílový sklad" name="targetWarehouseId" value={form.targetWarehouseId} onChange={handleChange} options={warehouses} />
          <FormField label="Elektrárna" name="powerPlantId" value={form.powerPlantId} onChange={handleChange} options={powerPlants} />
          <FormField label="Odběratel" name="customerId" value={form.customerId} onChange={handleChange} options={customers} />
        </div>

        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider pt-2">Řidič a stroj</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField label="Řidič" name="driverId" value={form.driverId} onChange={handleChange} options={drivers} />
          <FormField label="SPZ vozidla" name="vehicleSpz" value={form.vehicleSpz} onChange={handleChange} placeholder="SPZ" options={form.driverId && driverVehiclesMap[form.driverId]?.length ? driverVehiclesMap[form.driverId] : undefined} />
          <FormField label="Jméno štěpkaře" name="chipperName" value={form.chipperName} onChange={handleChange} placeholder="Jméno" />
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
            {saving ? "Ukládám..." : "Uložit přepravu"}
          </button>
          <button type="button" onClick={() => router.push("/prepravy")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zrušit
          </button>
        </div>
      </form>
    </>
  );
}
