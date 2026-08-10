import React, { useState, useEffect } from 'react';
import { 
  Wallet, ArrowUpCircle, ArrowDownCircle, AlertTriangle, 
  Activity, Repeat, Landmark, TrendingUp, Clock, CheckCircle2,
  ShieldCheck, ArrowRightLeft, PieChart as PieIcon,
  TrendingDown
} from 'lucide-react';
import api from '../../services/api';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
         const response = await api.get('/wallet/');
           
        const res = await api.get('/dashboard');
      
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <div className="flex h-96 items-center justify-center font-black text-slate-300 animate-pulse text-xl">
      جاري تحليل البيانات المالية...
    </div>
  );

  // بيانات الرسم البياني للمستلم والمرسل
  const barData = [
    { name: 'إجمالي المستلم', value: stats?.transactions.totalIncoming, color: '#10b981' },
    { name: 'إجمالي المرسل', value: stats?.transactions.totalOutgoing, color: '#f59e0b' },
  ];

  return (
    <div className=" mx-auto p-6 space-y-8 text-right font-['cairo']" dir="rtl">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">لوحة التحكم</h1>
          <p className="text-slate-500 font-bold mt-1 text-sm">ملخص شامل لأداء المحافظ وحركة الأموال</p>
        </div>
        <div className="flex gap-3">
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl border border-emerald-100 flex items-center gap-2 font-black text-xs">
                <ShieldCheck size={16}/> النظام آمن
            </div>
            <div className="bg-white p-3 rounded-xl -sm border border-slate-100 flex items-center gap-3">
                <Clock size={18} className="text-blue-500"/>
                <span className="text-xs font-black text-slate-700">{new Date().toLocaleTimeString('ar-EG')}</span>
            </div>
        </div>
      </div>

      {/* الرصيد الإجمالي ككارت كبير */}
      <div className="bg-slate-900 rounded-xl p-10 text-white relative overflow-hidden -2xl -slate-200">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-2 text-center md:text-right">
                <p className="text-slate-400 font-black text-sm uppercase tracking-widest">إجمالي أرصدة النظام</p>
                <h2 className="text-6xl font-black tracking-tighter tabular-nums">
                    {stats?.wallets.totalBalance.toLocaleString()} <span className="text-2xl text-slate-500">ج.م</span>
                </h2>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                <QuickStat label="المحافظ النشطة" value={stats?.wallets.activeWallets} icon={<CheckCircle2 size={16}/>} />
                <QuickStat label="تحويلات داخلية" value={stats?.transactions.internalTransactions} icon={<ArrowRightLeft size={16}/>} />
            </div>
        </div>
        {/* خلفية جمالية */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Grid للإحصائيات التفصيلية */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="المستلم الشهري" 
            value={stats?.transactions.monthlyIncoming} 
            icon={<ArrowDownCircle size={24}/>} 
            color="emerald" 
            trend="تحصيل هذا الشهر"
        />
        <StatCard 
            title="المرسل الشهري" 
            value={stats?.transactions.monthlyOutgoing} 
            icon={< ArrowUpCircle size={24}/>} 
            color="orange" 
            trend="دفع هذا الشهر"
        />
        <StatCard 
            title="إجمالي المستلم" 
            value={stats?.transactions.totalIncoming} 
            icon={<TrendingDown size={24}/>} 
            color="blue" 
            trend="منذ البداية"
        />
             <StatCard 
            title="إجمالي المرسل" 
            value={stats?.transactions.totalOutgoing} 
            icon={<TrendingUp size={24}/>} 
            color="blue" 
            trend="منذ البداية"
        />
        <StatCard 
            title="المحافظ المعطلة" 
            value={stats?.wallets.inactiveWallets} 
            icon={<AlertTriangle size={24}/>} 
            color="red" 
            trend="تحتاج مراجعة"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* مقارنة عامة */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl border border-slate-100 -sm">
          <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
            <Activity className="text-blue-500" size={20}/> تحليل حركة الأموال الكلية
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fontWeight: 'bold', fill: '#94a3b8'}} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{ borderRadius: '20px', border: 'none', box: '0 10px 15px -3px rgb(0 0 0 / 0.1)', textAlign: 'right'}}
                />
                <Bar dataKey="value" radius={[15, 15, 0, 0]} barSize={80}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* كروت الحالة الجانبية */}
        <div className="space-y-6">
          {/* كارت الـ Near Limit */}
          <div className={`p-8 rounded-xl border transition-all ${stats?.wallets.nearLimitWallets > 0 ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
            <h4 className="font-black text-slate-800 mb-2">محافظ قريبة من الحد</h4>
            <p className="text-xs font-bold text-slate-400 mb-6">المحافظ التي تجاوزت 90% من الـ Limit</p>
            <div className="flex items-end gap-3">
                <span className={`text-6xl font-black tracking-tighter ${stats?.wallets.nearLimitWallets > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                    {stats?.wallets.nearLimitWallets}
                </span>
                <span className="text-sm font-black mb-3 text-slate-400">محفظة حالياً</span>
            </div>
          </div>

          {/* كارت ملخص المحافظ */}
          <div className="bg-white p-8 rounded-xl border border-slate-100 -sm space-y-6">
            <h4 className="font-black text-slate-800 flex items-center gap-2">
                <PieIcon size={18} className="text-indigo-500"/> حالة النظام
            </h4>
            <StatusRow label="إجمالي المحافظ" value={stats?.wallets.totalWallets} color="indigo" />
            <StatusRow label="النشطة حالياً" value={stats?.wallets.activeWallets} color="emerald" />
            <StatusRow label="المعطلة" value={stats?.wallets.inactiveWallets} color="red" />
          </div>
        </div>

      </div>
    </div>
  );
};

// مكونات صغيرة (Helper Components)
const StatCard = ({ title, value, icon, color, trend }) => {
  const themes = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    red: "bg-red-50 text-red-600 border-red-100",
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-100 -sm hover:-md transition-all group">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${themes[color]}`}>
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase mb-1 tracking-widest">{title}</p>
      <h3 className="text-2xl font-black text-slate-900 tabular-nums">
        {value.toLocaleString()}
      </h3>
      <p className="text-[10px] font-bold text-slate-400 mt-2 flex items-center gap-1">
          <Activity size={10}/> {trend}
      </p>
    </div>
  );
};

const QuickStat = ({ label, value, icon }) => (
    <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 min-w-[120px]">
        <div className="flex items-center gap-2 text-slate-400 mb-1">
            {icon} <span className="text-[10px] font-black uppercase tracking-tighter">{label}</span>
        </div>
        <div className="text-xl font-black">{value}</div>
    </div>
);

const StatusRow = ({ label, value, color }) => (
    <div className="flex justify-between items-center">
        <span className="text-xs font-bold text-slate-500">{label}</span>
        <span className={`px-3 py-1 rounded-xl text-xs font-black bg-${color}-50 text-${color}-600`}>
            {value}
        </span>
    </div>
);

export default Dashboard;