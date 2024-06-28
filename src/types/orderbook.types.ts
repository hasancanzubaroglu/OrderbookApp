export interface Order {
  price: string;
  size: string;
  timestamp: Date;
}

// Type for raw order data from WebSocket
export type OrderEntry = [price: string, size: string];

// Interface for the raw orderbook data received from the WebSocket
export interface OrderbookData {
  market_id: string;
  bids: OrderEntry[];
  asks: OrderEntry[];
  sequence: number;
  timestamp: number;
}
