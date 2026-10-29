// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";

// import { HiOutlineMail, HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi";
// import api from "../../services/api";
// import { showAlert } from "../../services/alert";
// import logo from "../../../public/wallet.png"

// export default function ForgetPassword() {
//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [sent, setSent] = useState(false);
//   const navigate = useNavigate();

//   async function forgetPassword(e) {
//     e.preventDefault();


//     try {
//       setLoading(true);

//       await api.put("/users/forgot-password", {
//         email: email,
//       });

//       setSent(true);
//       showAlert({
//         title: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
//         icon: "success"
//       })
  
//       setTimeout(() => {
//         navigate("/reset-password");
//       }, 400);

//     } catch (err) {
//       showAlert({
//         title: err.response?.data?.message || "حدث خطأ، حاول مرة أخرى",
//         icon: "error"
//       })
      
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div dir="rtl" className=" flex items-center justify-center bg-gray-100 ">

//       <div className="bg-white  shadow-xl overflow-hidden flex w-full ">

//         {/* Right Side - Form (بالعربي يبقى يمين) */}
//         <div className="w-full md:w-1/2 p-8 p-2 mt-2 flex flex-col justify-center">

//           {/* رجوع */}
//           <Link 
//             to="/login" 
//             className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
//           >
//             <HiOutlineArrowLeft className="w-4 h-4" />
//             العودة لتسجيل الدخول
//           </Link>

//           {/* العنوان */}
//           <div className="text-center mb-6">
//             <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
//               <HiOutlineMail className="w-6 h-6 text-gray-600" />
//             </div>
//             <h1 className="text-2xl font-bold text-gray-900">
//               نسيت كلمة المرور؟
//             </h1>
//             <p className="text-gray-500 text-sm mt-2">
//               أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور
//             </p>
//           </div>



//           {/* الفورم */}
//           {!sent && (
//             <form onSubmit={forgetPassword} className="space-y-4">

//               <input
//                 type="email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 placeholder="أدخل بريدك الإلكتروني"
//                 required
//                 className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 text-right"
//               />

//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition"
//               >
//                 {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
//               </button>

//             </form>
//           )}

//           {/* الفوتر */}
//           <p className="text-center text-sm text-gray-500 mt-6">
//             تذكرت كلمة المرور؟{" "}
//             <Link to="/login" className="text-gray-900 font-medium">
//               تسجيل الدخول
//             </Link>
//           </p>

//         </div>

