package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Sale
func AddSale(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Sales
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	req.SaleID = uuid.New().String()
	req.CreatedAt = time.Now()

	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create sale: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Sales ทั้งหมด
func LookSales(db *gorm.DB, c *fiber.Ctx) error {
	var sales []Models.Sales
	if err := db.Find(&sales).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find sales: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": sales})
}

// หา Sale ตาม ID
func FindSale(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var sale Models.Sales
	if err := db.Where("sale_id = ?", id).First(&sale).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale not found",
		})
	}
	return c.JSON(fiber.Map{"Data": sale})
}

// อัปเดต Sale
func UpdateSale(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var sale Models.Sales
	if err := db.Where("sale_id = ?", id).First(&sale).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale not found",
		})
	}

	var req Models.Sales
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	sale.EmployeeID = req.EmployeeID
	sale.BranchID = req.BranchID
	sale.TotalAmount = req.TotalAmount
	sale.CreatedAt = time.Now()

	if err := db.Save(&sale).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update sale: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Sale
func DeleteSale(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var sale Models.Sales
	if err := db.Where("sale_id = ?", id).First(&sale).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale not found",
		})
	}
	if err := db.Delete(&sale).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete sale: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Sales
func SaleRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/sales", func(c *fiber.Ctx) error {
		return LookSales(db, c)
	})
	app.Get("/sales/:id", func(c *fiber.Ctx) error {
		return FindSale(db, c)
	})
	app.Post("/sales", func(c *fiber.Ctx) error {
		return AddSale(db, c)
	})
	app.Put("/sales/:id", func(c *fiber.Ctx) error {
		return UpdateSale(db, c)
	})
	app.Delete("/sales/:id", func(c *fiber.Ctx) error {
		return DeleteSale(db, c)
	})
}
