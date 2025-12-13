import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Product {
    id: number;
    name: string;
    slug: string;
    price: number;
    mrp?: number;
    rating?: number;
    discountPercent?: number;
    images: string[];
    categoryName?: string;
    stockQuantity?: number;
    imageUrl?: string; // fallback
    carbonFootprintPerUnit?: number;
    carbonSavedPerItem?: number;
    sellerStoreName?: string;
    isFeatured?: boolean;
    description?: string;
    sku?: string;
    brand?: string;
    co2ComparisonPercentage?: number;
    co2ComparisonType?: 'LOWER' | 'SIMILAR' | 'NONE';
}

export const productService = {
    getAll: async () => {
        const response = await api.get<any>('/products/search?size=100'); // temporary to get all
        return response.data.content || []; // Extract content from Page
    },
    getPaginated: async (page: number = 0, size: number = 12) => {
        const response = await api.get<any>(`/products/search?page=${page}&size=${size}`);
        return response.data;
    },
    getFeatured: async () => {
        const response = await api.get<Product[]>('/products/featured');
        return response.data;
    },
    getById: async (id: number | string) => {
        const response = await api.get<Product>(`/products/${id}`);
        return response.data;
    },
    getBySlug: async (slug: string) => {
        const response = await api.get<Product>(`/products/slug/${slug}`);
        return response.data;
    },
    search: async (query: string, page = 0, size = 12) => {
        const response = await api.get(`/products/search?query=${query}&page=${page}&size=${size}`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/products', data);
        return response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await api.put(`/products/${id}`, data);
        return response.data;
    },
    delete: async (id: number | string) => {
        await api.delete(`/products/${id}`);
    },
    filter: async (category?: string, minPrice?: number, maxPrice?: number, page = 0, size = 12) => {
        let url = `/products/filter?page=${page}&size=${size}&`;
        if (category) url += `category=${category}&`;
        if (minPrice !== undefined) url += `minPrice=${minPrice}&`;
        if (maxPrice !== undefined) url += `maxPrice=${maxPrice}&`;
        const response = await api.get(url);
        return response.data; // Returns Page<ProductDto>
    }
};

export const authService = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        if (response.data) {
            localStorage.setItem('token', response.data);
        }
        return response.data;
    },
    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('token');
    }
};

export const cartService = {
    getCart: async () => {
        const response = await api.get('/cart');
        return response.data;
    },
    addToCart: async (productId: number | string, quantity: number) => {
        const response = await api.post('/cart/add', { productId, quantity });
        return response.data;
    },
    checkout: async (shippingAddress: any, couponCode?: string) => {
        const response = await api.post('/cart/checkout', { shippingAddress, couponCode });
        return response.data;
    },
    updateItem: async (itemId: number | string, quantity: number) => {
        const response = await api.put(`/cart/items/${itemId}`, { quantity });
        return response.data;
    },
    removeItem: async (itemId: number | string) => {
        const response = await api.delete(`/cart/items/${itemId}`);
        return response.data;
    }
};

export const reviewService = {
    addReview: async (data: { productId: number | string, rating: number, comment: string }) => {
        const response = await api.post('/reviews', data);
        return response.data;
    },
    getByProduct: async (productId: number | string) => {
        const response = await api.get(`/reviews/product/${productId}`);
        return response.data;
    }
};

export const orderService = {
    getMyOrders: async (page = 0, size = 5) => {
        const response = await api.get(`/orders?page=${page}&size=${size}`);
        return response.data;
    },
    getOrderById: async (id: number | string) => {
        const response = await api.get(`/orders/${id}`); // Assuming this endpoint exists or will be added
        return response.data;
    }
};

export const categoryService = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/categories', data);
        return response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    },
    delete: async (id: number | string) => {
        await api.delete(`/categories/${id}`);
    }
};

export const brandService = {
    getAll: async () => {
        const response = await api.get('/brands');
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/brands', data);
        return response.data;
    },
    update: async (id: number | string, data: any) => {
        const response = await api.put(`/brands/${id}`, data);
        return response.data;
    },
    delete: async (id: number | string) => {
        await api.delete(`/brands/${id}`);
    }
};

