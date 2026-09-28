import { FormEvent, useEffect, useState } from 'react'
import { Film, Plus } from 'lucide-react'
import { supabase } from '../lib/supabaseClient'
import { Profile, Project, ProjectStatus } from '../types'
import { useAuth } from '../context/AuthContext'
import { AvatarGroup, Modal, PROJECT_STATUS, ProgressBar } from '../lib/ui'

const BANNERS = [
  { bg: 'bg-lavender', ic: 'text-primary' },
  { bg: 'bg-mint', ic: 'text-[#23734F]' },
  { bg: 'bg-yellow', ic: 'text-[#9A5B00]' },
  { bg: 'bg-pink', ic: 'text-[#B4324A]' },
]

function ProjectForm({ initial, people, onClose, onSaved }: {
  initial: Partial<Project>
  people: Profile[]
  onClose: () => void
  onSaved: () => void
}) {
  const isNew = !initial.id
  const [f, setF] = useState({
    name: initial.name || '',
    type: initial.type || '',
    description: initial.description || '',
    deadline: initial.deadline || '',
    status: (initial.status || 'planning') as ProjectStatus,
    progress: initial.progress ?? 0,
    team: (initial.team || []) as string[],
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [confirmDel, setConfirmDel] = useState(false)

  async function save(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const payload = {
      name: f.name.trim(),
      type: f.type || null,
      description: f.description || null,
      deadline: f.deadline || null,
      status: f.status,
      progress: Number(f.progress),
      team: f.team,
    }
    const { error } = isNew
      ? await supabase.from('projects').insert(payload)
      : await supabase.from('projects').update(payload).eq('id', initial.id)
    setBusy(false)
    if (error) setMsg('Could not save. Please try again.')
    else onSaved()
  }

  async function remove() {
    setBusy(true)
    await supabase.from('projects').delete().eq('id', initial.id)
    setBusy(false)
    onSaved()
  }

  const toggle = (id: string) => setF({ ...f, team: f.team.includes(id) ? f.team.filter((x) => x !== id) : [...f.team, id] })

  return (
    <Modal title={isNew ? 'New Project' : 'Edit Project'} onClose={onClose}>
      {confirmDel ? (
        <div className="text-center py-4">
          <p className="font-semibold">Delete this project?</p>
          <p className="text-sm text-muted mt-1">Related shoots will stay, but they won't be linked to a project.</p>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setConfirmDel(false)} className="flex-1 bg-gray-100 font-semibold py-2.5 rounded-xl2">Cancel</button>
            <button onClick={remove} disabled={busy} className="flex-1 bg-pink-dark text-white font-semibold py-2.5 rounded-xl2">Delete</button>
          </div>
        </div>
      ) : (
        <form onSubmit={save} className="space-y-3">
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Project Name *</span>
            <input required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className="input" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm font-medium mb-1 block">Type</span>
              <input list="ptypes" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })} className="input" placeholder="Video Production" />
              <datalist id="ptypes">
                {['Video Production', 'Documentary', 'Photo & Video', 'Content Creation', 'Event Documentation'].map((t) => <option key={t} value={t} />)}
              </datalist>
            </label>
            <label className="block">
              <span className="text-sm font-medium mb-1 block">Deadline</span>
              <input type="date" value={f.deadline} onChange={(e) => setF({ ...f, deadline: e.target.value })} className="input" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Description</span>
            <textarea value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} className="input min-h-20" />
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Status</span>
            <select value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as ProjectStatus })} className="input">
              {(Object.keys(PROJECT_STATUS) as ProjectStatus[]).map((k) => <option key={k} value={k}>{PROJECT_STATUS[k].label}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-medium mb-1 block">Progress: {f.progress}%</span>
            <input type="range" min={0} max={100} step={5} value={f.progress} onChange={(e) => setF({ ...f, progress: Number(e.target.value) })} className="w-full accent-[#7C6FF2]" />
          </label>
          <div>
            <span className="text-sm font-medium mb-1 block">Assigned Team</span>
            <div className="flex flex-wrap gap-2">
              {people.map((p) => (
                <button type="button" key={p.id} onClick={() => toggle(p.id)} className={`px-3 py-1.5 rounded-full text-sm ${f.team.includes(p.id) ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
          {msg && <p className="text-sm text-pink-dark">{msg}</p>}
          <div className="flex gap-2 pt-2">
            {!isNew && (
              <button type="button" onClick={() => setConfirmDel(true)} className="px-4 py-2.5 rounded-xl2 bg-pink text-pink-dark font-semibold">Delete</button>
            )}
            <button type="submit" disabled={busy} className="flex-1 bg-primary text-white font-semibold py-2.5 rounded-xl2 disabled:opacity-60">
              {busy ? 'Saving...' : isNew ? 'Create Project' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

export default function Projects() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [people, setPeople] = useState<Profile[]>([])
  const [filter, setFilter] = useState<'all' | ProjectStatus>('all')
  const [editing, setEditing] = useState<Partial<Project> | null>(null)
  const [error, setError] = useState(false)

  async function load() {
    setError(false)
    const [pr, p] = await Promise.all([
      supabase.from('projects').select('*').order('deadline'),
      supabase.from('profiles').select('*').order('name'),
    ])
    if (pr.error) {
      setError(true)
      return
    }
    setProjects(pr.data as Project[])
    setPeople((p.data as Profile[]) || [])
  }

  useEffect(() => {
    load()
  }, [])

  const byId = new Map<string, Profile>(people.map((p) => [p.id, p] as [string, Profile]))
  const shown = (projects || []).filter((p) => filter === 'all' || p.status === filter)

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 pb-24 md:pb-8">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-2xl font-extrabold">Projects</h1>
          <p className="text-sm text-muted mt-1">Manage all your production projects.</p>
        </div>
        {isAdmin && (
          <button onClick={() => setEditing({})} className="shrink-0 flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2.5 rounded-xl2">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['all', ...Object.keys(PROJECT_STATUS)] as ('all' | ProjectStatus)[]).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border ${filter === k ? 'bg-primary text-white border-primary' : 'bg-white text-muted border-line'}`}
          >
            {k === 'all' ? 'All' : PROJECT_STATUS[k].label}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-white rounded-card shadow-sm p-8 text-center">
          <p className="font-semibold">Something went wrong</p>
          <p className="text-sm text-muted mt-1">We couldn't load your projects. Have you run the database update?</p>
          <button onClick={load} className="mt-4 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2">Try Again</button>
        </div>
      )}

      {!error && projects === null && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-56 rounded-card bg-line/60 animate-pulse" />)}
        </div>
      )}

      {!error && projects !== null && projects.length === 0 && (
        <div className="bg-white rounded-card shadow-sm p-10 text-center">
          <p className="font-semibold">No projects yet</p>
          <p className="text-sm text-muted mt-1">Start organizing your next production.</p>
          {isAdmin && (
            <button onClick={() => setEditing({})} className="mt-4 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-xl2">+ Create Project</button>
          )}
        </div>
      )}

      {!error && projects !== null && projects.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {shown.map((p, i) => {
            const st = PROJECT_STATUS[p.status]
            const b = BANNERS[i % BANNERS.length]
            return (
              <div
                key={p.id}
                onClick={() => isAdmin && setEditing(p)}
                className={`bg-white rounded-card shadow-sm overflow-hidden ${isAdmin ? 'cursor-pointer hover:border-primary/40' : ''}`}
              >
                <div className={`h-24 relative flex items-center justify-center ${b.bg}`}>
                  <Film size={34} className={b.ic} />
                  <span className={`absolute top-3 left-3 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white ${st.cls.split(' ')[1]}`}>{st.label}</span>
                </div>
                <div className="p-4">
                  <p className="font-bold truncate">{p.name}</p>
                  <p className="text-xs text-muted">{p.type || 'Project'}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <div className="flex-1"><ProgressBar value={p.progress} /></div>
                    <span className="text-xs font-bold">{p.progress}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <AvatarGroup people={p.team.map((id) => byId.get(id)).filter((x): x is Profile => !!x)} size={26} />
                    {p.deadline && (
                      <span className="text-[11px] text-muted">
                        Due {new Date(p.deadline + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {editing && (
        <ProjectForm
          initial={editing}
          people={people}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null)
            load()
          }}
        />
      )}
    </div>
  )
}
