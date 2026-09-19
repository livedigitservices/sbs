export const CORE_SERVICES = [
   { to: '/tutors',    label: 'Find your Online Tutor/Trainer \n Teacher/Coach/Mentor/\n Advisor/Counsellor' },
    { to: '/extra-income',       label: 'Need Extra Income? \n Become Online Tutor/Trainer/ Coach/Mentor' },
  { to: '/jobs/free',                  label: 'Software -IT /Careers /Projects/ Internships /OJTs' },
  { to: '/study-abroad',               label: 'Abroad Study' },
  { to: '/online-degrees',             label: 'Online Degrees' },
  { to: '/hotel-management/india',     label: 'Hotel Management (India)' },
  { to: '/hotel-management/mauritius', label: 'Hotel Management (Mauritius)' },
  { to: '/loans',          label: 'Loans Personal /Business /Home/ Plot/Education /Third Party /Reloan/ Takeover/ Private Finance' },
  { to: '/phd-admissions', label: 'Ph. D Admissions \nFullTime/PartTime/ \n Online Ph.D/FullFunded/ \n Research/Honorary Ph.D' },
  { to: '/trading-course', label: 'Learn & Earn \n Stocks/Gold&Silver/\n Crypto/ NIFTY/SENSEX' },
  { to: '/fast-track-degrees', label: 'Fast Track Degrees \n BA/BCOM/BBA/BCA/ MA/MCOM/MBA/MCA' },
 
]

export const CORE_SERVICE_LABELS = CORE_SERVICES.map(s => s.label)

export const RESOURCE_CATEGORY_LABELS = [
  ...CORE_SERVICE_LABELS,
  'Freelancer / Work From Home / Extra Income / Business Income',
  'Work Visas/ Visit Visas/PR'
]

export const HOME_EXTRA_SERVICES = [
  { to: '/visas',     label: 'Visas \n Work Visas/ Visit Visas/PR' },

]