import React, { useState, useEffect } from 'react';
import { 
  Search, ArrowUpRight, ArrowDownLeft, Eye, X, Calendar, 
  Info, User, Wallet, Hash, FileText, ChevronRight, ChevronLeft, Trash2,
  Printer, Share2
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import moment from "moment-timezone";
import html2pdf from "html2pdf.js";
import ExportExcelButton from '../../services/exportExcelButton';

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState("all");
  const [operationType, setOperationType] = useState("all");

  const [selectedDate, setSelectedDate] = useState(
    moment().tz("Africa/Cairo").format("YYYY-MM-DD")
  );
  const [fromDate, setFromDate] = useState(
    moment().tz("Africa/Cairo").format("YYYY-MM-DD")
  );
  const [toDate, setToDate] = useState(
    moment().tz("Africa/Cairo").format("YYYY-MM-DD")
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [viewData, setViewData] = useState(null);

  const [printData, setPrintData] = useState([]);
  const [exporting, setExporting] = useState(false);

  const buildFilterQuery = () => {
    let q = "";
    if (searchTerm.trim() !== "") q += `&search=${encodeURIComponent(searchTerm)}`;
    if (filterType === "daily") q += `&filterType=daily&date=${selectedDate}`;
    else if (filterType === "monthly") q += `&filterType=monthly&date=${selectedDate}`;
    else if (filterType === "custom") q += `&filterType=custom&fromDate=${fromDate}&toDate=${toDate}`;
    if (operationType !== "all") q += `&type=${operationType}`;
    return q;
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const queryParams = `?page=${currentPage}&limit=${limit}${buildFilterQuery()}`;
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

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterType, selectedDate, fromDate, toDate, operationType]);

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, filterType, selectedDate, fromDate, toDate, operationType]);

  const getWalletRole = (tx) => {
    const current = tx.walletId?.phoneNumber;
    if (tx.senderPhone === current) return "sender";
    if (tx.receiverPhone === current) return "receiver";
    return "unknown";
  };

  // const handleDelete = async (id) => {
  //   const result = await Swal.fire({
  //     title: 'هل أنت متأكد؟',
  //     text: "حذف المعاملة سيؤثر على أرصدة المحافظ المرتبطة!",
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'نعم، احذف',
  //     cancelButtonText: 'إلغاء',
  //     confirmButtonColor: '#ef4444'
  //   });
  //   if (result.isConfirmed) {
  //     try {
  //       await api.delete(`/transaction/V2/${id}`);
  //       fetchTransactions();
  //       Swal.fire('تم الحذف', 'تم مسح المعاملة بنجاح', 'success');
  //     } catch (err) { Swal.fire('خطأ', 'فشل الحذف', 'error'); }
  //   }
  // };

  // 🆕 حساب الإجماليات من البيانات

