import { useEffect, useState } from "react";
import api from "../api/axios";
import StatCard from "../components/StatCard";
import Spinner from "../components/Spinner";

interface Summary {
  totalSalesCount: number;
  totalSalesAmount: number;
  totalCost: number;
  profit: number;
  lowStockCount?: number;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/v1/reports/summary")
      .then((res) => setSummary(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );

  const fmt = (n: number) =>
    new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP" }).format(n);

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">لوحة التحكم</h1>
        <p className="text-gray-500 text-sm mt-1">نظرة عامة على أداء المحل</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="إجمالي المبيعات"
          value={summary?.totalSalesCount ?? 0}
          icon="🧾"
          color="blue"
          subtitle="عدد الفواتير"
        />
        <StatCard
          title="الإيرادات"
          value={fmt(summary?.totalSalesAmount ?? 0)}
          icon="💰"
          color="green"
          subtitle="إجمالي المبيعات"
        />
        <StatCard
          title="التكلفة"
          value={fmt(summary?.totalCost ?? 0)}
          icon="📉"
          color="amber"
          subtitle="إجمالي التكلفة"
        />
        <StatCard
          title="الأرباح"
          value={fmt(summary?.profit ?? 0)}
          icon="📈"
          color="purple"
          subtitle="الإيرادات - التكلفة"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-700 mb-1">هامش الربح</h2>
        {summary && summary.totalSalesAmount > 0 ? (
          <>
            <p className="text-3xl font-bold text-emerald-600">
              {((summary.profit / summary.totalSalesAmount) * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-400 mt-1">من إجمالي الإيرادات</p>
          </>
        ) : (
          <p className="text-gray-400 text-sm">لا توجد بيانات كافية</p>
        )}
      </div>
    </div>
  );
}
