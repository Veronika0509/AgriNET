import axios from "axios";

export interface Layer {
  id: string;
  name: string;
  value: string;
  // Add other fields from the API response as needed
}

export interface LayersResponse {
  layers: Layer[];
  mapping: { [key: string]: string };
}

// Static layer data to use in case of API error
const defaultLayers: Layer[] = [
  { id: "1", name: "BFlow", value: "BFlow" },
  { id: "2", name: "CHEM", value: "CHEM" },
  { id: "3", name: "EXTL", value: "EXTL" },
  { id: "4", name: "Moist", value: "Moist" },
  { id: "5", name: "PlantHealth", value: "PlantHealth" },
  { id: "6", name: "PSI", value: "PSI" },
  { id: "7", name: "TempRH", value: "TempRH" },
  { id: "8", name: "Valve", value: "Valve" },
  { id: "9", name: "WXET", value: "WXET" },
  { id: "10", name: "WXMI", value: "WXMI" },
  { id: "11", name: "WXSS", value: "WXSS" }
];

export const getLayers = async (): Promise<LayersResponse> => {
  try {
    const response = await axios.get('https://app.agrinet.us/api/map/layers');
    
    // Check that the response contains an array of layers
    if (response.data && Array.isArray(response.data.layers) && response.data.layers.length > 0) {
      // Transform the array of strings into Layer objects with necessary changes
      let layers = response.data.layers;

      // Remove Teros and SRS from the list
      layers = layers.filter((layer: string) => layer !== 'Teros' && layer !== 'SRS');

      // Replace SoilTemp with TempRH, but avoid duplicates
      // If TempRH already exists in the list, remove SoilTemp instead of replacing
      const hasTempRH = layers.includes('TempRH');
      if (hasTempRH) {
        // If TempRH already exists, remove SoilTemp
        layers = layers.filter((layer: string) => layer !== 'SoilTemp');
      }

      const formattedLayers = layers.map((layerName: string, index: number) => {
        // If this is SoilTemp and TempRH doesn't exist yet, replace with TempRH
        const name = layerName === 'SoilTemp' ? 'TempRH' : layerName;

        return {
          id: String(index + 1),
          name: name,  // Use the (possibly modified) layer name
          value: name  // Use the same name as the value
        };
      });

      // Update mapping, replacing SoilTemp with TempRH
      const updatedMapping = { ...response.data.mapping };
      if (updatedMapping['SoilTemp']) {
        updatedMapping['TempRH'] = updatedMapping['SoilTemp'];
        delete updatedMapping['SoilTemp'];
      }
      
      return {
        layers: formattedLayers,
        mapping: updatedMapping
      };
    } else {
      return {
        layers: defaultLayers,
        mapping: {}
      };
    }
  } catch (error) {
    return {
      layers: defaultLayers,
      mapping: {}
    };
  }
};
