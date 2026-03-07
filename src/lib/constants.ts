export const CATEGORIES = [
  { name: "Tools", slug: "tools", icon: "Wrench" },
  { name: "Cameras", slug: "cameras", icon: "Camera" },
  { name: "Outdoor Gear", slug: "outdoor-gear", icon: "Mountain" },
  { name: "Event Equipment", slug: "event-equipment", icon: "PartyPopper" },
  { name: "Electronics", slug: "electronics", icon: "Laptop" },
  { name: "Sports Equipment", slug: "sports-equipment", icon: "Dumbbell" },
] as const;

export const BOOKING_STATUSES = {
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-800" },
  completed: { label: "Completed", color: "bg-blue-100 text-blue-800" },
} as const;

export const DEFAULT_CENTER = { lat: 50.8503, lng: 4.3517 }; // Brussels
export const DEFAULT_ZOOM = 12;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
