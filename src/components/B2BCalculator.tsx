import React, { useState } from 'react';
import { Calculator, Building, Lightbulb, Ruler } from 'lucide-react';
import { ProjectCalculation } from '../types';
import { useTranslation } from 'react-i18next';

export function B2BCalculator() {
  const { t } = useTranslation();
  const [projectType, setProjectType] = useState<'hotel' | 'restaurant' | 'office' | 'mall' | 'exhibition'>('hotel');
  const [area, setArea] = useState<number>(0);
  const [requirements, setRequirements] = useState({
    controlType: 'basic',
    needsInstallation: false,
    needsDesign: false
  });
  const [calculation, setCalculation] = useState<ProjectCalculation | null>(null);

  const calculateProject = () => {
    // Здесь будет логика расчета проекта
    const basePrice = area * (
      projectType === 'hotel' ? 45 :
      projectType === 'restaurant' ? 55 :
      projectType === 'office' ? 35 :
      projectType === 'mall' ? 40 :
      50
    );

    const controlSystemPrice = requirements.controlType === 'smart' ? basePrice * 0.2 : 0;
    const installationPrice = requirements.needsInstallation ? basePrice * 0.15 : 0;
    const designPrice = requirements.needsDesign ? basePrice * 0.1 : 0;

    const totalPrice = basePrice + controlSystemPrice + installationPrice + designPrice;

    setCalculation({
      id: Date.now().toString(),
      clientId: 'demo',
      projectType: 'commercial',
      requirements: {
        area,
        roomType: projectType,
        lightingType: ['led'],
        controlType: requirements.controlType
      },
      calculations: {
        products: [{
          id: 1,
          quantity: Math.ceil(area / 10),
          price: basePrice
        }],
        services: [
          ...(requirements.needsInstallation ? [{
            type: 'installation',
            price: installationPrice
          }] : []),
          ...(requirements.needsDesign ? [{
            type: 'design',
            price: designPrice
          }] : [])
        ],
        totalPrice
      },
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calculator className="text-cyan-600" />
        {t('b2b.calculator')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('b2b.project_type')}
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value as any)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="hotel">{t('b2b.hotel')}</option>
              <option value="restaurant">{t('b2b.restaurant')}</option>
              <option value="office">{t('b2b.office')}</option>
              <option value="mall">{t('b2b.shopping_mall')}</option>
              <option value="exhibition">{t('b2b.exhibition_hall')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('b2b.room_area')}
            </label>
            <input
              type="number"
              min="0"
              value={area}
              onChange={(e) => setArea(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('b2b.control_system')}
            </label>
            <select
              value={requirements.controlType}
              onChange={(e) => setRequirements({ ...requirements, controlType: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            >
              <option value="basic">{t('b2b.basic_remote')}</option>
              <option value="smart">{t('b2b.smart_control')}</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={requirements.needsInstallation}
                onChange={(e) => setRequirements({ ...requirements, needsInstallation: e.target.checked })}
                className="rounded text-cyan-500"
              />
              <span>{t('b2b.installation_needed')}</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={requirements.needsDesign}
                onChange={(e) => setRequirements({ ...requirements, needsDesign: e.target.checked })}
                className="rounded text-cyan-500"
              />
              <span>{t('b2b.lighting_design_needed')}</span>
            </label>
          </div>

          <button
            onClick={calculateProject}
            className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            {t('b2b.calculate_project')}
          </button>
        </div>

        {calculation && (
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="font-medium mb-3 flex items-center gap-2">{t('calculator.results')}:</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>{t('b2b.area')}:</span>
                <span className="font-medium">{area} m²</span>
              </div>

              <div className="flex items-center justify-between">
                <span>{t('b2b.room_type')}:</span>
                <span className="font-medium">{
                  projectType === 'hotel' ? t('b2b.hotel') :
                  projectType === 'restaurant' ? t('b2b.restaurant') :
                  projectType === 'office' ? t('b2b.office') :
                  projectType === 'mall' ? t('b2b.shopping_mall') :
                  t('b2b.exhibition_hall')
                }</span>
              </div>

              {calculation.calculations.services?.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span>{
                    service.type === 'installation' ? t('b2b.installation_needed') : t('b2b.lighting_design_needed')
                  }:</span>
                  <span className="font-medium">€{service.price.toFixed(2)}</span>
                </div>
              ))}

              <div className="pt-4 border-t">
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>{t('b2b.total')}:</span>
                  <span>€{calculation.calculations.totalPrice.toFixed(2)}</span>
                </div>
              </div>

              <button className="w-full mt-4 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors">
                {t('b2b.get_commercial_proposal')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}