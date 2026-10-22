// Sister products linked from the site and the Shorts descriptions.
export const GAME_URL = 'https://ripping.wedoitwithai.com/';
// Full URL on purpose: a bare "@QuesadaJoseph" in an Instagram caption tags an unrelated
// Instagram account with that handle.
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@QuesadaJoseph';
// For Instagram captions: no "@" anywhere, so nothing can be parsed as a mention.
export const YOUTUBE_CHANNEL_ID_URL = 'https://www.youtube.com/channel/UCa4397KS7YBwp7pkA8B5J6g?sub_confirmation=1';
// Linked in every video description; INSTAGRAM_URL overrides it without a code change.
export const INSTAGRAM_URL = process.env.INSTAGRAM_URL || 'https://www.instagram.com/joseph.quesada94/';

// Joseph's other Santa Teresa sites, cross-linked so the cam's traffic feeds them. Both
// read ?utm_* into a cookie and store it with the booking/lead, so utm_content says which
// spot on this site sent the visitor (header, footer, home).
export type SisterSite = 'book' | 'homecare';
export type SisterPlacement = 'header' | 'footer' | 'home' | 'surf-lessons' | 'contact';

// `path` deep-links into santateresabook (e.g. '/tours/private-surf-lesson').
export function sisterUrl(site: SisterSite, placement: SisterPlacement, locale: string, path = '/tours'): string {
  // santateresabook is English-only; santateresahomecare serves Spanish under /es.
  const base =
    site === 'book' ? `https://santateresabook.com${path}` : `https://santateresahomecare.com/${locale === 'es' ? 'es' : ''}`;
  const utm = new URLSearchParams({
    utm_source: 'santateresasurfcam',
    utm_medium: 'referral',
    utm_campaign: 'ecosystem',
    utm_content: placement,
  });
  return `${base}?${utm}`;
}

// Joseph's number: WhatsApp and SINPE Móvil. The cam used to list Totty's (now on
// santateresariders.com); since 2026-10-22 every contact on this site comes here.
export const WHATSAPP_NUMBER = '50683161976';
export const PHONE_DISPLAY = '+506 8316 1976';
export const SINPE_DISPLAY = '8316 1976';
export const CONTACT_EMAIL = 'josephquesada92@gmail.com';
export const whatsappUrl = (text?: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
