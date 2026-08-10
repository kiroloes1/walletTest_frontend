import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import ScrollToTop from "./services/scrollToTop"
import ProtectedRoute from "./services/protectRoutes";
import ProtectedAccess from "./services/protectAccess";
import Login from "./pages/auth/login";
import Footer from "./pages/footer";
import NotFound from "./pages/404Page";
import ForgetPassword from "./pages/auth/forgetPassword";
import ResetPassword from "./pages/auth/resetPassword";
import Dashboard from "./pages/dashboards/dashboard";
import SuperAdminLayout from "./layouts/adminLayout";
import ManagerLayout from "./layouts/managerLayout";
import { FaAngleUp, FaPrint } from "react-icons/fa";
import CreateWalletCard from "./pages/wallet/createWallet";
import WalletDashboard from "./pages/wallet/wallets";
import AddAdmin from "./pages/admins/addAdmin";
import ManageAdmins from "./pages/admins/Adminsmanagment";
import Profile from "./pages/admins/profile";
import CreateTransaction from "./pages/transactions/createTransaction";
import TransactionHistory from "./pages/transactions/transactions";
import WalletInvoice from "./pages/wallet/printWallet";
import PrintAll from "./pages/reports/printAll";
import MonthlyTransactions from "./pages/transactions/monthlyPrint";
import TransactionReport from "./pages/transactions/printTransactionByDate";
import MerchantReportManager from "./pages/reports/transactionsPerUser";
import MerchantAnalyticsManager from "./pages/reports/analysis";
import CustomerBalanceAutocomplete from "./pages/transactions/paymentToCustomer";
import SupplierBalanceAutocomplete from "./pages/transactions/paymentToSupplier";
function App() {
   const upToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const navigate = useNavigate();

  const handlePrintAll = () => {
    navigate('/printAll'); 
  };

return (
  <div className="font-[Cairo]">


   
      <ScrollToTop />

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forget-Password" element={<ForgetPassword />} />
        <Route path="/reset-Password" element={<ResetPassword />} />

        {/* Super Admin */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <ProtectedAccess role="superadmin">
                <SuperAdminLayout />
              </ProtectedAccess>
            </ProtectedRoute>
          }
        >

          {/* dashboard */}
          <Route index element={<Dashboard />} />


          {/* wallet */}
            <Route path="walletCreate" element={<CreateWalletCard/>}/>
            <Route path="walletsList" element={<WalletDashboard/>}/>
            <Route path="WalletInvoice/print/:id" element={<WalletInvoice/>}/>



               {/* transactions */}
             <Route path="transactionCreate" element={<CreateTransaction/>}/>
             <Route path="transactionsList" element={<TransactionHistory/>}/>
             <Route path="TransactionsPerSupplier" element={<MerchantReportManager/>}/>
             <Route path="TransactionReport" element={<TransactionReport/>}/>
             <Route path="TransactionAnalysis" element={<MerchantAnalyticsManager/>}/>

            {/* link with two system */}
             <Route path="paymentToCustomer" element={<CustomerBalanceAutocomplete/>}/>
             <Route path="paymentToSupplier" element={<SupplierBalanceAutocomplete/>}/>






            
          {/* admins */}
          <Route path="addUsers" element={<AddAdmin/>} />
          <Route path="usersList" element={<ManageAdmins/>} />


          {/* prifile */}

          <Route path="profileView" element={<Profile/>} />

          {/* report */}
          <Route path="printAll" element={<PrintAll/>} />




            
          

          
        </Route>

        {/* Manager */}
        <Route
          path="/manager_dashboard"
          element={
            <ProtectedRoute>
              <ProtectedAccess role="manager">
                <ManagerLayout />
              </ProtectedAccess>
            </ProtectedRoute>
          }
        >

          {/* dashboard */}
          <Route index element={<Dashboard />} />


          {/* wallet */}
            <Route path="walletCreate" element={<CreateWalletCard/>}/>
            <Route path="walletsList" element={<WalletDashboard/>}/>

                  


              {/* prifile */}

          <Route path="profileView" element={<Profile/>} />



        </Route>

        {/* Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* UI Elements - Scroll To Top */}
      <div
        onClick={upToTop}
        className="no-print fixed bottom-8 left-8 z-50 
                  bg-cyan-500/20 text-[#0F172A] 
                  p-4 rounded-[20px] 
                  shadow-2xl shadow-orange-500/40 
                  hover:bg-cyan-600 hover:-translate-y-2 
                  active:scale-90 
                  transition-all duration-300 cursor-pointer 
                  group flex items-center justify-center"
        title="العودة للأعلى"
      >
        {/* تأثير الموجة خلف الأيقونة */}
        <span className="absolute inset-0 rounded-[20px] bg-cyan-500 animate-ping opacity-20 group-hover:hidden"></span>
        
        <FaAngleUp className="text-2xl font-black relative z-10" />
      </div>

      <div
      onClick={handlePrintAll}
      className="print:hidden fixed bottom-8 right-8 z-50 
                 bg-slate-900 text-white 
                 p-5 rounded-2xl 
                 shadow-[0_20px_50px_rgba(0,0,0,0.2)] 
                 hover:bg-blue-600 hover:-translate-y-2 
                 active:scale-90 
                 transition-all duration-300 cursor-pointer 
                 group flex items-center justify-center border border-white/10"
      title="طباعة الكل"
    >
      {/* تأثير النبض الاحترافي خلف الأيقونة */}
      <span className="absolute inset-0 rounded-2xl bg-blue-500 animate-ping opacity-20 group-hover:hidden"></span>
      
      {/* الأيقونة مع نص يظهر عند الـ Hover (اختياري) */}
      <div className="flex items-center gap-2 relative z-10">
        <FaPrint className="text-xl" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm whitespace-nowrap">
           طباعة كافة السجلات
        </span>
      </div>
    </div>
      <Footer />

  </div>
);
}

export default App
