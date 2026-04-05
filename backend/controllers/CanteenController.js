import CanteenVendor from "../models/CanteenModel.js";
import User from "../models/UserModel.js";

// Create a new canteen vendor
export const createVendor = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      openingTime,
      closingTime,
      location,
      phone,
      specialties,
      priceRange,
      image,
      status,
      operatingDays,
      paymentMethods,
      averagePreparationTime,
      menuItems,
    } = req.body;

    // Convert status to isActive for backward compatibility
    const isActive = status !== 'inactive';

    const vendor = new CanteenVendor({
      name,
      category,
      description,
      openingTime,
      closingTime,
      location,
      phone,
      specialties: specialties || [],
      priceRange: priceRange || "$$",
      image: image || "",
      status: status || "active",
      isActive,
      operatingDays: operatingDays || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      paymentMethods: paymentMethods || ["cash"],
      averagePreparationTime: averagePreparationTime || 15,
      menuItems: menuItems || [],
      owner: req.user.id,
    });

    await vendor.save();
    await vendor.populate('owner', 'fullName email');

    res.status(201).json({
      success: true,
      message: "Vendor created successfully",
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating vendor",
      error: error.message,
    });
  }
};

// Get all vendors (with pagination and filtering)
export const getAllVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const search = req.query.search;
    const priceRange = req.query.priceRange;
    const owner = req.query.owner;
    const isActiveParam = req.query.isActive;

    let query = {};

    // If fetching by owner, don't filter by status (show all statuses)
    if (owner) {
      query.owner = owner;
      // Don't set isActive filter when fetching by owner
    } else if (isActiveParam !== 'all') {
      // Only apply status filter when not fetching by owner and isActive is not 'all'
      query.isActive = isActiveParam !== 'false';
    }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { specialties: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    if (priceRange) {
      query.priceRange = priceRange;
    }

    const vendors = await CanteenVendor.find(query)
      .populate('owner', 'fullName email')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CanteenVendor.countDocuments(query);

    res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendors",
      error: error.message,
    });
  }
};

// Get vendor by ID
export const getVendorById = async (req, res) => {
  try {
    const vendor = await CanteenVendor.findById(req.params.id)
      .populate('owner', 'fullName email');

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    res.status(200).json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendor",
      error: error.message,
    });
  }
};

// Update vendor
export const updateVendor = async (req, res) => {
  try {
    const {
      name,
      category,
      description,
      openingTime,
      closingTime,
      location,
      phone,
      specialties,
      priceRange,
      image,
      status,
      isActive,
      operatingDays,
      paymentMethods,
      averagePreparationTime,
      menuItems,
    } = req.body;

    const vendor = await CanteenVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Check if user is owner or admin
    if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this vendor",
      });
    }

    // Convert status to isActive for backward compatibility
    const finalIsActive = status !== undefined ? (status !== 'inactive') : (isActive !== undefined ? isActive : vendor.isActive);

    const updatedVendor = await CanteenVendor.findByIdAndUpdate(
      req.params.id,
      {
        name,
        category,
        description,
        openingTime,
        closingTime,
        location,
        phone,
        specialties,
        priceRange,
        image,
        status: status || vendor.status,
        isActive: finalIsActive,
        operatingDays,
        paymentMethods,
        averagePreparationTime,
        menuItems,
      },
      { new: true, runValidators: true }
    ).populate('owner', 'fullName email');

    res.status(200).json({
      success: true,
      message: "Vendor updated successfully",
      data: updatedVendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating vendor",
      error: error.message,
    });
  }
};

// Delete vendor
export const deleteVendor = async (req, res) => {
  try {
    const vendor = await CanteenVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Check if user is owner or admin
    if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this vendor",
      });
    }

    await CanteenVendor.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Vendor deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting vendor",
      error: error.message,
    });
  }
};

// Add rating and review
export const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;

    if (!rating || rating < 0 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 0 and 5",
      });
    }

    const vendor = await CanteenVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Update rating (simplified - in production you'd store individual reviews)
    const currentTotalRating = vendor.rating * vendor.reviews;
    vendor.reviews += 1;
    vendor.rating = (currentTotalRating + rating) / vendor.reviews;

    await vendor.save();

    res.status(200).json({
      success: true,
      message: "Rating added successfully",
      data: {
        rating: vendor.rating,
        reviews: vendor.reviews,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding rating",
      error: error.message,
    });
  }
};

// Get vendors by category
export const getVendorsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const vendors = await CanteenVendor.find({ category, isActive: true })
      .populate('owner', 'fullName email')
      .sort({ rating: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CanteenVendor.countDocuments({ category, isActive: true });

    res.status(200).json({
      success: true,
      data: vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendors by category",
      error: error.message,
    });
  }
};

// Get vendor statistics
export const getVendorStats = async (req, res) => {
  try {
    const totalVendors = await CanteenVendor.countDocuments({ isActive: true });
    const categoryStats = await CanteenVendor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const averageRating = await CanteenVendor.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalVendors,
        categoryStats,
        averageRating: averageRating[0]?.avgRating || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendor statistics",
      error: error.message,
    });
  }
};

// Get vendor menu items
export const getVendorMenu = async (req, res) => {
  try {
    const vendor = await CanteenVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const availableMenuItems = vendor.menuItems.filter(item => item.isAvailable);

    res.status(200).json({
      success: true,
      data: availableMenuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching vendor menu",
      error: error.message,
    });
  }
};

// Add menu item to vendor
export const addMenuItem = async (req, res) => {
  try {
    const { name, price, category, description, preparationTime } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: "Menu item name and price are required",
      });
    }

    const vendor = await CanteenVendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Check if user is owner or admin
    if (vendor.owner.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: "Not authorized to add menu items to this vendor",
      });
    }

    const menuItem = {
      name,
      price,
      category: category || "",
      description: description || "",
      preparationTime: preparationTime || 15,
      isAvailable: true,
    };

    vendor.menuItems.push(menuItem);
    await vendor.save();

    res.status(201).json({
      success: true,
      message: "Menu item added successfully",
      data: menuItem,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error adding menu item",
      error: error.message,
    });
  }
};
