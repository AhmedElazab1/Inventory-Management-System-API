import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Sale, Product } from "../types";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import { AxiosError } from "axios";

interface CartItem {
  variantId: string;
  productName: string;
  variantSize: string;
  quantity: number;
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  const [createOpen, setCreateOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [selectedVariant, setSelectedVariant] = useState("");
  const [qty, setQty] = useState("1");
  const [saving, setSaving] = useState(false);
  const [saleError, setSaleError] = useState("");

  const [detailSale, setDetailSale] = useState<Sale | null>(null);

  const fetchSales = () => {
    setLoading(true);
    api.get("/v1/sales")
      .then((res) => setSales(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSales();
    api.get("/v1/product").then((res) => setProducts(res.data.data ?? []));
  }, []);

  const selectedProductObj = products.find((p) => p.id === selectedProduct);

  const addToCart = () => {
    if (!selectedVariant || !qty || parseInt(qty) < 1) return;
    const variant = selectedProductObj?.variants.find((v) => v.id === selectedVariant);
    if (!variant || !selectedProductObj) return;
    const exists = cart.find((c) => c.variantId === selectedVariant);
    if (exists) {
      setCart(cart.map((c) => c.variantId === selectedVariant ? { ...c, quantity: c.quantity + parseInt(qty) } : c));
    } else {
      setCart([...cart, {
        variantId: selectedVariant,
        productName: selectedProductObj.name,
        variantSize: variant.size,
        quantity: parseInt(qty),
      }]);
    }
    setSelectedProduct("");
    setSelectedVariant("");
    setQty("1");
  };

  const removeFromCart = (variantId: string) => {
    setCart(cart.filter((c) => c.variantId !== variantId));
  };

  const handleCreateSale = async () => {
    if (cart.length === 0) return;
    setSaving(true);
    setSaleError("");
    try {
      await api.post("/v1/sales", { items: cart.map((c) => ({ variantId: c.variantId, quantity: c.quantity })) });
      setCreateOpen(false);
      setCart([]);
      fetchSales();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: any }>;
      const raw = axiosErr.response?.data?.message;
      setSaleError(
        typeof raw === "string"
          ? raw
          : raw?.details && Array.isArray(raw.details)
          ? raw.details.map((d: any) => d.message).join(", ")
          : raw?.message && typeof raw.message === "string"
          ? raw.message
          : "حدث خطأ"
      );
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => `${n.toLocaleString("ar-EG")} ج.م`;

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المبيعات</h1>
          <p className="text-gray-500 text-sm mt-1">{sales.length} فاتورة</p>
        </div>
        <button
          onClick={() => { setCreateOpen(true); setCart([]); setSaleError(""); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <span>+</span> فاتورة جديدة
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-right px-5 py-3 font-semibold text-gray-600">رقم الفاتورة</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الكاشير</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الإجمالي</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الربح</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">التاريخ</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {sales.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">لا توجد فواتير</td>
                </tr>
              ) : (
                sales.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-gray-500 text-xs">{s.id.slice(0, 8)}...</td>
                    <td className="px-5 py-3.5 font-medium text-gray-800">{s.cashier?.name ?? "—"}</td>
                    <td className="px-5 py-3.5 font-semibold text-gray-700">{fmt(s.totalAmount)}</td>
                    <td className="px-5 py-3.5 text-emerald-600 font-semibold">{fmt(s.totalAmount - s.totalCost)}</td>
                    <td className="px-5 py-3.5 text-gray-400">{new Date(s.createdAt).toLocaleString("ar-EG")}</td>
                    <td className="px-5 py-3.5">
                      <button
                        onClick={() => setDetailSale(s)}
                        className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
                      >تفاصيل</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Create Sale Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="فاتورة بيع جديدة" width="max-w-2xl">
        <div className="space-y-4">
          {saleError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{saleError}</p>
          )}

          {/* Add Item Row */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">إضافة منتج للفاتورة</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">المنتج</label>
                <select
                  value={selectedProduct}
                  onChange={(e) => { setSelectedProduct(e.target.value); setSelectedVariant(""); }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">اختر منتج</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">المقاس</label>
                <select
                  value={selectedVariant}
                  onChange={(e) => setSelectedVariant(e.target.value)}
                  disabled={!selectedProductObj}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:opacity-50"
                >
                  <option value="">اختر مقاس</option>
                  {selectedProductObj?.variants.map((v) => (
                    <option key={v.id} value={v.id}>{v.size} (متاح: {v.quantity})</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <label className="text-xs text-gray-500 block mb-1">الكمية</label>
                <input
                  type="number"
                  min="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addToCart}
                disabled={!selectedVariant}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                إضافة
              </button>
            </div>
          </div>

          {/* Cart Items */}
          {cart.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-gray-700">العناصر ({cart.length})</p>
              {cart.map((item) => (
                <div key={item.variantId} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.productName}</p>
                    <p className="text-xs text-gray-400">مقاس: {item.variantSize}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-700">× {item.quantity}</span>
                    <button
                      onClick={() => removeFromCart(item.variantId)}
                      className="text-red-400 hover:text-red-600 text-lg leading-none"
                    >×</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button onClick={() => setCreateOpen(false)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
              إلغاء
            </button>
            <button
              onClick={handleCreateSale}
              disabled={saving || cart.length === 0}
              className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? "جاري الإنشاء..." : "إنشاء الفاتورة"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailSale} onClose={() => setDetailSale(null)} title="تفاصيل الفاتورة" width="max-w-xl">
        {detailSale && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">الكاشير</p>
                <p className="font-medium text-gray-800 mt-0.5">{detailSale.cashier?.name}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs">التاريخ</p>
                <p className="font-medium text-gray-800 mt-0.5">{new Date(detailSale.createdAt).toLocaleString("ar-EG")}</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3">
                <p className="text-emerald-600 text-xs">الإجمالي</p>
                <p className="font-bold text-emerald-700 text-lg mt-0.5">{fmt(detailSale.totalAmount)}</p>
              </div>
              <div className="bg-blue-50 rounded-xl p-3">
                <p className="text-blue-500 text-xs">الربح</p>
                <p className="font-bold text-blue-600 text-lg mt-0.5">{fmt(detailSale.totalAmount - detailSale.totalCost)}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">الأصناف</p>
              <div className="space-y-2">
                {detailSale.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{item.variant.product.name}</p>
                      <p className="text-xs text-gray-400">مقاس: {item.variant.size} × {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-700">{fmt(item.priceAtSale * item.quantity)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
