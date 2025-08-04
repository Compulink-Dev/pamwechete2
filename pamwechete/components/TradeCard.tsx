// components/TradeCard.tsx
import { Trade } from "@/types";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface TradeCardProps {
  trade: Trade;
  onPress?: () => void;
}

export default function TradeCard({ trade, onPress }: TradeCardProps) {
  // Get the first item if it exists
  const firstItem = trade.items?.[0];

  // Use the first image of the first item or a placeholder
  const imageUri =
    firstItem?.images?.[0] ||
    "https://port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png";

  // Updated value display logic
  const displayValue = () => {
    if (trade.type === "services") {
      return `$${trade.cashAmount > 0 ? trade.cashAmount : "Price negotiable"}`;
    }
    if (trade.cashAmount > 0) {
      return `$${trade.cashAmount}`;
    }
    if (firstItem?.value) {
      return `Value: $${firstItem.value}`;
    }
    return "";
  };

  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Image
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.details}>
        <Text style={styles.title}>{trade.title}</Text>
        <Text style={styles.description} numberOfLines={2}>
          {trade.description}
        </Text>

        <View style={styles.metaContainer}>
          <Text
            style={[
              styles.status,
              trade.status === "completed"
                ? styles.completed
                : trade.status === "pending"
                  ? styles.pending
                  : styles.active,
            ]}
          >
            {trade.status.toUpperCase()}
          </Text>
          <Text style={styles.type}>{trade.type.toUpperCase()}</Text>
        </View>

        {trade.type === "services" && trade.serviceDetails?.duration && (
          <Text style={styles.duration}>
            Duration: {trade.serviceDetails.duration} hours
          </Text>
        )}

        {displayValue() ? (
          <Text style={styles.value}>{displayValue()}</Text>
        ) : null}

        {firstItem?.condition && (
          <Text style={styles.condition}>
            Condition: {firstItem.condition.toUpperCase()}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 15,
    marginBottom: 10,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  duration: {
    fontSize: 12,
    color: "#FF9800",
    marginBottom: 5,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 15,
  },
  details: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  description: {
    color: "#666",
    fontSize: 14,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: "row",
    marginBottom: 5,
  },
  status: {
    fontSize: 12,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    marginRight: 8,
  },
  pending: {
    backgroundColor: "#FFF3CD",
    color: "#856404",
  },
  active: {
    backgroundColor: "#D1ECF1",
    color: "#0C5460",
  },
  completed: {
    backgroundColor: "#D4EDDA",
    color: "#155724",
  },
  type: {
    fontSize: 12,
    color: "#6C757D",
    backgroundColor: "#F8F9FA",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  value: {
    fontWeight: "bold",
    color: "#28A745",
    marginBottom: 5,
  },
  condition: {
    fontSize: 12,
    color: "#6C757D",
    fontStyle: "italic",
  },
});
