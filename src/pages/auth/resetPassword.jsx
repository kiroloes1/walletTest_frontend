import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import { 
  HiOutlineMail,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineArrowLeft
} from "react-icons/hi";
import api from "../../services/api";
import { showAlert } from "../../services/alert";
import logo from "../../../public/wallet.png"

export default function ResetPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [success, setSuccess] = useState(false);

  async function resetPassword(e) {
    e.preventDefault();


    try {
      setLoading(true);

      await api.put("/users/reset-password", {
        email,
        resetCode,
        newPassword
      });

      setSuccess(true);
      showAlert({
         title:"تم تغيير كلمة المرور بنجاح، جاري التحويل لتسجيل الدخول...",
            icon: "success"
      })
     

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (err) {
      showAlert({
        title: err.response?.data?.message || "حدث خطأ",
        icon: "error"
      })  
    
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir="rtl" className="font-['cairo'] flex items-center justify-center bg-gray-100 ">

      <div className="bg-white shadow-xl overflow-hidden flex w-full">

        {/* الفورم */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">

          {/* رجوع */}
          <Link 
            to="/login" 
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            العودة لتسجيل الدخول
          </Link>

          {/* العنوان */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <HiOutlineLockClosed className="w-6 h-6 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              إعادة تعيين كلمة المرور
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              أدخل الكود المرسل إلى بريدك وكلمة المرور الجديدة
            </p>
          </div>




          {/* الفورم */}
          {!success && (
            <form onSubmit={resetPassword} className="space-y-4">

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="البريد الإلكتروني"
                required
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 text-right"
              />

              <input
                type="text"
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="كود التحقق"
                maxLength="6"
                required
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 text-right"
              />

              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="كلمة المرور الجديدة"
                required
                minLength="8"
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 text-right"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-600 transition"
              >
                {loading ? "جارٍ التغيير..." : "تغيير كلمة المرور"}
              </button>

            </form>
          )}

          {/* إعادة إرسال */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              لم يصلك الكود؟{" "}
              <Link to="/forget-password" className="text-gray-900 font-medium">
                إعادة الإرسال
              </Link>
            </p>
          </div>

        </div>

        {/* الصورة */}
        {/* Right Side - Image */}
        <div className="md:w-1/2 relative hidden md:block">
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