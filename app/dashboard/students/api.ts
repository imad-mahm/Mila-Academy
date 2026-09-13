// Client-side helpers for the real (Supabase-backed) Students + Teams API.
// Bridges the new DB shape to the existing StudentRow type so the detail
// page's Ratings/Attendance/Payments/Medical tabs keep working unchanged —
// those still run on their own localStorage system pending their own
// migration; only the student *record* itself (name, contact info, team,
// etc.) is real now.
import type { StudentRow } from './data'

export interface TeamRow {
  id: string
  name: string
  academy: 'MFA' | 'MBA'
  age_group: string
}

type ApiStudent = Omit<StudentRow, 'attendance_rate' | 'overall_rating' | 'awards'> & {
  awards: string[] | null
  archived_at: string | null
}

function toStudentRow(s: ApiStudent): StudentRow {
  return {
    ...s,
    awards: s.awards ?? [],
    // Not tracked on the student record itself yet — Ratings/Attendance
    // tabs compute their own demo numbers from these as a seed until
    // those subsystems get their own migration.
    attendance_rate: 0,
    overall_rating: 0,
  }
}

async function json(res: Response) {
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body?.error ?? `Request failed (${res.status})`)
  return body
}

export async function fetchStudents(): Promise<StudentRow[]> {
  const { data } = await json(await fetch('/api/admin/students'))
  return (data as ApiStudent[]).map(toStudentRow)
}

export async function fetchStudent(id: string): Promise<StudentRow | null> {
  const res = await fetch(`/api/admin/students/${id}`)
  if (res.status === 404) return null
  const { data } = await json(res)
  return toStudentRow(data as ApiStudent)
}

export async function createStudent(input: Record<string, unknown>): Promise<StudentRow> {
  const { data } = await json(await fetch('/api/admin/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }))
  return toStudentRow(data as ApiStudent)
}

export async function fetchTeams(): Promise<TeamRow[]> {
  const { data } = await json(await fetch('/api/admin/teams'))
  return data as TeamRow[]
}
