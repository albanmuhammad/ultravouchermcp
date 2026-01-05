export type ProfileRow = Readonly<{
  id: string;
  email: string;
  phone: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  created_at: string;
  updated_at: string;
}>;

export type ProfileInsert = {
  id: string;
  email: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
  ultra_voucher_member_id?: string | null;
  salesforce_loyalty_member_id?: string | null;
  salesforce_person_account_id?: string | null;
};

export type ProfileUpdate = Readonly<Partial<Omit<ProfileInsert, "id">>>;
