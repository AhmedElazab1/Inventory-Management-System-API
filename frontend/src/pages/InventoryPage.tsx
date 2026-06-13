import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Product, StockMovement } from "../types";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import Badge from "../components/Badge";
import { AxiosError } from "axios";

type MovementType = "IN" | "OUT" | "ADJUSTMENT";

interface MovementForm {
  variantId: string;
  quantity: string;
  reason: string;
  type: MovementType;
}

const typeLabel: Record<MovementType, string> = {
  IN: "إضافة مخزون",
  OUT: "سحب مخزون",
  ADJUSTMENT: "تعديل يدوي",
};

const typeVariant: Record<MovementType, "green" | "red" | "blue"> = {
  IN: "green",
  OUT: "red",
  ADJUSTMENT: "blue",
};

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [movModalOpen, setMovModalOpen] = useState(false);
  const [movForm, setMovForm] = useState<MovementForm>({
    variantId: "",
    quantity: "",
    reason: "",
    type: "IN",
  });
  const [movSaving, setMovSaving] = useState(false);
  const [movError, setMovError] = useState("");

  const [historyVariantId, setHistoryVariantId] = useState<string | null>(null);
  const [history, setHistory] = useState<StockMovement[]>([]);
  const [histLoading, setHistLoading] = useState(false);

  const fetchProducts = () => {
    setLoading(true);
    api.get("/v1/product")
      .then((res) => setProducts(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchProducts(); }, []);

  const openMovement = (variantId: string, type: MovementType) => {
    setMovForm({ variantId, quantity: "", reason: "", type });
    setMovError("");
    setMovModalOpen(true);
  };

  const handleMovementSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMovSaving(true);
    setMovError("");
    const endpointMap: Record<MovementType, string> = {
      IN: "/v1/inventory/stock-in",
      OUT: "/v1/inventory/stock-out",
      ADJUSTMENT: "/v1/inventory/adjust",
    };
    try {
      await api.post(endpointMap[movForm.type], {
        variantId: movForm.variantId,
        quantity: parseInt(movForm.quantity),
        reason: movForm.reason || undefined,
      });
      setMovModalOpen(false);
      fetchProducts();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: any }>;
      const raw = axiosErr.response?.data?.message;
      setMovError(
        typeof raw === "string"
          ? raw
          : raw?.details && Array.isArray(raw.details)
          ? raw.details.map((d: any) => d.message).join(", ")
          : raw?.message && typeof raw.message === "string"
          ? raw.message
          : "حدث خطأ"
      );
    } finally {
      setMovSaving(false);
    }
  };

  const openHistory = (variantId: string) => {
    setHistoryVariantId(variantId);
    setHistLoading(true);
    api.get(`/v1/inventory/${variantId}/history`)
      .then((res) => setHistory(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setHistLoading(false));
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المخزون</h1>
          <p className="text-gray-500 text-sm mt-1">إدارة حركات المخزون</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="البحث..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-72 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right px-5 py-3 font-semibold text-gray-600">المنتج</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">المقاس</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الكمية</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الحالة</th>
                <th className="px-5 py-3 font-semibold text-gray-600 text-left">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">لا توجد منتجات</td>
                </tr>
              ) : (
                filtered.flatMap((p) =>
                  p.variants.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-medium text-gray-800">{p.name}</td>
                      <td className="px-5 py-3.5 text-gray-500">{v.size}</td>
                      <td className="px-5 py-3.5">
                        <span className={`font-semibold ${v.quantity <= p.lowStockThreshold ? "text-red-600" : "text-gray-700"}`}>
                          {v.quantity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        {v.quantity <= p.lowStockThreshold ? (
                          <Badge variant="red">منخفض</Badge>
                        ) : (
                          <Badge variant="green">طبيعي</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openMovement(v.id, "IN")}
                            className="px-2.5 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
                          >+ إضافة</button>
                          <button
                            onClick={() => openMovement(v.id, "OUT")}
                            className="px-2.5 py-1 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                          >- سحب</button>
                          <button
                            onClick={() => openMovement(v.id, "ADJUSTMENT")}
                            className="px-2.5 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                          >تعديل</button>
                          <button
                            onClick={() => openHistory(v.id)}
                            className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                          >السجل</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Movement Modal */}
      <Modal
        isOpen={movModalOpen}
        onClose={() => setMovModalOpen(false)}
        title={typeLabel[movForm.type]}
        width="max-w-md"
      >
        <form onSubmit={handleMovementSubmit} className="space-y-4">
          {movError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{movError}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الكمية *</label>
            <input
              required
              type="number"
              min="1"
              value={movForm.quantity}
              onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل الكمية"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">السبب</label>
            <input
              value={movForm.reason}
              onChange={(e) => setMovForm({ ...movForm, reason: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اختياري"
            />
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setMovModalOpen(false)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
              إلغاء
            </button>
            <button type="submit" disabled={movSaving}
              className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {movSaving ? "جاري التنفيذ..." : "تأكيد"}
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={!!historyVariantId}
        onClose={() => setHistoryVariantId(null)}
        title="سجل الحركات"
        width="max-w-xl"
      >
        {histLoading ? (
          <div className="flex justify-center py-8"><Spinner /></div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {history.length === 0 ? (
              <p className="text-center text-gray-400 py-8">لا توجد حركات</p>
            ) : (
              history.map((mov) => (
                <div key={mov.id} className="flex items-center justify-between p-3 rounded-xl bg-gray-50">
                  <div>
                    <Badge variant={typeVariant[mov.type]}>{typeLabel[mov.type]}</Badge>
                    {mov.reason && <p className="text-xs text-gray-400 mt-1">{mov.reason}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${mov.type === "IN" ? "text-emerald-600" : mov.type === "OUT" ? "text-red-600" : "text-blue-600"}`}>
                      {mov.type === "OUT" ? "-" : "+"}{mov.quantity}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(mov.createdAt).toLocaleString("ar-EG")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
