import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [message, setMessage] = useState('');
  const [cohort, setCohort] = useState('All');
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    api.get('/admin/newsletter/subscribers').then(({ data }) => setSubscribers(data.data || []));
    api.get('/admin/newsletter/campaigns').then(({ data }) => setCampaigns(data));
  }, []);

  const sendCampaign = async (event) => {
    event.preventDefault();
    const { data } = await api.post('/admin/newsletter/campaigns', { subject, body, cohort });
    setMessage(`${data.message} ${data.queued_recipients} recipient(s).`);
    setSubject('');
    setBody('');
  };

  const saveDraft = async () => {
    const { data } = await api.post('/admin/newsletter/campaigns/drafts', { subject, body, cohort });
    setCampaigns((items) => [data.campaign, ...items]);
    setMessage(data.message);
  };

  const sendDraft = async (campaignId) => {
    const { data } = await api.post(`/admin/newsletter/campaigns/${campaignId}/send`);
    setCampaigns((items) => items.map((item) => item.id === campaignId ? data.campaign : item));
    setMessage(`${data.message} ${data.queued_recipients} recipient(s).`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white p-6 sm:p-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-bold">Newsletter Campaigns</h1>
          <p className="text-slate-400 mt-1">Send community updates to {subscribers.filter((item) => item.is_active).length} active subscriber(s).</p>
        </header>

        <form onSubmit={sendCampaign} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div>
            <label htmlFor="campaign-cohort" className="block text-sm text-slate-300 mb-1">Recipient cohort</label>
            <select id="campaign-cohort" value={cohort} onChange={(event) => setCohort(event.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3">
              <option>All</option>
              <option>General</option>
              <option>AI</option>
              <option>Web Development</option>
              <option>EdTech</option>
              <option>Internet Governance</option>
            </select>
          </div>
          <div>
            <label htmlFor="campaign-subject" className="block text-sm text-slate-300 mb-1">Subject</label>
            <input id="campaign-subject" required value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3" />
          </div>
          <div>
            <label htmlFor="campaign-body" className="block text-sm text-slate-300 mb-1">Message</label>
            <textarea id="campaign-body" required minLength={10} rows={8} value={body} onChange={(event) => setBody(event.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3" />
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={saveDraft} className="bg-slate-700 hover:bg-slate-600 rounded-xl px-5 py-3 font-semibold">Save Draft</button>
            <button className="bg-blue-600 hover:bg-blue-500 rounded-xl px-5 py-3 font-semibold">Queue Campaign</button>
          </div>
          {message && <p role="status" className="text-emerald-400 text-sm">{message}</p>}
        </form>

        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Saved Campaigns</h2>
          <div className="space-y-3">
            {campaigns.length === 0 && <p className="text-sm text-slate-400">No saved campaigns.</p>}
            {campaigns.map((campaign) => (
              <article key={campaign.id} className="border border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{campaign.subject}</p>
                  <p className="text-xs text-slate-400">{campaign.cohort} · {campaign.status}{campaign.sent_at ? ` · ${new Date(campaign.sent_at).toLocaleString()}` : ''}</p>
                </div>
                {campaign.status === 'Draft' && <button onClick={() => sendDraft(campaign.id)} className="bg-blue-600 hover:bg-blue-500 rounded-lg px-4 py-2 text-sm font-semibold">Send Draft</button>}
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
