export type Client = {
  id: string;
  business_name: string;
  contact_name: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  address: string | null;
  abn: string | null;
  industry: string | null;
  source: string | null;
  status: "prospect" | "active" | "past";
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  client_id: string;
  name: string;
  package: string | null;
  stage: string;
  quote_amount: number | null;
  deposit_amount: number | null;
  deposit_paid_on: string | null;
  balance_paid_on: string | null;
  start_date: string | null;
  target_launch: string | null;
  launched_on: string | null;
  domain: string | null;
  hosting: string | null;
  booking_platform: string | null;
  care_plan_monthly: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  clients?: { business_name: string } | null;
};

export type DocumentRow = {
  id: string;
  client_id: string;
  project_id: string | null;
  title: string;
  kind: string;
  signed_on: string | null;
  storage_path: string;
  file_name: string | null;
  file_size: number | null;
  mime_type: string | null;
  created_at: string;
  clients?: { business_name: string } | null;
  projects?: { name: string } | null;
};

export type Activity = {
  id: string;
  client_id: string;
  project_id: string | null;
  kind: string;
  body: string;
  created_at: string;
  clients?: { business_name: string } | null;
};
