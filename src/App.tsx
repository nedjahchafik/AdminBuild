import React, { useState, useEffect } from 'react';
import { Lang, UserRole, Apartment, MonthCycle, ExtraContribution, Expense, Announcement, Incident, MaintenanceRecord, DocumentFile } from './types';
import { useTranslation } from './translations';
import { 
  INITIAL_APARTMENTS, 
  INITIAL_MONTHS, 
  INITIAL_EXTRA, 
  INITIAL_EXPENSES, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_INCIDENTS, 
  INITIAL_MAINTENANCE, 
  INITIAL_DOCUMENTS,
  computeInitialCash 
} from './data/initialData';

// Subcomponents
import Dashboard from './components/Dashboard';
import ApartmentsList from './components/ApartmentsList';
import MonthlyCotisations from './components/MonthlyCotisations';
import ExtraCotisations from './components/ExtraCotisations';
import Expenses from './components/Expenses';
import Reports from './components/Reports';
import Announcements from './components/Announcements';
import Incidents from './components/Incidents';
import MaintenanceHistory from './components/MaintenanceHistory';
import Documents from './components/Documents';

// Icons
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Coins, 
  FilePieChart, 
  Megaphone, 
  AlertTriangle, 
  History, 
  FolderLock, 
  Fingerprint, 
  Globe2,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'motion/react';

