import s from "../style.module.css";
import Header from "../../.././Header";
import {IonContent, IonModal, IonSpinner} from "@ionic/react";
import {useCallback, useEffect, useRef, useState} from "react";
import {getValveArchiveData} from "../../../../data/types/valve/getValveArchiveData";

interface ArchiveProps {
  sensorId: string;
  valveArchive: boolean;
  setValveArchive: (open: boolean) => void;
  [key: string]: unknown;
}

interface ArchiveItem {
  id: string | number;
  fieldName: string;
  sensorId: string;
  localTime: string;
  duration: string;
  valve1: string;
  valve1Name: string;
  validate: number;
  [key: string]: unknown;
}

export const Archive = (props: ArchiveProps) => {
  const [archiveData, setArchiveData] = useState<ArchiveItem[]>([])
  const [loading, setLoading] = useState(false)
  const lastElementRef = useRef(null);
  const observer = useRef<IntersectionObserver | null>(null);

  const loadMoreData = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const newData = await getValveArchiveData(props.sensorId, archiveData.length);
      const uniqueNewData = newData.data.filter((newItem: ArchiveItem) =>
        !archiveData.some((existingItem: ArchiveItem) => existingItem.id === newItem.id)
      );
      setArchiveData((prevData: ArchiveItem[]) => [...prevData, ...uniqueNewData]);
    } catch (error) {
      console.error("Error loading more data:", error);
    } finally {
      setLoading(false);
    }
  }, [props.sensorId, archiveData, loading]);

  useEffect(() => {
    if (props.valveArchive) {
      loadMoreData()
    }
  }, [props.valveArchive]);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreData();
        }
      },
      { threshold: 0.1 }
    );

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [loadMoreData, loading]);

  useEffect(() => {
    const currentRef = lastElementRef.current;
    if (currentRef && observer.current) {
      observer.current.observe(currentRef);
    }

    return () => {
      if (currentRef && observer.current) {
        observer.current.unobserve(currentRef);
      }
    };
  }, [archiveData]);
  return (
    <IonModal isOpen={props.valveArchive} className={s.archiveModal}>
      <Header type='valveArchiveModal' sensorId={props.sensorId} setValveArchive={props.setValveArchive}/>
      <IonContent className={s.archiveModalContent}>
        <div className={s.tableContainer}>
          <table className={s.table}>
            <thead>
            <tr className={s.archiveTableHeadRow}>
              <th className={s.tableHeadTitle}>Site</th>
              <th className={s.tableHeadTitle}>Time</th>
              <th className={s.tableHeadTitle}>Valve</th>
              <th className={s.tableHeadTitle}>Validate</th>
            </tr>
            </thead>
            <tbody>
            {archiveData.map((item: ArchiveItem, index: number) => (
              <tr
                key={index}
                className={s.tableItem}
                ref={index === archiveData.length - 1 ? lastElementRef : null}
              >
                <td className={s.tableRowItem}>
                  <div>{item.fieldName}</div>
                  <div className={s.siteId}>({item.sensorId})</div>
                </td>
                <td className={s.tableRowItem}>{item.localTime.slice(0, -5)}</td>
                <td className={s.tableRowItem}>
                  {item.valve1Name}:{' '}
                  <span className={item.valve1 === 'OFF' ? s.off : s.on}>{item.valve1}</span>
                </td>
                <td className={s.tableRowItem}>{item.validate} Success</td>
              </tr>
            ))}
            </tbody>
          </table>
        </div>
        {loading && <IonSpinner name="crescent" className={s.archiveDataSpinner}></IonSpinner>}
      </IonContent>
    </IonModal>
  )
}