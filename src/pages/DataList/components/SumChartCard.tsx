import React, { useEffect, useRef, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import * as am5 from '@amcharts/amcharts5';
import { getSumChartData } from '../../Chart/data/types/moist/getSumChartData';
import { createAdditionalChart } from '../../Chart/functions/types/moist/createAdditionalChart';

interface SumChartCardProps {
  sensorId: string;
  /** Sensor label, shown in the chart caption so the chart reads as part of this sensor's table. */
  label?: string;
  onOpenChart?: () => void;
}

const noop = () => {};

// Colour of the "Sum Average" column in MoistTable / the sum series stroke (0x6771DC).
// Reused here so the chart panel visually ties back to that table.
const SUM_ACCENT = '#6771dc';

/**
 * Compact read-only "Summed graph" chart shown as an attached panel under each
 * Soil Moisture table in the Data List. Reuses the Chart page's sum-chart builder
 * (createAdditionalChart with chartType "sum"), without comments / add-comment
 * interactions. Clicking the chart opens the full chart page for this sensor.
 */
export const SumChartCard: React.FC<SumChartCardProps> = ({ sensorId, label, onOpenChart }) => {
  const rootRef = useRef<am5.Root | null>(null);
  const divId = `dataListSumChart-${sensorId}`;
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const build = async () => {
      setLoading(true);
      setEmpty(false);
      try {
        const response = await getSumChartData(sensorId, false);
        const chartData = response?.data?.data ?? [];
        const budgetLines = response?.data?.budgetLines ?? [];

        if (cancelled) return;

        if (!chartData.length) {
          setEmpty(true);
          setLoading(false);
          return;
        }

        setLoading(false);

        // Wait for the target div to be rendered after the spinner is removed.
        const renderWhenReady = (attempt = 0) => {
          if (cancelled) return;
          if (!document.getElementById(divId)) {
            if (attempt < 20) setTimeout(() => renderWhenReady(attempt + 1), 50);
            return;
          }
          createAdditionalChart(
            'sum',
            chartData,
            rootRef,
            noop,
            noop,
            sensorId,
            noop,
            false, // moistAddCommentItemShowed
            [], // moistComments
            '', // userId
            noop, // updateChart
            false, // isMoistCommentsShowed
            budgetLines,
            false, // historicMode
            false, // showForecast
            undefined, // setSumColor
            undefined, // linesCount
            undefined, // metric
            undefined, // setSoilTempColor
            divId,
          );
        };

        renderWhenReady();
      } catch (err) {
        console.error('[SumChartCard] Failed to load sum chart data:', err);
        if (!cancelled) {
          setEmpty(true);
          setLoading(false);
        }
      }
    };

    build();

    return () => {
      cancelled = true;
      if (rootRef.current) {
        rootRef.current.dispose();
        rootRef.current = null;
      }
    };
  }, [sensorId, divId]);

  if (empty) return null;

  return (
    <div style={{ borderTop: `1px solid ${SUM_ACCENT}33`, background: '#f6f7fd' }}>
      {/* Caption ties the chart to the table above it */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 12px',
        }}
      >
        <span
          style={{
            width: '4px',
            height: '15px',
            borderRadius: '2px',
            background: SUM_ACCENT,
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#3b3f87' }}>
          Summed graph
        </span>
        {label && (
          <span
            style={{
              fontSize: '11px',
              color: '#7a7fb5',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            · {label}
          </span>
        )}
        {onOpenChart && (
          <button
            type="button"
            onClick={onOpenChart}
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '2px',
              padding: '3px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              background: SUM_ACCENT,
              border: 'none',
              borderRadius: '999px',
              cursor: 'pointer',
            }}
          >
            Open ›
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '12px' }}>
          <IonSpinner name="crescent" />
        </div>
      ) : (
        <div
          role="button"
          title="Open full chart"
          onClick={onOpenChart}
          style={{
            position: 'relative',
            width: '100%',
            padding: '0 6px 8px',
            cursor: onOpenChart ? 'pointer' : 'default',
          }}
        >
          <div id={divId} style={{ width: '100%', height: '210px' }} />
          {/* Transparent overlay so a click anywhere on the chart opens the full chart page */}
          {onOpenChart && <div style={{ position: 'absolute', inset: 0 }} />}
        </div>
      )}
    </div>
  );
};
