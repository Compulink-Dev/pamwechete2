// components/CreateTradeForm.tsx
import { useAuth } from "@/utils/authContext";
//@ts-ignore
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "https://pamwechete-server.onrender.com/api/v1/trades";
const CATEGORY_API = "https://pamwechete-server.onrender.com/api/v1/categories";

type Props = {
  onCancel: () => void;
  onSuccess: () => void;
};

type Category = {
  name: string;
  slug: string;
};

export default function CreateTradeForm({ onCancel, onSuccess }: Props) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState("");
  const [currentSkill, setCurrentSkill] = useState("");
  const [availableCategories, setAvailableCategories] = useState<Category[]>(
    []
  );
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "goods",
    categories: [] as string[],
    items: [
      {
        name: "",
        description: "",
        condition: "used",
        images: [] as string[],
        value: 0,
      },
    ],
    serviceDetails: {
      type: "digital",
      duration: 0,
      skillsRequired: [] as string[],
      price: 0,
      value: 0,
    },
    cashAmount: 0,
    status: "pending",
  });

  // console.log("CreateTradeForm user:", user);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(CATEGORY_API);
        const data = await res.json();
        // console.log("Fetched categories:", data); // <-- Add this
        if (res.ok) {
          setAvailableCategories(data.data);
        } else {
          throw new Error(data.message || "Failed to load categories");
        }
      } catch (err) {
        Alert.alert("Error", "Failed to load categories");
        console.error(err);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    // console.log("Available categories:", availableCategories);
  }, [availableCategories]);

  const addCategory = () => {
    if (currentCategory && !formData.categories.includes(currentCategory)) {
      setFormData({
        ...formData,
        categories: [...formData.categories, currentCategory],
      });
      setCurrentCategory("");
    }
  };

  const removeCategory = (category: string) => {
    setFormData({
      ...formData,
      categories: formData.categories.filter((c) => c !== category),
    });
  };

  const addSkill = () => {
    if (
      currentSkill &&
      !formData.serviceDetails.skillsRequired.includes(currentSkill)
    ) {
      setFormData({
        ...formData,
        serviceDetails: {
          ...formData.serviceDetails,
          skillsRequired: [
            ...formData.serviceDetails.skillsRequired,
            currentSkill,
          ],
        },
      });
      setCurrentSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setFormData({
      ...formData,
      serviceDetails: {
        ...formData.serviceDetails,
        skillsRequired: formData.serviceDetails.skillsRequired.filter(
          (s) => s !== skill
        ),
      },
    });
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.description) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (formData.type === "services" && formData.serviceDetails.duration <= 0) {
      Alert.alert("Error", "Please enter a valid duration for services");
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        categories: formData.categories,
        user: user?.id,
        status: "pending",
      };

      if (formData.type === "goods") payload.items = formData.items;
      if (formData.type === "services") {
        payload.serviceDetails = {
          ...formData.serviceDetails,
          price: formData.serviceDetails.price,
          value: formData.serviceDetails.value,
        };
      }
      if (formData.type === "cash") payload.cashAmount = formData.cashAmount;

      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Failed to create trade");
      }
      onSuccess();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create trade");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Trade</Text>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Trade Type*</Text>
        <Picker
          selectedValue={formData.type}
          onValueChange={(value: any) =>
            setFormData({ ...formData, type: value })
          }
          style={styles.picker}
          dropdownIconColor="black" // optional: changes the dropdown arrow color on Android
        >
          <Picker.Item label="Goods" value="goods" />
          <Picker.Item label="Services" value="services" />
          <Picker.Item label="Cash" value="cash" />
        </Picker>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Title*</Text>
        <TextInput
          style={styles.input}
          value={formData.title}
          onChangeText={(text) => setFormData({ ...formData, title: text })}
          placeholder="Enter trade title"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Description*</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={formData.description}
          onChangeText={(text) =>
            setFormData({ ...formData, description: text })
          }
          placeholder="Enter trade description"
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Categories*</Text>

        {/* Picker for selecting a category */}
        <View
          style={{
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            marginBottom: 10,
          }}
        >
          <Picker
            selectedValue={currentCategory}
            onValueChange={(value: any) => {
              // console.log("Selected category:", value);
              setCurrentCategory(value);
            }}
            style={styles.picker}
            dropdownIconColor="black"
          >
            <Picker.Item label="Select Category" value="" />
            {availableCategories.map((cat) => (
              <Picker.Item key={cat.slug} label={cat.name} value={cat.slug} />
            ))}
          </Picker>

          <TouchableOpacity style={styles.addButton} onPress={addCategory}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.tagsContainer}>
          {formData.categories.map((categorySlug) => {
            const name =
              availableCategories.find((c) => c.slug === categorySlug)?.name ||
              categorySlug;
            return (
              <View key={categorySlug} style={styles.tag}>
                <Text style={styles.tagText}>{name}</Text>
                <TouchableOpacity onPress={() => removeCategory(categorySlug)}>
                  <Text style={styles.tagRemove}>×</Text>
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      </View>

      {formData.type === "goods" && (
        <>
          <Text style={styles.sectionTitle}>Item Details</Text>
          {formData.items.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                  style={styles.input}
                  value={item.name}
                  onChangeText={(text) => {
                    const newItems = [...formData.items];
                    newItems[index].name = text;
                    setFormData({ ...formData, items: newItems });
                  }}
                  placeholder="Enter item name"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Item Description</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  value={item.description}
                  onChangeText={(text) => {
                    const newItems = [...formData.items];
                    newItems[index].description = text;
                    setFormData({ ...formData, items: newItems });
                  }}
                  placeholder="Enter item description"
                  multiline
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Condition</Text>
                <Picker
                  selectedValue={item.condition}
                  style={styles.picker}
                  dropdownIconColor="black"
                  onValueChange={(value: any) => {
                    const newItems = [...formData.items];
                    newItems[index].condition = value;
                    setFormData({ ...formData, items: newItems });
                  }}
                >
                  <Picker.Item label="New" value="new" />
                  <Picker.Item label="Used" value="used" />
                  <Picker.Item label="Refurbished" value="refurbished" />
                </Picker>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Estimated Value</Text>
                <TextInput
                  style={styles.input}
                  value={item.value.toString()}
                  onChangeText={(text) => {
                    const newItems = [...formData.items];
                    newItems[index].value = parseFloat(text) || 0;
                    setFormData({ ...formData, items: newItems });
                  }}
                  placeholder="Enter estimated value"
                  keyboardType="numeric"
                />
              </View>
            </View>
          ))}
        </>
      )}

      {formData.type === "services" && (
        <>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Type*</Text>
            <Picker
              selectedValue={formData.serviceDetails.type}
              style={styles.picker}
              dropdownIconColor="black"
              onValueChange={(value: any) =>
                setFormData({
                  ...formData,
                  serviceDetails: {
                    ...formData.serviceDetails,
                    type: value,
                  },
                })
              }
            >
              <Picker.Item label="Physical" value="physical" />
              <Picker.Item label="Digital" value="digital" />
              <Picker.Item label="Consultation" value="consultation" />
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Duration (hours)*</Text>
            <TextInput
              style={styles.input}
              value={formData.serviceDetails.duration.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  serviceDetails: {
                    ...formData.serviceDetails,
                    duration: parseFloat(text) || 0,
                  },
                })
              }
              placeholder="Enter duration in hours"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Skills Required</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                value={currentSkill}
                onChangeText={setCurrentSkill}
                placeholder="Add skill"
                onSubmitEditing={addSkill}
              />
              <TouchableOpacity style={styles.addButton} onPress={addSkill}>
                <Text style={styles.addButtonText}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.tagsContainer}>
              {formData.serviceDetails.skillsRequired.map((skill) => (
                <View key={skill} style={styles.tag}>
                  <Text style={styles.tagText}>{skill}</Text>
                  <TouchableOpacity onPress={() => removeSkill(skill)}>
                    <Text style={styles.tagRemove}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Service Price (USD)</Text>
            <TextInput
              style={styles.input}
              value={formData.serviceDetails.price.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  serviceDetails: {
                    ...formData.serviceDetails,
                    price: parseFloat(text) || 0,
                  },
                })
              }
              placeholder="Enter service price"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Estimated Value (USD)</Text>
            <TextInput
              style={styles.input}
              value={formData.serviceDetails.value.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  serviceDetails: {
                    ...formData.serviceDetails,
                    value: parseFloat(text) || 0,
                  },
                })
              }
              placeholder="Enter estimated value"
              keyboardType="numeric"
            />
          </View>
        </>
      )}

      {formData.type === "cash" && (
        <View style={styles.formGroup}>
          <Text style={styles.label}>Cash Amount*</Text>
          <TextInput
            style={styles.input}
            value={formData.cashAmount.toString()}
            onChangeText={(text) =>
              setFormData({ ...formData, cashAmount: parseFloat(text) || 0 })
            }
            placeholder="Enter cash amount"
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.submitButton]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? "Creating..." : "Create Trade"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  formGroup: {
    marginBottom: 15,
  },
  label: {
    marginBottom: 5,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  itemContainer: {
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    marginBottom: 30,
  },
  button: {
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#ccc",
  },
  submitButton: {
    backgroundColor: "#2196F3",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tagInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: "#2196F3",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  addButtonText: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e1f5fe",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    marginRight: 5,
  },
  tagRemove: {
    color: "#2196F3",
    fontWeight: "bold",
    fontSize: 16,
  },
  picker: {
    color: "black", // <-- this sets the text color of the picker
    backgroundColor: "#f0f0f0", // <-- background of picker
    borderRadius: 6,
  },
});
