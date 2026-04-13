"use client";

import { signOut, useSession } from "next-auth/react";
import { Bars3Icon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import { ROLE_LABELS } from "@/lib/permissions";
import { Role } from "@/lib/permissions";

export default function TopBar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const { data: session } = useSession();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 text-gray-500 hover:text-gray-700 rounded-lg"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      <div className="lg:block hidden" />

      <div className="flex items-center gap-4">
        {session?.user && (
          <div className="text-right">
            <p className="text-sm font-medium text-gray-900">{session.user.name}</p>
            <p className="text-xs text-gray-500">
              {ROLE_LABELS[(session.user.role as Role) || "USER_L2"]}
            </p>
          </div>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/prihlaseni" })}
          className="p-2 text-gray-500 hover:text-red-600 rounded-lg transition"
          title="Odhlásit se"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
