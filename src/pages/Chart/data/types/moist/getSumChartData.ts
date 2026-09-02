import axios from "axios";

export const getSumChartData = async (sensorId: string, historicMode: boolean, daysProps?: number, endDate?: string) => {
  const params = (daysProps && endDate)
    ? {
      sensorId: sensorId,
      days: daysProps,
      endDate: endDate,
      includeHistoricalData: historicMode,
      nocache: Date.now()
    }
    : {
      sensorId: sensorId,
      days: 14,
      includeHistoricalData: historicMode,
      nocache: Date.now()
    }

  console.log('[moist sum chart] request params:', params)

  try {
    const response = await axios.get('https://app.agrinet.us/api/chart/m-sum?v=43', { params })
    console.log('[moist sum chart] response data:', response.data)
    return response
  } catch (err) {
    const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string }
    console.error(
      `[moist sum chart] request FAILED for sensorId=${sensorId}`,
      'status:', axiosErr.response?.status,
      'body:', axiosErr.response?.data ?? axiosErr.message
    )
    throw err
  }
}
