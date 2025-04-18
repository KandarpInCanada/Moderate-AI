import type { Notification } from "@/context/notifications-context"

// Function to format notification timestamps in a user-friendly way
export function formatNotificationTime(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()

  // Convert to seconds, minutes, hours, days
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHours = Math.floor(diffMin / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSec < 60) {
    return "just now"
  } else if (diffMin < 60) {
    return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
  } else {
    // Format as date for older notifications
    return date.toLocaleDateString()
  }
}

// Function to get notification icon based on type
export function getNotificationTypeIcon(type: Notification["type"]): string {
  switch (type) {
    case "success":
      return "check-circle"
    case "warning":
      return "alert-triangle"
    case "error":
      return "alert-circle"
    case "info":
    default:
      return "info"
  }
}

// Function to get notification color based on type
export function getNotificationTypeColor(type: Notification["type"]): string {
  switch (type) {
    case "success":
      return "green"
    case "warning":
      return "yellow"
    case "error":
      return "red"
    case "info":
    default:
      return "blue"
  }
}
