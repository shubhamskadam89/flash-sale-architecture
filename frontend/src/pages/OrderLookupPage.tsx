import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { MagnifyingGlassIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';
import { PageHeader } from '@/components/ui/PageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function OrderLookupPage() {
  const [uuid, setUuid] = useState('');
  const [recentOrders, setRecentOrders] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('recent-orders') || '[]');
      if (Array.isArray(stored)) {
        setRecentOrders(stored);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = uuid.trim();
    if (trimmed) navigate(`/orders/${trimmed}`);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Order Lookup"
        description="Retrieve an order by its UUID."
      />
      <div className="max-w-md space-y-6">
        <form onSubmit={handleLookup} className="flex gap-3">
          <div className="flex-1">
            <Input
              placeholder="Enter Order UUID"
              value={uuid}
              onChange={(e) => setUuid(e.target.value)}
              id="order-uuid-input"
            />
          </div>
          <Button type="submit" disabled={!uuid.trim()} id="lookup-order-btn">
            <MagnifyingGlassIcon className="h-4 w-4" />
            Lookup
          </Button>
        </form>

        {recentOrders.length > 0 && (
          <div className="border border-gray-100 bg-gray-50 rounded-lg p-4 space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Recent Purchase Orders
            </h3>
            <ul className="divide-y divide-gray-200/50 text-sm">
              {recentOrders.map((ordUuid) => (
                <li key={ordUuid} className="py-2 flex items-center justify-between gap-4">
                  <Link
                    to={`/orders/${ordUuid}`}
                    className="font-mono text-xs text-blue-600 hover:text-blue-800 hover:underline truncate"
                  >
                    {ordUuid}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(ordUuid);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors shrink-0"
                    title="Copy UUID"
                  >
                    <ClipboardDocumentIcon className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-gray-400">
          Order UUIDs are shown after a successful purchase, or can be found in the confirmation email.
        </p>
      </div>
    </div>
  );
}
