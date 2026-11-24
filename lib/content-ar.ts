// Arabic wording for the editable site text (see lib/content-schema.ts).
//
// Each key here is the English field's key. The admin sees an "Arabic" field
// next to the English one in Dashboard → Site Content; what they save there
// (stored as "<key>__ar") overrides these defaults on the /ar pages.
//
// Only text belongs here. Images, links, phone numbers, the WhatsApp number and
// the four figures (500+, 8, 2, 98%) are shared by both languages.

function academy(sport: 'football' | 'basketball'): Record<string, string> {
  const fb = sport === 'football'
  const game = fb ? 'كرة القدم' : 'كرة السلة'
  return {
    [`${sport}_name`]: `أكاديمية ميلا ل${game}`,
    [`${sport}_short`]: `ميلا ل${game}`,
    [`${sport}_tagline`]: `تدريب ${game} في بيصور`,
    [`${sport}_est`]: `تأسست عام ${fb ? 2016 : 2024} · بيصور، لبنان`,
    [`${sport}_cta_title`]: `جاهز للانضمام إلى ميلا ل${game}؟`,
    [`${sport}_cta_text`]: 'تواصل معنا وسيساعدك فريقنا على اختيار البرنامج المناسب والبدء.',
    [`${sport}_seo_title`]: `أكاديمية ميلا ل${game}`,
    [`${sport}_seo_description`]: `تدريب ${game} للناشئين في بيصور، لبنان${fb ? ' منذ عام 2016' : ''}: برامج لكل الأعمار والمستويات، من المبتدئين حتى مسار الاحتراف.`,
  }
}

export const CONTENT_AR: Record<string, string> = {
  // General
  brand_name: 'أكاديمية ميلا',
  site_title: 'أكاديمية ميلا',
  site_description: 'أكاديمية ميلا لكرة القدم وأكاديمية ميلا لكرة السلة: تدرّب مع الأفضل في لبنان.',

  // Contact
  location: 'بيصور، لبنان',
  hours: 'من الإثنين إلى السبت، 4 – 8 مساءً',

  // Navigation
  nav_home: 'الرئيسية',
  nav_about: 'من نحن',
  nav_programs: 'البرامج',
  nav_gallery: 'المعرض',
  nav_contact: 'تواصل معنا',
  nav_enroll: 'سجّل الآن',

  // Homepage top
  hero_enter_label: 'ادخل ←',

  // About / numbers
  about_eyebrow: 'أكاديمية ميلا',
  about_title: 'الأكاديمية بالأرقام',
  stat1_label: 'لاعب تدرّب لدينا',
  stat2_label: 'سنوات من التميّز',
  stat3_label: 'الأكاديميات',
  stat4_label: 'نسبة النجاح',
  about_quote: 'ندرّب اللاعبين الصغار في بيصور: رياضتان ومعيار واحد، الالتزام والاجتهاد واللعب النظيف.',

  // Programs
  programs_title: 'برامجنا',
  programs_subtitle: 'اختر مسارك',
  programs_enroll_label: 'سجّل الآن',
  academy_programs_title: 'برامجنا',
  academy_programs_hint: 'اختر الفريق المناسب',
  academy_view_programs: 'عرض البرامج',
  academy_enroll_label: 'سجّل الآن ←',
  whatsapp_label: 'تحدّث معنا عبر واتساب',

  // Gallery and testimonials
  gallery_title: 'أكاديميتنا في الميدان',
  testimonials_title: 'ماذا تقول العائلات',

  // Enquiry form
  contact_title: 'انضم إلى أكاديمية ميلا',
  contact_submit: 'سجّل الآن',
  contact_success: '✓  شكرًا لك! سنتواصل معك قريبًا',
  contact_error: 'حدث خطأ أثناء إرسال طلبك، يرجى المحاولة عبر واتساب.',
  contact_follow: 'تابعنا',

  // Footer
  footer_tagline: 'تدرّب مع الأفضل في لبنان.\nنُنمّي الجيل القادم من الرياضيين منذ عام 2016.',
  footer_copyright: 'أكاديمية ميلا. جميع الحقوق محفوظة.',
  footer_note: 'صُنع بشغف · لبنان',
  footer_staff_login: 'تسجيل الدخول',

  ...academy('football'),
  ...academy('basketball'),
}
