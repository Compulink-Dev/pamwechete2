import ListingCard from "@/components/ListingCard";
import { TradeModal } from "@/components/modals/TradeModal";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/utils/authContext";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Add this placeholder image (or use a local image)
const PLACEHOLDER_IMAGE =
  "https://port2flavors.com/wp-content/uploads/2022/07/placeholder-614.png";

export default function Trades() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [trades, setTrades] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [userTrades, setUserTrades] = useState<any[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [selectedRecommendation, setSelectedRecommendation] =
    useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [recommendationModalVisible, setRecommendationModalVisible] =
    useState(false);

  const API_URL = "https://pamwechete-server.onrender.com/api/v1";

  // Fetch all categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_URL}/categories`);
        const json = await res.json();
        if (json.success) {
          setCategories([
            { id: "all", name: "All" },
            ...json.data.map((cat: any) => ({
              id: cat._id,
              name: cat.name,
            })),
          ]);
        }
      } catch (err) {
        console.error("Failed to fetch categories", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch user's trades
  useEffect(() => {
    if (user?._id) {
      const fetchUserTrades = async () => {
        try {
          const res = await fetch(`${API_URL}/trades?user=${user._id}`);
          const json = await res.json();
          if (json.success) {
            setUserTrades(json.data);
          }
        } catch (err) {
          console.error("Failed to fetch user trades", err);
        }
      };
      fetchUserTrades();
    }
  }, [user]);

  // Fetch all other trades and generate recommendations
  useEffect(() => {
    const fetchTradesAndRecommendations = async () => {
      try {
        // Fetch all trades except user's own
        const res = await fetch(`${API_URL}/trades`);
        const json = await res.json();

        if (json.success) {
          const otherTrades = json.data.filter(
            (trade: any) => trade.user._id !== user?._id
          );
          setTrades(otherTrades);

          // Generate recommendations based on value comparison
          if (userTrades.length > 0) {
            const recs = generateRecommendations(userTrades, otherTrades);
            setRecommendations(recs);
          }
        }
      } catch (err) {
        console.error("Failed to fetch trades", err);
      }
    };

    fetchTradesAndRecommendations();
  }, [user, userTrades]);

  // Function to generate trade recommendations
  const generateRecommendations = (userTrades: any[], otherTrades: any[]) => {
    const recs: any[] = [];

    userTrades.forEach((userTrade) => {
      otherTrades.forEach((otherTrade) => {
        // Simple value comparison (you can enhance this logic)
        const userValue = userTrade.items.reduce(
          (sum: number, item: any) => sum + (item.value || 0),
          0
        );
        const otherValue = otherTrade.items.reduce(
          (sum: number, item: any) => sum + (item.value || 0),
          0
        );

        // If values are within 20% of each other, consider it a potential match
        if (Math.abs(userValue - otherValue) <= userValue * 0.2) {
          recs.push({
            userTrade,
            otherTrade,
            valueDifference: Math.abs(userValue - otherValue),
            matchScore:
              100 - (Math.abs(userValue - otherValue) / userValue) * 100,
          });
        }
      });
    });

    // Sort by best match first
    return recs.sort((a, b) => b.matchScore - a.matchScore);
  };

  // Filter trades based on search and category
  const filteredTrades = trades.filter((trade) => {
    const matchesSearch =
      trade.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trade.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      trade.categories.some((cat: any) => cat._id === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Trades</Text>
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />
      </View>

      {/* Categories */}
      <FlatList
        horizontal
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Text
            style={[
              styles.category,
              selectedCategory === item.id && styles.selectedCategory,
            ]}
            onPress={() => setSelectedCategory(item.id)}
          >
            {item.name}
          </Text>
        )}
        contentContainerStyle={styles.categories}
        showsHorizontalScrollIndicator={false}
      />
      <FlatList
        data={filteredTrades}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <ListingCard
            onPress={() => {
              setSelectedTrade(item);
              setModalVisible(true);
            }}
            listing={item}
          />
        )}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={{
          ...styles.listings,
          flexGrow: 1,
          paddingHorizontal: 20,
        }}
        ListHeaderComponent={
          <View>
            {/* Recommendations Section */}
            {recommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recommended for You</Text>
                <FlatList
                  horizontal
                  data={recommendations.slice(0, 5)}
                  keyExtractor={(item, index) => `rec-${index}`}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.recommendationCard}
                      onPress={() => {
                        setSelectedRecommendation(item);
                        setRecommendationModalVisible(true);
                      }}
                    >
                      <Image
                        source={{
                          uri:
                            item.userTrade.items[0]?.images?.[0] ||
                            PLACEHOLDER_IMAGE,
                        }}
                        style={styles.recommendationImage}
                      />

                      <View className="flex flex-row items-center py-2">
                        <MaterialCommunityIcons
                          name="swap-vertical"
                          size={24}
                          color="black"
                        />
                        <View>
                          <Text style={styles.recommendationText}>
                            Trade your {item.userTrade.title}
                          </Text>
                          <Text style={styles.recommendationText}>
                            For {item.otherTrade.title}
                          </Text>
                        </View>
                      </View>
                      <Image
                        source={{
                          uri:
                            item.otherTrade.items[0]?.images?.[0] ||
                            PLACEHOLDER_IMAGE,
                        }}
                        style={styles.recommendationImage}
                      />
                      <Text style={styles.matchScore}>
                        {item.matchScore.toFixed(0)}% Match
                      </Text>
                    </TouchableOpacity>
                  )}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.recommendationsList}
                />
              </View>
            )}

            {/* Available Trades Section Title */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Available Trades</Text>
            </View>
          </View>
        }
      />
      <TradeModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        trade={selectedTrade}
        userTrades={userTrades}
        allTrades={trades}
      />
      {/* Recommendation Detail Modal */}
      {selectedRecommendation && (
        <Modal
          visible={recommendationModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setRecommendationModalVisible(false)}
        >
          <View style={modalStyles.modalOverlay}>
            <View style={modalStyles.modalContent}>
              <TouchableOpacity
                style={modalStyles.closeButton}
                onPress={() => setRecommendationModalVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>

              <ScrollView>
                <View style={modalStyles.section}>
                  <Text style={modalStyles.sectionTitle}>
                    Trade Recommendation
                  </Text>
                  <Text style={modalStyles.matchScore}>
                    {selectedRecommendation.matchScore.toFixed(0)}% Match
                  </Text>
                </View>

                {/* Your Item */}
                <View style={modalStyles.section}>
                  <Text style={modalStyles.subSectionTitle}>Your Item</Text>
                  <TradeItem trade={selectedRecommendation.userTrade} />
                </View>

                {/* Their Item */}
                <View style={modalStyles.section}>
                  <Text style={modalStyles.subSectionTitle}>Their Item</Text>
                  <TradeItem trade={selectedRecommendation.otherTrade} />
                </View>

                {/* Value Comparison */}
                <View style={modalStyles.section}>
                  <Text style={modalStyles.subSectionTitle}>
                    Value Comparison
                  </Text>
                  <View style={modalStyles.valueComparison}>
                    <Text style={modalStyles.valueText}>
                      Your value: $
                      {selectedRecommendation.userTrade.items.reduce(
                        (sum: number, item: any) => sum + (item.value || 0),
                        0
                      )}
                    </Text>
                    <Text style={modalStyles.valueText}>
                      Their value: $
                      {selectedRecommendation.otherTrade.items.reduce(
                        (sum: number, item: any) => sum + (item.value || 0),
                        0
                      )}
                    </Text>
                    {selectedRecommendation.valueDifference > 0 && (
                      <Text style={modalStyles.differenceText}>
                        {selectedRecommendation.userValue >
                        selectedRecommendation.otherValue
                          ? `You would need to add $${selectedRecommendation.valueDifference}`
                          : `They would need to add $${selectedRecommendation.valueDifference}`}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Alternative Matches */}
                <View style={modalStyles.section}>
                  <Text style={modalStyles.subSectionTitle}>
                    Alternative Matches
                  </Text>
                  {generateRecommendations(
                    [selectedRecommendation.userTrade],
                    trades
                  )
                    .filter(
                      (rec: any) =>
                        rec.matchScore >= 60 &&
                        rec.otherTrade._id !==
                          selectedRecommendation.otherTrade._id
                    )
                    .slice(0, 3)
                    .map((rec: any, index: number) => (
                      <View key={index} style={modalStyles.alternativeMatch}>
                        <Text style={modalStyles.alternativeTitle}>
                          {rec.otherTrade.title} ({rec.matchScore.toFixed(0)}%
                          match)
                        </Text>
                        <Text style={modalStyles.alternativeValue}>
                          Value: $
                          {rec.otherTrade.items.reduce(
                            (sum: number, item: any) => sum + (item.value || 0),
                            0
                          )}
                        </Text>
                        {rec.valueDifference > 0 && (
                          <Text style={modalStyles.alternativeDifference}>
                            {rec.userValue > rec.otherValue
                              ? `You add $${rec.valueDifference}`
                              : `They add $${rec.valueDifference}`}
                          </Text>
                        )}
                      </View>
                    ))}
                </View>
              </ScrollView>

              <TouchableOpacity
                style={modalStyles.actionButton}
                onPress={() => {
                  // Handle trade initiation
                  setRecommendationModalVisible(false);
                }}
              >
                <Text style={modalStyles.actionButtonText}>Initiate Trade</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

// TradeItem component for rendering trade details in modal
const TradeItem = ({ trade }: { trade: any }) => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    paddingVertical: 20,
  },
  header: {
    padding: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  categories: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  category: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderRadius: 20,
    height: 40,
    backgroundColor: "#e0e0e0",
    color: "#333",
  },
  selectedCategory: {
    backgroundColor: "#2196F3",
    color: "white",
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  recommendationsList: {
    paddingVertical: 10,
  },
  recommendationCard: {
    width: 200,
    marginRight: 15,
    padding: 15,
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recommendationText: {
    fontSize: 12,
    marginBottom: 5,
  },
  recommendationImage: {
    width: "100%",
    height: 100,
    borderRadius: 8,
    marginBottom: 5,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  matchScore: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  listings: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 10,
  },
});

// Add these styles to your existing StyleSheet
const modalStyles = StyleSheet.create({
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
  subSectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  matchScore: {
    fontSize: 18,
    color: "#4CAF50",
    fontWeight: "bold",
    marginBottom: 10,
  },
  valueComparison: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
  },
  valueText: {
    fontSize: 16,
    marginBottom: 5,
  },
  differenceText: {
    fontSize: 16,
    color: "#2196F3",
    fontWeight: "bold",
    marginTop: 5,
  },
  alternativeMatch: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  alternativeTitle: {
    fontWeight: "bold",
  },
  alternativeValue: {
    color: "#4CAF50",
  },
  alternativeDifference: {
    color: "#2196F3",
    fontSize: 12,
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