//         {/* Right Side - Image */}
//         <div className="md:w-1/2 relative hidden md:block">
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

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { HiOutlineMail, HiOutlineArrowLeft, HiOutlineArrowRight, HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi";
import api from "../../services/api";
import { showAlert } from "../../services/alert";
import logo from "../../../public/wallet.png"

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  async function forgetPassword(e) {
    e.preventDefault();


    try {
      setLoading(true);

      await api.put("/users/forgot-password", {
        email: email,
      });

      setSent(true);
      showAlert({
        title: "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
        icon: "success"
      })
  
      setTimeout(() => {
        navigate("/reset-password");
      }, 400);

    } catch (err) {
      showAlert({
        title: err.response?.data?.message || "حدث خطأ، حاول مرة أخرى",
        icon: "error"
      })
      
    } finally {
      setLoading(false);
    }
  }

  // خطوات الاستعادة (الخطوة الحالية = 1)
  const steps = ["إدخال البريد الإلكتروني", "كتابة كود التحقق", "تعيين كلمة مرور جديدة"];
  const currentStep = 0;

  return (
    <div
      dir="rtl"
      className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6"
      style={{
        
        backgroundImage: 'radial-gradient(rgba(148,163,184,0.12) 1px, transparent 1px)',
        backgroundSize: '22px 22px',
      }}
    >
      <div className="fixed top-[-120px] right-[-120px] w-[420px] h-[420px] bg-cyan-500/15 rounded-full blur-[110px] pointer-events-none" />
      <div className="fixed bottom-[-140px] left-[-100px] w-[380px] h-[380px] bg-indigo-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div className="relative w-full max-w-5xl bg-white rounded-[28px] overflow-hidden flex flex-col md:flex-row shadow-[0_40px_80px_-30px_rgba(0,0,0,0.8)]">

        {/* ============ الفورم ============ */}
        <div className="w-full md:w-1/2 px-6 sm:px-10 py-10 sm:py-14 flex flex-col justify-center">

          {/* رجوع */}
          <Link 
            to="/login" 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-cyan-700 mb-8 text-sm font-bold transition-colors w-fit"
          >
            <HiOutlineArrowRight className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>

          {/* العنوان */}
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-5 shadow-lg shadow-slate-900/20">
              <HiOutlineMail className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-black text-slate-900">
              نسيت كلمة المرور؟
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-3">
              أدخل بريدك الإلكتروني وهنبعتلك كود لإعادة تعيين كلمة المرور
            </p>
          </div>

          {/* الفورم */}
          {!sent ? (
            <form onSubmit={forgetPassword} className="space-y-5">

              <div className="relative">
                <HiOutlineMail className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="أدخل بريدك الإلكتروني"
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-11 pl-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:bg-white focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 transition-all text-right"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 rounded-xl text-white text-base font-black transition-all flex items-center justify-center gap-2 ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-slate-900 hover:bg-cyan-600 shadow-lg shadow-slate-900/20 hover:shadow-cyan-600/30 active:scale-[0.99]"
                }`}
              >
                {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>

            </form>
          ) : (
            <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700">
              <HiOutlineCheckCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-bold">تم الإرسال، جاري تحويلك لصفحة إدخال الكود...</p>
            </div>
          )}

          {/* الفوتر */}
          <p className="text-center text-sm text-slate-500 font-medium mt-8">
            تذكرت كلمة المرور؟{" "}
            <Link to="/login" className="text-cyan-600 hover:text-cyan-800 font-black transition-colors">
              تسجيل الدخول
            </Link>
          </p>

        </div>

        {/* ============ اللوحة البصرية ============ */}
        <div className="md:w-1/2 relative hidden md:block min-h-[560px] overflow-hidden bg-slate-900">
          <img
            src={logo}
            alt="صوره خلفيه"
            className="absolute inset-0 w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/55 to-[#0B1220]/10" />

          <svg className="absolute -top-10 -left-10 w-72 h-72 opacity-20 pointer-events-none" viewBox="0 0 200 200" fill="none">
            <circle cx="100" cy="100" r="95" stroke="#22D3EE" strokeWidth="1" />
            <circle cx="100" cy="100" r="70" stroke="#22D3EE" strokeWidth="1" />
            <circle cx="100" cy="100" r="45" stroke="#22D3EE" strokeWidth="1" />
          </svg>

          {/* خطوات الاستعادة */}
          <div className="absolute bottom-8 right-8 left-8 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 text-white">
            <p className="font-black text-lg mb-5">استعادة الحساب في 3 خطوات</p>
            <ol className="relative space-y-4">
              <span className="absolute right-[15px] top-4 bottom-4 w-px bg-white/20" />
              {steps.map((label, i) => {
                const active = i === currentStep;
                const done = i < currentStep;
                return (
                  <li key={label} className="relative flex items-center gap-4">
                    <span
                      className={`relative z-[1] w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border ${
                        active
                          ? "bg-cyan-400 text-slate-900 border-cyan-300"
                          : done
                          ? "bg-emerald-400 text-slate-900 border-emerald-300"
                          : "bg-slate-800/80 text-slate-300 border-white/20"
                      }`}
                    >
                      {done ? <HiOutlineCheckCircle className="w-4 h-4" /> : i + 1}
                    </span>
                    <span className={`text-sm font-bold ${active ? "text-white" : "text-slate-300"}`}>{label}</span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>

      </div>
    </div>
  );
}