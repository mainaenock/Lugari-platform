export const groups = [
  { title: 'Community', links: [
    ['Wards', '/wards'], ['News & stories', '/news'], ['Events', '/events'], ['Report an issue', '/report'],
    ['Public participation', '/public-participation'], ['Community issues', '/community/issues'],
    ['Culture & community', '/community'], ['Sports', '/sports'], ['Lugari Live', '/live'], ['Alerts', '/alerts'],
  ] },
  { title: 'Development', links: [
    ['Projects', '/projects'], ['Project ledger', '/data/projects'], ['Commitments', '/commitments'],
    ['Lugari in numbers', '/data'], ['State of Lugari', '/reports/state-of-lugari'],
  ] },
  { title: 'Opportunities', links: [
    ['All opportunities', '/opportunities'], ['Jobs', '/jobs'], ['Bursaries & education', '/education'],
    ['Tenders', '/opportunities/?category=Tender'], ['Training', '/opportunities/?category=Training'],
  ] },
  { title: 'Local economy', links: [
    ['Businesses', '/businesses'], ['Marketplace', '/marketplace'], ['Agriculture', '/agriculture'],
    ['Talent & skills', '/talent'], ['Advertise', '/advertise'],
  ] },
  { title: 'Local services', links: [
    ['Schools', '/schools'], ['Leadership', '/leadership'], ['Organizations', '/organizations'],
    ['Announcements', '/announcements'], ['Appointments', '/appointments'], ['USSD access', '/access/ussd'],
  ] },
] as const;

export const privateGroups = {
  account: [['Overview', ''], ['My ward', 'my-ward'], ['Reports', 'reports'], ['Saved items', 'saved'], ['Notifications', 'notifications'], ['Subscriptions', 'subscriptions'], ['Privacy', 'privacy'], ['Settings', 'settings']],
  portal: [['Dashboard', 'dashboard'], ['Cases', 'cases'], ['Projects', 'projects'], ['Publishing', 'content'], ['Campaigns', 'campaigns'], ['Calendar', 'calendar'], ['Appointments', 'appointments'], ['Public participation', 'public-participation'], ['AI brief', 'ai-brief'], ['Analytics', 'analytics'], ['Team', 'team'], ['Media', 'media']],
  admin: [['Dashboard', 'dashboard'], ['Moderation', 'moderation'], ['Verification', 'verification'], ['Advertising', 'ads'], ['Audit log', 'audit'], ['Tenants', 'tenants'], ['Media', 'media']],
} as const;

export const footerLinks = [
  ['About', '/about'], ['Data sources', '/sources'], ['Corrections', '/corrections'], ['Accessibility', '/accessibility'],
  ['Privacy', '/privacy'], ['Terms', '/terms'], ['Advertise', '/advertise'], ['Contact', '/contact'],
] as const;
