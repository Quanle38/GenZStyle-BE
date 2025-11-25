import { SePayPgClient } from 'sepay-pg-node';

const MERCHANT_ID = process.env.MERCHANT_ID || "MERCHANT_ID";
const SECRET_KEY = process.env.SECRET_KEY || "SECRET_KEY"; 

const client = new SePayPgClient({
  env: 'sandbox',
  merchant_id: MERCHANT_ID,
  secret_key: SECRET_KEY,
});

const fields = client.checkout.initOneTimePaymentFields({
  operation: 'PURCHASE',
  payment_method: 'BANK_TRANSFER',
  order_invoice_number: 'DH001',
  order_amount: 100000,
  currency: 'VND',
  order_description: 'Thanh toán đơn hàng DH001',
  success_url: 'https://your-site.com/success',
  error_url: 'https://your-site.com/error',
  cancel_url: 'https://your-site.com/cancel',
  custom_data: 'anything-you-want',
});

console.log(fields);