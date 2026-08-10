import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Eye, X, Calendar, 
  Info, Phone, User, Wallet, Hash, FileText, ChevronRight, ChevronLeft, Trash2
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import moment from "moment-timezone";

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, daily, monthly

  // حالات التحكم في الصفحات (Pagination States)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10; // عدد العناصر في الصفحة الواحدة

  // حالات التحكم في النوافذ (Modals)
  const [viewData, setViewData] = useState(null); 

  // دالة جلب البيانات مع الفلاتر والصفحات من السيرفر مباشرة
const fetchTransactions = async () => {
    setLoading(true);
    try {
      let queryParams = `?page=${currentPage}&limit=${limit}`;

      // إضافة فلترة البحث إذا وجدت
      if (searchTerm.trim() !== '') {
        queryParams += `&search=${encodeURIComponent(searchTerm)}`;
      }

      // إرسال نوع الفلترة والتاريخ الحالي للسيرفر
      if (filterType !== 'all') {
        const today = moment().tz("Africa/Cairo").format("YYYY-MM-DD");
        queryParams += `&date=${today}&filterType=${filterType}`;
      }

      const res = await api.get(`/transaction/${queryParams}`);
      
      setTransactions(res.data.transactions);
      setTotalPages(res.data.pagination.pages);
      setTotalItems(res.data.pagination.total);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  // إعادة الصفحة إلى 1 عند تغيير نص البحث أو نوع الفلتر
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType]);

  // جلب البيانات عند تغيير الصفحة أو البحث أو الفلتر
  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, filterType]);

  const getWalletRole = (tx) => {
    const current = tx.walletId?.phoneNumber;
    if (tx.senderPhone === current) return "sender";
    if (tx.receiverPhone === current) return "receiver";
    return "unknown";
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "حذف المعاملة سيؤثر على أرصدة المحافظ المرتبطة!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'نعم، احذف',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#ef4444'
    });
    if (result.isConfirmed) {
      try {
        await api.delete(`/transaction/V2/${id}`);
        fetchTransactions();
        Swal.fire('تم الحذف', 'تم مسح المعاملة بنجاح', 'success');
      } catch (err) { Swal.fire('خطأ', 'فشل الحذف', 'error'); }
    }
  };

  // إحصائيات اليوم الحالي (تعمل على البيانات الحالية المعروضة بالصفحة)
  const filterDay = transactions.filter(tx => {
    const txDate = moment(tx.createdAt);
    const now = moment();
    return txDate.isSame(now, 'day');
  });

  const { sendDay, receiveDay } = filterDay.reduce((acc, curr) => {
    if (curr.type === "send") acc.sendDay += curr.amount;
    else if (curr.type === "receive") acc.receiveDay += curr.amount;
    return acc;
  }, { sendDay: 0, receiveDay: 0 });

  return (
    <div className="w-[100vw] md:w-full mx-auto p-4 font-['cairo'] text-right max-h-screen bg-slate-50/50 overflow-auto" dir="rtl">
      
      {/* Header & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-end mb-8">
        <div className="space-y-1">
          <h2 className="text-3xl font-black text-slate-900">سجل العمليات</h2>
          <p className="text-slate-400 text-sm font-bold">متابعة وتدقيق كافة التحويلات المالية (الإجمالي: {totalItems})</p>
        </div>
        
        <div className="flex bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
          {['all', 'daily', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-2 rounded-lg text-xs font-black transition-all ${filterType === type ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-50'}`}
            >
              {type === 'all' ? 'الكل' : type === 'daily' ? 'اليوم' : 'الشهر'}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input 
          className="w-full bg-white border border-slate-200 rounded-lg py-4 pr-12 pl-4 outline-none focus:ring-4 ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm"
          placeholder="ابحث بالاسم، الرقم، أو قيمة المبلغ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="w-full bg-white border border-slate-200 rounded-lg overflow-auto shadow-sm mb-6">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100 text-slate-400 text-[11px] font-black uppercase tracking-widest">
              <th className="p-5">العملية</th>
              <th className="p-5">المبلغ</th>
              <th className="p-5">المحفظة</th>
              <th className="p-5">التاريخ</th>
              <th className="p-5 text-center">الإجراءات</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 text-sm">
            {loading ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400 font-bold">جاري تحميل البيانات...</td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-10 text-center text-slate-400 font-bold">لا توجد معاملات متطابقة.</td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const role = getWalletRole(tx);
                return (
                  <tr key={tx._id} className="group hover:bg-blue-50/30 transition-all">
                    {/* العملية (من -> إلى) */}
                    <td className="p-5">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${tx.type === "send" ? "bg-orange-100 text-orange-600" : "bg-emerald-100 text-emerald-600"}`}>
                          {tx.type === "send" ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">
                            {tx.senderName} <span className="text-slate-400">-</span> {tx.receiverName}
                          </p>
                          <p className="text-[10px] font-bold uppercase tracking-wider">
                            {role === "sender" && <span className="text-orange-600">أنت مرسل</span>}
                            {role === "receiver" && <span className="text-emerald-600">أنت مستلم</span>}
                            {role === "unknown" && <span className="text-slate-400">تحويل خارجي</span>}
                          </p>
                          <div className="mt-1">
                            {tx.isInternalTransfer ? (
                              <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded">تحويل داخلي</span>
                            ) : (
                              <span className="text-[10px] bg-slate-50 text-slate-500 px-2 py-1 rounded">تحويل خارجي</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* المبلغ */}
                    <td className="p-5 font-black text-base">
                      <span className={role === "sender" ? "text-red-600" : "text-green-600"}>
                        {role === "sender" ? "-" : "+"} {tx.amount.toLocaleString()} ج.م
                      </span>
                    </td>

                    {/* المحفظة */}
                    <td className="p-5 text-slate-500 font-bold">
                      {tx.walletId?.walletName || "غير معروف"}
                    </td>

                    {/* التاريخ */}
                    <td className="p-5">
                      <p className="text-slate-700 font-bold">{moment(tx.createdAt).tz("Africa/Cairo").format("YYYY-MM-DD")}</p>
                      <p className="text-[10px] text-slate-400">{moment(tx.createdAt).tz("Africa/Cairo").format("hh:mm A")}</p>
                    </td>

                    {/* الإجراءات */}
                    <td className="p-5">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => setViewData(tx)}
                          className="p-2.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all"
                        >
                          <Eye size={18} />
                        </button>
{   tx.ispay &&                     <button
                          onClick={() => handleDelete(tx._id)}
                          className="p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                        >
                          <Trash2 size={18} />
                        </button>}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 🔹 أشرطة التنقل بين الصفحات (Pagination Controls) */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm mb-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
          >
            <ChevronRight size={18} /> السابق
          </button>

          <span className="text-sm font-bold text-slate-600">
            الصفحة <span className="text-slate-900 font-black">{currentPage}</span> من <span className="text-slate-900 font-black">{totalPages}</span>
          </span>

          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white transition-all"
          >
            التالي <ChevronLeft size={18} />
          </button>
        </div>
      )}

      {/* --- Modal: عرض التفاصيل (View) --- */}
      {viewData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-black flex items-center gap-3">تفاصيل المعاملة</h3>
                <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase">ID: {viewData._id}</p>
                <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase"><span className='font-bold'>نوع العمليه </span>:  {viewData.type === "receive" ? "استلام" : "ارسال"}</p>
              </div>
              <button onClick={() => setViewData(null)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"><X/></button>
            </div>
            
            <div className="p-8 space-y-8">
              <div className="grid grid-cols-2 gap-8">
                <DetailItem label="المرسل" value={viewData.senderName} subValue={viewData.senderPhone} icon={<User size={16}/>} />
                <DetailItem label="المستلم" value={viewData.receiverName} subValue={viewData.receiverPhone} icon={<User size={16}/>} />
                <DetailItem label="المبلغ" value={`${viewData.amount.toLocaleString()} ج.م`} highlight icon={<Hash size={16}/>} />
                <DetailItem label="المحفظة" value={viewData.walletId?.walletName} subValue={viewData.walletId?.walletProvider} icon={<Wallet size={16}/>} />
              </div>
              
              <div className="p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 grid grid-cols-2 gap-4">
                <DetailItem
                  label="تاريخ العملية"
                  value={moment(viewData.createdAt).tz("Africa/Cairo").format("LL")}
                  subValue={moment(viewData.createdAt).tz("Africa/Cairo").format("hh:mm A")}
                  icon={<Calendar size={16}/>}
                />
                <DetailItem label="نوع التحويل" value={viewData.isInternalTransfer ? "تحويل داخلي" : "تحويل خارجي"} icon={<Info size={16}/>} />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 flex items-center gap-2"><FileText size={14}/> ملاحظات الإدارة</p>
                <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-lg text-sm font-medium text-slate-700 italic">
                  {viewData.notes || "لا توجد ملاحظات مسجلة لهذه العملية."}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

// --- المكونات الفرعية (Sub-components) ---
const DetailItem = ({ label, value, subValue, icon, highlight }) => (
  <div className="flex gap-4 items-start">
    <div className="mt-1 p-2.5 bg-slate-100 rounded-lg text-slate-500">{icon}</div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-0.5">{label}</p>
      <p className={`text-sm font-black ${highlight ? 'text-blue-600 text-xl' : 'text-slate-800'}`}>{value}</p>
      {subValue && <p className="text-xs text-slate-500 font-bold mt-0.5 tracking-wide">{subValue}</p>}
    </div>
  </div>
);

export default TransactionHistory;