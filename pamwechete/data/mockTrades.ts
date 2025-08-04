// data/mockTrades.ts
import { Trade } from "@/types";
import { mockListings } from "./mockiListings";

export const mockTrades: Trade[] = [
  {
    id: "trade1",
    listing: mockListings[0],
    status: "pending",
    proposedBy: {
      id: "user2",
      displayName: "Jamie",
      photoURL: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    proposedAt: new Date(),
    offer: {
      barterItems: [mockListings[1]]
    }
  },
    {
    id: "trade2",
    listing: mockListings[1],
    status: "pending",
    proposedBy: {
      id: "user2",
      displayName: "Thomas",
      photoURL: "https://images.unsplash.com/photo-1686945127938-0296f10937ed?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
    },
    proposedAt: new Date(),
    offer: {
      barterItems: [mockListings[2]]
    }
  }
];