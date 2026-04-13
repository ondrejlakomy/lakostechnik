"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface DeliveryShift {
  id: string;
  name: string;
  dateFrom: string | null;
  dateTo: string | null;
  closed: boolean;
  active: boolean;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "–";
  return new Date(dateStr).toLocaleDateString("cs-CZ");
}

export default function TurnusyPage() {
  const [data, setData] = useState<DeliveryShift[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/turnusy");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/turnusy/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Turnus deaktivován");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<DeliveryShift>[] = [
    { key: "name", label: "Název" },
    { key: "dateFrom", label: "Od", render: (item) => formatDate(item.dateFrom) },
    { key: "dateTo", label: "Do", render: (item) => formatDate(item.dateTo) },
    {
      key: "closed",
      label: "Stav turnusu",
      render: (item) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${item.closed ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}>
          {item.closed ? "Uzavřený" : "Otevřený"}
        </span>
      ),
    },
    { key: "active", label: "Aktivní", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Turnusy závozu" description="Evidence turnusů" action={{ label: "Nový turnus", href: "/turnusy/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/turnusy/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádné turnusy"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat turnus?"
        message="Turnus bude označen jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
