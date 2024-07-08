import queryString from "query-string";

export const adminRoutes = {
  verifyEmail: {
    path: "verify-email",
    fullpath: "/verify-email",
    build: (query: { token: string }) =>
      `/verify-email?${queryString.stringify(query)}`,
  },
};
