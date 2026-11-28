import { useEffect, useState } from "react";
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { addOutline, closeOutline } from "ionicons/icons";
import s from "../style.module.css";
import {
  getUnitAlarm,
  getUnitFieldLabels,
  hasContact,
  runLimited,
  setSetpoint,
  setSetpointEnabled,
  setSetpointField,
  type SetpointSide,
  type UnitAlarm,
} from "../data/alarmsApi";

type Notify = (message: string, color?: "success" | "danger" | "warning") => void;
type EnabledChoice = "keep" | "on" | "off";

export interface AlarmEditTarget {
  sensorId: string;
  name: string;
  siteName: string;
  /** Marker id from the site list (the moisture chart needs it). */
  mainId?: string | number;
}

interface AlarmEditModalProps {
  /** One unit → full editor; several → the same values applied to all of them. Empty → closed. */
  targets: AlarmEditTarget[];
  alarms: Record<string, UnitAlarm | undefined>;
  onClose: () => void;
  onUpdated: (updates: Record<string, UnitAlarm>) => void;
  notify: Notify;
  /**
   * Opens the unit's chart page with its Alarm window, where emails/phones are managed.
   * `reopen` = units whose edit window comes back afterwards (the whole bulk selection).
   */
  onAddContact: (target: AlarmEditTarget, reopen: AlarmEditTarget[]) => void;
}

interface SideDraft {
  value: string;
  field: string;
  enabled: EnabledChoice;
}

const SIDES: { side: SetpointSide; label: string }[] = [
  { side: "low", label: "Low alarm" },
  { side: "high", label: "High alarm" },
];

/** How many selected units are listed before "+N more". */
const PREVIEW_COUNT = 6;

const emptyDraft: SideDraft = { value: "", field: "", enabled: "keep" };

const draftFrom = (alarm: UnitAlarm | undefined, side: SetpointSide): SideDraft =>
  alarm
    ? {
        value: alarm[`${side}Setpoint`] === null ? "" : String(alarm[`${side}Setpoint`]),
        field: alarm[`${side}Field`] ?? "",
        enabled: alarm[`${side}Enabled`] ? "on" : "off",
      }
    : emptyDraft;

