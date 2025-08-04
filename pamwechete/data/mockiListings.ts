// data/mockListings.ts
import { Listing } from "@/types";

export const mockListings: Listing[] = [
  {
    id: "1",
    title: "Vintage Camera",
    description: "Like new condition, barely used. Looking to trade for musical instruments.",
    image: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f",
    category: "electronics",
    barterValue: "High value",
    cashValue: 250,
    distance: 2.5,
    owner: {
      id: "user1",
      displayName: "Alex",
      photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
      rating: 4.8
    },
    createdAt: new Date()
  },
    {
    id: "2",
    title: "Dump Truck",
    description: "Like new condition, barely used",
    image: "https://images.unsplash.com/photo-1686945127938-0296f10937ed?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    category: "vehicles",
    barterValue: "High value",
    cashValue: 2500,
    distance: 2.5,
    owner: {
      id: "user1",
      displayName: "Alex",
      photoURL: "https://randomuser.me/api/portraits/men/1.jpg",
      rating: 4.8
    },
    createdAt: new Date()
  },
  // Add more listings as needed
];