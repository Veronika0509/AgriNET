import { useState } from "react"

/**
 * Custom hook for managing QR scanner state
 * Handles QR code scanning and storing scanned data
 */
export const useQRScanner = () => {
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [isQRScanned, setIsQRScanned] = useState<boolean>(false)
  const [qrTimezone, setQrTimezone] = useState<string>("")
  const [qrCustomFields, setQrCustomFields] = useState<{ [key: string]: any }>({})
  const [qrBudgetLines, setQrBudgetLines] = useState<{ [key: string]: any }>({})
  const [qrRawMetric, setQrRawMetric] = useState<number>(0)
  const [qrDisplayMetric, setQrDisplayMetric] = useState<number>(0)
  const [scannedSensorId, setScannedSensorId] = useState<string>("")

  return {
    showQRScanner,
    setShowQRScanner,
    isQRScanned,
    setIsQRScanned,
    qrTimezone,
    setQrTimezone,
    qrCustomFields,
    setQrCustomFields,
    qrBudgetLines,
    setQrBudgetLines,
    qrRawMetric,
    setQrRawMetric,
    qrDisplayMetric,
    setQrDisplayMetric,
    scannedSensorId,
    setScannedSensorId,
  }
}