export const adminService = {
    getInsights: async () => {
        const response = await api.get('/admin/insights');
        return response.data;
    },
    getAnalytics: async () => {
        const response = await api.get('/admin/analytics');
        return response.data;
    },
    getAllUsers: async () => {
        const response = await api.get('/admin/users');
        return response.data;
    },
    deleteUser: async (id: number | string) => {
        await api.delete(`/admin/users/${id}`);
    },
    updateUserRole: async (id: number | string, role: string) => {
        const response = await api.put(`/admin/users/${id}/role`, { role });
        return response.data;
    },
    updateUserStatus: async (id: number | string, enabled: boolean) => {
        const response = await api.put(`/admin/users/${id}/status`, { enabled });
        return response.data;
    },
    resetSystem: async () => {
        const response = await api.delete('/admin/system-reset');
        return response.data;
    }
};

export const sellerService = {
    getProducts: async () => {
        const response = await api.get('/seller/products');
        return response.data;
    },
    getStats: async () => {
        const response = await api.get('/seller/stats');
        return response.data;
    },
    getOrders: async () => {
        const response = await api.get('/seller/orders');
        return response.data;
    },
    getOrderDetails: async (orderId: number | string) => {
        const response = await api.get(`/seller/orders/${orderId}`);
        return response.data;
    }
};

export const wishlistService = {
    getWishlist: async () => {
        const response = await api.get('/wishlist');
        return response.data;
    },
    addToWishlist: async (productId: number | string) => {
        const response = await api.post(`/wishlist/add/${productId}`);
        return response.data;
    },
    removeFromWishlist: async (id: number | string) => {
        const response = await api.delete(`/wishlist/${id}`);
        return response.data;
    }
};

export const userService = {
    getProfile: async () => {
        const response = await api.get('/users/me');
        return response.data;
    },
    updateProfile: async (data: { fullName: string }) => {
        const response = await api.put('/users/me', data);
        return response.data;
    }
};

export interface LeaderboardEntry {
    userId: number;
    customerName: string;
    totalCarbonSavedKg: number;
    ecoOrdersCount: number;
    totalCarbonPoints: number;
    currentLevel: string;
}

export interface Coupon {
    id: number;
    code: string;
    description: string;
    discountType: string; // "PERCENT"
    discountValue: number;
    minOrderValue: number;
    expiryDate: string;
    status: 'ACTIVE' | 'USED' | 'EXPIRED' | 'UNUSED'; // Add UNUSED valid status
}

export interface UserBadge {
    badgeCode: string;
    icon?: string;
    label?: string;
    awardedAt: string;
}

export interface CarbonPointsHistory {
    id: number;
    pointsChange: number;
    description: string;
    timestamp: string;
}

export const rewardsService = {
    getSummary: async (userId?: number | string) => {
        const url = userId ? `/rewards/summary?userId=${userId}` : '/rewards/summary';
        const response = await api.get<{
            totalCarbonPoints: number;
            availableCarbonPoints: number;
            currentLevel: string;
            totalEcoOrders: number;
            totalCarbonSavedKg: number;
            nextLevelAt: number;
            progressToNextLevel: number;
            badges: UserBadge[];
            activeRewards: Coupon[];
            usedRewards: Coupon[];
            rewards?: any[]; // For manual/ui merging
        }>(url);
        return response.data;
    },
    getCoupons: async () => {
        const response = await api.get<Coupon[]>('/rewards/coupons');
        return response.data;
    },
    // Renamed for clarity, matches backend endpoint
    validateCoupon: async (couponCode: string, orderAmount: number) => {
        const response = await api.post('/rewards/apply-coupon', { couponCode, orderAmount });
        return response.data;
    },
    redeemReward: async (rewardTier: string) => {
        // Deprecated but kept for type safety if needed temporarily
        const response = await api.post('/rewards/redeem', { rewardTier });
        return response.data;
    }
};

export const leaderboardService = {
    getTopSavers: async (limit: number = 10) => {
        const response = await api.get(`/leaderboard?limit=${limit}`);
        return response.data;
    }
};

// Add interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
