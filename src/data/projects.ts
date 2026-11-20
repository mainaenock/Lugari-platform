import type { MediaAsset, Project } from '@/lib/types';

const post = 'https://www.facebook.com/HonNabiiNabwera/posts/';
const implementationReport = { name: 'Lugari NG-CDF implementation status report', url: 'https://lugari.ngcdf.go.ke/wp-content/uploads/2023/10/lugari.pdf' };
const credit = 'Photo supplied with the project archive. Source: Nabii Nabwera public page.';
export const photo = (name: string, alt: string, caption = credit): MediaAsset => ({
  src: '/media/' + name, alt, caption,
});
export const heroPhoto = photo('hero', 'Earthworks and a drainage crossing on the Majengo–Mugunga road in a tree-lined part of Lugari');
export const historicalRoad = post + 'pfbid0Cf6VsJqrRo4TPZqps9zGcCtdTEta2gK5jxEdFF6SYoRAWVwEzr3jt85PHnG2LD1ml';

export const projects: Project[] = [
  {
    kind: 'projects', slug: 'manyonyi-solar-water-project', title: 'Manyonyi Solar Water Project',
    ward: 'lugari', category: 'Water', summary: 'A February 2026 update documented work on a solar-powered water installation in Manyonyi.',
    location: 'Manyonyi, Lugari', date: '2026-02', status: 'In progress', trust: 'Source reported',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid0RBnB3rrDoKf9gg2bsMcxdsq54JLEdrcmFXvTzoFmcmiaxVMfLR72Q4EDwSczmoazl' },
    image: photo('manyonyi-water', 'Solar panels over a fenced water project site in Manyonyi'),
    gallery: [photo('manyonyi-water-tank', 'Circular concrete structure on the water works site'), photo('manyonyi-water-works', 'Solar panel mounting structure at the Manyonyi site')],
    keywords: ['borehole', 'water supply', 'solar'],
  },
  {
    kind: 'projects', slug: 'lukusi-electricity-project', title: 'Lukusi Electricity Project',
    ward: 'mautuma', category: 'Electricity', location: 'Lukusi, Mautuma', date: '2026-05', status: 'In progress', trust: 'Source reported',
    summary: 'The May 2026 launch update showed power poles being delivered in Lukusi. Household connection and commissioning figures are unavailable.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid0CmyYz5Pev5mjUshoWBd79v4SwMinnPN47Bv6n7QHVMiBSTVKvT9UZS3sXwXDKhpsl' },
    image: photo('lukusi-electricity', 'Wooden power poles loaded on a truck on a tree-lined road in Lukusi'),
    gallery: [photo('lukusi-electricity-poles', 'Delivery truck carrying wooden poles for the Lukusi electricity project')],
    keywords: ['transformer', 'power', 'rural electrification'],
  },
  {
    kind: 'projects', slug: 'kwambu-primary-school', title: 'Kwambu Primary School Classrooms',
    category: 'Education', ward: 'lwandeti', location: 'Kwambu, Lwandeti', date: '2023-12', status: 'Ready for handover', trust: 'Source reported',
    summary: 'A December 2023 update showed classroom buildings described as ready for commissioning. A later commissioning date is unavailable.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid02VnaXmkmUNmd8SgYsjBXdEX3hMjzswhVHUktooqjQ4h1Zj3vDjEswrLRdmAcfYpA1l' },
    image: photo('kwambu-school', 'Classroom block with blue frames and a grass verge at Kwambu Primary School'),
    gallery: [photo('kwambu-school-front', 'Front elevation of the Kwambu Primary School classroom building')],
  },
  {
    kind: 'projects', slug: 'majengo-mugunga-road', title: 'Majengo–Mugunga Road Maintenance', category: 'Roads',
    location: 'Majengo–Mugunga road', date: '2024-12', status: 'Reported activity', trust: 'Source reported',
    summary: 'A December 2024 update documented routine maintenance and drainage work on the Majengo–Mugunga route.',
    source: { name: 'Nabii Nabwera public page', url: historicalRoad },
    image: photo('majengo-road', 'Earthworks during routine maintenance on the Majengo–Mugunga road'),
  },
  {
    kind: 'projects', slug: 'mbagara-bridge-road-maintenance', title: 'Mbagara Bridge–Munge–Mugunga Road',
    category: 'Roads', location: 'Mbagara Bridge to Mugunga', date: '2025-07', status: 'Reported activity', trust: 'Source reported',
    summary: 'A July 2025 update documented routine maintenance along the route near Mbagara Bridge.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid0XRhh6jgSFg6Eb5mTPA7Sf4dm3QFtgdmirqGsjgVJzKAKpJsoQvvkzoipUS4MCJuMl' },
    image: photo('mbagara-road', 'Graded earth road near Mbagara Bridge with visible wheel tracks'),
  },
  {
    kind: 'projects', slug: 'manyonyi-stend-kisa-road', title: 'Manyonyi–Stend–Kisa Road Works',
    category: 'Roads', ward: 'lugari', location: 'Manyonyi–Stend–Kisa route', date: '2026-03', status: 'Reported activity', trust: 'Source reported',
    summary: 'Routine maintenance was reported in March 2026. The record covers the work shown in that update.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid05H6pf4369ZAdGwHCtyQPsB6CVRDxbgzrTeGZJJbpB2ysX4v6E2z1xLd4TZ7qce5wl' },
    image: photo('manyonyi-road', 'Freshly graded red earth on the Manyonyi–Stend–Kisa road'),
  },
  {
    kind: 'projects', slug: 'muyugi-primary-school', title: 'Muyugi Primary School Classrooms',
    category: 'Education', location: 'Muyugi, Lugari', date: '2023-12-15', status: 'Reported activity', trust: 'Source reported',
    summary: 'The photo archive documents classroom buildings at Muyugi Primary School. The source gives limited information about the scope and funding.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid0ht33ZUgxtHm7618gj8saiYg1nyvvK6RDVna15E9Uk4n4baxVgppox3etqSQRFXBRl' },
    image: photo('muyugi-school', 'Orange classroom block and covered exterior walkway at Muyugi Primary School'),
    gallery: [photo('muyugi-school-grounds', 'School grounds and shelter at Muyugi Primary School')],
  },
  {
    kind: 'projects', slug: 'mahiga-comprehensive-school', title: 'Mahiga Comprehensive School Construction',
    category: 'Education', date: '2024-12', status: 'In progress', trust: 'Source reported',
    summary: 'The 2024 archive shows construction work at Mahiga Comprehensive School. The update described the work as underway.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid091ZBNjvQB5YvjZ7tSKuiBpe8QoU8758wzvFa21SV2uW6QMCnfjtM29RbxzRwJpXWl' },
    image: photo('mahiga-school', 'Multi-storey school building under construction with open window frames'),
  },
  {
    kind: 'projects', slug: 'maturu-comprehensive-school', title: 'Maturu Comprehensive School Construction', ward: 'lwandeti',
    category: 'Education', date: '2024-12', status: 'In progress', trust: 'Source reported',
    summary: 'A December 2024 update showed partially built classroom walls at Maturu Comprehensive School.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid0aSmNJNt4bEWu67rEUtCMM2ktL9mnPU2dDWXa8idL3d7rySJHvtHkrYUHS4WGrxt7l' },
    image: photo('maturu-school', 'Unfinished masonry classroom walls at Maturu Comprehensive School'),
  },
  {
    kind: 'projects', slug: 'st-cecilia-girls-school-mautuma', title: 'St Cecilia Girls High School Construction',
    ward: 'mautuma', category: 'Education', date: '2024', status: 'In progress', trust: 'Source reported',
    summary: 'A 2024 update documented construction at St Cecilia Girls High School in Mautuma.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid0DqF2jmoDjRHWotq3a57JE2KGCW8YjExHqJrD9XdqbBCTg349QgzfZ558sY57t7TUl' },
    image: photo('st-cecilia-school', 'School building under construction at St Cecilia Girls High School'),
  },
  {
    kind: 'projects', slug: 'sosiani-primary-school', title: 'Sosiani Primary School Building',
    category: 'Education', date: '2022-12-29', status: 'Completed', trust: 'Source reported',
    ward: 'lumakanda', organization: 'Lugari NG-CDF',
    summary: 'A 2022 photo update reported that the school building had been officially opened.',
    source: { name: 'Nabii Nabwera public page', url: post + 'pfbid0krb2xTXmsQ71kvSKc2Gj4Q9cnxBZaLHxzxssKoTLFHhNq8SN6AtDoHe1n47FEQhel' },
    image: photo('sosiani-school', 'Completed school building with a Lugari NG-CDF sign at Sosiani Primary School'),
  },
  {
    kind: 'projects', slug: 'chekalini-water-project', title: 'Chekalini Water Project', ward: 'chekalini',
    category: 'Water', organization: 'County Government of Kakamega', funding: 'County Government of Kakamega',
    location: 'Chekalini Dam', date: '2021', status: 'In progress', trust: 'Official source',
    summary: 'A county inspection report described a project to draw, treat and distribute water from Chekalini Dam. The status reflects that historical update.',
    source: { name: 'County Government of Kakamega', url: 'https://kakamega.go.ke/governor-oparanya-inspects-county-projects-in-lugari/' },
  },
  {
    kind: 'projects', slug: 'lugari-township-school-rainwater-tank-2022', title: 'Lugari Township Primary School Rainwater Tank',
    category: 'Water', location: 'Lugari Township Primary School', date: '2022-06-30', trust: 'Official source', status: 'Completed',
    funding: 'Lugari NG-CDF', price: 228481, estimatedCost: 228481, financialYear: '2021/22',
    summary: 'The 2021/22 implementation report records a 10,000-litre rainwater tank with a base and fittings as complete.',
    source: implementationReport, details: [{ heading: '23 April 2022 · Listed completion date', text: 'The June 2022 report records the installation as in use.' }],
  },
  {
    kind: 'projects', slug: 'kwambu-classroom-2022', title: 'Kwambu Primary School Classroom, 2021/22',
    category: 'Education', ward: 'lwandeti', date: '2022-06-30', trust: 'Official source', status: 'Completed',
    funding: 'Lugari NG-CDF', price: 900000, estimatedCost: 900000, financialYear: '2021/22',
    summary: 'The 2021/22 report lists a classroom for 45 learners as complete and in use. The December 2023 photos are catalogued as a separate update.',
    source: implementationReport, details: [{ heading: '30 May 2022 · Listed completion date', text: 'The June 2022 report records the classroom as complete and in use.' }],
  },
  {
    kind: 'projects', slug: 'maturu-secondary-dormitory-2021', title: 'Maturu Secondary School Dormitory Renovation',
    category: 'Education', location: 'Maturu Secondary School', date: '2022-06-30', trust: 'Official source', status: 'Completed',
    funding: 'Lugari NG-CDF emergency allocation', price: 500000, estimatedCost: 500000, financialYear: '2021/22',
    summary: 'The June 2022 report lists repairs to a dormitory at Maturu Secondary School, including work on the roof and interior finishes.',
    source: implementationReport, details: [{ heading: '30 November 2021 · Listed completion date', text: 'The report records the repaired dormitory as in use.' }],
  },
  {
    kind: 'projects', slug: 'mautuma-market-drainage-demo', title: 'Mautuma Market Drainage (demo)', ward: 'mautuma',
    category: 'Roads', organization: 'Example Works Team', funding: 'Example capital works budget', price: 2650000, spent: 1325000, financialYear: '2026/27 · Example',
    location: 'Mautuma market area', date: '2026-11-12', status: 'In progress', progress: 55, trust: 'Demo data',
    summary: 'An illustrative drainage and culvert project with sample costs, progress and milestones for testing the ledger.',
    source: { name: 'Illustrative platform dataset' }, details: [
      { heading: 'September 2026 · Design completed', text: 'Site inspection and proposed drainage alignment recorded as an example milestone.' },
      { heading: 'November 2026 · Culvert installation', text: 'Example progress update records completed trench works and the first culvert section.' },
    ],
  },
];
