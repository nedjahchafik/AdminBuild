import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Apartment, MonthCycle, MonthlyPayment } from '../types';
import { Check, X, Calendar, DollarSign, Edit, AlertCircle, TrendingUp, Search, Info, Landmark, Plus, ArrowLeftRight, Clock, ChevronDown } from 'lucide-react';

interface MonthlyCotisationsProps {
  lang: Lang;
  role: UserRole;
  apartments: Apartment[];
  months: MonthCycle[];
  onTogglePayment: (
    monthId: string,
    apartmentNumber: number,
    isPaid: boolean,
    date?: string,
    note?: string,
    isLate?: boolean,
    isPaidLate?: boolean
  ) => void;
  onAddMonthCycle: (year: number, month: number, baseAmount: number) => void;
}

export default function MonthlyCotisations({
  lang,
  role,
  apartments,
  months,
  onTogglePayment,
  onAddMonthCycle
}: MonthlyCotisationsProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [activeCycleId, setActiveCycleId] = useState<string>("2026-05");
  const [aptFilter, setAptFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'unpaid' | 'late'>('all');

  // Year filter selection
  const years = Array.from(new Set(months.map(m => m.id.split('-')[0]))).sort((a, b) => b.localeCompare(a));
  const [selectedYear, setSelectedYear] = useState<string>(() => {
    return activeCycleId.split('-')[0] || years[0] || "2026";
  });

  // Cycle creation options
  const [showAddMonthForm, setShowAddMonthForm] = useState(false);
  const [newYear, setNewYear] = useState(2026);
  const [newMonth, setNewMonth] = useState(6);
  const [newAmount, setNewAmount] = useState(500);

  // Specific editing properties (late payments support)
  const [editingPaymentKey, setEditingPaymentKey] = useState<number | null>(null);
  const [modalDate, setModalDate] = useState("");
  const [modalNote, setModalNote] = useState("");
  const [modalIsPaid, setModalIsPaid] = useState(false);
  const [modalIsLate, setModalIsLate] = useState(false);
  const [modalIsPaidLate, setModalIsPaidLate] = useState(false);

  const activeCycle = months.find(m => m.id === activeCycleId) || months[0];

  if (!activeCycle) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-gray-150 text-center font-sans space-y-4" dir={isRtl ? 'rtl' : 'ltr'}>
        <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
        <h3 className="text-lg font-bold text-gray-800">{isRtl ? "لا توجد شهور اشتراك مسجلة" : "Aucun mois d'exercice configuré"}</h3>
        {role !== 'resident' && (
          <button 
            onClick={() => onAddMonthCycle(2026, 5, 500)}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-850 text-white rounded-xl text-xs font-bold"
          >
            {isRtl ? "بدء الميزانية الإفتراضية" : "Initialiser le premier mois"}
          </button>
        )}
      </div>
    );
  }

  // Real-time calculation for this active cycle
  const occupiedCount = apartments.filter(a => !a.resident.isVacant).length;
  
  let collectedAmount = 0;
  let paidCount = 0;
  let unpaidCount = 0;
  let lateUnpaidCount = 0;

  activeCycle.payments.forEach(p => {
    if (p.apartmentNumber === 40) return;
    
    // Check if the actual appt is marked vacant in apartment registry
    const apt = apartments.find(a => a.number === p.apartmentNumber);
    if (!apt || apt.resident.isVacant) return;

    if (p.isPaid) {
      collectedAmount += activeCycle.baseAmount;
      paidCount++;
    } else {
      unpaidCount++;
      if (p.isLate) {
        lateUnpaidCount++;
      }
    }
  });

  const remainingToCollect = unpaidCount * activeCycle.baseAmount;
  const progressPercent = occupiedCount > 0 ? Math.round((paidCount / occupiedCount) * 100) : 0;

  const handleFastToggle = (p: MonthlyPayment) => {
    if (role === 'resident') {
      alert(isRtl ? "المشاهدة فقط متاحة لحسابك الساكن. عذراً!" : "Droits insuffisants. Seuls les administrateurs et trésoriers peuvent valider les encaissements.");
      return;
    }
    const nextPaidState = !p.isPaid;
    const defaultDate = nextPaidState ? new Date().toISOString().split('T')[0] : "";
    const defaultNote = nextPaidState ? (isRtl ? "وصل سريع" : "Validation rapide") : "";
    
    // Default handles fast validation (marked on-time or clear late is toggled off)
    onTogglePayment(
      activeCycleId, 
      p.apartmentNumber, 
      nextPaidState, 
      defaultDate, 
      defaultNote, 
      false, // isLate reset on fast toggle
      nextPaidState ? p.isLate : false // if it was marked late, pay late
    );
  };

  const openDetailedEdit = (p: MonthlyPayment) => {
    if (role === 'resident') return;
    setEditingPaymentKey(p.apartmentNumber);
    setModalDate(p.paymentDate || new Date().toISOString().split('T')[0]);
    setModalNote(p.note || "");
    setModalIsPaid(p.isPaid);
    setModalIsLate(!!p.isLate);
    setModalIsPaidLate(!!p.isPaidLate);
  };

  const handleSaveDetailed = (aptNum: number) => {
    onTogglePayment(
      activeCycleId, 
      aptNum, 
      modalIsPaid, 
      modalIsPaid ? modalDate : undefined, 
      modalNote,
      !modalIsPaid ? modalIsLate : false, 
      modalIsPaid ? modalIsPaidLate : false
    );
    setEditingPaymentKey(null);
  };

  const handleCreateMonth = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMonthCycle(newYear, newMonth, newAmount);
    
    const targetId = `${newYear}-${String(newMonth).padStart(2, '0')}`;
    setSelectedYear(String(newYear));
    setActiveCycleId(targetId);
    setShowAddMonthForm(false);
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      
      {/* Upper Month & Year filter registry */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.cotisationMonthly}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRtl 
                ? `تسجيل ومتابعة ميزانية الاشتراكات الشهرية بقيمة ${activeCycle.baseAmount} دج للشقة` 
                : `Suivi des redevances mensuelles de copropriété (${activeCycle.baseAmount} DZD / appt)`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {role !== 'resident' && (
              <button
                onClick={() => setShowAddMonthForm(!showAddMonthForm)}
                className={`px-3 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all ${showAddMonthForm ? 'ring-2 ring-emerald-500' : ''}`}
              >
                <Plus className="w-4 h-4" />
                <span>{isRtl ? "إضافة شهر/سنة" : "Ajouter mois / année"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic add month cycle form */}
        {showAddMonthForm && (
          <form onSubmit={handleCreateMonth} className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-3 font-sans text-xs">
            <h3 className="font-extrabold text-gray-800 flex items-center gap-1.5 pb-1 border-b border-gray-200">
              <Plus className="w-4 h-4 text-emerald-600" />
              <span>{isRtl ? "إطلاق شهر اشتراك جديد وتدوينه في الأرشيف ورجوعاً للسنوات" : "Créer un nouveau mois / exercice de cotisation"}</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{isRtl ? "السنة" : "Année"}</label>
                <select 
                  value={newYear} 
                  onChange={(e) => setNewYear(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold"
                >
                  <option value={2027}>2027</option>
                  <option value={2026}>2026</option>
                  <option value={2025}>2025</option>
                  <option value={2024}>2024</option>
                  <option value={2023}>2023</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{isRtl ? "الشهر" : "Mois"}</label>
                <select 
                  value={newMonth} 
                  onChange={(e) => setNewMonth(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-gray-200 bg-white font-bold"
                >
                  {[
                    { val: 1, labels: { fr: "Janvier", ar: "جانفي" } },
                    { val: 2, labels: { fr: "Février", ar: "فيفري" } },
                    { val: 3, labels: { fr: "Mars", ar: "مارس" } },
                    { val: 4, labels: { fr: "Avril", ar: "أفريل" } },
                    { val: 5, labels: { fr: "Mai", ar: "ماي" } },
                    { val: 6, labels: { fr: "Juin", ar: "جوان" } },
                    { val: 7, labels: { fr: "Juillet", ar: "جويلية" } },
                    { val: 8, labels: { val: 8, fr: "Août", ar: "أوت" } },
                    { val: 9, labels: { fr: "Septembre", ar: "سبتمبر" } },
                    { val: 10, labels: { fr: "Octobre", ar: "أكتوبر" } },
                    { val: 11, labels: { fr: "Novembre", ar: "نوفمبر" } },
                    { val: 12, labels: { fr: "Décembre", ar: "ديسمبر" } }
                  ].map((m) => (
                    <option key={m.val} value={m.val}>
                      {isRtl ? m.labels.ar : m.labels.fr}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{isRtl ? "قيمة الاشتراك للشقة (دج)" : "Montant d'échéance (DZD)"}</label>
                <input 
                  type="number" 
                  value={newAmount}
                  onChange={(e) => setNewAmount(Number(e.target.value))}
                  className="w-full p-2 rounded-xl border border-gray-200 bg-white font-mono font-bold"
                  required 
                  min={100}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button 
                type="button" 
                onClick={() => setShowAddMonthForm(false)}
                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl"
              >
                {t.cancel}
              </button>
              <button 
                type="submit" 
                className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl"
              >
                {isRtl ? "توفير وتبويب هذا الشهر" : "Créer le cycle"}
              </button>
            </div>
          </form>
        )}

        {/* Dynamic Year & Month History Indexer System */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-gray-150/40 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isRtl ? "مخزن الميزانية والسنوات:" : "ARCHIVE DES ANNÉES :"}</span>
            <div className="flex flex-wrap gap-1">
              {years.map(yr => (
                <button
                  key={yr}
                  onClick={() => {
                    setSelectedYear(yr);
                    const firstMonthForYear = months.find(m => m.id.startsWith(yr));
                    if (firstMonthForYear) {
                      setActiveCycleId(firstMonthForYear.id);
                      setEditingPaymentKey(null);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${selectedYear === yr ? 'bg-emerald-950 text-white shadow-xs' : 'bg-white hover:bg-gray-150 text-gray-600 border border-gray-200'}`}
                >
                  {yr}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-200/50">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{isRtl ? "الشهور القياسية مسجلة:" : "MOIS COMPUTARES :"}</span>
            <div className="flex flex-wrap gap-1">
              {months
                .filter(m => m.id.startsWith(selectedYear))
                .map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setActiveCycleId(m.id);
                      setEditingPaymentKey(null);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeCycleId === m.id ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/10' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'}`}
                  >
                    {isRtl ? m.nameAr.split(' ')[0] : m.nameFr.split(' ')[0]}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Live dynamic metrics cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-gray-100">
          <div className="bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50 text-emerald-950">
            <div className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-wider">{t.totalCollected}</div>
            <div className="text-lg font-black font-mono leading-tight mt-1">
              {collectedAmount.toLocaleString()} <span className="text-[10px] font-sans font-bold">DZD</span>
            </div>
            <div className="text-[10px] mt-0.5 opacity-80">{paidCount} {isRtl ? 'شقق دفعت' : 'payés'}</div>
          </div>

          <div className="bg-amber-50/50 p-3 rounded-2xl border border-amber-50 text-amber-950">
            <div className="text-[10px] font-extrabold text-amber-800 uppercase tracking-wider">{t.remaining}</div>
            <div className="text-lg font-black font-mono leading-tight mt-1">
              {remainingToCollect.toLocaleString()} <span className="text-[10px] font-sans font-bold">DZD</span>
            </div>
            <div className="text-[10px] mt-0.5 opacity-80">
              {unpaidCount} {isRtl ? 'بانتظار الدفع' : 'impayés'} 
              {lateUnpaidCount > 0 && ` (${lateUnpaidCount} ${isRtl ? 'متأخرين' : 'en retard'})`}
            </div>
          </div>

          {/* Progress bar container */}
          <div className="col-span-2 bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col justify-center">
            <div className="flex justify-between items-center text-[10px] font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">
              <span>{t.defaultRate} ({isRtl ? activeCycle.nameAr : activeCycle.nameFr})</span>
              <span className="font-mono text-emerald-700 font-extrabold">{progressPercent}%</span>
            </div>
            <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of payments filter toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100">
        <div className="flex flex-wrap gap-1.5">
          <button 
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${statusFilter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
          >
            {isRtl ? "الكل" : "Tous"} ({occupiedCount})
          </button>
          
          <button 
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${statusFilter === 'paid' ? 'bg-emerald-600 text-white' : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'}`}
          >
            {isRtl ? "تم الدفع" : "Payés"} ({paidCount})
          </button>

          <button 
            onClick={() => setStatusFilter('late')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${statusFilter === 'late' ? 'bg-amber-600 text-white' : 'bg-amber-50 hover:bg-amber-100 text-amber-700'}`}
          >
            ⚠️ {isRtl ? "متأخرين" : "En retard"} ({activeCycle.payments.filter(p => !p.isPaid && p.isLate).length})
          </button>

          <button 
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer ${statusFilter === 'unpaid' ? 'bg-red-600 text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
          >
            {isRtl ? "لم يدفع (الكل)" : "Impayés"} ({unpaidCount})
          </button>
        </div>

        <div className="relative">
          <Search className={`w-3.5 h-3.5 text-gray-400 absolute top-2.5 ${isRtl ? 'left-2.5' : 'right-2.5'}`} />
          <input 
            type="text" 
            placeholder={isRtl ? "البحث برقم الشقة..." : "Filtrer par n°..."}
            value={aptFilter}
            onChange={(e) => setAptFilter(e.target.value)}
            className="pl-8 pr-8 py-1.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500 font-sans max-w-[170px]"
          />
        </div>
      </div>

      {/* Fast Check-In list representing apartments with 44px min touch heights */}
      <div className="space-y-3">
        {activeCycle.payments
          .filter(p => {
            if (p.apartmentNumber === 40 && !aptFilter) return false;

            const apt = apartments.find(a => a.number === p.apartmentNumber);
            if (!apt) return false;

            const numMatch = apt.number.toString().includes(aptFilter);
            const nameMatch = apt.resident.name.toLowerCase().includes(aptFilter.toLowerCase());
            const modelSearch = numMatch || nameMatch;

            if (apt.resident.isVacant && p.apartmentNumber !== 40) return false; 

            if (statusFilter === 'paid') return p.isPaid;
            if (statusFilter === 'unpaid') return !p.isPaid;
            if (statusFilter === 'late') return !p.isPaid && p.isLate;

            return modelSearch;
          })
          .map((p) => {
            const apt = apartments.find(a => a.number === p.apartmentNumber);
            const resName = apt?.resident.name || `Résident Apt ${p.apartmentNumber}`;
            const isEditing = editingPaymentKey === p.apartmentNumber;

            // Compute border and background color based on late payment status
            let rowStyle = "border-gray-150";
            if (p.isPaid) {
              rowStyle = p.isPaidLate ? "border-amber-200 bg-amber-50/5 text-slate-800 shadow-2xs" : "border-emerald-100 bg-emerald-50/10";
            } else {
              rowStyle = p.isLate ? "border-orange-200 bg-orange-50/5 text-slate-800" : "border-red-105 bg-red-50/5";
            }

            return (
              <div 
                key={p.apartmentNumber}
                className={`bg-white rounded-3xl p-4 border transition-all ${rowStyle}`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    
                    {/* Apt ID badge with customizable warning shades for late payments */}
                    <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono shrink-0 ${
                      p.isPaid 
                        ? p.isPaidLate ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        : p.isLate ? 'bg-orange-100 text-orange-800 animate-pulse' : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider">{p.apartmentNumber === 40 ? "G" : "Apt"}</span>
                      <span className="text-lg font-black leading-none">{p.apartmentNumber === 40 ? "40" : p.apartmentNumber}</span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="text-xs font-bold text-gray-800 font-sans tracking-tight">{resName}</span>
                        {apt?.resident.isOwner ? (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-550 rounded text-[9px] font-bold font-sans">{isRtl ? "مالك" : "Propriétaire"}</span>
                        ) : (
                          <span className="px-1.5 py-0.5 bg-gray-100 text-gray-550 rounded text-[9px] font-bold font-sans">{isRtl ? "مستأجر" : "Locataire"}</span>
                        )}

                        {/* Status label chips tailored for payment delays */}
                        {!p.isPaid && p.isLate && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-850 border border-orange-200 text-[9px] font-black rounded-full uppercase tracking-wider">
                            ⚠️ {isRtl ? "متأخر" : "En retard"}
                          </span>
                        )}
                        {p.isPaid && p.isPaidLate && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-250 text-[9px] font-black rounded-full uppercase tracking-wider">
                            ⏳ {isRtl ? "دُفع متأخراً" : "Payé en retard"}
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">
                        {apt?.floor === 0 ? (isRtl ? "الطابق الأرضي" : "Rez-de-chaussée") : `${t.floor} ${apt?.floor}`}
                      </div>
                    </div>
                  </div>

                  {/* Payment controls: ONE-TAP buttons with 44px min touch sizes */}
                  <div className="flex items-center gap-2 justify-end self-end md:self-center">
                    
                    {/* EDIT button option (Cog/Pencil) visible on ALL rows to handle late payments */}
                    {role !== 'resident' && (
                      <button 
                        onClick={() => openDetailedEdit(p)}
                        className={`p-2.5 rounded-xl transition-all h-11 w-11 flex items-center justify-center cursor-pointer ${
                          isEditing 
                            ? 'bg-emerald-700 text-white' 
                            : 'text-gray-500 hover:text-emerald-800 bg-gray-100 hover:bg-emerald-100'
                        }`}
                        title={isRtl ? "تعديل تفاصيل الدفع / التأخر" : "Modifier les détails du reçu / retard"}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}

                    {p.isPaid ? (
                      <div className="flex items-center gap-1.5 text-right font-sans">
                        <div className="hidden md:block">
                          <div className="text-xs text-emerald-700 font-bold">
                            {p.isPaidLate ? (isRtl ? "دُفع متأخراً ⏳" : "Payé en retard ⏳") : t.payOk}
                          </div>
                          <div className="text-[10px] text-gray-450 font-mono flex items-center gap-1 justify-end">
                            <Calendar className="w-3 h-3" />
                            <span>{p.paymentDate || "---"}</span>
                          </div>
                        </div>

                        <button 
                          onClick={() => handleFastToggle(p)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-705 text-white font-extrabold rounded-2xl text-xs h-11 flex items-center gap-1.5 shadow-sm shadow-emerald-500/15 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isRtl ? "مدفوع" : "Payé"}</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <div className="hidden md:block text-right pr-1">
                          <div className="text-xs text-red-600 font-extrabold">
                            {p.isLate ? (isRtl ? "متأخر ⚠️" : "En retard ⚠️") : t.payNo}
                          </div>
                          <div className="text-[9px] text-gray-400 font-sans tracking-tight">{isRtl ? "بانتظار التحصيل" : "En attente"}</div>
                        </div>

                        <button 
                          onClick={() => handleFastToggle(p)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-650 active:scale-95 text-white font-extrabold rounded-2xl text-xs h-11 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <X className="w-4 h-4" />
                          <span>{isRtl ? "تسجيل دفع" : "À Payer"}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Optional payment details expander (Admin validation form) */}
                {isEditing && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 font-sans text-xs">
                    <div className="flex items-center gap-1 text-xs text-amber-900 bg-amber-50 p-3 rounded-xl">
                      <Info className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-extrabold">{isRtl ? "لوحة التعديل والتحصيل المتأخر:" : "Panneau d'édition des retards et justificatifs :"}</span>
                        <p className="text-[10px] text-gray-600 mt-0.5">{isRtl ? "يمكنك تغيير الحالة ووسم الاشتراكات لإبقاء حسابات الصندوق شفافة ودقيقة" : "Permet de marquer spécifiquement l'état de recouvrement de la redevance pour ce lot de copropriété."}</p>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{isRtl ? "حالة دفع الاشتراك" : "Statut de paiement"}</label>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                        {/* Option 1: En attente */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalIsPaid(false);
                            setModalIsLate(false);
                            setModalIsPaidLate(false);
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold tracking-tight transition-all cursor-pointer ${
                            (!modalIsPaid && !modalIsLate) 
                              ? 'bg-gray-100 text-gray-800 border-gray-300 shadow-3xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div>{isRtl ? "قيد الانتظار" : "En attente"}</div>
                          <span className="text-[9px] font-normal opacity-70">({isRtl ? "غير مسدد" : "Échéance"})</span>
                        </button>

                        {/* Option 2: En retard de paiement */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalIsPaid(false);
                            setModalIsLate(true);
                            setModalIsPaidLate(false);
                          }}
                          className={`p-2.4 py-2 rounded-xl border text-center font-bold tracking-tight transition-all cursor-pointer ${
                            (!modalIsPaid && modalIsLate) 
                              ? 'bg-orange-100 text-orange-950 border-orange-300 shadow-3xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div>⚠️ {isRtl ? "متأخر عن الدفع" : "En retard"}</div>
                          <span className="text-[9px] font-normal opacity-70">({isRtl ? "مع التنبيه" : "Impayé"})</span>
                        </button>

                        {/* Option 3: Payé à temps */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalIsPaid(true);
                            setModalIsLate(false);
                            setModalIsPaidLate(false);
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold tracking-tight transition-all cursor-pointer ${
                            (modalIsPaid && !modalIsPaidLate) 
                              ? 'bg-emerald-100 text-emerald-950 border-emerald-300 shadow-3xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div>✔ {isRtl ? "تم الدفع بالوقت" : "Payé à temps"}</div>
                          <span className="text-[9px] font-normal opacity-70">({isRtl ? "تحصيل عادي" : "Réceptionné"})</span>
                        </button>

                        {/* Option 4: Payé en retard */}
                        <button
                          type="button"
                          onClick={() => {
                            setModalIsPaid(true);
                            setModalIsLate(false);
                            setModalIsPaidLate(true);
                          }}
                          className={`p-2.5 rounded-xl border text-center font-bold tracking-tight transition-all cursor-pointer ${
                            (modalIsPaid && modalIsPaidLate) 
                              ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-3xs' 
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div>⏳ {isRtl ? "دُفع متأخراً" : "Payé en retard"}</div>
                          <span className="text-[9px] font-normal opacity-70">({isRtl ? "تأخر طويل" : "Apaisé"})</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {modalIsPaid && (
                        <div>
                          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.paymentDate}</label>
                          <input 
                            type="date"
                            value={modalDate}
                            onChange={(e) => setModalDate(e.target.value)}
                            className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-mono bg-white"
                          />
                        </div>
                      )}
                      <div className={modalIsPaid ? "" : "col-span-2"}>
                        <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.paymentNote}</label>
                        <input 
                          type="text"
                          value={modalNote}
                          onChange={(e) => setModalNote(e.target.value)}
                          placeholder={isRtl ? "مثال: تم تسليم نقدا / بعد الإنذار" : "ex: En espèces réclamé tardivement"}
                          className="w-full mt-1 p-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-sans bg-white"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button 
                        onClick={() => setEditingPaymentKey(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button 
                        onClick={() => handleSaveDetailed(p.apartmentNumber)}
                        className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t.saveChanges}</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Non-editing Notes preview */}
                {!isEditing && p.note && (
                  <div className="mt-2.5 pt-2 border-t border-gray-50 text-[10px] text-gray-450 italic text-gray-500 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{isRtl ? "ملاحظة الأمين" : "Note / Réf"} : <strong className="font-semibold text-gray-700">{p.note}</strong></span>
                    {p.collectedBy && (
                      <>
                        <span className="opacity-80">•</span>
                        <span>{isRtl ? "بيد" : "Par"} : <strong className="font-semibold text-gray-705">{p.collectedBy}</strong></span>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
