// Auth Enums - User Roles
export type UserRole =
  | 'SUPER_ADMIN'    // Super Administrator - full system access
  | 'ADMIN_PWNU'    // Admin PCNU - provincial admin
  | 'PWNU'          // PCNU - provincial organization
  | 'STAFF_PWNU'    // Staff PCNU - provincial staff
  | 'COMMANDER'     // Commander - incident commander
  | 'ADMIN_PCNU'    // Admin PCNU - district admin
  | 'STAFF_PCNU'    // Staff PCNU - district staff
  | 'FIELD_STAFF'   // Field Staff - field personnel
  | 'RELAWAN'       // Volunteer - community volunteer
  | 'PUBLIC';       // Public - general public user