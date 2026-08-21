'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { GUJARAT_DISTRICTS } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function ProfilePage() {
  const [name, setName] = useState('Demo Administrator');
  const [district, setDistrict] = useState('Ahmedabad');
  const [organization, setOrganization] = useState('UdaanSetu Platform');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    alert('Profile updated');
  };

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPw || !newPw) { alert('Fill in both password fields'); return; }
    if (newPw.length < 8) { alert('New password must be at least 8 characters'); return; }
    if (!/[A-Z]/.test(newPw)) { alert('Must contain uppercase letter'); return; }
    if (!/[a-z]/.test(newPw)) { alert('Must contain lowercase letter'); return; }
    if (!/[0-9]/.test(newPw)) { alert('Must contain a digit'); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1000));
    setSaving(false);
    setCurrentPw(''); setNewPw('');
    alert('Password changed');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      <Card>
        <CardHeader><CardTitle>Account Info</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-4"><span className="text-sm text-muted-foreground w-24">Email</span><span className="text-sm font-medium">admin@udaansetu.demo</span></div>
          <div className="flex gap-4"><span className="text-sm text-muted-foreground w-24">Role</span><span className="text-sm font-medium capitalize">admin</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleProfile} className="space-y-4">
            <div className="space-y-2"><Label>Name</Label><Input value={name} onChange={e => setName(e.target.value)} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>District</Label><Select value={district} onValueChange={setDistrict}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{GUJARAT_DISTRICTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Organization</Label><Input value={organization} onChange={e => setOrganization(e.target.value)} /></div>
            </div>
            <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePassword} className="space-y-4">
            <div className="space-y-2"><Label>Current Password</Label><Input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} autoComplete="current-password" /></div>
            <div className="space-y-2"><Label>New Password</Label><Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 8 chars, 1 uppercase, 1 lowercase, 1 digit" autoComplete="new-password" /></div>
            <Button type="submit" variant="secondary" disabled={saving}>{saving ? 'Changing...' : 'Change Password'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}