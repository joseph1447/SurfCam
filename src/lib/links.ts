// Sister products linked from the site and the Shorts descriptions.
export const GAME_URL = 'https://ripping.wedoitwithai.com/';
// Full URL on purpose: a bare "@QuesadaJoseph" in an Instagram caption tags an unrelated
// Instagram account with that handle.
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@QuesadaJoseph';
// For Instagram captions: no "@" anywhere, so nothing can be parsed as a mention.
export const YOUTUBE_CHANNEL_ID_URL = 'https://www.youtube.com/channel/UCa4397KS7YBwp7pkA8B5J6g?sub_confirmation=1';
// Linked in every video description; INSTAGRAM_URL overrides it without a code change.
export const INSTAGRAM_URL = process.env.INSTAGRAM_URL || 'https://www.instagram.com/joseph.quesada94/';
