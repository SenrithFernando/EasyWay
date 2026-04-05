import mongoose from 'mongoose';

const menuItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A menu item must have a name'],
      trim: true,
      maxlength: [100, 'Name must be at most 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description must be at most 500 characters'],
    },
    price: {
      type: Number,
      required: [true, 'A menu item must have a price'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'A menu item must have a category'],
      enum: {
        values: ['rice', 'snack', 'beverage', 'dessert', 'other'],
        message: 'Category must be one of: rice, snack, beverage, dessert, other',
      },
    },
    image: {
      type: String,
    },
    available: {
      type: Boolean,
      default: true,
    },
    preparationTime: {
      type: Number,
      min: [0, 'Preparation time cannot be negative'],
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'A menu item must belong to a vendor'],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound index: unique name per vendor
menuItemSchema.index({ name: 1, vendor: 1 }, { unique: true });

const MenuItem = mongoose.model('MenuItem', menuItemSchema);

export default MenuItem;