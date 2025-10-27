import React, { useEffect, useState } from 'react';
import { IonButton, IonContent, IonHeader, IonIcon, IonModal, IonTitle, IonToolbar } from '@ionic/react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { close } from 'ionicons/icons';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [scanActive, setScanActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      startScan();
    } else {
      stopScan();
    }

    return () => {
      stopScan();
    };
  }, [isOpen]);

  const checkPermission = async () => {
    try {
      const status = await BarcodeScanner.checkPermission({ force: true });
      setHasPermission(status.granted);
      return status.granted;
    } catch (error) {
      console.error('Error checking camera permission:', error);
      setHasPermission(false);
      return false;
    }
  };

  const startScan = async () => {
    try {
      const permissionGranted = await checkPermission();
      
      if (!permissionGranted) {
        console.log('Camera permission not granted');
        onClose();
        return;
      }

      // Make background transparent
      document.querySelector('body')?.classList.add('scanner-active');
      document.querySelector('ion-content')?.classList.add('scanner-active');
      document.querySelector('ion-app')?.classList.add('scanner-active');
      
      setScanActive(true);
      
      // Start scanning
      const result = await BarcodeScanner.startScan();
      
      if (result.hasContent) {
        onScan(result.content);
      }
      
      stopScan();
      onClose();
    } catch (error) {
      console.error('Error starting QR scan:', error);
      stopScan();
      onClose();
    }
  };

  const stopScan = () => {
    try {
      BarcodeScanner.stopScan();
      document.querySelector('body')?.classList.remove('scanner-active');
      document.querySelector('ion-content')?.classList.remove('scanner-active');
      document.querySelector('ion-app')?.classList.remove('scanner-active');
      setScanActive(false);
    } catch (error) {
      console.error('Error stopping QR scan:', error);
    }
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="qr-scanner-modal">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Scan QR Code</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => {
            stopScan();
            onClose();
          }}>
            <IonIcon icon={close} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className={scanActive ? 'scanner-active' : ''}>
        {!hasPermission && (
          <div className="scanner-message">
            <p>Camera permission is required to scan QR codes.</p>
            <IonButton onClick={checkPermission}>Grant Permission</IonButton>
          </div>
        )}
        {hasPermission && scanActive && (
          <div className="scanner-message">
            <p>Position the QR code within the frame to scan.</p>
          </div>
        )}
      </IonContent>
    </IonModal>
  );
};

export default QRScanner;
