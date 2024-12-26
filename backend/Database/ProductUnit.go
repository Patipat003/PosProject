package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Product Unit
func AddProductUnit(db *gorm.DB, c *fiber.Ctx) error {
	// Define a struct to receive request data
	type ProductUnitRequest struct {
		ProductID   string `json:"productid"`
		Type        string `json:"type"`
		ConversRate int    `json:"conversrate"`
	}

	// Parse request body into the ProductUnitRequest struct
	var req ProductUnitRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// Validate that the ProductID exists in the Product table
	var product Models.Product
	if err := db.Where("product_id = ?", req.ProductID).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	// Create a new ProductUnit object
	productUnit := Models.ProductUnit{
		ProductID:   req.ProductID,
		Type:        req.Type,
		ConversRate: req.ConversRate,
	}

	// Insert the new product unit into the database
	if err := db.Create(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create product unit: " + err.Error(),
		})
	}

	// Return success response with the created product unit
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"NewProductUnit": productUnit,
	})
}

// ดู Product Unit ทั้งหมด
func LookProductUnit(db *gorm.DB, c *fiber.Ctx) error {
	var productUnits []Models.ProductUnit
	if err := db.Find(&productUnits).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find product units: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": productUnits})
}

// หา Product Unit ตาม ID
func FindProductUnit(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var productUnit Models.ProductUnit
	if err := db.Where("product_unit_id = ?", id).First(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product unit not found",
		})
	}
	return c.JSON(fiber.Map{"Data": productUnit})
}

// อัปเดต Product Unit
func UpdateProductUnit(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var productUnit Models.ProductUnit
	if err := db.Where("product_unit_id = ?", id).First(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product unit not found",
		})
	}

	var req Models.ProductUnit
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	productUnit.Type = req.Type
	productUnit.ConversRate = req.ConversRate

	if err := db.Save(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update product unit: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Product Unit
func DeleteProductUnit(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var productUnit Models.ProductUnit
	if err := db.Where("product_unit_id = ?", id).First(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product unit not found",
		})
	}
	if err := db.Delete(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete product unit: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Product Unit
func ProductUnitRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/productunits", func(c *fiber.Ctx) error {
		return LookProductUnit(db, c)
	})
	app.Get("/productunits/:id", func(c *fiber.Ctx) error {
		return FindProductUnit(db, c)
	})
	app.Post("/productunits", func(c *fiber.Ctx) error {
		return AddProductUnit(db, c)
	})
	app.Put("/productunits/:id", func(c *fiber.Ctx) error {
		return UpdateProductUnit(db, c)
	})
	app.Delete("/productunits/:id", func(c *fiber.Ctx) error {
		return DeleteProductUnit(db, c)
	})
}
