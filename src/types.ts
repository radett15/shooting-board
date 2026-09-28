export type Role = 'admin' | 'crew'
export type ShootType = 'photo' | 'video' | 'event' | 'other'
export type ProjectStatus = 'planning' | 'pre_production' | 'in_production' | 'editing' | 'completed' | 'on_hold'
export type Availability = 'available' | 'on_shoot' | 'busy'
export type ShootingStatus = 'planning' | 'scheduled' | 'completed' | 'cancelled'
export type AttendanceStatus = 'pending' | 'confirmed' | 'declined'
export type EquipmentStatus = 'available' | 'in_use' | 'maintenance'

export interface Profile {
  id: string
  name: string
  email: string
  role: Role
  phone?: string | null
  avatar_url?: string | null
  job_title?: string | null
  skills?: string | null
  availability?: Availability
}

export interface Shooting {
  id: string
  title: string
  date: string
  start_time: string
  end_time: string
  call_time?: string | null
  location?: string | null
  maps_url?: string | null
  notes?: string | null
  status: ShootingStatus
  created_by?: string | null
  shoot_type?: ShootType
  project_id?: string | null
  shooting_crew?: { user_id: string }[]
}

export interface ShootingCrewRow {
  id: string
  shooting_id: string
  user_id: string
  attendance_status: AttendanceStatus
  profiles?: Profile
}

export interface Equipment {
  id: string
  name: string
  quantity: number
  status: EquipmentStatus
  notes?: string | null
}

export interface ShootingEquipmentRow {
  id: string
  shooting_id: string
  equipment_id: string
  quantity: number
  equipment?: Equipment
}

export interface Project {
  id: string
  name: string
  type?: string | null
  description?: string | null
  deadline?: string | null
  status: ProjectStatus
  progress: number
  team: string[]
}
