import { useState } from 'react'
import { ArrowUpRight, BriefcaseBusiness, Camera, Check } from 'lucide-react'
import { company } from '../data/site'
import { createContact, createEnquiry, isSupabaseConfigured, uploadEnquiryAttachment } from '../lib/supabase'

const serviceOptions = ['Software Development', 'Web Development', 'Mobile Development', 'Data Collection', 'Data Processing', 'Data Annotation', 'Data Analytics', 'AI/ML', 'Generative AI', 'Automation', 'API Integration', 'Technical Support', 'Other']

function ContactPage() {
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [sending, setSending] = useState(false)
  async function submit(event) {
    event.preventDefault()
    const formElement = event.currentTarget
    const form = new FormData(formElement)
    if (!form.get('name') || !form.get('email') || !form.get('service') || !form.get('description')) { setError('Please complete the required fields so we can understand your request.'); return }
    setSending(true); setError('')
    try {
      const attachmentUrl = await uploadEnquiryAttachment(form.get('attachment'))
      await createEnquiry({ name: form.get('name'), company_name: form.get('company'), email: form.get('email'), phone: form.get('phone'), country: form.get('country'), service: form.get('service'), budget: form.get('budget'), timeline: form.get('timeline'), project_description: form.get('description'), attachment_url: attachmentUrl, source: form.get('source') })
      try {
        await createContact({ name: form.get('name'), email: form.get('email'), phone: form.get('phone'), message: form.get('description') })
      } catch (contactError) {
        console.warn('Synsphere contact mirror insert failed after enquiry was stored:', contactError)
      }
      setSent(true); formElement.reset()
    } catch (submissionError) { console.error('Synsphere enquiry submission failed:', submissionError); setError('We could not send your enquiry right now. Please try again or email us directly.') } finally { setSending(false) }
  }
  return <><section className="page-intro"><span className="eyebrow">Contact</span><h1>Let’s build something together.</h1><p>Bring us the challenge, the opportunity or simply the question. We’ll help you find the next useful step.</p></section><section className="section contact-layout"><div className="contact-info"><span className="eyebrow">{company.name}</span><h2>Good work starts with a clear conversation.</h2><div className="contact-detail"><span>Based in</span><b>{company.location}</b></div><div className="contact-detail"><span>Email</span><b>{company.email}</b></div><div className="contact-links"><a href={`mailto:${company.email}`} aria-label="Email Synsphere Technologies">Email us <ArrowUpRight size={15} /></a><a href={company.instagram} target="_blank" rel="noopener noreferrer" aria-label="Synsphere Technologies Instagram"><Camera size={15} /> Instagram</a><a href={company.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Synsphere Technologies LinkedIn"><BriefcaseBusiness size={15} /> LinkedIn</a></div></div>{sent ? <div className="success"><Check size={24} /><h3>Thank you! Your enquiry has been submitted successfully.</h3><p>Our team will review your requirement and contact you shortly.</p></div> : <form className="quote-form" onSubmit={submit}><div className="form-heading"><span className="eyebrow">Start a conversation</span><h2>Tell us what you’re building.</h2><p>Share a little context. We’ll bring the right questions and people to the first call.</p></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="form-grid"><label>Full name *<input name="name" placeholder="Your name" required /></label><label>Company name<input name="company" placeholder="Company or organization" /></label><label>Business email *<input name="email" type="email" placeholder="you@company.com" required /></label><label>Phone number<input name="phone" placeholder="Optional" /></label><label>Country<input name="country" placeholder="Where are you based?" /></label><label>Service required *<select name="service" defaultValue="" required><option value="" disabled>Select a service</option>{serviceOptions.map((option) => <option key={option}>{option}</option>)}</select></label><label>Estimated budget<select name="budget" defaultValue=""><option value="">Select a range</option><option>Below $1,000</option><option>$1,000-$5,000</option><option>$5,000-$10,000</option><option>$10,000+</option><option>Discuss with us</option></select></label><label>Project timeline<select name="timeline" defaultValue=""><option value="">Select a timeline</option><option>ASAP</option><option>1 Month</option><option>1-3 Months</option><option>3-6 Months</option><option>Flexible</option></select></label><label className="full">Project description *<textarea name="description" rows="5" placeholder="What would you like to make possible?" required /></label><label className="full">File upload<input name="attachment" type="file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg" /></label><label className="full">How did you hear about us?<input name="source" placeholder="Search, referral, LinkedIn..." /></label></div><button className="button primary" type="submit" disabled={sending}>{sending ? 'Sending...' : 'Send project request'} <ArrowUpRight size={16} /></button><small>{isSupabaseConfigured ? 'Your enquiry will be stored securely in Supabase.' : `Demo mode is active. Configure Supabase before launch.`}</small></form>}</section></>
}

export default ContactPage
