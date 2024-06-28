# Orderbook Synchronization React Native App

This project implements a React Native application that displays a real-time orderbook using WebSocket updates. It's designed to efficiently handle orderbook data, manage WebSocket connections, and provide a robust user interface for viewing bids and asks.

## Setup Instructions

1. Clone the repository:
   ```
   git clone https://github.com/hasancanzubaroglu/OrderbookApp
   cd OrderbookApp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   ORDERBOOK_WEBSOCKET_URL=wss://api.testnet.rabbitx.io/ws
   ORDERBOOK_WEBSOCKET_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwIiwiZXhwIjo1MjYyNjUyMDEwfQ.x_245iYDEvTTbraw1gt4jmFRFfgMJb-GJ-hsU9HuDik
   ORDERBOOK_WEBSOCKET_CHANNEL=orderbook:BTC-USD
   ```

4. Install CocoaPods (for iOS):
   ```
   cd ios
   pod install
   cd ..
   ```

5. Run the application:
    - For iOS:
      ```
      npx react-native run-ios
      ```
    - For Android:
      ```
      npx react-native run-android
      ```

## Project Structure

```
my-orderbook-app/
├── src/
│   ├── components/
│   │   └── Orderbook.tsx
│   ├── hooks/
│   │   └── useOrderbookData.ts
│   ├── services/
│   │   └── websocketService.ts
│   ├── types/
│   │   └── orderbook.types.ts
│   │   └── .env.d.ts
│   ├── constants/
│   │   └── orderbook.constants.ts
│   ├── utils/
│   ├── screens/
│   └── App.tsx
├── .env
├── package.json
├── tsconfig.json
└── README.md
```

- `components/Orderbook.tsx`: Main UI component for displaying the orderbook.
- `hooks/useOrderbookData.ts`: Custom hook for managing orderbook data.
- `services/websocketService.ts`: WebSocket service using Centrifuge.
- `types/orderbook.types.ts`: TypeScript type definitions for orderbook-related data.
- `types/.env.d.ts`: TypeScript declarations for environment variables.
- `constants/orderbook.constants.ts`: Constants used in the orderbook functionality.

## Approach Taken

1. **Modular Architecture**: We've separated concerns by creating distinct modules for UI components, data management, WebSocket handling, and type definitions.

2. **Type Safety**: Extensive use of TypeScript, including custom type definitions and enums, ensures type safety throughout the application.

3. **Real-time Data Handling**: Utilizing the Centrifuge library for WebSocket connections, with efficient data processing in the `useOrderbookData` hook.

4. **Optimized State Updates**: Efficient use of data structures (Map) and sorting algorithms for updating orderbook entries.

5. **Connection Management**: Robust WebSocket connection handling with automatic reconnection logic.

6. **Constant Management**: Centralized constants for easy configuration and maintenance.

## Challenges Faced and Solutions

1. **WebSocket Reliability**: Implemented a reconnection strategy with error handling.
2. **Performance Optimization**: Utilized efficient data structures and update logic.
3. **Lost Package Handling**: Implemented sequence number checking to detect potential lost packages.
4. **Cross-Platform Compatibility**: Ensured consistent styling and behavior across iOS and Android.

## Possible Improvements

1. **Better Error Recovery**: Implement full orderbook snapshot requests on detected discrepancies.
2. **Update Throttling**: Implement throttling for high-frequency update periods.
