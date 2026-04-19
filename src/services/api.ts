import { getApiUrl } from '../utils';

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

const getAuthHeadersOnly = (): Record<string, string> => {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
};

export const api = {
  get: async (url: string) => {
    const fullUrl = getApiUrl(url);
    const res = await fetch(fullUrl, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
    return res.json();
  },
  post: async (url: string, body?: any) => {
    const fullUrl = getApiUrl(url);
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
    return res.json();
  },
  put: async (url: string, body?: any) => {
    const fullUrl = getApiUrl(url);
    const res = await fetch(fullUrl, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
    return res.json();
  },
  delete: async (url: string) => {
    const fullUrl = getApiUrl(url);
    const res = await fetch(fullUrl, { method: 'DELETE', headers: getAuthHeaders() });
    if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
    return res.json();
  },
  uploadFile: async (url: string, file: File, onProgress?: (p: number) => void) => {
    return new Promise<any>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', getApiUrl(url));
      const token = localStorage.getItem('token');
      if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress?.((e.loaded / e.total) * 100);
      };
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) resolve(JSON.parse(xhr.responseText));
        else reject(new Error(`Upload failed: ${xhr.status}`));
      };
      xhr.onerror = () => reject(new Error('Upload failed'));

      const formData = new FormData();
      formData.append('image', file);
      xhr.send(formData);
    });
  },
};
