import React, { useEffect, useState, useRef } from 'react';
import { isPlatform, IonButton, IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Html5Qrcode } from 'html5-qrcode';
import './QRCodeScanner.css';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onScanCancel?: () => void;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({ 
  onScanSuccess, 
  onScanError = () => {}, 
  onScanCancel = () => {} 
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'html5-qrcode-scanner';

  const isMobile = isPlatform('ios') || isPlatform('android');

  useEffect(() => {
    // Cleanup function
    return () => {
      if (isMobile) {
        stopNativeScan();
      } else if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(error => {
          console.error('Error stopping html5QrCode scanner:', error);
        });
      }
    };
  }, []);

  const checkPermissions = async () => {
    if (isMobile) {
      try {
        const status = await BarcodeScanner.checkPermission({ force: false });
        if (status.granted) {
          setIsPermissionGranted(true);
          return true;
        } else if (status.denied) {
          const askAgain = await BarcodeScanner.checkPermission({ force: true });
          if (askAgain.granted) {
            setIsPermissionGranted(true);
            return true;
          } else {
            setIsPermissionGranted(false);
            return false;
          }
        }
        return false;
      } catch (error) {
        console.error('Error checking camera permissions:', error);
        return false;
      }
    } else {
      // For web, we'll check permissions when starting the scanner
      return true;
    }
  };

  const startNativeScan = async () => {
    try {
      // Make background transparent
      document.body.classList.add('scanner-active');
      document.querySelector('ion-content')?.classList.add('scanner-active');
      
      // Start scanning
      await BarcodeScanner.hideBackground();
      const result = await BarcodeScanner.startScan();
      
      if (result.hasContent) {
        onScanSuccess(result.content);
      }
    } catch (error) {
      console.error('Error during native scan:', error);
      onScanError(error instanceof Error ? error.message : String(error));
    } finally {
      stopNativeScan();
    }
  };

  const stopNativeScan = () => {
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
    document.body.classList.remove('scanner-active');
    document.querySelector('ion-content')?.classList.remove('scanner-active');
    setIsScanning(false);
  };

  const startWebScan = async () => {
    try {
      if (!html5QrCodeRef.current) {
        html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);
      }

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          onScanSuccess(decodedText);
          if (html5QrCodeRef.current) {
            html5QrCodeRef.current.stop().catch(console.error);
            setIsScanning(false);
          }
        },
        (errorMessage) => {
          // This is just a failure to decode, not a critical error
          console.log('QR code scan error:', errorMessage);
        }
      );
    } catch (error) {
      console.error('Error starting web scanner:', error);
      onScanError(error instanceof Error ? error.message : String(error));
      setIsScanning(false);
    }
  };

  const stopWebScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop();
      } catch (error) {
        console.error('Error stopping web scanner:', error);
      }
    }
    setIsScanning(false);
  };

  const startScan = async () => {
    const hasPermission = await checkPermissions();
    if (!hasPermission) {
      onScanError('Camera permission denied');
      return;
    }

    setIsScanning(true);
    
    if (isMobile) {
      startNativeScan();
    } else {
      startWebScan();
    }
  };

  const stopScan = () => {
    if (isMobile) {
      stopNativeScan();
    } else {
      stopWebScan();
    }
    onScanCancel();
  };

  return (
    <div className="qr-scanner-container">
      {!isScanning ? (
        <IonButton onClick={startScan}>
          Scan QR Code
        </IonButton>
      ) : (
        <>
          {!isMobile && (
            <div id={scannerContainerId} style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
          )}
          <IonButton onClick={stopScan} color="danger">
            Cancel Scan
          </IonButton>
        </>
      )}
    </div>
  );
};

export default QRCodeScanner;
