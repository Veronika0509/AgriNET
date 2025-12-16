import { useState, useEffect } from 'react';
import type { Site } from '../../../types';
import type { SiteGroup, FormErrors } from '../types';
import axios from "axios";

interface UseAddUnitFormProps {
  selectedSiteForAddUnit: string;
  siteList: Site[];
  activeTab: string;
  userId: any
}

export const useAddUnitForm = (props: UseAddUnitFormProps) => {
  // Unit details state
  const [unitName, setUnitName] = useState<string>('');
  const [unitLatitude, setUnitLatitude] = useState<string>('');
  const [unitLongitude, setUnitLongitude] = useState<string>('');

  // Site selection state
  const [selectedSite, setSelectedSite] = useState<string>(props.selectedSiteForAddUnit || '');
  const [selectedSiteGroup, setSelectedSiteGroup] = useState<string>('');
  const [siteGroups, setSiteGroups] = useState<SiteGroup[]>([]);
  const [siteGroupError, setSiteGroupError] = useState<{ invalidGroup: string; correctGroups: string[] } | null>(null);

  // Sensor ID state
  const [sensorPrefix, setSensorPrefix] = useState<string>('');
  const [sensorId, setSensorId] = useState<string>('');

  // Layer selection state
  const [selectedLayer, setSelectedLayer] = useState<string>('');

  // Moisture sensor configuration state
  const [requestHardware, setRequestHardware] = useState<boolean>(false);
  const [moistLevel, setMoistLevel] = useState<number | undefined>(undefined);
  const [moistLevelError, setMoistLevelError] = useState<boolean>(false);

  // Form validation state
  const [formErrors, setFormErrors] = useState<FormErrors>({
    site: false,
    siteGroup: false,
    unitName: false,
    latitude: false,
    longitude: false,
    sensor: false,
    layer: false,
  });

  // Initialize coordinates when component mounts or props change
  useEffect(() => {
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
        setUnitLatitude(site.lat.toString());
        setUnitLongitude(site.lng.toString());
      }
    }
  }, [selectedSite, props.siteList]);

  // Fetch user site groups when navigating to Add Unit page
  useEffect(() => {
    if (props.activeTab === 'add') {
      axios.get('https://app.agrinet.us/api/add-unit/user-site-groups')
        .then((response) => {
          console.log(response)
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            return response.json();
          } else {
            return response.text().then((text) => text);
          }
        })
        .then((data) => {
          if (data && Array.isArray(data) && data.length > 0) {
            const formattedGroups = data.map((group, index) => ({
              id: index + 1,
              name: group,
            }));

            setSiteGroups(formattedGroups);

            // Automatically select the first site group
            if (formattedGroups.length > 0) {
              setSelectedSiteGroup(formattedGroups[0].name);
            }
          } else {
            setSiteGroups([]);
          }
        })
        .catch((error) => {
          console.error('Error fetching user site groups:', error);
          setSiteGroups([]);
        });
    }
  }, [props.activeTab]);

  // Sensor ID validation function
  const validateSensorId = (fullSensorId: string): { isValid: boolean; message?: string } => {
    // Check format: 2900 + exactly 5 digits
    if (/^2900\d{5}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // Check format: 24 + any 2 digits + exactly 5 digits (total 9 digits)
    if (/^24\d{7}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // Check format: TSG + exactly 5 digits
    if (/^TSG\d{5}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // Check format: ANM + exactly 5 digits
    if (/^ANM\d{5}$/.test(fullSensorId)) {
      return { isValid: true };
    }
    
    // If validation failed
    return { 
      isValid: false, 
      message: 'Sensor ID does not correspond mask: 2900XXXXX, 24XXXXXXX, TSGXXXXX or ANMXXXXX'
    };
  };

  // Get all existing sensor IDs from server
  const getAllSensorIds = async (): Promise<string[]> => {
    try {
      const response = await fetch('https://app.agrinet.us/api/utils/all-sensor-ids');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching sensor IDs:', error);
      return [];
    }
  };

  const resetForm = () => {
    setUnitName('');
    setUnitLatitude('');
    setUnitLongitude('');
    setSelectedSite('');
    setSensorPrefix('');
    setSensorId('');
    setSelectedLayer('');
    setRequestHardware(false);
    setMoistLevel(undefined);
    setMoistLevelError(false);
    setFormErrors({
      site: false,
      siteGroup: false,
      unitName: false,
      latitude: false,
      longitude: false,
      sensor: false,
      layer: false,
    });
  };

  return {
    // Unit details
    unitName,
    setUnitName,
    unitLatitude,
    setUnitLatitude,
    unitLongitude,
    setUnitLongitude,

    // Site selection
    selectedSite,
    setSelectedSite,
    selectedSiteGroup,
    setSelectedSiteGroup,
    siteGroups,
    setSiteGroups,
    siteGroupError,
    setSiteGroupError,

    // Sensor ID
    sensorPrefix,
    setSensorPrefix,
    sensorId,
    setSensorId,

    // Layer selection
    selectedLayer,
    setSelectedLayer,

    // Moisture sensor configuration
    requestHardware,
    setRequestHardware,
    moistLevel,
    setMoistLevel,
    moistLevelError,
    setMoistLevelError,

    // Form validation
    formErrors,
    setFormErrors,

    // Helper functions
    validateSensorId,
    getAllSensorIds,
    resetForm,
  };
};
