export const endpoints = {
  auth: {
    register: "/api/v1/auth/register",
    setupRegister: "/api/v1/auth/setup/register",
    login: "/api/v1/auth/login",
    refresh: "/api/v1/auth/refresh",
    logout: "/api/v1/auth/logout",
    me: "/api/v1/auth/me"
  },
  products: {
    list: "/api/v1/products",
    create: "/api/v1/products",
    detail: (productUuid: string) => `/api/v1/products/${productUuid}`
  },
  sales: {
    list: "/api/v1/sales",
    detail: (saleUuid: string) => `/api/v1/sales/${saleUuid}`,
    items: (saleUuid: string) => `/api/v1/sales/${saleUuid}/items`,
    adminList: "/api/v1/admin/sales",
    adminDetail: (saleUuid: string) => `/api/v1/admin/sales/${saleUuid}`,
    adminItems: (saleUuid: string) => `/api/v1/admin/sales/${saleUuid}/items`,
    create: "/api/v1/admin/sales",
    addItem: (saleUuid: string) => `/api/v1/admin/sales/${saleUuid}/items`,
    activate: (saleUuid: string) => `/api/v1/admin/sales/${saleUuid}/activate`,
    purchase: (saleUuid: string, saleItemUuid: string) =>
      `/api/v1/sales/${saleUuid}/items/${saleItemUuid}/purchase`
  },
  orders: {
    listMine: "/api/v1/orders",
    adminList: "/api/v1/admin/orders",
    adminByUser: (userUuid: string) => `/api/v1/admin/orders/users/${userUuid}`,
    detail: (orderUuid: string) => `/api/v1/orders/${orderUuid}`
  },
  inventory: {
    saleItem: (saleItemUuid: string) => `/api/v1/sale-items/${saleItemUuid}/inventory`
  }
} as const;

export const publicAuthPaths = [
  endpoints.auth.login,
  endpoints.auth.setupRegister,
  endpoints.auth.refresh,
  endpoints.auth.logout
];
