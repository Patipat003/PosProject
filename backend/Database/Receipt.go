package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Receipt
func AddReceipt(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Receipts
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	req.ReceiptID = uuid.New().String()
	req.ReceiptDate = time.Now()

	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create receipt: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Receipts ทั้งหมด
func LookReceipts(db *gorm.DB, c *fiber.Ctx) error {
	var receipts []Models.Receipts
	if err := db.Find(&receipts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find receipts: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": receipts})
}

// หา Receipt ตาม ID
func FindReceipt(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var receipt Models.Receipts
	if err := db.Where("receipt_id = ?", id).First(&receipt).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt not found",
		})
	}
	return c.JSON(fiber.Map{"Data": receipt})
}

// อัปเดต Receipt
func UpdateReceipt(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var receipt Models.Receipts
	if err := db.Where("receipt_id = ?", id).First(&receipt).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt not found",
		})
	}

	var req Models.Receipts
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	receipt.ReceiptNumber = req.ReceiptNumber
	receipt.SaleID = req.SaleID
	receipt.BranchID = req.BranchID
	receipt.TotalAmount = req.TotalAmount
	receipt.ReceiptDate = time.Now()

	if err := db.Save(&receipt).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update receipt: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Receipt
func DeleteReceipt(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var receipt Models.Receipts
	if err := db.Where("receipt_id = ?", id).First(&receipt).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt not found",
		})
	}
	if err := db.Delete(&receipt).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete receipt: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Receipts
func ReceiptRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/receipts", func(c *fiber.Ctx) error {
		return LookReceipts(db, c)
	})
	app.Get("/receipts/:id", func(c *fiber.Ctx) error {
		return FindReceipt(db, c)
	})
	app.Post("/receipts", func(c *fiber.Ctx) error {
		return AddReceipt(db, c)
	})
	app.Put("/receipts/:id", func(c *fiber.Ctx) error {
		return UpdateReceipt(db, c)
	})
	app.Delete("/receipts/:id", func(c *fiber.Ctx) error {
		return DeleteReceipt(db, c)
	})
}
