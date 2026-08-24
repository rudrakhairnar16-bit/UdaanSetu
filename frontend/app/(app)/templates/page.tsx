'use client';

import { useEffect, useState, useCallback } from 'react';
import { templates } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import type { Template } from '../../lib/types';
import { Modal } from '../../components/Modal';
import { Button, PageHeader } from '../../components/ui';
import { useToast } from '../../components/Toast';
import { useConfirm } from '../../components/ConfirmDialog';

export default function TemplatesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const [items, setItems] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<Template | null>(null);
  const [detail, setDetail] = useState<Template | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await templates.list('')); }
    catch (e: any) { toast(e.message, 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (data: any) => {
    await templates.create(data);
    toast('Template created', 'success');
    setShowCreate(false);
    load();
  };

  const handleUpdate = async (data: any) => {
    if (!editItem) return;
    await templates.update(editItem.id, data);
    toast('Template updated', 'success');
    setEditItem(null);
    load();
  };

  const handleDelete = async (item: Template) => {
    if (!await confirm('Delete this template?')) return;
    await templates.delete(item.id);
    toast('Template deleted', 'success');
    load();
  };

  const canCreate = user?.role === 'admin' || user?.role === 'govt_officer';

  return (
    <div style={{ padding: '0 0 40px' }}>
      <PageHeader title="Templates" subtitle="Contract and policy templates" />
      {canCreate && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 20 }}>
          <Button onClick={() => setShowCreate(true)}>New Template</Button>
        </div>
      )}
      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>Loading...</div> : items.length === 0 ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--gray-500)' }}>No templates found</div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {items.map(item => (
            <div key={item.id} onClick={() => setDetail(item)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 4 }}>{item.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Type: {item.type} &middot; Version: {item.version}</div>
                <div style={{ fontSize: 12, color: item.is_active ? '#b37209' : '#dc2626', marginTop: 4 }}>{item.is_active ? 'Active' : 'Inactive'}</div>
              </div>
              {canCreate && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); setEditItem(item); }}>Edit</Button>
                  <Button variant="ghost" onClick={(e) => { e.stopPropagation(); handleDelete(item); }} style={{ color: '#dc2626' }}>Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {(showCreate || editItem) && (
        <Modal title={editItem ? 'Edit Template' : 'New Template'} onClose={() => { setShowCreate(false); setEditItem(null); }}>
          <TemplateForm initial={editItem} onSubmit={editItem ? handleUpdate : handleCreate} onCancel={() => { setShowCreate(false); setEditItem(null); }} />
        </Modal>
      )}

      {detail && (
        <Modal title="Template Details" onClose={() => setDetail(null)}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{detail.name}</h2>
            <div style={{ fontSize: 13, color: 'var(--gray-400)', marginBottom: 12 }}>
              <div><strong>Type:</strong> {detail.type}</div>
              <div><strong>Version:</strong> {detail.version}</div>
              <div><strong>Status:</strong> {detail.is_active ? 'Active' : 'Inactive'}</div>
            </div>
            <pre style={{ background: 'var(--bg)', padding: 16, borderRadius: 8, fontSize: 12, overflow: 'auto', maxHeight: 400, color: 'var(--text)', border: '1px solid var(--border)' }}>
              {JSON.stringify(detail.content, null, 2)}
            </pre>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <Button variant="ghost" onClick={() => setDetail(null)}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function TemplateForm({ initial, onSubmit, onCancel }: { initial: Template | null; onSubmit: (d: any) => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: initial?.name || '', type: initial?.type || 'contract', version: initial?.version || '1.0',
    is_active: initial?.is_active ?? true, content: JSON.stringify(initial?.content || { sections: [] }, null, 2),
  });
  const set = (k: string, v: any) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{initial ? 'Edit Template' : 'New Template'}</h2>
      <div style={{ display: 'grid', gap: 12 }}>
        <input placeholder="Template Name" value={form.name} onChange={e => set('name', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <select value={form.type} onChange={e => set('type', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
            <option value="contract">Contract</option><option value="policy">Policy</option><option value="evaluation">Evaluation</option>
            <option value="rfp">RFP</option><option value="nda">NDA</option><option value="other">Other</option>
          </select>
          <input placeholder="Version" value={form.version} onChange={e => set('version', e.target.value)} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 14 }} />
        </div>
        <textarea placeholder='Template Content (JSON)' value={form.content} onChange={e => set('content', e.target.value)} rows={8} style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: 12, fontFamily: 'monospace' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => { try { onSubmit({ ...form, content: JSON.parse(form.content) }); } catch { /* invalid JSON */ } }}>{initial ? 'Update' : 'Create'}</Button>
      </div>
    </div>
  );
}
