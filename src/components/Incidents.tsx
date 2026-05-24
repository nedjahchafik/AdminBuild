import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Incident, Apartment } from '../types';
import { AlertCircle, Plus, ClipboardCheck, Trash2, Camera, ShieldAlert, CheckCircle, Clock } from 'lucide-react';

interface IncidentsProps {
  lang: Lang;
  role: UserRole;
  apartments: Apartment[];
  incidents: Incident[];
  onAddIncident: (incident: Omit<Incident, 'id' | 'date'>) => void;
  onUpdateIncidentStatus: (id: string, nextStatus: Incident['status']) => void;
}

export default function Incidents({
  lang,
  role,
  apartments,
  incidents,
  onAddIncident,
  onUpdateIncidentStatus
}: IncidentsProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [showForm, setShowForm] = useState(false);

  // New item state
  const [apartmentNumber, setApartmentNumber] = useState<number>(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<Incident['category']>("electricite");
  const [priority, setPriority] = useState<Incident['priority']>("moyenne");
  const [reporterName, setReporterName] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");

  const getPriorityBadge = (prio: Incident['priority']) => {
    switch (prio) {
      case 'haute':
        return <span className="px-2 py-0.5 bg-red-100 text-red-805 font-sans font-bold text-[9px] uppercase tracking-wide rounded-lg text-red-800">{isRtl ? "عاجل" : "Urgent"}</span>;
      case 'moyenne':
        return <span className="px-2 py-0.5 bg-amber-100 text-amber-805 font-sans font-bold text-[9px] uppercase tracking-wide rounded-lg text-amber-805 text-amber-800">{isRtl ? "متوسط" : "Moyen"}</span>;
      default:
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-805 font-sans font-bold text-[9px] uppercase tracking-wide rounded-lg text-gray-500">{isRtl ? "عادي" : "Basse"}</span>;
    }
  };

  const getStatusLabel = (status: Incident['status']) => {
    switch (status) {
      case 'resolu':
        return <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded-lg text-xs">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{isRtl ? "تم الحل مسبقاً" : "Résolu ✔"}</span>
        </span>;
      case 'encours':
        return <span className="inline-flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-1 rounded-lg text-xs">
          <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
          <span>{isRtl ? "قيد التدخل" : "En cours"}</span>
        </span>;
      default:
        return <span className="inline-flex items-center gap-1 text-red-700 font-bold bg-red-50 px-2 py-1 rounded-lg text-xs">
          <AlertCircle className="w-3.5 h-3.5" />
          <span>{isRtl ? "غير معالج" : "En attente"}</span>
        </span>;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !reporterName.trim()) {
      alert(isRtl ? "من فضلك املأ المعطيات لتسجيل التقرير" : "Veuillez remplir les informations requises.");
      return;
    }

    onAddIncident({
      apartmentNumber,
      title,
      description,
      category,
      priority,
      status: "ouvert",
      reporterName,
      photoUrl: photoUrl || undefined
    });

    setShowForm(false);
    // Reset
    setTitle("");
    setDescription("");
    setReporterName("");
    setPhotoUrl("");
  };

  const simulatePhoto = () => {
    const urls = [
      "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400",
      "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&q=80&w=400",
    ];
    setPhotoUrl(urls[Math.floor(Math.random() * urls.length)]);
    alert(isRtl ? "تمت محاكاة التقاط وإدراج صورة العطل!" : "Photo de l'incident capturée via le mobile et rattachée !");
  };

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search Header Toolset */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.incidentTitle}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRtl ? "تمكين السكان من التبليغ المباشر ومتابعة إصلاح أعطال أجزاء العمارة" : "Signaler un dysfonctionnement matériel pour programmation d'une intervention technique"}
            </p>
          </div>

          <button 
            onClick={() => setShowForm(!showForm)}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl text-xs font-bold font-sans flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{t.reportIncident}</span>
          </button>
        </div>
      </div>

      {/* Report Form code */}
      {showForm && (
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl space-y-4">
          <h3 className="text-base font-extrabold pb-2 border-b border-gray-50 text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-emerald-600" />
            <span>{t.reportIncident}</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans text-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Votre Appartement *</label>
                <select 
                  value={apartmentNumber}
                  onChange={(e) => setApartmentNumber(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-gray-250 focus:outline-none focus:border-emerald-500 bg-white"
                >
                  {apartments
                    .filter(a => !a.resident.isVacant)
                    .map(a => (
                      <option key={a.number} value={a.number}>
                        {isRtl ? `شقة رقم ${a.number}` : `Appartement N° ${a.number}`}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Catégorie du problème *</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as Incident['category'])}
                  className="w-full p-2.5 rounded-xl border border-gray-250 focus:outline-none focus:border-emerald-500 bg-white cursor-pointer"
                >
                  <option value="ascenseur">{isRtl ? "عطل مصعد" : "Mécanique Ascenseur"}</option>
                  <option value="eau">{isRtl ? "مشكل شبكة المياه" : "Plomberie & Pompe à Eau"}</option>
                  <option value="electricite">{isRtl ? "مصباح درج / كهرباء" : "Électricité commune"}</option>
                  <option value="proprete">{isRtl ? "مشكل نظافة" : "Ordures & Nettoyage"}</option>
                  <option value="bruit">{isRtl ? "إزعاج وضجيج" : "Bruit"}</option>
                  <option value="autres">{isRtl ? "أعطال أخرى" : "Autres"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Niveau d'urgence *</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Incident['priority'])}
                  className="w-full p-2.5 rounded-xl border border-gray-250 focus:outline-none focus:border-emerald-500 bg-white cursor-pointer"
                >
                  <option value="basse">{isRtl ? "عادي (غير مستعجل)" : "Priorité Basse"}</option>
                  <option value="moyenne">{isRtl ? "متوسط الاستعجال" : "Priorité Moyenne"}</option>
                  <option value="haute">{isRtl ? "عاجل جداً وطارئ" : "Priorité Haute / Urgent"}</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Votre Nom complet *</label>
                <input 
                  type="text" 
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="ex: Rachid Bensaid"
                  className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-xs"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Titre de l'incident ou panne *</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="ex: Ampoule grillée au palier du 3ème"
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">{t.incidentDesc} *</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Veuillez fournir un repère précis..."
                className="w-full p-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans h-20 text-xs"
                required
              />
            </div>

            {/* Simulated photo loader */}
            <div className="p-3.5 bg-gray-50 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="font-bold text-gray-800">{isRtl ? "سند صوري (اختياري)" : "Ajouter une photo"}</div>
                  <div className="text-[10px] text-gray-400">{isRtl ? "التقاط صورة بهاتف لعرض المشكلة بالتفصيل" : "Photo de repérage"}</div>
                </div>
              </div>
              <button 
                type="button" 
                onClick={simulatePhoto}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-250 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
              >
                <span>{isRtl ? "تصوير العطل" : "Prendre Photo"}</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button 
                type="button" 
                onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-750 font-semibold rounded-xl text-xs cursor-pointer"
              >
                {t.cancel}
              </button>
              <button 
                type="submit"
                className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10"
              >
                <ClipboardCheck className="w-4 h-4" />
                <span>{t.submit}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vertical list of incidents */}
      <div className="space-y-4">
        {incidents.map((inc) => (
          <div 
            key={inc.id}
            className="bg-white rounded-3xl p-5 border border-gray-150/60 hover:shadow-2xs transition-shadow space-y-3"
          >
            <div className="flex justify-between items-center flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center font-mono font-bold text-xs text-gray-700">
                  #{inc.apartmentNumber}
                </span>

                <span className="text-xs text-gray-400">
                  {isRtl ? `شقة ${inc.apartmentNumber}` : `Appartement ${inc.apartmentNumber}`}
                </span>

                {getPriorityBadge(inc.priority)}
              </div>

              <div>{getStatusLabel(inc.status)}</div>
            </div>

            <div>
              <h4 className="text-base font-bold text-gray-950">{inc.title}</h4>
              <p className="text-xs text-gray-650 leading-relaxed font-sans mt-1.5">{inc.description}</p>
            </div>

            {/* Reporter details and status modifier widgets */}
            <div className="mt-2.5 pt-3.5 border-t border-gray-50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-400 font-mono">
              <div>
                <span>{t.incidentReporter}: <strong className="font-semibold text-gray-600 font-sans">{inc.reporterName}</strong></span>
                <span className="mx-1.5">•</span>
                <span>{inc.date}</span>
              </div>

              {/* Status toggle actions (Admins or Treasurers only) */}
              {role !== 'resident' && (
                <div className="flex items-center gap-1.5 font-sans font-bold">
                  <span className="text-[10px] text-gray-400 uppercase font-black">{isRtl ? "تعديل الحالة:" : "Changer statut:"}</span>
                  <select 
                    value={inc.status}
                    onChange={(e) => onUpdateIncidentStatus(inc.id, e.target.value as Incident['status'])}
                    className="p-1 px-2.5 rounded-lg border border-gray-250 bg-white font-sans text-xs font-bold text-gray-750 cursor-pointer"
                  >
                    <option value="ouvert">{isRtl ? "مفتوح" : "En attente"}</option>
                    <option value="encours">{isRtl ? "قيد المعالجة" : "En cours"}</option>
                    <option value="resolu">{isRtl ? "تم الحل" : "Résolu"}</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
