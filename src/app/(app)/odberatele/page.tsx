"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface Customer {
  id: string;
  name: string;
  ico: string | null;
  contactPerson: string | null;
  phone: string | null;
  active: boolean;
}

export default function OdberatelePage() {
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/odberatele");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/odberatele/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Odběratel deaktivován");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<Customer>[] = [
    { key: "name", label: "Název" },
    { key: "ico", label: "IČO", render: (item) => item.ico || "–" },
    { key: "contactPerson", label: "Kontaktní osoba", render: (item) => item.contactPerson || "–" },
    { key: "phone", label: "Telefon", render: (item) => item.phone || "–" },
    { key: "active", label: "Stav", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Odběratelé" description="Správa odběratelů" action={{ label: "Nový odběratel", href: "/odberatele/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/odberatele/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádní odběratelé"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat odběratele?"
        message="Odběratel bude označen jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
