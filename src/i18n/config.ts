export type AppLocale = 'en' | 'rw' | 'fr'

export const LOCALES: Array<{ code: AppLocale; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'rw', label: 'Kinyarwanda' },
  { code: 'fr', label: 'Français' },
]

export const LOCALE_STORAGE_KEY = 'ub_locale'
export const CONTENT_STORAGE_KEY = 'ub_content_overrides'

export type LocalizedValue = Record<AppLocale, string>

export type ContentOverrides = Record<string, Partial<LocalizedValue>>

export type EditableField = {
  key: string
  section: string
  label: string
  multiline?: boolean
}

export const EDITABLE_FIELDS: EditableField[] = [
  { key: 'home.pill', section: 'Home', label: 'Hero pill' },
  { key: 'home.title', section: 'Home', label: 'Hero title', multiline: true },
  { key: 'home.subtitle', section: 'Home', label: 'Hero subtitle', multiline: true },
  { key: 'home.statPatients', section: 'Home', label: 'Stat: patients label' },
  { key: 'home.statDoctors', section: 'Home', label: 'Stat: doctors label' },
  { key: 'home.statAccess', section: 'Home', label: 'Stat: access label' },
  { key: 'home.featuresTitle', section: 'Home', label: 'Features section title', multiline: true },
  { key: 'home.featuresLead', section: 'Home', label: 'Features section lead', multiline: true },
  { key: 'home.feature1Title', section: 'Home', label: 'Feature 1 title' },
  { key: 'home.feature1Body', section: 'Home', label: 'Feature 1 body', multiline: true },
  { key: 'home.feature2Title', section: 'Home', label: 'Feature 2 title' },
  { key: 'home.feature2Body', section: 'Home', label: 'Feature 2 body', multiline: true },
  { key: 'home.feature3Title', section: 'Home', label: 'Feature 3 title' },
  { key: 'home.feature3Body', section: 'Home', label: 'Feature 3 body', multiline: true },
  { key: 'home.feature4Title', section: 'Home', label: 'Feature 4 title' },
  { key: 'home.feature4Body', section: 'Home', label: 'Feature 4 body', multiline: true },
  { key: 'home.aiCtaTitle', section: 'Home', label: 'AI CTA title' },
  { key: 'home.aiCtaBody', section: 'Home', label: 'AI CTA body', multiline: true },
  { key: 'home.specialistsTitle', section: 'Home', label: 'Specialists title' },
  { key: 'home.specialistsLead', section: 'Home', label: 'Specialists lead', multiline: true },
  { key: 'home.chronicEyebrow', section: 'Home', label: 'Chronic care eyebrow' },
  { key: 'home.chronicTitle', section: 'Home', label: 'Chronic care title' },
  { key: 'home.chronicBody', section: 'Home', label: 'Chronic care body', multiline: true },
  { key: 'home.chronicBullet1', section: 'Home', label: 'Chronic bullet 1' },
  { key: 'home.chronicBullet2', section: 'Home', label: 'Chronic bullet 2' },
  { key: 'home.chronicBullet3', section: 'Home', label: 'Chronic bullet 3' },
  { key: 'home.chronicBullet4', section: 'Home', label: 'Chronic bullet 4' },
  { key: 'home.storiesTitle', section: 'Home', label: 'Testimonials title' },
  { key: 'home.storiesLead', section: 'Home', label: 'Testimonials lead', multiline: true },
  { key: 'home.story1Quote', section: 'Home', label: 'Story 1 quote', multiline: true },
  { key: 'home.story1Name', section: 'Home', label: 'Story 1 name' },
  { key: 'home.story1Role', section: 'Home', label: 'Story 1 role' },
  { key: 'home.story2Quote', section: 'Home', label: 'Story 2 quote', multiline: true },
  { key: 'home.story2Name', section: 'Home', label: 'Story 2 name' },
  { key: 'home.story2Role', section: 'Home', label: 'Story 2 role' },
  { key: 'home.story3Quote', section: 'Home', label: 'Story 3 quote', multiline: true },
  { key: 'home.story3Name', section: 'Home', label: 'Story 3 name' },
  { key: 'home.story3Role', section: 'Home', label: 'Story 3 role' },
  { key: 'home.ctaTitle', section: 'Home', label: 'Final CTA title', multiline: true },
  { key: 'home.ctaBody', section: 'Home', label: 'Final CTA body', multiline: true },
  { key: 'about.pill', section: 'About', label: 'About pill' },
  { key: 'about.title', section: 'About', label: 'About title', multiline: true },
  { key: 'about.body', section: 'About', label: 'About body', multiline: true },
  { key: 'contact.pill', section: 'Contact', label: 'Contact pill' },
  { key: 'contact.title', section: 'Contact', label: 'Contact title' },
  { key: 'contact.body', section: 'Contact', label: 'Contact intro', multiline: true },
  { key: 'contact.address', section: 'Contact', label: 'Address' },
  { key: 'contact.phone', section: 'Contact', label: 'Phone' },
  { key: 'contact.emergency', section: 'Contact', label: 'Emergency line' },
  { key: 'contact.email', section: 'Contact', label: 'Email' },
  { key: 'legal.privacyTitle', section: 'Legal', label: 'Privacy title' },
  { key: 'legal.privacyBody', section: 'Legal', label: 'Privacy body', multiline: true },
  { key: 'legal.termsTitle', section: 'Legal', label: 'Terms title' },
  { key: 'legal.termsBody', section: 'Legal', label: 'Terms body', multiline: true },
  { key: 'legal.disclaimer', section: 'Legal', label: 'Legal disclaimer', multiline: true },
  { key: 'announcement.title', section: 'Announcements', label: 'Announcement title' },
  { key: 'announcement.body', section: 'Announcements', label: 'Announcement body', multiline: true },
  { key: 'doctors.doc1Bio', section: 'Doctors', label: 'Dr. Jean Mugabo bio', multiline: true },
  { key: 'doctors.doc2Bio', section: 'Doctors', label: 'Dr. Marie Uwase bio', multiline: true },
  { key: 'doctors.doc3Bio', section: 'Doctors', label: 'Dr. Eric Ndayishimiye bio', multiline: true },
  { key: 'doctors.doc4Bio', section: 'Doctors', label: 'Dr. Claire Mutesi bio', multiline: true },
  { key: 'doctors.doc5Bio', section: 'Doctors', label: 'Dr. Patrick Habimana bio', multiline: true },
  { key: 'doctors.doc6Bio', section: 'Doctors', label: 'Dr. Grace Ingabire bio', multiline: true },
]
