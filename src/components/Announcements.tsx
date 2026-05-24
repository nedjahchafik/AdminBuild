import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Announcement } from '../types';
import { Megaphone, Plus, Calendar, User, Share2, Clipboard, Check, HeartHandshake } from 'lucide-react';

interface AnnouncementsProps {
  lang: Lang;
  role: UserRole;
  announcements: Announcement[];
  onAddAnnouncement: (titleFr: string, titleAr: string, contentFr: string, contentAr: string, category: Announcement['category']) => void;
}

export default function Announcements({
  lang,
  role,
  announcements,
  onAddAnnouncement
}: AnnouncementsProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [showForm, setShowForm] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New item state
  const [titleFr, setTitleFr] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [contentFr, setContentFr] = useState("");
  const [contentAr, setContentAr] = useState("");
  const [category, setCategory] = useState<Announcement['category']>("info");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleFr.trim() || !titleAr.trim() || !contentFr.trim() || !contentAr.trim()) {
      alert(isRtl ? "يرجى ملأ جميع تفاصيل الحقول للإعلان" : "Veuillez remplir les informations de l'annonce dans les deux langues.");
      return;
    }
    onAddAnnouncement(titleFr, titleAr, contentFr, contentAr, category);
    setShowForm(false);
    // Reset
    setTitleFr("");
    setTitleAr("");
    setContentFr("");
    setContentAr("");
    setCategory("info");
  };

  const getCategoryTheme = (cat: Announcement['category']) => {
    switch (cat) {
      case 'urgence': return 'bg-red-50/80 text-red-700 border-red-100';
      case 'travaux': return 'bg-amber-50/80 text-amber-700 border-amber-100';
      case 'reunion': return 'bg-blue-50/80 text-blue-700 border-blue-100';
      default: return 'bg-emerald-50/80 text-emerald-700 border-emerald-105';
    }
  };

  const getCategoryLabel = (cat: Announcement['category']) => {
    const labels: Record<Announcement['category'], { fr: string, ar: string }> = {
      urgence: { fr: "🚨 Urgent", ar: "🚨 تنبيه طارئ" },
      travaux: { fr: "⚙️ Travaux", ar: "⚙️ أشغال صيانة" },
      reunion: { fr: "👥 Réunion", ar: "👥 اجتماع" },
      info: { fr: "ℹ️ Information", ar: "ℹ️ إشعار عام" }
    };
    return isRtl ? labels[cat].ar : labels[cat].fr;
  };

  // Prepares a unified WhatsApp sharing template block
  const shareToWhatsApp = (ann: Announcement) => {
    const blocHeader = isRtl 
      ? `📢 إعلان هام • عمارة 31 (وهران)`
      : `📢 ANNONCE COPROPRIÉTÉ • BLOC 31 (Oran)`;
    
    const bodyText = isRtl 
      ? `\n📌 الموضوع: *${ann.titleAr}*\n\n${ann.contentAr}\n\n🙏 شكراً لتعاونكم - لجنة تسيير العمارة`
      : `\n📌 Objet: *${ann.titleFr}*\n\n${ann.contentFr}\n\n🙏 Merci d'avance pour votre collaboration.`;

    const fullMessage = `${blocHeader}\n${bodyText}`;
    const encoded = encodeURIComponent(fullMessage);
    
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  const handleCopy = (ann: Announcement) => {
    const textToCopy = isRtl 
      ? `📢 عمارة 31 - ${ann.titleAr}\n\n${ann.contentAr}\n\nتاريخ الإعلان: ${ann.date}`
      : `📢 Bloc 31 - ${ann.titleFr}\n\n${ann.contentFr}\n\nPublié le: ${ann.date}`;
    
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopiedId(ann.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search Header and Action toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.announcementList}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRtl ? "لوحة الإعلانات الرسمية للعمارة والتنسيق مع الساكنين" : "Tableau d'affichage général pour la communication interne du Bloc31"}
            </p>
          </div>

          {role !== 'resident' && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addAnnouncement}</span>
            </button>
          )}
        </div>
      </div>

      {/* Adding Notice modal */}
      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 pb-2 border-b border-gray-50 flex items-center gap-1.5">
            <Megaphone className="w-5 h-5 text-emerald-600" />
            <span>{t.addAnnouncement}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catégorie *</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Announcement['category'])}
                  className="w-full p-2.5 rounded-xl border border-gray-250 focus:outline-none focus:border-emerald-500 bg-white cursor-pointer"
                >
                  <option value="info">Informations générales</option>
                  <option value="travaux">Travaux de maintenance</option>
                  <option value="urgence">Alerte urgente</option>
                  <option value="reunion">Invitation réunion</option>
                </select>
              </div>
            </div>

            {/* Translation values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Titre (Français) *</label>
                <input 
                  type="text" 
                  value={titleFr}
                  onChange={(e) => setTitleFr(e.target.value)}
                  placeholder="ex: Coupure d'eau programmée"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">بيان الإعلان (بالعربية) *</label>
                <input 
                  type="text" 
                  value={titleAr}
                  onChange={(e) => setTitleAr(e.target.value)}
                  placeholder="مثال: قطع مبرمج للمياه"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-right text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contenu explicatif (Français) *</label>
                <textarea 
                  value={contentFr}
                  onChange={(e) => setContentFr(e.target.value)}
                  placeholder="Détails, horaires, consignes..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans h-24 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">نص الإعلان بالتفصيل (بالعربية) *</label>
                <textarea 
                  value={contentAr}
                  onChange={(e) => setContentAr(e.target.value)}
                  placeholder="التفاصيل، المواعيد، الإرشادات..."
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-right h-24 text-xs"
                  required
                />
              </div>
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
                <span>{isRtl ? "نشر الإعلان" : "Publier l'Annonce"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main vertical announcement cards */}
      <div className="space-y-4">
        {announcements.map((ann) => (
          <div 
            key={ann.id}
            className="bg-white rounded-3xl p-5 border border-gray-100 shadow-xs space-y-3 hover:border-emerald-50 transition-colors"
          >
            <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryTheme(ann.category)}`}>
                {getCategoryLabel(ann.category)}
              </span>

              <div className="flex items-center gap-3 text-gray-400 font-mono text-[10px]">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {ann.date}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {ann.author}
                </span>
              </div>
            </div>

            <h3 className="text-base font-extrabold text-gray-900 leading-tight">
              {isRtl ? ann.titleAr : ann.titleFr}
            </h3>

            <p className="text-xs text-gray-600 leading-relaxed font-sans bg-gray-50/20 p-4 rounded-2xl whitespace-pre-line border border-gray-100">
              {isRtl ? ann.contentAr : ann.contentFr}
            </p>

            {/* Actions panel: Share draft on WhatsApp / Copy text representation */}
            <div className="flex justify-end gap-2 pt-2 border-t border-gray-50">
              <button 
                onClick={() => handleCopy(ann)}
                className="px-3.5 py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-[10px] text-gray-700 font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-3xs"
              >
                {copiedId === ann.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">{t.copySuccess}</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5 text-gray-400" />
                    <span>{isRtl ? "نسخ الإعلان" : "Copier le texte"}</span>
                  </>
                )}
              </button>

              <button 
                onClick={() => shareToWhatsApp(ann)}
                className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-[10px] text-white font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-green-500/10"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{isRtl ? "مشاركة في مجموعة واتساب" : "Partager sur WhatsApp"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
