import api from './api';

const API_PATH = '/coupons';

export interface Coupon {
    id: number;
    code: string;
    discountType: string;
    discountValue: number;
    minOrderValue: number;
    expiryDate: string;
    status: string;
    pointsRequired?: number;
    description?: string;
}

export const couponService = {
    // Fetch user's coupons
    getUserCoupons: async (userId: number): Promise<Coupon[]> => {
        try {
            const response = await api.get(`${API_PATH}/user/${userId}`);
            return response.data;
        } catch (error) {
            console.error("Error fetching coupons:", error);
            return [];
        }
    },

    // Claim a new coupon
    claimCoupon: async (userId: number, pointsRequired: number = 500, discountValue: number = 10, minOrderValue: number = 200): Promise<any> => {
        try {
            const response = await api.post(`${API_PATH}/claim`, {
                userId,
                pointsRequired,
                discountValue,
                minOrderValue
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    },

    // Validate/Preview a coupon (for checkout)
    applyCouponPreview: async (userId: number, couponCode: string, subtotal: number): Promise<any> => {
        try {
            const response = await api.post(`${API_PATH}/apply`, {
                userId,
                couponCode,
                subtotal
            });
            return response.data;
        } catch (error: any) {
            throw error.response?.data || error.message;
        }
    }
};
