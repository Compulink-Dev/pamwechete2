// components/TradeModal.tsx
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TradeModalProps {
  visible: boolean;
  onClose: () => void;
  trade: any;
  userTrades: any[];
  allTrades: any[];
}

export const TradeModal = ({
  visible,
  onClose,
  trade,
  userTrades,
  allTrades,
}: TradeModalProps) => {
  if (!trade) return null;

  // Calculate potential matches with other items from the same user
  const calculateMatches = (mainTrade: any) => {
    const otherUserTrades = allTrades.filter(
      (t) => t.user._id === mainTrade.user._id && t._id !== mainTrade._id
    );

    return otherUserTrades
      .map((otherTrade) => {
        const mainValue = mainTrade.items.reduce(
          (sum: number, item: any) => sum + (item.value || 0),
          0
        );
        const otherValue = otherTrade.items.reduce(
          (sum: number, item: any) => sum + (item.value || 0),
          0
        );
        const difference = Math.abs(mainValue - otherValue);
        const matchScore =
          100 - (difference / Math.max(mainValue, otherValue)) * 100;

        return {
          trade: otherTrade,
          matchScore,
          difference,
          needsCash: mainValue > otherValue,
          cashAmount: Math.abs(mainValue - otherValue),
        };
      })
      .filter((match) => match.matchScore >= 60)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const matches = calculateMatches(trade);
  const totalValue = trade.items.reduce(
    (sum: number, item: any) => sum + (item.value || 0),
    0
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color="#666" />
          </TouchableOpacity>

          <ScrollView>
            {/* Trade Details */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{trade.title}</Text>
              <Text style={styles.description}>{trade.description}</Text>

              <View style={styles.valueContainer}>
                <Text style={styles.valueLabel}>Total Value:</Text>
                <Text style={styles.value}>${totalValue}</Text>
              </View>

              {trade.cashAmount > 0 && (
                <View style={styles.valueContainer}>
                  <Text style={styles.valueLabel}>Cash Included:</Text>
                  <Text style={styles.value}>${trade.cashAmount}</Text>
                </View>
              )}

              {/* Images */}
              <ScrollView horizontal style={styles.imagesContainer}>
                {trade.items.flatMap(
                  (item: any) =>
                    item.images?.map((img: string, idx: number) => (
                      <Image
                        key={`${item._id}-${idx}`}
                        source={{ uri: img }}
                        style={styles.tradeImage}
                      />
                    )) || [
                      <Image
                        key="placeholder"
                        source={{ uri: "https://via.placeholder.com/150" }}
                        style={styles.tradeImage}
                      />,
                    ]
                )}
              </ScrollView>
            </View>

            {/* Potential Matches */}
            {matches.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Potential Matches</Text>
                <Text style={styles.matchSubtitle}>
                  These items could help balance the trade
                </Text>

                {matches.map((match, index) => (
                  <View key={index} style={styles.matchCard}>
                    <View style={styles.matchHeader}>
                      <Text style={styles.matchScore}>
                        {match.matchScore.toFixed(0)}% Match
                      </Text>
                      {match.difference > 0 && (
                        <Text style={styles.differenceText}>
                          {match.needsCash ? "You add $" : "They add $"}
                          {match.cashAmount}
                        </Text>
                      )}
                    </View>

                    <View style={styles.matchDetails}>
                      <Image
                        source={{
                          uri:
                            match.trade.items[0]?.images?.[0] ||
                            "https://via.placeholder.com/150",
                        }}
                        style={styles.matchImage}
                      />
                      <View style={styles.matchText}>
                        <Text style={styles.matchTitle}>
                          {match.trade.title}
                        </Text>
                        <Text style={styles.matchValue}>
                          $
                          {match.trade.items.reduce(
                            (sum: number, item: any) => sum + (item.value || 0),
                            0
                          )}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.actionButton} onPress={onClose}>
            <Text style={styles.actionButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
    padding: 20,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  valueLabel: {
    fontSize: 16,
    color: "#666",
  },
  value: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  imagesContainer: {
    marginVertical: 10,
  },
  tradeImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  matchSubtitle: {
    color: "#666",
    marginBottom: 10,
  },
  matchCard: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
  },
  matchHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  matchScore: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  differenceText: {
    color: "#2196F3",
  },
  matchDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  matchImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  matchText: {
    flex: 1,
  },
  matchTitle: {
    fontWeight: "bold",
  },
  matchValue: {
    color: "#4CAF50",
  },
  actionButton: {
    backgroundColor: "#2196F3",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
