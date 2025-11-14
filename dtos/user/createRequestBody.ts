export interface CreateRequestBodyUser {
      address: string;
      first_name: string;
      last_name: string;
      email: string;
      dob: Date; // PostgreSQL date → JS Date
      phone_number: string;
      gender: string;
      password: string;
}
