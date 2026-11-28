import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
  useIonToast,
} from "@ionic/react";
import { arrowBackOutline, closeCircle, closeOutline, refreshOutline, searchOutline } from "ionicons/icons";
import s from "./style.module.css";
import { getUnitAlarm, runLimited, type UnitAlarm } from "./data/alarmsApi";
import { AlarmEditModal, type AlarmEditTarget } from "./components/AlarmEditModal";
import { useAppContext } from "../../context/AppContext";
import { getSiteList } from "../Map/data/getSiteList";
import { onTempSensorClick } from "../Map/functions/types/temp/onTempSensorClick";
import { onMoistSensorClick } from "../Map/functions/types/moist/onMoistSensorClick";
import { onWxetSensorClick } from "../Map/functions/types/wxet/onWxetSensorClick";

interface SiteMarker {
  id?: string | number;
  sensorId?: string;
  name?: string;
  markerType?: string;
}

interface SiteWithMarkers {
  name: string;
  layers?: { markers?: SiteMarker[] }[];
}

interface AlarmsPageProps {
  setPage: React.Dispatch<React.SetStateAction<number>>;
  siteList: SiteWithMarkers[];
}

/** Unit types that have alarms. EXTL/graphic markers are links, valves have their own settings. */
const ALARM_TYPES: { markerTypes: string[]; key: string; label: string; shortLabel: string }[] = [
  { key: "temp", markerTypes: ["temp-rh-v2", "temp-rh"], label: "Temp RH", shortLabel: "Temp RH" },
  { key: "moist", markerTypes: ["moist-fuel"], label: "Soil Moisture", shortLabel: "Moisture" },
  { key: "wxet", markerTypes: ["wxet", "WXET"], label: "Weather Station", shortLabel: "Weather" },
];

type AlarmState = UnitAlarm | "error" | undefined;

const ALL = "all";

const SetpointCell = ({ alarm, side }: { alarm: UnitAlarm; side: "low" | "high" }) => {
  const value = alarm[`${side}Setpoint`];
  const on = Boolean(alarm[`${side}Enabled`]);
  return (
    <td className={s.cellSetpoint}>
      <span className={s.setpointValue}>{value === null ? "—" : value}</span>
      <span className={on ? s.stateOn : s.stateOff}>{on ? "On" : "Off"}</span>
    </td>
  );
};

