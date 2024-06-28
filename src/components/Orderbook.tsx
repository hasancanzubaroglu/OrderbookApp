import React from 'react';
import {View, Text, StyleSheet, ScrollView, SafeAreaView} from 'react-native';
import useOrderbookData from '../hooks/useOrderbookData';

// Define the structure of an individual order
interface Order {
  price: string;
  size: string;
  timestamp: Date;
}

const Orderbook: React.FC = () => {
  // Use our hook to fetch and manage orderbook data
  const {bids, asks, lastUpdateTime, connectionState} = useOrderbookData();

  // Render the order row for bids and asks
  const renderOrderRow = (order: Order, type: 'bid' | 'ask') => (
    <View
      key={`${order.price}-${order.timestamp.getTime()}`}
      style={[styles.orderRow, type === 'bid' ? styles.bidRow : styles.askRow]}>
      <Text
        style={[
          styles.orderText,
          styles.priceText,
          type === 'bid' ? styles.bidText : styles.askText,
        ]}>
        {parseFloat(order.price).toFixed(2)}
      </Text>
      <Text style={[styles.orderText, styles.sizeText]}>
        {parseFloat(order.size).toFixed(4)}
      </Text>
    </View>
  );

  // Render the connection status indicator
  const renderConnectionStatus = () => {
    let statusColor = '#000';
    let statusText;

    // Determine status color and text based on connection state
    switch (connectionState) {
      case 'connected':
        statusColor = '#00C853';
        statusText = 'Connected';
        break;
      case 'connecting':
        statusColor = '#FFA000';
        statusText = 'Connecting...';
        break;
      case 'disconnected':
        statusColor = '#D50000';
        statusText = 'Connection lost. Reconnecting...';
        break;
    }

    return (
      <View style={styles.connectionStatusContainer}>
        <Text style={[styles.connectionStatusText, {color: statusColor}]}>
          {statusText}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView>
      <View style={styles.header}>
        <Text style={styles.title}>BTC-USD Orderbook</Text>
      </View>
      {/*Show the real-time connection status*/}
      {renderConnectionStatus()}
      {lastUpdateTime && (
        <Text style={styles.lastUpdate}>
          Last update: {lastUpdateTime.toLocaleTimeString()}
        </Text>
      )}
      <View style={styles.orderbookContainer}>
        {/* Bids column */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>Bids</Text>
          <ScrollView contentContainerStyle={styles.listContentContainerStyle}>
            {bids.map(bid => renderOrderRow(bid, 'bid'))}
          </ScrollView>
        </View>
        {/* Asks column */}
        <View style={styles.column}>
          <Text style={styles.columnHeader}>Asks</Text>
          <ScrollView contentContainerStyle={styles.listContentContainerStyle}>
            {asks.map(ask => renderOrderRow(ask, 'ask'))}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  lastUpdate: {
    textAlign: 'center',
    padding: 5,
    fontSize: 12,
    color: '#666',
  },
  orderbookContainer: {
    flexDirection: 'row',
  },
  listContentContainerStyle: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  column: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
  },
  columnHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bidRow: {
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
  },
  askRow: {
    backgroundColor: 'rgba(255, 0, 0, 0.05)',
  },
  orderText: {
    fontSize: 14,
  },
  priceText: {
    fontWeight: 'bold',
  },
  sizeText: {
    color: '#666',
  },
  bidText: {
    color: 'green',
  },
  askText: {
    color: 'red',
  },
  timestampText: {
    fontSize: 10,
    color: '#888',
  },
  connectionStatusContainer: {
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  connectionStatusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default Orderbook;
