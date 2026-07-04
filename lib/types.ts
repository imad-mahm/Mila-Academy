export type Role = 'admin' | 'coach' | 'parent'

export interface User {
  id: string
  email: string
  role: Role
  name: string
  avatar?: string
}

export interface Student {
  id: string
  name: string
  photo?: string
  dob: string
  nationality: string
  position: string
  jersey_number: number
  team_id: string
  academy: 'MFA' | 'MBA'
  blood_type?: string
  allergies?: string
  injuries?: string
  doctor_contact?: string
  parent_name: string
  parent_phone: string
  parent_whatsapp: string
  emergency_contact?: string
  payment_status: 'paid' | 'unpaid' | 'partial'
  payment_amount: number
  payment_due_date: string
  notes?: string
  created_at: string
}

export interface Team {
  id: string
  name: string
  academy: 'MFA' | 'MBA'
  age_group: string
  coach_id: string
}

export interface Coach {
  id: string
  name: string
  photo?: string
  bio: string
  certifications: string
  speciality: string
  team_ids: string[]
  salary?: number
  contract_end?: string
  phone?: string
}

export interface AttendanceRecord {
  id: string
  student_id: string
  session_date: string
  status: 'present' | 'absent' | 'late'
  coach_id: string
  team_id: string
}

export interface Rating {
  id: string
  student_id: string
  session_date: string
  coach_id: string
  technique: number
  fitness: number
  attitude: number
  teamwork: number
  overall: number
  notes?: string
}

export interface Match {
  id: string
  team_id: string
  opponent: string
  date: string
  location: string
  home_score?: number
  away_score?: number
  result?: 'win' | 'loss' | 'draw'
  lineup?: string[]
  scorers?: string[]
  notes?: string
  status: 'upcoming' | 'live' | 'completed'
}

export interface Payment {
  id: string
  student_id: string
  amount: number
  month: string
  status: 'paid' | 'unpaid' | 'partial'
  paid_date?: string
  method?: 'cash' | 'bank' | 'whatsapp'
  notes?: string
}
