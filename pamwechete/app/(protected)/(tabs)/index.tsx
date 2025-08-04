import { SwipeCard } from "@/components/SwipeCard";
import { Listing } from "@/types";
import { useAuth } from "@/utils/authContext";
import { useEffect, useState } from "react";
import { SafeAreaView, StyleSheet, Text, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const API_URL = "https://pamwechete-server.onrender.com/api/v1";

export default function Home() {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const response = await fetch(`${API_URL}/trades`);
        const data = await response.json();

        if (response.ok && data.success) {
          // Filter out user's own trades and map to Listing format
          const filteredTrades = data.data
            .filter((trade: any) => trade.user._id !== user?._id)
            .map((trade: any) => ({
              id: trade._id,
              title: trade.title,
              description: trade.description,
              image:
                trade.items[0]?.images?.[0] ||
                "https://via.placeholder.com/150?text=No+Image",
              category: trade.categories[0]?.name || "other",
              barterValue: trade.items.reduce(
                (sum: number, item: any) => sum + (item.value || 0),
                0
              ),
              cashValue: trade.cashAmount || 0,
              distance: Math.floor(Math.random() * 10) + 1, // Random distance for demo
              owner: {
                id: trade.user._id,
                displayName: trade.user.username,
                photoURL: "", // Add if available
                rating: 4.5, // Default rating
              },
              createdAt: new Date(trade.createdAt),
            }));

          setListings(filteredTrades);
        }
      } catch (error) {
        console.error("Failed to fetch trades", error);
      }
    };

    fetchTrades();
  }, [user]);

  const handleSwipeLeft = () => {
    console.log("Swiped left - Not interested");
    setCurrentIndex((prev) => prev + 1);
  };

  const handleSwipeRight = () => {
    console.log("Swiped right - Interested in trade");
    setCurrentIndex((prev) => prev + 1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Pamwechete</Text>
          <Text style={styles.subtitle}>
            Swipe right to trade, left to pass
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {listings.length > 0 && currentIndex < listings.length ? (
            <SwipeCard
              listing={listings[currentIndex]}
              onSwipeLeft={handleSwipeLeft}
              onSwipeRight={handleSwipeRight}
            />
          ) : (
            <View style={styles.noMoreCards}>
              <Text style={styles.noMoreCardsText}>
                No more listings nearby. Check back later!
              </Text>
            </View>
          )}
        </View>

        <View style={styles.actions}>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>✖</Text>
          </View>
          <View style={styles.actionButton}>
            <Text style={styles.actionText}>♥</Text>
          </View>
        </View>
      </GestureHandlerRootView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 20,
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  cardsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  noMoreCards: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noMoreCardsText: {
    fontSize: 18,
    textAlign: "center",
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionText: {
    fontSize: 24,
  },
});
