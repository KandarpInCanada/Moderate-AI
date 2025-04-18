export interface UserDetails {
  UserId: string
  Email: string
  FirstName: string
  LastName: string
  ProfilePicture?: string
  Provider: string
  LastLogin: string
  CreatedAt: string
  UpdatedAt: string
  Settings?: UserSettings
}

export interface UserSettings {
  Theme?: "light" | "dark" | "system"
  NotificationsEnabled?: boolean
  EmailNotifications?: boolean
  DefaultView?: "grid" | "list"
}
