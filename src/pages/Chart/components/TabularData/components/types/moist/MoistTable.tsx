import s from "../../../../types/moist/style.module.css";
import React from "react";

const colors =
  "#FF6600 #FCD202 #B0DE09 #0D8ECF #2A0CD0 #CD0D74 #CC0000 #00CC00 #0000CC #DDDDDD #999999 #333333".split(" ");

interface moistTableProps {
  type: string,
  data: any,
  firstRowColor: any,
  isWxetMobile: boolean,
  scrollable?: boolean
}

export const MoistTable: React.FC<moistTableProps> = ({type, data, firstRowColor, isWxetMobile, scrollable}) => {
  return (
    <div style={scrollable ? { overflowX: 'auto' } : undefined}>
    <table className={`${s.mainTabularDataTable} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTable}`} style={scrollable ? { tableLayout: 'auto', whiteSpace: 'nowrap' } : undefined}>
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
      {data.data?.map((row: any, index: number) => (
        <tr key={index} className={`${s.mainTabularDataTableTr} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTr}`}>
          <td className={`${s.mainTabularDataTableTd} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTd} ${
            (index === 0 &&
              (row.freshness === 'undefined' ||
                row.freshness === '3d' ||
                row.freshness === 'outdated'))
              ? s.mainTabularDataTableThead
              : ''
          }`}  data-label='Time' style={index === 0 ? {
            backgroundColor: firstRowColor,
            color: (row.freshness === '3d' || row.freshness === 'outdated') ? '#fff' : '#000'
          } : {color: '#000'}}>{row.DateTime}</td>
          {Array.from({length: data.sensorCount}, (_, index) =>
            <td key={index} data-label={`${4 * (index + 1)}inch`} style={isWxetMobile && type === 'moistSoilTemp' ? {backgroundColor: `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})`, color: '#000'} : {color: '#000'}} className={`${s.mainTabularDataTableTd} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTd}`}>
              {type === 'moistMain' && row[`MABS${index}`]}
              {type === 'moistSum' && `${row[`SumAve`]} inches`}
              {type === 'moistSoilTemp' && `${row[`MABS${index}`]}°F`}
            </td>
          )}
        </tr>
      ))}
      </tbody>
    </table>
    </div>
  )
}