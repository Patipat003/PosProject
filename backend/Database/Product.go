package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Product
func AddProduct(db *gorm.DB, c *fiber.Ctx) error {
	// Define a struct to receive request data
	type ProductRequest struct {
		ProductName string `json:"productname"`
		Description string `json:"description"`
	}

	// Parse request body into the ProductRequest struct
	var req ProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// Create a new Product object
	product := Models.Product{
		ProductName: req.ProductName,
		Description: req.Description,
	}

	// Insert the new product into the database
	if err := db.Create(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create product: " + err.Error(),
		})
	}

	// Return success response with the created product
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": product})
}

// ดู Product ทั้งหมด
func LookProduct(db *gorm.DB, c *fiber.Ctx) error {
	var products []Models.Product
	if err := db.Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find products: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": products})
}

// หา Product ตาม ID
func FindProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product
	if err := db.Where("product_id = ?", id).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}
	return c.JSON(fiber.Map{"Data": product})
}

// อัปเดต Product
func UpdateProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product
	if err := db.Where("product_id = ?", id).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	var req Models.Product
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	product.ProductName = req.ProductName
	product.Description = req.Description

	if err := db.Save(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update product: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Product
func DeleteProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product
	if err := db.Where("product_id = ?", id).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}
	if err := db.Delete(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete product: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Product
func ProductRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/products", func(c *fiber.Ctx) error {
		return LookProduct(db, c)
	})
	app.Get("/products/:id", func(c *fiber.Ctx) error {
		return FindProduct(db, c)
	})
	app.Post("/products", func(c *fiber.Ctx) error {
		return AddProduct(db, c)
	})
	app.Put("/products/:id", func(c *fiber.Ctx) error {
		return UpdateProduct(db, c)
	})
	app.Delete("/products/:id", func(c *fiber.Ctx) error {
		return DeleteProduct(db, c)
	})
}
