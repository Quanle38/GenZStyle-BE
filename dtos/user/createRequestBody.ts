export interface CreateRequestBodyUser {
      address: string;
      first_name: string;
      last_name: string;
      email: string;
      dob: string; // PostgreSQL date → JS Date
      phone_number: string;
      gender: string;
      password: string;
      membership_id : string;
      avatar? : string;
}
