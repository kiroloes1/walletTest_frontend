import React, { useState, useEffect, useRef } from 'react';
import { Search, Send, Building2, Info } from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { AnimatePresence, motion } from 'framer-motion';
import axios from 'axios';
import { showAlert } from '../../services/alert';

const CreateSupplierTransaction = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const dropdownRef = useRef(null);

  // بيانات النموذج الحالية وفق الـ API الجديد
  const [formData, setFormData] = useState({
    supplierId: '',
    senderName: '',
    senderPhone: '', // اختياري
    receiverName: '',
    receiverPhone: '', // اختياري
    notes: '',
    amount: '',
    createdAt: ''
  });

  // تعيين التوقيت الافتراضي
  useEffect(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setFormData((prev) => ({ ...prev, createdAt: localDate }));
  }, []);

  const fetchSuppliers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/customers/getAllSupplierName`,{
                headers: {
          "x-api-key": import.meta.env.VITE_API_X_API_KEY,
          "Content-Type": "application/json",
        },
      });
      setSuppliers(res.data.data);
    } catch (err) {
      showAlert({ title: "فشل في تحميل الموردين", icon: "error" });
    }
  };

    useEffect(() => {
      fetchSuppliers();
    }, []);


  // فلترة قائمة التجار
  const filteredSuppliers = suppliers.filter((s) =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // اختيار تاجر
  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSearchTerm(supplier.name);
    setShowSuggestions(false);
    setFormData((prev) => ({
      ...prev,
      supplierId: supplier._id,
      senderName: supplier.name,
    }));
  };

  // إرسال البيانات
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.supplierId || !formData.receiverName || !formData.amount) {
        setLoading(false);
        return Swal.fire('خطأ', 'يجب اختيار التاجر وإدخال اسم المستلم والمبلغ', 'error');
      }

      if (Number(formData.amount) <= 0) {
        setLoading(false);
        return Swal.fire('خطأ', 'المبلغ يجب أن يكون أكبر من صفر', 'error');
      }

      // الإرسال إلى endpoint الخاص بالتجار
      await api.post('/transaction/createTransactionsSupplier', formData);

      Swal.fire('تمت العملية', 'تم تسجيل التحويل الخارجي بنجاح', 'success');

      // إعادة ضبط النموذج
      const now = new Date();
      const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setFormData({
        supplierId: '',
        senderName: '',
        senderPhone: '',
        receiverName: '',
        receiverPhone: '',
        notes: '',
        amount: '',
        createdAt: localDate,
      });

      setSearchTerm('');
      setSelectedSupplier(null);
      fetchSuppliers();
    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشلت العملية', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto p-6 bg-white rounded-xl border border-slate-50" dir="rtl">
      {/* الترويسة */}
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white">
          <Building2 size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black">تحويل خارجي (تجار)</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            External Supplier Transaction
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* تاريخ العملية */}
        <div className="space-y-2">
          <label className="text-xs font-black text-slate-500 mr-2">تاريخ العملية</label>
          <input
            type="datetime-local"
            className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
            value={formData.createdAt}
            onChange={(e) => setFormData({ ...formData, createdAt: e.target.value })}
          />
        </div>

        {/* البحث عن التاجر */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-xs font-black text-slate-500 mb-2 block mr-2">
            ابحث عن التاجر (المرسل) *
          </label>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 rounded-lg py-4 pr-12 pl-4 outline-none font-bold transition-all"
              placeholder="اكتب اسم التاجر..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowSuggestions(true);
                setSelectedSupplier(null);
              }}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>

          <AnimatePresence>
            {showSuggestions && searchTerm && (
              <motion.ul
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-lg max-h-60 overflow-y-auto overflow-x-hidden p-2 shadow-2xl custom-scrollbar"
              >
                {filteredSuppliers.length > 0 ? (
                  filteredSuppliers.map((sup) => (
                    <li
                      key={sup._id}
                      onClick={() => handleSelectSupplier(sup)}
                      className="p-4 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 last:border-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-black text-xs">
                          {sup.name ? sup.name[0].toUpperCase() : 'S'}
                        </div>
                        <div>
                          <p className="font-black text-sm">{sup.name}</p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          الرصيد: {Number(sup.balance || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}
                        </p>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="p-4 text-center text-slate-400 font-bold text-xs">لا توجد نتائج</li>
                )}
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* كارت عرض الرصيد المتاح للتاجر */}
        {selectedSupplier && (
          <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 shadow-sm">
              <Info size={20} />
            </div>
            <div>
              <p className="text-[10px] font-black text-emerald-500 uppercase">رصيد التاجر الحالي</p>
              <p className="text-xl font-black text-emerald-900">
                {Number(selectedSupplier.balance || 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })}{' '}
                <small className="text-xs">ج.م</small>
              </p>
            </div>
          </div>
        )}

        {/* تفاصيل المرسل والمستلم بنفس التنسيق الشبكي */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">اسم المرسل</label>
            <input
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
              value={formData.senderName}
              onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">رقم المرسل (اختياري)</label>
            <input
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
              maxLength={11}
              placeholder="اختياري..."
              value={formData.senderPhone}
              onChange={(e) => setFormData({ ...formData, senderPhone: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">اسم المستلم *</label>
            <input
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
              placeholder="أدخل اسم المستلم..."
              value={formData.receiverName}
              onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">رقم المستلم (اختياري)</label>
            <input
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
              maxLength={11}
              placeholder="اختياري..."
              value={formData.receiverPhone}
              onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
            />
          </div>
        </div>

        {/* المبلغ والملاحظات */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">
              المبلغ (Amount) *
            </label>
            <input
              type="number"
              required
              min="1"
              max="99999"
              onInput={(e) => {
                if (e.target.value.length > 5) {
                  e.target.value = e.target.value.slice(0, 5);
                }
              }}
              className="w-full bg-slate-900 text-white rounded-lg p-4 font-black text-xl outline-none placeholder:text-slate-600"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: Number(e.target.value) || '' })
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">ملاحظات</label>
            <textarea
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none h-[60px]"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        {/* زر التسديد والإرسال */}
        <button
          disabled={loading}
          type="submit"
          className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-5 rounded-xl font-black text-lg shadow-xl shadow-slate-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
        >
          <Send size={20} /> {loading ? 'جاري التسجيل...' : 'تأكيد وتسجيل العملية'}
        </button>
      </form>
    </div>
  );
};

export default CreateSupplierTransaction;