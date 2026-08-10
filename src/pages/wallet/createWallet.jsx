import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Smartphone, User, ShieldCheck, Landmark, Save, AlertCircle, Loader2, Gauge } from 'lucide-react'; // أضفت Gauge كأيقونة للـ Limit
import api from '../../services/api';

const CreateWalletCard = () => {
  const initialForm = {
    walletName: '',
    phoneNumber: '',
    walletProvider: 'Vodafone',
    ownerName: '',
    Limit: 200000, // القيمة الافتراضية
    status: 'active',
    balance: ''
  };

  const [formData, setFormData] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isSaved) {
      const timer = setTimeout(() => {
        setIsSaved(false);
        setFormData(initialForm);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [isSaved]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await api.post('/wallet/', formData);
      if (response.status === 201) {
        setIsSaved(true);
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || "حدث خطأ أثناء الاتصال بالسيرفر";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'balance' || name === 'Limit' ? Number(value) : value
    }));
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-cyan-50/30 p-4 font-[`cairo`]" dir="rtl">
      
      <AnimatePresence mode="wait">
        {!isSaved ? (
          <motion.div
            key="form-card"
            initial={{ opacity: 1, scale: 1 }}
            exit={{ 
              scale: 0, 
              y: 800, 
              rotate: 25, 
              opacity: 0,
              transition: { duration: 0.4, ease: "circIn" } 
            }}
            className="w-full max-w-3xl bg-white rounded-xl -[0_20px_50px_rgba(8,145,178,0.1)] border border-cyan-100/50 overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#0F172A] p-7 text-white flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-cyan-500/20 p-3 rounded-xl border border-cyan-500/30">
                  <Wallet className="text-cyan-400" size={26} />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight">V-CASH SYSTEM</h2>
                  <p className="text-[10px] text-cyan-500/80 font-mono tracking-[0.2em]">SECURE GATEWAY v2.0</p>
                </div>
              </div>
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse -[0_0_10px_#06b6d4]"></div>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm font-bold border border-red-100"
                >
                  <AlertCircle size={18} />
                  {error}
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* اسم المحفظة */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">اسم المحفظة</label>
                  <input 
                    name="walletName" 
                    value={formData.walletName} 
                    required 
    
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all placeholder:text-slate-300" 
                    placeholder="مثلاً: المحفظة الشخصية" 
                    onChange={handleChange} 
                  />
                </div>

                {/* رقم الهاتف */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">رقم الهاتف</label>
                  <input 
                    name="phoneNumber" 
                    maxLength={11}
                    value={formData.phoneNumber} 
                    required 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all placeholder:text-slate-300" 
                    placeholder="010xxxxxxx" 
                    onChange={handleChange} 
                  />
                </div>

                {/* مزود الخدمة */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">مزود الخدمة</label>
                  <div className="relative">
                    <select 
                      name="walletProvider" 
                      value={formData.walletProvider} 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-cyan-500 transition-all appearance-none cursor-pointer font-bold text-slate-700" 
                      onChange={handleChange}
                    >
                      <option value="Vodafone">Vodafone Cash</option>
                      <option value="Etisalat">Etisalat Cash</option>
                      <option value="Orange">Orange Money</option>
                      <option value="WE">WE Pay</option>
                    </select>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                      <Smartphone size={16} />
                    </div>
                  </div>
                </div>

                {/* --- الحقل الجديد: الحد الأقصى (Limit) --- */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">الحد الأقصى للمحفظة (Limit) </label>
                  <div className="relative">
                    <input 
                      name="Limit" 
                      type="number"
                      placeholder={"0"}
                      required 
                      className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all" 
                  
                      onChange={handleChange} 
                    />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Gauge size={16} />
                    </div>
                  </div>
                </div>

                {/* اسم المالك */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">اسم المالك</label>
                  <input 
                    name="ownerName" 
                    value={formData.ownerName} 
                    required 
                    className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-4 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/5 transition-all placeholder:text-slate-300" 
                    placeholder="الاسم الكامل" 
                    onChange={handleChange} 
                  />
                </div>

                {/* الرصيد */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-slate-500 mr-1 uppercase tracking-wider">الرصيد الحالي في المحفظه</label>
                  <div className="relative">
                    <input 
                      name="balance" 
                      value={formData.balance} 
                      type="number" 
                      required 
                      className="w-full bg-cyan-50/30 border border-cyan-100 rounded-xl px-4 py-5 outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 font-black text-2xl text-cyan-900 placeholder:text-cyan-200" 
                      placeholder="0.00" 
                      onChange={handleChange} 
                    />
                    <span className="absolute left-6 top-1/2 -translate-y-1/2 text-cyan-600 font-black text-lg">ج.م</span>
                  </div>
                </div>
              </div>

              {/* الزرار */}
              <motion.button
                whileHover={{ scale: 1.01, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                disabled={isSubmitting}
                className="w-full bg-cyan-600 hover:bg-cyan-500 text-white py-5 rounded-xl font-black text-xl -[0_15px_30px_rgba(8,145,178,0.25)] mt-4 flex items-center justify-center gap-3 disabled:opacity-70 transition-all border-b-4 border-cyan-800"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <>تأمين وحفظ في الخزنة <Save size={22} /></>
                )}
              </motion.button>
            </form>
          </motion.div>
        ) : (
          <motion.div 
            key="success-safe"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center"
          >
            <div className="w-64 h-64 bg-[#0F172A] rounded-[60px] border-[14px] border-slate-800 flex flex-col items-center justify-center relative -[0_30px_60px_rgba(0,0,0,0.3)]">
              <div className="absolute top-0 w-32 h-2 bg-black rounded-full mt-5 blur-[1px]"></div>
              <div className="absolute inset-0 rounded-[45px] bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12 }}
              >
                <ShieldCheck className="text-cyan-400 drop--[0_0_15px_rgba(34,211,238,0.6)]" size={100} />
              </motion.div>
            </div>
            
            <h3 className="text-4xl font-black text-slate-900 mt-10 tracking-tight">تم التأمين!</h3>
            <div className="flex items-center gap-2 mt-3">
              <div className="h-2 w-2 rounded-full bg-cyan-500 animate-bounce"></div>
              <p className="text-cyan-600 font-black italic text-lg uppercase tracking-widest">Encrypting Data...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateWalletCard;