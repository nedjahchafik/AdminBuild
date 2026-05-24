import { Apartment, MonthCycle, ExtraContribution, Expense, Announcement, Incident, MaintenanceRecord, DocumentFile } from '../types';

export const INITIAL_APARTMENTS: Apartment[] = Array.from({ length: 40 }, (_, index) => {
  const num = index + 1;
  let floor = 0;
  
  if (num === 40) {
    // Caretaker apartment is permanently physical on Ground Floor and vacant
    floor = 0;
  } else if (num >= 1 && num <= 3) {
    floor = 0;
  } else {
    // Floor 1 (4,5,6,7), Floor 2 (8,9,10,11), etc. up to Floor 9 (36,37,38,39)
    floor = Math.floor((num - 4) / 4) + 1;
  }

  // Prepopulate realistic occupants
  const names = [
    "Sid Ahmed Hammimi", "Fayçal Kaddour", "Wahiba Boumediene", "Kamel Othmane",
    "Mustapha Benhabib", "Djamela Belmokhtar", "Yacine Bensaoula", "Karim Zeghdoud",
    "Nezha Ghalem", "Mourad Meziane", "Amel Cherif", "Zohra Bouafia",
    "Sofiane Benkamla", "Riad Chikh", "Meriem Boutaleb", "Tarek Sahnoune",
    "Farida Zouaoui", "Billal Hassani", "Houria Abid", "Slimane Belkacem",
    "Abdelkader Rahmouni", "Nadia Guemri", "Malik Belarbi", "Khedidja Nekiche",
    "Fouad Mokhtari", "Leila Benali", "Samir Bouzidi", "Yasmine Djebbar",
    "Omar Mechri", "Fatiha Brahimi", "Hassan Kerrouche", "Assia Taleb",
    "Redouane Smail", "amina Zerrouki", "Walid Meftah", "Souad Haddad",
    "Noureddine Guediri", "Salima Yahiaoui", "Rachid Bensaid"
  ];

  const phones = [
    "0550 12 34 56", "0661 22 33 44", "0770 45 67 89", "0555 88 11 22",
    "0663 34 56 78", "0772 15 26 37", "0540 99 88 77", "0662 50 60 70",
    "0559 11 22 33", "0774 88 99 00"
  ];

  const isGuard = (num === 40);
  const residentName = isGuard 
    ? "Logement Gardien (Vide)" 
    : (names[index] || `Résident Apt ${num}`);
  const phone = isGuard ? "" : (phones[index % phones.length] || "0550 00 00 00");
  const isOwner = isGuard ? false : (index % 5 !== 3); // some tenants
  const isVacant = isGuard;

  return {
    number: num,
    floor,
    resident: {
      name: residentName,
      phone,
      isOwner,
      isVacant
    }
  };
});

// Seed Initial Months Cycles
export const INITIAL_MONTHS: MonthCycle[] = [
  {
    id: "2026-05",
    nameFr: "Mai 2026",
    nameAr: "ماي 2026",
    baseAmount: 500,
    payments: Array.from({ length: 40 }, (_, i) => {
      const apartmentNumber = i + 1;
      const isGuard = apartmentNumber === 40;
      // Default: let's say about 28 apartments already paid, some outstanding
      let isPaid = false;
      let note = "";
      let paymentDate = "";

      if (!isGuard) {
        if (apartmentNumber % 3 !== 0 && apartmentNumber % 7 !== 0) {
          isPaid = true;
          paymentDate = "2026-05-12";
          note = `Recu N°M-${1000 + apartmentNumber}`;
        }
      }

      return {
        apartmentNumber,
        isPaid,
        paymentDate: paymentDate || undefined,
        note: note || undefined,
        collectedBy: isPaid ? "Amine (Trésorier)" : undefined
      };
    })
  },
  {
    id: "2026-04",
    nameFr: "Avril 2026",
    nameAr: "أفريل 2026",
    baseAmount: 500,
    payments: Array.from({ length: 40 }, (_, i) => {
      const apartmentNumber = i + 1;
      const isGuard = apartmentNumber === 40;
      let isPaid = false;
      let paymentDate = "";
      let note = "";

      if (!isGuard) {
        if (apartmentNumber !== 12 && apartmentNumber !== 25 && apartmentNumber !== 38) {
          isPaid = true;
          paymentDate = "2026-04-05";
          note = `Recu N°A-${900 + apartmentNumber}`;
        } else {
          note = "Promis payé avec Mai";
        }
      }

      return {
        apartmentNumber,
        isPaid,
        paymentDate: paymentDate || undefined,
        note: note || undefined,
        collectedBy: isPaid ? "Amine (Trésorier)" : undefined
      };
    })
  },
  {
    id: "2026-03",
    nameFr: "Mars 2026",
    nameAr: "مارس 2026",
    baseAmount: 500,
    payments: Array.from({ length: 40 }, (_, i) => {
      const apartmentNumber = i + 1;
      const isGuard = apartmentNumber === 40;
      let isPaid = !isGuard; // All except guard paid in March
      return {
        apartmentNumber,
        isPaid,
        paymentDate: isPaid ? "2026-03-08" : undefined,
        note: isPaid ? "Réceptionné en espèces" : undefined,
        collectedBy: isPaid ? "Amine (Trésorier)" : undefined
      };
    })
  },
  {
    id: "2025-12",
    nameFr: "Décembre 2025",
    nameAr: "ديسمبر 2025",
    baseAmount: 500,
    payments: Array.from({ length: 40 }, (_, i) => {
      const apartmentNumber = i + 1;
      const isGuard = apartmentNumber === 40;
      let isPaid = !isGuard && apartmentNumber !== 15 && apartmentNumber !== 32;
      return {
        apartmentNumber,
        isPaid,
        paymentDate: isPaid ? "2025-12-04" : undefined,
        note: isPaid ? "Réceptionné" : "En retard de paiement",
        isLate: !isPaid && !isGuard,
        collectedBy: isPaid ? "Amine (Trésorier)" : undefined
      };
    })
  },
  {
    id: "2025-11",
    nameFr: "Novembre 2025",
    nameAr: "نوفمبر 2025",
    baseAmount: 500,
    payments: Array.from({ length: 40 }, (_, i) => {
      const apartmentNumber = i + 1;
      const isGuard = apartmentNumber === 40;
      let isPaid = !isGuard;
      let isPaidLate = apartmentNumber === 15 || apartmentNumber === 32;
      return {
        apartmentNumber,
        isPaid,
        paymentDate: isPaid ? "2025-11-20" : undefined,
        note: isPaidLate ? "Payé avec retard sous relance" : "Payé à temps",
        isPaidLate,
        collectedBy: isPaid ? "Amine (Trésorier)" : undefined
      };
    })
  },
  {
    id: "2024-12",
    nameFr: "Décembre 2024",
    nameAr: "ديسمبر 2024",
    baseAmount: 500,
    payments: Array.from({ length: 40 }, (_, i) => {
      const apartmentNumber = i + 1;
      const isGuard = apartmentNumber === 40;
      let isPaid = !isGuard;
      return {
        apartmentNumber,
        isPaid,
        paymentDate: isPaid ? "2024-12-05" : undefined,
        note: "Régularisé fin d'année",
        collectedBy: "Amine (Trésorier)"
      };
    })
  }
];

// Seed Special Cotisations for repairs
export const INITIAL_EXTRA: ExtraContribution[] = [
  {
    id: "extra-01",
    titleFr: "Réparation Moteur Ascenseur",
    titleAr: "إصلاح محرك المصعد الرئيسي",
    descriptionFr: "Remplacement du câble de traction principal et poulie de renvoi par la Sarl Elevators Oran.",
    descriptionAr: "تغيير كابل الجر الرئيسي وبكرة التوجيه من طرف شركة المصاعد وهران لتأمين ركوب آمن.",
    targetAmountPerAppt: 1500,
    deadline: "2026-06-15",
    payments: [
      { apartmentNumber: 1, amountPaid: 1500, paymentDate: "2026-05-10" },
      { apartmentNumber: 2, amountPaid: 1500, paymentDate: "2026-05-11" },
      { apartmentNumber: 3, amountPaid: 1500, paymentDate: "2026-05-12" },
      { apartmentNumber: 5, amountPaid: 1500, paymentDate: "2026-05-13" },
      { apartmentNumber: 8, amountPaid: 1500, paymentDate: "2026-05-10" },
      { apartmentNumber: 10, amountPaid: 1500, paymentDate: "2026-05-09" },
      { apartmentNumber: 15, amountPaid: 1500, paymentDate: "2026-05-14" },
      { apartmentNumber: 20, amountPaid: 750, paymentDate: "2026-05-15" } // partial payment
    ]
  },
  {
    id: "extra-02",
    titleFr: "Entretien Pompe à Eau & Ballons",
    titleAr: "صيانة مضخة و خزان المياه السفلي",
    descriptionFr: "Achat d'un nouveau pressostat et vérification de la pompe principale.",
    descriptionAr: "شراء جهاز ضغط الماء للمضخة وتأمين تدفق مستقر لجميع الطوابق.",
    targetAmountPerAppt: 800,
    deadline: "2026-06-30",
    payments: [
      { apartmentNumber: 1, amountPaid: 800, paymentDate: "2026-05-20" },
      { apartmentNumber: 3, amountPaid: 800, paymentDate: "2026-05-22" },
      { apartmentNumber: 7, amountPaid: 800, paymentDate: "2026-05-19" }
    ]
  }
];

// Seed Expenses
export const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-01",
    amount: 18000,
    category: "ascenseur",
    date: "2026-05-15",
    titleFr: "Maintenance mensuelle Otis",
    titleAr: "الصيانة الشهرية للمصعد - شركة فريدوم",
    descriptionFr: "Paiement de la visite périodique de contrôle de l'ascenseur.",
    descriptionAr: "عقد الصيانة الدورية ومراقبة الكوابل وتزييت الأجزاء المتحركة.",
    approvedBy: "Trésorier Amine",
    provider: "SARL Freedom Ascenseurs Oran",
    receiptUrl: "https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "exp-02",
    amount: 4500,
    category: "nettoyage",
    date: "2026-05-10",
    titleFr: "Achat produits d'entretien et balais",
    titleAr: "شراء مواد التنظيف ومستلزمات النظافة",
    descriptionFr: "Achat eau de javel, détergents et grands balais pour le nettoyage des 9 étages.",
    descriptionAr: "علب جافيل ومطهرات ممرات الطوابق التسعة للعمارة.",
    approvedBy: "Trésorier Amine",
    provider: "Quincaillerie Bel-Air Oran",
    receiptUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "exp-03",
    amount: 12000,
    category: "reparations",
    date: "2026-04-28",
    titleFr: "Réparation fuite pompe au sous-sol",
    titleAr: "إصلاح تسرب مياه بمضخة القبو أسفل العمارة",
    descriptionFr: "Remplacement deux vannes en cuivre défectueuses et raccordement plomberie.",
    descriptionAr: "تغيير صمامين نحاسيين وإعادة لحام أنبوب التغذية الرئيسي للحد من الضياع.",
    approvedBy: "Trésorier Amine",
    provider: "Plomberie El Bahya",
    receiptUrl: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "exp-04",
    amount: 3200,
    category: "electricite",
    date: "2026-05-02",
    titleFr: "Achat de 15 lampes LED Hall",
    titleAr: "شراء 15 مصباح اقتصادي لإنارة المدخل والطوابق",
    descriptionFr: "Ampoules écologiques LED 12W pour remplacer les grillées sur les paliers.",
    descriptionAr: "شراء دفعة من مصابيح ليد للتوفير وإضاءة الدرج بشكل أفضل.",
    approvedBy: "Admin Sid Ahmed",
    provider: "Électricité Ain El Beida",
    receiptUrl: "https://images.unsplash.com/photo-1565814636199-ae8133055c1c?auto=format&fit=crop&q=80&w=400"
  }
];

// Seed Announcements
export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "ann-01",
    titleFr: "Contrôle technique obligatoire de l'ascenseur",
    titleAr: "عملية صيانة مستعجلة وتفتيش للمصعد",
    contentFr: "La Sarl Elevators procédera au test annuel de charge ce mercredi 27 Mai de 14h à 17h. L'ascenseur sera temporairement indisponible pour la sécurité de tous. Merci de votre précieuse collaboration.",
    contentAr: "ستقوم شركة الصيانة بفحص ضغط حمولة المصعد السنوي هذا الأربعاء 27 ماي من الساعة 14:00 إلى 17:00. سيتوقف المصعد مؤقتاً لسلامتكم. شكراً لتفهمكم وصبركم.",
    date: "2026-05-24",
    category: "travaux",
    author: "Bureau du Syndic"
  },
  {
    id: "ann-02",
    titleFr: "Appel au versement des cotisations du mois de Mai 2026",
    titleAr: "دعوة لتسوية مستحقات شهر ماي 2026",
    contentFr: "Nous prions tous les résidents de bien vouloir s'acquitter de leur cotisation mensuelle de 500 DZD auprès de notre trésorier Amine (Apt 15) pour couvrir les frais de nettoyage et l'électricité commune.",
    contentAr: "يرجى من جميع السادة جيران العمارة دفع مستحقات الاشتراك الشهري (500 دج) لشهر ماي لممثل العمارة أمين (شقة 15) من أجل سداد مصاريف النظافة وكهرباء الدرج الدورية.",
    date: "2026-05-18",
    category: "urgence",
    author: "Trésorier"
  },
  {
    id: "ann-03",
    titleFr: "Réunion Générale des Copropriétaires",
    titleAr: "اجتماع عام لجميع سكان عمارة 31",
    contentFr: "Tous les résidents sont invités à participer à la réunion générale dans la cour de l'immeuble ce Vendredi pile après la prière du Jumu'ah pour discuter de l'étanchéité du toit.",
    contentAr: "ندعو كافة الجيران المحترمين لحضور الاجتماع العام بساحة العمارة يوم الجمعة مباشرة بعد الصلاة لمناقشة مشروع عزل السطح من مياه الأمطار للشتاء القادم.",
    date: "2026-05-10",
    category: "reunion",
    author: "Comité de Résidence"
  }
];

// Seed Claims/Incidents
export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: "inc-01",
    apartmentNumber: 15,
    title: "Bouton d'appel cabine 4ème étage enfoncé",
    description: "Le bouton mécanique d'appel au 4ème étage reste bloqué en position enfoncée, ce qui perturbe le cycle de l'ascenseur.",
    category: "ascenseur",
    priority: "haute",
    status: "encours",
    date: "2026-05-23",
    reporterName: "Sofiane Benkamla",
    photoUrl: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "inc-02",
    apartmentNumber: 8,
    title: "Fuite d'eau au palier du 2ème étage",
    description: "Il y a un suintement d'eau près de la trappe technique principale. Risque de court-circuit sur les lampes communes.",
    category: "eau",
    priority: "haute",
    status: "ouvert",
    date: "2026-05-24",
    reporterName: "Karim Zeghdoud",
  },
  {
    id: "inc-03",
    apartmentNumber: 22,
    title: "Nouveau néon grillé escalier 6ème",
    description: "L'ampoule électrique a grillé hier soir, l'escalier est totalement sombre à partir de 19h.",
    category: "electricite",
    priority: "basse",
    status: "resolu",
    date: "2026-05-16",
    reporterName: "Nadia Guemri",
  }
];