export default function App() {
  // Localization & Persona roles
  const [lang, setLang] = useState<Lang>('fr');
  const [role, setRole] = useState<UserRole>('admin');

  // Interactive local states, read initially from localStorage if existing
  const [apartments, setApartments] = useState<Apartment[]>(() => {
    const cached = localStorage.getItem('bloc31_apartments');
    return cached ? JSON.parse(cached) : INITIAL_APARTMENTS;
  });

  const [months, setMonths] = useState<MonthCycle[]>(() => {
    const cached = localStorage.getItem('bloc31_months');
    return cached ? JSON.parse(cached) : INITIAL_MONTHS;
  });

  const [extras, setExtras] = useState<ExtraContribution[]>(() => {
    const cached = localStorage.getItem('bloc31_extras');
    return cached ? JSON.parse(cached) : INITIAL_EXTRA;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const cached = localStorage.getItem('bloc31_expenses');
    return cached ? JSON.parse(cached) : INITIAL_EXPENSES;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const cached = localStorage.getItem('bloc31_announcements');
    return cached ? JSON.parse(cached) : INITIAL_ANNOUNCEMENTS;
  });

  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const cached = localStorage.getItem('bloc31_incidents');
    return cached ? JSON.parse(cached) : INITIAL_INCIDENTS;
  });

  const [maintenanceLog, setMaintenanceLog] = useState<MaintenanceRecord[]>(() => {
    const cached = localStorage.getItem('bloc31_maintenance');
    return cached ? JSON.parse(cached) : INITIAL_MAINTENANCE;
  });

  const [documents, setDocuments] = useState<DocumentFile[]>(() => {
    const cached = localStorage.getItem('bloc31_documents');
    return cached ? JSON.parse(cached) : INITIAL_DOCUMENTS;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('bloc31_apartments', JSON.stringify(apartments));
  }, [apartments]);

  useEffect(() => {
    localStorage.setItem('bloc31_months', JSON.stringify(months));
  }, [months]);

  useEffect(() => {
    localStorage.setItem('bloc31_extras', JSON.stringify(extras));
  }, [extras]);

  useEffect(() => {
    localStorage.setItem('bloc31_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('bloc31_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('bloc31_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('bloc31_maintenance', JSON.stringify(maintenanceLog));
  }, [maintenanceLog]);

  useEffect(() => {
    localStorage.setItem('bloc31_documents', JSON.stringify(documents));
  }, [documents]);

  // Adjust DOM direction for elegant Right-To-Left layout supports
  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  // DYNAMIC CASH CALCULATOR ENGINE
  // Base Starting reserve = 85000 DZD
  // Plus payments collected
  // Plus extra contributions paid
  // Minus expenses declared
  const cashBalance = React.useMemo(() => {
    const startingReserve = 85000;
    
    // Sum standard monthly cotisations where isPaid is true (skip guard 40)
    let standardMonthlyPaid = 0;
    months.forEach((cycle) => {
      cycle.payments.forEach((payment) => {
        if (payment.apartmentNumber === 40) return;
        if (payment.isPaid) {
          standardMonthlyPaid += cycle.baseAmount; // 500 DZD
        }
      });
    });

    // Sum exceptional raises
    let extraPaid = 0;
    extras.forEach((extra) => {
      extra.payments.forEach((payment) => {
        extraPaid += payment.amountPaid;
      });
    });

    // Substract expenses
    const expenditures = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return startingReserve + standardMonthlyPaid + extraPaid - expenditures;
  }, [months, extras, expenses]);

  // RECONCILE STATE HANDLERS
  // 1. Update Resident occupants
  const handleUpdateApartment = (
    apartmentNumber: number,
    updatedData: { name: string; phone: string; isOwner: boolean; isVacant: boolean }
  ) => {
    setApartments((prev) => 
      prev.map((apt) => 
        apt.number === apartmentNumber 
          ? { ...apt, resident: { ...apt.resident, ...updatedData } } 
          : apt
      )
    );
  };

  // 2. Validate Monthly Cotisation pay state
  const handleTogglePayment = (
    monthId: string,
    apartmentNumber: number,
    isPaid: boolean,
    date?: string,
    note?: string,
    isLate?: boolean,
    isPaidLate?: boolean
  ) => {
    setMonths((prev) => 
      prev.map((m) => {
        if (m.id !== monthId) return m;

        const isExisting = m.payments.some((p) => p.apartmentNumber === apartmentNumber);
        const paymentsList = isExisting
          ? m.payments.map((p) => 
              p.apartmentNumber === apartmentNumber
                ? { 
                    ...p, 
                    isPaid, 
                    paymentDate: date, 
                    note, 
                    isLate, 
                    isPaidLate, 
                    collectedBy: isPaid ? "Amine (Trésorier)" : undefined 
                  }
                : p
            )
          : [...m.payments, { 
              apartmentNumber, 
              isPaid, 
              paymentDate: date, 
              note, 
              isLate, 
              isPaidLate, 
              collectedBy: isPaid ? "Amine (Trésorier)" : undefined 
            }];

        return { ...m, payments: paymentsList };
      })
    );
  };

  // 2b. Add a new month-cycle of any year
  const handleAddMonthCycle = (year: number, month: number, baseAmount: number) => {
    const monthId = `${year}-${String(month).padStart(2, '0')}`;
    const exists = months.some(m => m.id === monthId);
    if (exists) {
      alert(lang === 'ar' ? "هذا الشهر مسجل بالفعل!" : "Ce cycle d'exercice mensuel existe déjà !");
      return;
    }

    const monthNamesFr = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const monthNamesAr = ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

    const nameFr = `${monthNamesFr[month - 1]} ${year}`;
    const nameAr = `${monthNamesAr[month - 1]} ${year}`;

    const newCycle: MonthCycle = {
      id: monthId,
      nameFr,
      nameAr,
      baseAmount,
      payments: apartments.map(apt => ({
        apartmentNumber: apt.number,
        isPaid: false,
        isLate: false,
        isPaidLate: false
      }))
    };

    setMonths((prev) => {
      const list = [newCycle, ...prev];
      return list.sort((a, b) => b.id.localeCompare(a.id));
    });
  };

  // 3. Launch Special Contribution drive
  const handleAddExtraContribution = (
    titleFr: string,
    titleAr: string,
    descFr: string,
    descAr: string,
    amount: number,
    deadline: string
  ) => {
    const newExtra: ExtraContribution = {
      id: `extra-${Date.now()}`,
      titleFr,
      titleAr,
      descriptionFr: descFr,
      descriptionAr: descAr,
      targetAmountPerAppt: amount,
      deadline,
      payments: []
    };
    setExtras((prev) => [newExtra, ...prev]);
  };

  // 4. Pay special contribution line
  const handlePayExtraContribution = (extraId: string, apartmentNumber: number, amount: number) => {
    setExtras((prev) => 
      prev.map((ex) => {
        if (ex.id !== extraId) return ex;

        const alreadyPaid = ex.payments.some((p) => p.apartmentNumber === apartmentNumber);
        const paymentsList = alreadyPaid
          ? ex.payments.map((p) => 
              p.apartmentNumber === apartmentNumber 
                ? { ...p, amountPaid: amount, paymentDate: new Date().toISOString().split('T')[0] } 
                : p
            )
          : [...ex.payments, { apartmentNumber, amountPaid: amount, paymentDate: new Date().toISOString().split('T')[0] }];

        return { ...ex, payments: paymentsList };
      })
    );
  };

  // 5. Add Expense line
  const handleAddExpense = (newExpenseValues: Omit<Expense, 'id'>) => {
    const newExp: Expense = {
      id: `exp-${Date.now()}`,
      ...newExpenseValues
    };
    setExpenses((prev) => [newExp, ...prev]);
  };

  // 6. Delete Expense line
  const handleDeleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  // 7. Add Announcement
  const handleAddAnnouncement = (
    titleFr: string,
    titleAr: string,
    contentFr: string,
    contentAr: string,
    category: Announcement['category']
  ) => {
    const newAnn: Announcement = {
      id: `ann-${Date.now()}`,
      titleFr,
      titleAr,
      contentFr,
      contentAr,
      date: new Date().toISOString().split('T')[0],
      category,
      author: role === 'admin' ? "Syndic Admin" : "Trésorier"
    };
    setAnnouncements((prev) => [newAnn, ...prev]);
  };

  // 8. Add Complaint Incident
  const handleAddIncident = (newIncidentValues: Omit<Incident, 'id' | 'date'>) => {
    const newInc: Incident = {
      id: `inc-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      ...newIncidentValues
    };
    setIncidents((prev) => [newInc, ...prev]);
  };

  // 9. Update Incident state
  const handleUpdateIncidentStatus = (id: string, nextStatus: Incident['status']) => {
    setIncidents((prev) => 
      prev.map((inc) => inc.id === id ? { ...inc, status: nextStatus } : inc)
    );
  };

  // 10. Add File Document
  const handleAddDocument = (newDocValues: Omit<DocumentFile, 'id' | 'uploadDate'>) => {
    const newDoc: DocumentFile = {
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
      ...newDocValues
    };
    setDocuments((prev) => [newDoc, ...prev]);
  };

  // Helper menu cleaner
  const navigateTo = (tab: string) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  const getTabLabel = (key: string) => {
    const customLabels: Record<string, { fr: string, ar: string }> = {
      dashboard: { fr: "Tableau de Bord", ar: "لوحة التحكم" },
      apartments: { fr: "Appartements", ar: "الشقق" },
      cotisations: { fr: "Cotisations", ar: "الاشتراكات" },
      expenses: { fr: "Dépenses", ar: "النفقات" },
      reports: { fr: "Rapports", ar: "التقارير" },
      announcements: { fr: "Avis", ar: "الإعلانات" },
      incidents: { fr: "Incidents", ar: "الشكاوى العطول" },
      maintenance: { fr: "Maintenance", ar: "الصيانة" },
      documents: { fr: "Documents", ar: "الملفات" }
    };
    return isRtl ? customLabels[key].ar : customLabels[key].fr;
  };

  return (
    <div className="bg-slate-100 min-h-screen text-slate-800 antialiased font-sans transition-colors duration-200">
      {/* Outer desktop container framing a glorious high-fidelity responsive layout */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row min-h-screen">
        
        {/* SIDE BAR NAVIGATION - Visible on Medium & Desktop Screens for perfect administration */}
        <aside className={`hidden md:flex flex-col w-72 bg-emerald-950 text-white p-6 shadow-xl shrink-0 z-20 ${isRtl ? 'border-l border-emerald-800' : 'border-r border-emerald-800'}`}>
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 text-emerald-305 text-emerald-400 font-mono tracking-wider uppercase font-black text-xs mb-1">
              <span>★ {t.appName}</span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
              <span>{isRtl ? "تسيير عمارة 31" : "Bloc31Admin"}</span>
            </h1>
            <p className="text-[10px] text-emerald-200 mt-0.5 opacity-80 leading-snug">{t.tagline}</p>
          </div>

          {/* Persona role tester switch */}
          <div className="bg-emerald-900/40 p-4 rounded-2xl mb-6 border border-emerald-800/30 font-sans space-y-2.5">
            <span className="text-[10px] text-emerald-300 font-extrabold uppercase tracking-wider block">{t.switchRole}</span>
            <div className="grid grid-cols-1 gap-1 text-[11px] font-bold">
              <button 
                onClick={() => setRole('admin')}
                className={`w-full py-1.5 px-3 rounded-lg text-left ${role === 'admin' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-900 text-emerald-200'}`}
              >
                {t.admin}
              </button>
              <button 
                onClick={() => setRole('treasurer')}
                className={`w-full py-1.5 px-3 rounded-lg text-left ${role === 'treasurer' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-900 text-emerald-200'}`}
              >
                {t.treasurer}
              </button>
              <button 
                onClick={() => setRole('resident')}
                className={`w-full py-1.5 px-3 rounded-lg text-left ${role === 'resident' ? 'bg-emerald-600 text-white' : 'hover:bg-emerald-900 text-emerald-200'}`}
              >
                {t.resident}
              </button>
            </div>
          </div>

          {/* Desktop tab links */}
          <nav className="flex-1 space-y-1.5 text-xs font-bold">
            {[
              { id: 'dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'apartments', icon: <Users className="w-4 h-4" /> },
              { id: 'cotisations', icon: <CheckSquare className="w-4 h-4" /> },
              { id: 'expenses', icon: <Coins className="w-4 h-4" /> },
              { id: 'reports', icon: <FilePieChart className="w-4 h-4" /> },
              { id: 'announcements', icon: <Megaphone className="w-4 h-4" /> },
              { id: 'incidents', icon: <AlertTriangle className="w-4 h-4" /> },
              { id: 'maintenance', icon: <History className="w-4 h-4" /> },
              { id: 'documents', icon: <FolderLock className="w-4 h-4" /> },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => navigateTo(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all cursor-pointer ${activeTab === tab.id ? 'bg-emerald-605 bg-emerald-700 text-white shadow-md' : 'text-emerald-100 hover:bg-emerald-900/40'}`}
              >
                {tab.icon}
                <span>{getTabLabel(tab.id)}</span>
              </button>
            ))}
          </nav>

          <div className="pt-4 border-t border-emerald-900 text-[10px] text-emerald-205 text-emerald-300 font-mono text-center">
            AADL Ain El Beida • Oran
          </div>
        </aside>

        {/* MAIN BODY AREA & MOBILE TOP NAVBAR */}
        <main className="flex-1 flex flex-col min-h-screen bg-slate-50 relative z-10 overflow-x-hidden">
          
          {/* Top header containing branding & switches */}
          <header className="sticky top-0 bg-white border-b border-gray-100 shadow-3xs px-4 py-3 z-30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile hamburger button */}
              <button 
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-xl cursor-pointer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex flex-col">
                <span className="text-sm font-black text-gray-900 uppercase tracking-tight">{t.appName}</span>
                <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                  <span>Site 1, Ilot 4</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Persona role indicator flag */}
              <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-full font-sans text-xs font-bold text-gray-650">
                <Fingerprint className="w-3.5 h-3.5 text-emerald-650 text-emerald-600" />
                <span>{role === 'admin' ? t.admin : (role === 'treasurer' ? t.treasurer : t.resident)}</span>
              </div>

              {/* Language switcher */}
              <button 
                onClick={() => setLang(lang === 'fr' ? 'ar' : 'fr')}
                className="p-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-black transition-all flex items-center gap-1 cursor-pointer"
                title={lang === 'fr' ? "Passer à l'Arabe" : "Changer en Français"}
              >
                <Globe2 className="w-3.5 h-3.5" />
                <span>{lang === 'fr' ? "العربية • RTL" : "Français"}</span>
              </button>
            </div>
          </header>

          {/* Test Persona Alert banner notifying active role */}
          <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex justify-between items-center text-xs text-amber-900 select-none md:hidden">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>{t.activeRole}: <strong>{role === 'admin' ? t.admin : (role === 'treasurer' ? t.treasurer : t.resident)}</strong></span>
            </div>
            
            <div className="flex gap-2 font-black">
              <button onClick={() => setRole('admin')} className={`underline ${role === 'admin' ? 'font-black' : 'opacity-60'}`}>{isRtl ? "مدير" : "Admin"}</button>
              <button onClick={() => setRole('treasurer')} className={`underline ${role === 'treasurer' ? 'font-black' : 'opacity-60'}`}>{isRtl ? "أمين" : "Trés"}</button>
              <button onClick={() => setRole('resident')} className={`underline ${role === 'resident' ? 'font-black' : 'opacity-60'}`}>{isRtl ? "ساكن" : "Res"}</button>
            </div>
          </div>

          {/* MAIN SCROLLABLE SECTION WITH THE ACTIVE VIEW COMPONENT */}
          <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6 overflow-y-auto max-w-5xl w-full mx-auto">
            {activeTab === 'dashboard' && (
              <Dashboard 
                lang={lang}
                role={role}
                apartments={apartments}
                months={months}
                extras={extras}
                expenses={expenses}
                announcements={announcements}
                onNavigate={(tab) => setActiveTab(tab)}
                cashBalance={cashBalance}
              />
            )}

            {activeTab === 'apartments' && (
              <ApartmentsList 
                lang={lang}
                role={role}
                apartments={apartments}
                onUpdateApartment={handleUpdateApartment}
              />
            )}

            {activeTab === 'cotisations' && (
              <div className="space-y-6">
                <MonthlyCotisations 
                  lang={lang}
                  role={role}
                  apartments={apartments}
                  months={months}
                  onTogglePayment={handleTogglePayment}
                  onAddMonthCycle={handleAddMonthCycle}
                />
                
                <ExtraCotisations 
                  lang={lang}
                  role={role}
                  apartments={apartments}
                  extras={extras}
                  onAddExtraContribution={handleAddExtraContribution}
                  onPayExtraContribution={handlePayExtraContribution}
                />
              </div>
            )}

            {activeTab === 'expenses' && (
              <Expenses 
                lang={lang}
                role={role}
                expenses={expenses}
                onAddExpense={handleAddExpense}
                onDeleteExpense={handleDeleteExpense}
              />
            )}

            {activeTab === 'reports' && (
              <Reports 
                lang={lang}
                role={role}
                apartments={apartments}
                months={months}
                expenses={expenses}
                cashBalance={cashBalance}
              />
            )}

            {activeTab === 'announcements' && (
              <Announcements 
                lang={lang}
                role={role}
                announcements={announcements}
                onAddAnnouncement={handleAddAnnouncement}
              />
            )}

            {activeTab === 'incidents' && (
              <Incidents 
                lang={lang}
                role={role}
                apartments={apartments}
                incidents={incidents}
                onAddIncident={handleAddIncident}
                onUpdateIncidentStatus={handleUpdateIncidentStatus}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceHistory 
                lang={lang}
                maintenanceLog={maintenanceLog}
              />
            )}

            {activeTab === 'documents' && (
              <Documents 
                lang={lang}
                role={role}
                documents={documents}
                onAddDocument={handleAddDocument}
              />
            )}
          </div>

          {/* MOBILE BOTTOM TAB BAR NAVIGATION RAIL - Optimized for Android devices */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-150 py-1 px-2 pb-safe z-30 flex items-center justify-around shadow-lg">
            {[
              { id: 'dashboard', label: isRtl ? 'الرئيسية' : 'Bord', icon: <LayoutDashboard className="w-5 h-5" /> },
              { id: 'apartments', label: isRtl ? 'الشقق' : 'Apts', icon: <Users className="w-5 h-5" /> },
              { id: 'cotisations', label: isRtl ? 'الاشتراك' : 'Coti', icon: <CheckSquare className="w-5 h-5" /> },
              { id: 'expenses', label: isRtl ? 'الصرف' : 'Dép', icon: <Coins className="w-5 h-5" /> },
              { id: 'reports', label: isRtl ? 'المالية' : 'Audit', icon: <FilePieChart className="w-5 h-5" /> },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer ${isActive ? 'text-emerald-700 bg-emerald-50 font-bold' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab.icon}
                  <span className="text-[10px] mt-0.5">{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Full Screen side backdrop drawer slider for older Android mobile support */}
          {menuOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex" onClick={() => setMenuOpen(false)}>
              <div 
                className={`w-72 bg-emerald-950 text-white h-full p-6 flex flex-col justify-between shadow-2xl relative ${isRtl ? 'mr-0 ml-auto animate-slide-in-right' : 'ml-0 mr-auto animate-slide-in-left'}`}
                onClick={(e) => e.stopPropagation()}
              >
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-base font-extrabold text-white">Menu Bloc31</h2>
                    <button 
                      onClick={() => setMenuOpen(false)}
                      className="p-1 px-2.5 bg-emerald-900 rounded-xl text-emerald-200 font-bold cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1 font-sans text-xs font-bold">
                    {[
                      { id: 'dashboard', label: getTabLabel('dashboard'), icon: <LayoutDashboard className="w-4 h-4" /> },
                      { id: 'apartments', label: getTabLabel('apartments'), icon: <Users className="w-4 h-4" /> },
                      { id: 'cotisations', label: getTabLabel('cotisations'), icon: <CheckSquare className="w-4 h-4" /> },
                      { id: 'expenses', label: getTabLabel('expenses'), icon: <Coins className="w-4 h-4" /> },
                      { id: 'reports', label: getTabLabel('reports'), icon: <FilePieChart className="w-4 h-4" /> },
                      { id: 'announcements', label: getTabLabel('announcements'), icon: <Megaphone className="w-4 h-4" /> },
                      { id: 'incidents', label: getTabLabel('incidents'), icon: <AlertTriangle className="w-4 h-4" /> },
                      { id: 'maintenance', label: getTabLabel('maintenance'), icon: <History className="w-4 h-4" /> },
                      { id: 'documents', label: getTabLabel('documents'), icon: <FolderLock className="w-4 h-4" /> },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => navigateTo(tab.id)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-white/90 rounded-xl transition-all h-10 cursor-pointer ${activeTab === tab.id ? 'bg-emerald-700 text-white shadow-md' : 'hover:bg-emerald-900/50'}`}
                      >
                        {tab.icon}
                        <span>{tab.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-emerald-900 text-[10px] text-center text-emerald-250 opacity-80 font-mono">
                  Site 1, Ilot 4, Oran
                </div>
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
