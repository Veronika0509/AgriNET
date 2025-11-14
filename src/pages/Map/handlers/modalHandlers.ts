/**
 * Modal Handlers - Functions for managing modal dialogs
 */

export interface SensorModalHandlers {
  handleCloseSensorModal: () => void
  handleSensorSelect: (sensor: any) => void
}

export interface TimezoneModalHandlers {
  handleCloseTimezoneModal: () => void
  handleTimezoneSelect: (timezone: string) => void
}

export interface PurchaseAlertOptions {
  presentAlert: (options: any) => void
}

/**
 * Creates sensor modal handlers
 */
export const createSensorModalHandlers = (
  setIsSensorModalOpen: (open: boolean) => void,
  setSelectedSensor: (sensor: any) => void,
  setSelectedMoistureSensor: ((sensor: any) => void) | undefined,
  setPage: (page: number) => void,
): SensorModalHandlers => {
  return {
    handleCloseSensorModal: () => {
      setIsSensorModalOpen(false)
    },

    handleSensorSelect: (sensor: any) => {
      setSelectedSensor(sensor)
      setIsSensorModalOpen(false)

      // Save selected sensor to global state and navigate to VirtualValve page
      if (setSelectedMoistureSensor) {
        setSelectedMoistureSensor(sensor)
      }
      setPage(3)
    },
  }
}

/**
 * Creates timezone modal handlers
 */
export const createTimezoneModalHandlers = (
  setIsTimezoneModalOpen: (open: boolean) => void,
  setSelectedTimezone: (timezone: string) => void,
  setPage: (page: number) => void,
): TimezoneModalHandlers => {
  return {
    handleCloseTimezoneModal: () => {
      setIsTimezoneModalOpen(false)
    },

    handleTimezoneSelect: (timezone: string) => {
      setSelectedTimezone(timezone)
      setIsTimezoneModalOpen(false)
      // Navigate to page 3 after timezone selection
      setPage(3)
    },
  }
}

/**
 * Shows purchase request alert
 */
export const showPurchaseRequestAlert = (options: PurchaseAlertOptions) => {
  const { presentAlert } = options

  presentAlert({
    header: "Purchase Request",
    message: "This selection will place an order for equipment. Your dealer will contact you shortly. Thanks.",
    buttons: [
      {
        text: "THANKS",
        role: "confirm",
      },
    ],
  })
}
