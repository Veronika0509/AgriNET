import React, { useEffect, useRef, useState } from 'react';
import { IonSpinner } from '@ionic/react';
import * as am5 from '@amcharts/amcharts5';
import { getSumChartData } from '../../Chart/data/types/moist/getSumChartData';
import { createAdditionalChart } from '../../Chart/functions/types/moist/createAdditionalChart';

interface SumChartCardProps {
  sensorId: string;
  onOpenChart?: () => void;
  /** Reports whether a chart is actually shown (false = no data / load error), so the
   *  parent can skip the card styling and just show the plain table. */
  onChartVisibilityChange?: (visible: boolean) => void;
}

const noop = () => {};

// Colour of the "Sum Average" column in MoistTable / the sum series stroke (0x6771DC).
// Reused here so the graph section visually ties back to that table.
const SUM_ACCENT = '#6771dc';

// On large screens the Data List has plenty of room, so keep the summed graph
// a bit smaller (narrower + shorter). Small/medium screens stay full width.
const LARGE_SCREEN_MIN_WIDTH = 1024;

/**
 * Read-only "Summed graph" chart shown right under a Soil Moisture table in the
 * Data List. Reuses the Chart page's sum-chart builder (createAdditionalChart with
 * chartType "sum"), without comments / add-comment interactions. Clicking it opens
 * the full chart page for this sensor. Renders nothing when there is no sum data.
 */
export const SumChartCard: React.FC<SumChartCardProps> = ({
  sensorId,
  onOpenChart,
  onChartVisibilityChange,
}) => {
  const rootRef = useRef<am5.Root | null>(null);
  const divId = `dataListSumChart-${sensorId}`;
  const [loading, setLoading] = useState(true);
  const [empty, setEmpty] = useState(false);
  const [isLargeScreen] = useState(window.innerWidth >= LARGE_SCREEN_MIN_WIDTH);

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
          onChartVisibilityChange?.(false);
          return;
        }

        setLoading(false);
        onChartVisibilityChange?.(true);

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
        console.error(`[SumChartCard] Failed to load sum chart data for sensorId=${sensorId}:`, err);
        if (!cancelled) {
          setEmpty(true);
          setLoading(false);
          onChartVisibilityChange?.(false);
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

  // Tinted section attached to the bottom of the sensor card so the graph clearly
  // belongs to the table above it.
  return (
    <div
      style={{
        borderTop: '1px solid #ececf2',
        background: '#fafafc',
        padding: '9px 12px 12px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
        <span style={{ width: '4px', height: '14px', borderRadius: '2px', background: SUM_ACCENT, flexShrink: 0 }} />
        <span style={{ fontSize: '12px', fontWeight: 600, color: '#3c3f6b' }}>Summed graph</span>
        {onOpenChart && !loading && (
          <button
            type="button"
            onClick={onOpenChart}
            style={{
              marginLeft: 'auto',
              flexShrink: 0,
              padding: '3px 9px',
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
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <IonSpinner name="crescent" style={{ width: '20px', height: '20px' }} />
        </div>
      ) : (
        <div
          role="button"
          title="Open full chart"
          onClick={onOpenChart}
          style={{
            position: 'relative',
            width: '100%',
            maxWidth: isLargeScreen ? '620px' : undefined,
            margin: isLargeScreen ? '0 auto' : undefined,
            cursor: onOpenChart ? 'pointer' : 'default',
          }}
        >
          <div
            id={divId}
            style={{
              width: '100%',
              height: isLargeScreen ? '240px' : '300px',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          />
          {/* Transparent overlay so a click anywhere on the chart opens the full chart page */}
          {onOpenChart && <div style={{ position: 'absolute', inset: 0 }} />}
        </div>
      )}
    </div>
  );
};
