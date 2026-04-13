"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface Chipper {
  id: string;
  name: string;
  internalCode: string | null;
  serialNumber: string | null;
  active: boolean;
}

export default function StepkovacePage() {
  const [data, setData] = useState<Chipper[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/stepkovace");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/stepkovace/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Štěpkovač deaktivován");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<Chipper>[] = [
    { key: "name", label: "Název" },
    { key: "internalCode", label: "Interní kód", render: (item) => item.internalCode || "–" },
    { key: "serialNumber", label: "Sériové číslo", render: (item) => item.serialNumber || "–" },
    { key: "active", label: "Stav", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Štěpkovače" description="Evidence strojů" action={{ label: "Nový štěpkovač", href: "/stepkovace/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/stepkovace/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádné štěpkovače"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat štěpkovač?"
        message="Štěpkovač bude označen jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
