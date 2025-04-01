export const checkPermissions = async () => {
  // Check location permission
  let hasLocationPermission = false
  if ('geolocation' in navigator && navigator.permissions) {
    try {
      const result = await navigator.permissions.query({ name: 'geolocation' })
      hasLocationPermission = result.state === 'granted'
    } catch (error) {
      console.error('Error checking location permission:', error)
    }
  }

  // Check notification permission
  const hasNotificationPermission = 'Notification' in window && Notification.permission === 'granted'

  return {
    hasLocationPermission,
    hasNotificationPermission
  }
}
