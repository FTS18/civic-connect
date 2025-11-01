export interface Issue {
  id: string;
  userId: string;
  title: string;
  category: string;
  description: string;
  location: {
    lat: number;
    lng: number;
  };
  address?: string;
  photos?: string[];
  status: "reported" | "inProgress" | "resolved";
  createdAt: Date;
  updatedAt: Date;
  upvotes: number;
  comments: Comment[];
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: Date;
}

export type IssueCategory = 
  | "pothole"
  | "traffic"
  | "streetLight"
  | "water"
  | "garbage"
  | "pollution"
  | "other";

export const ISSUE_CATEGORIES: Record<IssueCategory, string> = {
  pothole: "🚗 Pothole",
  traffic: "🚦 Traffic Issue",
  streetLight: "💡 Street Light",
  water: "💧 Water Supply",
  garbage: "🗑️ Garbage",
  pollution: "💨 Pollution",
  other: "📝 Other",
};
