"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import FormField from "@/components/ui/FormField";
import { ROLE_LABELS } from "@/lib/permissions";
import toast from "react-hot-toast";

const roleOptions = Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label }));

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
}

export default function EditUzivatelPage() {
  const router = useRouter();
  const params = useParams();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "USER_L2", driverId: "", active: true });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch(`/api/uzivatele/${params.id}`).then((r) => r.json()),
      fetch("/api/ridici").then((r) => r.json()),
    ]).then(([user, driverList]) => {
      setForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || "",
        password: "",
        role: user.role,
        driverId: user.driverId || "",
        active: user.active,
      });
      setDrivers(driverList);
      setLoading(false);
    });
  }, [params.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch(`/api/uzivatele/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Uživatel uložen");
      router.push("/uzivatele");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  const driverOptions = drivers.map((d) => ({ value: d.id, label: `${d.firstName} ${d.lastName}` }));

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Upravit uživatele" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Jméno" name="firstName" value={form.firstName} onChange={handleChange} required />
        <FormField label="Příjmení" name="lastName" value={form.lastName} onChange={handleChange} required />
        <FormField label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required />
        <FormField label="Telefon" name="phone" value={form.phone} onChange={handleChange} />
        <FormField label="Heslo" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Ponechte prázdné pro zachování" />
        <FormField label="Role" name="role" value={form.role} onChange={handleChange} required options={roleOptions} />
        <FormField label="Řidič" name="driverId" value={form.driverId} onChange={handleChange} options={driverOptions} />
        <div className="flex items-center gap-2">
          <input type="checkbox" id="active" name="active" checked={form.active} onChange={handleChange} className="w-4 h-4 rounded border-gray-300 text-green-600 focus:ring-green-500" />
          <label htmlFor="active" className="text-sm text-gray-700">Aktivní</label>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition disabled:opacity-50">
            {saving ? "Ukládám..." : "Uložit"}
          </button>
          <button type="button" onClick={() => router.push("/uzivatele")} className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition">
            Zrušit
          </button>
        </div>
      </form>
    </>
  );
}
