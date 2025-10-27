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

// Статичные данные слоев для использования в случае ошибки API
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
    
    // Проверяем, что ответ содержит массив слоев
    if (response.data && Array.isArray(response.data.layers) && response.data.layers.length > 0) {
      // Преобразуем массив строк в объекты Layer, с необходимыми изменениями
      let layers = response.data.layers;
      
      // Удаляем Teros и SRS из списка
      layers = layers.filter((layer: string) => layer !== 'Teros' && layer !== 'SRS');
      
      // Заменяем SoilTemp на TempRH
      const formattedLayers = layers.map((layerName: string, index: number) => {
        // Если это SoilTemp, заменяем на TempRH
        const name = layerName === 'SoilTemp' ? 'TempRH' : layerName;
        
        return {
          id: String(index + 1),
          name: name,  // Используем (возможно измененное) имя слоя
          value: name  // Используем то же имя как значение
        };
      });
      
      // Обновляем mapping, заменяя SoilTemp на TempRH
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
