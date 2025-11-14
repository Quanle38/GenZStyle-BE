export interface UpdateRequestBodyUser {
    first_name?: string;
    last_name?: string;
    dob?: Date; // PostgreSQL date → JS Date
    phone_number?: string;
    gender?: string;
}
