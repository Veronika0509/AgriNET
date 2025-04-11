import {useEffect, useState} from "react";
import {getCommentsTypes} from "./data/getCommentsTypes";
import {getCommentsData} from "./data/getCommentsData";
import {IonButton, IonIcon, IonInput, IonSelect, IonSelectOption} from "@ionic/react";
import s from '../../style.module.css'
import {closeOutline} from "ionicons/icons";

export const Comments = (props: any) => {
  const [types, setTypes] = useState<any>()
  const [data, setData] = useState<any>([])
  const [currentType, setCurrentType] = useState(0)
  const [currentSort, setCurrentSort] = useState('dateDesc')
  const [currentSensorId, setCurrentSensorId] = useState('')

  useEffect(() => {
    const setInitialData = async () => {
      const currentTypes = await getCommentsTypes()
      setTypes(currentTypes.data)

      const initialData = await getCommentsData({
        sort: 'dateDesc',
        startIndex: 0,
        type: 0,
        userId: props.userId,
        sensorId: '',
      })
      setData(initialData.data)
    }
    setInitialData()
  }, []);

  const onTypeChange = async (value: any) => {
    if (value !== currentType) {
      setCurrentType(value)
      const newData = await getCommentsData({
        type: value,
        sort: currentSort,
        sensorId: currentSensorId,
        startIndex: 0,
        userId: props.userId
      })
      setData(newData.data)
    }
  }
  const onSensorIdChange = async (value: any) => {
    if (value !== currentSensorId) {
      setCurrentSensorId(value)
      const newData = await getCommentsData({
        type: currentType,
        sort: currentSort,
        sensorId: value,
        startIndex: 0,
        userId: props.userId
      })
      setData(newData.data)
    }
  }
  const onSortChangeChange = async (value: any) => {
    setCurrentSort(value)
    const newData = await getCommentsData({
      type: currentType,
      sort: value,
      sensorId: currentSensorId,
      startIndex: 0,
      userId: props.userId
    })
    setData(newData.data)
  }

  const sortOptions = [
    {name: "dateDesc", label: "By Date, newest first"},
    {name: "dateAsc", label: "By Date, oldest first"},
    {name: "type", label: "By Type"},
    {name: "field", label: "By Field"},
    {name: "chartKind", label: "By Chart"},
  ]

  const chartKinds: any = [
    {code: "M", name: "Soil Moisture"},
    {code: "MSum", name: "Sum of Soil Moisture"},
    {code: "SMT", name: "Soil Temperature"},
    {code: "T", name: "Temperature RH"},
    {code: "BandDiff", name: "Band Difference"},
    {code: "BFlow", name: "BFlow"},
    {code: "disease", name: "Disease"},
    {code: "InfraRed", name: "Infra Red"},
    {code: "S", name: "Other"},
    {code: "SRS", name: "SRS"},
    {code: "WL", name: "Weather Station"}
  ];

  return (
    <div>
      <div className={s.comments_settings}>
        <div className={s.comments_settingsTypes}
             style={{background: currentType !== 0 && types.find((item: any) => item.id === currentType).color}}>
          <IonSelect label="Type" value={currentType} onIonChange={(e: any) => onTypeChange(e.detail.value)}
                     className={s.comments_types}>
            <IonSelectOption value={0}>Any</IonSelectOption>
            {types && types.map((type: any) => (
              <IonSelectOption key={type.id} value={type.id}>{type.name}</IonSelectOption>
            ))}
          </IonSelect>
          <button className={s.comments_settingsTypesButton} onClick={() => onTypeChange(0)}>
            <IonIcon slot='icon-only' icon={closeOutline} size={'small'}></IonIcon>
          </button>
        </div>
        <IonInput label="Sensor ID:" placeholder='Any' value={currentSensorId}
                  onIonBlur={(e: any) => onSensorIdChange(e.target.value)}></IonInput>
        <IonSelect label="Sort:" value={currentSort} onIonChange={(e: any) => onSortChangeChange(e.detail.value)}
                   className={s.comments_types}>
          {sortOptions && sortOptions.map((sort: any) => (
            <IonSelectOption key={sort.name} value={sort.name}>{sort.label}</IonSelectOption>
          ))}
        </IonSelect>
      </div>

      <table className={s.comments_table}>
        <thead>
        <tr>
          <th>Chart</th>
          <th>Sensor ID</th>
          <th>Field</th>
          <th>Date</th>
          <th>Type</th>
          <th>Text</th>
        </tr>
        </thead>
        <tbody>
        {data && data.length > 0 ? data.map((item: any, index: number) => (
          <tr key={index}>
            <td>{chartKinds.find((chartKindObj: any) => chartKindObj.code === item.chartKind)?.name}</td>
            <td>{item.sensorId}</td>
            <td>{item.field}</td>
            <td>{new Date(item.date).toLocaleString()}</td>
            <td style={{
              backgroundColor: types?.find((t: any) => t.id === item.type)?.color,
              fontSize: '12px',
              whiteSpace: 'nowrap'
            }}>
              {types?.find((t: any) => t.id === item.type)?.name}
            </td>
            <td>{item.text}</td>
          </tr>
        )) : (
          <tr>
            <td colSpan={6} style={{textAlign: 'center', padding: '20px'}}>No data</td>
          </tr>
        )}
        </tbody>
      </table>
    </div>
  )
}