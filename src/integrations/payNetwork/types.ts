// TypeScript interfaces for Pay Network API requests and responses

// Interface for request to create payment
export interface CreatePaymentRequest {
    amount: number;
    currency: string;
    paymentMethod: string;
    orderId: string;
}

// Interface for response from creating payment
export interface CreatePaymentResponse {
    success: boolean;
    transactionId?: string;
    error?: string;
}

// Interface for request to get payment status
export interface GetPaymentStatusRequest {
    transactionId: string;
}

// Interface for response from getting payment status
export interface GetPaymentStatusResponse {
    success: boolean;
    status: string;
    error?: string;
}