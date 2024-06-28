import {useState, useCallback, useRef} from 'react';
import useWebSocketService from '../services/websocketService';
import {
  ORDERBOOK_WEBSOCKET_URL,
  ORDERBOOK_WEBSOCKET_TOKEN,
  ORDERBOOK_WEBSOCKET_CHANNEL,
} from '@env';
import {Order, OrderbookData} from '../types/orderbook.types.ts';
import {
  ORDERBOOK_CONSTANTS,
  SORT_ORDERS,
} from '../constants/orderbook.constants.ts';

const useOrderbookData = () => {
  // State for bids and asks
  const [bids, setBids] = useState<Order[]>([]);
  const [asks, setAsks] = useState<Order[]>([]);
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null);
  // Ref to keep track of the last sequence number
  const lastSequenceRef = useRef<number | null>(null);

  // Callback to process orderbook updates
  const processOrderbookUpdate = useCallback((data: OrderbookData) => {
    const currentTime = new Date(data.timestamp / 1000);

    // Check for lost packages by comparing sequence numbers, if there's a loss log it
    if (
      lastSequenceRef.current !== null &&
      data.sequence !== lastSequenceRef.current + 1
    ) {
      console.warn(
        `Potential lost package detected. Expected sequence ${lastSequenceRef.current + 1}, received ${data.sequence}`,
      );
    }

    lastSequenceRef.current = data.sequence;

    // Process bids
    const updatedBids = data.bids
      .map(([price, size]) => ({
        price,
        size,
        timestamp: currentTime,
      }))
      .filter(order => parseFloat(order.size) > 0);

    // Process asks
    const updatedAsks = data.asks
      .map(([price, size]) => ({
        price,
        size,
        timestamp: currentTime,
      }))
      .filter(order => parseFloat(order.size) > 0);

    // Update bids state
    setBids(prevBids => {
      const bidMap = new Map<string, Order>(
        prevBids.map(bid => [bid.price, bid]),
      );
      updatedBids.forEach(bid => bidMap.set(bid.price, bid));

      // Sort bids in descending order for the orderbook and limit to top 100
      const sortedBids = Array.from(bidMap.values())
        .sort((a, b) =>
          SORT_ORDERS.DESCENDING(parseFloat(a.price), parseFloat(b.price)),
        )
        .slice(0, ORDERBOOK_CONSTANTS.MAX_ORDERS_DISPLAY);

      return sortedBids;
    });

    // Update asks state
    setAsks(prevAsks => {
      const askMap = new Map<string, Order>(
        prevAsks.map(ask => [ask.price, ask]),
      );
      updatedAsks.forEach(ask => askMap.set(ask.price, ask));

      // Sort asks in ascending order for the orderbook and limit to top 100
      const sortedAsks = Array.from(askMap.values())
        .sort((a, b) =>
          SORT_ORDERS.ASCENDING(parseFloat(a.price), parseFloat(b.price)),
        )
        .slice(0, ORDERBOOK_CONSTANTS.MAX_ORDERS_DISPLAY);

      return sortedAsks;
    });

    setLastUpdateTime(currentTime);
  }, []);

  // Use the WebSocket service
  const {connectionState} = useWebSocketService({
    url: ORDERBOOK_WEBSOCKET_URL,
    token: ORDERBOOK_WEBSOCKET_TOKEN,
    channel: ORDERBOOK_WEBSOCKET_CHANNEL,
    onMessage: processOrderbookUpdate,
  });

  return {bids, asks, lastUpdateTime, connectionState};
};

export default useOrderbookData;
