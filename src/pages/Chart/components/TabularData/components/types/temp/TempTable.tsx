import s from "../../../../types/moist/style.module.css";
import React, {useEffect, useState} from "react";

interface TempTableProps {
  tabularData: any,
  isMobile: boolean,
  freshnessColors: any,
  scrollable?: boolean
}

export const TempTable: React.FC<TempTableProps> = ({tabularData, freshnessColors, scrollable}) => {
  const [data, setData] = useState<any>(undefined)

  useEffect(() => {
    if (!tabularData.freshnessColor) {
      setData({
        data: tabularData.data,
        label: tabularData.label,
        sensorCount: tabularData.sensorCount,
        freshnessColor: freshnessColors[tabularData.freshness]
      })
    } else {
      setData(tabularData)
    }
  }, []);

  const tdClass = scrollable ? s.mainTabularDataTableTd : `${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`;

  return (
    <div style={scrollable ? { overflowX: 'auto' } : undefined}>
      {data && (
        <table className={`${s.mainTabularDataTable} ${scrollable ? '' : s.mainTempWxetTabularDataTable}`} style={scrollable ? { tableLayout: 'auto', whiteSpace: 'nowrap' } : undefined}>
          <thead className={s.mainTabularDataTableThead}>
          <tr>
            <th
              className={`${s.mainTabularDataTableTh} ${s.mainTabularDataTableThLarge}`}>{data.label}</th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#FF8F8F`}}>Temp
            </th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#9e14f5`}}>Dew Point
            </th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#28B2F7`}}>RH
            </th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#5ff627`}}>Leaf Wetness
            </th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#d2ba00`}}>Analog 1
            </th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#ff0000`}}>Analog 2
            </th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#00745b`}}>PSI
            </th>
            <th className={s.mainTabularDataTableTh}
                style={{backgroundColor: `#000f71`}}>Water Temp
            </th>
          </tr>
          </thead>
          <tbody className={s.mainTabularDataTableTbody}>
          {data.data.map((row: any, index: any) => {
            const isNull = (v: any) => v === null || v === undefined;
            return (
            <tr key={index} className={s.mainTabularDataTableTr}>
              <td
                className={`${scrollable ? s.mainTabularDataTableTd : s.TTabularDataTableTd} ${scrollable ? '' : s.mainTempWxetTabularDataTableTd} ${
                  (index === 0 &&
                    (data.freshnessColor === '#000' ||
                      data.freshnessColor === '#808080FF' ||
                      data.freshnessColor === '#000000FF'))
                    ? s.mainTabularDataTableThead
                    : ''
                } ${index !== 0 && !scrollable && s.mainTempWxetTabularDataTableTdBlack} `}
                style={index === 0 ? {
                  backgroundColor: data.freshnessColor,
                  color: (data.freshnessColor === '#808080FF' || data.freshnessColor === '#000000FF' || data.freshnessColor === '#000') ? '#fff' : '#000'
                } : {color: '#000'}}
                data-label={data.label}
              >{row.DateTime}</td>
              {!isNull(row['MS 1']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="Temp">{row['MS 1']}°F
                </td>
              )}
              {!isNull(row['MS DU']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="Dew Point">{row['MS DU']}°F
                </td>
              )}
              {!isNull(row['MS 3']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="RH">{row['MS 3']}%
                </td>
              )}
              {!isNull(row['leafWetness']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="Leaf Wetness">{row['leafWetness']}%
                </td>
              )}
              {!isNull(row['analog1']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="Analog 1">{row['analog1']}</td>
              )}
              {!isNull(row['analog2']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="Analog 2">{row['analog2']}</td>
              )}
              {!isNull(row['psi']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="PSI">{row['psi']}</td>
              )}
              {!isNull(row['waterTemp']) && (
                <td className={tdClass} style={{color: '#000'}}
                    data-label="Water Temp">{row['waterTemp']}°F
                </td>
              )}
            </tr>
            );
          })}
          </tbody>
        </table>
      )}
    </div>
  )
}