export const AlarmEditModal = ({ targets, alarms, onClose, onUpdated, notify, onAddContact }: AlarmEditModalProps) => {
  const isOpen = targets.length > 0;
  const single = targets.length === 1 ? targets[0] : null;
  const singleAlarm = single ? alarms[single.sensorId] : undefined;

  const [drafts, setDrafts] = useState<Record<SetpointSide, SideDraft>>({ low: emptyDraft, high: emptyDraft });
  const [fieldLabels, setFieldLabels] = useState<Record<string, string> | null>(null);
  const [saving, setSaving] = useState(false);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [showAllTargets, setShowAllTargets] = useState(false);

  // Reset the form whenever the modal opens for a new set of units.
  const targetKey = targets.map((t) => t.sensorId).join(",");
  useEffect(() => {
    if (!isOpen) return;
    setSkipped([]);
    setShowAllTargets(false);
    setDrafts({ low: draftFrom(singleAlarm, "low"), high: draftFrom(singleAlarm, "high") });
    setFieldLabels(null);
    if (!single) return;
    let cancelled = false;
    getUnitFieldLabels(single.sensorId)
      .then((labels) => !cancelled && setFieldLabels(labels))
      .catch(() => !cancelled && setFieldLabels({}));
    return () => {
      cancelled = true;
    };
    // singleAlarm is read once per opening on purpose: the form must not reset while editing.
  }, [targetKey, isOpen]); // eslint-disable-line

  const update = (side: SetpointSide, patch: Partial<SideDraft>) =>
    setDrafts((prev) => ({ ...prev, [side]: { ...prev[side], ...patch } }));

  const canEnableSingle = singleAlarm ? hasContact(singleAlarm) : true;
  // Bulk: units whose alarms can't be turned on because they have nowhere to send them.
  const withoutContact = single ? [] : targets.filter((t) => alarms[t.sensorId] && !hasContact(alarms[t.sensorId] as UnitAlarm));

  const nothingToApply =
    !single && SIDES.every(({ side }) => drafts[side].value.trim() === "" && drafts[side].enabled === "keep");

  /** Changes for one unit, compared with what it has now. Returns false if turning on had to be skipped. */
  const applyToUnit = async (sensorId: string): Promise<boolean> => {
    const current = alarms[sensorId];
    let complete = true;
    for (const { side } of SIDES) {
      const draft = drafts[side];
      const before = draftFrom(current, side);
      if (single && draft.field && draft.field !== before.field) {
        await setSetpointField(sensorId, side, draft.field);
      }
      // The server has no "clear setpoint" call, so an empty box leaves the value as is.
      if (draft.value.trim() !== "" && (!single || Number(draft.value) !== Number(before.value))) {
        await setSetpoint(sensorId, side, Number(draft.value));
      }
      if (draft.enabled === "keep" || draft.enabled === before.enabled) continue;
      const turnOn = draft.enabled === "on";
      const hasValue = draft.value.trim() !== "" || (current && current[`${side}Setpoint`] !== null);
      // Same rule as the Chart page: no alarm without somewhere to send it (and a value to watch).
      if (turnOn && current && (!hasContact(current) || !hasValue)) {
        complete = false;
        continue;
      }
      await setSetpointEnabled(sensorId, side, turnOn);
    }
    return complete;
  };

  const save = async () => {
    for (const { side, label } of SIDES) {
      const raw = drafts[side].value.trim();
      if (raw !== "" && !Number.isFinite(Number(raw))) {
        notify(`${label}: value must be a number`, "warning");
        return;
      }
      if (single && drafts[side].enabled === "on" && raw === "") {
        notify(`${label}: enter a value before turning it on`, "warning");
        return;
      }
    }

    setSaving(true);
    const ids = targets.map((t) => t.sensorId);
    const results = await runLimited(ids, 4, async (sensorId) => {
      const complete = await applyToUnit(sensorId);
      return { complete, alarm: await getUnitAlarm(sensorId) };
    });

    const updates: Record<string, UnitAlarm> = {};
    const failed: string[] = [];
    const notTurnedOn: string[] = [];
    results.forEach((result, index) => {
      const target = targets[index];
      if (result.status === "fulfilled") {
        updates[target.sensorId] = result.value.alarm;
        if (!result.value.complete) notTurnedOn.push(target.name);
      } else {
        failed.push(target.name);
      }
    });
    onUpdated(updates);
    setSaving(false);

    if (failed.length > 0) {
      notify(`Could not save: ${failed.join(", ")}. Please try again.`, "danger");
      return;
    }
    if (notTurnedOn.length > 0) {
      // Keep the sheet open so the user sees which units weren't turned on.
      setSkipped(notTurnedOn);
      notify("Saved, but some alarms couldn't be turned on", "warning");
      return;
    }
    notify(single ? "Alarm saved" : `Saved for ${ids.length} units`, "success");
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} initialBreakpoint={1} breakpoints={[0, 1]} className={s.modal}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{single ? single.name : `${targets.length} units selected`}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} aria-label="Close">
              <IonIcon slot="icon-only" icon={closeOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className={s.modalContent}>
        <div className={s.form}>
          {single ? (
            <p className={s.formSubtitle}>
              {single.siteName} · {single.sensorId}
            </p>
          ) : (
            <>
              <div className={s.selectedUnits}>
                {(showAllTargets ? targets : targets.slice(0, PREVIEW_COUNT)).map((target) => (
                  <span key={target.sensorId} className={s.selectedChip} title={`${target.name} · ${target.sensorId} · ${target.siteName}`}>
                    {target.name}
                    <span className={s.selectedChipId}>{target.sensorId}</span>
                  </span>
                ))}
                {targets.length > PREVIEW_COUNT && (
                  <button type="button" className={s.selectedMore} onClick={() => setShowAllTargets((v) => !v)}>
                    {showAllTargets ? "Show less" : `+${targets.length - PREVIEW_COUNT} more`}
                  </button>
                )}
              </div>
              <p className={s.formSubtitle}>Empty fields and “No change” keep each unit’s current setting.</p>
            </>
          )}

          {SIDES.map(({ side, label }) => (
            <section key={side} className={s.formSection}>
              <h3 className={s.formSectionTitle}>{label}</h3>

              {single && (
                <div className={s.formRow}>
                  <span className={s.formLabel}>Field</span>
                  <IonSelect
                    className={s.formControl}
                    interface="popover"
                    value={drafts[side].field}
                    placeholder={fieldLabels === null ? "Loading…" : "—"}
                    disabled={!fieldLabels || Object.keys(fieldLabels).length === 0}
                    aria-label={`${label} field`}
                    onIonChange={(e) => update(side, { field: e.detail.value })}
                  >
                    {fieldLabels &&
                      Object.entries(fieldLabels).map(([key, fieldLabel]) => (
                        <IonSelectOption key={key} value={key}>
                          {fieldLabel}
                        </IonSelectOption>
                      ))}
                  </IonSelect>
                </div>
              )}

              <div className={s.formRow}>
                <span className={s.formLabel}>Setpoint</span>
                <IonInput
                  className={s.formControl}
                  type="number"
                  inputmode="decimal"
                  value={drafts[side].value}
                  placeholder={single ? "Enter value" : "No change"}
                  aria-label={`${label} setpoint`}
                  onIonInput={(e) => update(side, { value: String(e.detail.value ?? "") })}
                />
              </div>

              <div className={s.formRow}>
                <span className={s.formLabel}>Alarm</span>
                {single ? (
                  <div className={s.formToggle}>
                    <span className={drafts[side].enabled === "on" ? s.stateOn : s.stateOff}>
                      {drafts[side].enabled === "on" ? "On" : "Off"}
                    </span>
                    <IonToggle
                      checked={drafts[side].enabled === "on"}
                      disabled={!canEnableSingle && drafts[side].enabled !== "on"}
                      aria-label={`${label} on`}
                      onIonChange={(e) => update(side, { enabled: e.detail.checked ? "on" : "off" })}
                    />
                  </div>
                ) : (
                  <IonSelect
                    className={s.formControl}
                    interface="popover"
                    value={drafts[side].enabled}
                    aria-label={`${label} on or off`}
                    onIonChange={(e) => update(side, { enabled: e.detail.value })}
                  >
                    <IonSelectOption value="keep">No change</IonSelectOption>
                    <IonSelectOption value="on">Turn on</IonSelectOption>
                    <IonSelectOption value="off">Turn off</IonSelectOption>
                  </IonSelect>
                )}
              </div>
            </section>
          ))}

          {single && !canEnableSingle && (
            <div className={s.hint}>
              <span>This unit has no email or phone number, so its alarms can&apos;t be turned on.</span>
              <IonButton fill="outline" size="small" className={s.hintButton} onClick={() => onAddContact(single, [single])}>
                Add email or phone
              </IonButton>
            </div>
          )}
          {withoutContact.length > 0 && (
            <div className={s.hint}>
              <span>
                No email or phone number on {withoutContact.length === targets.length ? "any of these units" : `${withoutContact.length} of ${targets.length} units`}, so
                their alarms can&apos;t be turned on:
              </span>
              <span className={s.hintSub}>Tap a unit to add an email or phone:</span>
              <div className={s.hintUnits}>
                {withoutContact.map((t) => (
                  <button
                    key={t.sensorId}
                    type="button"
                    className={s.addContactChip}
                    onClick={() => onAddContact(t, targets)}
                    aria-label={`Add email or phone for ${t.name}`}
                  >
                    <IonIcon icon={addOutline} aria-hidden="true" />
                    {t.name}
                    <span className={s.selectedChipId}>{t.sensorId}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
          {skipped.length > 0 && (
            <p className={s.hint}>Not turned on (no email/phone or no setpoint): {skipped.join(", ")}</p>
          )}

          <div className={s.formActions}>
            <IonButton fill="outline" className={s.outlineButton} onClick={onClose} disabled={saving}>
              Cancel
            </IonButton>
            <IonButton className={s.solidButton} onClick={save} disabled={saving || nothingToApply}>
              {saving ? <IonSpinner name="crescent" /> : single ? "Save" : `Apply to ${targets.length}`}
            </IonButton>
          </div>
        </div>
      </IonContent>
    </IonModal>
  );
};
