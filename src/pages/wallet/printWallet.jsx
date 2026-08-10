import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Printer, ArrowRight, Wallet, Calendar, User, Phone, 
  ShieldCheck, Hash, FileText, Landmark, Receipt
} from 'lucide-react';
import api from '../../services/api';
import moment from 'moment';
import 'moment/locale/ar';
import html2pdf from "html2pdf.js";
const WalletStatement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [wallet, setWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  
const calculateTransferFees = (
    amount,
    senderProvider,
    receiverProvider
) => {


    if (senderProvider === receiverProvider) {
        return 1;
    }

    
    const fee = amount * 0.005;

    return Math.min(Math.max(fee, 1), 15);
};
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const walletRes = await api.get(`/wallet/${id}`);
        const walletData = walletRes.data.wallet;
        setWallet(walletData);

        if (walletData?.phoneNumber) {
          const transRes = await api.get(`/transaction/getTransactionByWallet/${walletData.phoneNumber}`);
          setTransactions(transRes.data.transaction);
        }
      } catch (err) {
        console.error("خطأ في جلب البيانات", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

const currentMonthTransactions = transactions.filter(tx => {
  return moment(tx.createdAt).isSame(moment(), 'month');
  
});
moment.locale('ar');
  const handlePrint = () => window.print();

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
  

  if (loading) return <div className="p-10 text-center font-bold animate-pulse text-slate-400 font-['cairo']">جاري إصدار الوثيقة الرسمية...</div>;
  if (!wallet) return <div className="p-10 text-center font-bold text-red-600 font-['cairo']">عفواً، السجل غير متاح حالياً.</div>;

  return (
    <div className="min-h-screen bg-neutral-100 p-0 md:p-10 font-['cairo']print:bg-white print:p-0" dir="rtl">
      
      {/* Control Panel - Hidden in Print */}
      <div className="max-w-[210mm] mx-auto mb-6 flex justify-between items-center print:hidden px-6">
        <button onClick={() => navigate(-1)} className="group flex items-center gap-2 text-slate-500 hover:text-black transition-colors font-bold text-sm">
          <ArrowRight size={18} className="group-hover:-translate-x-1 transition-transform"/> عودة للوحة التحكم
        </button>
        
        <div className='flex gap-4'>
                  <button onClick={handlePrint} className="bg-black text-white px-6 py-2.5 rounded-md font-bold text-sm flex items-center gap-2 hover:bg-neutral-800 shadow-lg transition-all">
          <Printer size={16}/> طباعة المستند (A4)
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

      {/* A4 Paper Container */}
      <div id="invoice-capture" dir="rtl" className="max-w-[210mm] mx-auto bg-white shadow-[0_0_50px_rgba(0,0,0,0.05)] print:shadow-none print:border-0 relative overflow-hidden min-h-[297mm] flex flex-col border border-neutral-200">
        
        {/* Decorative Background Text for Authenticity (Only visible on screen/some printers) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-45 pointer-events-none opacity-[0.03] select-none">
          <h1 className="text-[150px] font-black uppercase tracking-widest">نظام محافظ أولاد موسى فلتس   </h1>
        </div>

        {/* Header - Corporate Style */}
        <div className="p-10 border-b-[3px] border-black flex justify-between items-start relative z-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <div className="bg-black p-1.5 rounded text-white">
                <Landmark size={24} />
              </div>
              <h1 className="text-2xl font-black font-Arial  text-black ">  نظام محافظ أولاد موسى فلتس</h1>
            </div>
          </div>

          <div className="text-left">
            <h2 className="text-xl font-black text-black mb-1">كشف حركات مالية</h2>
            <div className="space-y-0.5 text-[11px] font-bold text-neutral-500 uppercase tabular-nums">
              <p>رقم السجل: #{wallet._id.slice(-8).toUpperCase()}</p>
              <p>تاريخ البيان: {moment().format('YYYY/MM/DD')}</p>
            </div>
          </div>
        </div>

        <div className="p-10 flex-grow relative z-10">
          
          {/* Client & Status Section */}
          <div className="grid grid-cols-2 gap-10 mb-12">
            <div className="space-y-4">
               <div>
                 <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-1">العميل المستفيد</p>
                 <h3 className="text-xl font-black text-black leading-none">{wallet.ownerName}</h3>
               </div>
               <div className="grid grid-cols-2 text-[11px] font-bold text-neutral-600 gap-y-2">
                 <p>رقم الحساب:</p> <p className="text-black tabular-nums">{wallet.phoneNumber}</p>
                 <p>نوع المحفظة:</p> <p className="text-black">{wallet.walletProvider} Cash</p>
               </div>
            </div>
            
            <div className="bg-neutral-50 p-4 border border-neutral-100 rounded-sm">
               <p className="text-[9px] font-black text-neutral-400 uppercase tracking-widest mb-3">ملخص الحساب الحالي</p>
               <div className="space-y-2">
                 <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-neutral-500">قيمه الرصيد الأساسي:</span>
                    <span className="text-2xl font-black text-black tabular-nums">{wallet.balance.toLocaleString()} <small className="text-[10px]">ج.م</small></span>
                 </div>
                    <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-neutral-500"> قيمه الرسوم:</span>
                    <span className="text-2xl font-black text-black tabular-nums">{(wallet?.fees||0).toLocaleString()} <small className="text-[10px]">ج.م</small></span>
                 </div>
                               <div className="flex justify-between items-end">
                    <span className="text-xs font-bold text-neutral-500">قيمه الرصيد الصافي :</span>
                    <span className="text-2xl font-black text-black tabular-nums">{(wallet.balance-(wallet?.fees || 0)).toLocaleString()} <small className="text-[10px]">ج.م</small></span>
                 </div>
                 <div className="h-[1px] bg-neutral-200 w-full my-2"></div>
                 <p className="text-[10px] font-bold text-neutral-500">آخر تحديث للبيانات: {moment().format('LLL')}</p>
               </div>
            </div>
          </div>

          {/* Monthly Stats - Circular Minimal Style */}
          <div className="grid grid-cols-2 gap-4 mb-10">
             <div className="border border-neutral-200 p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase">إجمالي المستلم (هذا الشهر)</p>
                  <p className="text-lg font-black text-emerald-600 tabular-nums">+{wallet.monthlyIncoming.toLocaleString()} <small className="text-[10px]">ج.م</small></p>
                </div>
                <Receipt size={24} className="text-neutral-200" />
             </div>
             <div className="border border-neutral-200 p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase">إجمالي المرسل (هذا الشهر)</p>
                  <p className="text-lg font-black text-red-600 tabular-nums">-{wallet.monthlyOutgoing.toLocaleString()} <small className="text-[10px]">ج.م</small></p>
                </div>
                <Receipt size={24} className="text-neutral-200" />
             </div>
          </div>


                    {/* general Stats - Circular Minimal Style */}
          {/* <div className="grid grid-cols-2 gap-4 mb-10">
             <div className="border border-neutral-200 p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase">إجمالي المستلم الكلي</p>
                  <p className="text-lg font-black text-emerald-600 tabular-nums">+{wallet.totalIncoming.toLocaleString()} <small className="text-[10px]">ج.م</small></p>
                </div>
                <Receipt size={24} className="text-neutral-200" />
             </div>
             <div className="border border-neutral-200 p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase">إجمالي المرسل الكلي</p>
                  <p className="text-lg font-black text-red-600 tabular-nums">-{wallet.totalOutgoing.toLocaleString()} <small className="text-[10px]">ج.م</small></p>
                </div>
                <Receipt size={24} className="text-neutral-200" />
             </div>
          </div> */}

          {/* Transactions Table */}

<div className="space-y-4">
  <div className="flex justify-between items-end border-b border-black pb-1">
    <h4 className="text-[10px] font-black text-black uppercase tracking-widest w-fit">
      سجل عمليات شهر {moment().format('MMMM YYYY')}
    </h4>
    <span className="text-[9px] font-bold text-neutral-400">عدد العمليات: {currentMonthTransactions.length}</span>
  </div>
  
  <table className="w-full text-right">
<thead>
  <tr className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter border-b border-neutral-100">
    <th className="py-3 px-2">التاريخ</th>
    <th className="py-3 px-2">البيان</th>
    <th className="py-3 px-2">الحالة</th>
    <th className="py-3 px-2 text-left">الرسوم</th>
    <th className="py-3 px-2 text-left">القيمة</th>
  </tr>
</thead>
    <tbody className="divide-y divide-neutral-100">
      {currentMonthTransactions.length > 0 ? (
currentMonthTransactions.map((tx) => {
  const isIn = tx.receiverPhone === wallet.phoneNumber;

  const fees = !isIn
    ? calculateTransferFees(
        tx.amount,
        wallet.phoneNumber?.slice(0,3),
        tx.receiverPhone?.slice(0,3)
      )
    : 0;

  return (
    <tr key={tx._id} className="group">
      <td className="py-4 px-2">
        <p className="text-[11px] font-black text-black tabular-nums">
          {moment(tx.createdAt).format('DD/MM/YYYY')}
        </p>
        <p className="text-[9px] text-neutral-400 font-bold uppercase">
          {moment(tx.createdAt)
            .format('hh:mm a')
            .replace('am', 'ص')
            .replace('pm', 'م')}
        </p>
      </td>

      <td className="py-4 px-2">
        <p className="text-xs font-black text-neutral-800">
          {isIn ? tx.senderName : tx.receiverName}
        </p>
        <p className="text-[10px] text-neutral-400 tabular-nums">
          {isIn ? tx.senderPhone : tx.receiverPhone}
        </p>
      </td>

      <td className="py-4 px-2">
        <span
          className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${
            isIn
              ? 'border-emerald-200 text-emerald-600'
              : 'border-neutral-200 text-neutral-500'
          }`}
        >
          {isIn ? 'استلام' : 'إرسال'}
        </span>
      </td>

      <td className="py-4 px-2 text-left font-black text-amber-600 tabular-nums">
        {isIn ? '-' : fees.toLocaleString()}
      </td>

      <td
        className={`py-4 px-2 text-left font-black text-sm tabular-nums ${
          isIn ? 'text-emerald-600' : 'text-black'
        }`}
      >
        {isIn ? '+' : '-'}
        {tx.amount.toLocaleString()}
      </td>
    </tr>
  );
})
      ) : (
        <tr>
          <td colSpan="4" className="py-10 text-center text-xs font-bold text-neutral-400 uppercase tracking-widest">
            لا توجد عمليات مسجلة لهذا الشهر حتى الآن
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>


        </div>

  
      </div>

      {/* Styles for Printing */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body { background: white !important; }
          .print\\:shadow-none { border: none !important; }
          table { border-collapse: collapse !important; }
          tr { page-break-inside: avoid !important; }
        }
      `}} />

            {/* CSS الخاص بالطباعة */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; padding: 0; }
          .max-w-4xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          @page { size: auto; margin: 15mm; }
          
        }
      `}</style>
    </div>

    
  );
};

export default WalletStatement;