import React, { useState } from 'react';
import { Calculator, Lightbulb, Ruler, PaintBucket, TrendingUp, DollarSign, TrendingDown } from 'lucide-react';

export function SavingsCalculator() {
  const [usage, setUsage] = useState(8); // hours per day
  const [years, setYears] = useState(5); // planned usage period
  const [length, setLength] = useState(10); // strip length
  const [powerCost, setPowerCost] = useState(0.15); // electricity cost in EUR/kWh
  const [daysPerWeek, setDaysPerWeek] = useState(7); // days per week

  // Calculation for different types of strips
  const calculateSavings = () => {
    const daysPerYear = 365;
    const electricityPrice = powerCost;

    // Calculation for CCT strip (22 W/m)
    const cctPowerPerDay = length * 22 * usage / 1000;
    const cctPowerPerMonth = cctPowerPerDay * (daysPerWeek * 52/12);
    const cctCostPerMonth = cctPowerPerMonth * electricityPrice;

    // Calculation for RGB+CCT strip (25 W/m)
    const rgbPowerPerDay = length * 25 * usage / 1000;
    const rgbPowerPerMonth = rgbPowerPerDay * (daysPerWeek * 52/12);
    const rgbCostPerMonth = rgbPowerPerMonth * electricityPrice;

    // Calculate savings
    const monthlyPowerSavings = cctPowerPerMonth - rgbPowerPerMonth;
    const monthlyCostSavings = cctCostPerMonth - rgbCostPerMonth;
    const yearlyPowerSavings = monthlyPowerSavings * 12;
    const yearlyCostSavings = monthlyCostSavings * 12;
    const totalSavings = yearlyCostSavings * years;

    return {
      cct: {
        powerPerMonth: cctPowerPerMonth,
        costPerMonth: cctCostPerMonth
      },
      rgb: {
        powerPerMonth: rgbPowerPerMonth,
        costPerMonth: rgbCostPerMonth
      },
      savings: {
        powerPerMonth: monthlyPowerSavings,
        costPerMonth: monthlyCostSavings,
        powerPerYear: yearlyPowerSavings,
        costPerYear: yearlyCostSavings,
        total: totalSavings
      }
    };
  };

  const results = calculateSavings();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Calculator className="text-cyan-600" />
        Energy Consumption and Savings Calculator
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Lighting Length (meters)
            </label>
            <input
              type="number"
              min="1"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage (hours per day)
            </label>
            <input
              type="number"
              min="1"
              max="24"
              value={usage}
              onChange={(e) => setUsage(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Days of operation per week
            </label>
            <input
              type="number"
              min="1"
              max="7"
              value={daysPerWeek}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Electricity Cost (EUR/kWh)
            </label>
            <input
              type="number"
              min="0.01"
              step="0.01"
              value={powerCost}
              onChange={(e) => setPowerCost(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Planned period of use (years)
            </label>
            <input
              type="number"
              min="1"
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="text-yellow-500" />
                White CCT Strip (22 W/m)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monthly consumption:</span>
                  <span className="font-medium">{results.cct.powerPerMonth.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly cost:</span>
                  <span className="font-medium">€{results.cct.costPerMonth.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <TrendingDown className="text-green-500" />
                RGB+CCT Strip (25 W/m)
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Monthly consumption:</span>
                  <span className="font-medium">{results.rgb.powerPerMonth.toFixed(1)} kWh</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly cost:</span>
                  <span className="font-medium">€{results.rgb.costPerMonth.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <DollarSign className="text-gray-600" />
                Savings
              </h3>
              <div className="space-y-2 text-green-700">
                <div className="flex justify-between">
                  <span>Energy savings:</span>
                  <span className="font-medium">{results.savings.powerPerMonth.toFixed(1)} kWh/month</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly savings:</span>
                  <span className="font-medium">€{results.savings.costPerMonth.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Annual savings:</span>
                  <span className="font-medium">€{results.savings.costPerYear.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t">
                  <span>Total savings over {years} years:</span>
                  <span>€{results.savings.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}