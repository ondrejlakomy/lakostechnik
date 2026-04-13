"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import ActiveBadge from "@/components/ui/ActiveBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { ROLE_LABELS } from "@/lib/permissions";
import toast from "react-hot-toast";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: keyof typeof ROLE_LABELS;
  active: boolean;
}

export default function UzivatelePage() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchData = async () => {
    const res = await fetch("/api/uzivatele");
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/uzivatele/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Uživatel deaktivován");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<User>[] = [
    { key: "lastName", label: "Jméno", render: (item) => `${item.firstName} ${item.lastName}` },
    { key: "email", label: "E-mail" },
    { key: "role", label: "Role", render: (item) => ROLE_LABELS[item.role] || item.role },
    { key: "active", label: "Stav", render: (item) => <ActiveBadge active={item.active} /> },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader title="Uživatelé" description="Správa uživatelů" action={{ label: "Nový uživatel", href: "/uzivatele/nova" }} />
      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/uzivatele/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádní uživatelé"
      />
      <ConfirmDialog
        open={!!deleteId}
        title="Deaktivovat uživatele?"
        message="Uživatel bude označen jako neaktivní."
        confirmLabel="Deaktivovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
