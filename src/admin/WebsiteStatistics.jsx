import { useEffect, useState } from 'react'
import { Edit3, Save, X } from 'lucide-react'
import { getWebsiteStatistics, updateWebsiteStatistic } from '../lib/supabase'
import './website-statistics.css'

function WebsiteStatistics({ onMessage }) {
  const [statistics, setStatistics] = useState([])
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getWebsiteStatistics().then(({ data }) => {
      setStatistics(data || [])
      setLoading(false)
    })
  }, [])

  async function saveStatistic(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      const updated = await updateWebsiteStatistic(editing.id, {
        stat_value: form.get('value'),
        stat_label: form.get('label'),
      })
      setStatistics((items) => items.map((item) => item.id === updated.id ? updated : item))
      setEditing(null)
      onMessage('Statistics updated successfully.')
    } catch {
      onMessage('Statistics could not be updated.')
    }
  }

  return <section className="dashboard-table website-statistics"><div className="table-heading"><div><span className="eyebrow">Content controls</span><h2>Website Statistics</h2></div></div><div className="website-stat-grid">{loading ? <p className="empty-state">Loading statistics...</p> : statistics.map((stat) => <article className="website-stat-card" key={stat.id}><span className="eyebrow">{stat.stat_key.replaceAll('_', ' ')}</span><strong>{stat.stat_value}</strong><b>{stat.stat_label}</b><button className="button ghost" onClick={() => setEditing(stat)}><Edit3 size={14} /> Edit</button></article>)}</div>{editing && <div className="modal-backdrop"><form className="project-modal" onSubmit={saveStatistic}><button type="button" className="modal-close" onClick={() => setEditing(null)}><X /></button><span className="eyebrow">Website Statistics</span><h2>Edit {editing.stat_label.toLowerCase()}</h2><label>Value<input name="value" defaultValue={editing.stat_value} required /></label><label>Label<input name="label" defaultValue={editing.stat_label} required /></label><div className="hero-actions"><button type="submit" className="button primary"><Save size={15} /> Save</button><button type="button" className="button ghost" onClick={() => setEditing(null)}>Cancel</button></div></form></div>}</section>
}

export default WebsiteStatistics
