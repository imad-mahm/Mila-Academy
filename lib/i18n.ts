// English / Arabic for the public website.
//
// Arabic lives at its own addresses (/ar, /ar/football, /ar/basketball) so it
// can be cached, shared and indexed like the English pages, and so the page is
// already right-to-left when it arrives (no flash of English). Three kinds of
// text are involved:
//   1. Editable site text (headings, taglines, contact details…): lib/content-ar.ts
//      supplies Arabic defaults and the admin can write their own Arabic in
//      Dashboard → Site Content (stored as "<key>__ar").
//   2. Fixed interface text (buttons, filter names, accessibility labels): UI below.
//   3. Records the admin types in (program names, testimonials…): shown as typed.

export type Lang = 'en' | 'ar'
export const LANGS: readonly Lang[] = ['en', 'ar']
export const isRtl = (lang: Lang): boolean => lang === 'ar'

/** The URL prefix for a language's pages. */
export const prefixFor = (lang: Lang): string => (lang === 'ar' ? '/ar' : '')

/**
 * An internal link in the given language: "/football" → "/ar/football",
 * "/#contact" → "/ar#contact", "/" → "/ar". Dashboard, API and external links are left alone.
 */
export function localePath(path: string, lang: Lang): string {
  if (lang === 'en') return path
  if (!path.startsWith('/') || path.startsWith('/dashboard') || path.startsWith('/api') || path.startsWith('/ar')) return path
  if (path === '/') return '/ar'
  if (path.startsWith('/#')) return `/ar${path.slice(1)}`
  return `/ar${path}`
}

/** The same page in the other language, for the language switch. */
export function otherLangPath(pathname: string): { lang: Lang; href: string } {
  if (pathname === '/ar' || pathname.startsWith('/ar/')) {
    const rest = pathname.slice(3) || '/'
    return { lang: 'en', href: rest }
  }
  return { lang: 'ar', href: pathname === '/' ? '/ar' : `/ar${pathname}` }
}

export const LANG_NAME: Record<Lang, string> = { en: 'English', ar: 'العربية' }

type Dict = {
  account_login: string
  account_dashboard: string
  theme_to_light: string
  theme_to_dark: string
  menu_open: string
  menu_close: string
  site_menu: string
  switch_language: string
  chat_whatsapp: string
  sort_by: string
  age: string
  level: string
  price: string
  gender: string
  all: string
  ascending: string
  descending: string
  sort_direction: string
  no_programs: string
  clear_filters: string
  boys: string
  girls: string
  mixed: string
  beginner: string
  intermediate: string
  elite: string
  pro: string
  gallery_all: string
  gallery_football: string
  gallery_basketball: string
  gallery_events: string
  open_photo: string
  untitled: string
  photo_viewer: string
  close_viewer: string
  previous_photo: string
  next_photo: string
  previous: string
  next: string
  go_to_testimonial: string
  location: string
  phone: string
  email: string
  training_hours: string
  full_name: string
  child_age: string
  select_academy: string
  message_optional: string
  skip_to_content: string
}

