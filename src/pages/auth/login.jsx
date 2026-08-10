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




//  save the value in state 
   const OnChange=(e)=>{
       SetForm({...Form,[e.target.name]:e.target.value})
       
   }

//  login process
 const LoginProcess = async () => {
  try {

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
};

// remmember me (check button)
      const rememberMe=(e)=>{
        setRemember(e.target.checked)
   
      }
  return (
    
    <div
      className=" flex font-['cairo']  items-center justify-center rounded-2xl bg-cyan-500  shadow-xl shadow-gray-100 rounded-2xl"
      dir="rtl"
    >  
     
           

      <div className="login-card  bg-white rounded-2xl rounded-md overflow-hidden flex flex-col md:flex-row w-full ">

        {/* Left - Form */}
        <div className="mt-5 md:w-1/2 p-4 flex flex-col justify-center">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-cyan-900">
             نظام محافظ أولاد موسى فلتس 
            </h1>
            <p className=" mt-5 text-gray-600 mt-2">
              أدخل بياناتك للوصول إلى حسابك
            </p>
          </div>

      <form className="space-y-6">

  {/* Email */}
  <div className="flex flex-col">
    <label className="mb-2 font-medium text-gray-700 flex items-center">
      <i className="fas fa-envelope ml-2 text-yellow-500"></i>
      البريد الإلكتروني
    </label>

    <input
      type="email"
      name="email"
      value={Form.email}
      onChange={OnChange}
      className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
      placeholder="أدخل بريدك الإلكتروني"
    />
  </div>

  {/* Password */}
  <div className="flex flex-col">
    <label className="mb-2 font-medium text-gray-700 flex items-center">
      <i className="fas fa-lock ml-2 text-yellow-500"></i>
      كلمة المرور
    </label>

    <input
      type="password"
      name="password"
      value={Form.password}
      onChange={OnChange}
      className="border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-yellow-500 transition-all"
      placeholder="أدخل كلمة المرور"
    />
  </div>

  {/* Remember + Reset */}
  <div className="flex items-center justify-between">
    <div className="flex items-center">
      <input
        type="checkbox"
        defaultChecked={false}
        onClick={rememberMe}
        id="remember"
        className="h-4 w-4 text-yellow-600 rounded"
      />
      <label htmlFor="remember" className="mr-2 text-gray-700">
        تذكرني
      </label>
    </div>

            
    <div onClick={()=>Navigate("/forget-Password")} className="cursor-pointer text-cyan-600 hover:text-cyan-800 text-sm">
      نسيت كلمة المرور؟
    </div>
  </div>

  {/* Button */}
  <button
    type="button"
    onClick={LoginProcess}
    className="w-full py-3 rounded-xl text-white text-lg font-medium bg-cyan-600 to-yellow-800  hover:bg-cyan-700 shadow-lg transition-all"
  >
    <i className="fas fa-sign-in-alt ml-2"></i>
    تسجيل الدخول
  </button>





</form>

        </div>

        {/* Right Side - Image */}
        <div className="max-h-[85vh] md:w-1/2 relative hidden md:block">
          <img
              src={logo}
            alt="صوره خلفيه"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}

export default Login;
