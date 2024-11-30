// globals.d.ts
import L from 'leaflet';

declare global {
  interface Window {
    map: L.Map;  // Declaring the map property on the window object
  }
}
