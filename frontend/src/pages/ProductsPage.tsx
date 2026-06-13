import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Product, Category } from "../types";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import Badge from "../components/Badge";
import { AxiosError } from "axios";

interface ProductForm {
  name: string;
  description: string;
  costPrice: string;
  sellingPrice: string;
  lowStockThreshold: string;
  categoryId: string;
}

const emptyForm: ProductForm = {
  name: "",
  description: "",
  costPrice: "",
  sellingPrice: "",
  lowStockThreshold: "5",
  categoryId: "",
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([api.get("/v1/product"), api.get("/v1/category")])
      .then(([prod, cat]) => {
        setProducts(prod.data.data ?? []);
        setCategories(cat.data.data ?? []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      costPrice: String(p.costPrice),
      sellingPrice: String(p.sellingPrice),
      lowStockThreshold: String(p.lowStockThreshold),
      categoryId: p.category.id,
    });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    const payload = {
      name: form.name,
      description: form.description || undefined,
      costPrice: parseFloat(form.costPrice),
      sellingPrice: parseFloat(form.sellingPrice),
      lowStockThreshold: parseInt(form.lowStockThreshold),
      categoryId: form.categoryId,
    };
    try {
      if (editing) {
        await api.patch(`/v1/product/${editing.id}`, payload);
      } else {
        await api.post("/v1/product", payload);
      }
      setModalOpen(false);
      fetchAll();
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: any }>;
      const raw = axiosErr.response?.data?.message;
      setFormError(
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

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await api.delete(`/v1/product/${deleteId}`);
      setDeleteId(null);
      fetchAll();
    } finally {
      setDeleting(false);
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.name.toLowerCase().includes(search.toLowerCase())
  );

  const fmt = (n: number) => `${n.toLocaleString("ar-EG")} ج.م`;

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المنتجات</h1>
          <p className="text-gray-500 text-sm mt-1">{products.length} منتج مسجل</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <span>+</span> إضافة منتج
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="البحث عن منتج..."
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
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الصنف</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">سعر البيع</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الكمية</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الحالة</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">لا توجد منتجات</td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-gray-800">{p.name}</p>
                      {p.description && (
                        <p className="text-xs text-gray-400 truncate max-w-xs">{p.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{p.category.name}</td>
                    <td className="px-5 py-3.5 text-gray-700 font-medium">{fmt(p.sellingPrice)}</td>
                    <td className="px-5 py-3.5 text-gray-700">{p.totalQuantity}</td>
                    <td className="px-5 py-3.5">
                      {p.isLowStock ? (
                        <Badge variant="red">مخزون منخفض</Badge>
                      ) : (
                        <Badge variant="green">متاح</Badge>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(p)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                        >تعديل</button>
                        <button
                          onClick={() => setDeleteId(p.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                        >حذف</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "تعديل منتج" : "إضافة منتج جديد"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="اسم المنتج"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={2}
              placeholder="اختياري"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سعر التكلفة *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع *</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                value={form.sellingPrice}
                onChange={(e) => setForm({ ...form, sellingPrice: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">حد المخزون المنخفض</label>
              <input
                type="number"
                min="0"
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الصنف *</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="">اختر صنف</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50"
            >إلغاء</button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
            >{saving ? "جاري الحفظ..." : editing ? "تحديث" : "إضافة"}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
