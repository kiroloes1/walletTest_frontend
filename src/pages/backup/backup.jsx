import React, { useState } from "react";
import { DatabaseBackup } from "lucide-react"; // أيقونة النسخ الاحتياطي
import api from "../../services/api";

const BackupButton = () => {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    try {
      setLoading(true);

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
      alert("فشل تحميل النسخة الاحتياطية");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleBackup}
      className={`
        font-['cairo']
       no-print  fixed bottom-24 left-8 z-50 
        bg-cyan-500/20 text-[#0F172A] 
        p-4 rounded-[20px] 
        shadow-2xl shadow-cyan-500/40 
        hover:bg-cyan-600 hover:-translate-y-2 
        active:scale-90 
        transition-all duration-300 cursor-pointer 
        group flex items-center justify-center
      `}
      title="تحميل نسخة احتياطية"
    >
      {/* تأثير الموجة خلف الأيقونة */}
      <span className="absolute inset-0 rounded-[20px] bg-cyan-500 animate-ping opacity-20 group-hover:hidden"></span>

      {/* أيقونة النسخ الاحتياطي */}
      <DatabaseBackup
        className={`text-2xl relative z-10 ${loading ? "animate-spin" : ""}`}
      />
    </div>
  );
};

export default BackupButton;