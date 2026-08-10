import React, { useEffect, useState } from "react";
import api from "../../services/api";

const MonthlyTransactions = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const res = await api.get("transaction/getCurrentMonthTransactions");
            setTransactions(res.data.data);
            setLoading(false);
        } catch (err) {
            setError("حدث خطأ أثناء تحميل البيانات");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handlePrint = () => {
        window.print();
    };


    if (loading) return <div className="status-msg">جاري تحميل المعاملات...</div>;
    if (error) return <div className="status-msg error">{error}</div>;

    return (
        <div className="report-">
            <style dangerouslySetInnerHTML={{ __html: `


                .report-container { 
                    padding: 30px; 
                    direction: rtl; 
                    background-color: #ffffff; 
                    min-height: 100vh; 
                    font-family: 'Tahoma', sans-serif;
                    color: #000;
                }

                /* ترويسة النظام */
                .system-header {
                    text-align: center;
                    margin-bottom: 30px;
                    border: 2px solid #000;
                    padding: 20px;
                    position: relative;
                }

                .system-header h1 {
                    font-size: 26px;
                    margin: 0;
                    font-weight: 700;
                }

                .system-header p {
                    margin: 5px 0 0;
                    color: #444;
                    font-size: 14px;
                    font-weight: 600;
                }

                .table-info-bar {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                    padding: 10px 5px;
                    border-bottom: 1px solid #ddd;
                }

                .btn-print { 
                    background-color: #000; 
                    color: #fff; 
                    border: none; 
                    padding: 8px 20px; 
                    border-radius: 2px; 
                    cursor: pointer; 
                    font-weight: bold;
                    transition: 0.2s;
                }

                .btn-print:hover { background-color: #333; }

                /* تنسيق الجدول الفخم */
                .table-responsive { width: 100%; overflow-x: auto; }
                
                .custom-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    border: 1px solid #000;
                }

                .custom-table th { 
                    background-color: #f2f2f2; 
                    color: #000; 
                    padding: 12px 8px; 
                    font-size: 13px;
                    border: 1px solid #000;
                    text-align: center;
                }

                .custom-table td { 
                    padding: 10px 8px; 
                    border: 1px solid #ccc; 
                    font-size: 13px;
                    text-align: center;
                    vertical-align: middle;
                }

                .custom-table tr:nth-child(even) { background-color: #fafafa; }

                /* تفاصيل الشخص (الاسم والرقم) */
                .person-info {
                    display: flex;
                    flex-direction: column;
                    gap: 2px;
                }
                .person-name { font-weight: 700; color: #000; }
                .person-phone { font-size: 11px; color: #666; font-family: monospace; }

                .amount-bold { font-weight: 700; font-size: 15px; }

                .type-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    font-weight: 700;
                    border: 1px solid #000;
                    background: #fff;
                    font-size: 12px;
                }
                .type-send { background-color: #000; color: #fff; }

                @media print {
                    .btn-print { display: none !important; }
                    .report-container { padding: 0; }
                    body { background-color: white !important; }
                    @page { size: A4 landscape; margin: 10mm; }
                    .custom-table th { background-color: #eee !important; -webkit-print-color-adjust: exact; }
                }
            `}} />

            <div className="system-header">
                <h1>نظام محافظ أولاد موسى فلتس</h1>
                <p>سجل التحويلات والعمليات المالية</p>
            </div>

            <div className="table-info-bar">
                <div style={{ fontWeight: 'bold' }}>📍 تقرير الحركات الشهرية</div>
                <button onClick={handlePrint} className="btn-print">🖨️ طباعة المستند</button>
            </div>

            {transactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>لا توجد بيانات متاحة حالياً.</div>
            ) : (
                <div className="table-responsive  overflow-auto p-1 px-4 w-full">
                    <table className="custom-table ">
                        <thead>
                            <tr>
                                <th>نوع العملية</th>
                                <th>المبلغ</th>
                                <th>المحفظة الأصلية</th>
                                <th>بيانات المرسل</th>
                                <th>بيانات المستلم</th>
                                <th>التاريخ والوقت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((tx) => (
                                <tr key={tx._id}>
                                    <td>
                                        <span className={`type-badge ${tx.type === 'send' ? 'type-send' : ''}`}>
                                            {tx.type === 'send' ? 'إرسال' : 'استلام'}
                                        </span>
                                    </td>
                                    <td className="amount-bold">{tx.amount?.toLocaleString()} ج.م</td>
                                    
                                    {/* المحفظة التي تمت منها العملية */}
                                    <td>
                                        <div className="person-info">
                                            <span className="person-name">{tx.walletId?.walletName}</span>
                                            <span className="person-phone">{tx.walletId?.phoneNumber}</span>
                                        </div>
                                    </td>

                                    {/* بيانات المرسل من واقع العملية */}
                                    <td>
                                        <div className="person-info">
                                            <span className="person-name">{tx.senderName || "—"}</span>
                                            <span className="person-phone">{tx.senderPhone || "—"}</span>
                                        </div>
                                    </td>

                                    {/* بيانات المستلم من واقع العملية */}
                                    <td>
                                        <div className="person-info">
                                            <span className="person-name">{tx.receiverName || "—"}</span>
                                            <span className="person-phone">{tx.receiverPhone || "—"}</span>
                                        </div>
                                    </td>

                                    <td style={{ direction: 'ltr', fontSize: '12px' }}>
                                        {new Date(tx.createdAt).toLocaleString('ar-EG', {
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            hour12: true
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                                               
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background-color: white !important; margin: 0; padding: 0; }
          .max-w-4xl { max-width: 100% !important; width: 100% !important; margin: 0 !important; }
          @page { size: auto; margin: 15mm; }
        }
      `}</style>
                </div>


            )}
        </div>
    );
};

export default MonthlyTransactions;