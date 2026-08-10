import React, { useState, useEffect } from 'react';
import { Search, Send, ArrowDownLeft, Wallet, User, Phone, Info, ArrowUpRight } from 'lucide-react';
import api from '../../services/api'; // تأكد من مسار الـ api
import Swal from 'sweetalert2';
import { AnimatePresence } from 'framer-motion';

const CreateTransaction = () => {
  const [suggestionWallets, setSuggestionWallets] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const[loding,setLoading]=useState(false)
  // بيانات النموذج
const [formData, setFormData] = useState({
  walletId: '',
  senderName: '',
  receiverName: '',
  senderPhone: '',
  receiverPhone: '',
  type: 'send',
  notes: '',
  amount: '',
  createdAt:''
});

const calculateFees = (amount, senderPhone, receiverPhone) => {
  if (!amount || !senderPhone || !receiverPhone) return 0;

  const senderCode = senderPhone.slice(0, 3);
  const receiverCode = receiverPhone.slice(0, 3);

  if (senderCode === receiverCode) {
    return 1;
  }

  const fee = amount * 0.005;
  return Math.min(Math.max(fee, 1), 15);
};

useEffect(()=>{

const now=new Date();
const localDate=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);
setFormData(prev=>({...prev,createdAt:localDate}));
},[]);

  const [selectedWalletDetails, setSelectedWalletDetails] = useState(null);

     const fetchSuggestions = async () => {
      try {
        const res = await api.get('/wallet/getSugg');
        setSuggestionWallets(res.data.wallets);
      } catch (err) { console.error("Error fetching suggestions", err); }
    };
  useEffect(() => {

    fetchSuggestions();
  }, []) ;

  // 2. تصفية المحافظ بناءً على كتابة المستخدم
  const filteredSuggestions = suggestionWallets.filter(w => 
    w.walletName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    w.phoneNumber.includes(searchTerm)
  );

  // 3. منطق اختيار المحفظة
  const handleSelectWallet = (wallet) => {
    setSelectedWalletDetails(wallet);
    setSearchTerm(wallet.walletName);
    setShowSuggestions(false);

    // توزيع الداتا بناءً على نوع العملية
    if (formData.type === 'send') {
      setFormData({
        ...formData,
        walletId: wallet._id,
        senderName: wallet.ownerName,
        senderPhone: wallet.phoneNumber,
        receiverPhone: '', // يترك للمستخدم
        receiverName: ''
      });
    } else {
      setFormData({
        ...formData,
        walletId: wallet._id,
        receiverName: wallet.ownerName,
        receiverPhone: wallet.phoneNumber,
        senderPhone: '', // يترك للمستخدم
        senderName: ''
      });
    }
  };

  
  useEffect(() => {
    if (selectedWalletDetails) {
      if (formData.type === 'send') {
        setFormData(prev => ({
          ...prev,
          walletId: selectedWalletDetails._id,
          senderName: selectedWalletDetails.ownerName,
          senderPhone: selectedWalletDetails.phoneNumber,
          receiverName: '', // تصفير الطرف الآخر ليدخله المستخدم
          receiverPhone: ''
        }));
      } else {
        setFormData(prev => ({
          ...prev,
          walletId: selectedWalletDetails._id,
          receiverName: selectedWalletDetails.ownerName,
          receiverPhone: selectedWalletDetails.phoneNumber,
          senderName: '', // تصفير الطرف الآخر ليدخله المستخدم
          senderPhone: ''
        }));
      }
    }
  }, [formData.type, selectedWalletDetails]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    try {
        if(formData.amount<0 || !formData.receiverName || !formData.receiverPhone 
            || !formData.senderName || !formData.senderPhone 
        ){
          return   Swal.fire(' خطاء', '  يجب ملئ جميع الحقول  ', 'error')
        }

      await api.post('/transaction/V2', formData);
      Swal.fire('تمت العملية', 'تم تسجيل الحركة المالية بنجاح', 'success');
      // ريست للنموذج
setFormData({

walletId:'',

senderName:'',

receiverName:'',

senderPhone:'',

receiverPhone:'',

type:'send',

notes:'',

amount:'',

createdAt:
new Date(
Date.now()
-
new Date().getTimezoneOffset()*60000
)
.toISOString()
.slice(0,16)

}); 
      setSearchTerm('');
      setSelectedWalletDetails(null);
      fetchSuggestions();

    } catch (err) {
      Swal.fire('خطأ', err.response?.data?.message || 'فشلت العملية', 'error');
    }finally{
      setLoading(false)
    }
  };

  const fees = calculateFees(
  formData.amount,
  formData.senderPhone,
  formData.receiverPhone
);

const totalAmount = Number(formData.amount || 0) + fees;

  return (
    <div className=" mx-auto p-6 bg-white rounded-xl -xl border border-slate-50 font-['cairo']" dir="rtl">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white">
          <Send size={24} />
        </div>
        <div>
          <h2 className="text-2xl font-black">إنشاء حركة مالية</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">New Transaction Pipeline</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* اختر نوع العملية أولاً */}
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button"
            onClick={() =>   setFormData({...formData, type: 'send'})}
            className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-black ${formData.type === 'send' ? 'border-slate-900 bg-slate-900 text-white -lg' : 'border-slate-100 text-slate-400'}`}
          >
            <ArrowUpRight size={20}/> إرسال (من المحفظة)
          </button>
          <button 
            type="button"
            onClick={() => setFormData({...formData, type: 'receive'})}
            className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 font-black ${formData.type === 'receive' ? 'border-slate-900 bg-slate-900 text-white -lg' : 'border-slate-100 text-slate-400'}`}
          >
            <ArrowDownLeft size={20}/> استلام (إلى المحفظة)
          </button>
        </div>

        <div className="space-y-2">
  <label className="text-xs font-black text-slate-500 mr-2">
    تاريخ العملية
  </label>

  <input
    type="datetime-local"
    className="
    w-full
    bg-slate-50
    rounded-lg
    p-3
    border
    border-transparent
    focus:border-slate-100
    font-bold
    text-sm
    outline-none
    "
    value={formData.createdAt}
    onChange={(e)=>
      setFormData({
        ...formData,
        createdAt:e.target.value
      })
    }
  />

