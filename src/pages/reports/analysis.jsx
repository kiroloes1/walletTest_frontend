import React, { useState, useEffect } from 'react';
import { Loader2, Search, Calendar, Printer, TrendingUp, TrendingDown, RefreshCw, BarChart3, Filter } from 'lucide-react';
import api from '../../services/api';
import { showAlert } from '../../services/alert';
import html2pdf from "html2pdf.js";

export default function MerchantAnalyticsManager() {
  // حالات الفلترة والبحث (متطابقة تماماً مع متغيرات السيرفر)
  const [reportType, setReportType] = useState("incoming"); // incoming = أكثر التجار إرسالاً لي، outgoing = أكثر التجار استلاماً مني
  const [period, setPeriod] = useState("monthly"); // daily, weekly, monthly, custom
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [search, setSearch] = useState("");
  const [sharing, setSharing] = useState(false);
  
  // حالات البيانات والتحميل
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);

  // دالة جلب البيانات من السيرفر
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // بناء الـ Query Parameters بناءً على توثيق الـ Backend لديك
      const params = new URLSearchParams({
        reportType,
        period,
        ...(search && { search }),
        ...(period === 'custom' && fromDate && { fromDate }),
        ...(period === 'custom' && toDate && { toDate })
      });

      const response = await api.get(`/dashboard/getMerchantAnalytics?${params.toString()}`);
      
      if (response.data && response.data.success) {
        setAnalyticsData(response.data);
      }
    } catch (err) {
      console.error("Error fetching merchant analytics:", err);
      showAlert({ icon: "error", title: "حدث خطأ أثناء جلب التقارير والإحصائيات" });
    } finally {
      setLoading(false);
    }
  };

  // جلب البيانات تلقائياً عند تغيير نوع التقرير أو الفترة
  useEffect(() => {
    if (period !== 'custom') {
      fetchAnalytics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportType, period]);

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
                title: "تقرير تحليل العمليات علي المحافظ",
                text: "مرفق تقرير تحليل العمليات"
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
      
      {/* 🏛️ قواعد طباعة مخصصة ومحكمة لورق A4 القياسي */}
      <style>{`
        @media print {
          @page { size: A4 portrait; margin: 15mm 10mm 15mm 10mm; }
          body { background: white; color: #000; font-size: 11px; direction: rtl; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .print-full-width { width: 100% !important; max-width: 100% !important; padding: 0 !important; margin: 0 !important; box-: none !important; border: none !important; }
          
          /* جداول الطباعة الرسمية الحادة */
          .official-table { width: 100% !important; border-collapse: collapse !important; margin-top: 15px !important; }
          .official-table th { background-color: #f1f5f9 !important; color: #0f172a !important; font-weight: bold !important; border: 1px solid #94a3b8 !important; padding: 8px 10px !important; text-align: right !important; }
          .official-table td { border: 1px solid #cbd5e1 !important; padding: 8px 10px !important; color: #334155 !important; }
          .official-table tr:nth-child(even) { background-color: #f8fafc !important; }
          
          /* إطار الملخص المالي العلوي في الورقة */
          .print-header-box { border: 2px solid #0f172a !important; padding: 12px !important; margin-bottom: 20px !important; background-color: #f8fafc !important; border-radius: 6px; }
          .print-section-title { font-size: 14px !important; font-weight: bold !important; color: #0f172a !important; border-bottom: 2px solid #0f172a !important; padding-bottom: 4px !important; margin-top: 25px !important; }
        }
      `}</style>

      {/* الرأس الرئيسي - يختفي في الطباعة */}
      <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/80 backdrop-blur-md p-5 rounded-xl border border-gray-100 mb-6 -sm gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-50 text-[#0284c7] rounded-xl">
            <BarChart3 size={22} />
          </div>
          <div>
            <h1 className="text-base md:text-lg font-black text-slate-800">تحليلات وإحصائيات حركة التجار</h1>
            <p className="text-xs font-bold text-gray-400">مراقبة وتصنيف التجار الأكثر نشاطاً في الارسال الاستلام عبر المحافظ</p>
          </div>
        </div>
        
        {analyticsData && (
          <div className='flex gap-5'>
                    <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs font-black px-5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 -sm"
          >
            <Printer size={15} />
            <span>طباعة التقرير الحالي (A4)</span>
          </button>

          <button
              onClick={handleSharePDF}
              disabled={sharing}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl"
            >
              {sharing ? "جاري التحضير..." : "مشاركة PDF"}
            </button>
          </div>
        )}
      </div>

      {/* لوحة التحكم والفلترة والبحث - تختفي في الطباعة */}
      <div className="no-print bg-white rounded-xl border border-gray-100 p-5 -sm mb-6 space-y-4">
        
        {/* السطر الأول: تحديد نوع الحركة والمدة */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* اختيار نوع التقرير */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1">
              <Filter size={13} className="text-[#0284c7]" /> نوع تحليل النشاط المطلوب
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-50 rounded-xl border border-gray-200/60">
              <button
                type="button"
                onClick={() => setReportType("incoming")}
                className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${reportType === 'incoming' ? 'bg-white text-emerald-600 -sm border border-gray-100' : 'text-gray-400 hover:text-slate-700'}`}
              >
                <TrendingUp size={14} />
                <span>أكثر التجار إرسالاً</span>
              </button>
              <button
                type="button"
                onClick={() => setReportType("outgoing")}
                className={`py-2 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1.5 ${reportType === 'outgoing' ? 'bg-white text-red-600 -sm border border-gray-100' : 'text-gray-400 hover:text-slate-700'}`}
              >
                <TrendingDown size={14} />
                <span>أكثر التجار استلاماً </span>
              </button>
            </div>
          </div>

          {/* اختيار الفترة الزمنية */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2 flex items-center gap-1">
              <Calendar size={13} className="text-[#0284c7]" /> النطاق والفترة الزمنية
            </label>
            <div className="grid grid-cols-4 gap-1 p-1 bg-gray-50 rounded-xl border border-gray-200/60">
              {['daily', 'weekly', 'monthly', 'custom'].map((p) => {
                const labels = { daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', custom: 'مخصص' };
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriod(p)}
                    className={`py-2 text-xs font-black rounded-lg transition-all ${period === p ? 'bg-[#0284c7] text-white -sm' : 'text-gray-500 hover:text-slate-700'}`}
                  >
                    {labels[p]}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* السطر الثاني: الفلاتر المتقدمة والبحث المحرك */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2 border-t border-gray-100">
          
          {/* بحث نصي ديناميكي */}
          <div className="md:col-span-2 relative">
            <label className="block text-xs font-black text-slate-700 mb-2">البحث باسم التاجر</label>
            <div className="relative">
              <input
                type="text"
                placeholder="اكتب اسم التاجر لتصفية النتائج الحالية..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7] bg-gray-50"
              />
              <Search className="absolute right-3.5 top-3.5 text-gray-400 w-4 h-4" />
            </div>
          </div>

          {/* من تاريخ (تظهر في المخصص فقط) */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">من تاريخ</label>
            <input
              type="date"
              disabled={period !== 'custom'}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7] bg-gray-50 disabled:opacity-50"
            />
          </div>

          {/* إلى تاريخ (تظهر في المخصص فقط) */}
          <div>
            <label className="block text-xs font-black text-slate-700 mb-2">إلى تاريخ</label>
            <input
              type="date"
              disabled={period !== 'custom'}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#0284c7] bg-gray-50 disabled:opacity-50"
            />
          </div>

        </div>

        {/* زر التحديث والتشغيل للفترات المخصصة والبحث المحسن */}
        <div className="flex justify-end pt-1">
          <button
            type="button"
            disabled={loading}
            onClick={fetchAnalytics}
            className="bg-[#0284c7] hover:bg-slate-900 disabled:bg-gray-200 text-white text-xs font-black px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 -sm"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={14} />}
            <span>تحديث وتطبيق الفلاتر</span>
          </button>
        </div>

      </div>

      {/* تغطية حالة التحميل */}
      {loading && (
        <div className="no-print flex flex-col items-center justify-center py-20 space-y-3">
          <Loader2 size={40} className="animate-spin text-[#0284c7]" />
          <p className="text-xs font-bold text-gray-400">جاري تجميع البيانات وفرز الترتيب التلقائي للتجار...</p>
        </div>
      )}

      {/* ==================== مستند التقرير والتحليلات الرسمي جاهز للطباعة ==================== */}
      {!loading && analyticsData && (
        <div  id="invoice-capture" dir="rtl" className="print-full-width space-y-6">
          
          {/* 🏛️ الترويسة القياسية للمؤسسة */}
          <div className="border-b-4 border-slate-900 pb-5 flex justify-between items-start">
            <div>
              <h2 className="text-base md:text-xl font-black text-slate-900">مصنع أولاد موسى فلتس</h2>
              <p className="text-xs font-bold text-slate-500 mt-1">منظومة الإدارة المالية الذكية للمحافظ الكاش</p>
            </div>
            
            <div className="text-center px-4 py-2 border-2 border-slate-900 rounded-xl bg-slate-50">
              <span className="text-xs md:text-sm font-black text-slate-900 block">
                {reportType === "incoming" ? "تقرير كبار تجار ارسالا " : "تقرير كبار تجار استلام "}
              </span>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5 font-sans">ترتيب تنازلي من الأكبر للأصغر</span>
            </div>

            <div className="text-left text-xs font-bold text-slate-600 space-y-0.5">
              <p>التاريخ: <span className="font-sans text-slate-900">{new Date().toLocaleDateString('ar-EG')}</span></p>
              <p>نطاق الفحص: <span className="text-[#0284c7]">
                {period === 'daily' && 'اليوم الحالي'}
                {period === 'weekly' && 'الأسبوع الأخير'}
                {period === 'monthly' && 'الشهر الأخير'}
                {period === 'custom' && 'فترة مخصصة محددة'}
              </span></p>
            </div>
          </div>

          {/* 📋 مربع الملخص المالي التحليلي للتقرير */}
          <div className="print-header-box grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="p-2 border-l border-gray-200/80 last:border-0">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">الاجمالي بالتقرير</span>
              <span className="text-base font-black text-slate-900 font-sans">
                {analyticsData.grandTotal?.toLocaleString()} ج.م
              </span>
            </div>
            <div className="p-2 border-l border-gray-200/80 last:border-0">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">عدد التجار خلال الفتره</span>
              <span className="text-base font-black text-slate-900 font-sans">
                {analyticsData.totalMerchants} تاجر عميل
              </span>
            </div>
            <div className="p-2 last:border-0">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">تاريخ النطاق المستخرج</span>
              <span className="text-[11px] font-black text-slate-700">
                {period === 'custom' ? `من ${fromDate || 'البداية'} إلى ${toDate || 'اليوم'}` : 'تحديث فوري وتلقائي'}
              </span>
            </div>
          </div>

          {/* 📊 جدول رصد حركة التجار التفصيلي */}
          <div className="print-section-title">بيان مفصل بحجم الحركات المالية المجمّعة للتجار</div>
          
<div className="w-full overflow-auto rounded-xl border border-slate-200 -sm">
  <table className="w-full min-w-7xl text-right text-xs border-collapse">
    <thead>
      <tr className="bg-slate-900 text-white sticky top-0 z-10 select-none">
        <th style={{ width: '70px' }} className="p-3.5 text-center font-bold">الترتيب</th>
        <th className="p-3.5 font-bold">اسم التاجر العميل</th>
        {/* <th className="p-3.5 font-bold">رقم الهاتف المسجل</th> */}
        <th className="p-3.5 text-center font-bold">عدد العمليات</th>
        <th className="p-3.5 font-bold">آخر حركة مسجلة</th>
        <th style={{ width: '190px' }} className="p-3.5 text-left font-bold">إجمالي المبلغ خلال الفترة</th>
      </tr>
    </thead>
    <tbody className="divide-y divide-slate-100 bg-white">
      {analyticsData.data?.length === 0 ? (
        <tr>
          <td colSpan="5" className="text-center text-slate-400 p-8 font-bold text-sm bg-slate-50/50">
            لا توجد بيانات مطابقة لمعايير الفلترة والبحث المحددة حالياً.
          </td>
        </tr>
      ) : (
        analyticsData.data.map((merchant, index) => (
          <tr 
            key={index} 
            className="group hover:bg-slate-50/80 transition-colors duration-200 font-medium text-slate-700"
          >
            {/* الترتيب التلقائي */}
            <td className="p-3.5 text-center font-sans font-semibold text-slate-500 bg-slate-50/50 group-hover:bg-slate-100/50 print:bg-transparent text-xs">
              #{index + 1}
            </td>
            
            {/* اسم التاجر */}
            <td className="p-3.5 text-slate-900 font-bold text-[13px]">
              {merchant.merchantName || "اسم غير معرّف"}
            </td>
            
            {/* <td className="p-3.5 font-sans text-slate-500">
              {merchant.phone || "-"}
            </td> */}
            
            {/* عدد العمليات */}
            <td className="p-3.5 text-center font-sans font-semibold text-slate-700">
              {merchant.transactionsCount}
            </td>
            
            {/* آخر حركة */}
            <td className="p-3.5 font-sans text-[11px] text-slate-400 font-normal">
              {merchant.lastTransaction ? new Date(merchant.lastTransaction).toLocaleString('ar-EG') : "-"}
            </td>
            
            {/* إجمالي المبلغ المالي */}
            <td className="p-3.5 font-sans font-black text-left text-[13px] bg-slate-50/30 group-hover:bg-slate-100/30 print:bg-transparent">
              <span className={`inline-block px-2.5 py-1 rounded-lg font-bold ${
                reportType === 'incoming' 
                  ? 'text-emerald-700 bg-emerald-50/60 print:bg-transparent print:p-0' 
                  : 'text-rose-700 bg-rose-50/60 print:bg-transparent print:p-0'
              }`}>
                {merchant.totalAmount?.toLocaleString()} ج.م
              </span>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>



        </div>
      )}
    </div>
  );
}