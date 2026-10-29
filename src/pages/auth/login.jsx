// import { useState } from "react";
// import { Form, useNavigate } from "react-router-dom";
// import api from "../../services/api";
// import { showAlert } from "../../services/alert";
// import { jwtDecode } from "jwt-decode";
// import logo from "../../../public/wallet.png"
// function Login() {
//     const handleBackup = async () => {
//       try {
        
//         const response = await api.get("/backup", { responseType: "blob" });
  
//         const blob = new Blob([response.data], { type: "application/json" });
//         const url = window.URL.createObjectURL(blob);
  
//         const link = document.createElement("a");
//         link.href = url;
//         const date = new Date().toISOString().split("T")[0];
//         link.setAttribute("download", `backup-${date}.json`);
  
//         document.body.appendChild(link);
//         link.click();
//         link.remove();
//         window.URL.revokeObjectURL(url);
//       } catch (err) {
//         console.error("Backup failed:", err);
       
//       } 
//     };
//  const Navigate =useNavigate();
//  const RememberValue=JSON.parse(localStorage.getItem("remember"))
// const [Form, SetForm] = useState({ email:RememberValue?.email || "", password: RememberValue?.password || "" });

// const [Remember,setRemember]=useState(false)
// const [isLoading, setIsLoading] = useState(false);



// //  save the value in state 
//    const OnChange=(e)=>{
//        SetForm({...Form,[e.target.name]:e.target.value})
       
//    }

// //  login process
//  const LoginProcess = async () => {
//   try {
// setIsLoading(true);
//     const Res = await api.post("/users/login", {
//       email: Form.email,
//       password: Form.password
//     });

//     const Data = Res.data;

//     if (Data.accessToken) {
//       localStorage.setItem("token", Data.accessToken);
       
//       if (Remember) {
//         localStorage.setItem("remember", JSON.stringify(Form));
//       }

//           showAlert({
//         title: Data?.message || "حدث خطأ في الاتصال بالخادم",
//         icon: "success"
//       })
//        const decoded=jwtDecode(Data.accessToken);
//        const role=decoded.role;
//         if(role==="superadmin"){ 
    
//             Navigate("/");
//           await  handleBackup() 
//         }else if(role==="manager"){
//             Navigate("/manager_dashboard");
//         }
     
     
//     }

//   } catch (err) {
//     showAlert({
//       title: err.response?.data?.message || err?.data?.message ||  err?.message || "حدث خطأ في الاتصال بالخادم",
//       icon: "error"
//     })

 
//   }
//   finally {
//     setIsLoading(false);
//   }
// };

// // remmember me (check button)
//       const rememberMe=(e)=>{
//         setRemember(e.target.checked)
   
//       }
//   return (
    
//     <div
//       className=" flex   items-center justify-center rounded-2xl bg-cyan-500  shadow-xl shadow-gray-100 rounded-2xl"
//       dir="rtl"
//     >  
     
           

//       <div className="login-card  bg-white rounded-2xl rounded-md overflow-hidden flex flex-col md:flex-row w-full ">

//         {/* Left - Form */}
//         <div className="mt-5 md:w-1/2 p-4 flex flex-col justify-center">
//           <div className="text-center mb-8">
//             <h1 className="text-4xl font-bold text-cyan-900">
//              نظام محافظ أولاد موسى فلتس 
//             </h1>
//             <p className=" mt-5 text-gray-600 mt-2">
//               أدخل بياناتك للوصول إلى حسابك
//             </p>
//           </div>

//       <form className="space-y-6">

//   {/* Email */}
//   <div className="flex flex-col">
//     <label className="mb-2 font-medium text-gray-700 flex items-center">
//       <i className="fas fa-envelope ml-2 text-yellow-500"></i>
//       البريد الإلكتروني
//     </label>

//     <input
//       type="email"
//       name="email"
//       value={Form.email}
//       onChange={OnChange}
//       className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
//       placeholder="أدخل بريدك الإلكتروني"
//     />
//   </div>

