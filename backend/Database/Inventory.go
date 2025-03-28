package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Inventory
func AddInventory(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Inventory
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	req.InventoryID = uuid.New().String()
	req.UpdatedAt = time.Now()

	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create inventory: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Inventory ทั้งหมด
func LookInventory(db *gorm.DB, c *fiber.Ctx) error {
	var inventory []Models.Inventory
	if err := db.Find(&inventory).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find inventory: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": inventory})
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

	inventory.ProductID = req.ProductID
	inventory.BranchID = req.BranchID
	inventory.Quantity = req.Quantity
	inventory.UpdatedAt = time.Now()

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
