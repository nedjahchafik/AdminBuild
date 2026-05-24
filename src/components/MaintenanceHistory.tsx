import React from 'react';
import { useTranslation } from '../translations';
import { Lang, MaintenanceRecord } from '../types';
import { Wrench, Calendar, Landmark, Check, Star } from 'lucide-react';

interface MaintenanceHistoryProps {
  lang: Lang;
  maintenanceLog: MaintenanceRecord[];
}

export default function MaintenanceHistory({
  lang,
  maintenanceLog
}: MaintenanceHistoryProps) {
  const t = useTranslation(lang);
  const isRtl = lang === 'ar';

  return (
    <div className="space-y-6" dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Header card */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">{t.maintenanceTimeline}</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {isRtl ? "سجل تاريخي دقيق لكافة أعمال الصيانة والتدوير التقني التي جرت في عمارة 31" : "Fiche d'intervention et historique chronologique des interventions techniques du bâtiment"}
          </p>
        </div>
      </div>

      {/* Vertical visual timeline list */}
      <div className="relative border-l-2 border-emerald-100 md:border-l-0 md:before:absolute md:before:left-1/2 md:before:right-1/2 md:before:w-0.5 md:before:h-full md:before:bg-emerald-100 space-y-8 py-4 px-2">
        {maintenanceLog.map((item, index) => {
          const isEven = index % 2 === 0;

          return (
            <div 
              key={item.id} 
              className={`relative flex flex-col md:flex-row items-stretch md:items-center ${isEven ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Central ball indicator */}
              <div className="absolute -left-[17px] md:left-1/2 md:-translate-x-[9px] w-5 h-5 rounded-full bg-emerald-600 border-4 border-white shadow-xs z-10 flex items-center justify-center">
                <Check className="w-2.5 h-2.5 text-white stroke-[3px]" />
              </div>

              {/* Layout spacer for desktop */}
              <div className="hidden md:block md:w-1/2"></div>

              {/* Interactive body card */}
              <div className="md:w-1/2 pl-6 md:pl-0 md:px-8">
                <div className="bg-white p-5 rounded-3xl border border-gray-150/70 hover:border-emerald-100 transition-colors shadow-2xs space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>
                    <span className="text-gray-400 font-mono text-[10px]">{item.provider}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-gray-900 leading-tight">
                    {isRtl ? item.titleAr : item.titleFr}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {isRtl ? item.descriptionAr : item.descriptionFr}
                  </p>

                  <div className="pt-2.5 border-t border-gray-50 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400">{t.cost}:</span>
                    <span className="font-extrabold text-emerald-800 bg-emerald-50/50 px-2 py-1 rounded-lg">
                      {item.cost.toLocaleString()} DZD
                    </span>
                  </div>

                  {/* Before/After photos if preseeded */}
                  {item.beforePhoto && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div className="relative rounded-xl overflow-hidden h-20 border border-gray-100">
                        <img 
                          src={item.beforePhoto} 
                          alt="Avant intervention" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-black/65 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider font-sans">
                          {isRtl ? "قبل" : "Avant"}
                        </div>
                      </div>
                      <div className="relative rounded-xl overflow-hidden h-20 border border-gray-100">
                        <img 
                          src={item.afterPhoto || item.beforePhoto} 
                          alt="Après intervention" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1 right-1 bg-emerald-700/85 text-[8px] font-bold text-white px-1.5 py-0.5 rounded-md uppercase tracking-wider font-sans">
                          {isRtl ? "بعد" : "Après"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
