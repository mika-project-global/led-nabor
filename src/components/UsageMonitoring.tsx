import React, { useState, useEffect } from 'react';
import { BarChart, Clock, Database, Upload, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface UsageStats {
  buildMinutes: number;
  bandwidthGB: number;
  databaseSize: number;
  storageSize: number;
}

const LIMITS = {
  free: {
    buildMinutes: 300,
    bandwidthGB: 100,
    databaseSize: 500, // MB
    storageSize: 1 // GB
  },
  pro: {
    buildMinutes: 1000,
    bandwidthGB: 400,
    databaseSize: 8000, // MB
    storageSize: 100 // GB
  }
};

export function UsageMonitoring() {
  const [usage, setUsage] = useState<UsageStats>({
    buildMinutes: 0,
    bandwidthGB: 0,
    databaseSize: 0,
    storageSize: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        // Get database size with error handling
        const { data: dbSize, error: dbError } = await supabase.rpc('get_database_size');
        
        if (dbError) {
          console.error('Error fetching DB size:', dbError);
          throw new Error('Failed to fetch database size');
        }

        // Get storage size with error handling
        const { data: storageSize, error: storageError } = await supabase.rpc('get_storage_size');
        
        if (storageError) {
          console.error('Error fetching storage size:', storageError); 
          throw new Error('Failed to fetch storage size');
        }

        // Set usage with available data
        const newUsage = {
          buildMinutes: 0, // This will be updated from analytics table
          bandwidthGB: 0, // This will be updated from analytics table
          databaseSize: typeof dbSize === 'number' ? dbSize : 0,
          storageSize: typeof storageSize === 'number' ? storageSize : 0
        };

        setUsage(newUsage);
      } catch (error) {
        console.error('Error fetching usage stats:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch usage statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchUsage();
    // Update every hour, but only if the component is mounted
    const interval = setInterval(() => {
      if (!loading) {
        fetchUsage();
      }
    }, 3600000);
    
    return () => clearInterval(interval);
  }, [loading]);

  const getUsagePercentage = (value: number, limit: number) => {
    return (value / limit) * 100;
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-500';
    if (percentage >= 75) return 'text-yellow-500';
    return 'text-green-500';
  };

  const shouldUpgrade = 
    getUsagePercentage(usage.buildMinutes, LIMITS.free.buildMinutes) > 75 ||
    getUsagePercentage(usage.bandwidthGB, LIMITS.free.bandwidthGB) > 75 ||
    getUsagePercentage(usage.databaseSize, LIMITS.free.databaseSize) > 75 ||
    getUsagePercentage(usage.storageSize, LIMITS.free.storageSize) > 75;

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <BarChart className="text-cyan-600" />
          Мониторинг использования ресурсов
        </h2>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-medium text-yellow-800">Ошибка загрузки данных</h3>
              <p className="text-yellow-700 mt-1">{error}</p>
              <p className="text-yellow-700 mt-2 text-sm">
                Это нормально, если функции мониторинга еще не настроены. Основные функции админ-панели работают корректно.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <BarChart className="text-cyan-600" />
        Мониторинг использования ресурсов
      </h2>

      <div className="space-y-6">
        {/* Build Minutes */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="text-cyan-600" size={20} />
              <span className="font-medium">Время сборки</span>
            </div>
            <span className={getStatusColor(getUsagePercentage(usage.buildMinutes, LIMITS.free.buildMinutes))}>
              {usage.buildMinutes} / {LIMITS.free.buildMinutes} минут
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                getUsagePercentage(usage.buildMinutes, LIMITS.free.buildMinutes) >= 90
                  ? 'bg-red-500'
                  : getUsagePercentage(usage.buildMinutes, LIMITS.free.buildMinutes) >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getUsagePercentage(usage.buildMinutes, LIMITS.free.buildMinutes), 100)}%` }}
            />
          </div>
        </div>

        {/* Bandwidth */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Upload className="text-cyan-600" size={20} />
              <span className="font-medium">Трафик</span>
            </div>
            <span className={getStatusColor(getUsagePercentage(usage.bandwidthGB, LIMITS.free.bandwidthGB))}>
              {usage.bandwidthGB.toFixed(2)} / {LIMITS.free.bandwidthGB} GB
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                getUsagePercentage(usage.bandwidthGB, LIMITS.free.bandwidthGB) >= 90
                  ? 'bg-red-500'
                  : getUsagePercentage(usage.bandwidthGB, LIMITS.free.bandwidthGB) >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getUsagePercentage(usage.bandwidthGB, LIMITS.free.bandwidthGB), 100)}%` }}
            />
          </div>
        </div>

        {/* Database Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="text-cyan-600" size={20} />
              <span className="font-medium">База данных</span>
            </div>
            <span className={getStatusColor(getUsagePercentage(usage.databaseSize, LIMITS.free.databaseSize))}>
              {usage.databaseSize} / {LIMITS.free.databaseSize} MB
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                getUsagePercentage(usage.databaseSize, LIMITS.free.databaseSize) >= 90
                  ? 'bg-red-500'
                  : getUsagePercentage(usage.databaseSize, LIMITS.free.databaseSize) >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getUsagePercentage(usage.databaseSize, LIMITS.free.databaseSize), 100)}%` }}
            />
          </div>
        </div>

        {/* Storage Size */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Database className="text-cyan-600" size={20} />
              <span className="font-medium">Хранилище</span>
            </div>
            <span className={getStatusColor(getUsagePercentage(usage.storageSize, LIMITS.free.storageSize))}>
              {usage.storageSize} / {LIMITS.free.storageSize} GB
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${
                getUsagePercentage(usage.storageSize, LIMITS.free.storageSize) >= 90
                  ? 'bg-red-500'
                  : getUsagePercentage(usage.storageSize, LIMITS.free.storageSize) >= 75
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(getUsagePercentage(usage.storageSize, LIMITS.free.storageSize), 100)}%` }}
            />
          </div>
        </div>

        {shouldUpgrade && (
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-yellow-800">Рекомендуется обновление плана</h3>
                <p className="text-yellow-700 mt-1">
                  Вы приближаетесь к лимитам бесплатного плана. Рекомендуем рассмотреть переход на Pro план для:
                </p>
                <ul className="mt-2 space-y-1 text-yellow-700">
                  <li>• Увеличения лимитов использования</li>
                  <li>• Доступа к расширенной аналитике</li>
                  <li>• Приоритетной поддержки</li>
                  <li>• Дополнительных функций безопасности</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          * Данные обновляются каждый час
        </div>
      </div>
    </div>
  );
}