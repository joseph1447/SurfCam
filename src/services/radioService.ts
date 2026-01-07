// Radio Browser API Service
// Free, open-source API with 30,000+ radio stations worldwide
// https://www.radio-browser.info/

export interface RadioStation {
  id: string;
  name: string;
  url: string;
  urlResolved: string;
  favicon: string;
  tags: string;
  country: string;
  language: string;
  votes: number;
  codec: string;
  bitrate: number;
}

export interface RadioGenre {
  id: string;
  name: string;
  icon: string;
  searchTags: string[];
  color: string;
}

// Genres curated for a Costa Rica surf cam site
// Costa Rica is first as the default/priority genre
export const RADIO_GENRES: RadioGenre[] = [
  {
    id: 'costarica',
    name: 'Costa Rica',
    icon: '🇨🇷',
    searchTags: ['costa rica'],
    color: 'from-blue-500 to-red-500'
  },
  {
    id: 'reggae',
    name: 'Reggae',
    icon: '🇯🇲',
    searchTags: ['reggae', 'roots reggae', 'dub'],
    color: 'from-green-500 to-yellow-500'
  },
  {
    id: 'tropical',
    name: 'Tropical',
    icon: '🌴',
    searchTags: ['tropical', 'salsa', 'cumbia', 'latin tropical'],
    color: 'from-orange-500 to-pink-500'
  },
  {
    id: 'latin',
    name: 'Latin',
    icon: '💃',
    searchTags: ['latin', 'latino', 'spanish', 'latin pop'],
    color: 'from-red-500 to-orange-500'
  },
  {
    id: 'surf',
    name: 'Surf Rock',
    icon: '🏄',
    searchTags: ['surf', 'surf rock', 'beach', 'summer'],
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'chill',
    name: 'Chill',
    icon: '🌊',
    searchTags: ['chill', 'chillout', 'lounge', 'ambient'],
    color: 'from-purple-500 to-indigo-500'
  }
];

// Default station for Costa Rica - Urbano 106
export const DEFAULT_STATION_NAME = 'Urbano 106';

// Radio Browser API servers (they rotate, use any available)
const API_SERVERS = [
  'https://de1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info'
];

let currentServerIndex = 0;

function getApiServer(): string {
  return API_SERVERS[currentServerIndex];
}

function rotateServer(): void {
  currentServerIndex = (currentServerIndex + 1) % API_SERVERS.length;
}

export async function searchStationsByTags(tags: string[], limit: number = 10): Promise<RadioStation[]> {
  const allStations: RadioStation[] = [];

  for (const tag of tags) {
    try {
      const response = await fetch(
        `${getApiServer()}/json/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&order=votes&reverse=true&hidebroken=true`,
        {
          headers: {
            'User-Agent': 'SurfCam/1.0'
          }
        }
      );

      if (!response.ok) {
        rotateServer();
        continue;
      }

      const stations = await response.json();

      for (const station of stations) {
        // Only add if not already in list and has a resolved URL
        if (station.url_resolved && !allStations.find(s => s.id === station.stationuuid)) {
          allStations.push({
            id: station.stationuuid,
            name: station.name,
            url: station.url,
            urlResolved: station.url_resolved,
            favicon: station.favicon || '',
            tags: station.tags || '',
            country: station.country || '',
            language: station.language || '',
            votes: station.votes || 0,
            codec: station.codec || '',
            bitrate: station.bitrate || 0
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching stations for tag "${tag}":`, error);
      rotateServer();
    }
  }

  // Sort by votes and return unique stations
  return allStations
    .sort((a, b) => b.votes - a.votes)
    .slice(0, limit);
}

export async function getStationsByGenre(genreId: string): Promise<RadioStation[]> {
  const genre = RADIO_GENRES.find(g => g.id === genreId);
  if (!genre) return [];

  return searchStationsByTags(genre.searchTags, 15);
}

export async function getTopStations(limit: number = 20): Promise<RadioStation[]> {
  try {
    const response = await fetch(
      `${getApiServer()}/json/stations/topvote/${limit}?hidebroken=true`,
      {
        headers: {
          'User-Agent': 'SurfCam/1.0'
        }
      }
    );

    if (!response.ok) {
      rotateServer();
      return [];
    }

    const stations = await response.json();

    return stations.map((station: any) => ({
      id: station.stationuuid,
      name: station.name,
      url: station.url,
      urlResolved: station.url_resolved,
      favicon: station.favicon || '',
      tags: station.tags || '',
      country: station.country || '',
      language: station.language || '',
      votes: station.votes || 0,
      codec: station.codec || '',
      bitrate: station.bitrate || 0
    }));
  } catch (error) {
    console.error('Error fetching top stations:', error);
    rotateServer();
    return [];
  }
}

// Report that a station is being played (helps improve Radio Browser database)
export async function reportStationClick(stationId: string): Promise<void> {
  try {
    await fetch(
      `${getApiServer()}/json/url/${stationId}`,
      {
        headers: {
          'User-Agent': 'SurfCam/1.0'
        }
      }
    );
  } catch (error) {
    // Silent fail - this is just analytics
  }
}
