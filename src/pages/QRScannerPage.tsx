import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonButton,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import QRCodeScanner from '../components/QRCodeScanner';

const QRScannerPage: React.FC = () => {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

  const handleScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    setScanError(null);
  };

  const handleScanError = (error: string) => {
    setScanError(error);
    setScanResult(null);
  };

  const handleScanCancel = () => {
    console.log('Scan was cancelled');
  };

  const clearResults = () => {
    setScanResult(null);
    setScanError(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>QR Code Scanner</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">QR Code Scanner</IonTitle>
          </IonToolbar>
        </IonHeader>
        
        <div className="ion-padding">
          <QRCodeScanner 
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
            onScanCancel={handleScanCancel}
          />
          
          {scanResult && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Scan Result</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>{scanResult}</p>
                <IonButton onClick={clearResults}>Clear</IonButton>
              </IonCardContent>
            </IonCard>
          )}
          
          {scanError && (
            <IonCard color="danger">
              <IonCardHeader>
                <IonCardTitle>Error</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>{scanError}</p>
                <IonButton onClick={clearResults}>Clear</IonButton>
              </IonCardContent>
            </IonCard>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default QRScannerPage;
