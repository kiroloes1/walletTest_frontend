import { Link } from "react-router-dom";
import { Wallet, ArrowRight, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-6 text-center " dir="rtl">
      
      {/* أيقونة المحفظة بسيطة */}
      <div className="mb-6">
        <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto border border-slate-100">
          <Wallet size={48} className="text-slate-400" />
        </div>
      </div>

      {/* رقم الخطأ */}
      <h1 className="text-6xl font-bold text-slate-900 mb-4">404</h1>

      {/* رسالة واضحة */}
      <h2 className="text-xl font-semibold text-slate-800 mb-2">الصفحة غير موجودة</h2>
      <p className="text-slate-500 mb-8 max-w-sm mx-auto">
        نعتذر، يبدو أن الرابط الذي اتبعته غير صحيح أو أن الصفحة قد تم نقلها.
      </p>

      {/* أزرار التنقل */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/"
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} />
          العودة للرئيسية
        </Link>
        
        <button 
          onClick={() => window.history.back()}
          className="bg-white text-slate-600 border border-slate-200 px-8 py-3 rounded-xl font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
        >
          رجوع للخلف
          <ArrowRight size={18} className="rotate-180" />
        </button>
      </div>

    </div>
  );
}