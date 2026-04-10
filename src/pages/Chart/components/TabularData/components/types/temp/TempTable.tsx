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
          {data.data.map((row: any, index: any) => (
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
              <td className={tdClass} style={{color: '#000'}}
                  data-label="Temp">{row['MS 1'] === null ? 'null' : row['MS 1']}°F
              </td>
              <td className={tdClass} style={{color: '#000'}}
                  data-label="Dew Point">{row['MS DU'] === null ? 'null' : row['MS DU']}°F
              </td>
              <td className={tdClass} style={{color: '#000'}}
                  data-label="RH">{row['MS 3'] === null ? 'null' : row['MS 3']}%
              </td>
              <td className={tdClass} style={{color: '#000'}}
                  data-label="Leaf Wetness">{row['leafWetness'] === null ? 'null' : row['leafWetness']}%
              </td>
              <td className={tdClass} style={{color: '#000'}}
                  data-label="Analog 1">{row['analog1'] === null ? 'null' : row['analog1']}</td>
              <td className={tdClass} style={{color: '#000'}}
                  data-label="Analog 2">{row['analog2'] === null ? 'null' : row['analog2']}</td>
              <td className={tdClass} style={{color: '#000'}}
                  data-label="PSI">{row['psi'] === null ? 'null' : row['psi']}</td>
              <td className={tdClass} style={{color: '#000'}}
                  data-label="Water Temp">{row['waterTemp'] === null ? 'null' : row['waterTemp']}°F
              </td>
            </tr>
          ))}
          </tbody>
        </table>
      )}
    </div>
  )
}