const AlarmsPage: React.FC<AlarmsPageProps> = ({ setPage, siteList }) => {
  const history = useHistory();
  const {
    userId,
    setSiteList,
    setChartData,
    setSiteId,
    setSiteName,
    setAdditionalChartData,
    setChartPageType,
    setChartReturnPage,
    setOpenChartAlarm,
    reopenAlarmUnits,
    setReopenAlarmUnits,
  } = useAppContext();
  const [presentToast] = useIonToast();
  const [sitesFailed, setSitesFailed] = useState(false);
  const [typeKey, setTypeKey] = useState<string>(ALL);
  const [alarms, setAlarms] = useState<Record<string, AlarmState>>({});
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<AlarmEditTarget[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const notify = useCallback(
    (message: string, color: "success" | "danger" | "warning" = "success") =>
      presentToast({ message, color, duration: 3000, position: "top" }),
    [presentToast],
  );

  // The site list is normally loaded by the Menu page; opening /alarms directly (or reloading) skips it.
  useEffect(() => {
    if (siteList?.length || !Number(userId)) return;
    let cancelled = false;
    getSiteList(userId).then((response) => {
      if (cancelled) return;
      if ("success" in response && response.success === false) setSitesFailed(true);
      else setSiteList(response.data);
    });
    return () => {
      cancelled = true;
    };
  }, [siteList, userId, setSiteList]);

  const unitsByType = useMemo(() => {
    const result: Record<string, AlarmEditTarget[]> = {};
    ALARM_TYPES.forEach(({ key }) => (result[key] = []));
    const seen = new Set<string>();
    (siteList ?? []).forEach((site) => {
      (site.layers ?? []).forEach((layer) => {
        (layer.markers ?? []).forEach((marker) => {
          const type = ALARM_TYPES.find((t) => t.markerTypes.includes(marker.markerType ?? ""));
          if (!type || !marker.sensorId || seen.has(marker.sensorId)) return;
          seen.add(marker.sensorId);
          result[type.key].push({
            sensorId: marker.sensorId,
            name: marker.name ?? marker.sensorId,
            siteName: site.name,
            mainId: marker.id,
          });
        });
      });
    });
    Object.values(result).forEach((units) =>
      units.sort((a, b) => a.siteName.localeCompare(b.siteName) || a.name.localeCompare(b.name, undefined, { numeric: true })),
    );
    return result;
  }, [siteList]);

  const availableTypes = useMemo(() => ALARM_TYPES.filter(({ key }) => unitsByType[key].length > 0), [unitsByType]);

  const isAll = typeKey === ALL;

  // Fall back to "All" if the chosen type disappears (e.g. after the site list reloads).
  useEffect(() => {
    if (!isAll && !availableTypes.some(({ key }) => key === typeKey)) setTypeKey(ALL);
  }, [availableTypes, typeKey, isAll]);

  const typeOf = useMemo(() => {
    const result: Record<string, string> = {};
    Object.entries(unitsByType).forEach(([key, list]) => list.forEach((u) => (result[u.sensorId] = key)));
    return result;
  }, [unitsByType]);

  const totalUnits = availableTypes.reduce((sum, { key }) => sum + unitsByType[key].length, 0);

  /** Units of the current tab ("All" = every type, in type order). */
  const units = useMemo(
    () => (isAll ? availableTypes.flatMap(({ key }) => unitsByType[key]) : unitsByType[typeKey] ?? []),
    [isAll, availableTypes, unitsByType, typeKey],
  );

  const query = search.trim().toLowerCase();
  const matches = (u: AlarmEditTarget) => !query || `${u.name} ${u.siteName} ${u.sensorId}`.toLowerCase().includes(query);

  /** What the table shows: one group per type on "All", a single group otherwise. Empty groups are dropped. */
  const groups = (isAll ? availableTypes : availableTypes.filter(({ key }) => key === typeKey))
    .map((type) => ({ type, units: unitsByType[type.key].filter(matches) }))
    .filter((group) => group.units.length > 0);
  const visibleUnits = groups.flatMap((group) => group.units);

  // There is no "all alarms for a user" endpoint, so each unit is fetched on its own.
  const loadAlarms = useCallback(async (sensorIds: string[]) => {
    if (sensorIds.length === 0) return;
    setLoading(true);
    const results = await runLimited(sensorIds, 6, getUnitAlarm);
    setAlarms((prev) => {
      const next = { ...prev };
      results.forEach((result, index) => {
        next[sensorIds[index]] = result.status === "fulfilled" ? result.value : "error";
      });
      return next;
    });
    setLoading(false);
  }, []);

  // Load a tab's units the first time it's shown; later refreshes go through the refresh button.
  useEffect(() => {
    loadAlarms(units.filter((u) => alarms[u.sensorId] === undefined).map((u) => u.sensorId));
  }, [units, loadAlarms]); // eslint-disable-line

  const switchType = (key: string) => {
    setTypeKey(key);
    setChecked(new Set());
    setSearch("");
  };

  const toggleChecked = (sensorId: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(sensorId)) next.delete(sensorId);
      else next.add(sensorId);
      return next;
    });

  /** Checkbox state for a set of rows: header "select all" or a type group on "All". */
  const selectionOf = (list: AlarmEditTarget[]) => {
    const selectable = list.filter((u) => typeof alarms[u.sensorId] === "object");
    const all = selectable.length > 0 && selectable.every((u) => checked.has(u.sensorId));
    const some = selectable.some((u) => checked.has(u.sensorId));
    const toggle = () =>
      setChecked((prev) => {
        const next = new Set(prev);
        selectable.forEach((u) => (all ? next.delete(u.sensorId) : next.add(u.sensorId)));
        return next;
      });
    return { all, some, disabled: selectable.length === 0, toggle };
  };

  const headerSelection = selectionOf(visibleUnits);

  const checkedUnits = units.filter((u) => checked.has(u.sensorId));
  const checkedTypes = new Set(checkedUnits.map((u) => typeOf[u.sensorId]));
  // A setpoint means different things per type (°F vs soil moisture), so bulk edits stay within one type.
  const mixedTypes = checkedTypes.size > 1;

  /**
   * Emails/phones are edited in the Chart page's Alarm window, so open that unit's chart
   * with the window already up. Its back arrow returns here (page 8).
   */
  const openContactsOnChart = async (unit: AlarmEditTarget, reopen: AlarmEditTarget[] = [unit]) => {
    setEditing([]);
    setChartReturnPage(8);
    setOpenChartAlarm(true);
    setReopenAlarmUnits(reopen.map((u) => u.sensorId));
    let opened = false;
    const goToChart = (target: number) => {
      opened = true;
      setPage(target);
    };
    // The chart-opening helpers predate the typed context, so their setter types are looser.
    type TempArgs = Parameters<typeof onTempSensorClick>;
    type WxetArgs = Parameters<typeof onWxetSensorClick>;
    try {
      const type = typeOf[unit.sensorId];
      if (type === "temp") {
        await onTempSensorClick(
          history,
          unit.sensorId,
          unit.name,
          setChartData as unknown as TempArgs[3],
          goToChart,
          setSiteId as unknown as TempArgs[5],
          setSiteName,
          setAdditionalChartData as unknown as TempArgs[7],
          setChartPageType as unknown as TempArgs[8],
          userId,
          presentToast as unknown as TempArgs[10],
        );
      } else if (type === "moist") {
        await onMoistSensorClick(
          history, unit.sensorId, unit.mainId, unit.name, setChartData, goToChart, setSiteId, setSiteName,
          setAdditionalChartData, siteList, setChartPageType,
        );
      } else if (type === "wxet") {
        await onWxetSensorClick(
          history,
          unit.sensorId,
          unit.name,
          setChartData as unknown as WxetArgs[3],
          goToChart,
          setSiteId as unknown as WxetArgs[5],
          setSiteName,
          setAdditionalChartData as unknown as WxetArgs[7],
          setChartPageType as unknown as WxetArgs[8],
        );
      }
    } catch (error) {
      console.error("[Alarms] could not open chart for", unit.sensorId, error);
    }
    if (!opened) {
      // Don't let the flags leak into the next time a chart is opened from the map.
      setOpenChartAlarm(false);
      setChartReturnPage(null);
      setReopenAlarmUnits(null);
      notify(`Couldn't open ${unit.name}. Please try again.`, "danger");
    }
  };

  // Back from "Add email or phone": reopen the same edit window (one unit, or the bulk selection)
  // once fresh alarm data (with the new contact) has loaded. Read only at mount, so setting it
  // on the way out doesn't fire here.
  const [reopenTargets, setReopenTargets] = useState(() => reopenAlarmUnits);
  useEffect(() => {
    if (!reopenTargets) return;
    if (reopenTargets.some((id) => alarms[id] === undefined)) return;
    const reopen = units.filter((u) => reopenTargets.includes(u.sensorId) && typeof alarms[u.sensorId] === "object");
    if (reopen.length > 1) setChecked(new Set(reopen.map((u) => u.sensorId)));
    if (reopen.length > 0) setEditing(reopen);
    setReopenTargets(null);
    setReopenAlarmUnits(null);
  }, [reopenTargets, alarms, units, setReopenAlarmUnits]);

  const handleBack = () => {
    setPage(0);
    history.replace("/menu");
  };

  const loadedAlarms = useMemo(() => {
    const result: Record<string, UnitAlarm | undefined> = {};
    Object.entries(alarms).forEach(([id, alarm]) => (result[id] = typeof alarm === "object" ? alarm : undefined));
    return result;
  }, [alarms]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={handleBack}>
              <IonIcon slot="icon-only" icon={arrowBackOutline} />
            </IonButton>
          </IonButtons>
          <IonTitle>Alarms</IonTitle>
        </IonToolbar>
        {availableTypes.length > 0 && (
          <div className={s.filters}>
            <label className={s.search}>
              <IonIcon icon={searchOutline} className={s.searchIcon} aria-hidden="true" />
              <input
                className={s.searchInput}
                type="search"
                value={search}
                placeholder="Search unit or site"
                aria-label="Search by unit name or site"
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" className={s.searchClear} onClick={() => setSearch("")} aria-label="Clear search">
                  <IonIcon icon={closeCircle} />
                </button>
              )}
            </label>
            {availableTypes.length > 1 && (
              <div className={s.typeChips} role="tablist" aria-label="Unit type">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isAll}
                  title="All units, grouped by type"
                  className={`${s.typeChip} ${isAll ? s.typeChipActive : ""}`}
                  onClick={() => !isAll && switchType(ALL)}
                >
                  All
                  <span className={s.typeChipCount}>{totalUnits}</span>
                </button>
                {availableTypes.map(({ key, label, shortLabel }) => (
                  <button
                    key={key}
                    type="button"
                    role="tab"
                    aria-selected={key === typeKey}
                    title={label}
                    className={`${s.typeChip} ${key === typeKey ? s.typeChipActive : ""}`}
                    onClick={() => key !== typeKey && switchType(key)}
                  >
                    {shortLabel}
                    <span className={s.typeChipCount}>{unitsByType[key].length}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </IonHeader>
      <IonContent className={`${s.content} ${checkedUnits.length > 0 ? s.contentWithBar : ""}`}>
        <div className={s.page}>
          {availableTypes.length === 0 ? (
            <p className={s.empty}>{sitesFailed ? "Couldn't load your units. Please try again." : siteList?.length ? "No units with alarms." : "Loading units…"}</p>
          ) : (
            <>
              <table className={s.table}>
                <thead>
                  <tr>
                    <th className={s.cellCheck}>
                      {!isAll && (
                        <IonCheckbox
                          checked={headerSelection.all}
                          indeterminate={!headerSelection.all && headerSelection.some}
                          disabled={headerSelection.disabled}
                          onIonChange={headerSelection.toggle}
                          aria-label="Select all"
                        />
                      )}
                    </th>
                    <th>Unit</th>
                    <th className={s.cellSetpoint}>Low</th>
                    <th className={s.cellSetpoint}>High</th>
                  </tr>
                </thead>
                <tbody>
                  {groups.map((group) => {
                    const groupSelection = selectionOf(group.units);
                    return (
                      <React.Fragment key={group.type.key}>
                        {isAll && (
                          <tr className={s.groupRow}>
                            <td className={s.cellCheck}>
                              <IonCheckbox
                                checked={groupSelection.all}
                                indeterminate={!groupSelection.all && groupSelection.some}
                                disabled={groupSelection.disabled}
                                onIonChange={groupSelection.toggle}
                                aria-label={`Select all ${group.type.label}`}
                              />
                            </td>
                            <td colSpan={3}>
                              <span className={s.groupTitle}>{group.type.label}</span>
                              <span className={s.groupCount}>{group.units.length}</span>
                            </td>
                          </tr>
                        )}
                        {group.units.map((unit) => {
                          const alarm = alarms[unit.sensorId];
                          const loaded = typeof alarm === "object";
                          const isChecked = checked.has(unit.sensorId);
                          return (
                            <tr
                              key={unit.sensorId}
                              className={`${s.row} ${isChecked ? s.rowChecked : ""} ${loaded ? s.rowClickable : ""}`}
                              onClick={() => loaded && setEditing([unit])}
                            >
                              <td className={s.cellCheck} onClick={(e) => e.stopPropagation()}>
                                <IonCheckbox
                                  checked={isChecked}
                                  disabled={!loaded}
                                  onIonChange={() => toggleChecked(unit.sensorId)}
                                  aria-label={`Select ${unit.name}`}
                                />
                              </td>
                              <td>
                                <span className={s.unitName}>{unit.name}</span>
                                <span className={s.unitSite}>{unit.siteName}</span>
                              </td>
                              {loaded ? (
                                <>
                                  <SetpointCell alarm={alarm} side="low" />
                                  <SetpointCell alarm={alarm} side="high" />
                                </>
                              ) : (
                                <td colSpan={2} className={s.cellStatus}>
                                  {alarm === "error" ? "Couldn't load" : <IonSpinner name="dots" className={s.smallSpinner} />}
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  {visibleUnits.length === 0 && (
                    <tr>
                      <td colSpan={4} className={s.empty}>
                        No units match “{search}”.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              <p className={s.tableHint}>Tap a unit to edit its alarm, or check several units to edit them together.</p>
            </>
          )}
        </div>
      </IonContent>

      {checkedUnits.length > 0 && (
        <div className={s.selectionBar}>
          <IonButton fill="clear" className={s.clearButton} onClick={() => setChecked(new Set())} aria-label="Clear selection">
            <IonIcon slot="icon-only" icon={closeOutline} />
          </IonButton>
          <span className={s.selectionCount}>
            {checkedUnits.length} selected
            {mixedTypes && <span className={s.selectionNote}>Pick one type to edit together</span>}
          </span>
          <IonButton className={s.solidButton} onClick={() => setEditing(checkedUnits)} disabled={mixedTypes}>
            Edit selected
          </IonButton>
        </div>
      )}

      <IonButton
        shape="round"
        className={`${s.refreshFab} ${checkedUnits.length > 0 ? s.refreshFabRaised : ""}`}
        onClick={() => loadAlarms(units.map((u) => u.sensorId))}
        disabled={loading}
        aria-label="Refresh"
      >
        {loading ? <IonSpinner name="crescent" className={s.fabSpinner} /> : <IonIcon slot="icon-only" icon={refreshOutline} />}
      </IonButton>

      <AlarmEditModal
        targets={editing}
        alarms={loadedAlarms}
        onClose={() => setEditing([])}
        onUpdated={(updates) => setAlarms((prev) => ({ ...prev, ...updates }))}
        notify={notify}
        onAddContact={openContactsOnChart}
      />
    </IonPage>
  );
};

export default AlarmsPage;
