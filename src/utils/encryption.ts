// 간단한 클라이언트 측 암호화 (실제 운영에서는 더 강력한 암호화 필요)
const ENCRYPTION_KEY = 'myanki-encryption-key-2024';

export function encryptCredentials(credentials: string): string {
  try {
    // Base64 인코딩을 사용한 간단한 암호화
    const encoded = btoa(JSON.stringify({ data: credentials, key: ENCRYPTION_KEY }));
    return encoded;
  } catch (error) {
    throw new Error('Failed to encrypt credentials');
  }
}

export function decryptCredentials(encryptedData: string): string {
  try {
    const decoded = JSON.parse(atob(encryptedData));
    if (decoded.key !== ENCRYPTION_KEY) {
      throw new Error('Invalid encryption key');
    }
    return decoded.data;
  } catch (error) {
    throw new Error('Failed to decrypt credentials');
  }
}

export function clearMemory(obj: unknown): void {
  if (typeof obj === 'object' && obj !== null) {
    const record = obj as Record<string, unknown>;
    Object.keys(record).forEach(key => {
      if (typeof record[key] === 'string') {
        record[key] = '';
      } else if (typeof record[key] === 'object') {
        clearMemory(record[key]);
      }
    });
  }
}
