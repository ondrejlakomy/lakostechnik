"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

interface Transport {
  id: string;
  number: string;
  status: string;
  loadingPlace: string | null;
  unloadingPlace: string | null;
  nettoWeight: number | null;
  prm: number | null;
  createdAt: string;
}

export default function RidicPrehledPage() {
  const { data: session } = useSession();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepravy")
      .then((r) => r.json())
      .then((d) => { setTransports(d); setLoading(false); });
  }, []);

  return (
    <div className="max-w-lg mx-auto">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Moje přepravy</h1>
        <p className="text-gray-500 mt-1">
          {session?.user?.name}
        </p>
      </div>

      <Link
        href="/ridic/nova-preprava"
        className="block w-full py-4 px-6 bg-green-600 hover:bg-green-700 text-white text-center text-lg font-bold rounded-xl transition mb-6 shadow-sm"
      >
        + Nová přeprava
      </Link>

      {loading ? (
        <p className="text-center text-gray-500">Načítání...</p>
      ) : transports.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Zatím žádné přepravy</p>
      ) : (
        <div className="space-y-3">
          {transports.map((t) => (
            <Link
              key={t.id}
              href={`/ridic/preprava/${t.id}`}
              className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-green-300 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">{t.number}</span>
                <StatusBadge status={t.status} />
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{new Date(t.createdAt).toLocaleDateString("cs-CZ")} {new Date(t.createdAt).toLocaleTimeString("cs-CZ", { hour: "2-digit", minute: "2-digit" })}</p>
                {t.loadingPlace && <p>Nakládka: {t.loadingPlace}</p>}
                {t.unloadingPlace && <p>Vykládka: {t.unloadingPlace}</p>}
                <div className="flex gap-4 mt-1">
                  {t.nettoWeight != null && <span className="font-medium">{t.nettoWeight} t</span>}
                  {t.prm != null && <span className="font-medium">{t.prm} PRM</span>}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
