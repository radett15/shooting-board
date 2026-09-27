export type Role = 'admin' | 'crew'
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
