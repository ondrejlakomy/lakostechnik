const STATUS_STYLES: Record<string, string> = {
  KONCEPT: "bg-yellow-100 text-yellow-800",
  POTVRZENO: "bg-green-100 text-green-800",
  STORNOVANO: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  KONCEPT: "Koncept",
  POTVRZENO: "Potvrzeno",
  STORNOVANO: "Stornováno",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        STATUS_STYLES[status] || "bg-gray-100 text-gray-800"
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}
