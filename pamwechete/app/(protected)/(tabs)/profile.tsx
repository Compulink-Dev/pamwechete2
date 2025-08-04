// app/(tabs)/profile.tsx
import { useAuth } from "@/utils/authContext";
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

export default function Profile() {
  const { user, logOut } = useAuth(); // Assuming your auth context provides user data

  const menuItems = [
    { icon: "settings", label: "Settings" },
    { icon: "history", label: "Trade History" },
    { icon: "star", label: "Ratings & Reviews" },
    { icon: "help", label: "Help & Support" },
    { icon: "logout", label: "Logout", action: logOut },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image
          source={{ uri: user?.photoURL || "https://placekitten.com/100/100" }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{user?.username || "Guest User"}</Text>
        <Text style={styles.location}>{user?.location || "Harare, ZW"}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>24</Text>
            <Text style={styles.statLabel}>Trades</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>4.8</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>12</Text>
            <Text style={styles.statLabel}>Items</Text>
          </View>
        </View>
      </View>

      <View style={styles.menu}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.action}
          >
            <Icon name={item.icon} size={24} color="#666" />
            <Text style={styles.menuItemText}>{item.label}</Text>
            <Icon name="chevron-right" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  location: {
    fontSize: 16,
    color: "#666",
    marginBottom: 15,
  },
  stats: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
  },
  menu: {
    padding: 15,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
  },
});
