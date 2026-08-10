import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { HiOutlineMail, HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineExclamationCircle } from "react-icons/hi";
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

  return (
    <div dir="rtl" className="font-['cairo'] flex items-center justify-center bg-gray-100 ">

      <div className="bg-white  shadow-xl overflow-hidden flex w-full ">

        {/* Right Side - Form (بالعربي يبقى يمين) */}
        <div className="w-full md:w-1/2 p-8 p-2 mt-2 flex flex-col justify-center">

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
              <HiOutlineMail className="w-6 h-6 text-gray-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              نسيت كلمة المرور؟
            </h1>
            <p className="text-gray-500 text-sm mt-2">
              أدخل بريدك الإلكتروني لإعادة تعيين كلمة المرور
            </p>
          </div>



          {/* الفورم */}
          {!sent && (
            <form onSubmit={forgetPassword} className="space-y-4">

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="أدخل بريدك الإلكتروني"
                required
                className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:border-yellow-500 text-right"
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 transition"
              >
                {loading ? "جارٍ الإرسال..." : "إرسال رابط إعادة التعيين"}
              </button>

            </form>
          )}

          {/* الفوتر */}
          <p className="text-center text-sm text-gray-500 mt-6">
            تذكرت كلمة المرور؟{" "}
            <Link to="/login" className="text-gray-900 font-medium">
              تسجيل الدخول
            </Link>
          </p>

        </div>

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