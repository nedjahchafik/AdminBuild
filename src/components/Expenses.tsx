import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Expense } from '../types';
import { 
  TrendingDown, 
  Trash2, 
  Plus, 
  Tag, 
  Wrench, 
  Sparkles, 
  Bolt, 
  Droplet, 
  FileText, 
  ShieldCheck, 
  HelpCircle, 
  Check, 
  Eye,
  Camera
} from 'lucide-react';

interface ExpensesProps {
  lang: Lang;
  role: UserRole;
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteExpense: (id: string) => void;
}

export default function Expenses({
  lang,
  role,
  expenses,
  onAddExpense,
  onDeleteExpense
}: ExpensesProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [showForm, setShowForm] = useState(false);

  // New item state
  const [amount, setAmount] = useState<number>(3000);
  const [category, setCategory] = useState<Expense['category']>("reparations");
  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [descFr, setDescFr] = useState("");
  const [descAr, setDescAr] = useState("");
  const [provider, setProvider] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);

  const getCategoryIcon = (cat: Expense['category']) => {
    switch (cat) {
      case 'ascenseur': return <Wrench className="w-4 h-4 text-blue-600" />;
      case 'nettoyage': return <Sparkles className="w-4 h-4 text-emerald-600" />;
      case 'electricite': return <Bolt className="w-4 h-4 text-amber-600" />;
      case 'plomberie': return <Droplet className="w-4 h-4 text-teal-600" />;
      case 'reparations': return <Wrench className="w-4 h-4 text-orange-600" />;
      case 'securite': return <ShieldCheck className="w-4 h-4 text-indigo-600" />;
      case 'maintenance': return <FileText className="w-4 h-4 text-indigo-600" />;
      default: return <HelpCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getLocalizedCategoryName = (cat: Expense['category']) => {
    const maps: Record<Expense['category'], { fr: string, ar: string }> = {
      ascenseur: { fr: "Moteur & Cabine", ar: "أشغال المصعد" },
      nettoyage: { fr: "Nettoyage commun", ar: "النظافة والصيانة" },
      electricite: { fr: "Électricité", ar: "الكهرباء" },
      plomberie: { fr: "Plomberie & Pompe", ar: "الترصيص والمياه" },
      reparations: { fr: "Réparations", ar: "إصلاحات عامة" },
      securite: { fr: "Sécurité", ar: "الأمن والحراسة" },
      maintenance: { fr: "Contrôle technique", ar: "صيانة دورية" },
      autres: { fr: "Autres frais", ar: "مصاريف أخرى" },
    };
    return isRtl ? maps[cat].ar : maps[cat].fr;
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !titleFr.trim() || !titleAr.trim() || !provider.trim()) {
      alert(isRtl ? "يرجى تعبئة الحقول الأساسية" : "Veuillez remplir les informations requises.");
      return;
    }

    const defaultReceipt = receiptUrl || "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400";

    onAddExpense({
      amount,
      category,
      date: new Date().toISOString().split('T')[0],
      titleFr,
      titleAr,
      descriptionFr: descFr,
      descriptionAr: descAr,
      approvedBy: role === 'treasurer' ? "Trésorier Amine" : "Admin Sid Ahmed",
      provider,
      receiptUrl: defaultReceipt
    });

    setShowForm(false);
    // Reset forms
    setAmount(1500);
    setTitleFr("");
    setTitleAr("");
    setDescFr("");
    setDescAr("");
    setProvider("");
  };

  const simulateReceiptUrl = () => {
    const randomReceipts = [
      "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400", // desk invoice
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400", // supplies
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400", // technician
      "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=400", // lamps
    ];
    const picked = randomReceipts[Math.floor(Math.random() * randomReceipts.length)];
    setReceiptUrl(picked);
    alert(isRtl ? "تمت محاكاة تصوير الفاتورة وربط الملف بنجاح!" : "Simulé : Facture photographiée et rattachée avec succès !");
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Upper Registry Board */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.expenseTitle}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRtl ? "سجل مصاريف صيانة عمارة 31 المقتطعة تلقائياً لمزيد من الشفافية متاح للجميع" : "Suivi transparent des dépenses réalisées avec les fonds du Bloc"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-amber-50 px-4 py-2 rounded-2xl border border-amber-100 font-mono text-center">
              <span className="text-[10px] text-amber-800 uppercase font-black block tracking-wider">{isRtl ? "إجمالي النفقات" : "Total Dépensé"}</span>
              <span className="text-lg font-black text-amber-900">{totalSpent.toLocaleString()} DZD</span>
            </div>

            {role !== 'resident' && (
              <button 
                onClick={() => setShowForm(!showForm)}
                className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addExpense}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Creation form */}
      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold pb-2 border-b border-gray-100 text-gray-900 flex items-center gap-1.5">
            <TrendingDown className="w-5 h-5 text-red-500" />
            <span>{t.addExpense}</span>
          </h3>

          <form onSubmit={handleCreate} className="space-y-4 text-xs font-sans text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Montant Exigé (DZD) *</label>
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-red-500 font-mono font-bold text-base text-red-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catégorie des travaux *</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Expense['category'])}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans cursor-pointer text-xs"
                >
                  <option value="ascenseur">{isRtl ? "صيانة المصعد" : "Ascenseur & Évateur"}</option>
                  <option value="nettoyage">{isRtl ? "مواد أو عمال النظافة" : "Nettoyage & Propreté"}</option>
                  <option value="electricite">{isRtl ? "أدوات كهرباء" : "Électricité commune"}</option>
                  <option value="plomberie">{isRtl ? "مضخة مياه وترصيص" : "Plomberie & Pompe"}</option>
                  <option value="reparations">{isRtl ? "تصليح أضرار عامة" : "Réparations"}</option>
                  <option value="securite">{isRtl ? "أنظمة حراسة وأمن" : "Sécurité"}</option>
                  <option value="maintenance">{isRtl ? "زيارة دورية مهندس" : "Entretien technique"}</option>
                  <option value="autres">{isRtl ? "غير مصنف" : "Autres imprévus"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{t.provider} *</label>
                <input 
                  type="text" 
                  placeholder="ex: Sarl Freedom Oran / Plombier"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans"
                  required
                />
              </div>
            </div>

            {/* Translation inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titre de l'achat (Français) *</label>
                <input 
                  type="text" 
                  placeholder="ex: Achat de 10 néons d'escalier"
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">بيان المشتريات (بالعربية) *</label>
                <input 
                  type="text" 
                  placeholder="مثال: شراء كابل ومستلزمات كهربائية للممر"
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-right"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description détaillée (Français)</label>
                <textarea 
                  value={descFr}
                  onChange={(e) => setDescFr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans h-16"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">الوصف التفصيلي (بالعربية)</label>
                <textarea 
                  value={descAr}
                  onChange={(e) => setDescAr(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-right h-16"
                />
              </div>
            </div>

            {/* Receipt simulation */}
            <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-bold text-gray-800">{t.receiptImage}</div>
                  <div className="text-[10px] text-gray-400">{isRtl ? "يمكنك تصوير الفاتورة بهاتفك" : "Photographiez le reçu fiscal papier"}</div>
                </div>
              </div>
              <button 
                type="button"
                onClick={simulateReceiptUrl}
                className="px-3.5 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl text-xs cursor-pointer flex items-center gap-1"
              >
                <span>{isRtl ? "التقاط صورة" : "Scanner"}</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-red-500 hover:bg-red-650 text-white font-extrabold rounded-xl text-xs cursor-pointer flex items-center gap-1 shadow-sm shadow-red-500/10"
              >
                <Check className="w-4 h-4" />
                <span>{t.add}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Itemized ledger feed of expenditures */}
      <div className="space-y-3">
        {expenses.map((exp) => (
          <div 
            key={exp.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs hover:shadow-xs transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-3.5">
              {/* Category Circle icon */}
              <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center shrink-0 border border-gray-100 shadow-2xs">
                {getCategoryIcon(exp.category)}
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-450 text-gray-400 font-mono">
                  <span className="bg-gray-100 px-2 py-0.5 rounded-lg text-[10px] font-bold font-sans text-gray-650 text-gray-600">
                    {getLocalizedCategoryName(exp.category)}
                  </span>
                  <span>•</span>
                  <span>{exp.date}</span>
                  <span>•</span>
                  <span>{isRtl ? "الشركة:" : "Tiers:"} {exp.provider}</span>
                </div>

                <h4 className="text-base font-bold text-gray-905 text-gray-900 leading-snug">
                  {isRtl ? exp.titleAr : exp.titleFr}
                </h4>

                {(isRtl ? exp.descriptionAr : exp.descriptionFr) && (
                  <p className="text-xs text-gray-500 font-sans max-w-xl">
                    {isRtl ? exp.descriptionAr : exp.descriptionFr}
                  </p>
                )}

                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans tracking-wide">
                  <span>{t.approvedBy}: <strong className="font-semibold text-gray-550 text-gray-500">{exp.approvedBy}</strong></span>
                </div>
              </div>
            </div>

            {/* Price section */}
            <div className="flex items-center gap-3.5 self-end md:self-center font-mono shrink-0">
              <span className="text-xl font-black text-red-500">
                -{exp.amount.toLocaleString()} <span className="text-xs font-bold font-sans text-gray-450 text-gray-400">DZD</span>
              </span>

              {exp.receiptUrl && (
                <a 
                  href={exp.receiptUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="p-2 text-gray-400 hover:text-emerald-700 bg-gray-50 border border-gray-100 rounded-xl transition-all cursor-pointer shadow-3xs"
                  title="Voir la Facture photographiée"
                >
                  <Eye className="w-4 h-4" />
                </a>
              )}

              {role !== 'resident' && (
                <button 
                  onClick={() => {
                    if (confirm(isRtl ? "هل تريد إلغاء وإلغاء تسجيل هذه النفقة؟" : "Voulez-vous supprimer cette écriture de dépense ?")) {
                      onDeleteExpense(exp.id);
                    }
                  }}
                  className="p-2 text-gray-300 hover:text-red-650 hover:bg-red-50 rounded-xl transition-all cursor-pointer hover:text-red-600"
                  title="Annuler dépense"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}

        {expenses.length === 0 && (
          <div className="text-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
            <TrendingDown className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">{isRtl ? "لا توجد مصاريف معلنة بعد" : "Aucune dépense enregistrée dans la caisse."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
