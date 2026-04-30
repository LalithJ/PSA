import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  UserIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  CameraIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Link } from "react-router-dom";

interface ProfileFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
}

const UserProfile: React.FC = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      location: user?.location || '',
      bio: user?.bio || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile({
        ...user,
        ...data,
        avatar: avatarPreview || user?.avatar,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    reset();
    setAvatarPreview(null);
  };

  return (
    <div className="min-h-screen bg-linkedin-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-linkedin overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-linkedin-blue to-linkedin-darkBlue"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end -mt-16">
              <div className="relative">
                <img
                  src={avatarPreview || user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'}
                  alt={`${user?.firstName} ${user?.lastName}`}
                  className="h-32 w-32 rounded-full border-4 border-white object-cover"
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-linkedin-blue text-white p-2 rounded-full cursor-pointer hover:bg-linkedin-darkBlue transition-colors">
                    <CameraIcon className="h-4 w-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <p className="text-gray-600">{user?.email}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      <span>{user?.location || 'Location not set'}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-3">
                    {isEditing ? (
                      <>
                        <button
                          onClick={handleSubmit(onSubmit)}
                          disabled={loading}
                          className="bg-linkedin-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue disabled:opacity-50 flex items-center"
                        >
                          <CheckIcon className="h-4 w-4 mr-1" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-400 flex items-center"
                        >
                          <XMarkIcon className="h-4 w-4 mr-1" />
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-linkedin-blue text-white px-4 py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Profile Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section */}
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
              {isEditing ? (
                <textarea
                  {...register('bio')}
                  rows={4}
                  placeholder="Tell us about yourself..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                />
              ) : (
                <p className="text-gray-600">
                  {user?.bio || "No bio available. Click 'Edit Profile' to add one."}
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      {...register('email', {
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        },
                      })}
                      type="email"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                    />
                  ) : (
                    <span className="text-gray-600">{user?.email}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      {...register('phone')}
                      type="tel"
                      placeholder="Phone number"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                    />
                  ) : (
                    <span className="text-gray-600">{user?.phone || 'Not set'}</span>
                  )}
                </div>
                
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                  {isEditing ? (
                    <input
                      {...register('location')}
                      type="text"
                      placeholder="Location"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-linkedin-blue focus:border-linkedin-blue"
                    />
                  ) : (
                    <span className="text-gray-600">{user?.location || 'Not set'}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Activity Summary */}
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Summary</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-linkedin-blue">1,247</div>
                  <div className="text-sm text-gray-600">Total Searches</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-500">89</div>
                  <div className="text-sm text-gray-600">Exports</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">156</div>
                  <div className="text-sm text-gray-600">This Month</div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-500">94%</div>
                  <div className="text-sm text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subscription Plan */}
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Plan</h2>
              <div className="text-center">
                <div className="text-2xl font-bold text-linkedin-blue mb-2">
                  {user?.subscriptionPlan?.name ? user.subscriptionPlan.name.charAt(0).toUpperCase() + user.subscriptionPlan.name.slice(1) : 'Free'}
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  ${user?.subscriptionPlan?.price}
                  <span className="text-sm text-gray-500">/month</span>
                </div>
                <div className="text-sm text-gray-600 mb-4">
                  {user?.subscriptionPlan?.searchLimit === -1 ? 'Unlimited' : user?.subscriptionPlan?.searchLimit} searches
                </div>
                <Link
  to="/plans"
  className="w-full bg-linkedin-blue text-white py-2 rounded-lg font-medium hover:bg-linkedin-darkBlue text-center block"
>
  Upgrade Plan
</Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">Download Data</div>
                  <div className="text-sm text-gray-600">Export your search history</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">Privacy Settings</div>
                  <div className="text-sm text-gray-600">Manage your privacy</div>
                </button>
                <button className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="font-medium text-gray-900">Notification Preferences</div>
                  <div className="text-sm text-gray-600">Customize notifications</div>
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-linkedin p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-linkedin-blue rounded-full mr-3"></div>
                  <span className="text-gray-600">Searched for "Software Engineers"</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Exported 25 contacts</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                  <span className="text-gray-600">Updated profile</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
