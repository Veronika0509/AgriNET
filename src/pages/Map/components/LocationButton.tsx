import React, { useEffect, useState } from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import { locateOutline, alertCircleOutline, closeOutline } from 'ionicons/icons';
import { isMobileOrTouchDevice } from '../hooks/useUserLocation';
import s from '../style.module.css';

const AUTO_DISMISS_MS = 6000;

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
  const shouldShowButton = isMobileOrTouchDevice();

  // Re-show the bubble whenever a new error comes in, and auto-dismiss it after a while
  // so it doesn't sit on top of the map forever if the user just ignores it.
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    if (!locationError) return;
    setDismissed(false);
    const timeout = setTimeout(() => setDismissed(true), AUTO_DISMISS_MS);
    return () => clearTimeout(timeout);
  }, [locationError]);

  // Only show on mobile devices
  if (!shouldShowButton) {
    return null;
  }

  const showError = !!locationError && !dismissed;

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
      {showError && (
        <div className={s.locationError} role="alert">
          <IonIcon icon={alertCircleOutline} className={s.locationErrorIcon} />
          <span className={s.locationErrorText}>{locationError}</span>
          <button
            type="button"
            className={s.locationErrorClose}
            aria-label="Dismiss"
            onClick={(event) => {
              event.stopPropagation();
              setDismissed(true);
            }}
          >
            <IonIcon icon={closeOutline} />
          </button>
        </div>
      )}
    </div>
  );
};

export default LocationButton;
