import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, ShieldAlert, CheckCircle, Search, Share2, Send, X, Wallet, Trash2, Users } from 'lucide-react';
import api from './api';

export default function WalletChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  // States للمحادثة والبيانات
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'أهلاً بك في مساعد المحافظ الذكي! كيف يمكنني مساعدتك اليوم؟' }
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [warningPercentage, setWarningPercentage] = useState(75);
  const [walletsData, setWalletsData] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // سياق الفلترة الحالي لتحديد صيغة رسالة الواتساب المخصصة (search / warning / full)
  const [currentContext, setCurrentContext] = useState('');

  // States لمودال المشاركة المطور واستهداف أرقام هواتف مخصصة
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [customMessage, setCustomMessage] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [savedNumbers, setSavedNumbers] = useState([]);

  // إحداثيات السحب والتحريك لنافذة الشات الكبيرة المفتوحة
  const [chatPosition, setChatPosition] = useState({ x: 24, y: 24 });
  const isDraggingChat = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });

  // تحميل الأرقام المحفوظة من الـ LocalStorage عند بدء التشغيل
  useEffect(() => {
    const numbers = localStorage.getItem('chatbot_saved_phones');
    if (numbers) {
      setSavedNumbers(JSON.parse(numbers));
    }
  }, []);

  // أحداث السحب عند الضغط على الهيدر الخاص بالشات
  const handleHeaderMouseDown = (e) => {
    if (e.target.closest('.close-btn')) return;

    isDraggingChat.current = true;
    dragStart.current = {
      x: e.clientX + chatPosition.x,
      y: window.innerHeight - e.clientY - chatPosition.y
    };
    document.addEventListener('mousemove', handleHeaderMouseMove);
    document.addEventListener('mouseup', handleHeaderMouseUp);
  };

  const handleHeaderMouseMove = (e) => {
    if (!isDraggingChat.current) return;
    
    let newX = dragStart.current.x - e.clientX;
    let newY = window.innerHeight - e.clientY - dragStart.current.y;

    const maxAllowedWidth = window.innerWidth - 150;
    const maxAllowedHeight = window.innerHeight - 100;
    
    newX = Math.max(10, Math.min(maxAllowedWidth, newX));
    newY = Math.max(10, Math.min(maxAllowedHeight, newY));

    setChatPosition({ x: newX, y: newY });
  };

  const handleHeaderMouseUp = () => {
    isDraggingChat.current = false;
    document.removeEventListener('mousemove', handleHeaderMouseMove);
    document.removeEventListener('mouseup', handleHeaderMouseUp);
  };

  // 1. جلب المحافظ القريبة من الحد
  const fetchWarningWallets = async () => {
    if (warningPercentage < 0 || warningPercentage > 100) {
      alert("الرجاء إدخال نسبة صحيحة بين 0 و 100");
      return;
    }
    setLoading(true);
    try {
      const targetPercentage = warningPercentage; 
      
      const res = await api.get('/wallet/getWarningWallets', {
        params: { percentage: targetPercentage }
      });
      const data = res.data || res; 
      
      setWalletsData(data);

      setCurrentContext('warning');
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'user', text: `عرض المحافظ القريبة من الحد بنسبة استهلاك ${targetPercentage}%` },
        { id: Date.now() + 2, sender: 'bot', text: `تم العثور على ${data.length} محفظة قريبة من الحد.` }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'حدث خطأ أثناء جلب البيانات.' }]);
    } finally {
      setLoading(false);
    }
  };

  // 2. جلب المحافظ التي وصلت للحد تماماً 100%
  const fetchFullLimitWallets = async () => {
    setLoading(true);
    try {
      const res = await api.get('/wallet/getFullLimitWallets');
      const data = res.data || res;
      
      setWalletsData(data);
      setCurrentContext('full'); 
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'user', text: 'عرض المحافظ التي وصلت للحد الأقصى 100%' },
        { id: Date.now() + 2, sender: 'bot', text: `تم العثور على ${data.length} محفظة ممتلئة تماماً.` }
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. البحث بالاسم أو الرقم عبر الـ API
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const res = await api.get('/wallet/searchWallet', {
        params: { search: searchQuery }
      });
      const data = res.data || res;

      setWalletsData(data);
      setCurrentContext('search'); 
      setMessages(prev => [
        ...prev,
        { id: Date.now() + 1, sender: 'user', text: `بحث عن: ${searchQuery}` },
        { id: Date.now() + 2, sender: 'bot', text: `نتائج البحث: تم العثور على ${data.length} محفظة.` }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { id: Date.now(), sender: 'bot', text: 'فشل البحث، يرجى المحاولة لاحقاً.' }]);
    } finally {
      setLoading(false);
    }
  };

  // فتح مودال المشاركة وتوليد الرسالة بناءً على السياق
  const openShareModal = (wallet) => {
    setSelectedWallet(wallet);
    setTargetPhone(wallet.phoneNumber); 
    
    let defaultMsg = "";
    const incomingPercentage = (wallet.monthlyIncoming / wallet.Limit) * 100;
    const outgoingPercentage = (wallet.monthlyOutgoing / wallet.Limit) * 100;

    const now = new Date();
    const currentDate = now.toLocaleDateString('fr-CA'); 
    const currentTime = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', hour12: true });
    const formattedDate = `${currentDate.split('-').reverse().join('-')} | ${currentTime}`;

    if (currentContext === 'search') {
      const maxPercentage = Math.max(incomingPercentage, outgoingPercentage).toFixed(0);
      const remainingIncoming = wallet.Limit - wallet.monthlyIncoming;
      const isWarning = incomingPercentage >= warningPercentage || outgoingPercentage >= warningPercentage;
      const isFull = incomingPercentage >= 100 || outgoingPercentage >= 100;
      
      let statusSign = "✅";
      if (isFull) statusSign = "⛔";
      else if (isWarning) statusSign = "⚠️";

      defaultMsg = ` بيانات رقم التحويل ${statusSign}\n\n` +
                   ` الاسم: ${wallet.walletName}\n` +
                   ` الرقم: ${wallet.phoneNumber}\n` +
                   ` نسبة الاستهلاك: ${maxPercentage}%\n` +
                   ` فاضل للاستقبال: ${(remainingIncoming > 0 ? remainingIncoming : 0).toLocaleString()} جنيه\n` +
                   ` آخر تحديث: ${formattedDate}`;

    } else if (currentContext === 'warning') {
      const backendPercentage = warningPercentage;
      let warningType = "";
   
      if (incomingPercentage >= backendPercentage) {
        warningType = "الاستلام";
      }

      if (outgoingPercentage >= backendPercentage) {
        warningType = warningType ? `${warningType} والإرسال` : "الإرسال";
      }

      const currentMaxPercentage = Math.max(incomingPercentage, outgoingPercentage).toFixed(0);

      defaultMsg = ` تنبيه: المحفظة قريبة من الليمت الشهري ⚠️\n\n` +
                   ` الاسم: ${wallet.walletName}\n` +
                   ` الرقم: ${wallet.phoneNumber}\n` +
                   ` نسبة الاستهلاك الحالية: ${currentMaxPercentage}%\n` +
                   ` قريبة من التوقف في: ${warningType}\n` +
                   ` المتبقي للاستلام: ${(wallet.Limit - wallet.monthlyIncoming).toLocaleString()} جنيه\n` +
                   ` المتبقي للإرسال: ${(wallet.Limit - wallet.monthlyOutgoing).toLocaleString()} جنيه\n` +
                   ` آخر تحديث: ${formattedDate}`;

    } else if (currentContext === 'full') {
      let stopType = "";
      let availabilityMsg = "";

      if (incomingPercentage >= 100) {
        stopType = "الاستلام";
        availabilityMsg = " غير متاح للاستقبال حاليًا";
      }

      if (outgoingPercentage >= 100) {
        if (stopType) {
          stopType = `${stopType} والإرسال`;
          availabilityMsg = " غير متاح للتحويل أو الاستقبال حاليًا (مغلق بالكامل)";
        } else {
          stopType = "الإرسال";
          availabilityMsg = " غير متاح للإرسال حاليًا (الاستقبال متاح)";
        }
      }

      defaultMsg = ` تنبيه هام: الرقم قفل الليمت الشهري ⛔\n\n` +
                   ` الاسم: ${wallet.walletName}\n` +
                   ` الرقم: ${wallet.phoneNumber}\n` +
                   ` نسبة الاستهلاك: 100%\n` +
                   ` تم إيقاف: ${stopType}\n` +
                   `${availabilityMsg}\n` +
                   ` آخر تحديث: ${formattedDate}`;

    } else {
      defaultMsg = ` الاسم: ${wallet.walletName}\n` +
                   ` الرقم: ${wallet.phoneNumber}\n` +
                   ` آخر تحديث: ${formattedDate}`;
    }

    setCustomMessage(defaultMsg);
    setIsShareModalOpen(true);
  };

  // 1. الإرسال المباشر لرقم محدد (شخصي)
  const handleWhatsAppDirectShare = () => {
    if (!targetPhone.trim()) {
      alert("يرجى إدخال رقم الهاتف المراد الإرسال إليه");
      return;
    }

    if (!savedNumbers.includes(targetPhone)) {
      const updatedNumbers = [...savedNumbers, targetPhone];
      setSavedNumbers(updatedNumbers);
      localStorage.setItem('chatbot_saved_phones', JSON.stringify(updatedNumbers));
    }

    const encodedMessage = encodeURIComponent(customMessage);
    const cleanPhone = targetPhone.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${cleanPhone.startsWith('2') ? cleanPhone : '2' + cleanPhone}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setIsShareModalOpen(false);
  };

  // 2. التعديل الجديد: مشاركة حرة تتيح اختيار مجموعة أو أي محادثة يدوياً دون التقيد برقم المحفظة
  const handleWhatsAppGroupShare = () => {
    const encodedMessage = encodeURIComponent(customMessage);
    // الرابط العام للمشاركة يفتح قائمة المجموعات والدردشات مباشرة
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
    setIsShareModalOpen(false);
  };

  // مسح رقم من القائمة المحفوظة
  const deleteSavedNumber = (phoneToDelete, e) => {
    e.stopPropagation();
    const updated = savedNumbers.filter(p => p !== phoneToDelete);
    setSavedNumbers(updated);
    localStorage.setItem('chatbot_saved_phones', JSON.stringify(updated));
  };

  return (
    <div className="fixed no-print z-50 text-right " dir="rtl">
      
      {/* 1. الزر العائم الأساسي */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="no-print fixed bottom-24 right-8 flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 text-white p-5 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] hover:shadow-[0_15px_35px_rgba(16,185,129,0.2)] transition-all border border-slate-700 group overflow-hidden"
        >
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <MessageSquare className="w-6 h-6 text-emerald-400 animate-pulse" />
          <span className="absolute -top-1 -left-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
        </button>
      )}

      {/* 2. نافذة الشات بوت القابلة للتحريك */}
      {isOpen && (
        <div 
          className="flex flex-col overflow-auto lg:flex-row bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-slate-200 fixed transition-all duration-300 ease-out"
          style={{
            bottom: `${chatPosition.y}px`,
            right: `${chatPosition.x}px`,
            width: '94vw',
            maxWidth: walletsData.length > 0 ? '1050px' : '380px',
            height: '82vh',
            maxHeight: '660px'
          }}
        >
          
          {/* قسم الشات والتحكم (اليمين) */}
          <div className="w-full lg:w-[360px] border-l border-slate-100 flex flex-col h-full bg-white shrink-0 z-10 shadow-md">
            
            <div 
              onMouseDown={handleHeaderMouseDown}
              className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white cursor-move select-none active:bg-slate-800 transition-colors"
              title="اضغط هنا مع السحب لتحريك نافذة الشات بأكملها"
            >
              <div className=" flex items-center gap-3 pointer-events-none">
                <MessageSquare className="w-5 h-5 text-emerald-400" />
                <div>
                  <h2 className="font-bold text-sm">مساعد المحافظ الذكي</h2>
                  <p className="text-[10px] text-slate-400">اضغط هنا واسحب لتحريك النافذة</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="close-btn text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.sender === 'user' ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm ${
                    msg.sender === 'user' 
                      ? 'bg-slate-200 text-slate-800 rounded-bl-none' 
                      : 'bg-emerald-600 text-white rounded-br-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="text-center text-[11px] text-slate-400 animate-pulse">جاري جلب البيانات...</div>
              )}
            </div>

            {/* الفلاتر والبحث */}
            <div className="p-3 bg-white border-t border-slate-100 space-y-2">
              <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200">
                <button 
                  onClick={fetchWarningWallets}
                  className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors whitespace-nowrap"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  المحافظ القريبة من الحد
                </button>
                <div className="flex items-center gap-1 flex-1 justify-end">
                  <input 
                    type="number" 
                    value={warningPercentage === 0 ? "" : warningPercentage} 
                    onChange={(e) => setWarningPercentage(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-11 p-1 text-center border border-slate-300 rounded-md text-[11px] focus:outline-none"
                    min="0"
                    max="100"
                  />
                  <span className="text-[11px] text-slate-400">%</span>
                </div>
              </div>

              <button 
                onClick={fetchFullLimitWallets}
                className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white p-2 rounded-xl text-[11px] font-medium transition-colors shadow-sm"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                عرض المحافظ التي وصلت 100%
              </button>

              <form onSubmit={handleSearch} className="relative mt-1">
                <input 
                  type="text" 
                  placeholder="ابحث باسم المحفظة أو رقم الهاتف..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-[11px] pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500 text-right"
                />
                <button type="submit" className="absolute left-2.5 top-2 text-slate-400 hover:text-emerald-600">
                  <Search className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          </div>

          {/* قسم عرض نتائج البيانات (اليسار) */}
          <div 
            className={`flex-1 bg-white p-5 flex flex-col h-full transition-all duration-500 ease-in-out ${
              walletsData.length > 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 pointer-events-none lg:w-0 lg:p-0'
            }`}
          >
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">نتائج الفلترة الحالية</h3>
              </div>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                العدد: {walletsData.length}
              </span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-100 sticky top-0 z-10">
                      <th className="p-2.5">اسم المحفظة / المالك</th>
                      <th className="p-2.5">رقم الهاتف</th>
                      <th className="p-2.5">الشركة</th>
                      <th className="p-2.5">الاستهلاك الشهري</th>
                      <th className="p-2.5">الحد</th>
                      <th className="p-2.5 text-center">مشاركة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {walletsData.map((wallet) => {
                      return (
                        <tr key={wallet._id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-2.5">
                            <div className="font-medium text-slate-900 text-[11px]">{wallet.walletName}</div>
                            <div className="text-[10px] text-slate-400">{wallet.ownerName || 'بدون اسم'}</div>
                          </td>
                          <td className="p-2.5 font-mono text-[11px] text-slate-600">{wallet.phoneNumber}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                              wallet.walletProvider === 'Vodafone' ? 'bg-red-50 text-red-600' :
                              wallet.walletProvider === 'Orange' ? 'bg-orange-50 text-orange-600' :
                              wallet.walletProvider === 'Etisalat' ? 'bg-green-50 text-green-600' : 'bg-purple-50 text-purple-600'
                            }`}>
                              {wallet.walletProvider}
                            </span>
                          </td>
                          <td className="p-2.5 text-[10px] text-slate-500">
                            <div>استلام: {wallet.monthlyIncoming || 0} ج.م</div>
                            <div>ارسال: {wallet.monthlyOutgoing || 0} ج.م</div>
                          </td>
                          <td className="p-2.5 font-medium text-slate-700">{wallet.Limit} ج.م</td>
                          <td className="p-2.5 text-center">
                            <button 
                              onClick={() => openShareModal(wallet)}
                              className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg text-[11px] font-medium transition-colors shadow-sm"
                            >
                              <Share2 className="w-3 h-3" />
                              واتساب
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. مودال المشاركة المطور وحفظ الأرقام */}
      {isShareModalOpen && selectedWallet && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-100 text-right animate-in fade-in zoom-in-95 duration-150" dir="rtl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3 mb-4">
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Share2 className="w-4 h-4 text-emerald-600" />
                مشاركة عبر تطبيق الواتساب
              </h4>
              <button onClick={() => setIsShareModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
                <p><strong>المحفظة المستهدفة:</strong> {selectedWallet.walletName}</p>
                <p><strong>الرقم الأساسي للمحفظة:</strong> {selectedWallet.phoneNumber}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">إرسال إلى رقم هاتف (مخصص/فردي):</label>
                <input 
                  type="text" 
                  placeholder="مثال: 01012345678"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left"
                />
              </div>

              {savedNumbers.length > 0 && (
                <div>
                  <label className="block text-[11px] font-medium text-slate-500 mb-1">أو اختر من الأرقام المحفوظة سريعاً:</label>
                  <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto p-1 bg-slate-50 rounded-lg border border-slate-100">
                    {savedNumbers.map((phone, idx) => (
                      <div 
                        key={idx}
                        onClick={() => setTargetPhone(phone)}
                        className={`flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-mono cursor-pointer transition-all border ${
                          targetPhone === phone 
                            ? 'bg-emerald-600 text-white border-emerald-600' 
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <span>{phone}</span>
                        <button 
                          onClick={(e) => deleteSavedNumber(phone, e)}
                          className={`p-0.5 rounded hover:bg-black/10 ${targetPhone === phone ? 'text-white' : 'text-rose-500'}`}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">نص الرسالة:</label>
                <textarea 
                  rows={4} 
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right resize-none"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2 border-t border-slate-100 mt-4">
                <button 
                  onClick={() => setIsShareModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-medium hover:bg-slate-50 order-last sm:order-none"
                >
                  إلغاء
                </button>
                
                {/* الزر الجديد: لمشاركة البيانات في الجروبات أو الاختيار الحر بين المحادثات */}
                <button 
                  onClick={handleWhatsAppGroupShare}
                  className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-md transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  مشاركة لمجموعة 
                </button>

                <button 
                  onClick={handleWhatsAppDirectShare}
                  className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-medium shadow-md transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  إرسال للرقم المحدد
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}