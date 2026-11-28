import axios from "axios";

/**
 * Same /api/alarm endpoints the Chart page's Alarm tab uses
 * (src/pages/Chart/components/Alarm/data), as promises that reject on failure,
 * so the Alarms page can report per-unit results for bulk edits.
 */
const ALARM_API = "https://app.agrinet.us/api/alarm";

export interface UnitAlarm {
  highSetpoint: number | null;
  lowSetpoint: number | null;
  highEnabled: boolean | null;
  lowEnabled: boolean | null;
  emailsAndPhoneNumbers: (string | null)[];
  lowField: string | null;
  lowFieldLabel: string | null;
  highField: string | null;
  highFieldLabel: string | null;
}

export type SetpointSide = "low" | "high";

export const hasContact = (alarm: UnitAlarm): boolean =>
  (alarm.emailsAndPhoneNumbers ?? []).some((contact) => contact !== null && contact !== "");

export const getUnitAlarm = async (sensorId: string): Promise<UnitAlarm> => {
  const response = await axios.get<UnitAlarm>(`${ALARM_API}?v=43`, {
    params: { sensorId, "do-not-catch-error": "" },
  });
  return response.data;
};

/** Field key → label for the "which value to watch" picker, e.g. { FTemp: "Temp" }. */
export const getUnitFieldLabels = async (sensorId: string): Promise<Record<string, string>> => {
  const response = await axios.get<Record<string, string>>(`${ALARM_API}/field-labels?v=43`, {
    params: { sensorId, "do-not-catch-error": "" },
  });
  return response.data;
};

// The POST endpoints answer with the unit's updated alarm settings.
const post = async (path: string): Promise<Partial<UnitAlarm>> => {
  const response = await axios.post<Partial<UnitAlarm>>(`${ALARM_API}/${path}?do-not-catch-error`);
  return response.data ?? {};
};

export const setSetpoint = (sensorId: string, side: SetpointSide, value: number) =>
  post(`${encodeURIComponent(sensorId)}/${side}-setpoint/${value}`);

export const setSetpointEnabled = (sensorId: string, side: SetpointSide, enabled: boolean) =>
  post(`${encodeURIComponent(sensorId)}/${side}-enabled/${enabled}`);

export const setSetpointField = (sensorId: string, side: SetpointSide, field: string) =>
  post(`${encodeURIComponent(sensorId)}/${side}-field/${encodeURIComponent(field)}`);

/** Runs tasks with at most `limit` in flight, so a long unit list doesn't flood the server. */
export const runLimited = async <T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<PromiseSettledResult<R>[]> => {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const index = next++;
      try {
        results[index] = { status: "fulfilled", value: await task(items[index]) };
      } catch (reason) {
        results[index] = { status: "rejected", reason };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};
