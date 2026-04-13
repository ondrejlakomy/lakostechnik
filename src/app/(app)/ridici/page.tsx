"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  code: string;
  phone: string | null;
  defaultSpz: string | null;
  note: string | null;
  vehicles: { id: string; spz: string; name: string | null }[];
  active: boolean;
}

export default function RidiciPage() {
  const [data, setData] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/ridici");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/ridici/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Řidič deaktivován");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<Driver>[] = [
    { key: "code", label: "Kód" },
    { key: "lastName", label: "Jméno", render: (item) => `${item.firstName} ${item.lastName}` },
    { key: "phone", label: "Telefon", render: (item) => item.phone || "–" },
    { key: "vehicles", label: "SPZ", render: (item) =>
      item.vehicles && item.vehicles.length > 0
        ? item.vehicles.map((v) => (
            <span key={v.id} className="inline-block bg-gray-100 rounded px-2 py-0.5 text-xs font-medium mr-1 mb-0.5">
              {v.spz}{v.name ? ` (${v.name})` : ""}
            </span>
          ))
        : "–"
    },
    { key: "note", label: "Poznámka", render: (item) => item.note || "–" },
    { key: "active", label: "Stav", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Řidiči" description="Evidence řidičů" action={{ label: "Nový řidič", href: "/ridici/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/ridici/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádní řidiči"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat řidiče?"
        message="Řidič bude označen jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
