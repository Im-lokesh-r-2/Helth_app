export type Role = 'patient' | 'doctor' | 'ambulance' | 'admin';

export type AppointmentStatus = 'pending' | 'upcoming' | 'confirmed' | 'completed' | 'cancelled' | 'in-progress';
export type ConsultationType = 'video' | 'clinic' | 'home';
export type DoctorStatus = 'online' | 'busy' | 'offline';
export type LabReportStatus = 'ready' | 'pending';
export type AmbulanceStatus = 'requested' | 'accepted' | 'enroute' | 'arrived' | 'transporting' | 'completed' | 'cancelled' | 'offline' | 'online';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Profile {
  id: string;
  role: Role;
  full_name: string;
  phone: string;
  avatar_url: string;
  age: number | null;
  gender: string | null;
  blood_group: string | null;
  location: string | null;
  email: string | null;
  is_approved: boolean;
  address_lat: number | null;
  address_lng: number | null;
}

export interface Doctor {
  id: string;
  user_id: string;
  specialty: string;
  qualifications: string;
  hospital: string;
  rating: number;
  review_count: number;
  experience: number;
  fee: number;
  status: DoctorStatus;
  about: string;
  languages: string[];
  next_slot: string;
  created_at: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  date: string;
  time: string;
  type: ConsultationType;
  status: AppointmentStatus;
  fee: number;
  reason: string;
  created_at: string;
  doctor?: Doctor;
  patient?: Profile;
}

export interface PrescriptionMedicine {
  name: string;
  dosage: string;
  duration: string;
  instructions: string;
}

export interface Prescription {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  medicines: PrescriptionMedicine[];
  notes: string;
  created_at: string;
  doctor_profile?: Profile;
}

export interface LabReport {
  id: string;
  patient_id: string;
  test_name: string;
  lab_name: string;
  status: LabReportStatus;
  report_url: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  text: string;
  read: boolean;
  created_at: string;
}

export interface AmbulanceRequest {
  id: string;
  patient_id: string;
  driver_id: string | null;
  patient_name: string;
  pickup_address: string;
  pickup_lat: number | null;
  pickup_lng: number | null;
  driver_lat: number | null;
  driver_lng: number | null;
  driver_phone: string;
  distance: string;
  eta: string;
  emergency_type: string;
  phone: string;
  status: AmbulanceStatus;
  created_at: string;
}

export interface Payment {
  id: string;
  appointment_id: string;
  patient_id: string;
  amount: number;
  status: PaymentStatus;
  idempotency_key: string;
  gateway_ref: string | null;
  created_at: string;
}
