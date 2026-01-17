import React from 'react';
import { Check, X, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ComparisonTable() {
  const { t } = useTranslation();

  const features = [
    {
      name: t('comparison.lighting_type'),
      rgb_cct: 'RGB + CCT',
      cct: 'CCT',
      tooltip: 'RGB+CCT - color + adjustable white, CCT - adjustable white light'
    },
    {
      name: t('comparison.color_temperature'),
      rgb_cct: '2700K-6500K + RGB',
      cct: '2700K-6500K',
      tooltip: 'Range of adjustment from warm to cold white light'
    },
    {
      name: t('comparison.strip_type'),
      rgb_cct: t('comparison.cob_without_dots'),
      cct: t('comparison.cob_without_dots'),
      tooltip: 'COB (Chip On Board) technology for uniform illumination'
    },
    {
      name: t('comparison.color_rendering_index'),
      rgb_cct: '>90 Ra',
      cct: '>95 Ra',
      tooltip: 'Indicator of light quality and color reproduction accuracy'
    },
    {
      name: t('comparison.wifi_control'),
      rgb_cct: true,
      cct: true,
      tooltip: 'Control via smartphone app'
    },
    {
      name: t('comparison.voice_control'),
      rgb_cct: true,
      cct: true,
      tooltip: 'Support for voice commands via smart assistants'
    },
    {
      name: t('comparison.scenes_automation'),
      rgb_cct: true,
      cct: true,
      tooltip: 'Setting up lighting scenes and automation'
    },
    {
      name: t('comparison.custom_configuration'),
      rgb_cct: true,
      cct: true,
      tooltip: 'Ability to order a kit with custom length and configuration'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">{t('comparison.title')}</h2>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="py-4 px-6 text-left">{t('comparison.characteristics')}</th>
              <th className="py-4 px-6 text-center">RGB+CCT</th>
              <th className="py-4 px-6 text-center">CCT</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr 
                key={index}
                className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
              >
                <td className="py-4 px-6 flex items-center gap-2">
                  {feature.name}
                  {feature.tooltip && (
                    <div className="group relative">
                      <HelpCircle size={16} className="text-gray-400" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                        {feature.tooltip}
                      </div>
                    </div>
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  {typeof feature.rgb_cct === 'boolean' ? (
                    feature.rgb_cct ? (
                      <Check className="mx-auto text-green-500" />
                    ) : (
                      <X className="mx-auto text-red-500" />
                    )
                  ) : (
                    feature.rgb_cct
                  )}
                </td>
                <td className="py-4 px-6 text-center">
                  {typeof feature.cct === 'boolean' ? (
                    feature.cct ? (
                      <Check className="mx-auto text-green-500" />
                    ) : (
                      <X className="mx-auto text-red-500" />
                    )
                  ) : (
                    feature.cct
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}