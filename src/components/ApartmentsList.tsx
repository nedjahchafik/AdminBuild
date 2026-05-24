import React, { useState } from 'react';
import { useTranslation } from '../translations';
import { Lang, UserRole, Apartment } from '../types';
import { Search, Edit3, User, Phone, Layers, ShieldCheck, Check, Info, Shield, PlusCircle } from 'lucide-react';

interface ApartmentsListProps {
  lang: Lang;
  role: UserRole;
  apartments: Apartment[];
  onUpdateApartment: (apartmentNumber: number, updatedData: { name: string; phone: string; isOwner: boolean; isVacant: boolean }) => void;
}

export default function ApartmentsList({
  lang,
  role,
  apartments,
  onUpdateApartment
}: ApartmentsListProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  const [search, setSearch] = useState('');
  const [selectedFloorGroup, setSelectedFloorGroup] = useState<'all' | 'rdc' | '1-3' | '4-6' | '7-9'>('all');
  const [editingAptNum, setEditingAptNum] = useState<number | null>(null);

  // Form states for editing
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editIsOwner, setEditIsOwner] = useState(true);
  const [editIsVacant, setEditIsVacant] = useState(false);

  const startEdit = (apt: Apartment) => {
    if (role === 'resident') {
      alert(isRtl ? "عذراً، صلاحياتك كساكن لا تسمح بتعديل قاعدة البيانات. يرجى تسجيل الدخول كمدير!" : "Accès refusé. Seuls l'Administrateur et le Trésorier peuvent éditer la liste.");
      return;
    }
    setEditingAptNum(apt.number);
    setEditName(apt.resident.name);
    setEditPhone(apt.resident.phone);
    setEditIsOwner(apt.resident.isOwner);
    setEditIsVacant(apt.resident.isVacant);
  };

  const handleSave = (num: number) => {
    if (!editName.trim() && !editIsVacant) {
      alert(isRtl ? "يرجى كتابة اسم الساكن أو تعليم الشقة كشاغرة" : "Veuillez entrer un nom d'occupant ou marquer l'appartement comme vacant.");
      return;
    }
    onUpdateApartment(num, {
      name: editIsVacant ? (isRtl ? "شقة شاغرة" : "Appartement Vacant") : editName,
      phone: editIsVacant ? "" : editPhone,
      isOwner: editIsOwner,
      isVacant: editIsVacant
    });
    setEditingAptNum(null);
  };

  // Filter logic
  const filteredApartments = apartments.filter(apt => {
    // Search match
    const matchesSearch = 
      apt.number.toString().includes(search) || 
      apt.resident.name.toLowerCase().includes(search.toLowerCase()) ||
      apt.resident.phone.includes(search);

    // Floor group match
    let matchesFloor = true;
    if (selectedFloorGroup === 'rdc') {
      matchesFloor = apt.floor === 0;
    } else if (selectedFloorGroup === '1-3') {
      matchesFloor = apt.floor >= 1 && apt.floor <= 3;
    } else if (selectedFloorGroup === '4-6') {
      matchesFloor = apt.floor >= 4 && apt.floor <= 6;
    } else if (selectedFloorGroup === '7-9') {
      matchesFloor = apt.floor >= 7 && apt.floor <= 9;
    }

    return matchesSearch && matchesFloor;
  });

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Search and filters toolbelt */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.apartments}</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {isRtl ? "قائمة 40 شقة المشكِّلة لعمارة 31 (9 طوابق + طابق أرضي)" : "Répertoire complet des 40 logements du bâtiment (9 étages)"}
            </p>
          </div>
          <div className="relative flex-1 max-w-md">
            <Search className={`w-4 h-4 text-gray-400 absolute top-3.5 ${isRtl ? 'left-3' : 'right-3'}`} />
            <input 
              type="text"
              placeholder={t.searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:border-emerald-500 font-sans text-sm bg-gray-50/50"
            />
          </div>
        </div>

        {/* Floor quick tabs */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-55">
          <button 
            onClick={() => setSelectedFloorGroup('all')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedFloorGroup === 'all' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {isRtl ? "الكل (40)" : "Tous (40)"}
          </button>
          <button 
            onClick={() => setSelectedFloorGroup('rdc')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedFloorGroup === 'rdc' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {isRtl ? "الأرضي (RDC)" : "Rez-de-chaussée"}
          </button>
          <button 
            onClick={() => setSelectedFloorGroup('1-3')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedFloorGroup === '1-3' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {isRtl ? "الطوابق 1-3" : "Étages 1-3"}
          </button>
          <button 
            onClick={() => setSelectedFloorGroup('4-6')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedFloorGroup === '4-6' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {isRtl ? "الطوابق 4-6" : "Étages 4-6"}
          </button>
          <button 
            onClick={() => setSelectedFloorGroup('7-9')}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedFloorGroup === '7-9' ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {isRtl ? "الطوابق 7-9" : "Étages 7-9"}
          </button>
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredApartments.map((apt) => {
          const isGuard = apt.number === 40;
          const isEditing = editingAptNum === apt.number;

          return (
            <div 
              key={apt.number}
              className={`p-5 rounded-3xl border transition-all shadow-xs ${isEditing ? 'bg-emerald-50/10 border-emerald-500 ring-2 ring-emerald-500/20' : (isGuard ? 'bg-amber-50/20 border-amber-100' : 'bg-white border-gray-100 hover:border-emerald-100 hover:shadow-sm')}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-mono ${isGuard ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-800'}`}>
                    <span className="text-xs font-bold">N°</span>
                    <span className="text-lg font-black leading-none">{apt.number}</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono font-bold flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-gray-300" />
                        {apt.floor === 0 ? (isRtl ? 'الطابق الأرضي' : t.groundFloor) : `${t.floor} ${apt.floor}`}
                      </span>
                      {isGuard && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-700 text-[10px] font-extrabold rounded-full font-mono">
                          {isRtl ? "مكان الحراسة" : "Logement Gardien"}
                        </span>
                      )}
                    </div>
                    
                    {/* Occupant Name or Static Text */}
                    {!isEditing ? (
                      <h4 className="text-base font-bold text-gray-900 mt-1 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-gray-300" />
                        <span>{apt.resident.isVacant ? (isRtl ? "شاغرة (بدون ساكن)" : t.vacant) : apt.resident.name}</span>
                      </h4>
                    ) : (
                      <div className="mt-2 space-y-2.5">
                        <div>
                          <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.residentName}</label>
                          <input 
                            type="text"
                            value={editName}
                            disabled={editIsVacant}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full mt-1 p-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-sans"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {role !== 'resident' && !isEditing && (
                  <button 
                    onClick={() => startEdit(apt)}
                    className="p-2 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all cursor-pointer"
                    title={t.editResident}
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Extra technical details or Inline edit details */}
              {!isEditing ? (
                <div className="mt-4 pt-3 border-t border-gray-50 flex flex-wrap justify-between items-center text-xs text-gray-500 gap-2 font-mono">
                  {apt.resident.isVacant ? (
                    <span className="text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg">
                      {isRtl ? "متاحة لوضعية الحراسة" : "Vacante et permanente"}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5 text-gray-700 font-sans font-medium">
                      <Phone className="w-3.5 h-3.5 text-gray-300 shrink-0" />
                      <a href={`tel:${apt.resident.phone}`} className="hover:underline text-xs">{apt.resident.phone || "---"}</a>
                    </div>
                  )}

                  {!apt.resident.isVacant && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wider uppercase font-sans ${apt.resident.isOwner ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                      {apt.resident.isOwner ? t.owner : t.tenant}
                    </span>
                  )}
                </div>
              ) : (
                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                  {/* Phone input */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{t.phoneNumber}</label>
                    <input 
                      type="text"
                      disabled={editIsVacant}
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="0550 12 34 56"
                      className="w-full mt-1 p-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 font-sans font-mono"
                    />
                  </div>

                  {/* Checkboxes for Owner / Vacant status */}
                  <div className="grid grid-cols-2 gap-2 pt-1 font-sans">
                    <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100">
                      <input 
                        type="checkbox"
                        checked={editIsOwner}
                        disabled={editIsVacant}
                        onChange={(e) => setEditIsOwner(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-gray-700">{t.owner}</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-150">
                      <input 
                        type="checkbox"
                        checked={editIsVacant}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setEditIsVacant(val);
                          if (val) {
                            setEditName(isRtl ? "شقة شاغرة" : "Appartement Vacant");
                            setEditPhone("");
                          } else {
                            setEditName(apt.number === 40 ? "Logement Gardien (Vide)" : "");
                          }
                        }}
                        className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-gray-700">{t.vacant}</span>
                    </label>
                  </div>

                  {/* Save/Cancel buttons */}
                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      onClick={() => setEditingAptNum(null)}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs cursor-pointer"
                    >
                      {t.cancel}
                    </button>
                    <button 
                      onClick={() => handleSave(apt.number)}
                      className="px-4 py-1.5 bg-emerald-650 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer bg-emerald-700"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{t.saveChanges}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredApartments.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center p-12 bg-gray-50 rounded-3xl border border-dashed border-gray-200 text-gray-400">
            <Layers className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            <p className="text-sm">{isRtl ? "لم يتم العثور على أي شقة مطابقة للبحث" : "Aucun appartement ne correspond à votre recherche."}</p>
          </div>
        )}
      </div>
    </div>
  );
}
