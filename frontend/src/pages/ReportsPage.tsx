import { useEffect, useState } from "react";
import api from "../api/axios";
import Spinner from "../components/Spinner";
import Badge from "../components/Badge";

interface TopProduct {
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

interface LowStockItem {
  productName: string;
  variantSize: string;
  quantity: number;
  lowStockThreshold: number;
}

interface CashierReport {
  cashierName: string;
  email: string;
  totalSales: number;
  totalRevenue: number;
}

export default function ReportsPage() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [cashiers, setCashiers] = useState<CashierReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/v1/reports/top-products"),
      api.get("/v1/reports/low-stock"),
      api.get("/v1/reports/cashier"),
    ])
      .then(([top, low, cash]) => {
        setTopProducts(top.data.data ?? []);
        setLowStock(low.data.data ?? []);
        setCashiers(cash.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => `${n.toLocaleString("ar-EG")} ج.م`;

  if (loading)
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    );

  return (
    <div className="p-8 space-y-8" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">التقارير</h1>
        <p className="text-gray-500 text-sm mt-1">تقارير الأداء والمخزون</p>
      </div>

      {/* Top Products */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">🏆 أكثر المنتجات مبيعاً</h2>
        </div>
        {topProducts.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">لا توجد بيانات</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-right px-5 py-3 font-semibold text-gray-600">#</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">المنتج</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الكمية المباعة</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الإيرادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {topProducts.map((p, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-5 py-3 font-medium text-gray-800">{p.productName}</td>
                  <td className="px-5 py-3 text-gray-600">{p.totalQuantity}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">{fmt(p.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Low Stock */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">⚠️ المنتجات ذات المخزون المنخفض</h2>
        </div>
        {lowStock.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">لا توجد منتجات ذات مخزون منخفض 🎉</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-right px-5 py-3 font-semibold text-gray-600">المنتج</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">المقاس</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الكمية الحالية</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الحد الأدنى</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {lowStock.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">{item.productName}</td>
                  <td className="px-5 py-3 text-gray-500">{item.variantSize}</td>
                  <td className="px-5 py-3 font-bold text-red-600">{item.quantity}</td>
                  <td className="px-5 py-3 text-gray-400">{item.lowStockThreshold}</td>
                  <td className="px-5 py-3">
                    <Badge variant="red">منخفض</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Cashier Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-50">
          <h2 className="font-semibold text-gray-800">👥 أداء الكاشيرين</h2>
        </div>
        {cashiers.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">لا توجد بيانات</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الكاشير</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">البريد</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">عدد المبيعات</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الإيرادات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {cashiers.map((c, i) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="px-5 py-3 font-medium text-gray-800">{c.cashierName}</td>
                  <td className="px-5 py-3 text-gray-400">{c.email}</td>
                  <td className="px-5 py-3 text-gray-700">{c.totalSales}</td>
                  <td className="px-5 py-3 font-semibold text-emerald-600">{fmt(c.totalRevenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
