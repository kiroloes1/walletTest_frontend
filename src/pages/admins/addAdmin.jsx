import React, { useState } from "react";
import { UserPlus, Mail, Lock, ShieldCheck, FileText, Loader2 } from "lucide-react";
import api from "../../services/api";
import { showAlert } from "../../services/alert";

const AddAdmin = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "superadmin",
    notes: ""
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/admins/", formData);
      showAlert({ title: "تم إضافة المشرف بنجاح", icon: "success" });
      setFormData({ username: "", email: "", password: "", role: "staff", notes: "" });
    } catch (err) {
      showAlert({ 
        title: "فشل الإضافة", 
        text: err.response?.data?.message || "حدث خطأ ما", 
        icon: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-[100vw] mx-auto mt-10 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 font-['cairo']" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-cyan-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-cyan-200">
          <UserPlus size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900">إضافة مشرف جديد</h2>
          <p className="text-sm text-slate-400 font-bold">قم بإنشاء حساب جديد وتحديد صلاحياته</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* اسم المستخدم */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 mr-2 uppercase">اسم المستخدم</label>
          <div className="relative">
            <UserPlus className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="مثلاً: kirlos_reda"
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-cyan-500 outline-none transition-all text-sm font-bold"
            />
          </div>
        </div>

        {/* البريد الإلكتروني */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 mr-2 uppercase">البريد الإلكتروني</label>
          <div className="relative">
            <Mail className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-cyan-500 outline-none transition-all text-sm font-bold"
            />
          </div>
        </div>

        {/* كلمة المرور */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 mr-2 uppercase">كلمة المرور</label>
          <div className="relative">
            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-cyan-500 outline-none transition-all text-sm font-bold"
            />
          </div>
        </div>

        {/* تحديد الدور */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 mr-2 uppercase">صلاحية المستخدم (الرتبة)</label>
          <div className="relative">
            <ShieldCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <select
             disabled={true}
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-cyan-500 outline-none transition-all text-sm font-black appearance-none"
            >
              {/* <option value="staff">موظف (Staff)</option>
              <option value="manager">مدير (Manager)</option> */}
              <option value="superadmin">مدير نظام (Super Admin)</option>
            </select>
          </div>
        </div>

        {/* ملاحظات */}
        <div className="space-y-2 md:col-span-2">
          <label className="text-xs font-black text-slate-500 mr-2 uppercase">ملاحظات إضافية</label>
          <div className="relative">
            <FileText className="absolute right-3 top-3 text-slate-400" size={18} />
            <textarea
              name="notes"
              rows="3"
              value={formData.notes}
              onChange={handleChange}
              placeholder="أي ملاحظات عن المشرف..."
              className="w-full pr-10 pl-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:border-cyan-500 outline-none transition-all text-sm font-bold"
            />
          </div>
        </div>

        {/* زر الإرسال */}
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 w-full py-4 bg-cyan-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-slate-200 hover:bg-cyan-800 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : "إنشاء الحساب الآن"}
        </button>
      </form>
    </div>
  );
};

export default AddAdmin;