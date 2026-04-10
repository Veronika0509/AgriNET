import s from "../../../../types/moist/style.module.css";
import React from "react";

const hexColors =
  "#FF6600 #FCD202 #B0DE09 #0D8ECF #2A0CD0 #CD0D74 #CC0000 #00CC00 #0000CC #DDDDDD #999999 #333333".split(" ");

const colors = hexColors.map((hex) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { hex, r, g, b };
});

interface moistTableProps {
  type: string,
  data: any,
  firstRowColor: any,
  isWxetMobile: boolean,
  scrollable?: boolean,
  daysToRefill?: number
}

export const MoistTable: React.FC<moistTableProps> = ({type, data, firstRowColor, isWxetMobile, scrollable, daysToRefill}) => {
  return (
    <div style={scrollable ? { overflowX: 'auto' } : undefined}>
    <table className={`${s.mainTabularDataTable} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTable}`} style={scrollable ? { tableLayout: 'auto', whiteSpace: 'nowrap' } : undefined}>
      <thead className={s.mainTabularDataTableThead}>
      <tr>
        <th className={`${s.mainTabularDataTableTh} ${s.mainTabularDataTableThLarge}`}>
          {data.label}
          {daysToRefill !== undefined && (
            <span style={{ color: '#CC0000', fontWeight: 600, marginLeft: '8px', fontSize: '11px' }}>
              {daysToRefill <= 0 ? 'below refill zone' : `${daysToRefill}d to refill`}
            </span>
          )}
        </th>
        {Array.from({length: data.sensorCount}, (_, index) => (
          <th key={index} className={s.mainTabularDataTableTh}
              style={{backgroundColor: type === 'moistSum' ? '#6771dc' : type === 'moistSoilTemp' ? `rgb(${colors[index].r}, ${colors[index].g}, ${colors[index].b})` : colors[index].hex}}>
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
            <td key={index} data-label={`${4 * (index + 1)}inch`} style={isWxetMobile && type === 'moistSoilTemp' ? {backgroundColor: `rgb(${colors[index]?.r}, ${colors[index]?.g}, ${colors[index]?.b})`, color: '#000'} : {color: '#000'}} className={`${s.mainTabularDataTableTd} ${type === 'moistSoilTemp' && s.mainMoistSoilTempTabularDataTableTd}`}>
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