//   {/* Password */}
//   <div className="flex flex-col">
//     <label className="mb-2 font-medium text-gray-700 flex items-center">
//       <i className="fas fa-lock ml-2 text-yellow-500"></i>
//       كلمة المرور
//     </label>

//     <input
//       type="password"
//       name="password"
//       value={Form.password}
//       onChange={OnChange}
//       className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
//       placeholder="أدخل كلمة المرور"
//     />
//   </div>

//   {/* Remember + Reset */}
//   <div className="flex items-center justify-between">
//     <div className="flex items-center">
//       <input
//         type="checkbox"
//         defaultChecked={false}
//         onClick={rememberMe}
//         id="remember"
//         className="h-4 w-4 text-yellow-600 rounded"
//       />
//       <label htmlFor="remember" className="mr-2 text-gray-700">
//         تذكرني
//       </label>
//     </div>

            
//     <div onClick={()=>Navigate("/forget-Password")} className="cursor-pointer text-cyan-600 hover:text-cyan-800 text-sm">
//       نسيت كلمة المرور؟
//     </div>
//   </div>

//   {/* Button */}
// <button
//   type="button"
//   onClick={LoginProcess}
//   disabled={isLoading}
//   className={`w-full py-3 rounded-xl text-white text-lg font-medium
//     shadow-lg transition-all
//     ${
//       isLoading
//         ? "bg-gray-400 cursor-not-allowed"
//         : "bg-cyan-600 hover:bg-cyan-700"
//     }`}
// >
//   {isLoading ? (
//     <>
//       <i className="fas fa-spinner fa-spin ml-2"></i>
//       جاري تسجيل الدخول...
//     </>
//   ) : (
//     <>
//       <i className="fas fa-sign-in-alt ml-2"></i>
//       تسجيل الدخول
//     </>
//   )}
// </button>





// </form>

//         </div>

