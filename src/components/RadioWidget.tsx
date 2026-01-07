"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Radio,
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipForward,
  Loader2,
  Music,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  RadioStation,
  RadioGenre,
  RADIO_GENRES,
  DEFAULT_STATION_NAME,
  getStationsByGenre,
  reportStationClick
} from '@/services/radioService';

// LocalStorage keys
const STORAGE_KEYS = {
  GENRE: 'surfcam_radio_genre',
  STATION: 'surfcam_radio_station',
  VOLUME: 'surfcam_radio_volume',
};

// Helper functions for localStorage
const savePreference = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // localStorage might be unavailable
  }
};

const getPreference = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
};

interface RadioWidgetProps {
  autoPlayOnVideoStart?: boolean;
  onPlayStateChange?: (isPlaying: boolean) => void;
}

// Get initial genre from localStorage or default to first (Costa Rica)
const getInitialGenre = (): RadioGenre => {
  const savedGenreId = getPreference(STORAGE_KEYS.GENRE);
  if (savedGenreId) {
    const found = RADIO_GENRES.find(g => g.id === savedGenreId);
    if (found) return found;
  }
  return RADIO_GENRES[0]; // Costa Rica
};

// Get initial volume from localStorage or default to 0.25 (25%)
const getInitialVolume = (): number => {
  const savedVolume = getPreference(STORAGE_KEYS.VOLUME);
  if (savedVolume) {
    const vol = parseFloat(savedVolume);
    if (!isNaN(vol) && vol >= 0 && vol <= 1) return vol;
  }
  return 0.25;
};

