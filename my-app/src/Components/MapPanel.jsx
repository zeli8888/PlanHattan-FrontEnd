import './MapPanel.css';
import { useMapContext } from '../Contexts/MapContexts'; // 👈 use context
import Map from 'react-map-gl/mapbox';


const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
function MapPanel() {

    const { viewport, setViewport } = useMapContext();
  return (
    <div className="map-panel">
      <Map
        {...viewport}
        onMove={(evt) => setViewport(evt.viewState)}
        mapStyle="mapbox://styles/rahulrodi/cmbtlz1q9014o01sc7rjd6axj/draft"
        mapboxAccessToken={TOKEN}
        style={{ width: '100%', height: '100%' }}
      />
      </div>
  );
}

export default MapPanel;
