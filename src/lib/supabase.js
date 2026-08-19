import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)
export const supabase = isSupabaseConfigured ? createClient(supabaseUrl, supabaseAnonKey) : null

export async function createEnquiry(payload) {
  if (!supabase) return { demo: true }
  const { error } = await supabase.from('enquiries').insert(payload)
  if (error) {
    const submissionError = new Error(error.message)
    submissionError.code = error.code
    submissionError.details = error.details
    submissionError.hint = error.hint
    throw submissionError
  }
  return { demo: false }
}

export async function createContact(payload) {
  if (!supabase) return { demo: true }
  const { error } = await supabase.from('contacts').insert(payload)
  if (error) {
    const submissionError = new Error(error.message)
    submissionError.code = error.code
    submissionError.details = error.details
    submissionError.hint = error.hint
    throw submissionError
  }
  return { demo: false }
}

export async function getProjects() {
  if (!supabase) return { data: null, error: null }
  return supabase.from('projects').select('*').order('created_at', { ascending: false })
}

export async function getServices() {
  if (!supabase) return { data: null, error: null }
  return supabase.from('services').select('*').order('created_at', { ascending: true })
}

export async function getWebsiteStatistics() {
  if (!supabase) return { data: null, error: null }
  return supabase.from('website_statistics').select('*').order('display_order', { ascending: true })
}

export async function updateWebsiteStatistic(id, payload) {
  if (!supabase) throw new Error('Supabase is not configured')
  const { data, error } = await supabase.from('website_statistics').update(payload).eq('id', id).select().single()
  if (error) throw new Error('Unable to update website statistic')
  return data
}

export async function uploadEnquiryAttachment(file) {
  if (!supabase || !file || !file.name || file.size === 0) return null
  const path = `${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '-')}`
  const { error } = await supabase.storage.from('enquiry-attachments').upload(path, file, { upsert: false })
  if (error) throw new Error('Unable to upload attachment')
  return path
}