//         {/* Right Side - Image */}
//         <div className="max-h-[85vh] md:w-1/2 relative hidden md:block">
//           <img
//               src={logo}
//             alt="صوره خلفيه"
//             className="w-full h-full object-cover"
//           />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Login;
import { useState } from "react";
import { Form, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { showAlert } from "../../services/alert";
import { jwtDecode } from "jwt-decode";
import logo from "../../../public/wallet.png"
function Login() {
    const handleBackup = async () => {
      try {
        
        const response = await api.get("/backup", { responseType: "blob" });
  
        const blob = new Blob([response.data], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
  
        const link = document.createElement("a");
        link.href = url;
        const date = new Date().toISOString().split("T")[0];
        link.setAttribute("download", `backup-${date}.json`);
  
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Backup failed:", err);
       
      } 
    };
 const Navigate =useNavigate();
 const RememberValue=JSON.parse(localStorage.getItem("remember"))
const [Form, SetForm] = useState({ email:RememberValue?.email || "", password: RememberValue?.password || "" });

const [Remember,setRemember]=useState(false)
const [isLoading, setIsLoading] = useState(false);



//  save the value in state 
   const OnChange=(e)=>{
       SetForm({...Form,[e.target.name]:e.target.value})
       
   }

//  login process
 const LoginProcess = async () => {
  try {
setIsLoading(true);
    const Res = await api.post("/users/login", {
      email: Form.email,
      password: Form.password
    });

    const Data = Res.data;

    if (Data.accessToken) {
      localStorage.setItem("token", Data.accessToken);
       
      if (Remember) {
        localStorage.setItem("remember", JSON.stringify(Form));
      }

          showAlert({
        title: Data?.message || "حدث خطأ في الاتصال بالخادم",
        icon: "success"
      })
       const decoded=jwtDecode(Data.accessToken);
       const role=decoded.role;
        if(role==="superadmin"){ 
    
            Navigate("/");
          await  handleBackup() 
        }else if(role==="manager"){
            Navigate("/manager_dashboard");
        }
     
     
    }

  } catch (err) {
    showAlert({
      title: err.response?.data?.message || err?.data?.message ||  err?.message || "حدث خطأ في الاتصال بالخادم",
      icon: "error"
    })

 
  }
  finally {
    setIsLoading(false);
  }
};

// remmember me (check button)
      const rememberMe=(e)=>{
        setRemember(e.target.checked)
   
      }
  return (
    
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      dir="rtl"
      style={{
     
        backgroundImage: 'radial-gradient(rgba(148,163,184,0.12) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >  
      {/* توهج خلفي */}

      <div className="login-card relative w-full max-w-5xl bg-white rounded-[28px] overflow-hidden flex flex-col md:flex-row shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">

        {/* ============ الفورم ============ */}
        <div className="md:w-1/2 px-6 sm:px-10 py-10 sm:py-14 flex flex-col justify-center">

          <div className="mb-10">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-5 shadow-lg shadow-slate-900/20">
              <i className="fas fa-wallet text-cyan-400 text-lg"></i>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 leading-snug">
              نظام محافظ <br />
              <span className="text-cyan-600">أولاد موسى فلتس</span>
            </h1>
            <p className="mt-3 text-slate-500 text-sm font-medium">
              أدخل بياناتك للوصول إلى حسابك
            </p>
          </div>

          <form className="space-y-5">

            {/* Email */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-bold text-slate-700">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
                <input
                  type="email"
                  name="email"
                  value={Form.email}
                  onChange={OnChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-11 pl-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all"
                  placeholder="أدخل بريدك الإلكتروني"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="mb-2 text-sm font-bold text-slate-700">
                كلمة المرور
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
                <input
                  type="password"
                  name="password"
                  value={Form.password}
                  onChange={OnChange}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-11 pl-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all"
                  placeholder="أدخل كلمة المرور"
                />
              </div>
            </div>

            {/* Remember + Reset */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  defaultChecked={false}
                  onClick={rememberMe}
                  id="remember"
                  className="h-4 w-4 rounded border-slate-300 accent-cyan-600 cursor-pointer"
                />
                <label htmlFor="remember" className="mr-2 text-sm font-semibold text-slate-600 cursor-pointer">
                  تذكرني
                </label>
              </div>

              <div onClick={()=>Navigate("/forget-Password")} className="cursor-pointer text-cyan-600 hover:text-cyan-800 text-sm font-bold transition-colors">
                نسيت كلمة المرور؟
              </div>
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={LoginProcess}
              disabled={isLoading}
              className={`group w-full py-3.5 rounded-xl text-white text-base font-black
                transition-all flex items-center justify-center gap-2
                ${
                  isLoading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-cyan-600 shadow-lg shadow-slate-900/20 hover:shadow-cyan-600/30 active:scale-[0.99]"
                }`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt transition-transform group-hover:-translate-x-1"></i>
                  تسجيل الدخول
                </>
              )}
            </button>

          </form>
        </div>

        {/* ============ اللوحة البصرية ============ */}
        <div className="md:w-1/2 relative hidden md:block min-h-[560px] overflow-hidden bg-slate-900">
          <img
            src={logo}
            alt="صوره خلفيه"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          {/* تدرج غامق فوق الصورة */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/55 to-[#0B1220]/10" />

          {/* دوائر زخرفية */}
          <svg className="absolute -top-10 -left-10 w-72 h-72 opacity-20 pointer-events-none" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="95" stroke="#22D3EE" strokeWidth="1" />
            <circle cx="100" cy="100" r="70" stroke="#22D3EE" strokeWidth="1" />
            <circle cx="100" cy="100" r="45" stroke="#22D3EE" strokeWidth="1" />
          </svg>

          {/* كارت زجاجي بالمميزات */}
          <div className="absolute bottom-8 right-8 left-8 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <p className="font-black text-lg">كل محافظك في مكان واحد</p>
              <span className="w-9 h-6 rounded bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600" />
            </div>
            <ul className="space-y-2.5 text-sm font-semibold text-slate-100">
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-cyan-300"></i>
                متابعة حدود الاستلام والإرسال الشهرية
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-cyan-300"></i>
                سجل كامل لكل العمليات والرسوم
              </li>
              <li className="flex items-center gap-3">
                <i className="fas fa-check-circle text-cyan-300"></i>
                نسخة احتياطية من البيانات عند الدخول
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;