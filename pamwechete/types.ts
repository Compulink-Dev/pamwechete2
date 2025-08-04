// types.ts
export interface User {
  _id: string;
  displayName: string;
  photoURL?: string;
  email?: string;
  location?: string;
  rating?: number;
  token?: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  image: string;
  category: string;
  barterValue: string;
  cashValue?: number;
  distance: number;
  owner: User;
  createdAt: Date;
}


export type Trade = {
  _id: string;
  user: string | User;
  type: "goods" | "services" | "cash";
  title: string;
  description: string;
  categories: string[];
  items: {
    _id: string;
    name: string;
    description: string;
    condition: "new" | "used" | "refurbished";
    images?: string[];
    value: number;
  }[];
  serviceDetails?: {
    type: "physical" | "digital" | "consultation";
    duration: number;
    skillsRequired: string[];
  };
  cashAmount: number;
  location?: {
    type: string;
    coordinates: number[];
    formattedAddress: string;
  };
  status: "pending" | "active" | "completed" | "cancelled";
  fiscalReceipt?: string;
    image?: string; // Main image URL
  proposedBy?: { // Only if this is a trade proposal system
    _id: string;
    displayName: string;
  };
  createdAt: string;
  updatedAt: string;
};