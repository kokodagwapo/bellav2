import React, { useRef, useEffect, useState } from 'react';
import StepHeader from './StepHeader';
import StepNavigation from './StepNavigation';
import { AddressAutofill } from '@mapbox/search-js-react';

interface StepLocationProps {
  data: { location: string };
  onChange: (field: string, value: string) => void;
  onNext: () => void;
  onBack: () => void;
}

type LocationStatus = 'idle' | 'verifying' | 'verified' | 'invalid';

const StepLocation: React.FC<StepLocationProps> = ({ data, onChange, onNext, onBack }) => {
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<LocationStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [mapboxLoaded, setMapboxLoaded] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Initialize Mapbox
  useEffect(() => {
    const apiKey = import.meta.env.VITE_MAPBOX_API_KEY || '';
    if (!apiKey) {
      console.warn('Mapbox API key not found. Please set VITE_MAPBOX_API_KEY in your environment variables.');
      setMapboxLoaded(false);
      return;
    }
    setMapboxLoaded(true);
  }, []);

  const raw = (data.location || '').trim();
  const isZip = /^\d{5}$/.test(raw);
  
  // Accept both "City, ST" and "City ST" formats
  const cityStateMatchWithComma = raw.match(/^(.+?),\s*([A-Za-z]{2})$/);
  const cityStateMatchWithoutComma = raw.match(/^(.+?)\s+([A-Za-z]{2})$/);
  const cityStateMatch = cityStateMatchWithComma || cityStateMatchWithoutComma;
  
  const city = cityStateMatch?.[1]?.trim() ?? '';
  const state = (cityStateMatch?.[2]?.trim() ?? '').toUpperCase();
  const isCityState = !!cityStateMatch && city.length >= 2 && /^[A-Z]{2}$/.test(state);

  // Fetch city suggestions as user types (when no Mapbox)
  // Note: Simplified suggestions - Zippopotam API doesn't support city search well
  // For better suggestions, consider using a dedicated city search API
  useEffect(() => {
    if (mapboxLoaded) {
      setSuggestions([]);
      setShowSuggestions(false);
      return; // Mapbox handles autosuggest
    }
    
    const query = raw.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Don't show suggestions if user has already entered city + state format
    if (isCityState || isZip) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // For now, disable suggestions to avoid API errors
    // The input will still work with manual entry
    setSuggestions([]);
    setShowSuggestions(false);
  }, [raw, mapboxLoaded, isCityState, isZip]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Verify location using a real lookup (no Mapbox key required):
  // - ZIP:   https://api.zippopotam.us/us/{zip}
  // - City:  https://api.zippopotam.us/us/{state}/{city}
  useEffect(() => {
    let cancelled = false;
    let timeout: number | undefined;

    const run = async () => {
      setErrorMessage('');

      // Don't show "valid" for partial input like "937"
      if (!raw) {
        setStatus('idle');
        return;
      }

      // Only attempt verification when the input is complete enough
      if (!isZip && !isCityState) {
        setStatus('idle');
        return;
      }

      setStatus('verifying');
      try {
        const url = isZip
          ? `https://api.zippopotam.us/us/${encodeURIComponent(raw)}`
          : `https://api.zippopotam.us/us/${encodeURIComponent(state)}/${encodeURIComponent(city)}`;

        const res = await fetch(url);
        if (!res.ok) {
          throw new Error('not-found');
        }

        const json = await res.json();

        // Normalize to "City, ST" when possible
        const place0 = Array.isArray(json.places) ? json.places[0] : undefined;
        const normalizedCity: string | undefined =
          place0?.['place name'] || place0?.place_name || place0?.placeName;
        const normalizedState: string | undefined =
          place0?.['state abbreviation'] || place0?.state_abbreviation || place0?.stateAbbreviation;

        if (!cancelled) {
          if (normalizedCity && normalizedState) {
            const normalized = `${normalizedCity}, ${String(normalizedState).toUpperCase()}`;
            // Only update if different to avoid infinite loops
            if (normalized !== raw && normalized.toLowerCase() !== raw.toLowerCase()) {
              try {
                onChange('location', normalized);
              } catch (error) {
                console.error('Error updating location:', error);
              }
            }
          }
          setStatus('verified');
          setErrorMessage('');
        }
      } catch {
        if (!cancelled) {
          setStatus('invalid');
          setErrorMessage(
            isZip
              ? 'ZIP code not found. Please enter a valid 5-digit US ZIP.'
              : 'City/State not found. Please enter a valid US city and 2-letter state (e.g., Naples FL or Naples, FL).',
          );
        }
      }
    };

    // debounce
    timeout = window.setTimeout(run, 400);
    return () => {
      cancelled = true;
      if (timeout) window.clearTimeout(timeout);
    };
  }, [raw, isZip, isCityState, city, state, onChange]);

  const handleRetrieve = (res: any) => {
    const feature = res.features[0];
    if (feature) {
      // Best practice: Extract from context array (Mapbox standard format)
      const context = feature.context || [];
      
      let city = '';
      let state = '';
      
      // Iterate through context to find place (city) and region (state)
      context.forEach((item: any) => {
        if (item.id?.startsWith('place')) {
          city = item.text || '';
        }
        if (item.id?.startsWith('region')) {
          state = item.short_code?.replace('US-', '') || item.text || '';
        }
      });
      
      // Fallback: try properties if context doesn't have the data
      if (!city) {
        city = feature.properties?.name || '';
      }
      
      if (city && state) {
        const formattedLocation = `${city}, ${state}`;
        onChange('location', formattedLocation);
        // Verification will run via effect
      } else if (city) {
        // If we have city but no state, still accept it
        onChange('location', city);
      }
    }
  };

  return (
    <div className="px-2 sm:px-0">
      <StepHeader 
        title="In what city and state are you looking to purchase?"
      />
      <div className="mt-4 sm:mt-6">
        <label htmlFor="location" className="block text-xs sm:text-sm font-medium text-muted-foreground mb-1.5 sm:mb-2">
          City and State
        </label>
        {mapboxLoaded ? (
          <AddressAutofill
            accessToken={import.meta.env.VITE_MAPBOX_API_KEY || ''}
            onRetrieve={handleRetrieve}
            options={{
              country: 'US',
              language: 'en'
            }}
          >
            <input
              ref={locationInputRef}
              id="location"
              type="text"
              name="location"
              placeholder="Start typing city name (e.g., Naples FL or Naples, FL)..."
              value={data.location}
              onChange={(e) => onChange('location', e.target.value)}
              className="w-full px-4 py-3 sm:py-3 text-base sm:text-lg border border-input bg-background rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition duration-200 touch-manipulation min-h-[48px] sm:min-h-[44px]"
              style={{ fontSize: '16px' }}
              aria-label="City and State"
              autoComplete="off"
              required
            />
          </AddressAutofill>
        ) : (
          <div className="relative">
            <input
              ref={locationInputRef}
              id="location"
              type="text"
              placeholder="Enter city and state (e.g., Naples FL or Naples, FL)"
              value={data.location}
              onChange={(e) => {
                onChange('location', e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => {
                if (suggestions.length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="w-full px-4 py-3 sm:py-3 text-base sm:text-lg border border-input bg-background rounded-xl sm:rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-primary transition duration-200 touch-manipulation min-h-[48px] sm:min-h-[44px]"
              style={{ fontSize: '16px' }}
              aria-label="City and State"
              autoComplete="off"
              required
            />
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      onChange('location', suggestion);
                      setShowSuggestions(false);
                      locationInputRef.current?.focus();
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {errorMessage && (
          <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
        )}
        {status === 'verifying' && (
          <p className="mt-2 text-sm text-muted-foreground flex items-center gap-2">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
            Verifying location…
          </p>
        )}
        {status === 'verified' && raw && (
          <p className="mt-2 text-sm text-primary flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Verified location
          </p>
        )}
      </div>
      <StepNavigation onNext={onNext} onBack={onBack} isNextDisabled={status !== 'verified'} />
    </div>
  );
};

StepLocation.displayName = 'StepLocation';

export default StepLocation;