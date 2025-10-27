import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  IonPage,
  IonContent,
  useIonToast,
  useIonAlert,
  IonIcon,
  IonSegment, 
  IonSegmentButton,
  IonLabel,
  IonButton,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonTextarea,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonCheckbox
} from '@ionic/react';
import QRScanner from '../../components/QRScanner';
import SensorSelector from '../VirtualValve/components/TimezoneSelector';
import { useHistory } from 'react-router-dom';
import { documentText, home, informationCircle, informationCircleOutline, add, settings, cameraOutline } from 'ionicons/icons';
import type { 
  Site, 
  SensorData, 
  ChartPageType, 
  UserId, 
  SiteId
} from '../../types';
// LayerList interfaces
interface LayerListLayer {
  name: string;
  markers: LayerListMarker[];
  [key: string]: unknown;
}

interface LayerListMarker {
  chartData: {
    sensorId: string | number;
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Extend Site interface to include layers
interface SiteWithLayers extends Site {
  layers?: LayerListLayer[];
}
import invalidChartDataImage from '../../assets/images/invalidChartData.png';
import { testCustomOverlays } from './functions/testCustomOverlays';

// Chart data types (using unknown for now to avoid compilation errors)
type MoistChartData = unknown;
type FuelChartData = unknown;
type TempChartData = unknown;

// Extl data types
interface ExtlSensorData {
  sensorId: string | number;
  name?: string;
  lat: number;
  lng: number;
  graphic?: unknown;
  width?: number;
  height?: number;
  [key: string]: unknown;
}

interface ExtlBounds {
  lat: number;
  lng: number;
  [key: string]: unknown;
}

type ExtlDataContainerItem = [ExtlSensorData, ExtlBounds];

// Custom overlay constructor type
type CustomOverlayConstructor = {
  new (...args: any[]): OverlayItem;
};

// Chart data with bounds type
type ChartDataWithBounds<T> = [T, google.maps.LatLngBounds];

// Marker type
type Marker = {
  position: google.maps.LatLngLiteral;
  id: string | number;
  type: string;
  [key: string]: unknown;
};
import Header from "./components/Header";
import {initializeMoistCustomOverlay} from "./components/types/moist/MoistCustomOverlay";
import {getSiteList} from "./data/getSiteList";
import {getLayers} from "./data/getLayers";
import {createMap} from "./functions/createMap";
import {createSites} from "./functions/createSites";
import {createMoistChartForOverlay} from "./functions/types/moist/createMoistChartForOverlay";
import {initializeWxetCustomOverlay} from "./components/types/wxet/WxetCustomOverlay";
import {initializeTempCustomOverlay} from "./components/types/temp/TempCustomOverlay";
import {createTempChartForOverlay} from "./functions/types/temp/createTempChartForOverlay";
import {CollisionResolver} from "./components/CollisionResolver";
import {initializeValveCustomOverlay} from "./components/types/valve/ValveCustomOverlay";
import {createValveChartForOverlay} from "./functions/types/valve/createValveChartForOverlay";
import s from './style.module.css';
import {addOverlayToOverlaysArray} from "./functions/types/moist/addOverlayToOverlaysArray";
import Info from "../Info";
import BudgetEditor from "./components/types/moist/BudgetEditor";
import Comments from "./components/Comments";
import {initializeExtlCustomOverlay} from "./components/types/extl/ExtlCustomOverlay";
import {initializeFuelCustomOverlay} from "./components/types/wxet/FuelCustomOverlay";
import LocationButton from "./components/LocationButton";
import {createFuelChartForOverlay} from "./functions/types/wxet/createFuelChartForOverlay";
import { OverlayItem } from "./types/OverlayItem";


// Типы (already imported above)

// Интерфейсы для типизации Map компонента
interface ChartDataItem {
  sensorId: string | number;
  markerType?: string;
  [key: string]: unknown;
}

// Base interface for custom overlays
interface BaseOverlay {
  show: () => void;
  hide: () => void;
  getBounds: () => {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  getPosition: () => { lat: number; lng: number };
  setPosition: (lat: number, lng: number) => void;
  getDiv: () => HTMLElement | null;
  draw: () => void;
  setMap: (map: google.maps.Map | null) => Promise<void>;
  update?: () => void;
  sensorId: string | number;
  layerName: string;
  [key: string]: unknown;
}

// Type for custom overlay constructor functions (duplicate removed - using definition from line 47)

interface Coordinate {
  lat: number;
  lng: number;
}

// Interface for chart data bounds
interface ChartBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// Type for chart data with bounds (duplicate removed - using definition from line 52)

// Interface for amCharts root elements
interface ChartRoot {
  dispose: () => void;
  [key: string]: unknown;
}

// Base interface for all overlay items (duplicate removed - using definition from line 36)

// Interface for API responses
interface ApiResponse<T> {
  data: T;
}

// Type for marker data
// Marker interface (duplicate removed - using type definition from line 55)

// Type for sensor data point
interface DataPoint {
  date: Date | string | number;
  value: number;
  [key: string]: unknown;
}

interface MapProps {
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  userId: UserId;
  siteList: Site[];
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>;
  setSiteId: React.Dispatch<React.SetStateAction<SiteId>>;
  setSiteName: React.Dispatch<React.SetStateAction<string>>;
  setChartData: React.Dispatch<React.SetStateAction<SensorData[]>>;
  chartData: SensorData[];
  isGoogleApiLoaded: boolean;
  setAdditionalChartData: React.Dispatch<React.SetStateAction<SensorData[]>>;
  setChartPageType: React.Dispatch<React.SetStateAction<ChartPageType>>;
  key: number;
  reloadMapPage?: () => Promise<void>;
  selectedSiteForAddUnit: string;
  setSelectedSiteForAddUnit: React.Dispatch<React.SetStateAction<string>>;
  setSelectedMoistureSensor?: (sensor: any) => void;
}

const MapPage: React.FC<MapProps> = (props) => {
  if (!props.reloadMapPage) {

  }
  const present = useIonToast()
  const [presentAlert] = useIonAlert();
  const userRole = localStorage.getItem('userRole');
  const [presentEmptyNameAlert] = useIonAlert();
  const [activeTab, setActiveTab] = useState('map');
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['map']);
  const addUnitMapRef = useRef<HTMLDivElement>(null);
  const [centerMarker, setCenterMarker] = useState<google.maps.Marker | null>(null);
  const [crosshairMarker, setCrosshairMarker] = useState<google.maps.Marker | null>(null);
  const [isMarkerClicked, setIsMarkerClicked] = useState(false);
  const [, setAreArraysUpdated] = useState(false);
  
  // Add Unit form state
  const [unitName, setUnitName] = useState<string>('');
  const [unitLatitude, setUnitLatitude] = useState<string>('');
  const [unitLongitude, setUnitLongitude] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>(props.selectedSiteForAddUnit || '');
  const [selectedSiteGroup, setSelectedSiteGroup] = useState<string>('');
  const [siteGroups, setSiteGroups] = useState<Array<{id: string | number; name: string}>>([]);
  
  // Initialize coordinates when component mounts or props change
  useEffect(() => {
    // If we have a selected site from props and siteList is loaded
    if (props.selectedSiteForAddUnit && props.siteList && props.siteList.length > 0) {
      const site = props.siteList.find(s => s.id === props.selectedSiteForAddUnit);
      if (site) {
        setUnitLatitude(site.lat.toString());
        setUnitLongitude(site.lng.toString());
      }
    }
  }, [props.selectedSiteForAddUnit, props.siteList]);
  
  // Update coordinates when selected site changes
  useEffect(() => {
    if (selectedSite && props.siteList && props.siteList.length > 0) {
      const site = props.siteList.find(s => s.id === selectedSite);
      if (site) {
        // Update form fields with site coordinates
        setUnitLatitude(site.lat.toString());
        setUnitLongitude(site.lng.toString());
      }
    }
  }, [selectedSite, props.siteList]);
  const [sensorPrefix, setSensorPrefix] = useState<string>('');
  const [sensorId, setSensorId] = useState<string>('');
  
  // Функция валидации SensorId
  const validateSensorId = (fullSensorId: string): { isValid: boolean; message?: string } => {
    // Проверяем формат: 2900 + ровно 5 цифр
    if (/^2900\d{5}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // Проверяем формат: 24 + любые 2 цифры + ровно 5 цифр (всего 9 цифр)
    if (/^24\d{7}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // Проверяем формат: TSG + ровно 5 цифр
    if (/^TSG\d{5}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // Проверяем формат: ANM + ровно 5 цифр
    if (/^ANM\d{5}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // Если не прошло валидацию
    return { 
      isValid: false, 
      message: 'Sensor ID does not correspond mask: 2900XXXXX, 24XXXXXXX, TSGXXXXX or ANMXXXXX'
    };
  };

  // Функция получения всех существующих sensor IDs
  const getAllSensorIds = async (): Promise<string[]> => {
    try {
      const response = await fetch('https://app.agrinet.us/api/utils/all-sensor-ids');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('All Sensor IDs from server:', data);
      console.log('Type of data:', Array.isArray(data) ? 'Array' : typeof data);
      if (data.length > 0) {
        console.log('First item type:', typeof data[0]);
        console.log('First item:', data[0]);
      }
      return data;
    } catch (error) {
      return [];
    }
  };

  // Функция проверки на дубликаты sensor ID
  const checkSensorIdExists = async (sensorId: string): Promise<{ exists: boolean; layers: string[] }> => {
    const allSensorIds = await getAllSensorIds();
    console.log('Checking for sensor ID:', sensorId);
    console.log('Total sensor IDs in database:', allSensorIds.length);
    
    // API возвращает массив строк, проверяем наличие в массиве
    const exists = allSensorIds.includes(sensorId);
    
    console.log('Exists in array?', exists);
    
    if (exists) {
      // Получаем информацию о слое для существующего sensor ID
      try {
        console.log('Fetching layer info for sensor ID:', sensorId);
        const response = await fetch(`https://app.agrinet.us/api/utils/${sensorId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('Sensor info from server:', data);
          
          // API возвращает массив объектов, каждый объект имеет поле layer
          let layers: string[] = [];
          if (Array.isArray(data)) {
            layers = data
              .filter(item => item.layer) // Берем только объекты с полем layer
              .map(item => item.layer);
          }
          
          console.log('Extracted layers:', layers);
          
          return {
            exists: true,
            layers: layers.length > 0 ? layers : ['Unknown']
          };
        }
      } catch (error) {
        console.error('Error fetching sensor info:', error);
      }
      
      // Если не удалось получить информацию о слое, возвращаем Unknown
      return {
        exists: true,
        layers: ['Unknown']
      };
    }
    
    return {
      exists: false,
      layers: []
    };
  };
  
  const handleInfoClick = (e: React.MouseEvent<HTMLIonIconElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    presentAlert({
      header: 'Sensor ID Information',
      message: 'Please enter the sensor ID that you want to associate with this unit. This ID will be used to link the sensor data to this unit.',
      buttons: [
        {
          text: 'Thanks',
          role: 'cancel',
          cssClass: 'alert-button-confirm',
          handler: () => {
          }
        }
      ]
    });
  };
  const [selectedLayer, setSelectedLayer] = useState<string>('');
  const [requestHardware, setRequestHardware] = useState<boolean>(false);
  const [moistLevel, setMoistLevel] = useState<number | undefined>(undefined);
  const [moistLevelError, setMoistLevelError] = useState<boolean>(false);
  const [layers, setLayers] = useState<Array<{id: string; name: string; value: string}>>([]);
  const [layerMapping, setLayerMapping] = useState<{ [key: string]: string }>({});
  const [isLoadingLayers, setIsLoadingLayers] = useState<boolean>(false);
  
  // Track form validation errors
  const [formErrors, setFormErrors] = useState({
    site: false,
    siteGroup: false,
    unitName: false,
    latitude: false,
    longitude: false,
    sensor: false,
    layer: false
  });
  
  // Состояние для модального окна выбора сенсора
  const [isSensorModalOpen, setIsSensorModalOpen] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<any>(null);
  const [availableSensors, setAvailableSensors] = useState<any[]>([]);

  const handleCloseSensorModal = useCallback(() => {
    setIsSensorModalOpen(false);
  }, []);

  const handleSensorSelect = useCallback((sensor: any) => {
    setSelectedSensor(sensor);
    setIsSensorModalOpen(false);
    
    // Сохраняем выбранный сенсор в глобальном состоянии и переходим на VirtualValve страницу
    props.setSelectedMoistureSensor?.(sensor);
    props.setPage(3);
  }, [props]);

  // Responsive design state
  const [isMobileView, setIsMobileView] = useState<boolean>(window.innerWidth < 768);
  
  // QR Scanner state
  const [isQRScannerOpen, setIsQRScannerOpen] = useState<boolean>(false);
  const [scannedQRData, setScannedQRData] = useState<string>('');
  
  // Timezone modal state
  const [isTimezoneModalOpen, setIsTimezoneModalOpen] = useState<boolean>(false);
  const [selectedTimezone, setSelectedTimezone] = useState<string>('America/Los_Angeles');
  // Timezone modal handlers
  const handleCloseTimezoneModal = () => {
    setIsTimezoneModalOpen(false);
  };

  const handleTimezoneSelect = (timezone: string) => {
    setSelectedTimezone(timezone);
    setIsTimezoneModalOpen(false);
    // После выбора часового пояса переходим на страницу 3
    props.setPage(3);
  };

  // Purchase Request Alert function
  const showPurchaseRequestAlert = () => {
    presentAlert({
      header: 'Purchase Request',
      message: 'This selection will place an order for equipment. Your dealer will contact you shortly. Thanks.',
      buttons: [
        {
          text: 'THANKS',
          role: 'confirm'
        }
      ]
    });
  };

  // Function to check if site name is valid
  const isSiteNameValid = (siteName: string): { isValid: boolean; error?: string } => {
    if (!siteName || !siteName.trim()) {
      return { isValid: false, error: 'Site name cannot be empty' };
    }
    
    const trimmedName = siteName.trim();
    const siteExists = props.siteList.some(site => 
      site.name.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (siteExists) {
      return { isValid: false, error: 'A site with this name already exists' };
    }
    
    return { isValid: true };
  };

  // Function to create a new site
  const handleCreateNewSite = async (siteName: string): Promise<Site | null> => {
    
    if (!siteName || !siteName.trim()) {
      // This should never happen as we check this before calling handleCreateNewSite
      return null;
    }
    
    const validation = isSiteNameValid(siteName);
    
    if (!validation.isValid) {
      // Show error for duplicate name using the main alert
      try {
        await presentAlert({
          header: 'Error',
          message: validation.error || 'Invalid site name',
          buttons: ['OK']
        });
      } catch (error) {
      }
      return null;
    }
    
    try {
      const trimmedName = siteName.trim();
      
      // Create new site object
      const newSite: Site = {
        id: trimmedName as SiteId,
        name: trimmedName,
        lat: 0,
        lng: 0
      };
      
      // Update the site list
      props.setSiteList(prev => {
        const newList = [...prev, newSite];
        return newList;
      });
      
      // Select the new site
      setSelectedSite(trimmedName);
      props.setSelectedSiteForAddUnit(trimmedName);
      
      return newSite;
    } catch (error) {
      throw error; // Пробрасываем ошибку дальше
    }
  };

  // Create New Site Alert function
  const showCreateNewSiteAlert = () => {
    
    // Проверяем, что presentAlert инициализирован
    if (typeof presentAlert !== 'function' || typeof presentEmptyNameAlert !== 'function') {
      return;
    }
    
    presentAlert({
      header: 'Create new site',
      cssClass: 'create-site-alert',
      backdropDismiss: false, // Prevent closing on backdrop click
      inputs: [
        {
          name: 'siteName',
          placeholder: 'Enter a site name',
          type: 'text',
          cssClass: s.alarm_actionInput,
          attributes: {
            required: true,
            minlength: 1
          },
          value: ''
        }
      ],
      buttons: [
        {
          text: 'CANCEL',
          role: 'cancel',
          handler: () => {
            return true; // Allow dialog to close
          }
        },
        {
          text: 'CREATE',
          role: 'confirm',
          handler: async (data: any) => {
            const siteName = data?.siteName || '';
            
            // If field is empty, show error alert
            if (!siteName || !siteName.trim()) {
              
              try {
                const result = await new Promise<boolean>((resolve) => {
                  presentEmptyNameAlert({
                    header: 'Error',
                    message: 'Site name cannot be empty',
                    backdropDismiss: false,
                    buttons: [
                      {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                          resolve(false); // Close both dialogs
                          return false;
                        }
                      },
                      {
                        text: 'Retry',
                        handler: () => {
                          resolve(true); // Keep create dialog open
                          return true;
                        }
                      }
                    ]
                  });
                });
                
                return result; // true to keep dialog open, false to close
              } catch (error) {
                return false; // Close dialog on error
              }
            }
            
            // Check if site with this name already exists
            const siteExists = props.siteList.some(site => 
              site.name.toLowerCase() === siteName.toLowerCase()
            );
            
            if (siteExists) {
              try {
                const result = await new Promise<boolean>((resolve) => {
                  presentEmptyNameAlert({
                    header: 'Error',
                    message: 'A site with this name already exists',
                    backdropDismiss: false,
                    buttons: [
                      {
                        text: 'Cancel',
                        role: 'cancel',
                        handler: () => {
                          resolve(false); // Close both dialogs
                          return false;
                        }
                      },
                      {
                        text: 'Retry',
                        handler: () => {
                          resolve(true); // Keep create dialog open
                          return true;
                        }
                      }
                    ]
                  });
                });
                return result; // true to keep dialog open, false to close
              } catch (error) {
                return false; // Close dialog on error
              }
            }
            
            // For non-empty and unique names, proceed with site creation
            try {
              const result = await handleCreateNewSite(siteName);
              // Return true only if site was created successfully
              return result !== null;
            } catch (error) {
              return false; // Keep dialog open on error
            }
          }
        }
      ]
    });
  };
  const [addUnitMap, setAddUnitMap] = useState<google.maps.Map | null>(null);

  // Выводим координаты при монтировании компонента
  useEffect(() => {
    // Функция для вывода координат
    const logSiteCoordinates = () => {
      const site = props.selectedSiteForAddUnit && props.siteList
        ? props.siteList.find(s => s.name === props.selectedSiteForAddUnit)
        : props.siteList?.[0];
      
      if (site) {
        
        // Заполняем поля ввода координатами
        if (site.lat !== undefined) {
          setUnitLatitude(site.lat.toString());
        }
        if (site.lng !== undefined) {
          setUnitLongitude(site.lng.toString());
        }
        return true;
      }
      return false;
    };

    // Пытаемся вывести координаты сразу
    if (!logSiteCoordinates()) {
      // Если не получилось, пробуем снова через короткое время
      const timer = setTimeout(() => logSiteCoordinates(), 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Логируем координаты при изменении выбранного сайта
  useEffect(() => {
    if (selectedSite && props.siteList) {
      const site = props.siteList.find(s => s.name === selectedSite || s.name === props.selectedSiteForAddUnit);
      if (site) {
      }
    }
  }, [selectedSite, props.siteList, unitLatitude, unitLongitude]);

  // Handle window resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Initialize form with site when sites are loaded or when selected site changes
  useEffect(() => {
    if (props.siteList && props.siteList.length > 0) {
      const site = props.siteList.find(s => s.name === selectedSite || s.name === props.selectedSiteForAddUnit);
      if (site) {
        setSelectedSite(site.name);
        if (site.lat && site.lng) {
          setUnitLatitude(site.lat.toString());
          setUnitLongitude(site.lng.toString());
        }
      } 
      // Otherwise use the first site if nothing is selected
      else if (!selectedSite && props.siteList.length > 0) {
        const firstSite = props.siteList[0];
        setSelectedSite(firstSite.name);
        props.setSelectedSiteForAddUnit(firstSite.name);
        if (firstSite.lat && firstSite.lng) {
          setUnitLatitude(firstSite.lat.toString());
          setUnitLongitude(firstSite.lng.toString());
        }
      }
    }
  }, [props.siteList, selectedSite, props.selectedSiteForAddUnit]);

  // Function to grab coordinates from crosshair marker position with rounding
  const grabCoordinatesFromMap = () => {
    if (crosshairMarker && crosshairMarker.getPosition()) {
      const position = crosshairMarker.getPosition()!;
      const roundedLat = Math.round(position.lat() * 10000000) / 10000000; // Округление до 7 знаков
      const roundedLng = Math.round(position.lng() * 10000000) / 10000000;
      
      setUnitLatitude(roundedLat.toString());
      setUnitLongitude(roundedLng.toString());
      
      // Find closest site to the marker position
      if (props.siteList && props.siteList.length > 0) {
        let closestSite = props.siteList[0];
        let minDistance = Number.MAX_VALUE;
        
        props.siteList.forEach(site => {
          if (site.lat && site.lng) {
            const distance = Math.sqrt(
              Math.pow(site.lat - roundedLat, 2) + Math.pow(site.lng - roundedLng, 2)
            );
            if (distance < minDistance) {
              minDistance = distance;
              closestSite = site;
            }
          }
        });
        
        setSelectedSite(closestSite.name);
      }
    }
  };

  // Load layers when component mounts
  useEffect(() => {
    const loadLayers = async () => {
      setIsLoadingLayers(true);
      try {
        const layersData = await getLayers();
        setLayers(layersData.layers);
        setLayerMapping(layersData.mapping);
      } catch (error) {
      } finally {
        setIsLoadingLayers(false);
      }
    };

    loadLayers();
  }, []);

  // Fetch user site groups when navigating to Add Unit page
  useEffect(() => {
    if (activeTab === 'add') {
      // Simple fetch request to get user site groups
      fetch('https://app.agrinet.us/api/add-unit/user-site-groups')
        .then(response => {
          console.log('Site groups API response status:', response.status);
          console.log('Site groups API response headers:', response.headers);
          
          // Try to parse as JSON if possible
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return response.json();
          } else {
            // If not JSON, get text
            return response.text().then(text => {
              console.log('Site groups API raw text response:', text);
              return text;
            });
          }
        })
        .then(data => {
          const datanew = ["Group1", "Group2", "Group3"]
          console.log('Site groups API response data:', datanew);
          
          // Set site groups if data is valid and not empty
          if (datanew && Array.isArray(datanew) && datanew.length > 0) {
            // Convert string array to object array with id and name
            const formattedGroups = datanew.map((group, index) => ({
              id: index + 1,
              name: group
            }));
            setSiteGroups(formattedGroups);
            
            // Automatically select the first site group
            if (formattedGroups.length > 0) {
              setSelectedSiteGroup(formattedGroups[0].name);
            }
          } else {
            // Clear site groups if data is empty
            setSiteGroups([]);
          }
        })
        .catch(error => {
          console.error('Error fetching user site groups:', error);
          // Clear site groups on error
          setSiteGroups([]);
        });
    }
  }, [activeTab]);

  // Initialize Add Unit map when tab is active and API is loaded
  useEffect(() => {
    if (activeTab === 'add' && props.isGoogleApiLoaded && window.google && window.google.maps && addUnitMapRef.current) {
      try {
        // Determine center coordinates based on sites availability
        let centerCoords = { lat: 41.9106638, lng: -87.6828648 }; // Chicago default
        let zoomLevel = 14; // Moderate zoom for Chicago
        
        // If sites are available, center on the first site
        if (props.siteList && props.siteList.length > 0) {
          const firstSite = props.siteList[0];
          if (firstSite.lat && firstSite.lng) {
            centerCoords = { lat: firstSite.lat, lng: firstSite.lng };
            zoomLevel = 16; // Good zoom for site view
          }
        }
        
        // Create or recreate the map
        const map = new window.google.maps.Map(addUnitMapRef.current, {
          center: centerCoords,
          zoom: zoomLevel,
          mapTypeId: window.google.maps.MapTypeId.SATELLITE
        });
        
        // Store map reference for coordinate grabbing
        setAddUnitMap(map);
        
        // Create crosshair marker with original design
        const crosshairPath = 'M 0,0 m -25,0 a 25,25 0 1,1 50,0 a 25,25 0 1,1 -50,0 M 0,-35 L 0,-10 M 0,10 L 0,35 M -35,0 L -10,0 M 10,0 L 35,0 M 0,0 m -8,0 a 8,8 0 1,1 16,0 a 8,8 0 1,1 -16,0 M 0,0 m -2,0 a 2,2 0 1,1 4,0 a 2,2 0 1,1 -4,0';
        
        const crosshair = new window.google.maps.Marker({
          position: centerCoords,
          map: map,
          icon: {
            path: crosshairPath,
            fillColor: 'white',
            fillOpacity: 1,
            strokeColor: 'black',
            strokeWeight: 3,
            scale: 0.8,
            anchor: new window.google.maps.Point(0, 0)
          },
          zIndex: 1000,
          title: 'Site Location'
        });
        
        
        setCrosshairMarker(crosshair);
        
        
        // Force resize after a short delay
        setTimeout(() => {
          window.google.maps.event.trigger(map, 'resize');
          map.setCenter(centerCoords);
        }, 100);
      } catch (error) {
      }
    } else if (activeTab !== 'add' && addUnitMap) {
      // Clean up map when leaving the tab
      setAddUnitMap(null);
    }
  }, [activeTab, props.isGoogleApiLoaded, props.siteList]);

  // Handle map resize when returning to Add Unit tab
  useEffect(() => {
    if (activeTab === 'add' && addUnitMap && addUnitMapRef.current) {
      setTimeout(() => {
        window.google.maps.event.trigger(addUnitMap, 'resize');
        // Re-center the map
        let centerCoords = { lat: 41.9106638, lng: -87.6828648 }; // Chicago default
        if (props.siteList && props.siteList.length > 0) {
          const firstSite = props.siteList[0];
          if (firstSite.lat && firstSite.lng) {
            centerCoords = { lat: firstSite.lat, lng: firstSite.lng };
          }
        }
        addUnitMap.setCenter(centerCoords);
      }, 100);
    }
  }, [activeTab, addUnitMap, props.siteList]);

  // Moist type
  const isMoistMarkerChartDrawn: boolean = false
  const [moistChartDataContainer, setMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidMoistChartDataContainer, setInvalidMoistChartDataContainer] = useState<ChartDataItem[]>([])
  const [moistOverlays, setMoistOverlays] = useState<OverlayItem[]>([])
  const moistOverlaysRef = useRef<any[]>([])
  const [currentSensorId, setCurrentSensorId] = useState<string | number>(0)
  const moistChartsAmount: ChartDataItem[] = []

  // Temp type
  const isTempMarkerChartDrawn: boolean = false
  const [tempChartDataContainer, setTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidTempChartDataContainer, setInvalidTempChartDataContainer] = useState<ChartDataItem[]>([])
  const [tempOverlays, setTempOverlays] = useState<OverlayItem[]>([])
  const tempChartsAmount: ChartDataItem[] = []

  // Valve type
  const isValveMarkerChartDrawn: boolean = false
  const [valveChartDataContainer, setValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [invalidValveChartDataContainer, setInvalidValveChartDataContainer] = useState<ChartDataItem[]>([])
  const [valveOverlays, setValveOverlays] = useState<OverlayItem[]>([])
  const valveChartsAmount: ChartDataItem[] = []

  // Wxet type
  const isFuelMarkerChartDrawn: boolean = false
  const [wxetDataContainer, setWxetDataContainer] = useState<ChartDataItem[]>([])
  const [invalidWxetDataContainer, setInvalidWxetDataContainer] = useState<ChartDataItem[]>([])
  const [fuelOverlays, setFuelOverlays] = useState<OverlayItem[]>([])
  const wxetChartsAmount: ChartDataItem[] = []

  // EXTl type
  const [extlDataContainer, setExtlDataContainer] = useState<ExtlDataContainerItem[]>([])
  const extlChartsAmount: ChartDataItem[] = []

  // All Types
  const allCoordinatesOfMarkers: Coordinate[] = [];
  const [activeOverlays, setActiveOverlays] = useState<OverlayItem[]>([])
  const [allOverlays, setAllOverlays] = useState<OverlayItem[]>([])
  const [coordinatesForFitting, setCoordinatesForFitting] = useState<Coordinate[]>([])


  // Map
  const [map, setMap] = React.useState<google.maps.Map | null>(null);
  const [initialZoom, setInitialZoom] = useState(0)
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [secondMap, setSecondMap] = useState<google.maps.Map | null>(null)
  const [amountOfSensors, setAmountOfSensors] = useState<number>(0)
  const [areBoundsFitted, setAreBoundsFitted] = useState(false)
  const mapRef = useRef(null);
  const [mapInitialized, setMapInitialized] = useState(false);
  
  // User location tracking
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);
  const [isLocationEnabled, setIsLocationEnabled] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  
  // LayerList state
  const [checkedLayers, setCheckedLayers] = useState<{[key: string]: boolean}>({});
  
  const history = useHistory();

  useEffect(() => {
    const initializeMap = async () => {

      if (props.page === 1 && activeTab === 'map' && !mapInitialized) {
        const sites = await getSiteList(props.userId);

        // Check if API call failed
        if ('success' in sites && sites.success === false) {
          console.error('Failed to load sites:', sites.error);
          present[0]({
            message: sites.error,
            duration: 5000,
            color: 'danger',
            position: 'top',
            buttons: ['Dismiss']
          });
          // Set empty array to prevent crashes
          props.setSiteList([]);
          return; // Exit early
        }

        // API call successful
        props.setSiteList(sites.data);


        if (mapRef.current) {

          createMap(map, setMap, mapRef);
          setMapInitialized(true);
          
          // Create sites immediately with fresh API data

          if (map && sites.data && sites.data.length > 0) {

            const sitesAsSensorsGroupData = sites.data.map((site: SiteWithLayers) => ({
              lat: site.lat,
              lng: site.lng,
              name: site.name,
              layers: site.layers || []
            }));
            
            createSites({
              page: props.page,
              map,
              siteList: sitesAsSensorsGroupData,
              markers: markers,
              setMarkers: setMarkers,
              userId: props.userId,
              allCoordinatesOfMarkers,
              setCoordinatesForFitting,
              setSecondMap,
              moistChartsAmount,
              setInvalidMoistChartDataContainer,
              setMoistChartDataContainer,
              wxetChartsAmount,
              setInvalidWxetDataContainer,
              setWxetDataContainer,
              tempChartsAmount,
              setInvalidTempChartDataContainer,
              setTempChartDataContainer,
              valveChartsAmount,
              setInvalidValveChartDataContainer,
              setValveChartDataContainer,
              amountOfSensors,
              setAmountOfSensors,
              setIsMarkerClicked,
              setInitialZoom,
              extlChartsAmount,
              setExtlDataContainer
            });
          }
        }
      }
    }
    initializeMap()
  }, [props.page, activeTab, mapInitialized]);
  useEffect(() => {
    if (activeOverlays.length !== 0) {
      CollisionResolver.resolve(activeOverlays);
    }
    if (map && props.siteList.length > 0) {


      // Map Site[] to SensorsGroupData[]
      const sitesAsSensorsGroupData = props.siteList.map((site: SiteWithLayers) => ({
        lat: site.lat,
        lng: site.lng,
        name: site.name,
        layers: site.layers || [] // Use layers from API data
      }));

      createSites({
        page: props.page,
        map,
        siteList: sitesAsSensorsGroupData,
        markers: markers,
        setMarkers: setMarkers,
        userId: props.userId,
        allCoordinatesOfMarkers,
        setCoordinatesForFitting,
        setSecondMap,
        moistChartsAmount,
        setInvalidMoistChartDataContainer,
        setMoistChartDataContainer,
        wxetChartsAmount,
        setInvalidWxetDataContainer,
        setWxetDataContainer,
        tempChartsAmount,
        setInvalidTempChartDataContainer,
        setTempChartDataContainer,
        valveChartsAmount,
        setInvalidValveChartDataContainer,
        setValveChartDataContainer,
        amountOfSensors,
        setAmountOfSensors,
        setIsMarkerClicked,
        setInitialZoom,
        initialZoom,
        extlChartsAmount,
        setExtlDataContainer,
        setAreArraysUpdated,
        history,
        setChartData: props.setChartData,
        setPage: props.setPage,
        setSiteId: props.setSiteId,
        setSiteName: props.setSiteName,
        setChartPageType: props.setChartPageType,
        setAdditionalChartData: props.setAdditionalChartData
      })
    }
  }, [map, props.siteList]);

  // Fix map display after returning from overlay
  useEffect(() => {
    if (activeTab === 'map' && map && mapRef.current) {
      // Force Google Maps to resize and redraw
      setTimeout(() => {
        if (map && mapRef.current) {
          google.maps.event.trigger(map, 'resize');
          // Optionally recenter the map if needed
          if (coordinatesForFitting.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            coordinatesForFitting.forEach(coord => {
              bounds.extend(new google.maps.LatLng(coord.lat, coord.lng));
            });
            map.fitBounds(bounds);
          }
        }
      }, 100); // Small delay to ensure DOM is ready
    }
  }, [activeTab, map]);

  // GPS Location functions
  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      React.startTransition(() => {
        setLocationError('Geolocation is not supported by this browser.');
      });
      return;
    }

    React.startTransition(() => {
      setLocationError(null);
    });
    

    
    // Try with high accuracy first, then fallback to low accuracy
    const tryHighAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {

          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          
          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setUserLocation(newLocation);
            setIsLocationEnabled(true);
          });
          
          // Update marker after state is set
          requestAnimationFrame(() => {
            if (map) {

              updateUserLocationMarker(newLocation);
              // Removed auto-centering - user doesn't want map to jump automatically
            }
          });
        },
        (error) => {
          // Fallback to low accuracy
          tryLowAccuracy();
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000 // 1 minute
        }
      );
    };
    
    const tryLowAccuracy = () => {
      navigator.geolocation.getCurrentPosition(
        (position) => {

          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          
          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setUserLocation(newLocation);
            setIsLocationEnabled(true);
          });
          
          // Update marker after state is set
          requestAnimationFrame(() => {
            if (map) {

              updateUserLocationMarker(newLocation);
              // Removed auto-centering - user doesn't want map to jump automatically
            }
          });
        },
        (error) => {
          let errorMessage = 'Unable to retrieve your location.';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied. Please enable location permissions.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out. Please try again.';
              break;
          }
          
          // Use React.startTransition for safe state updates
          React.startTransition(() => {
            setLocationError(errorMessage);
            setIsLocationEnabled(false);
          });
        },
        {
          enableHighAccuracy: false,
          timeout: 20000,
          maximumAge: 300000 // 5 minutes
        }
      );
    };
    
    // Start with high accuracy attempt
    tryHighAccuracy();
  }, [map]);

  const updateUserLocationMarker = (location: {lat: number, lng: number}) => {
    if (!map) return;

    // Remove existing marker if it exists
    if (userLocationMarker) {
      userLocationMarker.setMap(null);
    }

    // Create new marker for user location
    const marker = new google.maps.Marker({
      position: location,
      map: map,
      title: 'Your Location',
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2,
      },
      zIndex: 1000
    });

    setUserLocationMarker(marker);
  };

  const centerMapOnUserLocation = useCallback(() => {
    if (userLocation && map) {
      requestAnimationFrame(() => {
        map.setCenter(userLocation);
        map.setZoom(16);
      });
    } else {
      // Try to get location if not available
      getCurrentLocation();
    }
  }, [userLocation, map, getCurrentLocation]);

  // Initialize location on map load - ONLY ON MOBILE DEVICES
  useEffect(() => {
    // Check if device is mobile before initializing GPS
    const userAgent = navigator.userAgent;
    const screenWidth = window.screen?.width || window.innerWidth;
    const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);
    const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024;
    const shouldInitializeLocation = isMobileUserAgent && !isDesktop;
    
    // Initialize GPS ONLY on mobile devices when map is loaded
    if (map && activeTab === 'map' && shouldInitializeLocation) {
      // Small delay to ensure map is fully rendered
      const timer = setTimeout(() => {
        getCurrentLocation();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
    return () => {};
  }, [map, activeTab, getCurrentLocation]);

  // Moist Marker Chart
  useEffect(() => {
    if (moistChartDataContainer.length !== 0) {

      moistChartDataContainer.map((chartData: ChartDataItem) => {
        const MoistCustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new MoistCustomOverlayExport(
          false,
          chartData[1],
          invalidChartDataImage,
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setMoistOverlays,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
  }, [moistChartDataContainer]);
  useEffect(() => {
    if (invalidMoistChartDataContainer.length !== 0) {

      invalidMoistChartDataContainer.map((chartData: ChartDataItem) => {
        const CustomOverlayExport = initializeMoistCustomOverlay(props.isGoogleApiLoaded)
        const overlay = new CustomOverlayExport(
          false,
          chartData[1],
          invalidChartDataImage,
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isMoistMarkerChartDrawn,
          props.setAdditionalChartData,
          props.siteList,
          setMoistOverlays,
          props.setChartPageType,
          moistOverlaysRef,
          currentSensorId,
          setCurrentSensorId,
          false
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
  }, [invalidMoistChartDataContainer]);
  useEffect(() => {

    if (moistOverlays.length !== 0) {

      let roots: ChartRoot[] = [];
      moistOverlays.map((moistOverlay: OverlayItem) => {

        createMoistChartForOverlay('m', moistOverlay.chartData, roots, moistOverlays)
      })
      return () => {
        roots.forEach(root => root.dispose());
        roots = []
      };
    }
    return undefined;
  }, [moistOverlays]);

  // Wxet Marker
  useEffect(() => {
    if (wxetDataContainer.length !== 0) {

      wxetDataContainer.map((data: ChartDataItem) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === 'wxet') {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            (data: unknown) => props.setChartData(data as SensorData[]),
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType
          )
        } else if (data[0].markerType === 'fuel') {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays
          )
        }
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
  }, [wxetDataContainer]);
  useEffect(() => {
    if (invalidWxetDataContainer.length !== 0) {

      invalidWxetDataContainer.map((data: ChartDataItem) => {
        let overlay: OverlayItem | undefined
        if (data[0].markerType === 'wxet') {
          const WxetCustomOverlayExport = initializeWxetCustomOverlay(props.isGoogleApiLoaded)
          if (!WxetCustomOverlayExport) return
          overlay = new WxetCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            props.setAdditionalChartData,
            history,
            data[1],
            false,
            data[0],
            props.setChartPageType
          )
        } else if (data[0].markerType === 'fuel') {
          const FuelCustomOverlayExport = initializeFuelCustomOverlay(props.isGoogleApiLoaded)
          if (!FuelCustomOverlayExport) return
          overlay = new FuelCustomOverlayExport(
            props.setChartData,
            props.setPage,
            props.setSiteId,
            props.setSiteName,
            history,
            data[1],
            true,
            data[0],
            props.setChartPageType,
            isFuelMarkerChartDrawn,
            setFuelOverlays
          )
        }

        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
  }, [invalidWxetDataContainer]);

  useEffect(() => {
    if (fuelOverlays.length !== 0) {
      const roots: ChartRoot[] = [];
      fuelOverlays.map((fuelOverlay: OverlayItem) => {
        createFuelChartForOverlay(fuelOverlay.chartData, roots, fuelOverlays)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
    return undefined;
  }, [fuelOverlays]);

  // Temp Marker
  useEffect(() => {
    if (tempChartDataContainer.length !== 0) {

      tempChartDataContainer.map((chartData: ChartDataItem) => {
        const TempCustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!TempCustomOverlayExport) return
        const overlay = new TempCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          present
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
  }, [tempChartDataContainer]);
  useEffect(() => {
    if (invalidTempChartDataContainer.length !== 0) {

      invalidTempChartDataContainer.map((chartData: ChartDataItem) => {
        const CustomOverlayExport = initializeTempCustomOverlay(props.isGoogleApiLoaded)
        if (!CustomOverlayExport) return
        const overlay = new CustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          history,
          isTempMarkerChartDrawn,
          props.setAdditionalChartData,
          setTempOverlays,
          props.setChartPageType,
          props.userId,
          present
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
    return undefined;
  }, [invalidTempChartDataContainer]);
  useEffect(() => {
    if (tempOverlays.length !== 0) {
      const roots: ChartRoot[] = [];
      tempOverlays.map((tempOverlay: OverlayItem) => {
        createTempChartForOverlay(tempOverlay.chartData, roots, tempOverlays)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
    return undefined;
  }, [tempOverlays]);

  // Valve Marker
  useEffect(() => {
    if (valveChartDataContainer.length !== 0) {

      valveChartDataContainer.map((chartData: ChartDataItem) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          true,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
  }, [valveChartDataContainer]);
  useEffect(() => {
    if (invalidValveChartDataContainer.length !== 0) {

      invalidValveChartDataContainer.map((chartData: ChartDataItem) => {
        const ValveCustomOverlayExport = initializeValveCustomOverlay(props.isGoogleApiLoaded)
        if (!ValveCustomOverlayExport) return
        const overlay = new ValveCustomOverlayExport(
          chartData[1],
          false,
          chartData[0],
          props.setChartData,
          props.setPage,
          props.setSiteId,
          props.setSiteName,
          props.setChartPageType,
          history,
          isValveMarkerChartDrawn,
          setValveOverlays,
          props.userId
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
    return undefined;
  }, [invalidValveChartDataContainer]);

  useEffect(() => {
    if (valveOverlays.length !== 0) {
      const roots: ChartRoot[] = [];
      valveOverlays.map((valveOverlay: OverlayItem) => {
        createValveChartForOverlay(valveOverlay.chartData, roots, valveOverlays)
      })

      return () => {
        roots.forEach(root => root.dispose());
      };
    }
    return undefined;
  }, [valveOverlays]);

  // EXTL Marker
  useEffect(() => {
    if (extlDataContainer.length !== 0) {

      extlDataContainer.map((data: ExtlDataContainerItem) => {
        const ExtlCustomOverlayExport = initializeExtlCustomOverlay(props.isGoogleApiLoaded)
        if (!ExtlCustomOverlayExport) return
        
        // Преобразуем данные для ExtlCustomOverlay
        const extlItem: ExtlSensorData = data[0]; // Первый элемент - данные сенсора
        const extlBounds: ExtlBounds = data[1]; // Второй элемент - bounds
        
        // Создаем LatLngBounds из extlBounds
        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(extlItem.lat - 0.001, extlItem.lng - 0.001),
          new google.maps.LatLng(extlItem.lat + 0.001, extlItem.lng + 0.001)
        );
        
        // Преобразуем extlItem в ExtlChartData
        const extlChartData = {
          id: extlItem.sensorId,
          layerName: 'Extl',
          name: extlItem.name || `Sensor ${extlItem.sensorId}`,
          graphic: extlItem.graphic,
          chartType: 'default',
          width: extlItem.width,
          height: extlItem.height,
          sensorId: extlItem.sensorId
        };
        
        const overlay = new ExtlCustomOverlayExport(
          bounds,
          extlChartData
        )
        if (overlay) {
          React.startTransition(() => {
            addOverlayToOverlaysArray(overlay, setActiveOverlays, map);
          });
        }
      })
    }
  }, [extlDataContainer]);

  useEffect(() => {
    if (activeOverlays.length !== 0 && activeOverlays.length === amountOfSensors && !areBoundsFitted) {
      CollisionResolver.resolve(activeOverlays);
      setAllOverlays(activeOverlays)
      const bounds = new google.maps.LatLngBounds();
      coordinatesForFitting.forEach((coordinate: Coordinate) => {
        bounds.extend({lat: coordinate.lat, lng: coordinate.lng});
      });
      setAreBoundsFitted(true);
      map.fitBounds(bounds);
    } else {

    }
    return undefined;
  }, [activeOverlays]);

  useEffect(() => {
    if (activeOverlays.length !== 0 && areBoundsFitted) {
      CollisionResolver.resolve(activeOverlays);
      const handleResize = () => {
        new Promise((resolve: () => void) => {
          activeOverlays.map((overlay: OverlayItem) => {
            overlay.offset = {x: 0, y: 0}
          })
          resolve()
        }).then(() => {
          CollisionResolver.resolve(activeOverlays);
        })
      };
      window.addEventListener('resize', () => handleResize());
      map.addListener('zoom_changed', () => handleResize());
      return () => {
        window.removeEventListener('resize', handleResize);
        google.maps.event.clearListeners(map, 'zoom_changed');
      };
    }
  }, [activeOverlays, areBoundsFitted]);
  useEffect(() => {
    if (map) {
      if (activeTab !== 'map') {
        const mapDivs = document.querySelectorAll('.gm-style');
        mapDivs.forEach(div => {
          (div as HTMLElement).style.visibility = 'hidden';
        });
      } else {
        const mapDivs = document.querySelectorAll('.gm-style');
        mapDivs.forEach(div => {
          (div as HTMLElement).style.visibility = 'visible';
        });
        google.maps.event.trigger(map, 'resize');
      }
    }
  }, [activeTab, map]);

  // LayerList useEffect - initialize checked layers based on current site
  useEffect(() => {
    const initialCheckedState: {[key: string]: boolean} = {};
    if (props.siteList && Array.isArray(props.siteList) && secondMap) {
      const secondMapName = typeof secondMap === 'string' ? secondMap : (secondMap?.getDiv()?.id || '');
      props.siteList.forEach((site: SiteWithLayers) => {
        if (site && site.name === secondMapName && site.layers && Array.isArray(site.layers)) {
          site.layers.forEach((layer: LayerListLayer) => {
            if (layer && layer.name) {
              initialCheckedState[layer.name] = true;
            }
          });
        }
      });
    }
    setCheckedLayers(initialCheckedState);
  }, [secondMap, props.siteList]);

  // Initialize Add Unit map when Google API is loaded and activeTab is 'add'

  const renderContent = () => {

    switch (activeTab) {
      case 'map':

        return (
          <div
            className={s.map}
            ref={mapRef}
            style={{
              height: '100%',
              width: '100%',
              position: 'relative'
            }}
          >

            {/* LocationButton - Mobile devices only */}
            {(() => {
              const userAgent = navigator.userAgent;
              const screenWidth = window.screen?.width || window.innerWidth;
              const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);
              const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024;
              const shouldShowLocationButton = isMobileUserAgent && !isDesktop;
              
              if (!shouldShowLocationButton) {
                return null;
              }
              
              return (
                <LocationButton
                  onLocationClick={centerMapOnUserLocation}
                  isLocationEnabled={isLocationEnabled}
                  locationError={locationError}
                />
              );
            })()}
            
            {/* LayerList Component - Working version outside IIFE */}
            {(() => {
              // Check conditions for LayerList
              const hasSites = props.siteList && Array.isArray(props.siteList) && props.siteList.length > 0;
              const hasCustomOverlays = activeOverlays && activeOverlays.length > 0;
              
              if (!hasSites || !hasCustomOverlays) {
                return null;
              }
              
              // Extract layer names from site data
              const layers: string[] = [];
              const secondMapName = typeof secondMap === 'string' ? secondMap : (secondMap?.getDiv()?.id || '');
              
              if (props.siteList && Array.isArray(props.siteList)) {
                props.siteList.forEach((site: SiteWithLayers) => {
                  if (site && site.name === secondMapName && site.layers && Array.isArray(site.layers)) {
                    site.layers.forEach((layer: LayerListLayer) => {
                      if (layer && layer.name && !layers.includes(layer.name)) {
                        layers.push(layer.name);
                      }
                    });
                  }
                });
              }
              
              if (!layers || layers.length === 0) {
                return null;
              }
              
              // Handle layer toggle
              const handleToggleLayer = (checkbox: CustomEvent, layerName: string) => {
                const isChecked = checkbox.detail.checked;
                
                setCheckedLayers(prev => ({
                  ...prev,
                  [layerName]: isChecked
                }));
            
                if (allOverlays && Array.isArray(allOverlays)) {
                  allOverlays.forEach((overlay: OverlayItem) => {
                    const chartDataLayerName = overlay?.chartData?.layerName;
                    const isMatchByChartDataLayerName = chartDataLayerName === layerName;
                    
                    if (overlay && isMatchByChartDataLayerName) {
                      if (isChecked) {
                        if (overlay.show && typeof overlay.show === 'function') {
                          overlay.show();
                        }
                        if (activeOverlays && !activeOverlays.includes(overlay)) {
                          setActiveOverlays((prevActiveOverlays: OverlayItem[]) => {
                            const exists = prevActiveOverlays.some(
                                (existingOverlay: OverlayItem) => existingOverlay && existingOverlay.chartData && overlay.chartData && existingOverlay.chartData.sensorId === overlay.chartData.sensorId
                            );
                            return exists ? prevActiveOverlays : [...prevActiveOverlays, overlay];
                          });
                        }
                      } else {
                        if (overlay.hide && typeof overlay.hide === 'function') {
                          overlay.hide();
                        }
                        setActiveOverlays((prevActiveOverlays: OverlayItem[]) =>
                            prevActiveOverlays.filter((active: OverlayItem) => active && active.chartData && overlay.chartData && active.chartData.sensorId !== overlay.chartData.sensorId)
                        );
                      }
                    }
                  });
                }
              };
              
              return (
                <div className={s.layersListWrapper}>
                  <div className={s.layers_checkbox}>
                    {
                      layers.map((layer: string) => (
                          <IonItem key={layer}>
                            <IonCheckbox
                              checked={checkedLayers[layer] || false}
                              justify="space-between"
                              onIonChange={(checkbox) => handleToggleLayer(checkbox, layer)}
                            >
                              {layer === 'SoilTemp' ? 'Temp/RH' : layer}
                            </IonCheckbox>
                          </IonItem>
                      ))
                    }
                  </div>
                </div>
              );
            })()}
          </div>
        );
      case 'budgetEditor':
        return (
          <div style={{height: '100%'}}>
            <section style={{height: '100%'}}>
              <BudgetEditor siteList={props.siteList} userId={props.userId}
                            isGoogleApiLoaded={props.isGoogleApiLoaded}/>
            </section>
          </div>
        );
      case 'info':
        return (
          <div style={{height: '100%', padding: '16px'}}>
            <section>
              <Info/>
            </section>
          </div>
        );
      case 'comments':
        return (
          <div style={{height: '100%', padding: '16px'}}>
            <section>
              <Comments userId={props.userId}/>
            </section>
          </div>
        )
      case 'add':
        return (
          <div style={{height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative', backgroundColor: 'white'}}>
            {/* Map container taking half the screen */}
            <div 
              style={{
                height: '40vh',
                width: '100%',
                position: 'relative',
                flexShrink: 0,
                backgroundColor: 'white !important'
              }}
            >
              <div
                ref={addUnitMapRef}
                style={{
                  height: '100%',
                  width: '100%',
                  display: 'block',
                  position: 'relative',
                  backgroundColor: 'white'
                }}
              />
            </div>
            
            {/* Form section taking the other half */}
            <div style={{
              height: '60vh',
              position: 'relative'
            }}>
              {/* White overlay container */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'white',
                zIndex: 1000,
                padding: '20px',
                overflowY: 'auto'
              }}>
                {/* Form Fields */}
                <div style={{ 
                  maxWidth: '400px', 
                  margin: '0 auto',
                  width: '100%',
                  paddingBottom: '100px'
                }}>
                  <div style={{ 
                  maxWidth: '400px', 
                  margin: '0 auto',
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  {/* Only show camera button on mobile devices */}
                  {isMobileView && (
                    <IonButton fill='outline' size="default" style={{
                        width: '100%',
                        height: '36px'
                      }} onClick={() => {
                        // Open QR scanner
                        setIsQRScannerOpen(true);
                      }}>
                      <IonIcon icon={cameraOutline} slot="start" />
                      SCAN QR CODE
                    </IonButton>
                  )}
                  <IonButton 
                    fill="outline"
                    size="default"
                    style={{
                      width: '100%'
                    }}
                    onClick={() => {
                      // Сохраняем выбранный сайт в глобальном состоянии
                      props.setSelectedSiteForAddUnit(selectedSite);
                      
                      // Выводим информацию в консоль
                      
                      // Собираем все Moist сенсоры из ВСЕХ сайтов
                      const allSensors: any[] = [];
                      
                      // Проходим по всем сайтам в списке
                      props.siteList.forEach((site: any) => {
                        if (site.layers) {
                          // Ищем слои с именем Moist в каждом сайте
                          site.layers.forEach((layer: any) => {
                            if (layer.name === 'Moist' && layer.markers && Array.isArray(layer.markers)) {
                              // Добавляем все маркеры из слоя Moist
                              layer.markers.forEach((marker: any) => {
                                allSensors.push({
                                  layerName: layer.name,
                                  sensorId: marker.sensorId,
                                  name: marker.name,
                                  siteName: site.name, // Добавляем имя сайта для отображения
                                  ...marker
                                });
                              });
                            }
                          });
                        }
                      });
                      
                      
                      // Устанавливаем доступные сенсоры и открываем модальное окно
                      setAvailableSensors(allSensors);
                      setIsSensorModalOpen(true);
                    }}
                  >
                    ADD VALVE
                  </IonButton>
                  </div>
                

                  <div className={s.addUnitForm}>

                {/* Site Selection */}
                <IonItem className={s.addUnitFormItem}>
                  <IonLabel position="fixed" color="light" style={{ minWidth: '80px', alignSelf: 'center' }}>Site</IonLabel>
                  <IonSelect 
                    value={selectedSite} 
                    style={{ 
                      flex: 1, 
                      marginRight: '12px',
                      '--color': '#000000',
                      '--placeholder-color': '#000000',
                      '--placeholder-opacity': '1',
                      '--padding-start': '8px',
                      '--background': '#ffffff',
                      '--border': '1px solid #ccc',
                      '--border-radius': '4px'
                    }}
                    onIonChange={(e) => {
                      const newSite = e.detail.value;
                      
                      // Находим выбранный сайт в списке
                      const selectedSiteObj = props.siteList?.find(site => site.name === newSite);
                      
                      setSelectedSite(newSite);
                      props.setSelectedSiteForAddUnit(newSite);
                      
                      if (selectedSiteObj) {
                        
                        // Обновляем координаты в полях ввода
                        if (selectedSiteObj.lat !== undefined) {
                          setUnitLatitude(selectedSiteObj.lat.toString());
                        }
                        if (selectedSiteObj.lng !== undefined) {
                          setUnitLongitude(selectedSiteObj.lng.toString());
                        }
                        
                        // Center map on selected site
                        if (addUnitMap && selectedSiteObj.lat && selectedSiteObj.lng) {
                          const newCenter = { lat: selectedSiteObj.lat, lng: selectedSiteObj.lng };
                          addUnitMap.setCenter(newCenter);
                          addUnitMap.setZoom(16); // Good zoom for site view
                          
                          // Update crosshair marker position
                          if (crosshairMarker) {
                            crosshairMarker.setPosition(newCenter);
                          }
                        }
                      } else {
                        setUnitLatitude('');
                        setUnitLongitude('');
                      }
                    }}
                  >
                    {props.siteList?.map((site) => (
                      <IonSelectOption key={site.name} value={site.name}>
                        {site.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                  <IonButton 
                    fill="outline" 
                    size="small" 
                    onClick={(e) => {
                      showCreateNewSiteAlert();
                    }}
                    style={{
                      '--background': 'transparent',
                      '--border-color': 'var(--ion-color-primary)',
                      '--color': 'var(--ion-color-primary)',
                      '--border-radius': '4px',
                      '--padding-start': '8px',
                      '--padding-end': '8px',
                      'height': '32px',
                      'font-size': '12px',
                      'font-weight': '500',
                      'text-transform': 'uppercase',
                      'letter-spacing': '0.5px',
                      'margin-left': '8px'
                    }}
                  >
                    New Site
                  </IonButton>
                </IonItem>

                {/* Site Group Selection - Only show when there are more than 1 site groups */}
                {siteGroups.length > 1 && (
                  <IonItem 
                    className={s.addUnitFormItem}
                    style={{
                      '--background': 'transparent',
                      '--background-hover': 'transparent',
                      '--background-activated': 'transparent',
                      '--background-focused': 'transparent',
                      '--border-radius': '8px',
                      '--padding-start': '0 !important',
                      '--padding-end': '0 !important',
                      '--padding-top': '0',
                      '--padding-bottom': '0',
                      '--inner-padding-start': '0 !important',
                      '--transition': 'all 0.3s ease',
                      '--border': '1px solid #666666',
                      '--highlight-color-invalid': 'transparent',
                      '--highlight-color-valid': 'transparent',
                      '--highlight-color-focused': 'transparent',
                      '--color': 'inherit',
                      '--ripple-color': 'transparent',
                      '--inner-padding-top': '0',
                      '--inner-padding-bottom': '0',
                      '--inner-border-width': '0',
                      '--inner-padding-end': '0 !important',
                      'display': 'flex',
                      'flex-direction': 'column',
                      'align-items': 'stretch',
                      'margin': '0',
                    }}
                  >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0',
                    margin: '0'
                  }}>
                    <IonLabel 
                      style={{ 
                        color: '#666666',
                        opacity: '0.8',
                        margin: '0',
                        padding: '0'
                      }}
                    >
                      Site Group
                    </IonLabel>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0'
                    }}>
                      <style dangerouslySetInnerHTML={{__html: `
                        #site-group-select::part(placeholder) {
                          color: #666666 !important;
                          opacity: 1 !important;
                        }
                        #site-group-select::part(text) {
                          color: #000000 !important;
                          opacity: 1 !important;
                        }
                        #site-group-select::part(icon) {
                          color: #666666 !important;
                          opacity: 0.8 !important;
                        }
                      `}} />
                      <IonSelect 
                        id="site-group-select"
                        placeholder="Site Group"
                        style={{ 
                          width: 'auto',
                          '--placeholder-color': '#666666',
                          '--color': '#666666',
                          '--background': 'transparent',
                          '--background-hover': 'transparent',
                          '--background-focused': 'transparent',
                          '--border': 'none',
                          '--border-radius': '4px',
                          '--placeholder-opacity': '0.8',
                          '--padding-start': '0',
                          '--padding-end': '3px',
                          '--highlight-color-focused': 'transparent',
                          '--highlight-color-valid': 'transparent',
                          '--highlight-color-invalid': 'transparent',
                          '--padding-top': '0',
                          '--padding-bottom': '0',
                          '--opacity': '1',
                          opacity: 1,
                          'height': '50px',
                          'display': 'flex',
                          'alignItems': 'center',
                          'textAlign': 'right',
                          'maxWidth': '100%'
                        }}
                        interface="popover"
                        value={selectedSiteGroup}
                        onIonChange={(e) => {
                          setSelectedSiteGroup(e.detail.value);
                        }}
                      >
                        {siteGroups.length > 0 ? (
                          siteGroups.map((group) => (
                            <IonSelectOption key={group.id} value={group.name}>
                              {group.name}
                            </IonSelectOption>
                          ))
                        ) : (
                          <IonSelectOption value="default">Default Group</IonSelectOption>
                        )}
                      </IonSelect>
                    </div>
                  </div>
                </IonItem>
                )}

                {/* Unit Name Field */}
                <IonItem className={`${s.addUnitFormItem} ${formErrors.unitName ? s.addUnitFormItemError : ''}`}>
                  <IonLabel 
                    position="fixed" 
                    color={formErrors.unitName ? "danger" : "light"}
                    style={{ 
                      minWidth: '80px',
                      alignSelf: 'center',
                      color: formErrors.unitName ? 'var(--ion-color-danger) !important' : 'var(--ion-color-light)',
                      '--color': formErrors.unitName ? 'var(--ion-color-danger) !important' : 'var(--ion-color-light)'
                    }}
                    className={formErrors.unitName ? 'error-label' : ''}
                  >
                    Unit Name
                  </IonLabel>
                  <IonInput 
                    type="text" 
                    value={unitName}
                    placeholder="Enter unit name"
                    style={{
                      '--placeholder-color': formErrors.unitName ? 'var(--ion-color-danger)' : '#999999',
                      '--color': formErrors.unitName ? 'var(--ion-color-danger)' : '#ffffff'
                    }}
                    onIonInput={(e) => {
                      setUnitName(e.detail.value!);
                      if (e.detail.value!.trim()) {
                        setFormErrors(prev => ({ ...prev, unitName: false }));
                      }
                    }}
                  />
                </IonItem>

                {/* Coordinates Fields */}
                <div className={s.coordinatesContainer}>
                  {/* Latitude Field */}
                  <IonItem className={`${s.addUnitFormItemGreen} ${formErrors.latitude ? s.coordinatesError : ''}`}>
                    <IonLabel position="fixed" color="light" style={{ minWidth: '80px' }}>Latitude</IonLabel>
                    <IonInput 
                      type="number" 
                      value={unitLatitude}
                      placeholder="Latitude"
                      style={{
                        '--placeholder-color': formErrors.latitude ? 'var(--ion-color-danger)' : '#999999',
                        '--color': formErrors.latitude ? 'var(--ion-color-danger)' : '#000000',
                        '--background': '#ffffff',
                        '--border': '1px solid #ccc',
                        '--padding-start': '8px',
                        '--border-radius': '4px',
                        '--opacity': '1'
                      }}
                      onIonInput={(e) => {
                        setUnitLatitude(e.detail.value!);
                        // Сбрасываем ошибку latitude как только начинаем вводить
                        if (e.detail.value) {
                          setFormErrors(prev => ({ ...prev, latitude: false }));
                        }
                      }}
                    />
                </IonItem>

                  {/* Longitude Field */}
                  <IonItem className={`${s.addUnitFormItemGreen} ${formErrors.longitude ? s.coordinatesError : ''}`}>
                    <IonLabel position="fixed" color="light" style={{ minWidth: '80px' }}>Longitude</IonLabel>
                    <IonInput 
                      type="number" 
                      value={unitLongitude}
                      placeholder="Longitude"
                      style={{
                        '--placeholder-color': formErrors.longitude ? 'var(--ion-color-danger)' : '#999999',
                        '--color': formErrors.longitude ? 'var(--ion-color-danger)' : '#000000',
                        '--background': '#ffffff',
                        '--border': '1px solid #ccc',
                        '--padding-start': '8px',
                        '--border-radius': '4px',
                        '--opacity': '1'
                      }}
                      onIonInput={(e) => {
                        setUnitLongitude(e.detail.value!);
                        // Сбрасываем ошибку longitude как только начинаем вводить
                        if (e.detail.value) {
                          setFormErrors(prev => ({ ...prev, longitude: false }));
                        }
                      }}
                    />
                  </IonItem>
                </div>

                {/* Sensor ID Field */}
                <IonItem className={`${s.addUnitFormItem} ${formErrors.sensor ? s.addUnitFormItemError : ''}`}>
                  <IonLabel position="fixed" color="light" style={{ minWidth: '80px', alignSelf: 'center' }}>SensorId</IonLabel>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                    <style dangerouslySetInnerHTML={{__html: `
                      #sensor-prefix-select::part(icon) {
                        color: ${formErrors.sensor ? 'var(--ion-color-danger)' : '#666666'} !important;
                        opacity: 1 !important;
                      }
                      #sensor-prefix-select::part(placeholder) {
                        color: ${formErrors.sensor ? 'var(--ion-color-danger)' : '#999999'} !important;
                        opacity: 1 !important;
                      }
                      #sensor-prefix-select::part(text) {
                        color: ${formErrors.sensor ? 'var(--ion-color-danger)' : '#666666'} !important;
                        opacity: 1 !important;
                      }
                    `}} />
                    <IonSelect 
                      id="sensor-prefix-select"
                      value={sensorPrefix} 
                      placeholder="prefix"
                      style={{ 
                        minWidth: '100px', 
                        maxWidth: '120px', 
                        '--placeholder-color': formErrors.sensor ? 'var(--ion-color-danger)' : '#999999',
                        '--color': formErrors.sensor ? 'var(--ion-color-danger)' : '#666666',
                        '--background': 'transparent',
                        '--border-color': 'transparent',
                        '--highlight-color-focused': 'transparent',
                        '--highlight-color-valid': 'transparent',
                        '--highlight-color-invalid': 'transparent',
                        opacity: 1,
                        '--placeholder-opacity': formErrors.sensor ? '1' : '1'
                      }}
                      interface="popover"
                      className={formErrors.sensor ? 'select-error' : ''}
                      onIonChange={(e) => {
                        setSensorPrefix(e.detail.value);
                        // Сбрасываем ошибку если sensorId заполнен (prefix необязателен)
                        if (sensorId.trim()) {
                          setFormErrors(prev => ({ ...prev, sensor: false }));
                        }
                      }}
                    >
                      <IonSelectOption value="">Select prefix</IonSelectOption>
                      <IonSelectOption value="VSM">VSM</IonSelectOption>
                      <IonSelectOption value="ANM">ANM</IonSelectOption>
                      <IonSelectOption value="TSG">TSG</IonSelectOption>
                    </IonSelect>
                    <div style={{ display: 'flex', alignItems: 'center', flex: 1, gap: '8px' }}>
                      <IonInput
                        type="text"
                        style={{
                          flex: 1,
                          '--placeholder-color': formErrors.sensor ? 'var(--ion-color-danger)' : (sensorId ? '#ffffff' : '#999999'),
                          '--color': formErrors.sensor ? 'var(--ion-color-danger)' : '#ffffff',
                          '--border-color': 'transparent',
                          '--highlight-color-focused': 'transparent',
                          '--background': 'transparent',
                          '--padding-start': '0',
                          '--padding-end': '0',
                          opacity: 1
                        }}
                        placeholder="sensor ID"
                        value={sensorId}
                        onIonInput={(e) => {
                          setSensorId(e.detail.value!);
                          // Сбрасываем ошибку если заполнен (prefix необязателен)
                          if (e.detail.value!.trim()) {
                            setFormErrors(prev => ({ ...prev, sensor: false }));
                          }
                        }}
                      />
                    </div>
                  </div>
                </IonItem>

                {/* Layer Field */}
                <IonItem 
                  className={`${s.addUnitFormItem} ${formErrors.layer || moistLevelError ? s.addUnitFormItemError : ''}`}
                  style={{
                    '--background': 'transparent',
                    '--background-hover': 'transparent',
                    '--background-activated': 'transparent',
                    '--background-focused': 'transparent',
                    '--border-radius': '8px',
                    '--padding-start': '0 !important',
                    '--padding-end': '0 !important',
                    '--padding-top': '0',
                    '--padding-bottom': '0',
                    '--inner-padding-start': '0 !important',
                    '--transition': 'all 0.3s ease',
                    '--border': formErrors.layer ? '1px solid var(--ion-color-danger)' : '1px solid #666666',
                    '--highlight-color-invalid': 'transparent',
                    '--highlight-color-valid': 'transparent',
                    '--highlight-color-focused': 'transparent',
                    '--color': formErrors.layer ? 'var(--ion-color-danger)' : 'inherit',
                    '--ripple-color': 'transparent',
                    '--inner-padding-top': '0',
                    '--inner-padding-bottom': '0',
                    '--inner-border-width': '0',
                    '--inner-padding-end': '0 !important',
                    'display': 'flex',
                    'flex-direction': 'column',
                    'align-items': 'stretch',
                    'margin': '0',
                  }}
                >
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    width: '100%',
                    padding: '0',
                    margin: '0'
                  }}>
                    <IonLabel 
                      style={{ 
                        color: formErrors.layer ? 'var(--ion-color-danger)' : '#666666',
                        opacity: formErrors.layer ? '1' : '0.8',
                        margin: '0',
                        padding: '0'
                      }}
                    >
                      Layer
                    </IonLabel>
                    <div style={{ 
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      paddingRight: '0'
                    }}>
                      <style dangerouslySetInnerHTML={{__html: `
                        #layer-select-error::part(placeholder) {
                          color: ${formErrors.layer ? 'var(--ion-color-danger)' : '#666666'} !important;
                          opacity: 1 !important;
                        }
                        #layer-select-error::part(text) {
                          color: ${formErrors.layer ? 'var(--ion-color-danger)' : '#666666'} !important;
                          opacity: ${formErrors.layer ? '1' : '0.8'} !important;
                        }
                        #layer-select-error::part(icon) {
                          color: ${formErrors.layer ? 'var(--ion-color-danger)' : '#666666'} !important;
                          opacity: ${formErrors.layer ? '1' : '0.8'} !important;
                        }
                      `}} />
                      <IonSelect 
                        id="layer-select-error"
                        placeholder="Layer"
                        style={{ 
                          width: 'auto',
                          '--placeholder-color': formErrors.layer ? 'var(--ion-color-danger)' : '#666666',
                          '--color': formErrors.layer ? 'var(--ion-color-danger)' : '#666666',
                          '--background': 'transparent',
                          '--background-hover': 'transparent',
                          '--background-focused': 'transparent',
                          '--border': 'none',
                          '--border-radius': '4px',
                          '--placeholder-opacity': formErrors.layer ? '1' : '0.8',
                          '--padding-start': '0',
                          '--padding-end': '3px',
                          '--highlight-color-focused': 'transparent',
                          '--highlight-color-valid': 'transparent',
                          '--highlight-color-invalid': 'transparent',
                          '--padding-top': '0',
                          '--padding-bottom': '0',
                          '--opacity': '1',
                          opacity: 1,
                          'height': '50px',
                          'display': 'flex',
                          'alignItems': 'center',
                          'textAlign': 'right',
                          'maxWidth': '100%'
                        }}
                        className={formErrors.layer ? 'select-error ion-invalid ion-touched' : ''}
                        interface="popover"
                        value={selectedLayer}
                        onIonChange={(e) => {
                          const selectedLayerValue = e.detail.value;
                          
                          // Выводим mapping для выбранного слоя
                          if (selectedLayerValue && layerMapping[selectedLayerValue]) {
                          }
                          
                          setSelectedLayer(selectedLayerValue);
                          if (selectedLayerValue && formErrors.layer) {
                            setFormErrors(prev => ({ ...prev, layer: false }));
                          }
                        }}
                      >
                        {isLoadingLayers ? (
                          <IonSelectOption value="" disabled>Loading layers...</IonSelectOption>
                        ) : layers.length > 0 ? (
                          layers.map((layer) => (
                            <IonSelectOption key={layer.id} value={layer.value || layer.id}>
                              {layer.name || `Layer ${layer.id}`}
                            </IonSelectOption>
                          ))
                        ) : (
                          <>
                            <IonSelectOption value="Moist">Moist</IonSelectOption>
                            <IonSelectOption value="Temp">Temp</IonSelectOption>
                            <IonSelectOption value="Wxet">Wxet</IonSelectOption>
                            <IonSelectOption value="Valve">Valve</IonSelectOption>
                            <IonSelectOption value="Extl">Extl</IonSelectOption>
                          </>
                        )}
                      </IonSelect>
                    </div>
                  </div>
                  {selectedLayer && layerMapping[selectedLayer] && (
                    <div
                      style={{
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        paddingTop: '8px'
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                        <img
                          src={`https://app.agrinet.us/marker-icons/${layerMapping[selectedLayer]}.png`}
                          alt={`${selectedLayer} layer icon`}
                          style={{ height: '70px', width: 'auto', marginBottom: '8px' }}
                          onError={(e) => {
                            const img = e.target as HTMLImageElement;
                            img.src = 'https://app.agrinet.us/marker-icons/default.png';
                          }}
                        />
                        {selectedLayer.toLowerCase() === 'moist' && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <IonInput
                              type="number"
                              min="1"
                              max="12"
                              step="1"
                              placeholder="Sensor count"
                              inputmode="numeric"
                              value={moistLevel}
                              onIonInput={(e) => {
                                const inputValue = (e.target as HTMLIonInputElement).value;
                                // Если инпут пустой, не показываем ошибку
                                if (!inputValue || inputValue === '') {
                                  setMoistLevel(undefined);
                                  setMoistLevelError(false);
                                  return;
                                }
                                const v = Number(inputValue);
                                if (Number.isNaN(v)) {
                                  setMoistLevelError(false);
                                  return;
                                }
                                setMoistLevel(v);
                                if (v < 1 || v > 12) {
                                  setMoistLevelError(true);
                                } else {
                                  setMoistLevelError(false);
                                }
                              }}
                              style={{ 
                                width: '150px', 
                                textAlign: 'left',
                                '--padding-start': '0px',
                                '--padding-end': '0px'
                              } as React.CSSProperties}
                            />
                            {moistLevelError && (
                              <div style={{ 
                                color: 'var(--ion-color-danger)', 
                                fontSize: '14px',
                                marginTop: '4px'
                              }}>
                                Input sensor count from 1 to 12
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </IonItem>

                {/* Request Hardware Field */}
                <IonItem className={s.addUnitFormItem}>
                  <IonLabel position="fixed" color="light" style={{ minWidth: '80px', alignSelf: 'center' }}>Request Hardware</IonLabel>
                  <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                    <IonCheckbox 
                      style={{ marginRight: '8px' }} 
                      checked={requestHardware}
                      onIonChange={(e) => setRequestHardware(e.detail.checked)}
                    />
                    <IonIcon 
                      icon={informationCircle} 
                      color="primary" 
                      style={{ 
                        fontSize: '20px', 
                        cursor: 'pointer',
                        zIndex: 10000,
                        position: 'relative'
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        showPurchaseRequestAlert();
                      }}
                    />
                  </div>
                </IonItem>

                {/* ADD UNIT Button */}
                <IonButton 
                    expand="block"
                    fill="solid"
                    disabled={localStorage.getItem('userRole') === 'User'}
                    title={localStorage.getItem('userRole') === 'User' ? 'This action is not available for your user role' : ''}
                    onClick={async () => {
                      const userRole = localStorage.getItem('userRole');
                      console.log('ADD UNIT button clicked. User role:', userRole || 'No role found');
                      
                      // Check if user is in Demo mode
                      if (userRole === 'Demo') {
                        presentAlert({
                          header: 'Demo Mode',
                          message: 'This action is not available in demo mode.\nPlease create a free account to use this feature.',
                          buttons: ['OK']
                        });
                        return;
                      }
                      
                      // Если Site не выбран, открываем окно создания нового сайта
                      if (!selectedSite) {
                        showCreateNewSiteAlert();
                        return;
                      }
                      
                      // Validate form data (sensorPrefix может быть пустым!)
                      const hasErrors = {
                        site: !selectedSite,
                        siteGroup: false, // Site group is optional
                        unitName: !unitName.trim(),
                        latitude: !unitLatitude,
                        longitude: !unitLongitude,
                        sensor: !sensorId.trim(), // Только проверяем что sensorId не пустой
                        layer: !selectedLayer
                      };
                      
                      setFormErrors(hasErrors);
                      
                      // Check if there are any errors
                      if (Object.values(hasErrors).some(error => error)) {
                        return;
                      }

                      const fullSensorId = `${sensorPrefix}${sensorId}`;

                      // Функция для создания юнита
                      const createUnit = () => {
                        const unitData = {
                          site: selectedSite,
                          siteGroup: selectedSiteGroup,
                          name: unitName,
                          latitude: parseFloat(unitLatitude),
                          longitude: parseFloat(unitLongitude),
                          sensorId: fullSensorId,
                          layer: selectedLayer,
                          requestHardware: requestHardware
                        };

                        // TODO: Implement API call to add unit
                      };

                      // Функция проверки дубликатов и создания юнита
                      const checkDuplicatesAndCreate = async (skipDuplicateCheck: boolean = false) => {
                        console.log('checkDuplicatesAndCreate called with skipDuplicateCheck:', skipDuplicateCheck);
                        
                        if (!skipDuplicateCheck) {
                          console.log('Starting duplicate check for:', fullSensorId);
                          const duplicateCheck = await checkSensorIdExists(fullSensorId);
                          console.log('Duplicate check result:', duplicateCheck);
                          
                          if (duplicateCheck.exists) {
                            console.log('Duplicate found! Showing alert...');
                            
                            let message = "This sensor ID already exist, continue anyway?";
                            
                            if (duplicateCheck.layers.length === 1) {
                              message = `This sensor ID already exist in the ${duplicateCheck.layers[0]} layer`;
                            } else if (duplicateCheck.layers.length > 1) {
                              message = `This sensor ID already exist in the ${duplicateCheck.layers.join(', ')} layers`;
                            }
                            
                            console.log('Alert message:', message);
                            
                            presentAlert({
                              header: 'Warning',
                              message: message,
                              cssClass: 'sensor-id-duplicate-alert',
                              buttons: [
                                {
                                  text: 'Continue',
                                  cssClass: 'alert-button-confirm',
                                  handler: () => {
                                    createUnit();
                                  }
                                },
                                {
                                  text: 'Cancel',
                                  role: 'cancel',
                                  cssClass: 'alert-button-cancel'
                                }
                              ]
                            });
                            return;
                          } else {
                            console.log('No duplicate found, proceeding to create unit');
                          }
                        }
                        
                        // Нет дубликатов или проверка пропущена - создаем юнит
                        createUnit();
                      };

                      // Валидация формата SensorId
                      console.log('Validating sensor ID format:', fullSensorId);
                      const validation = validateSensorId(fullSensorId);
                      console.log('Format validation result:', validation);
                      
                      if (!validation.isValid) {
                        console.log('Format is invalid, showing validation alert');
                        
                        // Показываем предупреждение с возможностью продолжить
                        presentAlert({
                          header: 'Sensor ID Validation Warning',
                          message: validation.message,
                          cssClass: 'sensor-id-validation-alert',
                          buttons: [
                            {
                              text: 'ACCEPT ANYWAY',
                              cssClass: 'alert-button-confirm',
                              handler: () => {
                                console.log('User accepted invalid format, checking duplicates...');
                                // Формат невалиден, но пользователь хочет продолжить
                                // Проверяем дубликаты
                                checkDuplicatesAndCreate();
                              }
                            },
                            {
                              text: 'CANCEL SAVING',
                              role: 'cancel',
                              cssClass: 'alert-button-cancel'
                            }
                          ]
                        });
                      } else {
                        console.log('Format is valid, checking duplicates...');
                        // Формат валиден - проверяем дубликаты
                        await checkDuplicatesAndCreate();
                      }
                    }}
                  >
                    <IonIcon icon={add} slot="start" />
                    ADD UNIT
                  </IonButton>
                </div>
              </div>
              </div>
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <IonPage>
      <Header
        setPage={props.setPage}
        setIsMarkerClicked={setIsMarkerClicked}
        isMarkerClicked={isMarkerClicked}
        reloadMapPage={props.reloadMapPage}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        navigationHistory={navigationHistory}
        setNavigationHistory={setNavigationHistory}
      />
      <IonContent className={s.ionContent} style={{ '--background': 'white' }}>
        <div style={{display: 'flex', flexDirection: 'column', height: '100%'}}>
          <div className={activeTab === 'map' ? undefined : (activeTab === 'add' ? undefined : s.contentWrapper)}
               style={{flex: 1, marginBottom: '48px'}}>
            {renderContent()}
          </div>
          <IonSegment value={activeTab} className={s.appMenu}>
            <IonSegmentButton className={s.appMenuButton} value="map" onClick={() => {
              setNavigationHistory(prev => [...prev, 'map']);
              setActiveTab('map')
            }}>
              <IonIcon icon={home}/>
            </IonSegmentButton>
            <IonSegmentButton className={s.appMenuButton} value="comments" onClick={() => {
              setNavigationHistory(prev => [...prev, 'comments']);
              setActiveTab('comments')
            }}>
              <IonIcon icon={documentText}/>
            </IonSegmentButton>
            <IonSegmentButton className={s.appMenuButton} value="budget" onClick={() => {
              setNavigationHistory(prev => [...prev, 'budget']);
              setActiveTab('budget')
            }}>
              <IonIcon icon={settings}/>
            </IonSegmentButton>
            <IonSegmentButton className={s.appMenuButton} value="add" onClick={() => {
              setNavigationHistory(prev => [...prev, 'add']);
              setActiveTab('add')
            }}>
              <IonIcon icon={add}/>
            </IonSegmentButton>
          </IonSegment>
        </div>

        <SensorSelector
          isOpen={isSensorModalOpen}
          onClose={handleCloseSensorModal}
          onConfirm={handleSensorSelect}
          selectedSensor={selectedSensor}
          sensors={availableSensors}
        />
        
        <QRScanner 
          isOpen={isQRScannerOpen}
          onClose={() => setIsQRScannerOpen(false)}
          onScan={(data) => {
            setScannedQRData(data);
            setIsQRScannerOpen(false);
            
            // Show the scanned data in an alert
            presentAlert({
              header: 'QR Code Scanned',
              message: `Scanned data: ${data}`,
              buttons: ['OK']
            });
          }}
        />
      </IonContent>
    </IonPage>
  )
}

export default MapPage; 
