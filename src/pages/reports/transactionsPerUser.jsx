import React, { useState, useEffect, useRef } from 'react';


import { Loader2, Search, Calendar, Printer, User, Wallet, ArrowDownLeft, ArrowUpRight, Percent, FileText, LayoutGrid } from 'lucide-react';
import api from '../../services/api';
import { showAlert } from '../../services/alert';
import html2pdf from "html2pdf.js";
export default function MerchantReportManager() {
  // حالات البحث والفلترة
  const [people, setPeople] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sharing, setSharing] = useState(false);
  // حالات البيانات والتحميل
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingPeople, setLoadingPeople] = useState(false);

  const suggestionsRef = useRef(null);

  // 1. جلب قائمة الأشخاص والتجار عند فتح الصفحة للاقتراحات
  useEffect(() => {
    const fetchPeople = async () => {
      try {
        setLoadingPeople(true);
        const response = await api.get('/dashboard/getAllPeople');
        if (response.data && response.data.data) {
          setPeople(response.data.data);
        }
      } catch (err) {
        console.error("Error fetching people:", err);
      } finally {
        setLoadingPeople(false);
      }
    };
    fetchPeople();

    // إغلاق قائمة الاقتراحات عند الضغط خارجها
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // تصفية الأسماء بناءً على ما يكتبه المستخدم في خانة البحث
  const filteredPeople = people.filter(p => 
    p.name?.toLowerCase().includes(searchName.toLowerCase())
  );

  // 2. جلب التقرير المفصل من السيرفر
  const handleFetchReport = async (merchantName = searchName) => {
    if (!merchantName.trim()) {
      showAlert({ icon: "warning", title: "يرجى اختيار أو كتابة اسم التاجر أولاً" });
      return;
    }

    try {
      setLoading(true);
      setShowSuggestions(false);
      
      const payload = {
        name: merchantName,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined
      };

      const response = await api.post('/dashboard/getMerchantReport', payload);
      
      if (response.data && response.data.success) {
        // حساب إجمالي المستلمات لكل محفظة على حدة لتسهيل العرض في كروت ملخصة
        const walletSummary = {};
        response.data.transactions.forEach(tx => {
          if (tx.role === 'receiver' || tx.role === 'sender & receiver') {
            const wNum = tx.walletNumber || "محافظ أخرى";
            const wName = tx.walletName || "غير مسمى";
            const key = `${wNum}-${wName}`;
            if (!walletSummary[key]) {
              walletSummary[key] = { walletName: wName, walletNumber: wNum, total: 0 };
            }
            walletSummary[key].total += tx.amount;
          }
        });

        setReportData({
          ...response.data,
          walletSummary: Object.values(walletSummary)
        });
      }
    } catch (err) {
      console.error("Error fetching report:", err);
      showAlert({ icon: "error", title: "حدث خطأ أثناء جلب تقرير التاجر" });
    } finally {
      setLoading(false);
    }
  };

  // 3. دالة الطباعة المباشرة لورق A4
  const handlePrint = () => {
    window.print();
  };


          const handleSharePDF = async () => {
      const element = document.getElementById("invoice-capture");
  
      if (!element) return;
  
      const fileName = "report.pdf";
  
      const options = {
          margin: 10,
          filename: fileName,
          image: {
              type: "jpeg",
              quality: 1
          },
          html2canvas: {
              scale: 2,
              useCORS: true
          },
          jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait"
          }
      };
  
      try {
          setSharing(true);
  
          const pdfBlob = await html2pdf()
              .set(options)
              .from(element)
              .output("blob");
  
          const file = new File([pdfBlob], fileName, {
              type: "application/pdf"
          });
  
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                  files: [file],
                  title: "تقرير طباعه عمليات التاجر",
                  text: "مرفق تقرير عمليات التاجر"
              });
          } else {
              html2pdf()
                  .set(options)
                  .from(element)
                  .save();
          }
      } catch (error) {
          console.error(error);
      } finally {
          setSharing(false);
      }
  };

  return (
    <div className="mx-auto px-4 py-6 bg-gray-50/40 min-h-screen text-right font-['Tahoma']" dir="rtl">
      
      {/* ستايل مخصص للطباعة فقط يختفي داخل المتصفح ويظهر على ورق A4 */}
      <style>{`
        @media print {
          body { background: white; color: black; font-size: 12px; direction: rtl; }
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; box-shadow: none !important; border: none !important; }
          .shadow-sm, .shadow-md, .rounded-xl { box-shadow: none !important; border-radius: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; margin-top: 15px !important; }
          th, td { border: 1px solid #666 !important; padding: 8px !important; text-align: right !important; }
          th { background-color: #f2f2f2 !important; -webkit-print-color-adjust: exact; }
        }
      `}</style>

      {/* الرأس - يختفي في الطباعة */}
      <div className="no-print flex items-center gap-3 bg-white/80 backdrop-blur-md p-5 rounded-xl border border-gray-100 mb-6">
        <div className="p-2.5 bg-sky-50 text-[#0284c7] rounded-xl">
          <FileText size={22} />
        </div>
        <div>
          <h1 className="text-base md:text-lg font-black text-slate-800">نظام تقارير كشوفات التجار</h1>
          <p className="text-xs font-bold text-gray-400">تتبع حركة المحافظ،  والطباعة الفورية لحساباتك</p>
        </div>
      </div>

      {/* لوحة التحكم والفلترة - تختفي في الطباعة */}
      <div className="no-print bg-white rounded-xl border border-gray-100 p-5 shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          
          {/* حقل البحث الذكي عن التاجر */}
          <div className="relative" ref={suggestionsRef}>
            <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1">
              <User size={13} className="text-[#0284c7]" /> اسم التاجر / الزبون
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="اكتب اسم التاجر للبحث..."
                value={searchName}
                onChange={(e) => {
                  setSearchName(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7] transition-all bg-gray-50"
              />
              <Search className="absolute right-3.5 top-3.5 text-gray-400 w-4 h-4" />
              {loadingPeople && <Loader2 className="absolute left-3 top-3.5 text-[#0284c7] w-4 h-4 animate-spin" />}
            </div>

            {/* قائمة الاقتراحات المنسدلة AutoComplete */}
            {showSuggestions && searchName && filteredPeople.length > 0 && (
              <div className="absolute z-50 w-full bg-white border border-gray-100 mt-1 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {filteredPeople.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSearchName(p.name);
                      setShowSuggestions(false);
                      handleFetchReport(p.name);
                    }}
                    className="w-full text-right px-4 py-2 text-xs font-bold text-slate-700 hover:bg-sky-50 hover:text-[#0284c7] transition-colors flex justify-between items-center"
                  >
                    <span>{p.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">{p.phone}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* من تاريخ */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1">
              <Calendar size={13} className="text-gray-400" /> من تاريخ
            </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7] bg-gray-50"
            />
          </div>

          {/* إلى تاريخ */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1">
              <Calendar size={13} className="text-gray-400" /> إلى تاريخ
            </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7] bg-gray-50"
            />
          </div>

          {/* زر عرض التقرير */}
          <button
            type="button"
            disabled={loading}
            onClick={() => handleFetchReport()}
            className="bg-[#0284c7] hover:bg-slate-900 disabled:bg-gray-200 text-white text-xs font-black h-[42px] rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <LayoutGrid size={16} />}
            <span>عرض التقرير وتجهيزه</span>
          </button>

        </div>
      </div>

      {/* ==================== عرض بيانات التقرير الجاهز للطباعة والـ A4 ==================== */}
      {reportData && (
        <div id="invoice-capture" dir="rtl"  className="print-full-width space-y-6">
          
          {/* الهيدر الخاص بالطباعة الفورية - يظهر فقط في كشف الحساب المطبوع ليكون رسمياً */}
          <div className="hidden border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-center print:flex">
            <div>
              <h2 className="text-lg font-Arial  font-black text-slate-900">تقرير كشف حساب حركات المحافظ</h2>
              <p className="text-xs font-bold text-gray-500 mt-1">التاجر المستعلم عنه: {reportData.merchant}</p>
            </div>
            <div className="text-left text-xs font-bold text-gray-400">
              <p>تاريخ استخراج التقرير: {new Date().toLocaleDateString('ar-EG')}</p>
              {(fromDate || toDate) && <p>الفترة: {fromDate || "البداية"} إلى {toDate || "اليوم"}</p>}
            </div>
          </div>

          {/* كروت الإجماليات المالية السريعة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-gray-400 mb-1">إجمالي ما تم استلامه</p>
                <h3 className="text-lg font-black text-emerald-600 font-sans">{reportData.totalReceived.toLocaleString()} ج.م</h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ArrowDownLeft size={20} /></div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-gray-400 mb-1">إجمالي ما تم إرساله</p>
                <h3 className="text-lg font-black text-red-600 font-sans">{reportData.totalSent.toLocaleString()} ج.م</h3>
              </div>
              <div className="p-3 bg-red-50 text-red-600 rounded-xl"><ArrowUpRight size={20} /></div>
            </div>



            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-[11px] font-black text-gray-400 mb-1">عدد العمليات الإجمالي</p>
                <h3 className="text-lg font-black text-slate-700 font-sans">{reportData.totalTransactions} عملية</h3>
              </div>
              <div className="p-3 bg-slate-50 text-slate-600 rounded-xl"><LayoutGrid size={20} /></div>
            </div>

          </div>

          {/* 🎯 الملخص المطلوب: تفصيل المبالغ المستلمة مقسمة لكل محفظة بالتحديد */}




          {/* جدول تفاصيل العمليات بالكامل (A4 Ready) */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="no-print p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xs font-black text-slate-700">سجل حركات كشف الحساب التفصيلي</h3>
           
           <div className='flex gap-5'>
                  <button
                type="button"
                onClick={handlePrint}
                className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-black px-4 py-2 rounded-xl transition-all flex items-center gap-1.5"
              >
                <Printer size={14} />
                <span>طباعة التقرير بالكامل (A4)</span>
              </button>
              <button
                onClick={handleSharePDF}
                disabled={sharing}
                className="bg-emerald-600 text-white px-4 py-2 rounded-xl"
              >
                {sharing ? "جاري التحضير..." : "مشاركة PDF"}
              </button>
           </div>

            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-black border-b border-gray-200">
                    <th className="p-3.5">تاريخ العملية</th>
                    <th className="p-3.5">النوع</th>
                    <th className="p-3.5">المبلغ</th>
                    {/* <th className="p-3.5">اسم/رقم المحفظة المستلمة</th> */}
                    <th className="p-3.5">الراسل</th>
                    <th className="p-3.5">المستلم</th>
                    {/* <th className="p-3.5">ملاحظات</th> */}
                  </tr>
                </thead>
                <tbody className="font-bold text-slate-600 divide-y divide-gray-100">
                  {reportData.transactions?.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-3.5 font-sans whitespace-nowrap text-gray-400">
                        {new Date(tx.transactionDate).toLocaleDateString('ar-EG')}
                      </td>
                      <td className="p-3.5">
                        {tx.role === 'sender' && <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded text-[10px]">مرسل</span>}
                        {tx.role === 'receiver' && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-[10px]">مستلم</span>}
                        {tx.role === 'sender & receiver' && <span className="text-sky-600 bg-sky-50 px-2 py-0.5 rounded text-[10px]">داخلي</span>}
                      </td>
                      <td className="p-3.5 font-sans text-slate-900 font-black">{tx.amount.toLocaleString()} ج.م</td>
                      {/* <td className="p-3.5">
                        {tx.walletNumber ? (
                          <div>
                            <span className="block text-slate-700">{tx.walletName}</span>
                            <span className="block text-[10px] text-gray-400 font-mono">{tx.walletNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-300">-</span>
                        )}
                      </td> */}
                      <td className="p-3.5">
                        <span className="block text-slate-700">{tx.senderName || "غير مسجل"}</span>
                        <span className="block text-[10px] text-gray-400 font-mono">{tx.senderPhone}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="block text-slate-700">{tx.receiverName || "غير مسجل"}</span>
                        <span className="block text-[10px] text-gray-400 font-mono">{tx.receiverPhone}</span>
                      </td>
                      {/* <td className="p-3.5 text-gray-400 font-normal text-[11px] max-w-xs truncate">{tx.notes || "-"}</td> */}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
}