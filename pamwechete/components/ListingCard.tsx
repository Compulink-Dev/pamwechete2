import { Trade } from "@/types";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ListingCardProps {
  listing: Trade;
  onPress?: () => void;
}

export default function ListingCard({ listing, onPress }: ListingCardProps) {
  const images = listing.items?.flatMap((item) => item.images || []) || [];

  const fallbackImage =
    "https://port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png";

  const imageList = images.length > 0 ? images : [fallbackImage];

  const value =
    listing.cashAmount > 0
      ? `$${listing.cashAmount}`
      : listing.items?.[0]?.value
        ? `$${listing.items[0].value}`
        : "—";

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <ScrollView
        horizontal
        style={styles.imageScroll}
        showsHorizontalScrollIndicator={false}
      >
        {imageList.map((img, index) => (
          <Image
            key={index}
            source={{ uri: img }}
            style={styles.image}
            resizeMode="cover"
          />
        ))}
      </ScrollView>

      <View style={styles.details}>
        <Text style={styles.title} numberOfLines={1}>
          {listing.title}
        </Text>
        <Text style={styles.value}>{value}</Text>
        {listing.location?.formattedAddress && (
          <Text style={styles.distance}>
            {listing.location.formattedAddress}
          </Text>
        )}
        <Text style={styles.tradeType}>{listing.type.toUpperCase()}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "48%",
    marginBottom: 10,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageScroll: {
    width: "100%",
    height: 120,
    backgroundColor: "#f0f0f0",
  },
  image: {
    width: 120,
    height: 120,
    marginRight: 5,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  details: {
    padding: 10,
  },
  title: {
    fontWeight: "bold",
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    color: "#4CAF50",
    fontSize: 12,
    marginBottom: 4,
  },
  distance: {
    color: "#666",
    fontSize: 12,
  },
  tradeType: {
    fontSize: 10,
    color: "#2196F3",
    marginTop: 4,
  },
});
