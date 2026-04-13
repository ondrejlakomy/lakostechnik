"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import DataTable, { Column } from "@/components/ui/DataTable";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import toast from "react-hot-toast";

interface Transport {
  id: string;
  number: string;
  status: string;
  deliveryNoteNumber: string | null;
  loadingPlace: string | null;
  unloadingPlace: string | null;
  vehicleSpz: string | null;
  nettoWeight: number | null;
  prm: number | null;
  createdAt: string;
  driver: { firstName: string; lastName: string } | null;
  deliveryShift: { name: string } | null;
  powerPlant: { name: string } | null;
  customer: { name: string } | null;
}

export default function PrepravyPage() {
  const [data, setData] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ status: "", dateFrom: "", dateTo: "" });

  const fetchData = async () => {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.dateFrom) params.set("dateFrom", filters.dateFrom);
    if (filters.dateTo) params.set("dateTo", filters.dateTo);

    const res = await fetch(`/api/prepravy?${params}`);
    if (res.ok) setData(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [filters]);

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/prepravy/${deleteId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Přeprava stornována");
      fetchData();
    }
    setDeleteId(null);
  };

  const columns: Column<Transport>[] = [
    { key: "number", label: "Číslo" },
    { key: "status", label: "Stav", render: (item) => <StatusBadge status={item.status} /> },
    {
      key: "createdAt",
      label: "Datum",
      render: (item) => new Date(item.createdAt).toLocaleDateString("cs-CZ"),
    },
    { key: "deliveryNoteNumber", label: "Dodací list", render: (item) => item.deliveryNoteNumber || "–" },
    { key: "driver", label: "Řidič", render: (item) => item.driver ? `${item.driver.firstName} ${item.driver.lastName}` : "–" },
    { key: "loadingPlace", label: "Nakládka", render: (item) => item.loadingPlace || "–" },
    { key: "unloadingPlace", label: "Vykládka", render: (item) => item.unloadingPlace || "–" },
    { key: "vehicleSpz", label: "SPZ", render: (item) => item.vehicleSpz || "–" },
    { key: "nettoWeight", label: "Netto (t)", render: (item) => item.nettoWeight?.toFixed(2) || "–" },
    { key: "prm", label: "PRM", render: (item) => item.prm?.toFixed(2) || "–" },
    { key: "shift", label: "Turnus", render: (item) => item.deliveryShift?.name || "–" },
  ];

  if (loading) return <div className="text-gray-500">Načítání...</div>;

  return (
    <>
      <PageHeader
        title="Přepravy"
        description="Evidence dodáků a přeprav"
        action={{ label: "Nová přeprava", href: "/prepravy/nova" }}
      />

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={filters.status}
          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
        >
          <option value="">Všechny stavy</option>
          <option value="KONCEPT">Koncept</option>
          <option value="POTVRZENO">Potvrzeno</option>
          <option value="STORNOVANO">Stornováno</option>
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          placeholder="Od"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
          placeholder="Do"
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        editHref={(item) => `/prepravy/${item.id}`}
        onDelete={(item) => setDeleteId(item.id)}
        emptyMessage="Žádné přepravy"
      />

      <ConfirmDialog
        open={!!deleteId}
        title="Stornovat přepravu?"
        message="Přeprava bude označena jako stornovaná."
        confirmLabel="Stornovat"
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </>
  );
}