export default function RadioWidget({
  autoPlayOnVideoStart = true,
  onPlayStateChange
}: RadioWidgetProps) {
  const [selectedGenre, setSelectedGenre] = useState<RadioGenre>(getInitialGenre);
  const [stations, setStations] = useState<RadioStation[]>([]);
  const [currentStation, setCurrentStation] = useState<RadioStation | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [volume, setVolume] = useState(getInitialVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [showStationList, setShowStationList] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedStationId, setSavedStationId] = useState<string | null>(() => getPreference(STORAGE_KEYS.STATION));

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const userClickedPlayRef = useRef(false);

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;

    audio.addEventListener('playing', () => {
      setIsBuffering(false);
      setIsPlaying(true);
      setError(null);
    });

    audio.addEventListener('waiting', () => {
      setIsBuffering(true);
    });

    audio.addEventListener('pause', () => {
      setIsPlaying(false);
    });

    audio.addEventListener('error', () => {
      // Only show error if user explicitly clicked play
      if (userClickedPlayRef.current) {
        setError('Error al reproducir');
        setIsBuffering(false);
        setIsPlaying(false);
      }
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Load stations when genre changes
  useEffect(() => {
    loadStations();
  }, [selectedGenre]);

  // Save genre preference to localStorage
  useEffect(() => {
    savePreference(STORAGE_KEYS.GENRE, selectedGenre.id);
  }, [selectedGenre]);

  // Save station preference to localStorage
  useEffect(() => {
    if (currentStation) {
      savePreference(STORAGE_KEYS.STATION, currentStation.id);
      setSavedStationId(currentStation.id);
    }
  }, [currentStation]);

  // Save volume preference to localStorage
  useEffect(() => {
    savePreference(STORAGE_KEYS.VOLUME, volume.toString());
  }, [volume]);

  // Notify parent of play state changes
  useEffect(() => {
    onPlayStateChange?.(isPlaying);
  }, [isPlaying, onPlayStateChange]);

  const loadStations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedStations = await getStationsByGenre(selectedGenre.id);

      if (fetchedStations.length === 0) {
        setError('Sin emisoras');
        setStations([]);
        setCurrentStation(null);
      } else {
        setStations(fetchedStations);

        // Determine which station to select
        let stationToSelect: RadioStation | null = null;

        // 1. Try to find saved station from localStorage
        if (savedStationId) {
          stationToSelect = fetchedStations.find(s => s.id === savedStationId) || null;
        }

        // 2. If no saved station found, try to find default station (Urbano 106)
        if (!stationToSelect) {
          stationToSelect = fetchedStations.find(s =>
            s.name.toLowerCase().includes(DEFAULT_STATION_NAME.toLowerCase())
          ) || null;
        }

        // 3. If still no match, use first station
        if (!stationToSelect) {
          stationToSelect = fetchedStations[0];
        }

        // Only change station if none selected or current not in new list
        if (!currentStation || !fetchedStations.find(s => s.id === currentStation.id)) {
          setCurrentStation(stationToSelect);
        }
      }
    } catch (err) {
      setError('Error de conexión');
      setStations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const playStation = useCallback(async (station: RadioStation) => {
    if (!audioRef.current) return;

    // Mark that user has interacted
    userClickedPlayRef.current = true;

    setCurrentStation(station);
    setIsBuffering(true);
    setError(null);

    try {
      // Stop current playback first
      audioRef.current.pause();
      audioRef.current.currentTime = 0;

      // Set new source and play
      audioRef.current.src = station.urlResolved;
      audioRef.current.load();

      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        await playPromise;
        reportStationClick(station.id);
      }
    } catch (err: any) {
      // Only show error if it's not an autoplay restriction
      if (err?.name !== 'NotAllowedError') {
        setError('Error al reproducir');
      }
      setIsBuffering(false);
    }
  }, []);

  const togglePlay = useCallback(async () => {
    if (!audioRef.current || !currentStation) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      // Mark that user has interacted
      userClickedPlayRef.current = true;
      setIsBuffering(true);
      try {
        if (!audioRef.current.src || audioRef.current.src !== currentStation.urlResolved) {
          audioRef.current.src = currentStation.urlResolved;
        }
        await audioRef.current.play();
      } catch (err) {
        setError('Error al reproducir');
        setIsBuffering(false);
      }
    }
  }, [isPlaying, currentStation]);

  const nextStation = useCallback(() => {
    if (stations.length === 0) return;

    const currentIndex = currentStation
      ? stations.findIndex(s => s.id === currentStation.id)
      : -1;
    const nextIndex = (currentIndex + 1) % stations.length;
    playStation(stations[nextIndex]);
  }, [stations, currentStation, playStation]);

  const handleGenreChange = (genre: RadioGenre) => {
    setSelectedGenre(genre);
    // Open station list to show new stations
    setShowStationList(true);
  };

  // Listen for video play events
  useEffect(() => {
    if (!autoPlayOnVideoStart) return;

    const handleVideoPlay = () => {
      if (currentStation && !isPlaying) {
        // Uncomment to auto-start radio when video plays:
        // playStation(currentStation);
      }
    };

    window.addEventListener('surfcam:videoplay', handleVideoPlay);
    return () => window.removeEventListener('surfcam:videoplay', handleVideoPlay);
  }, [autoPlayOnVideoStart, currentStation, isPlaying, playStation]);

  // Loading skeleton
  if (isLoading && stations.length === 0) {
    return (
      <div className="w-full backdrop-blur-md bg-black/40 border border-cyan-500/20 rounded-2xl p-3 sm:p-4">
        <div className="flex items-center gap-3 animate-pulse">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-700"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-700 rounded w-24"></div>
            <div className="h-3 bg-gray-700 rounded w-16"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full backdrop-blur-md bg-black/40 border border-cyan-500/20 rounded-2xl overflow-hidden">
      {/* Main Player Row - Always visible */}
      <div className="p-3 sm:p-4">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Play Button */}
          <button
            onClick={togglePlay}
            disabled={!currentStation || isBuffering}
            className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600
                       flex items-center justify-center shadow-lg shadow-cyan-500/30
                       hover:shadow-cyan-500/50 transition-all active:scale-95 disabled:opacity-50"
          >
            {isBuffering ? (
              <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white ml-0.5" />
            )}
          </button>

          {/* Station Info */}
          <button
            onClick={() => setShowStationList(!showStationList)}
            className="flex-1 min-w-0 text-left"
          >
            <div className="flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-semibold text-white truncate">
                    {currentStation?.name || 'Selecciona emisora'}
                  </span>
                  {isPlaying && (
                    <span className="flex-shrink-0 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400">
                  <span>{selectedGenre.icon} {selectedGenre.name}</span>
                  {error && <span className="text-red-400">• {error}</span>}
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${showStationList ? 'rotate-180' : ''}`} />
            </div>
          </button>

          {/* Next Button */}
          <button
            onClick={nextStation}
            disabled={stations.length === 0}
            className="flex-shrink-0 w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <SkipForward className="w-4 h-4 text-gray-400" />
          </button>

          {/* Volume Control - Desktop only */}
          <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-4 h-4 text-gray-400" />
              ) : (
                <Volume2 className="w-4 h-4 text-gray-400" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setVolume(parseFloat(e.target.value));
                setIsMuted(false);
              }}
              className="w-20 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
                         [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0"
            />
          </div>
        </div>

        {/* Genre Pills - Horizontal scroll */}
        <div className="mt-3 -mx-3 sm:-mx-4 px-3 sm:px-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1">
            {RADIO_GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreChange(genre)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap
                  ${selectedGenre.id === genre.id
                    ? `bg-gradient-to-r ${genre.color} text-white shadow-md`
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                  }`}
              >
                <span className="mr-1">{genre.icon}</span>
                {genre.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Volume - Only on mobile */}
        <div className="flex sm:hidden items-center gap-3 mt-3 pt-3 border-t border-white/10">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="w-4 h-4 text-gray-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-gray-400" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={isMuted ? 0 : volume}
            onChange={(e) => {
              setVolume(parseFloat(e.target.value));
              setIsMuted(false);
            }}
            className="flex-1 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-cyan-400
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:bg-cyan-400 [&::-moz-range-thumb]:border-0"
          />
          <span className="text-xs text-gray-500 w-8 text-right">{Math.round(volume * 100)}%</span>
        </div>
      </div>

      {/* Station List - Expandable */}
      {showStationList && stations.length > 0 && (
        <div className="border-t border-cyan-500/20 max-h-48 overflow-y-auto bg-black/30">
          {stations.map((station) => (
            <button
              key={station.id}
              onClick={() => {
                playStation(station);
                // Keep list open so user can easily switch between stations
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-b border-white/5 last:border-0
                ${currentStation?.id === station.id
                  ? 'bg-cyan-500/20'
                  : 'hover:bg-white/5 active:bg-white/10'
                }`}
            >
              {station.favicon ? (
                <img
                  src={station.favicon}
                  alt=""
                  className="w-8 h-8 rounded-lg object-cover bg-gray-700 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/30 to-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <Music className="w-4 h-4 text-cyan-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className={`text-sm truncate ${currentStation?.id === station.id ? 'text-cyan-400 font-medium' : 'text-white'}`}>
                  {station.name}
                </div>
                {station.country && (
                  <div className="text-[10px] text-gray-500 truncate">{station.country}</div>
                )}
              </div>
              {currentStation?.id === station.id && isPlaying && (
                <div className="flex gap-0.5 items-end h-4">
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '40%', animationDelay: '0ms' }}></span>
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '70%', animationDelay: '150ms' }}></span>
                  <span className="w-1 bg-cyan-400 rounded-full animate-bounce" style={{ height: '50%', animationDelay: '300ms' }}></span>
                </div>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