// Seed Historical Maintenance Log
export const INITIAL_MAINTENANCE: MaintenanceRecord[] = [
  {
    id: "maint-1",
    date: "2026-05-15",
    titleFr: "Contrôle technique & Câblerie",
    titleAr: "فحص تقني دوري للكوابل والتحكم الكهربائي",
    descriptionFr: "Mise à niveau de l'huile moteur, ajustement des freins d'arrêt palier et resserrage des guides.",
    descriptionAr: "تعديل فرامل الوقوف بالمستويات، تزييت مجاري الصعود والنزول، وإضافة زيت علبة السرعة للمحرك.",
    cost: 18000,
    provider: "SARL Freedom Ascenseurs Oran",
    status: "Terminé",
    beforePhoto: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
    afterPhoto: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"
  },
  {
    id: "maint-2",
    date: "2026-04-10",
    titleFr: "Désinfection générale des conduites d'ordures",
    titleAr: "تطهير وتعقيم مخرجات النفايات ومحيط العمارة",
    descriptionFr: "Pulvérisation de désinfectant chloré et insecticides de protection dans les colonnes.",
    descriptionAr: "عملية رش معقمات ومضادات الحشرات الضارة في مجاري النفايات الطولية وقبو العمارة لتقليل الروائح.",
    cost: 8500,
    provider: "Oran Hygiène Pro",
    status: "Terminé"
  },
  {
    id: "maint-3",
    date: "2026-03-25",
    titleFr: "Changement de la pompe à eau immergée n°2",
    titleAr: "تغيير المضخة الغاطسة رقم 2 لخزان المياه",
    descriptionFr: "Remplacement complet de la turbine brûlée par une neuve de marque Pedrollo 1.5HP.",
    descriptionAr: "شراء وتركيب مضخة جديدة بيدرولو بقوة حصان ونصف بسبب احتراق وشيعة المضخة القديمة.",
    cost: 42000,
    provider: "Établissement Plomberie Bel-Air",
    status: "Terminé"
  }
];

// Seed Documents List
export const INITIAL_DOCUMENTS: DocumentFile[] = [
  {
    id: "doc-1",
    titleFr: "Règlement de Compte & Usage de l'Ascenseur",
    titleAr: "القانون الداخلي وقواعد استخدام المصعد والأقسام المشتركة",
    category: "reglement",
    uploadDate: "2026-01-15",
    fileSize: "245 KB"
  },
  {
    id: "doc-2",
    titleFr: "Contrat de maintenance annuelle Otis",
    titleAr: "عقد صيانة المصعد السنوي المبرم",
    category: "contrat",
    uploadDate: "2026-02-01",
    fileSize: "1.2 MB"
  },
  {
    id: "doc-3",
    titleFr: "Fiche d'intervention pompe Avril 2026",
    titleAr: "فاتورة وتقرير تركيب مضخة الماء أفريل",
    category: "facture",
    uploadDate: "2026-04-12",
    fileSize: "450 KB"
  }
];

// Helper to estimate initial cash balance
export function computeInitialCash(): number {
  // Let's assume starting reserve is 85000 DZD
  // Sum up all March/April/May payments:
  // Dec 2026 - May 2026 payments. Let's make it a clean initial amount:
  // Contributions collected:
  // May 2026: 28 appts * 500 = 14000
  // April 2026: 36 * 500 = 18000
  // March 2026: 39 * 500 = 19500
  // Extra collection paid: (8 appts * 1500) + (3 appts * 800) = 12000 + 2400 = 14400
  // Expenses paid: 18000 + 4500 + 12000 + 3200 = 37700 DZD
  // Starting balance = 65000 (starting bank) + 14000 + 18000 + 19500 + 14400 - 37700 = 93200 DZD
  return 93200;
}
