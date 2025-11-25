import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

interface LocationPickerProps {
  value: string;
  onChange: (location: string, coordinates?: { lat: number; lng: number }) => void;
  placeholder?: string;
}

export const LocationPicker = ({ value, onChange, placeholder }: LocationPickerProps) => {
  const [showMap, setShowMap] = useState(false);
  const [searchValue, setSearchValue] = useState(value);
  const [selectedPosition, setSelectedPosition] = useState<{ lat: number; lng: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Replace with your Google Maps API key
  // Get it from: https://console.cloud.google.com/google/maps-apis
  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

  useEffect(() => {
    setSearchValue(value);
  }, [value]);

  useEffect(() => {
    if (!inputRef.current || !window.google) return;

    // Initialize autocomplete
    autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
      types: ['geocode', 'establishment'],
      fields: ['formatted_address', 'geometry', 'name'],
    });

    // Listen for place selection
    autocompleteRef.current.addListener('place_changed', () => {
      const place = autocompleteRef.current?.getPlace();
      if (place?.formatted_address) {
        const location = place.formatted_address;
        setSearchValue(location);
        onChange(location, place.geometry?.location?.toJSON());
        
        if (place.geometry?.location) {
          setSelectedPosition(place.geometry.location.toJSON());
        }
      }
    });

    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
      }
    };
  }, [onChange]);

  const handleMapClick = (event: any) => {
    if (!event.detail?.latLng) return;
    
    const position = { lat: event.detail.latLng.lat, lng: event.detail.latLng.lng };
    setSelectedPosition(position);

    // Reverse geocode to get address
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: position }, (results, status) => {
      if (status === 'OK' && results?.[0]) {
        const address = results[0].formatted_address;
        setSearchValue(address);
        onChange(address, position);
      }
    });
  };

  const handleConfirmLocation = () => {
    setShowMap(false);
  };

  if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
    return (
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchValue}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onChange(e.target.value);
            }}
            placeholder={placeholder}
            className="pl-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          To enable location search and map selection, add your Google Maps API key in LocationPicker.tsx
        </p>
      </div>
    );
  }

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={['places']}>
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder={placeholder}
              className="pl-10"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setShowMap(!showMap)}
            className="shrink-0"
          >
            <MapPin className="h-4 w-4" />
          </Button>
        </div>

        {showMap && (
          <div className="border rounded-lg overflow-hidden">
            <Map
              defaultCenter={selectedPosition || { lat: 40.7128, lng: -74.0060 }}
              defaultZoom={12}
              style={{ width: '100%', height: '300px' }}
              onClick={handleMapClick}
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {selectedPosition && <Marker position={selectedPosition} />}
            </Map>
            <div className="p-2 bg-muted/50 border-t flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmLocation}
              >
                Confirm Location
              </Button>
            </div>
          </div>
        )}
      </div>
    </APIProvider>
  );
};
