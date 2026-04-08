import mongoose from "mongoose";

const canteenVendorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Vendor name is required"],
      trim: true,
    },
    category: {
      type: String,
      enum: ["beverages", "snacks", "meals", "all"],
      default: "all",
      required: [true, "Category is required"],
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    image: {
      type: String,
      trim: true,
      default: "",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    openingTime: {
      type: String,
      required: [true, "Opening time is required"],
      trim: true,
    },
    closingTime: {
      type: String,
      required: [true, "Closing time is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    specialties: [{
      type: String,
      trim: true,
    }],
    priceRange: {
      type: String,
      enum: ["$", "$$", "$$$", "$$$$"],
      default: "$$",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "maintenance"],
      default: "active",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    operatingDays: [{
      type: String,
      enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      default: "Monday",
    }],
    paymentMethods: [{
      type: String,
      enum: ["cash", "card", "mobile", "campus_card"],
      default: "cash",
    }],
    averagePreparationTime: {
      type: Number, // in minutes
      default: 15,
    },
    menuItems: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      price: {
        type: Number,
        required: true,
        min: 0,
      },
      category: {
        type: String,
        trim: true,
      },
      description: {
        type: String,
        trim: true,
      },
      isAvailable: {
        type: Boolean,
        default: true,
      },
      preparationTime: {
        type: Number, // in minutes
        default: 15,
      },
    }],
  },
  {
    timestamps: true,
  }
);

const CanteenVendor = mongoose.model("CanteenVendor", canteenVendorSchema);

export default CanteenVendor;
