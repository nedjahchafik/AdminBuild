import React from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Apartment, MonthCycle, Expense } from '../types';
import { Landmark, TrendingUp, AlertTriangle, Users, Mail, Compass, HelpCircle, FileText, Share2 } from 'lucide-react';

interface ReportsProps {
  lang: Lang;
  role: UserRole;
  apartments: Apartment[];
  months: MonthCycle[];
  expenses: Expense[];
  cashBalance: number;
}

export default function Reports({
  lang,
  role,
  apartments,
  months,
  expenses,
  cashBalance
}: ReportsProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  // Calculate high quality financial telemetry
  const activeCycleId = "2026-05";
  const currentMonth = months.find(m => m.id === activeCycleId);
  const occupiedCount = apartments.filter(a => !a.resident.isVacant).length;

  // Let's compute outstanding arrears for the occupied apartments for currentMonth
  interface Debtor {
    aptNum: number;
    name: string;
    phone: string;
    unpaidCount: number; // outstanding months in loaded list!
    totalDebt: number;
  }

  const debtorsList: Debtor[] = [];

  apartments.forEach(apt => {
    if (apt.resident.isVacant) return;
    
    let unpaidMonthsCount = 0;
    months.forEach(m => {
      const payment = m.payments.find(p => p.apartmentNumber === apt.number);
      if (!payment || !payment.isPaid) {
        unpaidMonthsCount++;
      }
    });

    if (unpaidMonthsCount > 0) {
      debtorsList.push({
        aptNum: apt.number,
        name: apt.resident.name,
        phone: apt.resident.phone,
        unpaidCount: unpaidMonthsCount,
        totalDebt: unpaidMonthsCount * 500
      });
    }
  });

  // Arrears sorted by highest debt
  const sortedDebtors = [...debtorsList].sort((a,b) => b.totalDebt - a.totalDebt);

  // Total collected all time from cached records
  let totalIncomeCollected = 0;
  months.forEach(m => {
    m.payments.forEach(p => {
      if (p.apartmentNumber === 40) return;
      if (p.isPaid) totalIncomeCollected += m.baseAmount;
    });
  });

  // Let's add simulated starting budget of 85000 DZD
  const baseRegistryFund = 85000;
  const grandTotalIncomeIncludingStarting = baseRegistryFund + totalIncomeCollected;

  const totalSpentAllTime = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  // Recovery Rate computation
  const totalInvoicedAllTime = baseRegistryFund + (months.length * occupiedCount * 500);
  const overallRecoveryPercent = totalInvoicedAllTime > 0 
    ? Math.round((grandTotalIncomeIncludingStarting / totalInvoicedAllTime) * 100) 
    : 80;

  // Render quick WhatsApp sharing template message for arrears
  const handleArrearsWhatsApp = (debtor: Debtor) => {
    const message = isRtl 
      ? `السلام عليكم جاري المحترم شقة ${debtor.aptNum} (${debtor.name}). نود تذكيركم بلطف ورجاء ودّي بدفع اشتراكات العمارة المتأخرة المستحقة بذمتكم وقدرها ${debtor.totalDebt} دج لتسوية وضعية تسيير العمارة (نظافة ومصعد). شكراً لصدركم الرحب وكرم تفهمكم.`
      : `Salam Alykoum Cher Voisin de l'Apt ${debtor.aptNum} (${debtor.name}). Nous vous rappelons cordialement de bien vouloir vous acquitter de vos cotisations de copropriété en retard pour un montant total de ${debtor.totalDebt} DZD afin de préserver les services de l'immeuble (ascenseur, nettoyage). Merci beaucoup !`;
    
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${debtor.phone.replace(/\s+/g, '')}?text=${encoded}`, '_blank');
  };

  const handleArrearsSMS = (debtor: Debtor) => {
    const message = isRtl 
      ? `Rappel Cotisation Bloc 31 Apt ${debtor.aptNum} : Montant restant de ${debtor.totalDebt} DZD. Veuillez contacter le tresorier Amine.`
      : `Rappel Cotisation Bloc 31 Apt ${debtor.aptNum} : Montant de ${debtor.totalDebt} DZD restant d'impayes. Merci de regler auprès du tresorier Amine.`;
    
    const encoded = encodeURIComponent(message);
    window.open(`sms:${debtor.phone.replace(/\s+/g, '')}?body=${encoded}`, '_blank');
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Overview Head card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.financialHealth}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isRtl ? "توليد كشوفات ذكية ورسوم بيانية دقيقة لحركة وتوازنات الصندوق" : "Analyses graphiques et ratios d'audit pour la gestion du Bloc31"}
          </p>
        </div>

        {/* Global summary dashboard card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100">
          <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-50">
            <span className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">{isRtl ? "المداخيل الإجمالية" : "Recettes Totales"}</span>
            <div className="text-xl font-mono font-bold mt-1 text-emerald-950">
              +{grandTotalIncomeIncludingStarting.toLocaleString()} DZD
            </div>
            <span className="text-[10px] text-gray-400 font-sans block mt-0.5">{isRtl ? "تشمل الاحتياطي الأولي والصناديق" : "Incorpore l'encaisse de départ"}</span>
          </div>

          <div className="p-4 bg-red-50/50 rounded-2xl border border-red-50">
            <span className="text-[10px] text-red-800 font-bold uppercase tracking-wider">{isRtl ? "النفقات والمصاريف" : "Dépenses Totales"}</span>
            <div className="text-xl font-mono font-bold mt-1 text-red-950">
              -{totalSpentAllTime.toLocaleString()} DZD
            </div>
            <span className="text-[10px] text-gray-400 font-sans block mt-0.5">{expenses.length} {isRtl ? "سندات سحب وصرف" : "ordonnances payées"}</span>
          </div>

          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-50">
            <span className="text-[10px] text-blue-800 font-bold uppercase tracking-wider">{t.cashBalance}</span>
            <div className="text-xl font-mono font-bold mt-1 text-blue-950">
              {cashBalance.toLocaleString()} DZD
            </div>
            <span className="text-[10px] text-emerald-700 font-extrabold flex items-center gap-1 mt-0.5">
              <span>● {overallRecoveryPercent}% {isRtl ? "معدل الإيفاء المالي" : "Taux global de recouvrement"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Graphical Breakdown Panel - pure CSS & Responsive SVG for robustness */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Receipts split breakdown */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider pb-2 border-b border-gray-50">
            {t.incomeBreakdown}
          </h3>

          <div className="flex flex-col items-center justify-center p-4">
            {/* Draw a circular progress visual SVG representations */}
            <svg className="w-40 h-40 transform -rotate-90">
              <circle cx="80" cy="80" r="60" className="text-gray-100" strokeWidth="15" stroke="currentColor" fill="transparent" />
              <circle cx="80" cy="80" r="60" className="text-emerald-500" strokeWidth="15" strokeDasharray={100 * 3.77} strokeDashoffset={(100 - overallRecoveryPercent) * 3.77} strokeLinecap="round" stroke="currentColor" fill="transparent" />
            </svg>
            
            <div className="text-center mt-3">
              <div className="text-lg font-black text-gray-800">{overallRecoveryPercent}%</div>
              <div className="text-xs text-gray-400">{isRtl ? "نسبة تحصيل الالتزامات الشهرية والأشغال" : "Indice d'efficacité de l'assiette collectée"}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs font-sans">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>{isRtl ? "اشتراكات شهرية مدفوعة" : "Loyauté Mensuelle"}</span>
              <span className="font-mono font-bold text-gray-850">+{totalIncomeCollected.toLocaleString()} DZD</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>{isRtl ? "الاحتياطي المبدئي للصندوق" : "Réserve standard initial"}</span>
              <span className="font-mono font-bold text-gray-450">{baseRegistryFund.toLocaleString()} DZD</span>
            </div>
          </div>
        </div>

        {/* Expenses distribution visualization */}
        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider pb-2 border-b border-gray-50">
            {t.expenseBreakdown}
          </h3>

          {/* Simple dynamic horizontal progress bars represent distinct categories */}
          <div className="space-y-4 p-2 text-xs font-sans">
            {['ascenseur', 'nettoyage', 'plomberie', 'electricite', 'autres'].map((catKey) => {
              const spentInCat = expenses
                .filter(e => e.category === catKey || (catKey === 'autres' && (e.category === 'reparations' || e.category === 'securite' || e.category === 'maintenance')))
                .reduce((acc, curr) => acc + curr.amount, 0);

              const percentOfTotal = totalSpentAllTime > 0 ? Math.round((spentInCat / totalSpentAllTime) * 100) : 0;
              
              const labelFrMap: Record<string, string> = { ascenseur: 'Ascenseur', nettoyage: 'Propreté', plomberie: 'Plomberie & Eau', electricite: 'Électricité', autres: 'Dépannages & Autres' };
              const labelArMap: Record<string, string> = { ascenseur: 'صيانة المصاعد', nettoyage: 'النظافة والتعقيم', plomberie: 'مضخة الماء والترصيص', electricite: 'كهرباء وإنارة', autres: 'تصليحات ومستجدات' };

              return (percentOfTotal > 0 || spentInCat > 0) && (
                <div key={catKey} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">{isRtl ? labelArMap[catKey] : labelFrMap[catKey]}</span>
                    <span className="font-mono text-gray-500">{spentInCat.toLocaleString()} DZD ({percentOfTotal}%)</span>
                  </div>
                  <div className="w-full h-2 bg-gray-150 rounded-full overflow-hidden bg-gray-100">
                    <div 
                      className={`h-full rounded-full ${catKey === 'ascenseur' ? 'bg-blue-500' : (catKey === 'nettoyage' ? 'bg-emerald-500' : (catKey === 'plomberie' ? 'bg-teal-500' : 'bg-amber-500'))}`}
                      style={{ width: `${percentOfTotal}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Defaulters / Overdue Outstanding ledger with direct SMS/WhatsApp buttons */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="pb-2 border-b border-gray-100 flex items-center gap-1.5">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-extrabold text-gray-950">
            {t.defaultersList} ({sortedDebtors.length})
          </h3>
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
          {sortedDebtors.map((deb, i) => (
            <div 
              key={deb.aptNum}
              className="p-4 rounded-2xl bg-gray-50/70 border border-gray-100 hover:border-amber-150 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 font-mono text-amber-800 flex flex-col items-center justify-center font-bold">
                  <span className="text-[9px] uppercase leading-none opacity-60">Apt</span>
                  <span className="text-base font-black">{deb.aptNum}</span>
                </div>
                <div>
                  <div className="font-extrabold text-gray-800 flex items-center gap-1.5 leading-none">
                    <span>{deb.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-400 font-mono mt-1 block">
                    {deb.unpaidCount} {isRtl ? "شهور متأخرات" : "échéance(s) en souffrance"} ({deb.phone})
                  </span>
                </div>
              </div>

              {/* Debt and Action triggers */}
              <div className="flex items-center gap-3 justify-end">
                <span className="font-mono text-base font-black text-amber-700 bg-amber-50 px-2.5 py-1 rounded-xl">
                  {deb.totalDebt.toLocaleString()} DZD
                </span>

                <div className="flex gap-1.5 font-sans font-bold">
                  <button 
                    onClick={() => handleArrearsSMS(deb)}
                    className="px-2.5 py-1.5 bg-gray-200 hover:bg-gray-300 rounded-xl text-[10px] text-gray-700 font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t.remindSms}</span>
                  </button>

                  <button 
                    onClick={() => handleArrearsWhatsApp(deb)}
                    className="px-3.5 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-xl text-[10px] font-bold transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3 h-3" />
                    <span>{t.remindWhatsApp}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {sortedDebtors.length === 0 && (
            <div className="text-center p-10 bg-emerald-50/20 rounded-3xl border border-dashed border-emerald-200 text-emerald-800">
              <Landmark className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
              <p className="text-sm font-bold">{isRtl ? "مثالي! لا يوجد أي متأخرات دفع مسجلة بالعمارة" : "Incroyable! Aucun retard de paiement recensé."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
