import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

// TradeItem component for rendering trade details in modal
export const TradeItem = ({ trade }: { trade: any }) => {
  const totalValue = trade.items.reduce(
    (sum: number, item: any) => sum + (item.value || 0),
    0
  );

  return (
    <View style={tradeItemStyles.container}>
      <Text style={tradeItemStyles.title}>{trade.title}</Text>
      <Text style={tradeItemStyles.description}>{trade.description}</Text>

      <ScrollView horizontal style={tradeItemStyles.imagesContainer}>
        {trade.items.flatMap(
          (item: any) =>
            item.images?.map((img: string, idx: number) => (
              <Image
                key={`${item._id}-${idx}`}
                source={{ uri: img }}
                style={tradeItemStyles.image}
              />
            )) || [
              <Image
                key="placeholder"
                source={{ uri: "https://via.placeholder.com/150" }}
                style={tradeItemStyles.image}
              />,
            ]
        )}
      </ScrollView>

      <View style={tradeItemStyles.valueContainer}>
        <Text style={tradeItemStyles.valueLabel}>Value:</Text>
        <Text style={tradeItemStyles.value}>${totalValue}</Text>
      </View>

      {trade.cashAmount > 0 && (
        <View style={tradeItemStyles.valueContainer}>
          <Text style={tradeItemStyles.valueLabel}>Cash Included:</Text>
          <Text style={tradeItemStyles.value}>${trade.cashAmount}</Text>
        </View>
      )}
    </View>
  );
};

const tradeItemStyles = StyleSheet.create({
  container: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  description: {
    color: "#666",
    marginBottom: 10,
  },
  imagesContainer: {
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 10,
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  valueLabel: {
    color: "#666",
  },
  value: {
    fontWeight: "bold",
    color: "#4CAF50",
  },
});
