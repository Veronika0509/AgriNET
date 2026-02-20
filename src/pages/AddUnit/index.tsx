import React, { useState, useEffect } from 'react';
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  useIonToast,
} from '@ionic/react';
import { arrowBackOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { AddUnitContainer } from '../../features/AddUnit';
import { useLayers } from '../Map/hooks/useLayers';
import { useSiteManagement } from '../Map/hooks/useSiteManagement';
import { useLayerCreation } from '../Map/hooks/useLayerCreation';
import { getSiteList } from '../Map/data/getSiteList';
import type { UserId, Site } from '../../types';

interface AddUnitPageProps {
  userId: UserId;
  siteList: Site[];
  setSiteList: React.Dispatch<React.SetStateAction<Site[]>>;
  selectedSiteForAddUnit: string;
  setSelectedSiteForAddUnit: React.Dispatch<React.SetStateAction<string>>;
  setSelectedMoistureSensor: ((sensor: any) => void) | undefined;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  isGoogleApiLoaded: boolean;
}

const AddUnitPage: React.FC<AddUnitPageProps> = (props) => {
  const history = useHistory();
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [present] = useIonToast();

  // Use the same hooks as Map page
  const { layers, setLayers, layerMapping, setLayerMapping, isLoadingLayers } = useLayers();

  // Site management hook
  const { showCreateNewSiteAlert } = useSiteManagement({
    siteList: props.siteList,
    setSiteList: props.setSiteList,
    setSelectedSiteForAddUnit: props.setSelectedSiteForAddUnit,
  });

  // Layer creation hook
  const { showCreateNewLayerAlert } = useLayerCreation({
    layers,
    setLayers,
    setLayerMapping,
  });

  // Load site list if not already loaded
  useEffect(() => {
    const loadSites = async () => {
      if (props.siteList.length === 0 && props.userId) {
        const sites = await getSiteList(props.userId);

        // Check if API call failed
        if ("success" in sites && sites.success === false) {
          console.error("Failed to load sites:", sites.error);
          present({
            message: sites.error,
            duration: 5000,
            color: "danger",
            position: "top",
            buttons: ["Dismiss"],
          });
          props.setSiteList([]);
          return;
        }

        // API call successful
        props.setSiteList(sites.data);

        // Set first site as selected if no site is currently selected
        if (sites.data.length > 0 && !props.selectedSiteForAddUnit) {
          props.setSelectedSiteForAddUnit(sites.data[0].name);
        }
      }
    };

    loadSites();
  }, [props.userId, props.siteList.length]);

  // Set first site as selected when sites are already loaded but no site is selected
  useEffect(() => {
    if (props.siteList.length > 0 && !props.selectedSiteForAddUnit) {
      props.setSelectedSiteForAddUnit(props.siteList[0].name);
    }
  }, [props.siteList, props.selectedSiteForAddUnit]);

  const handleBack = () => {
    props.setPage(0);
    window.history.replaceState(null, '', '/AgriNET/menu');
  };

  const handleNavigateToMap = () => {
    props.setPage(1);
    history.push('/map');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Add Unit</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent style={{ "--background": "white" }}>
        <div style={{ height: "100%"}} >
          {React.createElement(AddUnitContainer as any, {
            userId: props.userId,
            siteList: props.siteList,
            setSiteList: props.setSiteList,
            selectedSiteForAddUnit: props.selectedSiteForAddUnit,
            setSelectedSiteForAddUnit: props.setSelectedSiteForAddUnit,
            setSelectedMoistureSensor: props.setSelectedMoistureSensor,
            setPage: props.setPage,
            isGoogleApiLoaded: props.isGoogleApiLoaded,
            activeTab: "add",
            setActiveTab: (tab: string) => {
              if (tab === "map") {
                handleNavigateToMap();
              }
            },
            setNavigationHistory: () => {},
            markers,
            setMarkers,
            layers: layers as any,
            setLayers: setLayers as any,
            layerMapping,
            setLayerMapping,
            isLoadingLayers,
            showCreateNewSiteAlert,
            showCreateNewLayerAlert
          })}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AddUnitPage;