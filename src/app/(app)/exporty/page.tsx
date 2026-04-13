"use client";

import { useState } from "react";
import PageHeader from "@/components/ui/PageHeader";
import toast from "react-hot-toast";

export default function ExportyPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: string, entity: string) => {
    setExporting(true);
    const params = new URLSearchParams({ format, entity });
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);

    try {
      const res = await fetch(`/api/exporty?${params}`);
      if (!res.ok) {
        toast.error("Chyba exportu");
        setExporting(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `export_${entity}_${new Date().toISOString().split("T")[0]}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Export stažen");
    } catch {
      toast.error("Chyba exportu");
    }
    setExporting(false);
  };

  return (
    <>
      <PageHeader title="Exporty" description="Export dat do CSV" />

      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Filtr období
          </h3>
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Od</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Do</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-300 text-sm"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Dostupné exporty
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">Přepravy / Dodáky</p>
                <p className="text-sm text-gray-500">Kompletní přehled přeprav za vybrané období</p>
              </div>
              <button
                onClick={() => handleExport("csv", "transports")}
                disabled={exporting}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition disabled:opacity-50"
              >
                CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
