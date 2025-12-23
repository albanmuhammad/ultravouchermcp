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

export type ProfileInsert = Readonly<{
  id: string;
  email: string;
  phone?: string | null;
  first_name: string;
  last_name: string;
  full_name: string;
}>;

export type ProfileUpdate = Readonly<Partial<Omit<ProfileInsert, "id">>>;
