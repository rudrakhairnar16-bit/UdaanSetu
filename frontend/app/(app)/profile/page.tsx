'use client';

import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { useToast } from '../../components/Toast';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.patch('/auth/me', { name, district, organization });
      toast('Profile updated');
    } catch (err: any) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) { toast('Fill in both password fields', 'error'); return; }
    if (newPw.length < 8) { toast('New password must be at least 8 characters', 'error'); return; }
    if (!/[A-Z]/.test(newPw)) { toast('New password must contain an uppercase letter', 'error'); return; }
    if (!/[a-z]/.test(newPw)) { toast('New password must contain a lowercase letter', 'error'); return; }
    if (!/[0-9]/.test(newPw)) { toast('New password must contain a digit', 'error'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { current_password: currentPw, new_password: newPw });
      toast('Password changed');
      setCurrentPw(''); setNewPw('');
    } catch (err: any) {
      toast(err.message || 'Failed to change password', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 600 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>Profile Settings</h1>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Account Info</h3>
        <div style={{ display: 'grid', gap: 4, fontSize: 14, color: 'var(--gray-600)' }}>
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user?.role}</span></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Edit Profile</h3>
        <form onSubmit={handleProfile} style={{ display: 'grid', gap: 12 }}>
          <div className="form-group"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
          <div className="form-row">
            <div className="form-group"><label>District</label><input value={district} onChange={e => setDistrict(e.target.value)} /></div>
            <div className="form-group"><label>Organization</label><input value={organization} onChange={e => setOrganization(e.target.value)} /></div>
          </div>
          <div><button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button></div>
        </form>
      </div>

      <div className="card">
        <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Change Password</h3>
        <form onSubmit={handlePassword} style={{ display: 'grid', gap: 12 }}>
          <div className="form-group"><label>Current Password</label><input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} /></div>
          <div className="form-group"><label>New Password</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 digit" /></div>
          <div><button type="submit" className="btn btn-secondary" disabled={saving}>Change Password</button></div>
        </form>
      </div>
    </div>
  );
}
