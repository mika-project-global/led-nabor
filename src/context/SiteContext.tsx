import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SiteContextType {
  siteLogo: string | undefined;
  setSiteLogo: (url: string) => void;
  siteSettings: Record<string, any>;
  updateSiteSetting: (key: string, value: any) => Promise<void>;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [siteLogo, setSiteLogo] = useState<string | undefined>('/favicon/favicon.svg');
  const [siteSettings, setSiteSettings] = useState<Record<string, any>>({});
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2 seconds

  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log('Loading site settings...');

        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .eq('key', 'logo')
          .single();
        
        if (error) {
          if (error.code === 'PGRST116') { // Not found error
            console.log('No logo settings found, using default');
            return;
          }
          throw error;
        }

        if (data) {
          console.log('Site settings loaded:', data);
          const logoUrl = data.value?.url;
          console.log('Setting logo URL:', logoUrl);
          if (logoUrl) {
            setSiteLogo(logoUrl);
          }
        }
      } catch (error) {
        console.error('Error loading site settings:', error);
        
        if (retryCount < MAX_RETRIES) {
          console.log(`Retrying in ${RETRY_DELAY}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, RETRY_DELAY);
        } else {
          console.error('Max retries reached, using default logo');
          setSiteLogo('/favicon/favicon.svg');
        }
      }
    };

    loadSettings();
  }, [retryCount]); // Add retryCount as dependency

  const updateLogo = async (url: string) => {
    console.log('Updating logo URL:', url);
    const finalUrl = url || '/favicon/favicon.svg';

    try {
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          key: 'logo',
          value: { url: finalUrl, alt: 'LED Nabor' }
        })
        .select();

      if (error) throw error;

      setSiteLogo(finalUrl);
      console.log('Logo URL updated successfully');
    } catch (error) {
      console.error('Error updating logo:', error);
      console.log('Keeping current logo due to update failure');
    }
  };

  const updateSiteSetting = async (key: string, value: any) => {
    try {
      console.log(`Updating site setting ${key}:`, value);
      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          key,
          value
        });

      if (error) throw error;

      setSiteSettings(prev => ({
        ...prev,
        [key]: value
      }));
      console.log(`Site setting ${key} updated successfully`);
    } catch (error) {
      console.error(`Error updating ${key}:`, error);
      // Keep the current settings if update fails
      console.log(`Keeping current ${key} setting due to update failure`);
    }
  };

  return (
    <SiteContext.Provider value={{ 
      siteLogo, 
      setSiteLogo: updateLogo,
      siteSettings,
      updateSiteSetting
    }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (context === undefined) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}