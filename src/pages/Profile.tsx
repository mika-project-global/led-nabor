import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Settings, ShoppingBag, Heart, Bell, Star, LogOut } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { useTranslation } from '../hooks/useTranslation';
import { NeonAvatar } from '../components/NeonAvatar';
import { getCurrentUser, signOut } from '../lib/supabase-auth';
import { useEffect, useState } from 'react';
import { SEO } from '../components/SEO';
import { useNotifications } from '../hooks/useNotifications';
import { supabase } from '../lib/supabase';
import { Order } from '../types';
import { getImageUrl } from '../lib/supabase-storage';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string;
  phone: string;
  address: {
    street: string;
    city: string;
    postal_code: string;
    country: string;
  };
  preferences: {
    notifications: boolean;
    newsletter: boolean;
  };
}

export default function Profile() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [activeTab, setActiveTab] = useState('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const { showNotification } = useNotifications();
  const { formatPrice } = useLocale();

  useEffect(() => {
    const loadProfile = async () => {
      const { user, error } = await getCurrentUser();
      if (error || !user) {
        navigate('/');
        return;
      }
      const profile = user.profile;
      setProfile(profile);
      
      // Split full name into first and last name
      const [firstName = '', ...lastNameParts] = profile.full_name?.split(' ') || ['', ''];
      setFirstName(firstName);
      setLastName(lastNameParts.join(' '));
      
      setFormData(profile);
    };
    loadProfile();
  }, [navigate]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!profile?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error loading orders:', error);
        showNotification('error', 'Failed to load orders');
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, [profile?.id, showNotification]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: { ...prev[parent as keyof UserProfile], [child]: value }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      preferences: { ...prev.preferences, [name]: checked }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      // Combine first and last name
      const updatedFormData = {
        ...formData,
        full_name: `${firstName} ${lastName}`.trim()
      };

      const { error } = await supabase
        .from('profiles')
        .update(updatedFormData)
        .eq('id', profile.id);

      if (error) throw error;

      showNotification('success', 'Profile updated successfully');
      setProfile(prev => ({ ...prev, ...updatedFormData }));
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('error', 'Error updating profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'favorites', label: 'Favorites', icon: Heart },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SEO
        title={t('profile.title')}
        description={t('profile.description')}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="w-24 h-24 rounded-full mx-auto mb-4 overflow-hidden">
                {profile.avatar_url ? (
                  <img 
                    src={profile.avatar_url} 
                    alt={profile.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <NeonAvatar
                    letter={profile.full_name?.[0] || profile.email?.[0] || 'U'}
                    size={96}
                    animated={true}
                    className="bg-gradient-to-br from-cyan-50 to-white rounded-full shadow-lg"
                  />
                )}
              </div>
              <h2 className="text-xl font-bold">{profile.full_name}</h2>
              <p className="text-gray-600">{profile.email}</p>
            </div>

            <nav className="space-y-2">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-cyan-50 text-cyan-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <tab.icon size={20} />
                  <span>{tab.label}</span>
                </button>
              ))}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
                <span>Log Out</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-lg p-6">
            {activeTab === 'profile' && (
              <div>
                <h3 className="text-xl font-bold mb-6">Personal Information</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        value={formData.email || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        name="phone"
                        type="tel"
                        value={formData.phone || ''}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-4">{t('profile.delivery_address')}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('profile.street')}
                        </label>
                        <input
                          name="address.street"
                          type="text"
                          value={formData.address?.street || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          City
                        </label>
                        <input
                          name="address.city"
                          type="text"
                          value={formData.address?.city || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Postal Code
                        </label>
                        <input
                          name="address.postal_code"
                          type="text"
                          value={formData.address?.postal_code || ''}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-cyan-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-cyan-500 text-white px-6 py-3 rounded-lg hover:bg-cyan-600 transition-colors"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h3 className="text-xl font-bold mb-6">My Orders</h3>
                {isLoadingOrders ? (
                  <div className="flex justify-center">
                    <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <span className="text-sm text-gray-500">{t('profile.order_from')}</span>
                            <span className="ml-2 font-medium">
                              {new Date(order.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                              order.status === 'completed' || order.status === 'завершенный' ? 'bg-green-100 text-green-800' :
                              order.status === 'pending' || order.status === 'в обработке' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'cancelled' || order.status === 'отменен' ? 'bg-red-100 text-red-800' :
                              order.status === 'shipping' || order.status === 'в пути' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'доставлен' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800' 
                            }`}>
                              {order.status === 'completed' ? 'Completed' :
                               order.status === 'pending' || order.status === 'в обработке' ? 'Processing' :
                               order.status === 'cancelled' || order.status === 'отменен' ? 'Cancelled' :
                               order.status === 'завершенный' ? 'Completed' :
                              order.status === 'shipping' || order.status === 'в пути' ? 'Shipping' :
                               order.status === 'доставлен' ? 'Delivered' :
                               order.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-center gap-4">
                              <img
                                src={getImageUrl(item.image)}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded"
                              />
                              <div className="flex-1">
                                <h4 className="font-medium">{item.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {item.variant.length} meters × {item.quantity} pcs • {formatPrice(item.variant.price)}
                                </p>
                                {item.warranty && (
                                  <p className="text-sm text-cyan-600">
                                    Warranty: {item.warranty.months} months
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="mt-4 pt-4 border-t flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            {order.delivery_method.name}
                          </div>
                          <div className="font-bold">
                            {formatPrice(order.total)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    You don't have any orders yet
                  </div>
                )}
              </div>
            )}

            {activeTab === 'favorites' && (
              <div>
                <h3 className="text-xl font-bold mb-6">{t('profile.tabs.favorites')}</h3>
                <div className="text-center text-gray-500">
                  {t('profile.no_favorites')}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h3 className="text-xl font-bold mb-6">{t('profile.tabs.notifications')}</h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="notifications"
                      checked={formData.preferences?.notifications || false}
                      onChange={handleCheckboxChange}
                      className="rounded text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{t('profile.receive_notifications')}</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      name="newsletter"
                      checked={formData.preferences?.newsletter || false}
                      onChange={handleCheckboxChange}
                      className="rounded text-cyan-500 focus:ring-cyan-500"
                    />
                    <span>{t('profile.subscribe_newsletter')}</span>
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <h3 className="text-xl font-bold mb-6">My Reviews</h3>
                <div className="text-center text-gray-500">
                  You haven't written any reviews yet
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div>
                <h3 className="text-xl font-bold mb-6">Settings</h3>
                <div className="text-gray-500">
                  No settings available at this time
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}