// ==========================================
// أسماء الأعمدة بالعربي
// ==========================================

export const excelLabels = {
  // =========================
  // Transaction
  // =========================

  walletId: "المحفظة",

  senderName: "اسم المرسل",
  receiverName: "اسم المستلم",

  senderPhone: "رقم المرسل",
  receiverPhone: "رقم المستلم",

  type: "نوع العملية",

  notes: "ملاحظات",

  amount: "المبلغ",

  isInternalTransfer: "تحويل داخلي",

  fees: "الرسوم",

  ispay: "تم الدفع",

  sender:"مرسل",
  
  receiver:"مستلم",

  // =========================
  // Wallet
  // =========================

  walletName: "اسم المحفظة",

  phoneNumber: "رقم المحفظة",

  walletProvider: "شركة المحفظة",

  ownerName: "اسم المالك",

  Limit: "الحد الأقصى",

  status: "الحالة",

  totalIncoming: "إجمالي الوارد",

  totalOutgoing: "إجمالي الصادر",

  balance: "الرصيد",

  monthlyIncoming: "الوارد الشهري",

  monthlyOutgoing: "الصادر الشهري",

  lastReset: "آخر إعادة تعيين",

  // =========================
  // User
  // =========================

  username: "اسم المستخدم",

  email: "البريد الإلكتروني",

  role: "الصلاحية",

  notes: "ملاحظات",

  phone: "رقم الهاتف",

  isVerified: "تم التحقق",

  lastLogin: "آخر تسجيل دخول",

  passwordChangedAt: "تاريخ تغيير كلمة المرور",

  pandding: "قيد الانتظار",

  // =========================
  // Dates
  // =========================

  createdAt: "تاريخ الإنشاء",

  updatedAt: "آخر تعديل",
    totalAmount: "إجمالي المبلغ",

  transactionsCount: "عدد المعاملات",

  lastTransaction: "آخر معاملة",

  merchantName: "اسم التاجر",
};


// ==========================================
// ترجمة القيم
// ==========================================

export const excelValues = {

      totalAmount: "إجمالي المبلغ",

  transactionsCount: "عدد المعاملات",

  lastTransaction: "آخر معاملة",

  merchantName: "اسم التاجر",
  // Transaction Type

  send: "إرسال",

  receive: "استلام",

  out: "مصروف",

    sender:"مرسل",
  
  receiver:"مستلم",

  // Boolean

  true: "نعم",

  false: "لا",


  // Wallet Status

  active: "نشطة",

  inactive: "غير نشطة",


  // User Roles

  superadmin: "مدير عام",

  manager: "مدير",


  // Wallet Provider

  Vodafone: "فودافون",

  Etisalat: "اتصالات",

  Orange: "أورنج",

  WE: "WE",
};


// ==========================================
// Dictionary كامل
// ==========================================

const excelDictionary = {
  ...excelLabels,
  ...excelValues,
};

export default excelDictionary;