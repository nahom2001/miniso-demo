export const brand = {
  name: 'Miniso Ethiopia',
  shortName: 'Miniso',
  tagline: 'Quality Life, Better Price',
  taglineAm: 'ጥሩ ጥራት፣ ምቹ ዋጋ',
  logo: '/logo.svg',
  primaryColor: '#e31c1c',
  secondaryColor: '#1a1a2e',
  accentColor: '#f59e0b',
  email: 'hello@miniso.et',
  phone: '+251 11 234 5678',
  address: 'Bole Road, Addis Ababa, Ethiopia',
  social: {
    instagram: 'https://instagram.com/miniso.et',
    facebook: 'https://facebook.com/miniso.et',
    telegram: 'https://t.me/miniso_et',
  },
} as const

export type Brand = typeof brand
