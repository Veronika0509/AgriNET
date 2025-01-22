import s from "../style.module.css"
import Header from "../../../Header"
import {
  IonButton,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonDatetimeButton,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonModal,
  IonSelect,
  IonSelectOption,
  useIonAlert,
} from "@ionic/react"
import React, { useEffect, useRef, useState } from "react"
import { addOutline, removeOutline } from "ionicons/icons"
import { getDatetime } from "../../../DateTimePicker/functions/getDatetime"

export const Create = (props: any) => {
  const [isPulseIrrigation, setIsPulseIrrigation] = useState(false)
  const [pulseCount, setPulseCount] = useState(2)
  const [pulseOffMinutes, setPulseOffMinutes] = useState(60)
  const [duration, setDuration] = useState('06:00')
  const [startTime, setStartTime] = useState(new Date(new Date().getTime() + 2 * 60 * 1000))
  const [stopTime, setStopTime] = useState(() => {
    const [hours, minutes] = '06:00'.split(':').map(Number)
    return new Date(new Date(startTime).getTime() + (hours * 60 + minutes) * 60 * 1000)
  })
  const [presentAlert] = useIonAlert()
  const stopDatetimeRef = useRef<HTMLIonDatetimeElement>(null)

  const handlePulseCount = (change: number) => {
    const newValue = pulseCount + change
    if (newValue >= 2) {
      setPulseCount(newValue)
    }
  }

  useEffect(() => {
    const [hours, minutes] = duration.split(':').map(Number)
    const newStopTime = new Date(new Date(startTime).getTime() + (hours * 60 + minutes) * 60 * 1000)
    setStopTime(newStopTime)
  }, [startTime, duration])

  const onStopTimeChange = (e: CustomEvent) => {
    e.preventDefault()
    const newStopDate = new Date(e.detail.value)
    const startDate = new Date(startTime)
    newStopDate.setSeconds(0, 0)
    startDate.setSeconds(0, 0)

    if (newStopDate.getTime() < startDate.getTime()) {
      presentAlert({
        header: "Validation warning",
        message: "Stop time cannot be before start time",
        buttons: ["Close"],
      })
      if (stopDatetimeRef.current) {
        stopDatetimeRef.current.value = getDatetime(stopTime)
      }
      e.preventDefault()
      e.stopPropagation()
    } else {
      setStopTime(newStopDate)
    }
  }

  const onDurationChange = (e: CustomEvent) => {
    const newDuration = e.detail.value
    setDuration(newDuration)
  }

  return (
    <IonModal isOpen={props.valveCreate} className={s.createModal}>
      <Header type="valveCreateModal" sensorId={props.sensorId} setValveCreate={props.setValveCreate} />
      <IonContent>
        <div className={s.createModalContent}>
          <IonItem className={s.createModalItem}>{props.config?.names[0] ? props.config?.names[0] : "Valve"}</IonItem>
          <IonItem className={s.createModalItem}>
            <IonLabel className={s.createModalItemLabel}>Duration</IonLabel>
            <IonDatetimeButton datetime="durationDatetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true} className={s.createTimePickerModal}>
              <IonDatetime
                id="durationDatetime"
                presentation="time"
                showDefaultButtons={true}
                value={'06:00'}
                onIonChange={onDurationChange}
              ></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem className={s.createModalItem}>
            <IonLabel className={s.createModalItemLabel}>Start Time</IonLabel>
            <IonDatetimeButton datetime="startDatetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true} className={s.createTimePickerModal}>
              <IonDatetime
                id="startDatetime"
                presentation="date-time"
                showDefaultButtons={true}
                value={getDatetime(startTime)}
                onIonChange={(e: CustomEvent) => setStartTime(new Date(e.detail.value!))}
              ></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem className={s.createModalItem}>
            <IonLabel className={s.createModalItemLabel}>Stop Time</IonLabel>
            <IonDatetimeButton datetime="stopDatetime"></IonDatetimeButton>
            <IonModal keepContentsMounted={true} className={s.createTimePickerModal}>
              <IonDatetime
                ref={stopDatetimeRef}
                id="stopDatetime"
                presentation="date-time"
                showDefaultButtons={true}
                value={getDatetime(stopTime)}
                onIonChange={onStopTimeChange}
              ></IonDatetime>
            </IonModal>
          </IonItem>
          <IonItem className={`${s.createModalItem} ${s.createTimezoneItem}`}>
            <IonSelect
              className={s.createModalSelect}
              label={"Current timezone"}
              placeholder="Timezone"
              value={"America/Los_Angeles"}
            >
              {Intl.supportedValuesOf("timeZone").map((timezone: string) => (
                <IonSelectOption key={timezone} value={timezone}>
                  {timezone}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>
          <IonItem className={s.createModalItem}>
            <IonCheckbox
              checked={isPulseIrrigation}
              onIonChange={() => setIsPulseIrrigation(!isPulseIrrigation)}
              className={s.createModalItemCheckbox}
            >
              Pulse Irrigation
            </IonCheckbox>
          </IonItem>
          {isPulseIrrigation && (
            <>
              <IonItem className={`${s.createModalItem} ${s.createPulseCountItem}`}>
                <IonInput
                  label="Pulse Count"
                  type="number"
                  min={2}
                  value={pulseCount}
                  onIonInput={(e) => {
                    const value = Number.parseInt(e.detail.value || "2", 10)
                    if (value >= 2) setPulseCount(value)
                  }}
                  className={s.createPulseCountInput}
                />
                <div>
                  <IonButton className={s.createPulseButton} onClick={() => handlePulseCount(-1)} fill={"clear"}>
                    <IonIcon slot="icon-only" icon={removeOutline}></IonIcon>
                  </IonButton>
                  <IonButton className={s.createPulseButton} onClick={() => handlePulseCount(1)} fill={"clear"}>
                    <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                  </IonButton>
                </div>
              </IonItem>
              <IonItem className={s.createModalItem}>
                <IonLabel className={s.createModalItemLabel}>Pulse Off Hours</IonLabel>
                <IonDatetimeButton datetime="pulseOffHours"></IonDatetimeButton>
                <IonModal keepContentsMounted={true} className={s.createTimePickerModal}>
                  <IonDatetime
                    id="pulseOffHours"
                    presentation="time"
                    showDefaultButtons={true}
                    value={`${String(Math.floor(pulseOffMinutes / 60)).padStart(2, "0")}:${String(pulseOffMinutes % 60).padStart(2, "0")}`}
                    onIonChange={(e) => {
                      const timeStr = e.detail.value?.toString() || ""
                      const [hours, minutes] = timeStr.split(":").map(Number)
                      setPulseOffMinutes(hours * 60 + minutes)
                    }}
                  ></IonDatetime>
                </IonModal>
              </IonItem>
              <IonItem className={`${s.createModalItem} ${s.createPulseCountItem}`}>
                <IonInput
                  label="Pulse Off Minutes"
                  type="number"
                  min={0}
                  value={pulseOffMinutes}
                  onIonInput={(e) => {
                    const value = Number.parseInt(e.detail.value || "60", 10)
                    if (value >= 10) setPulseOffMinutes(value)
                  }}
                  className={s.createPulseCountInput}
                />
                <div>
                  <IonButton
                    className={s.createPulseButton}
                    fill={"clear"}
                    onClick={() => setPulseOffMinutes(Math.max(10, pulseOffMinutes - 10))}
                  >
                    <IonIcon slot="icon-only" icon={removeOutline}></IonIcon>
                  </IonButton>
                  <IonButton
                    className={s.createPulseButton}
                    fill={"clear"}
                    onClick={() => setPulseOffMinutes(pulseOffMinutes + 10)}
                  >
                    <IonIcon slot="icon-only" icon={addOutline}></IonIcon>
                  </IonButton>
                </div>
              </IonItem>
            </>
          )}
          <IonButton className={s.createButton}>
            {isPulseIrrigation ? `Create ${pulseCount} pulses` : "Create"}
          </IonButton>
        </div>
      </IonContent>
    </IonModal>
  )
}
