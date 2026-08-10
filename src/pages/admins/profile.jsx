import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Shield, Edit3, Save, X, Loader2, 
  CheckCircle, UserCheck, Phone, Plus, Trash2, KeyRound, Lock, AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { showAlert } from '../../services/alert';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate=useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', notes: '', phone: [] });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '' });
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get(`/admins/profile`);
      const data = response.data.admin;
      setAdmin(data);
      setFormData({
        username: data.username,
        email: data.email,
        notes: data.notes || '',
        phone: data.phone || []
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await api.patch(`/admins/${admin._id}`, formData);
      setAdmin(response.data.admin);
      setIsEditing(false);

      showAlert({title:"تم تحديث البيانات بنجاح",icon:"success"});
    } catch (err) {
      showAlert({title:err.response?.data?.message || "فشل تحديث البيانات",icon:"scuess"});

      
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setPassSaving(true);
    try {
      await api.put('/users/update-password', passwordData);
      showAlert({title:"تم تغيير كلمة المرور بنجاح، يرجى تسجيل الدخول مجدداً",icon:"success"});
      setIsPassModalOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '' });
      navigate("/login")
    } catch (err) {
      showAlert({title:err.response?.data?.message || "فشل تحديث البيانات",icon:"scuess"});
      
    } finally {
      setPassSaving(false);
    }
  };

  const addPhoneField = () => setFormData({...formData, phone: [...formData.phone, '']});
  const removePhoneField = (index) => {
    const newPhones = formData.phone.filter((_, i) => i !== index);
    setFormData({...formData, phone: newPhones});
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <Loader2 className="animate-spin text-blue-600 mx-auto" size={48} />
        <p className="font-black text-slate-400">جاري تحميل الملف الشخصي...</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 font-['Cairo'] text-right space-y-10" dir="rtl">
      
      {/* Header Section */}
      <div className="relative">
        <div className="h-48 md:h-64 bg-gradient-to-l from-slate-900 via-slate-800 to-blue-900 rounded-[40px] md:rounded-[60px] shadow-2xl overflow-hidden relative">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        
        <div className="absolute -bottom-16 right-8 md:right-16 flex flex-col md:flex-row items-center md:items-end gap-6">
          <div className="relative group">
            <div className="w-32 h-32 md:w-44 md:h-44 bg-white rounded-[40px] p-2 shadow-2xl border-4 border-white overflow-hidden">
                <div className="w-full h-full bg-slate-100 rounded-[32px] flex items-center justify-center text-slate-300">
                    <User size={80} strokeWidth={1} />
                </div>
            </div>
            <div className="absolute bottom-2 right-2 w-8 h-8 bg-emerald-500 border-4 border-white rounded-full"></div>
          </div>
          
          <div className="pb-4 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 md:text-white drop-shadow-sm">{admin.username}</h1>
            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
              <span className="bg-blue-600 text-white px-4 py-1 rounded-xl text-xs font-black shadow-lg">مدير النظام</span>
              {admin.isVerified && (
                <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black border border-emerald-100 flex items-center gap-1">
                  <UserCheck size={14}/> موثق
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-12">
        {/* Left Column: Account Stats */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-[35px] shadow-xl shadow-slate-200/50 border border-slate-50">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <Shield size={20} className="text-blue-600" /> أمان الحساب
            </h3>
            <div className="space-y-3">
              <StatusItem label="تاريخ الانضمام" value={new Date(admin.createdAt).toLocaleDateString('ar-EG')} />
              <StatusItem label="آخر نشاط" value={admin.lastLogin ? new Date(admin.lastLogin).toLocaleTimeString('ar-EG') : 'الآن'} />
            </div>
            
            <button 
              onClick={() => setIsPassModalOpen(true)}
              className="w-full mt-6 flex items-center justify-center gap-2 bg-slate-900 text-white p-4 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-slate-200"
            >
              <KeyRound size={18} /> تغيير كلمة المرور
            </button>
          </div>
        </div>

        {/* Right Column: Main Form */}
        <div className="lg:col-span-8">
          <form onSubmit={handleUpdate} className="bg-white p-6 md:p-10 rounded-[45px] shadow-xl shadow-slate-200/50 border border-slate-50 space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-black text-slate-900">المعلومات الشخصية</h2>
              {!isEditing ? (
                <button type="button" onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-blue-50 text-blue-600 px-6 py-3 rounded-2xl font-black hover:bg-blue-600 hover:text-white transition-all">
                  <Edit3 size={18} /> تعديل الحساب
                </button>
              ) : (
                <div className="flex gap-2">
                  <button type="submit" disabled={saving} className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-emerald-100 disabled:opacity-50">
                    {saving ? <Loader2 className="animate-spin" size={18}/> : <Save size={18} />} حفظ
                  </button>
                  <button type="button" onClick={() => setIsEditing(false)} className="bg-slate-100 text-slate-500 px-6 py-3 rounded-2xl font-black">إلغاء</button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputGroup label="اسم المستخدم" icon={<User size={18}/>} value={formData.username} disabled={!isEditing} onChange={(e) => setFormData({...formData, username: e.target.value})} />
              <InputGroup label="البريد الإلكتروني" icon={<Mail size={18}/>} value={formData.email} disabled={!isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </div>

            {/* Phone Numbers */}
            <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-black text-slate-400 flex items-center gap-2">
                        <Phone size={18} className="text-blue-500"/> أرقام التواصل
                    </label>
                    {isEditing && (
                        <button type="button" onClick={addPhoneField} className="bg-blue-50 text-blue-600 p-2 rounded-lg hover:bg-blue-100 transition-colors">
                            <Plus size={16}/>
                        </button>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {formData.phone.map((num, index) => (
                        <div key={index} className="relative group">
                            <input 
                                type="tel" 
                                value={num} 
                                disabled={!isEditing}
                                onChange={(e) => {
                                    const newPhones = [...formData.phone];
                                    newPhones[index] = e.target.value;
                                    setFormData({...formData, phone: newPhones});
                                }}
                                className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 font-bold text-slate-700 focus:border-blue-500/20 focus:bg-white transition-all outline-none"
                                placeholder="01XXXXXXXXX"
                            />
                            {isEditing && (
                                <button type="button" onClick={() => removePhoneField(index)} className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 hover:text-rose-600 transition-colors">
                                    <Trash2 size={18}/>
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-black text-slate-400 mr-2">نبذة شخصية / ملاحظات</label>
              <textarea 
                rows="3" 
                disabled={!isEditing} 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})} 
                className="w-full bg-slate-50 border-2 border-transparent rounded-[25px] p-5 text-slate-700 font-bold focus:border-blue-500/20 focus:bg-white outline-none transition-all resize-none"
                placeholder="اكتب شيئاً عنك..."
              />
            </div>
          </form>
        </div>
      </div>

      {/* Password Change Modal */}
      {isPassModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsPassModalOpen(false)}></div>
            <form onSubmit={handlePasswordUpdate} className="relative bg-white w-full max-w-md rounded-[40px] p-8 shadow-2xl space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                        <Lock className="text-blue-600" /> تحديث الأمان
                    </h3>
                    <button type="button" onClick={() => setIsPassModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                        <X size={24} />
                    </button>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400">كلمة المرور الحالية</label>
                        <input 
                            required
                            type="password" 
                            className="w-full h-14 bg-slate-50 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                            value={passwordData.currentPassword}
                            onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-black text-slate-400">كلمة المرور الجديدة</label>
                        <input 
                            required
                            type="password" 
                            className="w-full h-14 bg-slate-50 rounded-2xl px-5 outline-none focus:ring-2 focus:ring-blue-500/20 font-bold"
                            value={passwordData.newPassword}
                            onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-2xl flex items-start gap-3">
                    <AlertCircle className="text-blue-600 shrink-0" size={18} />
                    <p className="text-[10px] font-bold text-blue-700 leading-relaxed">
                        عند تغيير كلمة المرور، سيتم إنهاء جميع الجلسات النشطة لضمان حماية حسابك.
                    </p>
                </div>

                <button 
                    disabled={passSaving}
                    type="submit" 
                    className="w-full h-14 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-200 flex items-center justify-center gap-2 hover:bg-blue-700 transition-all"
                >
                    {passSaving ? <Loader2 className="animate-spin" /> : "تحديث كلمة المرور"}
                </button>
            </form>
        </div>
      )}
    </div>
  );
};

const InputGroup = ({ label, icon, value, disabled, onChange }) => (
  <div className="space-y-2">
    <label className="text-xs font-black text-slate-400 flex items-center gap-2 px-1">
      {icon} {label}
    </label>
    <input 
      type="text" 
      value={value} 
      onChange={onChange} 
      disabled={disabled} 
      className="w-full h-14 bg-slate-50 border-2 border-transparent rounded-2xl px-5 text-slate-800 font-bold focus:border-blue-500/20 focus:bg-white transition-all outline-none disabled:opacity-50"
    />
  </div>
);

const StatusItem = ({ label, value, color = "text-slate-600" }) => (
  <div className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100/50">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</span>
    <span className={`text-xs font-black ${color}`}>{value}</span>
  </div>
);

export default Profile;