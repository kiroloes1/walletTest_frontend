import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Printer, ArrowRight, Wallet
} from 'lucide-react';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/ar';
import html2pdf from "html2pdf.js";
const PrintAll = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [walletsList, setWalletsList] = useState([]); // حالة لتخزين قائمة المحافظ
  const [loading, setLoading] = useState(true);
const [sharing, setSharing] = useState(false);

  moment.locale('ar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // جلب الإحصائيات العامة وجلب قائمة المحافظ التفصيلية
        const [responseStats, responseWallets] = await Promise.all([
          api.get('/dashboard'),
          api.get('/wallet/')
        ]);
        
        setStats(responseStats.data);
        setWalletsList(responseWallets.data.wallets || []);
      } catch (err) {
        console.error("خطأ في جلب البيانات", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  
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
                  title: "تقرير طباعه كل المحافظ",
                  text: "مرفق تقرير كل المحافظ"
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

  const handlePrint = () => window.print();

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-black">جاري تحضير المسودة الرسمية...</div>;
  if (!stats) return <div className="p-10 text-center font-bold text-black border-2 border-black m-10">فشل في استرداد البيانات الرقمية!</div>;

  return (
    <div className="min-h-screen bg-white md:p-10 font-['Tahoma'] print:p-0" dir="rtl">
      
      {/* Navigation - Hidden on Print */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-black font-black text-sm border-b-2 border-black">
          <ArrowRight size={18}/> العودة للنظام
        </button>
       <div className='flex gap-5'>

                <button onClick={handlePrint} className="bg-black text-white px-6 py-2 flex items-center gap-2 hover:bg-neutral-800 transition-all font-bold rounded-xl">
          <Printer size={18}/> أمر طباعة (A4)
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

      {/* Actual Document */}
      <div id="invoice-capture" dir="rtl" className="max-w-[210mm] mx-auto bg-white border-2 border-black print:border-0 overflow-hidden min-h-[297mm] flex flex-col relative">
        
        <div className="h-4 bg-black w-full"></div>

        <div className="p-10 border-b-2 border-black flex justify-between items-center">
          <div className="space-y-2">
            <h1 className="text-2xl font-Arial  text-black tracking-tighter">نظام محافظ أولاد موسى فلتس </h1>

          </div>
          <div className="text-left">
            <h2 className="text-2xl font-black text-black mb-1">تقرير جرد مالي عام</h2>
            <div className="text-[11px] font-bold text-black space-y-1">
              <p>تاريخ الاستخراج: {moment().format('YYYY/MM/DD')}</p>
              <p className="tabular-nums">وقت البيان: {moment().format('hh:mm A')}</p>
            </div>
          </div>
        </div>

        <div className="p-10 flex-grow space-y-10">
          
          {/* Section 1: Wallet Analysis */}
          <div className="space-y-4">
            <h3 className="text-lg font-black bg-black text-white px-4 py-1 w-fit">أولاً: تحليل أرصدة المحافظ</h3>
            <div className="grid grid-cols-2 border-2 border-black">
              <div className="p-6 border-l-2 border-black space-y-1">
                <p className="text-[10px] font-black uppercase">إجمالي عدد المحافظ</p>
                <p className="text-4xl font-black tabular-nums">{stats.wallets.totalWallets}</p>
              </div>
              <div className="p-6 space-y-1 bg-neutral-100 print:bg-neutral-100">
                <p className="text-[10px] font-black uppercase">السيولة الإجمالية بالنظام</p>
                <p className="text-4xl font-black tabular-nums">
                  {stats.wallets.totalBalance.toLocaleString()} <span className="text-sm font-bold">ج.م</span>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Financial Flow */}
          <div className="space-y-4">
            <h3 className="text-lg font-black bg-black text-white px-4 py-1 w-fit">ثانياً: ملخص التدفق النقدي الشامل</h3>
            <table className="w-full border-2 border-black border-collapse">
              <thead>
                <tr className="bg-neutral-100 border-b-2 border-black">
                  <th className="p-3 text-right text-xs font-black border-l-2 border-black uppercase">نوع البيان</th>
                  <th className="p-3 text-center text-xs font-black uppercase">القيمة خلال الشهر الحالي</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black font-bold">
                <tr>
                  <td className="p-4 text-sm border-l-2 border-black">إجمالي المبالغ المستلمة </td>
                  <td className="p-4 text-center tabular-nums bg-neutral-50">{stats.transactions.monthlyIncoming.toLocaleString()} ج.م</td>
                </tr>
                <tr>
                  <td className="p-4 text-sm border-l-2 border-black">إجمالي المبالغ المرسلة </td>
                  <td className="p-4 text-center tabular-nums bg-neutral-50">{stats.transactions.monthlyOutgoing.toLocaleString()} ج.م</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Section 3: Detailed Wallets (NEW - Added per request) */}
          <div className="space-y-4">
            <h3 className="text-lg font-black bg-black text-white px-4 py-1 w-fit">ثالثاً: تفاصيل أرصدة المحافظ </h3>
            <table className="w-full border-2 border-black border-collapse text-[12px]">
     <thead>
  <tr className="bg-neutral-100 border-b-2 border-black font-black">
    <th className="p-2 border-l-2 border-black text-right">اسم المحفظة</th>
    <th className="p-2 border-l-2 border-black text-center">رصيد سابق (مرحل)</th>
    <th className="p-2 border-l-2 border-black text-center">استلام (الشهر)</th>
    <th className="p-2 border-l-2 border-black text-center">ارسال (الشهر)</th>
    <th className="p-2 text-center border-l-2 border-black  bg-neutral-200">قيمه الرصيد الأساسي </th>
    <th className="p-2 text-center border-l-2 border-black  bg-neutral-200"> قيمه الرسوم</th>
    <th className="p-2 text-center bg-neutral-200">الرصيد الإجمالي الحالي</th>

  </tr>
</thead>
              <tbody className="divide-y divide-black">
  {walletsList.map((w) => {
  // حساب الرصيد القديم (الرصيد الحالي - (المستلم - المرسل))
  const monthlyNet = w.monthlyIncoming - w.monthlyOutgoing;
  const initialBalance = w.balance - monthlyNet;

  return (
    <tr key={w._id} className={w.balance > 0 ? "bg-white" : "bg-neutral-50 opacity-60"}>
      <td className="p-2 border-l-2 border-black font-bold">
        {w.walletName}
        <div className="text-[10px] font-normal">{w.ownerName} - {w.phoneNumber}</div>
      </td>
      <td className="p-2 border-l-2 border-black text-center tabular-nums">
        {initialBalance.toLocaleString()}
      </td>
      <td className="p-2 border-l-2 border-black text-center tabular-nums text-green-700">
        +{w.monthlyIncoming.toLocaleString()}
      </td>
      <td className="p-2 border-l-2 border-black text-center tabular-nums text-red-700">
        -{w.monthlyOutgoing.toLocaleString()}
      </td>
        <td className="p-2 text-center border-l-2 border-black font-black tabular-nums bg-neutral-100">
        {(w.balance).toLocaleString()} ج.م
      </td>
            <td className="p-2 text-center border-l-2 border-black font-black tabular-nums bg-neutral-100">
        {((w?.fees||0)).toLocaleString()} ج.م
      </td>
      <td className="p-2 text-center font-black tabular-nums bg-neutral-100">
        {(w.balance- (w?.fees||0)).toLocaleString()} ج.م
      </td>
    </tr>
  );
})}
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="mt-auto pt-10">
             <div className="flex justify-center">
                <div className="inline-block p-1 border-2 border-black rotate-3 font-black text-xl opacity-20 select-none uppercase">
                   <br/> نظام محافظ أولاد موسى فلتس 
                </div>
             </div>
          </div>
        </div>

      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { -webkit-print-color-adjust: exact; background-color: white !important; }
          @page { size: A4; margin: 10mm; }
          .no-print { display: none !important; }
        }
      `}} />
    </div>
  );
};

export default PrintAll;