</div>

        {/* محرك البحث عن المحفظة */}
        <div className="relative">
          <label className="text-xs font-black text-slate-500 mb-2 block mr-2">ابحث عن المحفظة (بالاسم أو الرقم) *</label>
          <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              className="w-full bg-slate-50 border-2 border-transparent focus:border-slate-200 rounded-lg py-4 pr-12 pl-4 outline-none font-bold transition-all"
              placeholder="اكتب حرفاً للبحث..."
              value={searchTerm}
              onChange={(e) => {setSearchTerm(e.target.value); setShowSuggestions(true);}}
              onFocus={() => setShowSuggestions(true)}
            />
          </div>

          {/* قائمة الاقتراحات */}
          <AnimatePresence>
            {showSuggestions && searchTerm && (
              <ul className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-lg -2xl max-h-60 overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
                {filteredSuggestions.length > 0 ? filteredSuggestions.map(w => (
                  <li 
                    key={w._id}
                    onClick={() => handleSelectWallet(w)}
                    className="p-4 hover:bg-slate-50 rounded-lg cursor-pointer flex justify-between items-center transition-colors border-b border-slate-50 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs">{w.walletProvider[0].toUpperCase()}</div>
                        <div>
                            <p className="font-black text-sm">{w.walletName}</p>
                            <p className="text-[10px] font-bold text-slate-400">{w.phoneNumber}</p>
                        </div>
                    </div>
                    <div className="text-left">
                        <p className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">رصيد: {(w.balance-(w?.fees || 0 )).toLocaleString()}</p>
                    </div>
                  </li>
                )) : <li className="p-4 text-center text-slate-400 font-bold text-xs">لا توجد نتائج</li>}
              </ul>
            )}
          </AnimatePresence>
        </div>

        {/* عرض الرصيد المتاح فور الاختيار */}
        {selectedWalletDetails && (
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-blue-600 -sm"><Info size={20}/></div>
            <div>
              <p className="text-[10px] font-black text-blue-400 uppercase">الرصيد المتاح حالياً</p>
              <p className="text-xl font-black text-blue-900">{(selectedWalletDetails.balance-(selectedWalletDetails?.fees || 0)).toLocaleString()} <small className="text-xs">ج.م</small></p>
            </div>
          </div>
        )}

        {/* باقي الحقول */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">اسم المرسل</label>
            <input 
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
               value={formData.senderName} onChange={(e)=>setFormData({...formData, senderName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">رقم المرسل</label>
            <input 
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
              maxLength={11} value={formData.senderPhone} onChange={(e)=>setFormData({...formData, senderPhone: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">اسم المستلم</label>
            <input 
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
              value={formData.receiverName} onChange={(e)=>setFormData({...formData, receiverName: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">رقم المستلم</label>
            <input 
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none"
               maxLength={11}
              value={formData.receiverPhone} onChange={(e)=>setFormData({...formData, receiverPhone: e.target.value})}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2 uppercase tracking-widest">المبلغ (Amount) *</label>
            <input 
              type="number" required
              className="w-full bg-slate-900 text-white rounded-lg p-4 font-black text-xl outline-none placeholder:text-slate-600"
              placeholder="0.00"
               onChange={(e)=>setFormData({...formData, amount: Number(e.target.value)})}
            />
          </div>


          {formData.amount > 0 &&
 formData.senderPhone?.length >= 3 &&
 formData.receiverPhone?.length >= 3 && (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
    
    <div className="flex justify-between mb-2">
      <span className="font-bold text-slate-600">المبلغ</span>
      <span className="font-black">
        {Number(formData.amount).toLocaleString()} ج.م
      </span>
    </div>

    <div className="flex justify-between mb-2">
      <span className="font-bold text-slate-600">الرسوم</span>
      <span className="font-black text-orange-600">
        {fees.toLocaleString()} ج.م
      </span>
    </div>

    <hr className="my-2" />

    <div className="flex justify-between">
      <span className="font-black text-slate-900">
        الإجمالي
      </span>

      <span className="font-black text-lg text-emerald-600">
        {totalAmount.toLocaleString()} ج.م
      </span>
    </div>

  </div>
)}

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-500 mr-2">ملاحظات</label>
            <textarea 
              className="w-full bg-slate-50 rounded-lg p-3 border border-transparent focus:border-slate-100 font-bold text-sm outline-none h-[60px]"
              value={formData.notes} onChange={(e)=>setFormData({...formData, notes: e.target.value})}
            />
          </div>
        </div>

        <button 
            disabled={loding}
          type="submit"
          className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-5 rounded-xl font-black text-lg -xl -slate-200 hover:scale-[1.01] transition-all flex items-center justify-center gap-3"
        >
          <Send size={20}/> تأكيد وتسجيل العملية
        </button>
      </form>
    </div>
  );
};

export default CreateTransaction;