import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, DocumentFile } from '../types';
import { FileText, Plus, ShieldAlert, Award, Calendar, FolderOpen, ArrowDownToLine, Check } from 'lucide-react';

interface DocumentsProps {
  lang: Lang;
  role: UserRole;
  documents: DocumentFile[];
  onAddDocument: (doc: Omit<DocumentFile, 'id' | 'uploadDate'>) => void;
}

export default function Documents({
  lang,
  role,
  documents,
  onAddDocument
}: DocumentsProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [category, setCategory] = useState<DocumentFile['category']>("reglement");
  const [showForm, setShowForm] = useState(false);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFr.trim() || !titleAr.trim()) {
      alert(isRtl ? "يرجى تعبئة عناوين الملف" : "Veuillez insérer un titre descriptif.");
      return;
    }

    onAddDocument({
      titleFr,
      titleAr,
      category,
      fileSize: "320 KB"
    });

    setShowForm(false);
    setTitleFr("");
    setTitleAr("");
  };

  const getCategoryTheme = (cat: DocumentFile['category']) => {
    switch (cat) {
      case 'reglement': return 'bg-purple-50 text-purple-700 border-purple-150';
      case 'contrat': return 'bg-blue-55 bg-blue-50 text-blue-700 border-blue-150';
      default: return 'bg-amber-50 text-amber-700 border-amber-150';
    }
  };

  const getCategoryLabel = (cat: DocumentFile['category']) => {
    const maps: Record<DocumentFile['category'], { fr: string, ar: string }> = {
      reglement: { fr: "Règlement intérieur", ar: "القانون الداخلي" },
      contrat: { fr: "Contrats & Maintenance", ar: "عقود الصيانة والضمان" },
      facture: { fr: "Factures et Comptes-Rendus", ar: "فواتير ومحاضر الاجتماعات" },
      compte_rendu: { fr: "Rapports d'assemblées", ar: "محاضر وتقارير دورية" }
    };
    return isRtl ? maps[cat].ar : maps[cat].fr;
  };

  const downloadSimulatedFile = (doc: DocumentFile) => {
    alert(isRtl 
      ? `تحميل مستند "${isRtl ? doc.titleAr : doc.titleFr}" بصيغة PDF بنجاح!` 
      : `Téléchargement du document "${doc.titleFr}" au format PDF réussi !`
    );
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search and Action bar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.documentTitle}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRtl ? "القوانين الداخلية لعمارة 31، محاضر الاجتماعات السنوية، والتقارير المالية المنجزة" : "Coffre-fort numérique contenant le règlement de copropriété et les factures de maintenance"}
            </p>
          </div>

          {role !== 'resident' && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.uploadDoc}</span>
            </button>
          )}
        </div>
      </div>

      {/* Upload document simulation panel */}
      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-xl space-y-4">
          <h3 className="text-sm font-extrabold pb-2 border-b border-gray-100 text-gray-950 flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-emerald-600" />
            <span>{t.uploadDoc}</span>
          </h3>

          <form onSubmit={handleUpload} className="space-y-4 text-xs font-sans text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catégorie du document</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as DocumentFile['category'])}
                  className="w-full p-2.5 rounded-xl border border-gray-250 focus:outline-none focus:border-emerald-500 bg-white text-xs cursor-pointer"
                >
                  <option value="reglement">Règlement intérieur</option>
                  <option value="contrat">Contrat d'assurance ou entretien</option>
                  <option value="facture">Reçu de dépôt fiscal ou facture</option>
                  <option value="compte_rendu">Procès-verbal de réunion</option>
                </select>
              </div>
            </div>

            {/* Localized inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Description (Français) *</label>
                <input 
                  type="text" 
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  placeholder="ex: Règlement intérieur de l'immeuble"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">وصف الملف (بالعربية) *</label>
                <input 
                  type="text" 
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: القانون الأساسي لسكان العمارة"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 text-right text-xs"
                  required
                />
              </div>
            </div>

            {/* Standard drag and drop zone style simulation */}
            <div className="border-2 border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400 hover:border-emerald-500 hover:bg-emerald-50/10 cursor-pointer">
              <FileText className="w-8 h-8 mx-auto mb-1 text-gray-300" />
              <p className="text-xs font-bold text-gray-500">{isRtl ? "اضغط لربط الملف أو سحبه هنا" : "Glisser-déposer le fichier PDF de l'acte technique ici"}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">PDF, PNG, JPG (Max 5MB)</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs cursor-pointer"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs cursor-pointer flex items-center gap-1.5 shadow-sm shadow-emerald-500/10"
              >
                <Check className="w-4 h-4" />
                <span>{isRtl ? "حفظ الملف بالصندوق" : "Enregistrer"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Grid listing files */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div 
            key={doc.id}
            className="bg-white p-5 rounded-3xl border border-gray-100 hover:border-emerald-100 transition-colors flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-gray-400" />
              </div>
              
              <div>
                <span className={`px-2 py-0.5 border text-[9px] font-bold rounded-lg tracking-wide uppercase font-sans ${getCategoryTheme(doc.category)}`}>
                  {getCategoryLabel(doc.category)}
                </span>
                <h4 className="text-sm font-bold text-gray-900 mt-1 leading-tight">
                  {isRtl ? doc.titleAr : doc.titleFr}
                </h4>
                <span className="text-[10px] text-gray-400 font-mono mt-0.5 block">
                  {doc.fileSize} • {isRtl ? "مرفوع بتاريخ" : "Ajouté le"}: {doc.uploadDate}
                </span>
              </div>
            </div>

            <button 
              onClick={() => downloadSimulatedFile(doc)}
              className="p-2.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 border border-gray-100 rounded-xl transition-all cursor-pointer shadow-3xs"
              title={isRtl ? "تحميل الملف" : "Télécharger PDF"}
            >
              <ArrowDownToLine className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Public Guidelines box */}
      <div className="bg-amber-50/20 p-5 rounded-3xl border border-amber-100 flex items-start gap-4">
        <Award className="w-5 h-5 mt-0.5 text-amber-600 shrink-0" />
        <div className="space-y-1 text-xs">
          <h4 className="font-extrabold text-amber-900">{t.docRules}</h4>
          <p className="text-gray-600 font-sans leading-relaxed">
            {isRtl 
              ? "يُرجى من كافة جيران عمارة 31 المحترمين الحفاظ على نظافة المصعد المشترك وعديد المسارات الملحقة، والتكفل بالمساهمة الزمنية لـ 500 دج شهرياً قبل تاريخ 10 من كل شهر." 
              : "Le respect mutuel et le versement mensuel à date de la redevance syndicale de 500 DZD garantissent le maintien permanent de notre ascenseur en parfait état de salubrité."}
          </p>
        </div>
      </div>
    </div>
  );
}
