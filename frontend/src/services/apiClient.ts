export class ApiClient {
  private baseUrl = (import.meta as any).env.VITE_API_URL ? (import.meta as any).env.VITE_API_URL + '/api' : '/api';

  private getHeaders() {
    const token = localStorage.getItem('portpulse_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  async get(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  async post(path: string, body?: any) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return this.handleResponse(res);
  }

  async put(path: string, body?: any) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    return this.handleResponse(res);
  }

  async delete(path: string) {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders()
    });
    return this.handleResponse(res);
  }

  private async handleResponse(res: Response) {
    if (res.status === 401) {
      localStorage.removeItem('portpulse_token');
      window.location.reload();
      throw new Error('Unauthorized');
    }
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error?.message || data.error || 'API Error');
    }
    return data;
  }
}

export const apiClient = new ApiClient();
