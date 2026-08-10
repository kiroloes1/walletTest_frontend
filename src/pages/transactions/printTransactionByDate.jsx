import React, { useState, useEffect, useMemo } from 'react';
import api from '../../services/api';
import moment from 'moment';
import html2pdf from "html2pdf.js";
const TransactionReport = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
  
    const [searchTerm, setSearchTerm] = useState(""); 
    const [filterType, setFilterType] = useState("all");
    const [startDate, setStartDate] = useState(""); 
    const [endDate, setEndDate] = useState("");   
    const [sharing, setSharing] = useState(false); 

    
    useEffect(() => {
        fetchTransactions();
    }, []);


    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transaction/2');
            setTransactions(res.data.transactions);
        } catch (err) { 
            console.error(err); 
        } finally { 
            setLoading(false); 
        }
    };

    const handlePrint = () => { window.print(); };

    // --- منطق الفلترة المطور (Client-side) ---
    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx) => {
            const txDate = moment(tx.createdAt);
            const now = moment();
            let matchesDate = true;

            // 1. فلترة المواعيد
            if (filterType === 'daily') {
                matchesDate = txDate.isSame(now, 'day');
            } else if (filterType === 'monthly') {
                matchesDate = txDate.isSame(now, 'month');
            } else if (filterType === 'yearly') {
                matchesDate = txDate.isSame(now, 'year');
            } else if (filterType === 'custom') {
                if (startDate && endDate) {
                    matchesDate = txDate.isBetween(moment(startDate).startOf('day'), moment(endDate).endOf('day'), null, '[]');
                } else if (startDate) {
                    matchesDate = txDate.isSameOrAfter(moment(startDate).startOf('day'));
                } else if (endDate) {
                    matchesDate = txDate.isSameOrBefore(moment(endDate).endOf('day'));
                }
            }

            // 2. فلترة البحث النصي
            const matchesSearch = 
                searchTerm === "" ||
                (tx.senderName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                (tx.receiverName?.toLowerCase().includes(searchTerm.toLowerCase())) || 
                (tx.walletId?.walletName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (tx.senderPhone?.includes(searchTerm));

            return matchesDate && matchesSearch;
        });
    }, [transactions, searchTerm, filterType, startDate, endDate]);

    // حساب الإجمالي للبيانات المفلترة
    const totalAmount = filteredTransactions.reduce((acc, curr) => acc + (curr.amount || 0), 0);

    const totals = useMemo(() => {
    return filteredTransactions.reduce((acc, curr) => {
        const amount = curr.amount || 0;
        if (curr.type === 'send') {
            acc.totalSent += amount;
        } else if (curr.type === 'receive') {
            acc.totalReceived += amount;
        }
        return acc;
    }, { totalSent: 0, totalReceived: 0 });
}, [filteredTransactions]);



              const handleSharePDF = async () => {
      const element = document.getElementById("invoice-capture");
  
      if (!element) return;
  
      const fileName = "report.pdf";
  
      const options = {
          margin: 10,
          filename: fileName,
          image: {
              type: "jpeg",
              quality: 1
          },
          html2canvas: {
              scale: 2,
              useCORS: true
          },
          jsPDF: {
              unit: "mm",
              format: "a4",
              orientation: "portrait"
          }
      };
  
      try {
          setSharing(true);
  
          const pdfBlob = await html2pdf()
              .set(options)
              .from(element)
              .output("blob");
  
          const file = new File([pdfBlob], fileName, {
              type: "application/pdf"
          });
  
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
              await navigator.share({
                  files: [file],
                  title: "تقرير طباعه عمليات التاجر",
                  text: "مرفق تقرير عمليات التاجر"
              });
          } else {
              html2pdf()
                  .set(options)
                  .from(element)
                  .save();
          }
      } catch (error) {
          console.error(error);
      } finally {
          setSharing(false);
      }
  };
    return (
        <div className="report-container">
            <style dangerouslySetInnerHTML={{ __html: `


                .report-container { 
                    padding: 30px; direction: rtl; background-color: #fff; 
                    min-height: 100vh; font-family: 'Tahoma', sans-serif; color: #000;
                }

                .controls-bar {
                    display: flex; flex-direction: column; gap: 15px;
                    margin-bottom: 20px; background: #f8fafc; padding: 20px;
                    border: 1px solid #e2e8f0; border-radius: 12px;
                }

                .filter-row { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; }

                .input-control {
                    padding: 8px 12px; border: 1px solid #cbd5e1;
                    border-radius: 6px; font-family: 'Tahoma'; font-size: 13px; outline: none;
                }
                
                .btn-filter {
                    padding: 6px 15px; border-radius: 6px; border: 1px solid #cbd5e1;
                    background: #fff; cursor: pointer; font-size: 12px; font-weight: bold;
                }
                .btn-filter.active { background: #000; color: #fff; border-color: #000; }

                .system-header {
                    text-align: center; margin-bottom: 30px; border: 3px double #000; padding: 20px;
                }
                .system-header h1 { font-size: 24px; margin: 0; font-weight: 900; }

                .custom-table { width: 100%; border-collapse: collapse; border: 1px solid #000; }
                .custom-table th { background-color: #f2f2f2; padding: 10px; border: 1px solid #000; font-size: 12px; font-weight: 900; }
                .custom-table td { padding: 8px; border: 1px solid #000; text-align: center; font-size: 12px; }
                
                .total-box {
                    margin-top: 20px; padding: 15px; border: 2px solid #000;
                    display: inline-block; font-weight: 900; font-size: 16px;
                }

                @media print {
                    .no-print { display: none !important; }
                    .report-container { padding: 0; }
                    .system-header { margin-top: 0; }
                    @page { size: A4 landscape; margin: 10mm; }
                }
            `}} />

            <div className="system-header">
                <h1>نظام محافظ أولاد موسى فلتس</h1>
                <p>تقرير مالي تفصيلي - سجل حركات الأموال</p>
            </div>

            {/* --- شريط التحكم المطور --- */}
            <div className="controls-bar no-print">
                <div className="filter-row">
                    <span style={{fontWeight: '900', fontSize: '13px'}}>نطاق التقرير:</span>
                    {[
                        { id: 'all', label: 'الكل' },
                        { id: 'daily', label: 'اليوم' },
                        { id: 'monthly', label: 'الشهر الحالي' },
                        { id: 'yearly', label: 'السنة الحالية' },
                        { id: 'custom', label: 'تاريخ مخصص' }
                    ].map(btn => (
                        <button 
                            key={btn.id}
                            className={`btn-filter ${filterType === btn.id ? 'active' : ''}`}
                            onClick={() => setFilterType(btn.id)}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>

                <div className="filter-row">
                    {filterType === 'custom' && (
                        <>
                            <div style={{display:'flex', gap: '5px', alignItems:'center'}}>
                                <label style={{fontSize:'12px', fontWeight:'bold'}}>من:</label>
                                <input type="date" className="input-control" value={startDate} onChange={(e)=>setStartDate(e.target.value)} />
                            </div>
                            <div style={{display:'flex', gap: '5px', alignItems:'center'}}>
                                <label style={{fontSize:'12px', fontWeight:'bold'}}>إلى:</label>
                                <input type="date" className="input-control" value={endDate} onChange={(e)=>setEndDate(e.target.value)} />
                            </div>
                        </>
                    )}
                    <input 
                        type="text" 
                        placeholder="ابحث بالاسم أو رقم الهاتف..." 
                        className="input-control" 
                        style={{ flex: 1 }}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                     تاريخ التقرير: {moment().format('YYYY-MM-DD')} | 
                    نوع العرض: {
                        filterType === 'all' ? 'كافة البيانات' : 
                        filterType === 'daily' ? 'حركات اليوم' : 
                        filterType === 'monthly' ? 'الحركات الشهرية' : 
                        filterType === 'yearly' ? 'الحركات السنوية' : 'فترة مخصصة'
                    }
                </div>
                <button onClick={handlePrint} className="no-print" style={{ background: '#000', color: '#fff', padding: '5px 15px', cursor: 'pointer', fontWeight: 'bold' }}>
                    🖨️ طباعة التقرير
                </button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>جاري تحضير البيانات...</div>
            ) : filteredTransactions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '100px', border: '1px dashed #ccc' }}>
                    عفواً، لا توجد سجلات تطابق البحث في هذه الفترة.
                </div>
            ) : (
                < >
                    <table  className="custom-table">
                        <thead>
                            <tr>
                                <th style={{width: '80px'}}>النوع</th>
                                <th style={{width: '120px'}}>المبلغ</th>
                                <th>المحفظة</th>
                                <th>المرسل</th>
                                <th>المستقبل</th>
                                <th style={{width: '150px'}}>التاريخ والوقت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTransactions.map((tx) => (
                                <tr key={tx._id}>
                                    <td style={{fontWeight: 'bold'}}>{tx.type === 'send' ? 'إرسال' : 'استلام'}</td>
                                    <td style={{fontWeight: '900'}}>{tx.amount?.toLocaleString()} ج.م</td>
                                    <td>{tx.walletId?.walletName} <br/> <small>{tx.walletId?.phoneNumber}</small></td>
                                    <td>{tx.senderName || "—"} <br/> <small>{tx.senderPhone}</small></td>
                                    <td>{tx.receiverName || "—"} <br/> <small>{tx.receiverPhone}</small></td>
                                    <td style={{fontSize: '11px'}}>{moment(tx.createdAt).format('YYYY-MM-DD | hh:mm A')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>


                    <div style={{ display: 'flex', gap: '20px', marginTop: '20px' }}>
    <div className="total-box" style={{ borderColor: '#e53e3e', color: '#c53030' }}>
        إجمالي الإرسال: {totals.totalSent.toLocaleString()} ج.م
    </div>
    
    <div className="total-box" style={{ borderColor: '#38a169', color: '#2f855a' }}>
        إجمالي الاستلام: {totals.totalReceived.toLocaleString()} ج.م
    </div>

    <div className="total-box" style={{ backgroundColor: '#000', color: '#fff' }}>
        صافي  (الفرق): {(totals.totalReceived - totals.totalSent).toLocaleString()} ج.م
    </div>
</div>


                    

                </>
            )}
        </div>
    );
};

export default TransactionReport;