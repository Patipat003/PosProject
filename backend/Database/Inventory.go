package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Inventory
func AddInventory(db *gorm.DB, c *fiber.Ctx) error {
	// Define a struct to receive request data
	type InventoryRequest struct {
		ProductUnitID string  `json:"productunitid"`
		BranchID      string  `json:"branchid"`
		Quantity      int     `json:"quantity"`
		Price         float64 `json:"price"`
	}

	// Parse request body into the InventoryRequest struct
	var req InventoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// Validate that the ProductUnitID exists in the ProductUnit table
	var productUnit Models.ProductUnit
	if err := db.Where("product_unit_id = ?", req.ProductUnitID).First(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "ProductUnit not found",
		})
	}

	// Validate that the BranchID exists in the Branches table
	var branch Models.Branches
	if err := db.Where("branch_id = ?", req.BranchID).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}

	// Create a new Inventory object
	inventory := Models.Inventory{
		ProductUnitID: req.ProductUnitID,
		BranchID:      req.BranchID, // Associate BranchID with Branch model
		Quantity:      req.Quantity,
		Price:         req.Price,
	}

	// Insert the new inventory record into the database
	if err := db.Create(&inventory).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create inventory: " + err.Error(),
		})
	}

	// Return success response with the created inventory
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"NewInventory": inventory,
	})
}

// ดู Inventory ทั้งหมด
func LookInventory(db *gorm.DB, c *fiber.Ctx) error {
	var inventories []Models.Inventory
	if err := db.Find(&inventories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find inventories: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": inventories})
}

// หา Inventory ตาม ID
func FindInventory(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var inventory Models.Inventory
	if err := db.Where("inventory_id = ?", id).First(&inventory).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Inventory not found",
		})
	}
	return c.JSON(fiber.Map{"Data": inventory})
}

// อัปเดต Inventory
func UpdateInventory(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var inventory Models.Inventory
	if err := db.Where("inventory_id = ?", id).First(&inventory).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Inventory not found",
		})
	}

	var req Models.Inventory
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	inventory.Quantity = req.Quantity
	inventory.Price = req.Price

	if err := db.Save(&inventory).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update inventory: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Inventory
func DeleteInventory(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var inventory Models.Inventory
	if err := db.Where("inventory_id = ?", id).First(&inventory).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Inventory not found",
		})
	}
	if err := db.Delete(&inventory).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete inventory: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Inventory
func InventoryRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/inventory", func(c *fiber.Ctx) error {
		return LookInventory(db, c)
	})
	app.Get("/inventory/:id", func(c *fiber.Ctx) error {
		return FindInventory(db, c)
	})
	app.Post("/inventory", func(c *fiber.Ctx) error {
		return AddInventory(db, c)
	})
	app.Put("/inventory/:id", func(c *fiber.Ctx) error {
		return UpdateInventory(db, c)
	})
	app.Delete("/inventory/:id", func(c *fiber.Ctx) error {
		return DeleteInventory(db, c)
	})
}
