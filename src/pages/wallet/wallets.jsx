import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Trash2, Edit3, Power, Search, Phone, History, CreditCard, 
  Activity, Shield, ArrowDownLeft, ArrowUpRight, Menu, X, 
  AlertCircle, ChevronRight, Hash, User, Calendar, Clock, 
  BarChart3, TrendingUp, ArrowRightLeft, Landmark,
  Printer
} from 'lucide-react';
import api from '../../services/api';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';

const WalletDashboard = () => {
  const [wallets, setWallets] = useState([]);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTx, setLoadingTx] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');

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

  // منطق تجميع العمليات حسب الشهر
const monthlyStats = useMemo(() => {
  const stats = {};

  transactions.forEach(tx => {
    const date = new Date(tx.createdAt ||tx.updatedAt);
    const monthYear = date.toLocaleString('ar-EG', { month: 'long', year: 'numeric' });
    const isSender = tx.senderPhone === selectedWallet?.phoneNumber;

    if (!stats[monthYear]) {
      stats[monthYear] = { incoming: 0, outgoing: 0, count: 0 };
    }

    if (isSender) {
      stats[monthYear].outgoing += tx.amount;
    } else {
      stats[monthYear].incoming += tx.amount;
    }
    stats[monthYear].count += 1;
  });

  return Object.entries(stats);
}, [transactions, selectedWallet]);
  // منطق الفلترة الموحد
  const filteredWallets = useMemo(() => {
    return wallets.filter(w => {
      const matchesSearch = w.walletName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           w.phoneNumber.includes(searchTerm);
      
      if (!matchesSearch) return false;

      if (activeFilter === 'active') return ((w.status === 'active')  &&  (  w.monthlyOutgoing  / w.Limit  <0.75   &&  w.monthlyIncoming / w.Limit <0.75 ));
      if (activeFilter === 'inactive') return w.status !== 'active';
      if (activeFilter === 'warning') {
      
        return  ( (w.monthlyOutgoing  / w.Limit  >= 0.75) && (w.monthlyOutgoing  / w.Limit  < 1) )   || ( (w.monthlyIncoming / w.Limit >=0.75)  &&  (w.monthlyIncoming / w.Limit  < 1)   ) ; 
      }
            if (activeFilter === 'endLimit') {
      
        return   w.monthlyOutgoing  / w.Limit  >= 1   ||  w.monthlyIncoming / w.Limit >=1 ; 
      }
      
      return true;
    });
  }, [wallets, searchTerm, activeFilter]);

  const fetchWallets = async () => {
    try {
      const response = await api.get('/wallet/');
      const data = response.data.wallets;
      setWallets(data);
      if (!selectedWallet && data.length > 0) handleSelectWallet(data[0]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleSelectWallet = (wallet) => {
    setSelectedWallet(wallet);
    fetchTransactions(wallet.phoneNumber);
    if (window.innerWidth < 806) setIsSidebarOpen(false);
  };

  const fetchTransactions = async (phoneNumber) => {
    setLoadingTx(true);
    try {
      const response = await api.get(`/transaction/getTransactionByWallet/${phoneNumber}`);
      setTransactions(response.data.transaction || []);
    } catch (err) { setTransactions([]); } finally { setLoadingTx(false); }
  };

  const toggleStatus = async (wallet) => {
    const isActivating = wallet.status !== 'active';
    const result = await Swal.fire({
      title: isActivating ? 'تفعيل المحفظة؟' : 'تعطيل المحفظة؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: isActivating ? 'تفعيل' : 'إيقاف مؤقت',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: isActivating ? '#10b981' : '#f59e0b',
    });

    if (result.isConfirmed) {
      try {
        const newStatus = isActivating ? 'active' : 'inactive';
        await api.patch(`/wallet/${wallet._id}/status`, { status: newStatus });
        const updated = { ...wallet, status: newStatus };
        setSelectedWallet(updated);
        setWallets(wallets.map(w => w._id === wallet._id ? updated : w));
        Swal.fire('تم!', 'تم تحديث حالة المحفظة', 'success');
      } catch (err) { Swal.fire('خطأ', 'فشل التحديث', 'error'); }
    }
  };

  const deleteWallet = async (id) => {
    const result = await Swal.fire({
      title: 'هل أنت متأكد؟',
      text: "لن تتمكن من استعادة بيانات هذه المحفظة!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'نعم، احذفها',
      cancelButtonText: 'إلغاء'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/wallet/${id}`);
        setWallets(wallets.filter(w => w._id !== id));
        setSelectedWallet(null);
        Swal.fire('تم الحذف!', 'تمت إزالة المحفظة بنجاح.', 'success');
      } catch (err) { Swal.fire('خطأ', 'فشل في عملية الحذف', 'error'); }
    }
  };

  const handleUpdate = async (wallet) => {
    const { value: formValues } = await Swal.fire({
      title: 'تعديل بيانات المحفظة',
      html: `
        <div class="flex flex-col gap-3 p-2 font-['cairo']" dir="rtl">
          <label class="text-right text-xs font-bold text-slate-500">اسم المحفظة</label>
          <input id="swal-name" class="swal2-input m-0 w-full rounded-lg text-sm" value="${wallet.walletName}">
                    <label class="text-right text-xs font-bold text-slate-500"> صاحب المحفظة</label>
          <input id="swal-ownerName" class="swal2-input m-0 w-full rounded-lg text-sm" value="${wallet.ownerName}">
          <label class="text-right text-xs font-bold text-slate-500 mt-2">الحد الأقصى (Limit)</label>
          <input id="swal-limit" type="number" class="swal2-input m-0 w-full rounded-lg text-sm" value="${wallet.Limit}">
          <label class="text-right text-xs font-bold text-slate-500 mt-2">الرصيد الأساسي</label>
          <input id="swal-balance" type="number" class="swal2-input m-0 w-full rounded-lg text-sm" value="${(wallet.balance)}">
          <label class="text-right text-xs font-bold text-slate-500 mt-2"> رقم المحفظه</label>
          <input id="swal-phoneNumber" type="number" class="swal2-input m-0 w-full rounded-lg text-sm" value="${wallet.phoneNumber}">
           
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'حفظ التعديلات',
      cancelButtonText: 'إلغاء',
      confirmButtonColor: '#0f172a',
      preConfirm: () => ({
        walletName: document.getElementById('swal-name').value,
        Limit: Number(document.getElementById('swal-limit').value),
        balance: Number(document.getElementById('swal-balance').value),
        phoneNumber: (document.getElementById('swal-phoneNumber').value),
        ownerName: (document.getElementById('swal-ownerName').value),
      })
    });

    if (formValues) {
      try {
        await api.put(`/wallet/${wallet._id}`, formValues);
        const updatedWallet = { ...wallet, ...formValues };
        setWallets(wallets.map(w => w._id === wallet._id ? updatedWallet : w));
        setSelectedWallet(updatedWallet);
        Swal.fire('تم التحديث', 'تم حفظ التعديلات بنجاح', 'success');
      } catch (err) { Swal.fire('خطأ', 'فشل في حفظ التعديلات', 'error'); }
    }
  };

  useEffect(() => { fetchWallets(); }, []);

  if (loading) return <div className="h-screen flex items-center justify-center font-black bg-slate-50">جاري المزامنة...</div>;

  return (
    <div className="w-[100vw] md:w-full overflow-auto min-h-screen bg-[#F8FAFC] flex text-slate-900 font-['cairo']" dir="rtl">
      
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? '320px' : '0px', opacity: isSidebarOpen ? 1 : 0 }}
        className="fixed lg:relative z-50 bg-white border-l border-slate-200 h-screen flex flex-col overflow-hidden -2xl lg:-none"
      >
        <div className="p-6 border-b border-slate-50 shrink-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-black text-xl flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white"><Wallet size={18}/></div>
              المحافظ <span className="text-slate-300 text-sm font-bold">({wallets.length})</span>
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"><X size={20}/></button>
          </div>
          
          <div className="relative mb-4">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" placeholder="بحث باسم أو رقم المحفظة..." 
              className="w-full bg-slate-50 border-none rounded-lg py-3 pr-10 pl-4 text-xs font-bold outline-none focus:ring-2 ring-slate-100 transition-all"
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-1 p-1 bg-slate-100 rounded-lg">
            <FilterTab label={`الكل`} active={activeFilter === 'all'} onClick={() => setActiveFilter('all')} count={wallets.length} />
            <FilterTab label="نشط" active={activeFilter === 'active'} onClick={() => setActiveFilter('active')} color="emerald"                                   />
            <FilterTab label="وصل للحد" active={activeFilter === 'endLimit'} onClick={() => setActiveFilter('endLimit')} color="rose"                             />
            <FilterTab label="تنبيه" active={activeFilter === 'warning'} onClick={() => setActiveFilter('warning')} color="amber" icon={<AlertCircle size={10}/>}  />
            <FilterTab label="متوقف" active={activeFilter === 'inactive'} onClick={() => setActiveFilter('inactive')} color="rose"                                />
            
          </div>
        </div>

        

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredWallets.map((w) => (
            <div 
              key={w._id} onClick={() => handleSelectWallet(w)}
              className={`p-4 rounded-lg cursor-pointer transition-all border-2 relative overflow-hidden ${
                selectedWallet?._id === w._id ? 'bg-slate-900 text-white border-slate-900 -xl' : 'bg-white border-transparent hover:border-slate-100'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-black text-[13px] mb-1">{w.walletName}</h3>
                  <p className="text-[10px] opacity-60">{w.phoneNumber}</p>
                </div>
                <div className="text-left font-black text-[11px]">
                  {(w.balance - (w?.fees || 0)).toLocaleString()}
                  <div className={`w-2 h-2 rounded-full mr-auto mt-1 ${w.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.aside>

      <main className="flex-1 h-screen overflow-y-auto flex flex-col relative bg-[#FBFBFC]">
        <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 p-4 sticky top-10 z-10 flex justify-between items-center lg:top-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-3 bg-slate-100 rounded-lg hover:bg-slate-200 transition-all">
            <Menu size={20} />
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">نظام إدارة المحافظ الذكي</span>
        </header>

        

        <div className="p-4 md:p-8 max-w-6xl mx-auto w-full space-y-6">
          <AnimatePresence mode="wait">
            {selectedWallet ? (
              <motion.div key={selectedWallet._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                
                <div className="bg-white rounded-lg p-6 -xl -slate-200/60 border border-white">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div className="flex items-center gap-5">
                      <div className="w-16 h-16 bg-gradient-to-tr from-cyan-50 to-blue-50 rounded-[.5rem] flex items-center justify-center text-cyan-600 -inner">
                        <CreditCard size={32} />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{selectedWallet.walletName}</h2>
                            <span className={`text-[10px] px-3 py-1 rounded-full font-black uppercase ${selectedWallet.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                {selectedWallet.status === 'active' ? 'نشط' : 'متوقف'}
                            </span>
                        </div>
                        <div className="flex gap-4">
                          <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                            <Phone size={14} className="text-slate-300" /> {selectedWallet.phoneNumber}
                          </span>
                          <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5">
                            <Landmark size={14} className="text-slate-300" /> {selectedWallet.walletProvider}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 bg-slate-50 p-2 rounded-lg w-full md:w-auto justify-center">
                      <CompactAction icon={<Power size={18}/>} color={selectedWallet.status === 'active' ? 'amber' : 'emerald'} label={selectedWallet.status === 'active' ? 'تعطيل' : 'تنشيط'} onClick={() => toggleStatus(selectedWallet)} />
                      <div className="w-px h-8 bg-slate-200 self-center mx-1"></div>
                      <CompactAction icon={<Edit3 size={18}/>} color="blue" label="تعديل" onClick={() => handleUpdate(selectedWallet)} />
                      <CompactAction icon={<Trash2 size={18}/>} color="red" label="حذف" onClick={() => deleteWallet(selectedWallet._id)} />
                              <Link to={`/WalletInvoice/print/${selectedWallet._id}`} className="flex items-center m-auto h-full">
                                <Printer size={22}/> 
                              </Link>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <MiniStat label="الرصيد الأساسي" value={selectedWallet.balance} color="cyan" icon={<Wallet size={14}/>} />
                    <MiniStat label="قيمه رسوم التحويل " value={selectedWallet?.fees || 0} color="red" icon={<Wallet size={14}/>} />
                    <MiniStat label=" صافي المبلغ النهائي" value={selectedWallet.balance -  (selectedWallet?.fees||0) } color="green" icon={<Wallet size={14}/>} />
                    <MiniStat label="مستلم الشهر" value={selectedWallet.monthlyIncoming} color="emerald" icon={<ArrowDownLeft size={14}/>} />
                    <MiniStat label="مرسل الشهر" value={selectedWallet.monthlyOutgoing} color="rose" icon={<ArrowUpRight size={14}/>} />
                    <MiniStat label="إجمالي المستلم" value={selectedWallet.totalIncoming} color="indigo" icon={<TrendingUp size={14}/>} />
                    <MiniStat label="إجمالي المرسل" value={selectedWallet.totalOutgoing} color="orange" icon={<ArrowRightLeft size={14}/>} />
                    <MiniStat label="المتبقي للحد" value={selectedWallet.Limit - selectedWallet.balance} color="slate" icon={<Activity size={14}/>} />
                  </div>
                </div>


               {/* incomming */}
                <div className="bg-slate-900 rounded-lg p-8 text-white relative overflow-hidden -2xl -slate-900/20">
                  <div className="relative z-10">

                    

                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1" >  استهلاك المحفظة من الاستلام الشهري</p>
                        <h4 className="text-3xl font-black italic">
                            {Math.round((selectedWallet.monthlyIncoming / selectedWallet.Limit) * 100)}%
                        </h4>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-500 text-[10px] font-bold mb-1">الحد الأقصى</p>
                        <p className="font-mono text-cyan-400 font-bold">{selectedWallet.Limit.toLocaleString()} ج.م</p>
                      </div>
                    </div>
                    
                    <div className="h-4 bg-white/5 rounded-full p-1 mb-4">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min((selectedWallet.monthlyIncoming/selectedWallet.Limit)*100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${selectedWallet.monthlyIncoming/selectedWallet.Limit >= 0.85 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] font-bold">
                        <div className="flex items-center gap-2 text-slate-400">
                             <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                             <span>مستعمل: {selectedWallet.monthlyIncoming.toLocaleString()} ج.م</span>
                        </div>
                        <span className={selectedWallet.monthlyIncoming/selectedWallet.Limit >= 0.85 ? 'text-red-400 animate-pulse' : 'text-slate-500'}>
                                         {selectedWallet.monthlyIncoming/selectedWallet.Limit >= 1 ? `تنبيه لقد وصلت للحد الاقصي الاستلام` : selectedWallet.monthlyIncoming/selectedWallet.Limit >= .75 ? 'تنبيه: اقتربت من تجاوز الحد الاستلام' : 'الاستهلاك ضمن النطاق الآمن'}
                        </span>
                    </div>
                  </div>
                </div>

               {/* outcomming */}
                <div className="bg-slate-900 rounded-lg p-8 text-white relative overflow-hidden -2xl -slate-900/20">
                  <div className="relative z-10">

                    

                    <div className="flex justify-between items-end mb-6">
                      <div>
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">استهلاك المحفظة من الأرسال الشهري</p>
                        <h4 className="text-3xl font-black italic">
                            {Math.round((selectedWallet.monthlyOutgoing / selectedWallet.Limit) * 100)}%
                        </h4>
                      </div>
                      <div className="text-left">
                        <p className="text-slate-500 text-[10px] font-bold mb-1">الحد الأقصى</p>
                        <p className="font-mono text-cyan-400 font-bold">{selectedWallet.Limit.toLocaleString()} ج.م</p>
                      </div>
                    </div>
                    
                    <div className="h-4 bg-white/5 rounded-full p-1 mb-4">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min((selectedWallet.monthlyOutgoing/selectedWallet.Limit)*100, 100)}%` }}
                        transition={{ duration: 1 }}
                        className={`h-full rounded-full ${selectedWallet.monthlyOutgoing/selectedWallet.Limit >= 0.85 ? 'bg-gradient-to-r from-orange-500 to-red-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`}
                      />
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] font-bold">
                        <div className="flex items-center gap-2 text-slate-400">
                             <div className="w-2 h-2 rounded-full bg-cyan-500"></div>
                             <span>مستعمل: {selectedWallet.monthlyOutgoing.toLocaleString()} ج.م</span>
                        </div>
                        <span className={selectedWallet.monthlyOutgoing/selectedWallet.Limit >= 0.85 ? 'text-red-400 animate-pulse' : 'text-slate-500'}>
                            {selectedWallet.monthlyOutgoing/selectedWallet.Limit >= 1 ? `تنبيه لقد وصلت للحد الاقصي الارسال` : selectedWallet.monthlyOutgoing/selectedWallet.Limit >= .75 ? 'تنبيه: اقتربت من تجاوز الحد للأرسال' : 'الاستهلاك ضمن النطاق الآمن'}
                        </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border-2 border-slate-100 rounded-lg overflow-hidden -sm">
                  <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                    <h3 className="font-black text-xl flex items-center gap-3">
                      <History size={24} className="text-slate-400" /> سجل الحركات المالية
                    </h3>
                  </div>

                  <div className="divide-y divide-slate-50">
                    {loadingTx ? (
                      <div className="p-20 text-center font-black text-slate-300 animate-pulse uppercase tracking-widest">تحميل العمليات...</div>
                    ) : transactions.length > 0 ? (
                      transactions.map((tx) => {
                        const isSender = tx.senderPhone === selectedWallet.phoneNumber;
                          const fees = isSender
                          ? calculateTransferFees(
                              tx.amount,
                              tx.senderPhone?.slice(0, 3),
                              tx.receiverPhone?.slice(0, 3)
                            )
                          : 0;
                        return (
                          <div key={tx._id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-6">
                              <div className={`w-14 h-14 rounded-lg flex items-center justify-center border-2 ${isSender ? 'border-rose-100 text-rose-600 bg-rose-50' : 'border-emerald-100 text-emerald-600 bg-emerald-50'}`}>
                                {isSender ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                              </div>
                              <div>
                                <p className="font-black text-[17px] mb-1">
                                  {isSender ? `تحويل إلى: ${tx.receiverName || 'غير معروف'}` : `استلام من: ${tx.senderName || 'غير معروف'}`}
                                </p>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Phone size={12}/> {isSender ? tx.receiverPhone : tx.senderPhone}
                                  </span>
                                  <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                                    <Calendar size={12}/> {new Date(tx.createdAt ||tx.updatedAt).toLocaleString('ar-EG')}
                                  </span>
                                </div>
                              </div>
                            </div>
                              <div className="text-left">
                                <div className={`text-2xl font-black ${isSender ? 'text-rose-600' : 'text-emerald-600'}`}>
                                  {isSender ? '-' : '+'}
                                  {tx.amount.toLocaleString()}
                                  <span className="text-xs mr-1 opacity-60">ج.م</span>
                                </div>

                                {isSender && (
                                  <div className="text-xs font-bold text-amber-600 mt-1">
                                    رسوم التحويل: {fees.toLocaleString()} ج.م
                                  </div>
                                )}
                              </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-20 text-center flex flex-col items-center gap-4 text-slate-300">
                        <AlertCircle size={48} className="opacity-20" />
                        <p className="font-black uppercase tracking-widest">لا توجد حركات مالية مسجلة</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="h-[60vh] flex flex-col items-center justify-center text-slate-300 gap-4">
                <CreditCard size={80} className="opacity-10 animate-pulse" />
                <p className="font-black uppercase tracking-[0.3em] text-xs">اختر محفظة لعرض التفاصيل</p>
              </div>
            )}
          </AnimatePresence>

                  {/* قسم ملخص الأداء الشهري - أضف هذا الجزء */}
<div className="my-8 space-y-4 h-96 overflow-auto ">
  <div className="flex items-center gap-3 px-2">
    <BarChart3 size={20} className="text-slate-400" />
    <h3 className="font-black text-lg">التحليل الزمني للعمليات</h3>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {monthlyStats.length > 0 ? (
      monthlyStats.map(([month, data]) => (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          key={month} 
          className="bg-white border-2 border-slate-100 rounded-[.5rem] p-5 hover:border-slate-200 transition-all group"
        >
          <div className="flex justify-between items-center mb-4">
            <span className="text-xs font-black text-slate-400 bg-slate-50 px-3 py-1 rounded-full group-hover:bg-slate-900 group-hover:text-white transition-colors">
              {month}
            </span>
            <span className="text-[10px] font-bold text-slate-400">
              {data.count} عملية
            </span>
          </div>

          <div className="flex justify-between items-center gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">إجمالي المستلم</p>
              <p className="text-lg font-black text-emerald-600 tabular-nums">
                +{data.incoming.toLocaleString()} <small className="text-[10px]">ج.م</small>
              </p>
            </div>
            
            <div className="w-px h-10 bg-slate-100 self-end"></div>

            <div className="flex-1 space-y-1 text-left">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">إجمالي المرسل</p>
              <p className="text-lg font-black text-rose-600 tabular-nums">
                -{data.outgoing.toLocaleString()} <small className="text-[10px]">ج.م</small>
              </p>
            </div>
          </div>

          {/* بار بسيط يوضح النسبة بين المرسل والمستلم */}
          <div className="mt-4 h-1.5 bg-slate-50 rounded-full overflow-hidden flex flex-row-reverse">
             <div 
               className="h-full bg-emerald-400 opacity-60" 
               style={{ width: `${(data.incoming / (data.incoming + data.outgoing)) * 100}%` }}
             />
             <div 
               className="h-full bg-rose-400 opacity-60" 
               style={{ width: `${(data.outgoing / (data.incoming + data.outgoing)) * 100}%` }}
             />
          </div>
        </motion.div>
      ))
    ) : (
      <div className="col-span-2 py-10 text-center text-slate-300 border-2 border-dashed border-slate-100 rounded-[.5rem]">
        <p className="text-xs font-bold uppercase tracking-[0.2em]">لا توجد بيانات كافية للتحليل الشهري</p>
      </div>
    )}
  </div>
</div>
        </div>


      </main>
    </div>
  );
};

const FilterTab = ({ label, active, onClick, color = 'slate', icon, count }) => {
  const themes = {
    slate: active ? 'bg-white text-slate-900 -sm' : 'text-slate-500 hover:text-slate-700',
    emerald: active ? 'bg-emerald-500 text-white -sm' : 'text-slate-500 hover:text-emerald-600',
    rose: active ? 'bg-rose-500 text-white -sm' : 'text-slate-500 hover:text-rose-600',
    amber: active ? 'bg-amber-500 text-white -sm' : 'text-slate-500 hover:text-amber-600',
  };
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 rounded-lg text-[10px] font-black transition-all ${themes[color]}`}>
      {icon} {label} {count !== undefined && <span className="opacity-50 text-[8px]">({count})</span>}
    </button>
  );
};

const MiniStat = ({ label, value, icon, color }) => {
  const colors = {
    cyan: 'text-cyan-600 bg-cyan-50 border-cyan-100',
    red:"text-red-600 bg-red-50 border-red-100",
    green:"text-white  bg-green-700 border-green-100",
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    rose: 'text-rose-600 bg-rose-50 border-rose-100',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    slate: 'text-slate-600 bg-slate-50 border-slate-100'
  };
  return (
    <div className={`p-4 rounded-lg border ${colors[color]} transition-all hover:scale-[1.02]`}>
      <div className="flex items-center gap-2 mb-2 opacity-80">
        {icon} <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-lg font-black tracking-tight">{value?.toLocaleString()} <small className="text-[10px] opacity-60">ج.م</small></div>
    </div>
  );
};

const CompactAction = ({ icon, label, color, onClick }) => {
  const colors = {
    amber: 'text-amber-600 hover:bg-amber-100',
    emerald: 'text-emerald-600 hover:bg-emerald-100',
    blue: 'text-blue-600 hover:bg-blue-100',
    red: 'text-red-600 hover:bg-red-100'
  };
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${colors[color]}`}>
      {icon} <span className="text-[9px] font-black uppercase">{label}</span>
    </button>
  );
};

export default WalletDashboard;