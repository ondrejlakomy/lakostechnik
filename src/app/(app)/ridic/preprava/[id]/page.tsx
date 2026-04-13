"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import StatusBadge from "@/components/ui/StatusBadge";

interface Transport {
  id: string;
  number: string;
  status: string;
  deliveryNoteNumber: string | null;
  weighingTicketNumber: string | null;
  callNumber: string | null;
  loadingPlace: string | null;
  unloadingPlace: string | null;
  chipperName: string | null;
  vehicleSpz: string | null;
  kilometers: number | null;
  nettoWeight: number | null;
  prm: number | null;
  createdAt: string;
  deliveryShift: { name: string } | null;
}

export default function RidicDetailPrepravaPage() {
  const params = useParams();
  const router = useRouter();
  const [transport, setTransport] = useState<Transport | null>(null);

  useEffect(() => {
    fetch(`/api/prepravy/${params.id}`)
      .then((r) => r.json())
      .then(setTransport);
  }, [params.id]);

  if (!transport) return <p className="text-center text-gray-500 py-8">Načítání...</p>;

  const rows = [
    { label: "Číslo", value: transport.number },
    { label: "Datum", value: new Date(transport.createdAt).toLocaleDateString("cs-CZ") },
    { label: "Turnus závozu", value: transport.deliveryShift?.name },
    { label: "Číslo dodacího listu", value: transport.deliveryNoteNumber },
    { label: "Číslo vážního lístku", value: transport.weighingTicketNumber },
    { label: "Číslo výzvy", value: transport.callNumber },
    { label: "Místo nakládky", value: transport.loadingPlace },
    { label: "Místo vykládky", value: transport.unloadingPlace },
    { label: "Jméno štěpkaře", value: transport.chipperName },
    { label: "SPZ vozidla", value: transport.vehicleSpz },
    { label: "Ujeté km", value: transport.kilometers },
    { label: "Netto váha (t)", value: transport.nettoWeight },
    { label: "PRM", value: transport.prm },
  ];

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Detail přepravy</h1>
        <div className="mt-2">
          <StatusBadge status={transport.status} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between px-5 py-3">
            <span className="text-sm text-gray-500">{row.label}</span>
            <span className="text-sm font-medium text-gray-900">{row.value ?? "–"}</span>
          </div>
        ))}
      </div>

      <button
        onClick={() => router.push("/ridic")}
        className="w-full mt-6 py-4 px-6 bg-gray-100 hover:bg-gray-200 text-gray-700 text-lg font-medium rounded-xl transition"
      >
        Zpět na přehled
      </button>
    </div>
  );
}
