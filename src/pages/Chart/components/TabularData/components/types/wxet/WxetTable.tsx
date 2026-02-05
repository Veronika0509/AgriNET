import React, { useEffect, useState } from "react";
import s from "../../../../types/moist/style.module.css";

interface WxetTableProps {
  tabularData: {
    label: string;
    sensorCount: number;
    data: any[];
    freshness: string;
  };
  isMobile: boolean;
  freshnessColors: Record<string, string>;
  scrollable?: boolean;
}

export const WxetTable: React.FC<WxetTableProps> = ({ tabularData, freshnessColors, scrollable }) => {
  const [data, setData] = useState<any>(undefined);

  useEffect(() => {
    setData({
      data: tabularData.data,
      label: tabularData.label,
      sensorCount: tabularData.sensorCount,
      freshnessColor: freshnessColors[tabularData.freshness] || freshnessColors['undefined']
    });
  }, [tabularData, freshnessColors]);

  const tdClass = scrollable ? s.mainTabularDataTableTd : `${s.mainTabularDataTableTd} ${s.mainTempWxetTabularDataTableTd}`;

  return (
    <div style={scrollable ? { overflowX: 'auto' } : undefined}>
      {data && (
        <table className={`${s.mainTabularDataTable} ${scrollable ? '' : s.mainTempWxetTabularDataTable}`} style={scrollable ? { tableLayout: 'auto', whiteSpace: 'nowrap' } : undefined}>
          <thead className={s.mainTabularDataTableThead}>
            <tr>
              <th className={`${s.mainTabularDataTableTh} ${s.mainTabularDataTableThLarge}`} style={{ color: '#000' }}>
                {data.label}
              </th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>Solar Rad</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>RH</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>Air Temp</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>Rain</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>Wind</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>Gust</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>Leaf Wet</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>GDD</th>
              <th className={s.mainTabularDataTableTh} style={{ color: '#000' }}>AGDD</th>
            </tr>
          </thead>
          <tbody className={s.mainTabularDataTableTbody}>
            {data.data.map((row: any, index: number) => (
              <tr key={index} className={s.mainTabularDataTableTr}>
                <td
                  className={`${scrollable ? s.mainTabularDataTableTd : s.TTabularDataTableTd} ${scrollable ? '' : `${s.mainTempWxetTabularDataTableTd} ${s.mainTempWxetTabularDataTableTdBlack}`}`}
                  data-label={data.label}
                >
                  {row.DateTime}
                </td>
                <td className={tdClass} data-label="Solar Rad">
                  {row.solar_display === 0 ? '0' : row.solar_display ?? '-'}
                </td>
                <td className={tdClass} data-label="RH">
                  {row.RH === 0 ? '0' : row.RH ?? '-'}%
                </td>
                <td className={tdClass} data-label="Air Temp">
                  {row.Temp === 0 ? '0' : row.Temp ?? '-'}°F
                </td>
                <td className={tdClass} data-label="Rain">
                  {row.rain_display === 0 ? '0' : row.rain_display ?? '-'}
                </td>
                <td className={tdClass} data-label="Wind">
                  {row.wind_display === 0 ? '0' : row.wind_display ?? '-'}
                </td>
                <td className={tdClass} data-label="Gust">
                  {row.gust_display === 0 ? '0' : row.gust_display ?? '-'}
                </td>
                <td className={tdClass} data-label="Leaf Wet">
                  {row.LW === 0 ? '0' : row.LW ?? '-'}
                </td>
                <td className={tdClass} data-label="GDD">
                  {row.gdd === 0 ? '0' : row.gdd ?? '-'}
                </td>
                <td className={tdClass} data-label="AGDD">
                  {row.agdd === 0 ? '0' : row.agdd ?? '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};