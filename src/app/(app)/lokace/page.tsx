"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface Location {
  id: string;
  name: string;
  code: string;
  address: string | null;
  active: boolean;
}

export default function LokacePage() {
  const [data, setData] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/lokace");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/lokace/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Lokace deaktivována");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<Location>[] = [
    { key: "code", label: "Kód" },
    { key: "name", label: "Název" },
    { key: "address", label: "Adresa", render: (item) => item.address || "–" },
    { key: "active", label: "Stav", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Lokace" description="Místa výroby biomasy" action={{ label: "Nová lokace", href: "/lokace/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/lokace/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádné lokace"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat lokaci?"
        message="Lokace bude označena jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
