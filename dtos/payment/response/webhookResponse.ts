export interface WebhookResponse {
    id:              number;
    gateway:         string;
    transactionDate: Date;
    accountNumber:   string;
    code:            null;
    content:         string;
    transferType:    string;
    transferAmount:  number;
    accumulated:     number;
    subAccount:      null;
    referenceCode:   string;
    description:     string;
}