const handleDelete = async (tx) => {
  const result = await Swal.fire({
    title: "هل أنت متأكد؟",
    text: "حذف المعاملة سيؤثر على البيانات المرتبطة!",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "نعم، احذف",
    cancelButtonText: "إلغاء",
    confirmButtonColor: "#ef4444",
  });

  if (!result.isConfirmed) return;

  try {
    // لو العملية مرتبطة بمورد
    if (tx.supplierId && tx.refrenceId) {
      await api.delete(
        `/transaction/V3/${tx.refrenceId}/${tx.supplierId}`
      );
    } else {
      // حذف عادي
      await api.delete(`/transaction/V2/${tx._id}`);
    }

    fetchTransactions();

    Swal.fire(
      "تم الحذف",
      "تم مسح المعاملة بنجاح",
      "success"
    );

  } catch (err) {
    console.error(err);

    Swal.fire(
      "خطأ",
      err.response?.data?.message || "فشل الحذف",
      "error"
    );
  }
};
  const calculateTotals = (data) => {
    let totalSent = 0;
    let totalReceived = 0;
    data.forEach(tx => {
      if (tx.type === 'send') totalSent += tx.amount || 0;
      else if (tx.type === 'receive') totalReceived += tx.amount || 0;
    });
    return { totalSent, totalReceived };
  };

  const preparePrintData = async () => {
    const res = await api.get(`/transaction/?all=true${buildFilterQuery()}`);
    const rows = res.data.transactions || [];
    setPrintData(rows);
    return rows;
  };

  const handlePrint = async () => {
    setExporting(true);
    try {
      await preparePrintData();
      setTimeout(() => {
        window.print();
        setExporting(false);
      }, 300);
    } catch (err) {
      Swal.fire('خطأ', 'فشل توليد التقرير', 'error');
      setExporting(false);
    }
  };

  const handleShare = async () => {
    setExporting(true);
    try {
      await preparePrintData();
      await new Promise((resolve) => setTimeout(resolve, 300));

      const element = document.getElementById("transactions-print-capture");
      if (!element) return;

      const fileName = `تقرير-العمليات-${moment().format("YYYY-MM-DD")}.pdf`;

      const options = {
        margin: 10,
        filename: fileName,
        image: { type: "jpeg", quality: 1 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "landscape" }
      };

      const pdfBlob = await html2pdf().set(options).from(element).output("blob");
      const file = new File([pdfBlob], fileName, { type: "application/pdf" });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "تقرير العمليات",
          text: "مرفق تقرير العمليات"
        });
      } else {
        html2pdf().set(options).from(element).save();
      }
    } catch (err) {
      console.error(err);
      Swal.fire('خطأ', 'فشل توليد أو مشاركة التقرير', 'error');
    } finally {
      setExporting(false);
    }
  };

  // حساب الإجماليات للطباعة
  const printTotals = calculateTotals(printData);

  const filterLabel = { all: "الكل", daily: "يومي", monthly: "شهري", custom: "مخصص" }[filterType];
  const typeLabel = { all: "الكل", receive: "استلام", send: "إرسال", out: "تحويل خارجي" }[operationType];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .print-only { display: none; }
        @media print {
          .no-print-area { display: none !important; }
          .print-only { display: block !important; }
          @page { size: A4 landscape; margin: 10mm; }
        }
      `}} />

      {/* الواجهة العادية */}
      <div className="w-[100vw] md:w-full mx-auto p-4 font-['cairo'] text-right max-h-screen bg-slate-50/50 overflow-auto no-print-area" dir="rtl">

        {/* Header & Filter Bar */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-end mb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-black text-slate-900">سجل العمليات</h2>
            <p className="text-slate-400 text-sm font-bold">متابعة وتدقيق كافة التحويلات المالية (الإجمالي: {totalItems})</p>
          </div>

          <div className="flex flex-col md:flex-row gap-3 items-center">

            <div className="flex bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
              {["all", "daily", "monthly", "custom"].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                    filterType === type ? "bg-slate-900 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {type === "all" && "الكل"}
                  {type === "daily" && "يومي"}
                  {type === "monthly" && "شهري"}
                  {type === "custom" && "مخصص"}
                </button>
              ))}
            </div>

            {(filterType === "daily" || filterType === "monthly") && (
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold outline-none"
              />
            )}

            {filterType === "custom" && (
              <div className="flex gap-2 items-center">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold mb-1">من</span>
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 font-bold mb-1">إلى</span>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handlePrint}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
              >
                <Printer size={16} /> طباعة
              </button>
              <button
                onClick={handleShare}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm disabled:opacity-50"
              >
                <Share2 size={16} /> مشاركة
              </button>
            </div>
          </div>
        </div>

        <div className="flex bg-white p-1.5 rounded-lg shadow-sm border border-slate-200 w-fit mb-6">
          {["all", "receive", "send", "out"].map((type) => (
            <button
              key={type}
              onClick={() => setOperationType(type)}
              className={`px-4 py-2 rounded-lg text-xs font-black transition-all ${
                operationType === type ? "bg-blue-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-50"
              }`}
            >
              {type === "all" && "الكل"}
              {type === "receive" && "استلام"}
              {type === "send" && "إرسال"}
              {type === "out" && "تحويل خارجي"}
            </button>
          ))}

               <ExportExcelButton
                      
                        data={transactions}
  fileName={"عرض عمليات المحافظ"}
  sheetName={"عرض عمليات المحافظ"} />
        </div>



        <div className="relative mb-6">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            className="w-full bg-white border border-slate-200 rounded-lg py-4 pr-12 pl-4 outline-none focus:ring-4 ring-blue-500/5 transition-all font-bold text-slate-700 shadow-sm"
            placeholder="ابحث بالاسم، الرقم، أو قيمة المبلغ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* 🆕 عرض إجمالي الاستلام والإرسال في الواجهة */}
        <div className="flex grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">إجمالي الإرسال</p>
            <p className="text-xl font-black text-red-600">
              {transactions.filter(tx => tx.type === 'send').reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-lg px-6 py-3 shadow-sm">
            <p className="text-xs text-slate-400 font-bold">إجمالي الاستلام</p>
            <p className="text-xl font-black text-green-600">
              {transactions.filter(tx => tx.type === 'receive').reduce((sum, tx) => sum + (tx.amount || 0), 0).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م
            </p>
          </div>

        </div>

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
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold">جاري تحميل البيانات...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan="5" className="p-10 text-center text-slate-400 font-bold">لا توجد معاملات متطابقة.</td></tr>
              ) : (
                transactions.map((tx) => {
                  const role = getWalletRole(tx);
                  return (
                    <tr key={tx._id} className="group hover:bg-blue-50/30 transition-all">
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
                      <td className="p-5 font-black text-base">
                        <span className={role === "sender" ? "text-red-600" : "text-green-600"}>
                          {role === "sender" ? "-" : "+"} {tx.amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م
                        </span>
                      </td>
                      <td className="p-5 text-slate-500 font-bold">{tx.walletId?.walletName || "تحويل خارجي "}</td>
                      <td className="p-5">
                        <p className="text-slate-700 font-bold">{moment(tx.createdAt).tz("Africa/Cairo").format("YYYY-MM-DD")}</p>
                        <p className="text-[10px] text-slate-400">{moment(tx.createdAt).tz("Africa/Cairo").format("hh:mm A")}</p>
                      </td>
                      <td className="p-5">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setViewData(tx)} className="p-2.5 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-600 hover:text-white transition-all">
                            <Eye size={18} />
                          </button>
                          {tx.ispay && (
                            <button onClick={() => handleDelete(tx)} className="p-2.5 text-red-600 bg-red-50 rounded-lg hover:bg-red-600 hover:text-white transition-all">
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

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

        {viewData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="p-8 bg-slate-900 text-white flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black flex items-center gap-3">تفاصيل المعاملة</h3>
                  <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase">ID: {viewData._id}</p>
                  <p className="text-slate-400 text-xs mt-1 tracking-widest uppercase"><span className='font-bold'>نوع العمليه </span>: {viewData.type === "receive" ? "استلام" : "ارسال"}</p>
                </div>
                <button onClick={() => setViewData(null)} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"><X/></button>
              </div>
              <div className="p-8 space-y-8">
                <div className="grid grid-cols-2 gap-8">
                  <DetailItem label="المرسل" value={viewData.senderName} subValue={viewData.senderPhone} icon={<User size={16}/>} />
                  <DetailItem label="المستلم" value={viewData.receiverName} subValue={viewData.receiverPhone} icon={<User size={16}/>} />
                  <DetailItem label="المبلغ" value={`${viewData.amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م`} highlight icon={<Hash size={16}/>} />
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

      {/* 🆕 قسم الطباعة/التصدير مع إجمالي الاستلام والإرسال */}
      <div id="transactions-print-capture" className="print-only" dir="rtl" style={{ fontFamily: 'Tahoma, sans-serif', color: '#000', padding: '20px', background: '#fff' }}>
        <div style={{ textAlign: 'center', border: '3px double #000', padding: '16px', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '22px', margin: 0, fontWeight: 900 }}>تقرير العمليات</h1>
          <p style={{ fontSize: '13px', margin: '6px 0 0' }}>
            فلترة التاريخ: {filterLabel} &nbsp;|&nbsp;
            نوع العملية: {typeLabel} &nbsp;|&nbsp;
            إجمالي العمليات: {printData.length} &nbsp;|&nbsp;
            تاريخ التقرير: {moment().tz("Africa/Cairo").format("YYYY-MM-DD hh:mm A")}
          </p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #000', marginBottom: '20px' }}>
          <thead>
            <tr>
              <th style={thStyle}>العملية</th>
              <th style={thStyle}>المبلغ</th>
              <th style={thStyle}>المحفظة</th>
              <th style={thStyle}>التاريخ والوقت</th>
            </tr>
          </thead>
          <tbody>
            {printData.map((tx) => {
              const role = getWalletRole(tx);
              return (
                <tr key={tx._id}>
                  <td style={tdStyle}>{tx.senderName || "—"} ← {tx.receiverName || "—"}</td>
                  <td style={tdStyle}>{role === "sender" ? "-" : "+"} {tx.amount.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م</td>
                  <td style={tdStyle}>{tx.walletId?.walletName || "تحويل خارجي "}</td>
                  <td style={tdStyle}>{moment(tx.createdAt).tz("Africa/Cairo").format("YYYY-MM-DD hh:mm A")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* 🆕 إجمالي الاستلام والإرسال في التقرير */}
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          justifyContent: 'center',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            padding: '12px 25px', 
            border: '2px solid #e53e3e', 
            fontWeight: 900, 
            fontSize: '16px',
            color: '#c53030',
            background: '#fff5f5'
          }}>
            إجمالي الإرسال: {printTotals.totalSent.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م
          </div>
          <div style={{ 
            padding: '12px 25px', 
            border: '2px solid #38a169', 
            fontWeight: 900, 
            fontSize: '16px',
            color: '#2f855a',
            background: '#f0fff4'
          }}>
            إجمالي الاستلام: {printTotals.totalReceived.toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م
          </div>
          <div style={{ 
            padding: '12px 25px', 
            border: '2px solid #000', 
            fontWeight: 900, 
            fontSize: '16px',
            color: '#fff',
            background: '#000'
          }}>
            صافي (الفرق): {(printTotals.totalReceived - printTotals.totalSent).toLocaleString("en-US", {
    maximumFractionDigits: 0,
  })} ج.م
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; padding: 0; }
          .max-w-4xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          @page { size: auto; margin: 15mm; }
        }
      `}</style>

    </>
  );
};

const thStyle = { background: '#f2f2f2', padding: '10px', border: '1px solid #000', fontSize: '12px', fontWeight: 900 };
const tdStyle = { padding: '8px', border: '1px solid #000', textAlign: 'center', fontSize: '12px' };

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