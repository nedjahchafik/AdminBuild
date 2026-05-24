import React from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Apartment, MonthCycle, ExtraContribution, Expense, Announcement } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Megaphone, 
  Users, 
  ArrowUpRight, 
  PhoneCall, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Eye 
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardProps {
  lang: Lang;
  role: UserRole;
  apartments: Apartment[];
  months: MonthCycle[];
  extras: ExtraContribution[];
  expenses: Expense[];
  announcements: Announcement[];
  onNavigate: (tab: string) => void;
  cashBalance: number;
}

export default function Dashboard({
  lang,
  role,
  apartments,
  months,
  extras,
  expenses,
  announcements,
  onNavigate,
  cashBalance
}: DashboardProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  // Calculate stats dynamically
  const currentMonthId = "2026-05";
  const currentMonthCycle = months.find(m => m.id === currentMonthId);
  
  // Total apartments occupied (excluding guard at #40)
  const occupiedCount = apartments.filter(a => !a.resident.isVacant).length;

  // Monthly collected
  let monthlyCollected = 0;
  let monthlyUnpaidCount = 0;
  if (currentMonthCycle) {
    currentMonthCycle.payments.forEach(p => {
      // Skip guard apartment payments (non-existent/empty)
      if (p.apartmentNumber === 40) return;
      if (p.isPaid) {
        monthlyCollected += currentMonthCycle.baseAmount;
      } else {
        const apt = apartments.find(a => a.number === p.apartmentNumber);
        if (apt && !apt.resident.isVacant) {
          monthlyUnpaidCount++;
        }
      }
    });
  }

  // Active elevator check
  const elevatorActive = true; 

  const latestAnns = announcements.slice(0, 2);

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header Building ID card */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-700/50">
        <div className="absolute top-0 right-0 -tr-y-4 -tr-x-4 w-40 h-40 bg-emerald-600/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-mint-500/10 rounded-full blur-xl animate-pulse"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-600/35 rounded-full text-xs font-mono tracking-wide text-emerald-200 mb-3 border border-emerald-500/20">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isRtl ? "AADL وهران • عمارة 31" : "AADL Oran • Bloc 31"}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {t.appName}
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-md font-sans leading-relaxed opacity-95">
              {t.location}
            </p>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1.5 font-mono text-xs text-emerald-200/90 bg-emerald-900/40 p-3 rounded-2xl border border-emerald-700/30">
            <div>UTC: 2026-05-24 14:37:28</div>
            <div className="flex items-center gap-1.5 mt-1 font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{isRtl ? "النظام نشط ومتصل" : "Système actif & synchronisé"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Key Numerical Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Cash balance widget */}
        <motion.div 
          whileHover={{ translateY: -3 }}
          className="bg-white border border-gray-100 dark:border-gray-800/40 p-5 rounded-3xl shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">{t.cashBalance}</span>
            <span className="text-2xl md:text-3xl font-black text-emerald-600 font-mono">
              {cashBalance.toLocaleString()} <span className="text-sm font-bold text-gray-500">DZD</span>
            </span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-500" />
              <span>{isRtl ? "مستقر ومحدث تلقائياً" : "Solde net de trésorerie"}</span>
            </span>
          </div>
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Amount raised this month */}
        <motion.div 
          whileHover={{ translateY: -3 }}
          className="bg-white border border-gray-100 dark:border-gray-800/40 p-5 rounded-3xl shadow-sm flex items-center justify-between"
        >
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">{t.monthlyCollected}</span>
            <span className="text-2xl md:text-3xl font-black text-blue-600 font-mono">
              {monthlyCollected.toLocaleString()} <span className="text-sm font-bold text-gray-400">DZD</span>
            </span>
            <span className="text-xs text-gray-500">
              {isRtl ? `شغل شهرياً 500 دج للشقة` : `Cycle: ${currentMonthCycle?.nameFr || "Mai 2026"}`}
            </span>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </motion.div>

        {/* Unpaid apartments count */}
        <motion.div 
          whileHover={{ translateY: -3 }}
          className="bg-white border border-gray-100 p-5 rounded-3xl shadow-sm flex items-center justify-between"
          onClick={() => onNavigate('cotisations')}
        >
          <div className="space-y-1 cursor-pointer">
            <span className="text-xs font-semibold text-gray-400 block uppercase tracking-wider">{t.monthlyUnpaid}</span>
            <span className="text-2xl md:text-3xl font-black text-red-500 font-mono">
              {monthlyUnpaidCount} <span className="text-sm font-bold text-gray-400">/{occupiedCount}</span>
            </span>
            <span className="text-xs text-red-500 underline flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{isRtl ? "اضغط لعرض المتأخرين والمتابعة" : "Cliquer pour relancer"}</span>
            </span>
          </div>
          <div className="p-4 bg-red-50 text-red-500 rounded-2xl">
            <Users className="w-6 h-6" />
          </div>
        </motion.div>
      </div>

      {/* Building Status Alerts Panel */}
      <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200/50">
        <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-1.5 uppercase tracking-wide">
          <Activity className="w-4 h-4 text-emerald-600" />
          <span>{isRtl ? "مراقبة الأنظمة المشتركة بالعمارة" : "Moniteurs techniques & Alerte Bloc"}</span>
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Elevator Monitor */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-center gap-3">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping shrink-0"></div>
            <div className="flex-1">
              <div className="text-xs text-gray-400 font-bold">{t.elevatorStatus}</div>
              <div className="text-sm font-semibold text-gray-800">
                {elevatorActive ? t.elevatorRunning : t.elevatorDown}
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold font-sans">
              OK 9/9
            </span>
          </div>

          {/* Emergency SOS simulation buttons */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-gray-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-red-105 flex items-center justify-center text-red-600 font-bold shrink-0">
                ⚠️
              </div>
              <div>
                <div className="text-sm font-bold text-gray-800">{isRtl ? "وضعية الإنذار" : "Alerte Urgence"}</div>
                <div className="text-xs text-gray-500">{isRtl ? "مشاركة تنبيه سريع للأعطال الكبيرة" : "Simuler avis d'alerte générale"}</div>
              </div>
            </div>
            <button 
              onClick={() => {
                alert(isRtl ? "تم إرسال تنبيه عاجل لجميع الهواتف المسجلة بمجموعة واتساب!" : "Avis d'urgence envoyé à l'ensemble du groupe de l'immeuble pour coupure d'eau!");
              }}
              className="px-3.5 py-1.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl text-xs cursor-pointer"
            >
              {isRtl ? "تنبيه سريع" : "Lancer"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Dashboard Content Area: Two Columns (Announcements & Quick Shortcuts) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Latest Announcements Board */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-gray-900">{t.latestAnnouncements}</h3>
            </div>
            <button 
              onClick={() => onNavigate('announcements')}
              className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{isRtl ? "عرض الكل" : "Voir Tout"}</span>
              <ArrowUpRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-4">
            {latestAnns.map((ann) => (
              <div 
                key={ann.id}
                className="p-4 rounded-2xl bg-gray-50 hover:bg-emerald-50/20 transition-colors border-l-4 border-emerald-500 space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {ann.category === 'urgence' ? (isRtl ? 'هام جداً' : 'Urgent') : (ann.category === 'travaux' ? (isRtl ? 'أشغال' : 'Travaux') : (isRtl ? 'إشعار' : 'Avis'))}
                  </span>
                  <span className="text-gray-400 font-mono text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {ann.date}
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-gray-800">
                  {isRtl ? ann.titleAr : ann.titleFr}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed font-sans">
                  {isRtl ? ann.contentAr : ann.contentFr}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Administrator Shortcuts / Info */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-1.5">
              <span>{t.quickShortcuts}</span>
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              {isRtl ? "تسهيل الوصول للمهام الأكثر تكراراً لتسيير عمارة 31" : "Optimiser la rentabilité de la collecte"}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => onNavigate('cotisations')}
              className="p-4 rounded-2xl bg-gradient-to-tr from-emerald-50 to-emerald-100/50 border border-emerald-100 flex flex-col items-center justify-center text-center gap-2 hover:bg-emerald-50 transition-all cursor-pointer group"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-emerald-950">{isRtl ? "دفع الاشتراكات" : "Valider Cotisations"}</span>
            </button>

            <button 
              onClick={() => onNavigate('apartments')}
              className="p-4 rounded-2xl bg-gradient-to-tr from-blue-50 to-blue-105/50 border border-blue-100 flex flex-col items-center justify-center text-center gap-2 hover:bg-blue-50 transition-all cursor-pointer group"
            >
              <Users className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-blue-950">{isRtl ? "تعديل الساكنين" : "Gérer Occupants"}</span>
            </button>

            <button 
              onClick={() => onNavigate('expenses')}
              className="p-4 rounded-2xl bg-gradient-to-tr from-amber-50 to-amber-100/50 border border-amber-100 flex flex-col items-center justify-center text-center gap-2 hover:bg-amber-50 transition-all cursor-pointer group"
            >
              <TrendingDown className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-amber-950">{isRtl ? "تسجيل مصروف" : "Ajouter Dépense"}</span>
            </button>

            <button 
              onClick={() => onNavigate('reports')}
              className="p-4 rounded-2xl bg-gradient-to-tr from-purple-50 to-purple-100/50 border border-purple-100 flex flex-col items-center justify-center text-center gap-2 hover:bg-purple-50 transition-all cursor-pointer group"
            >
              <FileText className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-purple-950">{isRtl ? "الشفافية والمالية" : "Rapports & Balance"}</span>
            </button>
          </div>

          {/* Rapid Elder / Guard Contacts sheet */}
          <div className="bg-gray-50 p-3.5 rounded-2xl space-y-2 border border-gray-100">
            <div className="text-xs font-bold text-gray-500 flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-600" />
              <span>{isRtl ? "أرقام التدخل والاستعجال" : "Numéros utiles de secours"}</span>
            </div>
            
            <div className="space-y-1.5 text-xs text-gray-700">
              <div className="flex justify-between items-center bg-white p-2 rounded-xl">
                <span className="font-semibold text-gray-800">{isRtl ? "صيانة المصعد (فلان)" : "Sarl Freedom (Ascenseur)"}</span>
                <a href="tel:0555881122" className="text-emerald-700 font-mono font-bold hover:underline">0555 881 122</a>
              </div>
              <div className="flex justify-between items-center bg-white p-2 rounded-xl">
                <span className="font-semibold text-gray-800">{isRtl ? "مندوب العمارة (سيد أحمد)" : "Syndic Adjoint (Sid Ahmed)"}</span>
                <a href="tel:0550123456" className="text-emerald-700 font-mono font-bold hover:underline">0550 123 456</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
