import { useQuery } from "@tanstack/react-query";
import { getSaleItemInventory, saleKeys } from "../../api/sales.api";

export function InventoryBadge({ saleItemUuid }: { saleItemUuid?: string }) {
  const query = useQuery({
    queryKey: saleKeys.inventory(saleItemUuid ?? ""),
    queryFn: () => getSaleItemInventory(saleItemUuid ?? ""),
    enabled: Boolean(saleItemUuid),
    refetchInterval: 5000
  });

  if (!saleItemUuid) return <span>Not available</span>;
  if (query.isLoading) return <span>Checking...</span>;
  if (query.error) return <span>Unavailable</span>;
  if (query.data?.availability === "SOLD_OUT") return <span>Sold out</span>;
  if (query.data?.availability === "NOT_ACTIVE") return <span>Not active</span>;
  if (query.data?.availability === "SALE_ENDED") return <span>Ended</span>;

  return <span>{query.data?.remainingInventory ?? "Not available"}</span>;
}
