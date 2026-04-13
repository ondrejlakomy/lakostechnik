"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface SelectOption { value: string; label: string }

export default function RidicNovaPrepravaPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    deliveryShiftId: "",
    deliveryNoteNumber: "",
    weighingTicketNumber: "",
    callNumber: "",
    loadingPlace: "",
    unloadingPlace: "",
    chipperName: "",
    vehicleSpz: "",
    kilometers: "",
    nettoWeight: "",
    prm: "",
    status: "KONCEPT",
  });

  const [shifts, setShifts] = useState<SelectOption[]>([]);
  const [locations, setLocations] = useState<SelectOption[]>([]);
  const [driverVehicles, setDriverVehicles] = useState<SelectOption[]>([]);
  const [driverId, setDriverId] = useState("");
  const [driverCode, setDriverCode] = useState("GEN");

  useEffect(() => {
    Promise.all([
      fetch("/api/turnusy").then((r) => r.json()),
      fetch("/api/lokace").then((r) => r.json()),
      fetch("/api/ridici").then((r) => r.json()),
    ]).then(([sh, loc, dr]) => {
      setShifts(sh.filter((s: any) => s.active).map((s: any) => ({ value: s.id, label: s.name })));
      setLocations(loc.filter((l: any) => l.active).map((l: any) => ({ value: l.id, label: l.name })));

      // Najít řidiče navázaného na uživatele
      if (session?.user?.driverId) {
        setDriverId(session.user.driverId);
        const driver = dr.find((d: any) => d.id === session.user.driverId);
        if (driver) {
          setDriverCode(driver.code);
          if (driver.vehicles?.length) {
            const vehs = driver.vehicles.map((v: any) => ({
              value: v.spz,
              label: v.name ? `${v.spz} (${v.name})` : v.spz,
            }));
            setDriverVehicles(vehs);
            setForm((prev) => ({ ...prev, vehicleSpz: vehs[0].value }));
          }
        }
      }

      // Předvyplnit posledním turnusem
      const activeShifts = sh.filter((s: any) => s.active && !s.closed);
      if (activeShifts.length > 0) {
        setForm((prev) => ({ ...prev, deliveryShiftId: activeShifts[0].id }));
      }
    });
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (status: "KONCEPT" | "POTVRZENO") => {
    setSaving(true);

    const payload = {
      ...form,
      status,
      driverId,
      driverCode,
      locationCode: "GEN",
    };

    const res = await fetch("/api/prepravy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      toast.success(status === "POTVRZENO" ? "Přeprava uložena a potvrzena" : "Koncept uložen");
      router.push("/ridic");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-lg mx-auto pb-8">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Nová přeprava</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">

        {/* Turnus závozu */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Turnus závozu
          </label>
          <select
            name="deliveryShiftId"
            value={form.deliveryShiftId}
            onChange={handleChange}
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="">-- Vyberte --</option>
            {shifts.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Číslo dodacího listu */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Číslo dodacího listu
          </label>
          <input
            name="deliveryNoteNumber"
            value={form.deliveryNoteNumber}
            onChange={handleChange}
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Zadejte číslo"
          />
        </div>

        {/* Číslo vážního lístku */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Číslo vážního lístku
          </label>
          <input
            name="weighingTicketNumber"
            value={form.weighingTicketNumber}
            onChange={handleChange}
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Zadejte číslo"
          />
        </div>

        {/* Číslo výzvy */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Číslo výzvy
          </label>
          <input
            name="callNumber"
            value={form.callNumber}
            onChange={handleChange}
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Zadejte číslo"
          />
        </div>

        {/* Místo nakládky */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Místo nakládky <span className="text-red-500">*</span>
          </label>
          <input
            name="loadingPlace"
            value={form.loadingPlace}
            onChange={handleChange}
            required
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Zadejte místo nakládky"
          />
        </div>

        {/* Místo vykládky */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Místo vykládky <span className="text-red-500">*</span>
          </label>
          <input
            name="unloadingPlace"
            value={form.unloadingPlace}
            onChange={handleChange}
            required
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Zadejte místo vykládky"
          />
        </div>

        {/* Jméno štěpkaře */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Jméno štěpkaře
          </label>
          <input
            name="chipperName"
            value={form.chipperName}
            onChange={handleChange}
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="Jméno štěpkaře"
          />
        </div>

        {/* SPZ vozidla */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            SPZ vozidla <span className="text-red-500">*</span>
          </label>
          {driverVehicles.length > 0 ? (
            <select
              name="vehicleSpz"
              value={form.vehicleSpz}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {driverVehicles.map((v) => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          ) : (
            <input
              name="vehicleSpz"
              value={form.vehicleSpz}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500 uppercase"
              placeholder="Např. 1AB 2345"
            />
          )}
        </div>

        {/* Počet ujetých KM */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Počet ujetých km
          </label>
          <input
            name="kilometers"
            type="number"
            inputMode="decimal"
            value={form.kilometers}
            onChange={handleChange}
            step="0.1"
            min="0"
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0"
          />
        </div>

        {/* Netto váha */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            Netto váha (t) <span className="text-red-500">*</span>
          </label>
          <input
            name="nettoWeight"
            type="number"
            inputMode="decimal"
            value={form.nettoWeight}
            onChange={handleChange}
            required
            step="0.01"
            min="0"
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
          />
        </div>

        {/* PRM */}
        <div>
          <label className="block text-base font-medium text-gray-700 mb-2">
            PRM
          </label>
          <input
            name="prm"
            type="number"
            inputMode="decimal"
            value={form.prm}
            onChange={handleChange}
            step="0.01"
            min="0"
            className="w-full px-4 py-4 text-lg rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0.00"
          />
        </div>

        {/* Tlačítka */}
        <div className="space-y-3 pt-4">
          <button
            onClick={() => handleSubmit("POTVRZENO")}
            disabled={saving}
            className="w-full py-5 px-6 bg-green-600 hover:bg-green-700 text-white text-xl font-bold rounded-xl transition disabled:opacity-50 shadow-sm"
          >
            {saving ? "UKLÁDÁM..." : "ULOŽIT A POTVRDIT"}
          </button>
          <button
            onClick={() => handleSubmit("KONCEPT")}
            disabled={saving}
            className="w-full py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-medium rounded-xl transition disabled:opacity-50"
          >
            Uložit jako koncept
          </button>
        </div>
      </div>
    </div>
  );
}
