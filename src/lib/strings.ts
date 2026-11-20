const swahili: Record<string, string> = {
  'Explore': 'Chunguza', 'Home': 'Mwanzo', 'Development': 'Maendeleo', 'Opportunities': 'Fursa',
  'Businesses': 'Biashara', 'Community': 'Jamii', 'My ward': 'Wadi yangu', 'Alerts': 'Arifa',
  'Report': 'Ripoti', 'Report an issue': 'Ripoti tatizo', 'Sign in': 'Ingia', 'Menu': 'Menyu', 'Search': 'Tafuta',
  'Data saver': 'Hifadhi data', 'Quick actions': 'Huduma za haraka', 'Find jobs': 'Tafuta kazi',
  'Track projects': 'Fuatilia miradi', 'Find a business': 'Tafuta biashara', 'Bursaries': 'Misaada ya elimu',
  'Upcoming events': 'Matukio yajayo', 'USSD access': 'Huduma ya USSD', 'Select your ward': 'Chagua wadi yako',
  'Projects': 'Miradi', 'Events': 'Matukio', 'Schools': 'Shule', 'Wards': 'Wadi',
  'Everything Lugari.': 'Yote kuhusu Lugari.', 'One place.': 'Mahali pamoja.',
  'Find projects, jobs, businesses, schools and community updates from across Lugari.': 'Tafuta miradi, kazi, biashara, shule na taarifa za jamii kutoka Lugari.',
  'Search Lugari…': 'Tafuta Lugari…',
  'Account': 'Akaunti', 'Close': 'Funga', 'Skip to content': 'Ruka hadi kwenye maudhui', 'Go': 'Nenda',
};
export const translate = (locale: 'en' | 'sw', text: string) => locale === 'sw' ? swahili[text] ?? text : text;
