import React from "react"
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
} from "@ionic/react"

interface NewLayerModalProps {
  isOpen: boolean
  onClose: () => void
  onFinish: () => void
  newLayerName: string
  setNewLayerName: (name: string) => void
  newLayerMarkerType: string
  setNewLayerMarkerType: (type: string) => void
  newLayerTable: string
  setNewLayerTable: (table: string) => void
  newLayerColumn: string
  setNewLayerColumn: (column: string) => void
}

/**
 * Modal component for creating a new layer
 * Provides form inputs for layer name, marker type, table, and column configuration
 */
export const NewLayerModal: React.FC<NewLayerModalProps> = ({
  isOpen,
  onClose,
  onFinish,
  newLayerName,
  setNewLayerName,
  newLayerMarkerType,
  setNewLayerMarkerType,
  newLayerTable,
  setNewLayerTable,
  newLayerColumn,
  setNewLayerColumn,
}) => {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Create New Layer</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose}>Cancel</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonItem>
          <IonLabel position="stacked">Layer Name</IonLabel>
          <IonInput
            placeholder="Enter Layer Name"
            value={newLayerName}
            onIonInput={(e) => setNewLayerName(e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Marker Type</IonLabel>
          <IonSelect value={newLayerMarkerType} onIonChange={(e) => setNewLayerMarkerType(e.detail.value)}>
            <IonSelectOption value="fuel">Fuel marker</IonSelectOption>
            <IonSelectOption value="srs-green-fuel">SRS Green Fuel</IonSelectOption>
            <IonSelectOption value="srs-ref-fuel">SRS Reference Fuel</IonSelectOption>
            <IonSelectOption value="moist-fuel">Moisture Fuel</IonSelectOption>
            <IonSelectOption value="temp_rh">Temperature/Relative Humidity</IonSelectOption>
            <IonSelectOption value="temp-rh-v2">Temperature/RH Version 2</IonSelectOption>
            <IonSelectOption value="wxet">Weather Station ET</IonSelectOption>
            <IonSelectOption value="planthealth">Plant Health</IonSelectOption>
            <IonSelectOption value="soiltemp">Soil Temperature</IonSelectOption>
            <IonSelectOption value="psi">PSI (Pressure)</IonSelectOption>
            <IonSelectOption value="vfd">VFD (Variable Frequency Drive)</IonSelectOption>
            <IonSelectOption value="bflow">Budget/Flow</IonSelectOption>
            <IonSelectOption value="valve">Valve</IonSelectOption>
            <IonSelectOption value="graphic">Graphic</IonSelectOption>
            <IonSelectOption value="disease">Disease</IonSelectOption>
            <IonSelectOption value="pump">Pump</IonSelectOption>
            <IonSelectOption value="chemical">Chemical</IonSelectOption>
            <IonSelectOption value="infra-red">Infra-Red</IonSelectOption>
            <IonSelectOption value="neutron">Neutron</IonSelectOption>
            <IonSelectOption value="virtual-weather-station">Virtual Weather Station</IonSelectOption>
          </IonSelect>
        </IonItem>

        <div style={{ marginTop: "20px", marginBottom: "10px", fontWeight: "bold", color: "#666" }}>
          Data Source Configuration
        </div>

        <IonItem>
          <IonLabel position="stacked">Table</IonLabel>
          <IonInput placeholder="Table" value={newLayerTable} onIonInput={(e) => setNewLayerTable(e.detail.value!)} />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Column</IonLabel>
          <IonInput
            placeholder="Column"
            value={newLayerColumn}
            onIonInput={(e) => setNewLayerColumn(e.detail.value!)}
          />
        </IonItem>

        <IonButton expand="block" onClick={onFinish} style={{ marginTop: "20px" }}>
          Finish
        </IonButton>
      </IonContent>
    </IonModal>
  )
}