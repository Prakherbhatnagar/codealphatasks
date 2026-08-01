/* ==========================================================================
   API.JS — REST API Client for ShopHive E-Commerce Backend
   Base URL: http://localhost:5000/api
   ========================================================================== */

const API_BASE_URL = "http://localhost:5000/api";
const TOKEN_KEY = "shophive_jwt_token";

const API = {
  // Token Management
  getToken() {
    return localStorage.getItem(TOKEN_KEY) || "";
  },
  setToken(token) {
    if (token) localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },
  isAuthenticated() {
    return !!this.getToken();
  },

  // Base HTTP Fetcher
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers,
    };

    if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
          if (typeof removeStore === "function" && typeof STORAGE_KEYS !== "undefined") {
            removeStore(STORAGE_KEYS.user);
          }
        }
        throw new Error(data.message || `HTTP Error ${response.status}`);
      }

      return data;
    } catch (error) {
      console.warn(`[API] ${options.method || "GET"} ${endpoint} failed:`, error.message);
      throw error;
    }
  },

  // Authentication APIs
  async register(userData) {
    const res = await this.request("/auth/register", {
      method: "POST",
      body: userData,
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
      if (res.data.user) {
        writeStore(STORAGE_KEYS.user, res.data.user);
      }
    }
    return res;
  },

  async login(credentials) {
    const res = await this.request("/auth/login", {
      method: "POST",
      body: credentials,
    });
    if (res.data && res.data.token) {
      this.setToken(res.data.token);
      if (res.data.user) {
        writeStore(STORAGE_KEYS.user, res.data.user);
      }
    }
    return res;
  },

  async logout() {
    try {
      await this.request("/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network errors on logout
    }
    this.removeToken();
    localStorage.removeItem("shophive_user");
    if (typeof removeStore === "function" && typeof STORAGE_KEYS !== "undefined") {
      removeStore(STORAGE_KEYS.user);
    }
  },

  async getMe() {
    return await this.request("/auth/me");
  },

  // Product APIs
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.category) query.append("category", params.category);
    if (params.minPrice) query.append("minPrice", params.minPrice);
    if (params.maxPrice) query.append("maxPrice", params.maxPrice);
    if (params.sortBy) query.append("sortBy", params.sortBy);
    if (params.order) query.append("order", params.order);
    if (params.page) query.append("page", params.page);
    if (params.limit) query.append("limit", params.limit);

    const queryString = query.toString() ? `?${query.toString()}` : "";
    return await this.request(`/products${queryString}`);
  },

  async getProductById(id) {
    return await this.request(`/products/${id}`);
  },

  // Cart APIs
  async getCart() {
    return await this.request("/cart");
  },

  async addToCart(productId, quantity = 1) {
    return await this.request("/cart/add", {
      method: "POST",
      body: { productId, quantity },
    });
  },

  async updateCartItem(productId, quantity) {
    return await this.request("/cart/update", {
      method: "PUT",
      body: { productId, quantity },
    });
  },

  async removeFromCart(productId) {
    return await this.request(`/cart/remove/${productId}`, {
      method: "DELETE",
    });
  },

  async clearCart() {
    return await this.request("/cart/clear", {
      method: "DELETE",
    });
  },

  // Order APIs
  async createOrder(orderData) {
    return await this.request("/orders", {
      method: "POST",
      body: orderData,
    });
  },

  async getMyOrders() {
    return await this.request("/orders/my-orders");
  },

  async getOrderById(id) {
    return await this.request(`/orders/${id}`);
  },

  // User Profile APIs
  async getProfile() {
    return await this.request("/users/profile");
  },

  async updateProfile(profileData) {
    return await this.request("/users/profile", {
      method: "PUT",
      body: profileData,
    });
  },
};
