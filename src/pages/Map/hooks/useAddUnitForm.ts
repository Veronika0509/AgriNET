import { useState, useEffect } from 'react';
import type { Site } from '../../../types';

interface UseAddUnitFormProps {
  selectedSiteForAddUnit: string;
  siteList: Site[];
}

export const useAddUnitForm = (props: UseAddUnitFormProps) => {
  const [unitName, setUnitName] = useState<string>('');
  const [unitLatitude, setUnitLatitude] = useState<string>('');
  const [unitLongitude, setUnitLongitude] = useState<string>('');
  const [selectedSite, setSelectedSite] = useState<string>(props.selectedSiteForAddUnit || '');
  const [sensorPrefix, setSensorPrefix] = useState<string>('');
  const [sensorId, setSensorId] = useState<string>('');

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
  };

  return {
    unitName,
    setUnitName,
    unitLatitude,
    setUnitLatitude,
    unitLongitude,
    setUnitLongitude,
    selectedSite,
    setSelectedSite,
    sensorPrefix,
    setSensorPrefix,
    sensorId,
    setSensorId,
    validateSensorId,
    getAllSensorIds,
    resetForm
  };
};
