/** Shared API fixtures for Playwright contract tests. */

export const userListFixture = {
  users: [
    {
      id: "user-1",
      email: "buyer@example.com",
      first_name: "Test",
      last_name: "Buyer",
      role: "buyer",
      is_onboarded: true,
      kyc_status: "verified",
    },
  ],
  total: 1,
};

export const ticketListFixture = {
  tickets: [
    {
      id: 1,
      subject: "Need help with order",
      status: "open",
      priority: "medium",
      user_id: "user-1",
      user_email: "buyer@example.com",
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      messages: [],
    },
  ],
  total: 1,
};

export const kycListFixture = {
  submissions: [
    {
      id: 1,
      seller_user_id: "seller-1",
      seller_name: "Ada Seller",
      status: "pending",
      gstin: "22AAAAA0000A1Z5",
      pan: "ABCDE1234F",
      documents: [],
      submitted_at: "2026-01-01T10:30:00Z",
    },
  ],
  total: 1,
};

export const productListFixture = {
  products: [
    {
      id: 1,
      seller_id: "seller-1",
      title: "Test Product",
      price: 99900,
      stock: 10,
      category: "Electronics",
      images: [],
      status: "pending",
    },
  ],
  total: 1,
};
