import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { locateOutline } from 'ionicons/icons';
import s from '../style.module.css';



interface LocationButtonProps {
  onLocationClick: () => void;
  isLocationEnabled: boolean;
  locationError: string | null;
}

const LocationButton: React.FC<LocationButtonProps> = ({ 
  onLocationClick, 
  isLocationEnabled, 
  locationError 
}) => {
  // Mobile device detection for LocationButton visibility
  const userAgent = navigator.userAgent;
  const screenWidth = window.screen?.width || window.innerWidth;
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|Windows Phone|IEMobile|Opera Mini|Mobile|Tablet/i.test(userAgent);
  const isDesktop = /Windows NT|Macintosh|Linux/i.test(userAgent) && screenWidth > 1024;
  const shouldShowButton = isMobileUserAgent && !isDesktop;
  
  // Only show on mobile devices
  if (!shouldShowButton) {
    return null;
  }

  return (
    <div className={s.locationButtonContainer}>
      <IonButton
        fill="solid"
        shape="round"
        size="default"
        className={`${s.locationButton} ${isLocationEnabled ? s.locationButtonActive : ''}`}
        onClick={onLocationClick}
        title={locationError || (isLocationEnabled ? 'Center on your location' : 'Enable location')}
      >
        <IonIcon 
          icon={locateOutline} 
          className={s.locationIcon}
        />
      </IonButton>
      {locationError && (
        <div className={s.locationError}>
          {locationError}
        </div>
      )}
    </div>
  );
};

export default LocationButton;
