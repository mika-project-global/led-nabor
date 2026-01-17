import React from 'react';
import { Clock, Package, Wrench, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function InstallationTimeline() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Package,
      title: t('installation.delivery'),
      description: t('installation.delivery_desc'),
      time: t('installation.delivery_time')
    },
    {
      icon: Wrench,
      title: t('installation.installation'),
      description: t('installation.installation_desc'),
      time: t('installation.installation_time')
    },
    {
      icon: CheckCircle,
      title: t('installation.ready'),
      description: t('installation.ready_desc'),
      time: t('installation.ready_time')
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Clock className="text-cyan-600" />
        {t('installation.title')}
      </h2>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-[21px] top-8 bottom-8 w-0.5 bg-gray-200" />

        <div className="space-y-8">
          {steps.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-full bg-cyan-50 flex items-center justify-center border-2 border-cyan-500">
                  <step.icon size={20} className="text-cyan-600" />
                </div>
              </div>
              <div>
                <h3 className="font-medium text-lg">{step.title}</h3>
                <p className="text-gray-600 mb-1">{step.description}</p>
                <span className="text-sm text-cyan-600 font-medium">
                  {step.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}