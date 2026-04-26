import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  menuItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true,
  },
  name: String,
  quantity: Number,
  price: Number,
  size: String,
  spiceLevel: String,
  addOns: [String],
  notes: String,
  subtotal: Number,
});

const orderSchema = new mongoose.Schema(
  {
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Student ID is required'],
    },
    orderItems: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
    },
    orderType: {
      type: String,
      enum: {
        values: ['Pickup', 'Delivery'],
        message: 'Order type must be either Pickup or Delivery',
      },
      required: [true, 'Order type is required'],
    },
    deliveryAddress: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'],
        message: 'Status must be Pending, Preparing, Ready, Completed, or Cancelled',
      },
      default: 'Pending',
    },
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor is required'],
    },
    cancellationDeadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);

export default Order;