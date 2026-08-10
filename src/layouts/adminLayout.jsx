import { Outlet } from "react-router-dom"
import Sidebar from "../pages/sideBar"
import BackupButton from "../pages/backup/backup"
import WalletChatbot from "../services/chatbot"
// import BackupButton from "../pages/backup/backup"

export default function SuperAdminLayout() {
  return (
<>
    <div dir="rtl" className="dashboard flex">

      <aside className="min-h-screen bg-[#0f172a] "> <Sidebar role={"superadmin"}/></aside>

      <div className="content flex-1">
        <Outlet />
      </div>

             


  
    </div>
    <WalletChatbot/>
    <BackupButton/>

</>


  )
}
