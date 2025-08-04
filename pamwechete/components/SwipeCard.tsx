import { Listing } from "@/types";
import { Dimensions, Image, StyleSheet, Text, View } from "react-native";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  PanGestureHandlerGestureEvent,
} from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

interface SwipeCardProps {
  listing: Listing;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export const SwipeCard = ({
  listing,
  onSwipeLeft,
  onSwipeRight,
}: SwipeCardProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const panGesture = useAnimatedGestureHandler<PanGestureHandlerGestureEvent>({
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    },
    onEnd: () => {
      const shouldDismiss = Math.abs(translateX.value) > SWIPE_THRESHOLD;
      if (shouldDismiss) {
        const direction = translateX.value > 0 ? 1 : -1;
        translateX.value = withSpring(SCREEN_WIDTH * direction * 1.5);
        translateY.value = withSpring(0);

        // Run the callback on the JS thread
        if (direction > 0 && onSwipeRight) {
          runOnJS(onSwipeRight)();
        } else if (direction < 0 && onSwipeLeft) {
          runOnJS(onSwipeLeft)();
        }
      } else {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    },
  });

  const cardStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      {
        rotate: `${(translateX.value / SCREEN_WIDTH) * 10}deg`,
      },
    ],
    opacity: 1 - Math.abs(translateX.value) / SCREEN_WIDTH,
  }));

  return (
    <GestureHandlerRootView style={styles.container}>
      <PanGestureHandler onGestureEvent={panGesture}>
        <Animated.View style={[styles.card, cardStyle]}>
          <Image
            source={{ uri: listing.image }}
            style={styles.image}
            defaultSource={{
              uri: "https://via.placeholder.com/150?text=Loading...",
            }}
          />
          <View style={styles.overlay}>
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.distance}>{listing.distance} miles away</Text>
            <Text style={styles.description} numberOfLines={3}>
              {listing.description}
            </Text>
            <View style={styles.valueContainer}>
              <Text style={styles.value}>Value: {listing.barterValue}</Text>
              {listing.cashValue && listing.cashValue > 0 && (
                <Text style={styles.cashValue}>or ${listing.cashValue}</Text>
              )}
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.3,
    backgroundColor: "white",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: "70%",
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  overlay: {
    padding: 15,
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  distance: {
    fontSize: 14,
    color: "#666",
  },
  description: {
    fontSize: 16,
    marginVertical: 8,
    color: "#555",
  },
  valueContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  cashValue: {
    fontSize: 16,
    color: "#2196F3",
  },
});
