import * as orderService from "../services/orderService.js";

/**
 * POST /api/orders
 */
export const createOrder = async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.body);

    res.status(201).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders
 */
export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders(req.query, req.user);

    res.status(200).json({
      status: "success",
      results: orders.length,
      data: { orders },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);

    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id
 */
export const updateOrder = async (req, res, next) => {
  try {
    console.log("🔵 Update Order Request:");
    console.log("  - Order ID:", req.params.id);
    console.log("  - User role:", req.user?.role);
    console.log("  - New data:", req.body);

    const order = await orderService.updateOrder(req.params.id, req.body);

    console.log("✅ Order updated successfully, new status:", order.status);

    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    console.error("❌ Update Order Error:", error.message);
    next(error);
  }
};

/**
 * DELETE /api/orders/:id
 */
export const deleteOrder = async (req, res, next) => {
  try {
    await orderService.deleteOrder(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/orders/:id/cancel
 */
export const cancelOrder = async (req, res, next) => {
  try {
    const order = await orderService.cancelOrder(req.params.id);

    res.status(200).json({
      status: "success",
      data: { order },
    });
  } catch (error) {
    next(error);
  }
};
