import s from "../../../../types/moist/style.module.css";
import React from "react";

interface moistTableProps {
  type: string,
  data: any,
  colors: any,
  firstRowColor: any,
  isWxetMobile: boolean
}

export const MoistTable: React.FC<moistTableProps> = ({type, data, colors, firstRowColor, isWxetMobile}) => {
  return (
    <table className={`${s.mainTabularDataTable} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTable}`}>
      <thead className={s.mainTabularDataTableThead}>
      <tr>
        <th className={`${s.mainTabularDataTableTh} ${s.mainTabularDataTableThLarge}`}>{data.label}</th>
        {Array.from({length: data.sensorCount}, (_, index) => (
          <th key={index} className={s.mainTabularDataTableTh}
              style={{backgroundColor: type === 'moistSum' ? `rgb(${colors[0]}, ${colors[1]}, ${colors[2]})` : type === 'moistSoilTemp' ? `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})` : colors[index]}}>
            {type === 'moistMain' && (
              <>{4 * (index + 1)}inch</>
            )}
            {type === 'moistSum' && (
              <>Sum Average</>
            )}
            {type === 'moistSoilTemp' && (
              <>{4 * (index + 1)}inch</>
            )}
          </th>
        ))}
      </tr>
      </thead>
      <tbody className={s.mainTabularDataTableTbody}>
      {data.data.map((row: any, index: number) => (
        <tr key={index} className={`${s.mainTabularDataTableTr} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTr}`}>
          <td className={`${s.mainTabularDataTableTd} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTd} ${
            (index === 0 &&
              (row.freshness === 'undefined' ||
                row.freshness === '3d' ||
                row.freshness === 'outdated'))
              ? s.mainTabularDataTableThead
              : ''
          }`}  data-label='Time' style={index === 0 ? {backgroundColor: firstRowColor} : {color: '#000'}}>{row.DateTime}</td>
          {Array.from({length: data.sensorCount}, (_, index) =>
            <td key={index} data-label={`${4 * (index + 1)}inch`} style={isWxetMobile && type === 'moistSoilTemp' ? {backgroundColor: `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})`} : {}} className={`${s.mainTabularDataTableTd} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTd}`}>
              {type === 'moistMain' && row[`MABS${index}`]}
              {type === 'moistSum' && `${row[`SumAve`]} inches`}
              {type === 'moistSoilTemp' && `${row[`MABS${index}`]}°F`}
            </td>
          )}
        </tr>
      ))}
      </tbody>
    </table>
  )
}