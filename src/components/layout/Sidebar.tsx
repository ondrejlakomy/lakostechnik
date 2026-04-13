"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Role } from "@/lib/permissions";
import { getMenuItems } from "@/lib/permissions";
import {
  HomeIcon,
  TruckIcon,
  ArrowsRightLeftIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  BoltIcon,
  ChartBarSquareIcon,
  WrenchScrewdriverIcon,
  IdentificationIcon,
  CalendarDaysIcon,
  UsersIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "/dashboard": HomeIcon,
  "/prepravy": TruckIcon,
  "/pohyby": ArrowsRightLeftIcon,
  "/lokace": MapPinIcon,
  "/sklady": BuildingOffice2Icon,
  "/odberatele": UserGroupIcon,
  "/elektrarny": BoltIcon,
  "/elektrarny/plany": ChartBarSquareIcon,
  "/stepkovace": WrenchScrewdriverIcon,
  "/ridici": IdentificationIcon,
  "/turnusy": CalendarDaysIcon,
  "/uzivatele": UsersIcon,
  "/exporty": ArrowDownTrayIcon,
  "/nastaveni": Cog6ToothIcon,
};

export default function Sidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const role = (session?.user?.role as Role) || "USER_L2";

  const menuItems = getMenuItems(role);

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <Link href="/dashboard">
            <Image src="/logo.png" alt="LAKOSTECHNIK" width={150} height={34} className="h-7 w-auto" />
          </Link>
          <button onClick={onClose} className="lg:hidden p-1 text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100%-4rem)]">
          {menuItems.map((item) => {
            const Icon = ICONS[item.href] || HomeIcon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-green-50 text-green-700"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
