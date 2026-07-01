export type RepairCategory = 
  | 'SCREEN_REPLACEMENT'
  | 'BATTERY_REPLACEMENT'
  | 'CAMERA_REPAIR'
  | 'CHARGING_PORT'
  | 'SPEAKER_REPAIR'
  | 'MICROPHONE_REPAIR'
  | 'SOFTWARE_ISSUE'
  | 'WATER_DAMAGE'
  | 'MOTHERBOARD_REPAIR'
  | 'OTHER';

export type RequestStatus = 
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'QUOTATION_SENT'
  | 'WAITING_CUSTOMER_RESPONSE'
  | 'APPOINTMENT_CONFIRMED'
  | 'REPAIR_IN_PROGRESS'
  | 'COMPLETED';

export interface SelectedServiceCenter {
  id: number;
  googlePlaceId: string;
  name: string;
  address: string;
  phone?: string;
  rating?: number;
  latitude: number;
  longitude: number;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RepairRequestImage {
  id: number;
  imageUrl: string;
  createdAt: string;
}

export interface RepairRequest {
  id: number;
  userId: number;
  brand: string;
  model: string;
  repairCategory: RepairCategory;
  title: string;
  description: string;
  customerLatitude: number;
  customerLongitude: number;
  customerAddress: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  images?: RepairRequestImage[];
  selectedServiceCenters?: SelectedServiceCenter[];
  user?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
}

export interface CreateRepairRequest {
  brand: string;
  model: string;
  repairCategory: RepairCategory;
  title: string;
  description: string;
  customerLatitude: number;
  customerLongitude: number;
  customerAddress: string;
  serviceCenter: {
    googlePlaceId: string;
    name: string;
    address: string;
    phone?: string;
    rating?: number;
    latitude: number;
    longitude: number;
  };
}

export interface UpdateRepairRequest {
  brand?: string;
  model?: string;
  repairCategory?: RepairCategory;
  title?: string;
  description?: string;
  customerLatitude?: number;
  customerLongitude?: number;
  customerAddress?: string;
}

export interface RepairRequestFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: RequestStatus;
}

export interface PaginatedResponse<T> {
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  data: T[];
}