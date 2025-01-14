package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Category ใหม่
func AddCategory(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Category
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	req.CategoryID = uuid.New().String()
	req.CreatedAt = time.Now()

	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create category: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Category ทั้งหมด
func LookCategories(db *gorm.DB, c *fiber.Ctx) error {
	var categories []Models.Category
	if err := db.Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find categories: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": categories})
}

// Route สำหรับ Categories
func CategoryRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/categories", func(c *fiber.Ctx) error {
		return LookCategories(db, c)
	})
	app.Post("/categories", func(c *fiber.Ctx) error {
		return AddCategory(db, c)
	})
}
