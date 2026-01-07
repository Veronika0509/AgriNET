import React, { useEffect, useState, useRef } from 'react';
import { isPlatform, IonButton } from '@ionic/react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Html5Qrcode } from 'html5-qrcode';
import './QRCodeScanner.css';

interface QRCodeScannerProps {
  onScanSuccess: (decodedText: string) => void;
  onScanError?: (error: string) => void;
  onScanCancel?: () => void;
  autoStart?: boolean;
}

const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError = () => {},
  onScanCancel = () => {},
  autoStart = false
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [shouldStartScan, setShouldStartScan] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'html5-qrcode-scanner';

  const isMobile = isPlatform('ios') || isPlatform('android');

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (html5QrCodeRef.current) {
        try {
          const scannerState = html5QrCodeRef.current.getState();
          if (scannerState === 2) { // 2 = SCANNING state
            html5QrCodeRef.current.stop().catch(error => {
              console.error('Error stopping html5QrCode scanner:', error);
            });
          }
          html5QrCodeRef.current.clear();
        } catch (error) {
          console.error('Error cleaning up scanner:', error);
        }
      }
      if (isMobile) {
        BarcodeScanner.showBackground();
        BarcodeScanner.stopScan();
        document.body.classList.remove('scanner-active');
        document.querySelector('ion-app')?.classList.remove('scanner-active');
        document.querySelector('ion-content')?.classList.remove('scanner-active');
        document.querySelector('ion-modal')?.classList.remove('scanner-active');
        document.querySelector('ion-header')?.classList.remove('scanner-active');
      }
    };
  }, [isMobile]);

  // Start scanning when shouldStartScan becomes true
  useEffect(() => {
    const initiateScan = async () => {
      if (isMobile) {
        await startNativeScan();
      } else {
        await startWebScan();
      }
    };

    if (shouldStartScan && isScanning) {
      initiateScan();
      setShouldStartScan(false);
    }
  }, [shouldStartScan, isScanning, isMobile]);

  // Auto-start scanning when autoStart is true
  useEffect(() => {
    if (autoStart && !isScanning) {
      startScan();
    }
  }, [autoStart]);

  const checkPermissions = async () => {
    if (isMobile) {
      try {
        const status = await BarcodeScanner.checkPermission({ force: false });
        if (status.granted) {
          return true;
        }

        // If not granted, request permission
        const requestResult = await BarcodeScanner.checkPermission({ force: true });
        if (requestResult.granted) {
          return true;
        }

        // Permission denied
        onScanError('Camera permission is required to scan QR codes. Please enable camera permission in your device settings.');
        return false;
      } catch (error) {
        console.error('Error checking camera permissions:', error);
        onScanError('Failed to check camera permissions');
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
      document.querySelector('ion-app')?.classList.add('scanner-active');
      document.querySelector('ion-content')?.classList.add('scanner-active');
      document.querySelector('ion-modal')?.classList.add('scanner-active');
      document.querySelector('ion-header')?.classList.add('scanner-active');

      // Wait for modal to be fully rendered with transparent background
      await new Promise(resolve => setTimeout(resolve, 100));

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
    document.querySelector('ion-app')?.classList.remove('scanner-active');
    document.querySelector('ion-content')?.classList.remove('scanner-active');
    document.querySelector('ion-modal')?.classList.remove('scanner-active');
    document.querySelector('ion-header')?.classList.remove('scanner-active');
    setIsScanning(false);
  };

  const startWebScan = async () => {
    try {
      // Wait for the DOM element to be available
      await new Promise(resolve => setTimeout(resolve, 100));

      // Check if element exists
      const element = document.getElementById(scannerContainerId);
      if (!element) {
        throw new Error('Scanner container not found in DOM');
      }

      // Always create a fresh instance
      if (html5QrCodeRef.current) {
        try {
          const scannerState = html5QrCodeRef.current.getState();
          if (scannerState === 2) {
            await html5QrCodeRef.current.stop();
          }
          html5QrCodeRef.current.clear();
        } catch (e) {
          // Scanner cleanup
        }
      }

      html5QrCodeRef.current = new Html5Qrcode(scannerContainerId);

      await html5QrCodeRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          // Successfully scanned - stop scanner and call callback
          stopWebScan().then(() => {
            onScanSuccess(decodedText);
          });
        },
        (_errorMessage) => {
          // This is just a failure to decode, not a critical error
          // Silent - no need to log decode attempts
        }
      );
    } catch (error) {
      console.error('Error starting web scanner:', error);
      let userMessage = 'Failed to start camera scanner.';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          userMessage = 'Camera permission denied. Please allow camera access in your browser settings and try again.';
        } else if (error.name === 'NotFoundError') {
          userMessage = 'No camera found on this device.';
        } else if (error.name === 'NotReadableError') {
          userMessage = 'Camera is already in use by another application.';
        } else {
          userMessage = error.message;
        }
      }

      setErrorMessage(userMessage);
      onScanError(userMessage);
      setIsScanning(false);
    }
  };

  const stopWebScan = async () => {
    if (html5QrCodeRef.current) {
      try {
        const scannerState = html5QrCodeRef.current.getState();
        // Only stop if scanner is actually running
        if (scannerState === 2) { // 2 = SCANNING state
          await html5QrCodeRef.current.stop();
        }
        // Clear the scanner instance
        html5QrCodeRef.current.clear();
        html5QrCodeRef.current = null;
      } catch (error) {
        console.error('Error stopping web scanner:', error);
        // Force clear even on error
        try {
          html5QrCodeRef.current?.clear();
        } catch (clearError) {
          console.error('Error clearing scanner:', clearError);
        }
        html5QrCodeRef.current = null;
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
    setShouldStartScan(true);
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
      {errorMessage && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fee',
          color: '#c00',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          {errorMessage}
        </div>
      )}
      {!isScanning ? (
        <>
          {!autoStart && (
            <IonButton onClick={startScan}>
              Scan QR Code
            </IonButton>
          )}
          {autoStart && !errorMessage && <div>Initializing scanner...</div>}
        </>
      ) : (
        <>
          {!isMobile && (
            <div id={scannerContainerId} style={{ width: '100%', maxWidth: '500px', margin: '0 auto', paddingTop: '16px' }}></div>
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
