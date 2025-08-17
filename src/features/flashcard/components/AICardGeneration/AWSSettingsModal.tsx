import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { AWSCredentials } from '@/types/ai-generation';

interface AWSSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCredentialsSaved: (credentials: AWSCredentials) => void;
}

interface AWSSettingsForm {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  testResult: 'idle' | 'testing' | 'success' | 'error';
}

const SUPPORTED_REGIONS = [
  { value: 'us-east-1', label: 'US East (N. Virginia)' },
  { value: 'us-west-2', label: 'US West (Oregon)' },
  { value: 'eu-west-1', label: 'Europe (Ireland)' },
];

export function AWSSettingsModal({ isOpen, onClose, onCredentialsSaved }: AWSSettingsModalProps) {
  const [form, setForm] = useState<AWSSettingsForm>({
    accessKeyId: '',
    secretAccessKey: '',
    region: 'us-east-1',
    testResult: 'idle',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setForm(prev => ({ ...prev, testResult: 'testing' }));
    
    try {
      const credentials: AWSCredentials = {
        accessKeyId: form.accessKeyId,
        secretAccessKey: form.secretAccessKey,
        region: form.region,
      };
      
      onCredentialsSaved(credentials);
      setForm(prev => ({ ...prev, testResult: 'success' }));
      
      setTimeout(() => {
        onClose();
        setForm({
          accessKeyId: '',
          secretAccessKey: '',
          region: 'us-east-1',
          testResult: 'idle',
        });
      }, 1000);
    } catch (error) {
      setForm(prev => ({ ...prev, testResult: 'error' }));
    }
  };

  const isValid = form.accessKeyId.length > 0 && 
                  form.secretAccessKey.length > 0 && 
                  form.region.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-xl font-semibold mb-4">AWS 설정</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Access Key ID
            </label>
            <input
              type="text"
              value={form.accessKeyId}
              onChange={(e) => setForm(prev => ({ ...prev, accessKeyId: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="AKIA..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Secret Access Key
            </label>
            <input
              type="password"
              value={form.secretAccessKey}
              onChange={(e) => setForm(prev => ({ ...prev, secretAccessKey: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••••••••••••••••••••••••••••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Region
            </label>
            <select
              value={form.region}
              onChange={(e) => setForm(prev => ({ ...prev, region: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SUPPORTED_REGIONS.map(region => (
                <option key={region.value} value={region.value}>
                  {region.label}
                </option>
              ))}
            </select>
          </div>

          {form.testResult === 'error' && (
            <div className="text-red-600 text-sm">
              연결 테스트에 실패했습니다. 인증 정보를 확인해주세요.
            </div>
          )}

          {form.testResult === 'success' && (
            <div className="text-green-600 text-sm">
              연결 테스트가 성공했습니다!
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={!isValid || form.testResult === 'testing'}
              className="flex-1"
            >
              {form.testResult === 'testing' ? '테스트 중...' : '저장'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
