import { useState } from "react";
import { 
  LayoutDashboard, Package, Users, BarChart3, 
  HardHat, Wallet, CalendarCheck, Settings, 
  ChevronDown, Menu, X, 
  LogOut
} from "lucide-react";
import { Link } from "react-router-dom";
import { showAlert } from "../services/alert";
import api from "../services/api";

const Sidebar = ({ role }) => {
  const [open, setOpen] = useState(null);
  const [isOpenMobile, setIsOpenMobile] = useState(false); // حالة القائمة في الموبايل

  const toggle = (menu) => {
    setOpen(open === menu ? null : menu);
  };

  const getDashboardPath = () => {
    switch(role) {
      case 'superadmin': return '/';
      case 'admin': return '/admin-dashboard';
      case 'manager': return '/manager_dashboard';
      default: return '/';
    }
  };

  const getPath = (id) => {
    const paths = {
      dashboard: getDashboardPath(),
      addDelivery: "/deliveries/add",
      allDeliveries: "/deliveries",
      ManageItems:"deliveries/ManageItems",
      allSuppliers: "/suppliers",
      addSupplier: "/suppliers/add",
      payments: "/suppliers/payments",
      deliveryReports: "/reports/deliveries",
      supplierReports: "/reports/suppliers",
      returns: "/reports/returns",
      allWorkers: "/workers",
      addWorker: "/workers/add",
      attendance: "/workers/attendance",
      salaries: "/workers/salaries",
      addExpense: "/expenses",
      ExpensesReports: "/ExpensesReports",
      manageUsers: "/admin/users",
      addManager: "/admin/add",
      systemSettings: "/admin/settings",
      profile:"/profile",
      EditWorkerBalance:"/workers/EditWorkerBalance",
      paymentToCustomer:"/paymentToCustomer",
      paymentToSupplier:"/paymentToSupplier"

    };
    return paths[id] || `/${id}`;
  };

 const menus = [
  {
    id: "dashboard",
    label: "لوحة التحكم",
    icon: <LayoutDashboard size={20} />,
    roles: ["admin", "manager", "superadmin"],
    path: getDashboardPath()
  },

  // WALLET
  {
    id: "wallets",
    label: "المحافظ",
    icon: <Wallet size={20} />,
    roles: ["admin", "manager", "superadmin"],
    sub: [
      {
        id: "walletCreate",
        label: "إنشاء محفظة",
        roles: ["admin", "manager", "superadmin"]
      },
      {
        id: "walletsList",
        label: "عرض المحافظ",
        roles: ["admin", "manager", "superadmin"]
      }
    ]
  },

  // TRANSACTIONS
  {
    id: "transactions",
    label: "العمليات",
    icon: <Package size={20} />,
    roles: ["admin", "manager", "superadmin"],
    sub: [
      {
        id: "transactionCreate",
        label: "إنشاء عملية",
        roles: ["admin", "manager", "superadmin"]
      },
      {
        id: "transactionsList",
        label: "عرض العمليات",
        roles: ["admin", "manager", "superadmin"]
      }
       ,
      {
        id: "TransactionsPerSupplier",
        label: " طباعه العمليات التاجر",
        roles: ["admin", "manager", "superadmin"]
      }

            ,
      {
        id: "TransactionReport",
        label: " طباعه العمليات ",
        roles: ["admin", "manager", "superadmin"]
      }

                  ,
      {
        id: "TransactionAnalysis",
        label: "  تحليل العمليات ",
        roles: ["admin", "manager", "superadmin"]
      }
    ]
  },

  

  

  // REPORTS
  {
    id: "elmokaraz",
    label: "تحصيلات ومدفوعات سيستم المخرز",
    icon: <BarChart3 size={20} />,
    roles: ["admin", "manager", "superadmin"],
    sub: [
      {
        id: "paymentToCustomer",
        label: "العملاء",
        roles: ["admin", "manager", "superadmin"]
      },
            {
        id: "paymentToSupplier",
        label: "التجار",
        roles: ["admin", "manager", "superadmin"]
      }
    ]
  },

  // USERS (SUPER ADMIN ONLY)
  {
    id: "users",
    label: "المستخدمين",
    icon: <Users size={20} />,
    roles: ["superadmin"],
    sub: [
      {
        id: "usersList",
        label: "إدارة المستخدمين",
        roles: ["superadmin"]
      },
            {
        id: "AddUsers",
        label: "اضافه المستخدمين",
        roles: ["superadmin"]
      }
    ]
  },

  // PROFILE
  {
    id: "profile",
    label: "الصفحة الشخصية",
    icon: <Settings size={20} />,
    roles: ["admin", "manager", "superadmin"],
    sub: [
      {
        id: "profileView",
        label: "عرض الصفحة الشخصية",
        roles: ["admin", "manager", "superadmin"]
      }
    ]
  }
];

  const handleLogout = async () => {
    try {

      await api.post('/users/logout'); 


      localStorage.removeItem('token'); 
   


      if (typeof showAlert === 'function') {
        showAlert({icon:"success",title:"تم تسجيل الخروج بنجاح"});
      }

      setTimeout(() => {
        window.location.href = '/login'; 
      }, 1000);

    } catch (err) {
      console.error("Logout Error:", err);
      

      localStorage.clear();
      window.location.href = '/login';
    }
  };
  const hasAccess = (roles) => roles.includes(role);

  return (
    <div className="no-print ">
      {/* زر الموبايل - يظهر فقط في الشاشات الصغيرة */}
      <button 
        onClick={() => setIsOpenMobile(!isOpenMobile)}
        className="lg:hidden fixed top-4 right-4 z-50 p-2 bg-[#0f172a] text-white rounded-md border border-slate-700 shadow-lg"
      >
        {isOpenMobile ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay للموبايل - يغلق القائمة عند النقر في الخلفية */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      {/* الـ Sidebar الرئيسي */}
      <div className={`
       
        fixed lg:static inset-y-0 right-0 z-40 min-h-screen
        w-72  bg-[#0f172a] text-slate-300 p-4 flex flex-col border-l border-slate-800
        transition-transform duration-300 ease-in-out transform
        ${isOpenMobile ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
      `} dir="rtl">
        
        <div className="flex items-center gap-3 px-2 mb-8 mt-2">   
          <div className="w-8 h-8 text-white  rounded-lg flex items-center justify-center bg-cyan-500/20 font-bold shrink-0">Y</div>
          <h2 className="text-xl font-bold text-white tracking-wide truncate"> نظام محافظ أولاد موسى فلتس </h2>
        </div>
        
        <nav className="flex-1  overflow-y-auto custom-scrollbar  pr-1">
          {menus.map(menu => hasAccess(menu.roles) && (
            <div key={menu.id} className="mb-1">
              <Link to={menu.path || '#'} onClick={() => !menu.sub && setIsOpenMobile(false)}>
                <div 
                  onClick={(e) => {
                    if (menu.sub) {
                      e.preventDefault();
                      toggle(menu.id);
                    }
                  }} 
                  className={`
                    group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                    ${open === menu.id ? 'bg-slate-800 text-white' : 'hover:bg-slate-800/50 hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span className={`${open === menu.id ? 'text-blue-400' : 'text-slate-400 group-hover:text-blue-400'}`}>
                      {menu.icon}
                    </span>
                    <span className="font-medium text-[15px]">{menu.label}</span>
                  </div>
                  
                  {menu.sub && (
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-300 ${open === menu.id ? "rotate-180" : ""}`} 
                    />
                  )}
                </div>
              </Link>

              <div className={`
                overflow-hidden transition-all duration-300 ease-in-out
                ${open === menu.id ? "max-h-60 opacity-100 mt-1" : "max-h-0 opacity-0"}
              `}>
                <div className="mr-9 border-r border-slate-700 space-y-1">
                  {menu.sub?.filter(sub => hasAccess(sub.roles)).map(sub => (
                    <Link 
                      key={sub.id} 
                      to={getPath(sub.id)}
                      onClick={() => setIsOpenMobile(false)} // إغلاق القائمة عند اختيار عنصر في الموبايل
                      className="block"
                    >
                      <div className="cursor-pointer py-2 px-4 text-sm text-slate-400 hover:text-blue-400 hover:bg-slate-800/30 rounded-l-lg transition-colors">
                        {sub.label}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-4 border-t border-slate-800 shrink-0">
              <button 
                  onClick={handleLogout}
                  className="flex mb-3  items-center gap-2 text-rose-600 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all font-black"
                >
                  <LogOut size={18} />
                  <span>تسجيل الخروج</span>
                </button>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs text-white">
              {role ? role[0].toUpperCase() : 'U'}
            </div>
            <div className="flex flex-col">
          
              <span className="text-xs text-slate-400 capitalize">{role}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;