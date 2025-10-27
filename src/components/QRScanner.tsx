// This file has been deleted
import { IonPage, IonContent, IonButton } from '@ionic/react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Capacitor } from '@capacitor/core';
import { useRef, useState } from 'react';

const QRScanner = () => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  
  // Detect platform: true = iOS/Android, false = web browser
  const isNative = Capacitor.isNativePlatform();

  // ===== NATIVE SCANNER (iOS/Android) =====
  
  const scanNative = async () => {
    console.log('[v0] Starting native scan (iOS/Android)...');
    
    // Request camera permission
    const permission = await BarcodeScanner.checkPermission({ force: true });
    
    if (!permission.granted) {
      console.log('[v0] Camera permission denied');
      alert('Camera permission denied');
      return;
    }
    
    console.log('[v0] Camera permission granted');
    setIsScanning(true);
    
    // Make background transparent so camera is visible
    document.body.classList.add('scanner-active');
    
    // Start scanning
    const result = await BarcodeScanner.startScan();
    
    // Remove transparency
    document.body.classList.remove('scanner-active');
    setIsScanning(false);
    
    // Log result to console
    if (result.hasContent) {
      console.log('[v0] QR Code Data:', result.content);
    } else {
      console.log('[v0] No QR code detected');
    }
  };

  // ===== WEB SCANNER (Browser) =====
  
  const scanWeb = () => {
    console.log('[v0] Starting web scan (Browser)...');
    setIsScanning(true);
    
    // Create scanner instance
    scannerRef.current = new Html5QrcodeScanner(
      'qr-reader', // ID of HTML element where scanner appears
      { 
        fps: 10, // Frames per second
        qrbox: 250 // Size of scanning box
      },
      false // Verbose logging off
    );
    
    // Start scanning
    scannerRef.current.render(
      // Success callback - called when QR code is detected
      (decodedText) => {
        console.log('[v0] QR Code Data:', decodedText);
        
        // Stop scanner after successful scan
        if (scannerRef.current) {
          scannerRef.current.clear();
          scannerRef.current = null;
        }
        setIsScanning(false);
      },
      // Error callback - called continuously while scanning
      (error) => {
        // Don't log every frame error, too noisy
      }
    );
  };

  // ===== UNIFIED SCAN HANDLER =====
  
  const handleScan = () => {
    if (isNative) {
      // Running on iOS or Android
      scanNative();
    } else {
      // Running in web browser
      scanWeb();
    }
  };

  const handleStop = () => {
    if (!isNative && scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
    }
    setIsScanning(false);
  };

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <h1>QR Scanner</h1>
        <p>Platform: {isNative ? 'Native (iOS/Android)' : 'Web Browser'}</p>
        
        {!isScanning ? (
          <IonButton expand="block" onClick={handleScan}>
            Scan QR Code
          </IonButton>
        ) : (
          <IonButton expand="block" color="danger" onClick={handleStop}>
            Stop Scanning
          </IonButton>
        )}
        
        {/* Container for web scanner */}
        <div id="qr-reader"></div>
      </IonContent>
    </IonPage>
  );
};

export default QRScanner;
