// NEXS Gestor Financeiro Frontend API Client

const API_BASE_URL = "/api";

export class ApiClient {
  private static token: string | null = localStorage.getItem("nexs_jwt_token");

  public static setToken(newToken: string | null) {
    this.token = newToken;
    if (newToken) {
      localStorage.setItem("nexs_jwt_token", newToken);
    } else {
      localStorage.removeItem("nexs_jwt_token");
    }
  }

  public static getToken(): string | null {
    return this.token || localStorage.getItem("nexs_jwt_token");
  }

  public static async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>)
    };

    const token = this.getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Erro desconhecido na requisição" }));
      throw new Error(errorData.error || `Erro ${response.status}: Falha na comunicação com o servidor`);
    }

    return response.json();
  }

  // Auth Methods
  public static async login(credentials: { email: string; password?: string }) {
    const data = await this.request<{ success: boolean; token: string; user: any }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials)
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  public static async getMe() {
    return this.request<{ user: any }>("/auth/me");
  }

  // Financial Methods
  public static async getDocuments() {
    return this.request<{ documents: any[] }>("/financial/documents");
  }

  public static async createDocument(documentData: any) {
    return this.request<{ success: boolean; document: any }>("/financial/documents", {
      method: "POST",
      body: JSON.stringify(documentData)
    });
  }

  public static async executeSettlement(settlementData: any) {
    return this.request<{ success: boolean; settlement: any }>("/financial/settlements", {
      method: "POST",
      body: JSON.stringify(settlementData)
    });
  }

  // People Methods
  public static async getPeople(role?: "customer" | "supplier") {
    const query = role ? `?role=${role}` : "";
    return this.request<{ people: any[] }>(`/people${query}`);
  }

  public static async createPerson(personData: any) {
    return this.request<{ success: boolean; person: any }>("/people", {
      method: "POST",
      body: JSON.stringify(personData)
    });
  }

  // Products Methods
  public static async getProducts() {
    return this.request<{ products: any[] }>("/products");
  }

  // Banks Methods
  public static async getBankAccounts() {
    return this.request<{ bankAccounts: any[] }>("/banks");
  }

  // Fiscal Methods
  public static async getFiscalInvoices() {
    return this.request<{ invoices: any[] }>("/fiscal/invoices");
  }

  public static async emitNFe(documentId: string) {
    return this.request<{ success: boolean; nfe: any }>("/fiscal/emit-nfe", {
      method: "POST",
      body: JSON.stringify({ document_id: documentId })
    });
  }

  // Audit Logs
  public static async getAuditLogs() {
    return this.request<{ logs: any[] }>("/audit/logs");
  }

  // AI OCR
  public static async processOcr(payload: { base64Image?: string; textContent?: string; mimeType?: string; documentType?: string }) {
    return this.request<{ success: boolean; extractedData: any; confidenceScore: number }>("/ai/ocr", {
      method: "POST",
      body: JSON.stringify(payload)
    });
  }
}
