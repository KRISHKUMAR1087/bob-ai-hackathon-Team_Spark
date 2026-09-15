export class ApiClient {
  private baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL + '/api' : '/api';

  private getHeaders() {
    const token = localStorage.getItem('portspilot_token');
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
    let data;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await res.json();
    } else {
      const text = await res.text();
      data = { error: text || res.statusText || 'Unexpected Server Error' };
    }

    if (!res.ok) {
      if (res.status === 401) {
        localStorage.removeItem('portspilot_token');
        localStorage.removeItem('portspilot_auth_user');
        localStorage.removeItem('portspilot_user_role');
      }
      throw new Error(data.error?.message || data.error || 'API Error');
    }
    return data;
  }
}

export const apiClient = new ApiClient();
