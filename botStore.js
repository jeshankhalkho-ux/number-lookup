class BotStore {
  constructor() {
    this.adminChatId = null;
    this.requests = new Map();
    this.updateOffset = 0;
  }

  setAdminChatId(chatId) {
    this.adminChatId = chatId;
  }

  getAdminChatId() {
    return this.adminChatId;
  }

  isAdminRegistered() {
    return this.adminChatId !== null;
  }

  createRequest(id) {
    const req = { status: "pending", createdAt: Date.now() };
    this.requests.set(id, req);
    setTimeout(() => {
      const r = this.requests.get(id);
      if (r && r.status === "pending") {
        r.status = "expired";
      }
    }, 3 * 60 * 1000); // auto-expire in 3 minutes
    return req;
  }

  approve(requestId) {
    const req = this.requests.get(requestId);
    if (req) req.status = "approved";
  }

  reject(requestId) {
    const req = this.requests.get(requestId);
    if (req) req.status = "rejected";
  }

  getStatus(requestId) {
    const req = this.requests.get(requestId);
    return req ? req.status : "not_found";
  }
}

export const botStore = new BotStore();
