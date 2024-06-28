import {useEffect, useRef, useCallback, useState} from 'react';
import {Centrifuge} from 'centrifuge';
import {OrderbookData} from '../types/orderbook.types.ts';

// Define the props for the WebSocket service
interface WebSocketProps {
  url: string;
  token: string;
  channel: string;
  onMessage: (data: OrderbookData) => void;
}

// Define the reconnection delay
// If the connection is lost, it will try to reconnect every 5 second in this case
const RECONNECT_DELAY = 5000; // 5 seconds

const useWebSocketService = ({
  url,
  token,
  channel,
  onMessage,
}: WebSocketProps) => {
  // Ref to store the Centrifuge instance
  // We use a ref to persist the instance across re-renders without causing effects
  const centrifugeRef = useRef<Centrifuge | null>(null);

  // State to track the connection state
  // This is used to update the UI based on the current connection status
  const [connectionState, setConnectionState] = useState<
    'disconnected' | 'connecting' | 'connected'
  >('disconnected');

  // Ref to store the reconnection timeout
  // We use a ref so we can clear the timeout in the cleanup function
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to keep track of reconnection attempts
  // This could be used to implement exponential backoff or maximum connection retry
  const reconnectAttemptsRef = useRef(0);

  /*
   Ref to indicate if the disconnection was manual
  This is crucial for distinguishing between intentional disconnects (component unmounting)
  and unintentional disconnects (network issues etc)
  This way we prevent unnecessary reconnection attempts when the disconnect is intentional*/
  const isManualDisconnectRef = useRef(false);

  // Function to establish connection
  const connect = useCallback(() => {
    setConnectionState('connecting');
    console.log('Attempting to connect to Centrifuge');

    // Create new Centrifuge instance
    centrifugeRef.current = new Centrifuge(url, {
      token,
      getToken: null,
    });

    // Set up event handlers for Centrifuge
    centrifugeRef.current.on('connected', () => {
      console.log('Centrifuge connected');
      setConnectionState('connected');
      reconnectAttemptsRef.current = 0; // Reset the reconnection attempts when a successful connection established

      if (centrifugeRef.current) {
        const sub = centrifugeRef.current.newSubscription(channel);

        // Handle incoming messages and log them for testing and demo purposes
        sub.on('publication', ctx => {
          console.log('Received message:', ctx.data);
          onMessage(ctx.data as OrderbookData);
        });

        // Handle subscription events - also log it
        sub.on('subscribed', () => {
          console.log('Successfully subscribed to channel');
        });

        sub.on('unsubscribed', () => {
          console.error('Unsubscribed from channel');
          // Only try to reconnect if this wasn't a manual disconnection (network loss etc)
          if (!isManualDisconnectRef.current) {
            setConnectionState('disconnected');
            scheduleReconnect();
          }
        });

        sub.on('error', ctx => {
          console.error('Subscription error:', ctx);
          // Only try to reconnect if this wasn't a manual disconnection (network loss etc)
          if (!isManualDisconnectRef.current) {
            setConnectionState('disconnected');
            scheduleReconnect();
          }
        });

        sub.subscribe();
      }
    });

    // Handle disconnection
    centrifugeRef.current.on('disconnected', ctx => {
      console.log('Centrifuge disconnected', ctx);
      // Only try to reconnect if this wasn't a manual disconnection (network loss etc)
      if (!isManualDisconnectRef.current) {
        setConnectionState('disconnected');
        scheduleReconnect();
      }
    });

    // Handle errors
    centrifugeRef.current.on('error', ctx => {
      console.error('Centrifuge error:', ctx);
      // Only try to reconnect if this wasn't a manual disconnection (network loss etc)
      if (!isManualDisconnectRef.current) {
        setConnectionState('disconnected');
        scheduleReconnect();
      }
    });

    centrifugeRef.current.connect();
  }, [url, token, channel, onMessage]);

  // Function to schedule reconnection
  const scheduleReconnect = useCallback(() => {
    // If this is a manual disconnect, don't try to reconnect again
    if (isManualDisconnectRef.current) {
      console.log('Manual disconnect detected, not scheduling reconnect');
      return;
    }

    console.log(
      `Scheduling reconnect attempt ${reconnectAttemptsRef.current + 1} in ${RECONNECT_DELAY}ms`,
    );

    // Clear reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    // Schedule a new reconnection attempt
    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connect();
    }, RECONNECT_DELAY);
  }, [connect]);

  // Effect to manage WebSocket lifecycle
  useEffect(() => {
    // Reset manual disconnect flag
    isManualDisconnectRef.current = false;
    // Initiate connection
    connect();

    // Cleanup function as we want to handle the component's unmounting
    // This could be overcomplicating the code
    return () => {
      // Set manual disconnect flag to true to prevent a connection attempt
      isManualDisconnectRef.current = true;

      // Clear reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }

      // Disconnect if there's an active connection
      if (centrifugeRef.current) {
        centrifugeRef.current.disconnect();
      }
    };
  }, [connect]);

  // Return the current connection state
  return {connectionState};
};

export default useWebSocketService;
