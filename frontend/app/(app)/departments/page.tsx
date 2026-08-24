'use client';

import { useEffect, useState, useCallback } from 'react';
import { departments } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Department } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function DepartmentsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Department | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems(await departments.list(''));
    } catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await departments.create(data);
    toast('Department created', 'success');
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (data: any) => {
    if (!editItem) return;
    await departments.update(editItem.id, data);
    toast('Department updated', 'success');
    setEditItem(null);
    load();
  };

  const handleDelete = async (item: Department) => {
    if (!await confirm('Delete this department?')) return;
    await departments.delete(item.id);
    toast('Department deleted', 'success');
    load();
  };

  const canCreate = user?.role === 'admin' || user?.role === 'govt_officer';

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Departments" subtitle="Maharashtra Government departments" />
      {canCreate && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <Button onClick={() => setShowCreate(true)}>New Department</Button>
        </div>
      )}
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No departments found</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{item.sector} &middot; {item.district}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-400)', marginTop: 4 }}>{item.contact_email}</div>
              </div>
              {canCreate && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="ghost" onClick={() => setEditItem(item)}>Edit</Button>
                  <Button variant="ghost" onClick={() => handleDelete(item)} style={{ color: '#dc2626' }}>Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {(showCreate || editItem) && (
        <Modal title={editItem ? 'Edit Department' : 'New Department'} onClose={() => { setShowCreate(false); setEditItem(null); }}>
          <DepartmentForm initial={editItem} onSubmit={editItem ? handleUpdate : handleCreate} onCancel={() => { setShowCreate(false); setEditItem(null); }} />
        </Modal>
      )}
    </div>
  );
}

function DepartmentForm({ initial, onSubmit, onCancel }: { initial: Department | null; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '', sector: initial?.sector || '', district: initial?.district || 'Pune',
    contact_email: initial?.contact_email || '', contact_phone: initial?.contact_phone || '',
    website: initial?.website || '', address: initial?.address || '',
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{initial ? 'Edit Department' : 'New Department'}</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Department Name" value={form.name} onChange={e => set('name', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Sector" value={form.sector} onChange={e => set('sector', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
          <input placeholder="District" value={form.district} onChange={e => set('district', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <input placeholder="Email" value={form.contact_email} onChange={e => set('contact_email', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
          <input placeholder="Phone" value={form.contact_phone} onChange={e => set('contact_phone', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        </div>
        <input placeholder="Website" value={form.website} onChange={e => set('website', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        <input placeholder="Address" value={form.address} onChange={e => set('address', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(form)}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
}
