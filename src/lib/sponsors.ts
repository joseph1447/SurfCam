// Sponsors shown on the opening card of every Short/Reel. Logos live in
// assets/brand/sponsors (traced into the Short routes via next.config).
export interface Sponsor {
  name: string;
  domain: string;
  logo: string;
  shape: 'circle' | 'square';
}

export const SPONSORS: Sponsor[] = [
  { name: 'Santa Teresa Riders', domain: 'santateresariders.com', logo: 'santateresariders.png', shape: 'circle' },
  { name: 'Malpaís Surf Cam', domain: 'malpaisurfcam.com', logo: 'malpaisurfcam.jpg', shape: 'square' },
  { name: 'We Do It With AI', domain: 'wedoitwithai.com', logo: 'wedoitwithai.jpg', shape: 'square' },
];

// Where people who want to sponsor or collaborate should go: the business landing page,
// which carries WhatsApp and email (Joseph's call: no personal email on the videos).
export const SPONSOR_CONTACT = 'wedoitwithai.com';
