import s from "../style.module.css";
import {IonButton, IonContent, IonModal, IonSpinner, IonText, IonTitle, useIonViewDidEnter} from "@ionic/react";
import React, {useEffect, useRef, useState} from "react";
import {getAutowaterData} from "../../../../data/types/moist/getAutowaterData";

export const Autowater = (props: any) => {
  const [isAutowaterLoading, setIsAutowaterLoading] = useState(false)
  const [irrigationNeeded, setIrrigationNeeded] = useState(false)
  const [autowaterData, setAutowaterData] = useState<any>([])
  const modalRef = useRef<HTMLIonModalElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (props.autowater) {
      setNewAutowaterData()
    }
  }, [props.autowater]);
  useEffect(() => {
    if (props.autowater) {
      setTimeout(adjustModalHeight, 100);
    }
  }, [props.autowater, autowaterData]);
  useEffect(() => {
    if (autowaterData.length !== 0 && isAutowaterLoading) {
      setIsAutowaterLoading(false)
      setIrrigationNeeded(autowaterData.averageMoisture < autowaterData.valve.msetPoint)
      adjustModalHeight()
    }
  }, [autowaterData])
  useIonViewDidEnter(() => {
    if (props.autowater) {
      adjustModalHeight();
    }
  });

  const adjustModalHeight = () => {
    if (modalRef.current && contentRef.current && !isAutowaterLoading) {
      const contentHeight = contentRef.current.offsetHeight;
      const maxHeight = window.innerHeight * 0.9;
      const newHeight = Math.min(contentHeight + 50, maxHeight);
      modalRef.current.style.setProperty('--height', `${newHeight}px`);
    }
  };
  const redirectToSettings = async () => {
    props.setValveSettings(true)
    props.setChartPageType('valve')
    props.setSiteId(autowaterData.valve.sensorId)
    props.setSettingsOddBack(true)
    props.setAutowater(false)
  }
  const getAutowaterFormattedDays = (hours: number) => {
    if (hours > 48) {
      let days = Math.ceil(hours / 24)
      hours = hours % 24
      if (hours > 0 && days < 5) {
        return `${days} days ${hours} hours`
      } else {
        return `${days} days`
      }
    } else if (hours == 0) {
      return `less than one hour`
    } else {
      return `${hours} hours`
    }
  }
  const setNewAutowaterData = async () => {
    setIsAutowaterLoading(true)
    const newAutowaterData = await getAutowaterData(props.sensorId)
    setAutowaterData(newAutowaterData.data)
  }

  return (
    <IonModal onDidPresent={adjustModalHeight} ref={modalRef} className={s.autowaterModal}
              isOpen={props.autowater}
              onWillDismiss={() => props.setAutowater(false)}>
      <IonContent
        className={`${s.autowaterModalWrapper} ${isAutowaterLoading && s.autowaterModalWrapperLoading}`}>
        {isAutowaterLoading ? (
          <IonSpinner name="circular" className={s.autowaterLoading}></IonSpinner>
        ) : (
          <div className={s.autowaterModalWrapper} ref={contentRef}>
            {autowaterData.length !== 0 ? (
              <div>
                <h2>AutoWATER {autowaterData.valve.enabled ? 'Enabled' : 'Disabled'}</h2>
                <IonText className={`${s.autowaterModalText} ${s.autowaterModalTextOne}`}>Irrigation
                  point <span
                    className={s.autowaterModalTextSpan}>{autowaterData.valve.msetPoint}%SWC</span></IonText>
                <IonText className={s.autowaterModalText}><span
                  className={s.autowaterModalTextSpan}>{autowaterData.valve.hrsAve} hours</span> average soil
                  moisture
                  on <span
                    className={s.autowaterModalTextSpan}>sensor #{autowaterData.valve.setPointSensor}</span></IonText>
                <div className={s.autowaterModalAverage}>
                  <IonText className={`${s.autowaterModalAverageText} ${irrigationNeeded && s.critical}`}>Current
                    average <span>{autowaterData.averageMoisture}%</span></IonText>
                </div>
                {autowaterData.drainSpeed > 0 && (
                  <div className={s.autowaterModalFalling}>
                    Soil moisture falling by <span
                    className={s.autowaterModalFallingOne}>{autowaterData.drainSpeed}% per hour</span>
                    {!irrigationNeeded && (
                      <>
                        <br/>
                        Irrigation trigger expected in <span
                        className={s.autowaterModalFallingTwo}>{getAutowaterFormattedDays(autowaterData.hoursToIrrigate)}
                            </span>
                      </>
                    )}
                  </div>
                )}
                {!irrigationNeeded && (
                  <IonText className={s.autowaterModalNoIrrigation}>No irrigation needed</IonText>
                )}
                {irrigationNeeded && (
                  <>
                    <IonText className={`${s.autowaterModalNoIrrigation} ${s.autowaterModalIrrigationNeeded}`}>Irrigation
                      for {autowaterData.valve.duration} minutes needed</IonText>
                    <div>
                      <IonText
                        className={s.autowaterModalNoIrrigation}>Priority {autowaterData.valve.priority} Requirement:</IonText>
                      <IonText className={s.autowaterModalNoIrrigation}>
                        Irrigation for <span
                        className={s.autowaterModalTextSpan}>{autowaterData.valve.duration} minutes</span><br/>
                        Drainage for <span
                        className={s.autowaterModalTextSpan}>{autowaterData.valve.waterDrainTime} minutes</span>
                      </IonText>
                    </div>
                  </>
                )}
                <div className={s.autowaterModalButtons}>
                  <IonButton onClick={setNewAutowaterData}
                             className={s.autowaterModalRecalculateButton}>Recalculate</IonButton>
                  <IonButton onClick={redirectToSettings} className={s.autowaterModalEditParameters} fill='outline'>Edit
                    Parameters</IonButton>
                </div>
              </div>
            ) : (
              <div>
                <IonTitle>Auto water is not set up</IonTitle>
              </div>
            )}
          </div>
        )}
      </IonContent>
    </IonModal>
  )
}