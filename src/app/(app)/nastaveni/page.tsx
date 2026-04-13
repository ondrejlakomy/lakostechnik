"use client";

import PageHeader from "@/components/ui/PageHeader";

export default function NastaveniPage() {
  return (
    <>
      <PageHeader title="Nastavení" description="Systémové nastavení" />
      <div className="max-w-2xl bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Číselné řady
          </h3>
          <p className="text-sm text-gray-600">
            Automatické číslování dodáků ve formátu <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">LOK-DRI-0001-2026</code>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Sekvence se automaticky resetují na začátku každého roku. Prefix je generován z kódu lokace a kódu řidiče.
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Systém
          </h3>
          <div className="text-sm text-gray-600 space-y-2">
            <p>Verze: 1.0.0 MVP</p>
            <p>Databáze: PostgreSQL + Prisma ORM</p>
          </div>
        </div>
      </div>
    </>
  );
}
