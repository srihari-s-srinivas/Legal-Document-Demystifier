import React, { useState } from 'react';
import type { User } from '../types';

interface ProfilePageProps {
  user: User;
  onUpdateProfile: (updatedUser: User) => void;
  onCancel: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile, onCancel }) => {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [contactNumber, setContactNumber] = useState(user.contactNumber || '');
  const [address, setAddress] = useState(user.address || { city: '', state: '', country: '' });
  const [dob, setDob] = useState(user.dob || '');
  const [gender, setGender] = useState(user.gender || 'prefer_not_to_say');
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(user.profilePictureUrl || null);

  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedUser: User = {
      ...user,
      name,
      email,
      contactNumber,
      address,
      dob,
      gender,
      occupation,
      profilePictureUrl: profilePicture || '',
    };
    onUpdateProfile(updatedUser);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-slate-900">Your Profile</h2>
        <p className="text-slate-500 mt-2">Update your personal and professional information below.</p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        {/* Profile Picture Section */}
        <div className="flex items-center space-x-6">
          <div className="shrink-0">
            <img 
              className="h-20 w-20 object-cover rounded-full" 
              src={profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`} 
              alt="Current profile photo" 
            />
          </div>
          <label className="block">
            <span className="sr-only">Choose profile photo</span>
            <input 
              type="file" 
              onChange={handleProfilePictureChange}
              accept="image/*"
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100
              "/>
          </label>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-slate-700">Full Name</label>
              <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">Email Address</label>
              <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="contactNumber" className="block text-sm font-semibold text-slate-700">Contact Number</label>
              <input id="contactNumber" type="tel" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
            </div>
             <div>
              <label htmlFor="occupation" className="block text-sm font-semibold text-slate-700">Occupation / Role</label>
              <input id="occupation" type="text" value={occupation} onChange={(e) => setOccupation(e.target.value)} className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="dob" className="block text-sm font-semibold text-slate-700">Date of Birth</label>
              <input id="dob" type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
            </div>
            <div>
              <label htmlFor="gender" className="block text-sm font-semibold text-slate-700">Gender</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value as User['gender'])} className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm">
                <option value="prefer_not_to_say">Prefer not to say</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            {/* Address Fields */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                 <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-slate-700">City</label>
                    <input id="city" type="text" value={address.city} onChange={(e) => setAddress({...address, city: e.target.value})} className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
                </div>
                <div>
                    <label htmlFor="state" className="block text-sm font-semibold text-slate-700">State / Province</label>
                    <input id="state" type="text" value={address.state} onChange={(e) => setAddress({...address, state: e.target.value})} className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
                </div>
                <div>
                    <label htmlFor="country" className="block text-sm font-semibold text-slate-700">Country</label>
                    <input id="country" type="text" value={address.country} onChange={(e) => setAddress({...address, country: e.target.value})} className="mt-1 w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm" />
                </div>
            </div>
        </div>
        
        <div className="text-sm text-slate-500 p-4 bg-slate-50 rounded-lg flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
            <span>
                <span className="font-semibold">Privacy Notice:</span> Your information is used solely to enhance your experience within this demonstration application and is not shared. For password changes, please use the (not yet implemented) "Forgot Password" feature.
            </span>
        </div>

        <div className="flex justify-end space-x-4 pt-4 border-t border-slate-200">
            <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2.5 bg-white text-slate-700 font-semibold rounded-lg shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors"
            >
                Cancel
            </button>
             <button
                type="submit"
                className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            >
                Save Changes
            </button>
        </div>
      </form>
    </div>
  );
};
