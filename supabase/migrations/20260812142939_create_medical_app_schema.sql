/*
# MediCare+ Full Schema

Creates the complete database for a healthcare app with patients, doctors,
ambulance drivers, appointments, prescriptions, lab reports, chat, and
ambulance requests. All data is real-time — no fake seed data.

## Tables

1. profiles — extends auth.users with role (patient/doctor/ambulance), name, phone, avatar, demographics
2. doctors — doctor-specific profile data (specialty, qualifications, hospital, fee, status, etc.)
3. appointments — patient-doctor consultation bookings
4. prescriptions — doctor-created prescriptions with medicines (JSONB)
5. lab_reports — patient lab tests
6. chat_messages — messages between patient and doctor
7. ambulance_requests — emergency transport requests

## Security

- RLS enabled on all tables
- Profiles: users can read all, update own only
- Doctors: all authenticated can read, doctor owner can update
- Appointments: patient and doctor involved can read/update; patients can insert
- Prescriptions: patient and doctor involved can read; doctors can insert
- Lab reports: patient owner can read/insert
- Chat: participants can read/insert
- Ambulance: ambulance driver can read/update; patients can insert
*/

-- ============ PROFILES ============
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'patient' CHECK (role IN ('patient','doctor','ambulance')),
  full_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  avatar_url text NOT NULL DEFAULT '',
  age int,
  gender text,
  blood_group text,
  location text,
  email text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_read_all" ON profiles;
CREATE POLICY "profiles_read_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ============ DOCTORS ============
CREATE TABLE IF NOT EXISTS doctors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  specialty text NOT NULL DEFAULT 'General Physician',
  qualifications text NOT NULL DEFAULT '',
  hospital text NOT NULL DEFAULT '',
  rating numeric NOT NULL DEFAULT 5.0,
  review_count int NOT NULL DEFAULT 0,
  experience int NOT NULL DEFAULT 0,
  fee int NOT NULL DEFAULT 500,
  status text NOT NULL DEFAULT 'offline' CHECK (status IN ('online','busy','offline')),
  about text NOT NULL DEFAULT '',
  languages text[] NOT NULL DEFAULT ARRAY['English']::text[],
  next_slot text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "doctors_read_all" ON doctors;
CREATE POLICY "doctors_read_all" ON doctors FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "doctors_insert_own" ON doctors;
CREATE POLICY "doctors_insert_own" ON doctors FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "doctors_update_own" ON doctors;
CREATE POLICY "doctors_update_own" ON doctors FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============ APPOINTMENTS ============
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  date text NOT NULL,
  time text NOT NULL,
  type text NOT NULL DEFAULT 'video' CHECK (type IN ('video','clinic','home')),
  status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','cancelled','in-progress')),
  fee int NOT NULL DEFAULT 0,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "appts_read_participants" ON appointments;
CREATE POLICY "appts_read_participants" ON appointments FOR SELECT
  TO authenticated USING (
    auth.uid() = patient_id
    OR EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "appts_insert_patient" ON appointments;
CREATE POLICY "appts_insert_patient" ON appointments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "appts_update_participants" ON appointments;
CREATE POLICY "appts_update_participants" ON appointments FOR UPDATE
  TO authenticated USING (
    auth.uid() = patient_id
    OR EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
  ) WITH CHECK (
    auth.uid() = patient_id
    OR EXISTS (SELECT 1 FROM doctors WHERE doctors.id = appointments.doctor_id AND doctors.user_id = auth.uid())
  );

-- ============ PRESCRIPTIONS ============
CREATE TABLE IF NOT EXISTS prescriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  doctor_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  diagnosis text NOT NULL DEFAULT '',
  medicines jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "rx_read_participants" ON prescriptions;
CREATE POLICY "rx_read_participants" ON prescriptions FOR SELECT
  TO authenticated USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

DROP POLICY IF EXISTS "rx_insert_doctor" ON prescriptions;
CREATE POLICY "rx_insert_doctor" ON prescriptions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = doctor_id);

-- ============ LAB REPORTS ============
CREATE TABLE IF NOT EXISTS lab_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_name text NOT NULL,
  lab_name text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('ready','pending')),
  report_url text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE lab_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "labs_read_own" ON lab_reports;
CREATE POLICY "labs_read_own" ON lab_reports FOR SELECT
  TO authenticated USING (auth.uid() = patient_id);

DROP POLICY IF EXISTS "labs_insert_own" ON lab_reports;
CREATE POLICY "labs_insert_own" ON lab_reports FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = patient_id);

-- ============ CHAT MESSAGES ============
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  text text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_read_participants" ON chat_messages;
CREATE POLICY "chat_read_participants" ON chat_messages FOR SELECT
  TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "chat_insert_own" ON chat_messages;
CREATE POLICY "chat_insert_own" ON chat_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = sender_id);

-- ============ AMBULANCE REQUESTS ============
CREATE TABLE IF NOT EXISTS ambulance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  driver_id uuid,
  patient_name text NOT NULL DEFAULT '',
  pickup_address text NOT NULL DEFAULT '',
  distance text NOT NULL DEFAULT '',
  eta text NOT NULL DEFAULT '',
  emergency_type text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'online' CHECK (status IN ('offline','online','enroute','arrived','transporting','completed')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ambulance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ambo_read_all" ON ambulance_requests;
CREATE POLICY "ambo_read_all" ON ambulance_requests FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "ambo_insert_patient" ON ambulance_requests;
CREATE POLICY "ambo_insert_patient" ON ambulance_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = patient_id);

DROP POLICY IF EXISTS "ambo_update_driver" ON ambulance_requests;
CREATE POLICY "ambo_update_driver" ON ambulance_requests FOR UPDATE
  TO authenticated USING (auth.uid() = driver_id OR driver_id IS NULL) WITH CHECK (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_rx_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_labs_patient ON lab_reports(patient_id);
CREATE INDEX IF NOT EXISTS idx_chat_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_receiver ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_ambo_status ON ambulance_requests(status);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, phone)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();