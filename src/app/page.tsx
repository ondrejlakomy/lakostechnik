import Link from "next/link";
import Image from "next/image";
import {
  MapPinIcon,
  BuildingOffice2Icon,
  TruckIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  UsersIcon,
  CubeIcon,
  BoltIcon,
  ClipboardDocumentCheckIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Image src="/logo.png" alt="LAKOSTECHNIK" width={180} height={40} className="h-8 w-auto" />
          <Link
            href="/prihlaseni"
            className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition"
          >
            Přihlásit do aplikace
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 md:py-28 text-center">
          <Image src="/logo.png" alt="LAKOSTECHNIK" width={400} height={90} className="h-16 md:h-20 w-auto mx-auto" />
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            Evidence výroby a logistiky biomasy přehledně a jednoduše.
          </p>
          <div className="mt-8">
            <Link
              href="/prihlaseni"
              className="inline-flex px-8 py-4 bg-green-600 hover:bg-green-700 text-white text-lg font-semibold rounded-xl transition shadow-sm"
            >
              Přihlásit do aplikace
            </Link>
          </div>
        </div>
      </section>

      {/* O systému */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">O systému</h2>
            <p className="mt-3 text-lg text-gray-600 max-w-3xl mx-auto">
              Provozní systém pro komplexní evidenci výroby biomasy, řízení skladových zásob,
              přeprav a odvozů do elektráren. Navržený pro jednoduchost a rychlost práce v terénu.
            </p>
          </div>
        </div>
      </section>

      {/* Hlavní funkce */}
      <section className="py-16 md:py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Hlavní funkce</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: MapPinIcon, title: "Evidence lokací", desc: "Přehled všech míst výroby biomasy s kódy a adresami." },
              { icon: BuildingOffice2Icon, title: "Evidence skladů", desc: "Sledování zásob na meziskladech a skladech v reálném čase." },
              { icon: TruckIcon, title: "Evidence přeprav", desc: "Kompletní záznamy o přepravách s vazbami na řidiče, lokace a odběratele." },
              { icon: ChartBarIcon, title: "Dashboard", desc: "Přehledný dashboard s KPI, grafy a agregacemi za vybrané období." },
              { icon: ArrowDownTrayIcon, title: "Export dat", desc: "Export do CSV, Excelu nebo PDF pro další zpracování." },
              { icon: UsersIcon, title: "Role uživatelů", desc: "Systém oprávnění pro adminy, uživatele a řidiče." },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white rounded-xl border border-gray-200 p-6 hover:border-green-200 transition"
              >
                <item.icon className="w-8 h-8 text-green-600 mb-3" />
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Výhody */}
      <section className="py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Výhody systému</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              { icon: CubeIcon, title: "Přehled o zásobách", desc: "Aktuální stav zásob na všech skladech na jednom místě." },
              { icon: BoltIcon, title: "Přehled o odvozech", desc: "Sledování odvozů do elektráren za odběratele a období." },
              { icon: ClipboardDocumentCheckIcon, title: "Kontrola výkonu", desc: "Přehledy výkonu štěpkovačů, řidičů a najetých km." },
              { icon: ClockIcon, title: "Rychlé zadávání", desc: "Ultra jednoduchý mobilní formulář pro řidiče v terénu." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 p-5">
                <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-green-50 flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Image src="/logo.png" alt="LAKOSTECHNIK" width={160} height={36} className="h-8 w-auto brightness-0 invert" />
              <p className="mt-1 text-sm text-gray-400">Evidence výroby a logistiky biomasy</p>
            </div>
            <div className="text-center md:text-right text-sm text-gray-400 space-y-1">
              <p>Kontakt: info@lakostechnik.cz</p>
              <Link href="/prihlaseni" className="text-green-400 hover:text-green-300 transition">
                Přihlášení do aplikace
              </Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            &copy; {new Date().getFullYear()} LAKOSTECHNIK. Všechna práva vyhrazena.
          </div>
        </div>
      </footer>
    </div>
  );
}
