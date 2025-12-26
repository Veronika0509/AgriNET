import s from "../../../../types/moist/style.module.css";
import React, {useEffect, useState} from "react";

interface TempTableProps {
  tabularData: any,
  isMobile: boolean,
  freshnessColors: any
}

export const TempTable: React.FC<TempTableProps> = ({tabularData, isMobile, freshnessColors}) => {
  const [data, setData] = useState<any>(undefined)

  // Define colors array matching the table headers
  const colors = [
    { r: 255, g: 143, b: 143 }, // Temp: #FF8F8F
    { r: 158, g: 20, b: 245 },  // Dew Point: #9e14f5
    { r: 40, g: 178, b: 247 },  // RH: #28B2F7
    { r: 95, g: 246, b: 39 },   // Leaf Wetness: #5ff627
    { r: 210, g: 186, b: 0 },   // Analog 1: #d2ba00
    { r: 255, g: 0, b: 0 },     // Analog 2: #ff0000
    { r: 0, g: 116, b: 91 },    // PSI: #00745b
    { r: 0, g: 15, b: 113 }     // Water Temp: #000f71
  ];

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
                  style={isMobile ? {backgroundColor: `rgb(${colors[0].r}, ${colors[0].g}, ${colors[0].b})`} : {}}
                  data-label="Temp">{row['MS 1'] === null ? 'null' : row['MS 1']}°F
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[1].r}, ${colors[1].g}, ${colors[1].b})`} : {}}
                  data-label="Dew Point">{row['MS DU'] === null ? 'null' : row['MS DU']}°F
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[2].r}, ${colors[2].g}, ${colors[2].b})`} : {}}
                  data-label="RH">{row['MS 3'] === null ? 'null' : row['MS 3']}%
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[3].r}, ${colors[3].g}, ${colors[3].b})`} : {}}
                  data-label="Leaf Wetness">{row['leafWetness'] === null ? 'null' : row['leafWetness']}%
              </td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[4].r}, ${colors[4].g}, ${colors[4].b})`} : {}}
                  data-label="Analog 1">{row['analog1'] === null ? 'null' : row['analog1']}</td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[5].r}, ${colors[5].g}, ${colors[5].b})`} : {}}
                  data-label="Analog 2">{row['analog2'] === null ? 'null' : row['analog2']}</td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[6].r}, ${colors[6].g}, ${colors[6].b})`} : {}}
                  data-label="PSI">{row['psi'] === null ? 'null' : row['psi']}</td>
              <td className={`${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`}
                  style={isMobile ? {backgroundColor: `rgb(${colors[7].r}, ${colors[7].g}, ${colors[7].b})`} : {}}
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