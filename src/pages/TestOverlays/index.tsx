import React, { useEffect, useRef, useState } from 'react';
import { IonPage, IonContent, IonButton, IonHeader, IonToolbar, IonTitle } from '@ionic/react';

// Простая тестовая страница для проверки кастомных оверлеев
const TestOverlays: React.FC = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isGoogleApiLoaded, setIsGoogleApiLoaded] = useState(false);

  // Проверяем, загружен ли Google Maps API
  useEffect((): void | (() => void) => {
    const checkGoogleApi = () => {
      if (window.google && window.google.maps) {
        setIsGoogleApiLoaded(true);
        return true;
      }
      return false;
    };

    if (checkGoogleApi()) {
      return;
    }

    // Если API не загружен, ждем его загрузки
    const interval = setInterval(() => {
      if (checkGoogleApi()) {
        clearInterval(interval);
      }
    }, 100);

    return (): void => {
      clearInterval(interval);
    };
  }, []);

  // Инициализируем карту
  useEffect(() => {
    if (isGoogleApiLoaded && mapRef.current && !map) {
      const newMap = new google.maps.Map(mapRef.current, {
        center: { lat: 40.7128, lng: -74.0060 }, // Нью-Йорк
        zoom: 13,
      });
      setMap(newMap);
    }
  }, [isGoogleApiLoaded, map]);

  // Функция для тестирования простого оверлея
  const testSimpleOverlay = () => {
    if (!map || !isGoogleApiLoaded) {
      return;
    }

    // Создаем простой кастомный оверлей
    class SimpleTestOverlay extends google.maps.OverlayView {
      private bounds: google.maps.LatLngBounds;
      private div?: HTMLElement;

      constructor(bounds: google.maps.LatLngBounds) {
        super();
        this.bounds = bounds;
      }

      onAdd() {
        const div = document.createElement('div');
        div.style.borderStyle = 'none';
        div.style.borderWidth = '0px';
        div.style.position = 'absolute';
        div.style.backgroundColor = 'white';
        div.style.border = '2px solid #007cff';
        div.style.borderRadius = '8px';
        div.style.padding = '10px';
        div.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
        div.style.cursor = 'pointer';
        div.innerHTML = `
          <div style="font-family: Arial, sans-serif;">
            <h4 style="margin: 0 0 5px 0; color: #007cff;">Тестовый сенсор</h4>
            <p style="margin: 0; font-size: 12px;">Влажность: 25.5%</p>
            <p style="margin: 0; font-size: 12px;">Температура: 22.1°C</p>
            <p style="margin: 5px 0 0 0; font-size: 10px; color: #666;">
              Клик для перехода к графику
            </p>
          </div>
        `;

        div.addEventListener('click', () => {
          alert('Клик на кастомный оверлей работает!');
        });

        this.div = div;
        const panes = this.getPanes()!;
        panes.overlayLayer.appendChild(div);
      }

      draw() {
        const overlayProjection = this.getProjection();
        const sw = overlayProjection.fromLatLngToDivPixel(
          this.bounds.getSouthWest()
        )!;
        const ne = overlayProjection.fromLatLngToDivPixel(
          this.bounds.getNorthEast()
        )!;

        if (this.div) {
          this.div.style.left = sw.x + 'px';
          this.div.style.top = ne.y + 'px';
        }
      }

      onRemove() {
        if (this.div && this.div.parentNode) {
          this.div.parentNode.removeChild(this.div);
          delete this.div;
        }
      }
    }

    // Создаем границы для оверлея
    const bounds = new google.maps.LatLngBounds(
      new google.maps.LatLng(40.7128, -74.0060),
      new google.maps.LatLng(40.7138, -74.0050)
    );

    // Создаем и добавляем оверлей на карту
    const overlay = new SimpleTestOverlay(bounds);
    overlay.setMap(map);
  };

  // Функция для создания нескольких тестовых оверлеев
  const testMultipleOverlays = () => {
    if (!map || !isGoogleApiLoaded) {
      return;
    }

    const overlayData = [
      { lat: 40.7128, lng: -74.0060, type: 'Влажность', value: '25.5%', color: '#007cff' },
      { lat: 40.7148, lng: -74.0040, type: 'Температура', value: '22.1°C', color: '#ff6b35' },
      { lat: 40.7108, lng: -74.0080, type: 'Топливо', value: '78%', color: '#28a745' },
    ];

    overlayData.forEach((data, index) => {
      setTimeout(() => {
        class ColoredTestOverlay extends google.maps.OverlayView {
          private bounds: google.maps.LatLngBounds;
          private div?: HTMLElement;
          private data: typeof overlayData[0];

          constructor(bounds: google.maps.LatLngBounds, data: typeof overlayData[0]) {
            super();
            this.bounds = bounds;
            this.data = data;
          }

          onAdd() {
            const div = document.createElement('div');
            div.style.borderStyle = 'none';
            div.style.borderWidth = '0px';
            div.style.position = 'absolute';
            div.style.backgroundColor = 'white';
            div.style.border = `2px solid ${this.data.color}`;
            div.style.borderRadius = '8px';
            div.style.padding = '8px';
            div.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
            div.style.cursor = 'pointer';
            div.style.minWidth = '120px';
            div.innerHTML = `
              <div style="font-family: Arial, sans-serif; text-align: center;">
                <h5 style="margin: 0 0 3px 0; color: ${this.data.color};">${this.data.type}</h5>
                <p style="margin: 0; font-size: 14px; font-weight: bold;">${this.data.value}</p>
                <p style="margin: 3px 0 0 0; font-size: 9px; color: #666;">
                  ID: sensor-${index + 1}
                </p>
              </div>
            `;

            div.addEventListener('click', () => {
              alert(`Клик на ${this.data.type} сенсор!\nЗначение: ${this.data.value}`);
            });

            this.div = div;
            const panes = this.getPanes()!;
            panes.overlayLayer.appendChild(div);
          }

          draw() {
            const overlayProjection = this.getProjection();
            const sw = overlayProjection.fromLatLngToDivPixel(
              this.bounds.getSouthWest()
            )!;
            const ne = overlayProjection.fromLatLngToDivPixel(
              this.bounds.getNorthEast()
            )!;

            if (this.div) {
              this.div.style.left = sw.x + 'px';
              this.div.style.top = ne.y + 'px';
            }
          }

          onRemove() {
            if (this.div && this.div.parentNode) {
              this.div.parentNode.removeChild(this.div);
              delete this.div;
            }
          }
        }

        const bounds = new google.maps.LatLngBounds(
          new google.maps.LatLng(data.lat - 0.001, data.lng - 0.001),
          new google.maps.LatLng(data.lat + 0.001, data.lng + 0.001)
        );

        const overlay = new ColoredTestOverlay(bounds, data);
        overlay.setMap(map);
      }, index * 500); // Добавляем задержку для анимации
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Тест кастомных оверлеев</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <div style={{ padding: '10px' }}>
          <div style={{ marginBottom: '10px' }}>
            <IonButton 
              expand="block" 
              onClick={testSimpleOverlay}
              disabled={!map || !isGoogleApiLoaded}
            >
              Создать простой оверлей
            </IonButton>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <IonButton 
              expand="block" 
              color="secondary"
              onClick={testMultipleOverlays}
              disabled={!map || !isGoogleApiLoaded}
            >
              Создать несколько оверлеев
            </IonButton>
          </div>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '10px' }}>
            Статус: Google Maps API {isGoogleApiLoaded ? '✅ загружен' : '⏳ загружается'}, 
            Карта {map ? '✅ готова' : '⏳ инициализируется'}
          </div>
        </div>
        <div 
          ref={mapRef} 
          style={{ 
            width: '100%', 
            height: 'calc(100vh - 200px)',
            border: '1px solid #ccc'
          }} 
        />
      </IonContent>
    </IonPage>
  );
};

export default TestOverlays;
