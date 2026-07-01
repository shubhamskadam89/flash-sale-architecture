import type { StockUpdateEvent } from '@/types';

interface SSEOptions {
  onUpdate: (event: StockUpdateEvent) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

const MAX_BACKOFF_MS = 30000;

/**
 * Creates a managed EventSource connection to the stock-updates SSE endpoint.
 * Returns a cleanup function.
 */
export function createStockSSE(saleItemUuid: string, options: SSEOptions): () => void {
  let es: EventSource | null = null;
  let backoffMs = 1000;
  let destroyed = false;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  function connect() {
    if (destroyed || !saleItemUuid) return;

    const url = `/api/v1/stock-updates/${saleItemUuid}`;
    es = new EventSource(url);

    // Support connected, ping, and standard open mappings
    es.onopen = () => {
      backoffMs = 1000; // reset on successful connect
      options.onConnected?.();
    };

    es.addEventListener('connected', () => {
      backoffMs = 1000;
      options.onConnected?.();
    });

    es.addEventListener('ping', () => {
      backoffMs = 1000;
      options.onConnected?.();
    });

    es.addEventListener('stock-update', (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        if (typeof data.remainingInventory === 'number') {
          options.onUpdate({
            saleUuid: data.saleUuid || '',
            saleItemUuid: data.saleItemUuid || saleItemUuid,
            remainingInventory: data.remainingInventory,
            timestamp: data.timestamp || new Date().toISOString()
          });
        }
      } catch {
        console.error('Invalid SSE stock-update payload', event.data);
      }
    });

    es.onerror = () => {
      if (es) {
        es.close();
        es = null;
      }
      options.onDisconnected?.();

      if (!destroyed) {
        reconnectTimer = setTimeout(() => {
          backoffMs = Math.min(backoffMs * 2, MAX_BACKOFF_MS);
          connect();
        }, backoffMs);
      }
    };
  }

  connect();

  return () => {
    destroyed = true;
    if (reconnectTimer !== null) clearTimeout(reconnectTimer);
    if (es) {
      es.close();
      es = null;
    }
  };
}
