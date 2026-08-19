import { useEffect, useState } from 'react'
import { ArrowUpRight, Check, LogOut, Plus, RefreshCw, Save, Trash2, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { isSupabaseConfigured, supabase } from '../lib/supabase'
import WebsiteStatistics from './WebsiteStatistics'

const statuses = ['New', 'Contacted', 'In Discussion', 'Proposal Sent', 'Won', 'Lost']
const emptyProject = { title: '', description: '', category: '', technologies: '', image_url: '', featured: false }
const ADMIN_EMAIL = 'sanjaygowdaca5@gmail.com'

function AdminWorkspace() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  const [authError, setAuthError] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [enquiries, setEnquiries] = useState([])
  const [contacts, setContacts] = useState([])
  const [projects, setProjects] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [project, setProject] = useState(null)

  useEffect(() => {
    if (!supabase) return undefined
    function acceptSession(nextSession) {
      const nextEmail = nextSession?.user?.email?.toLowerCase()
      if (nextSession && nextEmail !== ADMIN_EMAIL) {
        setAuthError('This account is not authorized to access the Synsphere admin workspace.')
        console.error('Synsphere admin authorization rejected:', { email: nextSession.user.email })
        void supabase.auth.signOut()
        setSession(null)
        return
      }
      setAuthError('')
      setSession(nextSession)
    }
    supabase.auth.getSession().then(({ data }) => acceptSession(data.session)).catch((error) => {
      console.error('Synsphere admin session restore failed:', error)
      setAuthError('Unable to restore the admin session. Please sign in again.')
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => acceptSession(nextSession))
    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (session) loadWorkspace()
  }, [session])

  async function loadWorkspace() {
    setLoading(true)
    const [enquiryResult, contactResult, projectResult] = await Promise.all([
      supabase.from('enquiries').select('*').order('created_at', { ascending: false }),
      supabase.from('contacts').select('*').order('created_at', { ascending: false }),
      supabase.from('projects').select('*').order('created_at', { ascending: false }),
    ])
    if (enquiryResult.error || contactResult.error || projectResult.error) {
      console.error('Synsphere admin data load failed:', { enquiries: enquiryResult.error, contacts: contactResult.error, projects: projectResult.error })
      setAuthError('Your account is signed in, but it is not authorized to read the admin workspace.')
    }
    setEnquiries(enquiryResult.data || [])
    setContacts(contactResult.data || [])
    setProjects(projectResult.data || [])
    setLoading(false)
  }

  async function signIn(event) {
    event.preventDefault()
    setAuthError('')
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) {
      console.error('Synsphere admin sign-in failed:', error)
      setAuthError('Sign in failed. Check your credentials or ask an administrator to enable your account.')
    }
  }

  async function updateStatus(id, status) {
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', id)
    if (error) {
      setMessage('Status could not be updated.')
      return
    }
    setEnquiries((items) => items.map((item) => item.id === id ? { ...item, status } : item))
  }

  async function saveProject(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const payload = {
      title: form.get('title'), description: form.get('description'), category: form.get('category'),
      technologies: String(form.get('technologies') || '').split(',').map((value) => value.trim()).filter(Boolean),
      image_url: form.get('image_url') || null, featured: form.get('featured') === 'on',
    }
    const query = project?.id ? supabase.from('projects').update(payload).eq('id', project.id).select().single() : supabase.from('projects').insert(payload).select().single()
    const { data, error } = await query
    if (error) {
      setMessage('Project could not be saved. Check your admin permissions.')
      return
    }
    setProjects((items) => project?.id ? items.map((item) => item.id === project.id ? data : item) : [data, ...items])
    setProject(null)
    setMessage('Project saved.')
  }

  async function deleteProject(id) {
    if (!window.confirm('Delete this project?')) return
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) {
      setMessage('Project could not be deleted.')
      return
    }
    setProjects((items) => items.filter((item) => item.id !== id))
  }

  if (!isSupabaseConfigured) return <main className="admin-login"><div className="login-panel"><img src="/synsphere-logo.png" alt="SynSphere Technologies Pvt Ltd" className="h-20 w-auto object-contain" /><span className="eyebrow">Supabase required</span><h1>Connect the workspace.</h1><p>Add Supabase environment variables before using admin authentication.</p><Link className="button primary" to="/">Return to website <ArrowUpRight size={16} /></Link></div></main>
  if (!session) return <main className="admin-login"><form className="login-panel" onSubmit={signIn}><img src="/synsphere-logo.png" alt="SynSphere Technologies Pvt Ltd" className="h-20 w-auto object-contain" /><span className="eyebrow">Secure workspace</span><h1>Admin sign in</h1><p>Use the Supabase Auth account created for your authorized admin.</p>{authError && <div className="form-error" role="alert">{authError}</div>}<input aria-label="Email address" placeholder="Email address" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /><input aria-label="Password" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button className="button primary" type="submit">Continue <ArrowUpRight size={16} /></button></form></main>

  const visibleEnquiries = enquiries.filter((item) => (filter === 'All' || item.status === filter) && `${item.name} ${item.company_name} ${item.service}`.toLowerCase().includes(search.toLowerCase()))
  const newCount = enquiries.filter((item) => item.status === 'New').length
  const discussionCount = enquiries.filter((item) => item.status === 'In Discussion').length

  return <main className="dashboard"><div className="dashboard-top"><div><span className="eyebrow">Synsphere workspace</span><h1>Good morning, team.</h1></div><div className="hero-actions"><button className="button ghost" onClick={loadWorkspace}><RefreshCw size={15} /> Refresh</button><button className="button ghost" onClick={() => supabase.auth.signOut()}><LogOut size={15} /> Sign out</button></div></div>{authError && <div className="form-error" role="alert">{authError}</div>}{message && <div className="success"><Check size={16} /> {message}</div>}<WebsiteStatistics onMessage={setMessage} /><div className="dashboard-stats">{[[enquiries.length, 'Total enquiries'], [newCount, 'New enquiries'], [discussionCount, 'In discussion'], [projects.length, 'Total projects'], [contacts.length, 'Contact messages']].map(([value, label]) => <div key={label}><span>{label}</span><strong>{loading ? '...' : value}</strong><small>Live from Supabase</small></div>)}</div><section className="dashboard-table"><div className="table-heading"><div><span className="eyebrow">Pipeline</span><h2>Recent enquiries</h2></div><div className="table-tools"><div className="search"><input aria-label="Search enquiries" placeholder="Search enquiries" value={search} onChange={(event) => setSearch(event.target.value)} /></div><select aria-label="Filter status" value={filter} onChange={(event) => setFilter(event.target.value)}><option>All</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></div></div><div className="table-scroll"><table><thead><tr><th>Name</th><th>Company</th><th>Country</th><th>Service</th><th>Budget</th><th>Date</th><th>Status</th></tr></thead><tbody>{visibleEnquiries.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.company_name || '-'}</td><td>{item.country || '-'}</td><td>{item.service}</td><td>{item.budget || '-'}</td><td>{new Date(item.created_at).toLocaleDateString()}</td><td><select className="status-select" value={item.status} onChange={(event) => updateStatus(item.id, event.target.value)}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></td></tr>)}</tbody></table>{!visibleEnquiries.length && <p className="empty-state">No enquiries match this view.</p>}</div></section><section className="dashboard-table"><div className="table-heading"><div><span className="eyebrow">Contacts</span><h2>Recent contact messages</h2></div></div><div className="table-scroll"><table><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th></tr></thead><tbody>{contacts.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.email}</td><td>{item.phone || '-'}</td><td>{item.message}</td><td>{new Date(item.created_at).toLocaleDateString()}</td></tr>)}</tbody></table>{!contacts.length && <p className="empty-state">No contact messages yet.</p>}</div></section><section className="dashboard-table project-manager"><div className="table-heading"><div><span className="eyebrow">Portfolio</span><h2>Project management</h2></div><button className="button primary" onClick={() => setProject(emptyProject)}><Plus size={15} /> Add project</button></div><div className="project-admin-list">{projects.map((item) => <article key={item.id}><div><span className="tag">{item.category || 'Case study'}</span><h3>{item.title}</h3><p>{item.description}</p></div><div className="project-admin-actions"><button aria-label={`Edit ${item.title}`} onClick={() => setProject({ ...item, technologies: (item.technologies || []).join(', ') })}><Save size={15} /></button><button aria-label={`Delete ${item.title}`} onClick={() => deleteProject(item.id)}><Trash2 size={15} /></button></div></article>)}</div></section>{project && <div className="modal-backdrop"><form className="project-modal" onSubmit={saveProject}><button type="button" className="modal-close" onClick={() => setProject(null)}><X /></button><span className="eyebrow">{project.id ? 'Edit project' : 'New project'}</span><h2>Project details</h2><label>Title<input name="title" defaultValue={project.title} required /></label><label>Category<input name="category" defaultValue={project.category} /></label><label>Description<textarea name="description" defaultValue={project.description} rows="4" required /></label><label>Technologies<input name="technologies" defaultValue={project.technologies} placeholder="React, Python, Supabase" /></label><label>Image URL<input name="image_url" defaultValue={project.image_url || ''} placeholder="Optional Supabase Storage URL" /></label><label className="check-label"><input type="checkbox" name="featured" defaultChecked={project.featured} /> Featured project</label><button className="button primary" type="submit"><Check size={15} /> Save project</button></form></div>}</main>
}

export default AdminWorkspace
