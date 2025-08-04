// app/(tabs)/explore.tsx
import CreateTradeForm from "@/components/CreateTradeForm";
import { TradeDetailsModal } from "@/components/modals/TradeDetailModal";
import TradeCard from "@/components/TradeCard";
import { Trade } from "@/types";
import { useAuth } from "@/utils/authContext";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const API_URL = "https://pamwechete-server.onrender.com/api/v1/trades";

export default function Explore() {
  const [activeTab, setActiveTab] = useState<"pending" | "completed">(
    "pending"
  );
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isTradeDetailsModalVisible, setIsTradeDetailsModalVisible] =
    useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const { user } = useAuth();

  // Debugging function
  const logTradePress = (trade: Trade) => {
    console.log("Trade pressed:", trade._id);
    console.log("Setting selected trade:", trade);
    setSelectedTrade(trade);
    console.log("Opening modal...");
    setIsTradeDetailsModalVisible(true);
  };

  const handleEdit = () => {
    setIsTradeDetailsModalVisible(false);
    console.log("Edit trade:", selectedTrade?._id);
  };

  const handleDelete = async () => {
    if (!selectedTrade) return;

    try {
      const response = await fetch(`${API_URL}/${selectedTrade._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });

      if (response.ok) {
        fetchTrades();
        setIsTradeDetailsModalVisible(false);
      } else {
        throw new Error("Failed to delete trade");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to delete trade");
      console.error(error);
    }
  };

  const fetchTrades = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}?user=${user?._id}`, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setTrades(data.data);
      } else {
        throw new Error(data.message || "Failed to fetch trades");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch trades");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTrades();
    }
  }, [user]);

  const filteredTrades = trades.filter((trade) =>
    activeTab === "pending"
      ? trade.status === "pending"
      : trade.status === "completed"
  );

  const handleTradeCreated = () => {
    setIsCreateModalVisible(false);
    fetchTrades();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Explore</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => setIsCreateModalVisible(true)}
        >
          <Text style={styles.createButtonText}>+ Create</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "pending" && styles.activeTab]}
          onPress={() => setActiveTab("pending")}
        >
          <Text
            style={
              activeTab === "pending" ? styles.activeTabText : styles.tabText
            }
          >
            Pending
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "completed" && styles.activeTab]}
          onPress={() => setActiveTab("completed")}
        >
          <Text
            style={
              activeTab === "completed" ? styles.activeTabText : styles.tabText
            }
          >
            Completed
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading trades...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTrades}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={{ padding: 1 }}>
              <TradeCard
                trade={item}
                onPress={() => {
                  logTradePress(item);
                }}
              />
            </View>
          )}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No {activeTab} trades found</Text>
            </View>
          }
        />
      )}

      {selectedTrade && (
        <TradeDetailsModal
          visible={isTradeDetailsModalVisible}
          onClose={() => setIsTradeDetailsModalVisible(false)}
          trade={selectedTrade}
          onEdit={handleEdit}
          onDelete={handleDelete}
          isOwner={
            typeof selectedTrade.user === "string"
              ? selectedTrade.user === user?._id
              : selectedTrade.user?._id === user?._id
          }
        />
      )}

      <Modal
        visible={isCreateModalVisible}
        animationType="slide"
        onRequestClose={() => setIsCreateModalVisible(false)}
      >
        <CreateTradeForm
          onCancel={() => setIsCreateModalVisible(false)}
          onSuccess={handleTradeCreated}
        />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: "#666",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2196F3",
  },
  activeTabText: {
    color: "#2196F3",
    fontWeight: "bold",
  },
  list: {
    padding: 10,
  },
  empty: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  createButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
  },
  createButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  tradeCardContainer: {
    marginBottom: 10, // Ensure cards have some spacing
  },
});
