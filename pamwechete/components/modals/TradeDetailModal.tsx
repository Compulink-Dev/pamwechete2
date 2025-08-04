import { Trade } from "@/types";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface TradeDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  trade: Trade | null;
  onEdit: () => void;
  onDelete: () => void;
  isOwner: boolean;
}

export const TradeDetailsModal = ({
  visible,
  onClose,
  trade,
  onEdit,
  onDelete,
  isOwner,
}: TradeDetailsModalProps) => {
  if (!trade) return null;

  const handleDelete = () => {
    Alert.alert("Delete Trade", "Are you sure you want to delete this trade?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: onDelete },
    ]);
  };

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
            <View style={styles.section}>
              <Text style={styles.title}>{trade.title}</Text>
              <Text style={styles.description}>{trade.description}</Text>

              {trade.type === "services" && (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Service Type:</Text>
                    <Text style={styles.detailValue}>
                      {trade.serviceDetails?.type || "Not specified"}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Duration:</Text>
                    <Text style={styles.detailValue}>
                      {trade.serviceDetails?.duration || "0"} hours
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Price:</Text>
                    <Text style={styles.detailValue}>
                      ${trade.cashAmount > 0 ? trade.cashAmount : "Negotiable"}
                    </Text>
                  </View>
                  {trade.serviceDetails?.skillsRequired?.length > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Skills:</Text>
                      <Text style={styles.detailValue}>
                        {trade.serviceDetails.skillsRequired.join(", ")}
                      </Text>
                    </View>
                  )}
                </>
              )}

              {trade.type !== "services" && (
                <ScrollView horizontal style={styles.imagesContainer}>
                  {trade.items.flatMap((item) =>
                    item.images?.map((img, idx) => (
                      <Image
                        key={`${item._id}-${idx}`}
                        source={{ uri: img }}
                        style={styles.image}
                      />
                    ))
                  )}
                </ScrollView>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Type:</Text>
                <Text style={styles.detailValue}>{trade.type}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Status:</Text>
                <Text style={styles.detailValue}>{trade.status}</Text>
              </View>

              {trade.type !== "services" && (
                <>
                  <Text style={styles.sectionTitle}>Items</Text>
                  {trade.items.map((item, index) => (
                    <View key={index} style={styles.itemContainer}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemDescription}>
                        {item.description}
                      </Text>
                      <Text style={styles.itemValue}>
                        Value: ${item.value || 0}
                      </Text>
                      <Text style={styles.itemCondition}>
                        Condition: {item.condition}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              {trade.cashAmount > 0 && trade.type !== "services" && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Cash Amount:</Text>
                  <Text style={styles.detailValue}>${trade.cashAmount}</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {isOwner && (
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.editButton]}
                onPress={onEdit}
              >
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  imagesContainer: {
    marginVertical: 10,
  },
  image: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: "#666",
  },
  detailValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 15,
    marginBottom: 10,
  },
  itemContainer: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  itemName: {
    fontWeight: "bold",
    fontSize: 16,
  },
  itemDescription: {
    color: "#666",
    marginVertical: 5,
  },
  itemValue: {
    color: "#4CAF50",
  },
  itemCondition: {
    color: "#2196F3",
    marginTop: 5,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: "#2196F3",
  },
  deleteButton: {
    backgroundColor: "#f44336",
  },
  actionButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});
