import { useEffect, useState } from "react";
import api from "../api/axios";
import type { User, Role } from "../types";
import Modal from "../components/Modal";
import ConfirmDialog from "../components/ConfirmDialog";
import Spinner from "../components/Spinner";
import Badge from "../components/Badge";
import { AxiosError } from "axios";

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: Role;
}

const emptyForm: UserForm = { name: "", email: "", password: "", role: "CASHIER" };

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    api.get("/v1/user")
      .then((res) => setUsers(res.data.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (u: User) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: "", role: u.role });
    setFormError("");
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError("");
    try {
      if (editing) {
        const payload: Partial<UserForm> = { name: form.name, email: form.email, role: form.role };
        await api.patch(`/v1/user/${editing.id}`, payload);
      } else {
        await api.post("/v1/user", form);
      }
      setModalOpen(false);
      fetchUsers();
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
      await api.delete(`/v1/user/${deleteId}`);
      setDeleteId(null);
      fetchUsers();
    } finally {
      setDeleting(false);
    }
  };

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">المستخدمين</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} مستخدم مسجل</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
        >
          <span>+</span> إضافة مستخدم
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="البحث عن مستخدم..."
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
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الاسم</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">البريد الإلكتروني</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">الدور</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-600">تاريخ الإضافة</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">لا يوجد مستخدمين</td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-800">{u.name}</td>
                    <td className="px-5 py-3.5 text-gray-500">{u.email}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={u.role === "ADMIN" ? "purple" : "blue"}>
                        {u.role === "ADMIN" ? "مدير" : "كاشير"}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-gray-400">
                      {new Date(u.createdAt).toLocaleDateString("ar-EG")}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button onClick={() => openEdit(u)}
                          className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                          تعديل
                        </button>
                        <button onClick={() => setDeleteId(u.id)}
                          className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100">
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "تعديل مستخدم" : "إضافة مستخدم"}>
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم *</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="الاسم الكامل" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">البريد الإلكتروني *</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="example@email.com" />
          </div>
          {!editing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">كلمة المرور *</label>
              <input required type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••" />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white">
              <option value="CASHIER">كاشير</option>
              <option value="ADMIN">مدير</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50">
              إلغاء
            </button>
            <button type="submit" disabled={saving}
              className="px-4 py-2 text-sm rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
              {saving ? "جاري الحفظ..." : editing ? "تحديث" : "إضافة"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
    </div>
  );
}
