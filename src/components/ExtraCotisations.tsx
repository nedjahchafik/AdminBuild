import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Apartment, ExtraContribution } from '../types';
import { Hammer, Calendar, Plus, ChevronRight, Check, AlertCircle, TrendingUp, Users } from 'lucide-react';

interface ExtraCotisationsProps {
  lang: Lang;
  role: UserRole;
  apartments: Apartment[];
  extras: ExtraContribution[];
  onAddExtraContribution: (titleFr: string, titleAr: string, descFr: string, descAr: string, amount: number, deadline: string) => void;
  onPayExtraContribution: (extraId: string, apartmentNumber: number, amount: number) => void;
}

export default function ExtraCotisations({
  lang,
  role,
  apartments,
  extras,
  onAddExtraContribution,
  onPayExtraContribution
}: ExtraCotisationsProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [activeExtraId, setActiveExtraId] = useState<string>("extra-01");
  const [showCreator, setShowCreator] = useState(false);

  // New item form
  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descAr, setDescAr] = useState("");
  const [amount, setAmount] = useState(1500);
  const [deadline, setDeadline] = useState("2026-06-30");

  const [selectPayApt, setSelectPayApt] = useState<number | "">("");

  const activeExtra = extras.find(e => e.id === activeExtraId) || extras[0];

  // Calculations for active exception project
  const occupiedCount = apartments.filter(a => !a.resident.isVacant).length;
  const targetBudget = occupiedCount * (activeExtra?.targetAmountPerAppt || 0);
  
  let collectedAmount = 0;
  let paidApartmentsCount = 0;

  if (activeExtra) {
    activeExtra.payments.forEach(p => {
      collectedAmount += p.amountPaid;
      if (p.amountPaid >= activeExtra.targetAmountPerAppt) {
        paidApartmentsCount++;
      }
    });
  }

  const progressPercent = targetBudget > 0 ? Math.round((collectedAmount / targetBudget) * 100) : 0;

  const handleSubmitNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFr.trim() || !titleAr.trim() || amount <= 0) {
      alert(isRtl ? "يرجى تعبئة الحقول المطلوبة بالشكل الصحيح" : "Veuillez remplir correctement les informations de la cotisation.");
      return;
    }
    onAddExtraContribution(titleFr, titleAr, descFr, descAr, amount, deadline);
    setShowCreator(false);
    // Reset
    setTitleFr("");
    setTitleAr("");
    setDescFr("");
    setDescAr("");
    setAmount(1000);
  };

  const handlePaySubmit = () => {
    if (role === 'resident') {
      alert(isRtl ? "سجل الساكن للقراءة فقط" : "Seul l'Administrateur peut encaisser.");
      return;
    }
    if (selectPayApt === "") {
      alert(isRtl ? "يرجى تحديد الشقة المحصلة" : "Sélectionnez un appartement.");
      return;
    }
    onPayExtraContribution(activeExtra.id, Number(selectPayApt), activeExtra.targetAmountPerAppt);
    setSelectPayApt("");
    alert(isRtl ? "تم تسجيل الاستلام وإضافته بالصندوق الرئيسي!" : "Paiement exceptionnel enregistré avec succès !");
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Upper selector drives */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.cotisationExtra}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRtl ? "جمع مساهمات لتغطية إصلاحات وتصليحات كبرى طارئة بالعمارة" : "Financements spécifiques pour travaux d'entretien extraordinaires"}
            </p>
          </div>

          <div className="flex gap-2">
            {role !== 'resident' && (
              <button 
                onClick={() => setShowCreator(!showCreator)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold font-sans flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isRtl ? "صيانة جديدة" : "Créer Projet"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Existing active projects selector */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-50">
          {extras.map(e => (
            <button
              key={e.id}
              onClick={() => {
                setActiveExtraId(e.id);
                setSelectPayApt("");
              }}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${activeExtraId === e.id ? 'bg-emerald-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {isRtl ? e.titleAr : e.titleFr}
            </button>
          ))}
        </div>
      </div>

      {/* Creator Modal component */}
      {showCreator && (
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 p-6 rounded-3xl text-white shadow-xl space-y-4 border border-emerald-800">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-800">
            <h3 className="text-base font-extrabold flex items-center gap-2">
              <Hammer className="w-5 h-5 text-emerald-300" />
              <span>{t.createExtraContrib}</span>
            </h3>
            <button 
              onClick={() => setShowCreator(false)}
              className="text-emerald-250 text-xs hover:underline cursor-pointer"
            >
              {isRtl ? "إغلاق" : "Fermer"}
            </button>
          </div>

          <form onSubmit={handleSubmitNew} className="space-y-4 text-xs font-sans text-gray-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">Titre (Français)</label>
                <input 
                  type="text" 
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  placeholder="ex: Réparation de l'ascenseur"
                  className="w-full p-2.5 rounded-xl bg-white border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">العنوان (بالعربية)</label>
                <input 
                  type="text" 
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: طلاء جدران الطوابق"
                  className="w-full p-2.5 rounded-xl bg-white border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans text-right"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">Description (Français)</label>
                <textarea 
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans h-16"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">الوصف (بالعربية)</label>
                <textarea 
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 font-sans text-right h-16"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">Montant par appartement (DZD)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-white border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-emerald-200 uppercase tracking-wider mb-1">Délai Limite</label>
                <input 
                  type="date" 
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-white border-none focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="submit"
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold rounded-xl cursor-pointer"
              >
                {t.addContribution}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main active project cockpit card */}
      {activeExtra && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Detailed card statistics */}
          <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Hammer className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-950">
                  {isRtl ? activeExtra.titleAr : activeExtra.titleFr}
                </h3>
                <span className="text-xs text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {t.deadline}: {activeExtra.deadline}
                </span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
              {isRtl ? activeExtra.descriptionAr : activeExtra.descriptionFr}
            </p>

            {/* Financial meter */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-400 font-medium">{t.contribProgress}</span>
                <span className="font-mono text-emerald-600 font-extrabold">{progressPercent}%</span>
              </div>
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-amber-500 to-emerald-650 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.totalCollected}</div>
                  <div className="text-base font-black font-mono mt-1 text-emerald-700">
                    {collectedAmount.toLocaleString()} DZD
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{t.targetAmount}</div>
                  <div className="text-base font-black font-mono mt-1 text-gray-700">
                    {targetBudget.toLocaleString()} DZD
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side quick collection action for administrator */}
          <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div>
              <h4 className="text-sm font-bold text-gray-900 pb-2 border-b border-gray-100 uppercase tracking-wider">
                {isRtl ? "تحصيل سريع للمساهمة" : "Percevoir cet Extra"}
              </h4>
              <p className="text-xs text-gray-400 mt-1">
                {isRtl ? `تسجيل سداد مستحقات الأشغال (${activeExtra.targetAmountPerAppt} دج)` : `Enregistrer la contribution de ${activeExtra.targetAmountPerAppt} DZD pour une clé`}
              </p>
            </div>

            {role !== 'resident' ? (
              <div className="space-y-4 font-sans text-xs">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1.5">{t.apartments}</label>
                  <select 
                    value={selectPayApt}
                    onChange={(e) => setSelectPayApt(e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-emerald-500 bg-gray-50/50 font-sans"
                  >
                    <option value="">-- {isRtl ? "اختر الشقة المحصلة" : "Choisir l'appartement"} --</option>
                    {apartments
                      .filter(a => !a.resident.isVacant)
                      .map(a => {
                        const paidObj = activeExtra.payments.find(p => p.apartmentNumber === a.number);
                        const labelState = paidObj 
                          ? (isRtl ? `✔ شقة ${a.number} (دفع ${paidObj.amountPaid} دج)` : `✔ Apt ${a.number} (Déjà payé ${paidObj.amountPaid} DZD)`) 
                          : (isRtl ? `✖ شقة ${a.number} (لم يدفع)` : `✖ Apt ${a.number} (Non versé)`);
                        return (
                          <option 
                            key={a.number} 
                            value={a.number}
                            disabled={!!paidObj && paidObj.amountPaid >= activeExtra.targetAmountPerAppt}
                          >
                            {labelState}
                          </option>
                        );
                      })}
                  </select>
                </div>

                <button 
                  onClick={handlePaySubmit}
                  disabled={selectPayApt === ""}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-250 text-white font-extrabold rounded-2xl text-xs h-11 flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>{isRtl ? "تأكيد واستلام المبلغ بالصندوق" : "Valider l'encaissement"}</span>
                </button>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-2xl space-y-2 border border-amber-100 flex items-start gap-2.5 text-xs text-amber-805">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <div className="font-bold text-amber-900">{isRtl ? "القائمة للعرض فقط" : "Consulter Mes États"}</div>
                  <div className="text-gray-600 mt-1">{isRtl ? "إذا قمت بسداد المبلغ ولم يظهر هنا، من فضلك اتصل بأمين الصندوق أمين لتعديل السجل." : "Si vous avez payé mais que cela n'apparaît pas, veuillez contacter le trésorier."}</div>
                </div>
              </div>
            )}

            {/* List of payers for this extra project */}
            <div className="pt-2 border-t border-gray-105">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                {isRtl ? "المحليات الأخيرة" : "Paiements Enregistrés"} ({activeExtra.payments.length}/{occupiedCount})
              </span>
              
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {activeExtra.payments.map((p, i) => {
                  const apt = apartments.find(a => a.number === p.apartmentNumber);
                  return (
                    <div key={i} className="flex justify-between items-center bg-gray-50/80 p-2 rounded-xl border border-gray-100">
                      <span className="font-bold text-gray-800 font-mono">
                        {isRtl ? `شقة ${p.apartmentNumber}` : `Apt ${p.apartmentNumber}`}
                      </span>
                      <span className="text-gray-400 font-sans text-[11px] truncate max-w-[120px]">
                        {apt?.resident.name}
                      </span>
                      <span className="text-emerald-700 font-mono font-bold">
                        +{p.amountPaid} DZD
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
