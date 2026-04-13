"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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

export default function NovyUzivatelPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", password: "", role: "USER_L2", driverId: "" });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/ridici")
      .then((r) => r.json())
      .then((d) => setDrivers(d));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/uzivatele", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      toast.success("Uživatel vytvořen");
      router.push("/uzivatele");
    } else {
      const data = await res.json();
      toast.error(data.error || "Chyba při ukládání");
    }
    setSaving(false);
  };

  const driverOptions = drivers.map((d) => ({ value: d.id, label: `${d.firstName} ${d.lastName}` }));

  return (
    <>
      <PageHeader title="Nový uživatel" />
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <FormField label="Jméno" name="firstName" value={form.firstName} onChange={handleChange} required placeholder="Jméno" />
        <FormField label="Příjmení" name="lastName" value={form.lastName} onChange={handleChange} required placeholder="Příjmení" />
        <FormField label="E-mail" name="email" type="email" value={form.email} onChange={handleChange} required placeholder="E-mail" />
        <FormField label="Telefon" name="phone" value={form.phone} onChange={handleChange} placeholder="Telefon" />
        <FormField label="Heslo" name="password" type="password" value={form.password} onChange={handleChange} required placeholder="Heslo" />
        <FormField label="Role" name="role" value={form.role} onChange={handleChange} required options={roleOptions} />
        <FormField label="Řidič" name="driverId" value={form.driverId} onChange={handleChange} options={driverOptions} />
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
