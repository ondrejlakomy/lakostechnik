"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface PowerPlant {
  id: string;
  name: string;
  address: string | null;
  contactPerson: string | null;
  phone: string | null;
  active: boolean;
}

export default function ElektrarnyPage() {
  const [data, setData] = useState<PowerPlant[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/elektrarny");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/elektrarny/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Elektrárna deaktivována");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<PowerPlant>[] = [
    { key: "name", label: "Název" },
    { key: "address", label: "Adresa", render: (item) => item.address || "–" },
    { key: "contactPerson", label: "Kontaktní osoba", render: (item) => item.contactPerson || "–" },
    { key: "phone", label: "Telefon", render: (item) => item.phone || "–" },
    { key: "active", label: "Stav", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Elektrárny" description="Místa finálního odběru" action={{ label: "Nová elektrárna", href: "/elektrarny/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/elektrarny/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádné elektrárny"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat elektrárnu?"
        message="Elektrárna bude označena jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
