import React, { useEffect, useState } from "react";
import { 
  Users, Trash2, Edit3, Shield, 
  CheckCircle2, XCircle, Search, 
  MoreVertical, UserCheck, Loader2 
} from "lucide-react";
import api from "../../services/api";
import { showAlert } from "../../services/alert";
import {showAlertConfirm} from "../../services/alertConfirm"

const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // جلب البيانات من السيرفر
  const fetchAdmins = async () => {
    try {
      const res = await api.get("/admins"); 
      console.log(res.data)
      setAdmins(res.data.admins || res.data.data);
    } catch (err) {
      showAlert({ title: "فشل تحميل البيانات", icon: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  // تفعيل أو تعطيل الحساب
  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/admins/${id}/toggle-active`);
      fetchAdmins();
      showAlert({ title: "تم تغيير حالة الحساب", icon: "success" });
    } catch (err) {
      showAlert({ title: "فشل الإجراء", icon: "error" });
    }
  };

  // حذف الأدمن
  const handleDelete = async (id, name) => {
    const confirm = await showAlertConfirm({
      title: `حذف ${name}?`,
      text: "لا يمكن التراجع عن هذا الإجراء!",
    });

    if (confirm.isConfirmed) {
      try {
        await api.delete(`/admins/${id}`);
        setAdmins(admins.filter(a => a._id !== id));
        showAlert({ title: "تم الحذف", icon: "success" });
      } catch (err) {
        showAlert({ title: "فشل الحذف", icon: "error" });
      }
    }
  };

  // تغيير الدور (Role)
  const handleChangeRole = async (id, newRole) => {
    try {
      await api.patch(`/admins/changeRole/${id}`, { role: newRole });
      fetchAdmins();
      showAlert({ title: "تم تحديث الصلاحية", icon: "success" });
    } catch (err) {
      showAlert({ title: "فشل التحديث", icon: "error" });
    }
  };

  const filteredAdmins = admins.filter(a => 
    a.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
    a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return (
    <div className="font-['cairo'] h-96 flex items-center justify-center">
      <Loader2 className="animate-spin text-cyan-500" size={40} />
    </div>
  );

return (
    <div className="font-['cairo'] max-w-[100vw] p-6 space-y-6" dir="rtl">
      {/* Header & Search Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-[#0F172A] flex items-center gap-2">
            <Shield className="text-cyan-600" /> إدارة المشرفين
          </h2>
          <p className="text-slate-400 text-sm font-bold">عرض وتعديل صلاحيات حسابات المصنع</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:border-[#FF8C33] outline-none transition-all text-sm font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider">المشرف</th>
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider">البريد الإلكتروني</th>
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider">الصلاحية</th>
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider text-center">الحالة</th>
                <th className="p-5 text-xs font-black text-slate-500 uppercase tracking-wider text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredAdmins.map((admin) => (
                <tr key={admin._id} className="hover:bg-slate-50/30 transition-colors group">
                  {/* المشرف */}
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-500 shadow-sm">
                        {admin.username[0].toUpperCase()}
                      </div>
                      <span className="font-black text-slate-700 text-sm">{admin.username}</span>
                    </div>
                  </td>

                  {/* البريد */}
                  <td className="p-5 text-sm font-medium text-slate-500 italic">
                    {admin.email}
                  </td>

                  {/* الصلاحية (Role Selection) */}
                  <td className="p-5">
                    <select 
                      value={admin.role}
                      onChange={(e) => handleChangeRole(admin._id, e.target.value)}
                      className="bg-slate-100 border-none text-[11px] font-black text-[#0F172A] rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-cyan-100 hover:text-cyan-600 transition-all"
                    >
                      {/* <option value="staff">موظف (Staff)</option>
                      <option value="manager">مدير (Manager)</option> */}
                      <option value="superadmin">سوبر أدمن</option>
                    </select>
                  </td>

                  {/* الحالة */}
                  <td className="p-5 text-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black ${admin.isVerified !== false ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ml-2 ${admin.isVerified !== false ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                      {admin.isVerified !== false ? 'نشط' : 'معطل'}
                    </span>
                  </td>

                  {/* الإجراءات */}
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleToggleActive(admin._id)}
                        className={`p-2 rounded-xl transition-all shadow-sm ${admin.isVerified !== false ? 'bg-cyan-50 text-cyan-500 hover:bg-cyan-500 hover:text-white' : 'bg-emerald-50 text-emerald-500 hover:bg-emerald-500 hover:text-white'}`}
                        title={admin.isVerified !== false ? "تعطيل الحساب" : "تفعيل الحساب"}
                      >
                        {admin.isVerified !== false ? <XCircle size={18} /> : <CheckCircle2 size={18} />}
                      </button>
                      
                      <button 
                        onClick={() => handleDelete(admin._id, admin.username)}
                        className="p-2 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all shadow-sm"
                        title="حذف نهائي"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CSS الخاص بالسكرولر لضمان الشكل في الشاشات الصغيرة */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default ManageAdmins;