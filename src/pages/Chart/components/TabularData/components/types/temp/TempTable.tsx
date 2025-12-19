import s from "../../../../types/moist/style.module.css";
import React, {useEffect, useState} from "react";

interface TempTableProps {
  tabularData: any,
  isMobile: boolean,
  freshnessColors: any
}

export const TempTable: React.FC<TempTableProps> = ({tabularData, isMobile, freshnessColors}) => {
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

  return (
    <div>
      {data && (
        <table className={`${s.mainTabularDataTable} ${s.mainTempWxetTabularDataTable}`}>
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
                style={{backgroundColor: `#5ff627`}}>Leaf
              Wetness
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
                className={`${s.TTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd} ${
                  (index === 0 &&
                    (data.freshnessColor === '#000' ||
                      data.freshnessColor === '#808080FF' ||
                      data.freshnessColor === '#000000FF'))
                    ? s.mainTabularDataTableThead
                    : ''
                } ${index !== 0 && s.mainTempWxetTabularDataTableTdBlack} `}
                style={index === 0 ? {backgroundColor: data.freshnessColor} : {}}
                data-label={data.label}
              >{row.DateTime}</td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[0].__proto__.r}, ${colors[0].__proto__.g}, ${colors[0].__proto__.b})`} : {}}
                  data-label="Temp">{row['MS 1'] === null ? 'null' : row['MS 1']}°F
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[1].__proto__.r}, ${colors[1].__proto__.g}, ${colors[1].__proto__.b})`} : {}}
                  data-label="Dew Point">{row['MS DU'] === null ? 'null' : row['MS DU']}°F
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[2].__proto__.r}, ${colors[2].__proto__.g}, ${colors[2].__proto__.b})`} : {}}
                  data-label="RH">{row['MS 3'] === null ? 'null' : row['MS 3']}%
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[3].__proto__.r}, ${colors[3].__proto__.g}, ${colors[3].__proto__.b})`} : {}}
                  data-label="Leaf Wetness">{row['leafWetness'] === null ? 'null' : row['leafWetness']}%
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[4].__proto__.r}, ${colors[4].__proto__.g}, ${colors[4].__proto__.b})`} : {}}
                  data-label="Analog 1">{row['analog1'] === null ? 'null' : row['analog1']}</td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[5].__proto__.r}, ${colors[5].__proto__.g}, ${colors[5].__proto__.b})`} : {}}
                  data-label="Analog 2">{row['analog2'] === null ? 'null' : row['analog2']}</td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[6].__proto__.r}, ${colors[6].__proto__.g}, ${colors[6].__proto__.b})`} : {}}
                  data-label="PSI">{row['psi'] === null ? 'null' : row['psi']}</td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[7].__proto__.r}, ${colors[7].__proto__.g}, ${colors[7].__proto__.b})`} : {}}
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