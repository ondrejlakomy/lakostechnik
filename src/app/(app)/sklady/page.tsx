"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

const typeLabels: Record<string, string> = {
  MEZISKLAD: "Mezisklad",
  SKLAD: "Sklad",
  JINY: "Jiný",
};

interface Warehouse {
  id: string;
  name: string;
  code: string;
  type: string;
  currentStock: number;
  unit: string;
  active: boolean;
  location?: { name: string } | null;
}

export default function SkladyPage() {
  const [data, setData] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/sklady");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/sklady/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Sklad deaktivován");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<Warehouse>[] = [
    { key: "code", label: "Kód" },
    { key: "name", label: "Název" },
    { key: "type", label: "Typ", render: (item) => typeLabels[item.type] || item.type },
    { key: "currentStock", label: "Stav skladu", render: (item) => `${item.currentStock} ${item.unit}` },
    { key: "active", label: "Stav", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Sklady" description="Evidence skladů a meziskladů" action={{ label: "Nový sklad", href: "/sklady/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/sklady/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádné sklady"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat sklad?"
        message="Sklad bude označen jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
