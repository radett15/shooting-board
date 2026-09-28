export const iso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
export const parse = (s: string) => new Date(s + 'T00:00:00')
export const addDays = (d: Date, n: number) => {
  const x = new Date(d)
  x.setDate(x.getDate() + n)
  return x
}
export const weekStart = (d: Date) => addDays(d, -((d.getDay() + 6) % 7))
export const mins = (t?: string | null) => (t ? Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5)) : 0)
export const hm = (t?: string | null) => (t ? t.slice(0, 5) : '')
