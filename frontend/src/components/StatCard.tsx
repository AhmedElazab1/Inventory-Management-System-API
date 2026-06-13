// StatCard.tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: "blue" | "green" | "amber" | "red" | "purple";
  subtitle?: string;
}

const colors = {
  blue: { bg: "bg-blue-50", icon: "bg-blue-100 text-blue-600", text: "text-blue-600" },
  green: { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-600", text: "text-emerald-600" },
  amber: { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-600", text: "text-amber-600" },
  red: { bg: "bg-red-50", icon: "bg-red-100 text-red-600", text: "text-red-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-100 text-purple-600", text: "text-purple-600" },
};

export default function StatCard({ title, value, icon, color, subtitle }: StatCardProps) {
  const c = colors[color];
  return (
    <div className={`rounded-2xl p-5 ${c.bg} flex items-center gap-4`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${c.icon} shrink-0`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 truncate">{title}</p>
        <p className={`text-2xl font-bold ${c.text}`}>{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
}
