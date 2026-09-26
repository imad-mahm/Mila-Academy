import 'server-only'
import { LEVELS, GENDERS, SPORTS } from '@/lib/programs'

// Validates and normalises a program body. With `partial`, only the fields
// present are checked (PATCH); otherwise the required ones must be there (POST).
// Returns the column values to write, or an error message.
export function programValues(
  body: Record<string, unknown>,
  partial: boolean,
): { values: Record<string, unknown> } | { error: string } {
  const values: Record<string, unknown> = {}
  const has = (k: string) => Object.hasOwn(body, k)

  if (!partial || has('sport')) {
    if (!SPORTS.includes(body.sport as never)) return { error: 'sport must be football or basketball' }
    values.sport = body.sport
  }
  if (!partial || has('name')) {
    if (typeof body.name !== 'string' || !body.name.trim()) return { error: 'name is required' }
    values.name = body.name.trim().slice(0, 100)
  }
  if (has('subtitle')) values.subtitle = String(body.subtitle ?? '').trim().slice(0, 100)
  if (has('level')) {
    if (!LEVELS.includes(body.level as never)) return { error: `level must be one of: ${LEVELS.join(', ')}` }
    values.level = body.level
  }
  if (has('gender')) {
    if (!GENDERS.includes(body.gender as never)) return { error: `gender must be one of: ${GENDERS.join(', ')}` }
    values.gender = body.gender
  }
  if (has('image_url')) values.image_url = String(body.image_url ?? '').trim().slice(0, 1000)
  for (const k of ['featured', 'active'] as const) {
    if (has(k)) values[k] = Boolean(body[k])
  }

  const ints: [string, number, number][] = [
    ['age_min', 0, 99], ['age_max', 0, 99], ['sessions_per_week', 0, 14], ['sort_order', -100000, 100000],
  ]
  for (const [k, min, max] of ints) {
    if (!has(k)) continue
    const n = Number(body[k])
    if (!Number.isInteger(n) || n < min || n > max) return { error: `${k} must be a whole number between ${min} and ${max}` }
    values[k] = n
  }
  if (has('price_month')) {
    const n = Number(body.price_month)
    if (!Number.isFinite(n) || n < 0 || n > 100000) return { error: 'price_month must be a positive number' }
    values.price_month = n
  }
  if (typeof values.age_min === 'number' && typeof values.age_max === 'number' && values.age_min > values.age_max) {
    return { error: 'Minimum age cannot be above maximum age' }
  }
  return { values }
}