export const UI: Record<Lang, Dict> = {
  en: {
    account_login: 'Log in',
    account_dashboard: 'Dashboard',
    theme_to_light: 'Switch to light theme',
    theme_to_dark: 'Switch to dark theme',
    menu_open: 'Open menu',
    menu_close: 'Close menu',
    site_menu: 'Site menu',
    switch_language: 'Switch to Arabic',
    chat_whatsapp: 'Chat on WhatsApp',
    sort_by: 'Sort by',
    age: 'Age',
    level: 'Level',
    price: 'Price',
    gender: 'Gender',
    all: 'All',
    ascending: 'Ascending',
    descending: 'Descending',
    sort_direction: 'Sort direction',
    no_programs: 'No programs match these filters.',
    clear_filters: 'Clear filters',
    boys: 'Boys',
    girls: 'Girls',
    mixed: 'Mixed',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    elite: 'Elite',
    pro: 'Pro',
    gallery_all: 'All',
    gallery_football: 'Football',
    gallery_basketball: 'Basketball',
    gallery_events: 'Events',
    open_photo: 'Open photo',
    untitled: 'untitled',
    photo_viewer: 'Photo viewer',
    close_viewer: 'Close photo viewer',
    previous_photo: 'Previous photo',
    next_photo: 'Next photo',
    previous: 'Previous',
    next: 'Next',
    go_to_testimonial: 'Go to testimonial',
    location: 'Location',
    phone: 'Phone',
    email: 'Email',
    training_hours: 'Training Hours',
    full_name: 'Full Name',
    child_age: 'Child’s Age',
    select_academy: 'Select Academy',
    message_optional: 'Message (optional)',
    skip_to_content: 'Skip to content',
  },
  ar: {
    account_login: 'تسجيل الدخول',
    account_dashboard: 'لوحة التحكم',
    theme_to_light: 'التبديل إلى الوضع الفاتح',
    theme_to_dark: 'التبديل إلى الوضع الداكن',
    menu_open: 'فتح القائمة',
    menu_close: 'إغلاق القائمة',
    site_menu: 'قائمة الموقع',
    switch_language: 'التبديل إلى الإنجليزية',
    chat_whatsapp: 'تحدّث معنا عبر واتساب',
    sort_by: 'ترتيب حسب',
    age: 'العمر',
    level: 'المستوى',
    price: 'السعر',
    gender: 'الفئة',
    all: 'الكل',
    ascending: 'تصاعدي',
    descending: 'تنازلي',
    sort_direction: 'اتجاه الترتيب',
    no_programs: 'لا توجد برامج تطابق هذه التصفية.',
    clear_filters: 'مسح التصفية',
    boys: 'أولاد',
    girls: 'بنات',
    mixed: 'مختلط',
    beginner: 'مبتدئ',
    intermediate: 'متوسط',
    elite: 'نخبة',
    pro: 'محترف',
    gallery_all: 'الكل',
    gallery_football: 'كرة القدم',
    gallery_basketball: 'كرة السلة',
    gallery_events: 'فعاليات',
    open_photo: 'فتح الصورة',
    untitled: 'بدون عنوان',
    photo_viewer: 'عارض الصور',
    close_viewer: 'إغلاق عارض الصور',
    previous_photo: 'الصورة السابقة',
    next_photo: 'الصورة التالية',
    previous: 'السابق',
    next: 'التالي',
    go_to_testimonial: 'الانتقال إلى الشهادة',
    location: 'الموقع',
    phone: 'الهاتف',
    email: 'البريد الإلكتروني',
    training_hours: 'ساعات التدريب',
    full_name: 'الاسم الكامل',
    child_age: 'عمر الطفل',
    select_academy: 'اختر الأكاديمية',
    message_optional: 'رسالة (اختياري)',
    skip_to_content: 'انتقل إلى المحتوى',
  },
}

export const ui = (lang: Lang): Dict => UI[lang]

// ── Values that come from the database (program levels, genders) ───────────────

const LEVEL_KEY = { Beginner: 'beginner', Intermediate: 'intermediate', Elite: 'elite', Pro: 'pro' } as const
const GENDER_KEY = { Boys: 'boys', Girls: 'girls', Mixed: 'mixed' } as const

export const levelText = (lang: Lang, level: keyof typeof LEVEL_KEY): string => UI[lang][LEVEL_KEY[level]]
export const genderText = (lang: Lang, gender: keyof typeof GENDER_KEY): string => UI[lang][GENDER_KEY[gender]]

// ── Phrases with numbers ────────────────────────────────────────────────────────

/** "1 program" / "5 programs"; Arabic has its own singular, dual and plural forms. */
export function programsCount(lang: Lang, n: number): string {
  if (lang === 'en') return `${n} program${n === 1 ? '' : 's'}`
  if (n === 1) return 'برنامج واحد'
  if (n === 2) return 'برنامجان'
  if (n >= 3 && n <= 10) return `${n} برامج`
  return `${n} برنامجًا`
}

export function ageLabel(lang: Lang, p: { age_min: number; age_max: number }): string {
  if (lang === 'en') return p.age_max >= 50 ? `Ages ${p.age_min}+` : `Ages ${p.age_min}–${p.age_max}`
  return p.age_max >= 50 ? `${p.age_min} سنة فأكثر` : `من ${p.age_min} إلى ${p.age_max} سنة`
}

export const priceLabel = (lang: Lang, p: { price_month: number }): string =>
  lang === 'en' ? `$${p.price_month} / month` : `${p.price_month}$ / شهريًا`

export function sessionsLabel(lang: Lang, p: { sessions_per_week: number }): string {
  const n = p.sessions_per_week
  if (lang === 'en') return `${n}× / week`
  return n === 1 ? 'حصة واحدة في الأسبوع' : n === 2 ? 'حصتان في الأسبوع' : `${n} حصص في الأسبوع`
}
