import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { OrderDetail } from '@/features/orders/OrderDetail';
import { Spinner } from '@/components/ui/Spinner';
import { useOrder } from '@/hooks/useOrders';
import { PageHeader } from '@/components/ui/PageHeader';

export default function OrderPage() {
  const { orderUuid } = useParams<{ orderUuid: string }>();
  const { data: order, isLoading, error } = useOrder(orderUuid ?? '');

  return (
    <div>
      <PageHeader
        title="Order Confirmation"
        description="Your order has been submitted and queued for processing."
        action={
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Dashboard
          </Link>
        }
      />

      {isLoading && (
        <div className="max-w-lg mx-auto text-center py-12 space-y-3">
          <Spinner className="h-8 w-8 mx-auto" />
          <p className="text-sm text-gray-500 font-medium">Order is being processed. Retrying...</p>
        </div>
      )}

      {error && (
        <div className="max-w-lg mx-auto rounded-lg border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
          Failed to load order. The order may still be processing.
        </div>
      )}

      {order && <OrderDetail order={order} />}
    </div>
  );
}
