package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม ReceiptItem
func AddReceiptItem(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.ReceiptItems
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	req.ReceiptItemID = uuid.New().String()

	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create receipt item: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู ReceiptItems ทั้งหมด
func LookReceiptItems(db *gorm.DB, c *fiber.Ctx) error {
	var receiptItems []Models.ReceiptItems
	if err := db.Find(&receiptItems).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find receipt items: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": receiptItems})
}

// หา ReceiptItem ตาม ID
func FindReceiptItem(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var receiptItem Models.ReceiptItems
	if err := db.Where("receipt_item_id = ?", id).First(&receiptItem).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt item not found",
		})
	}
	return c.JSON(fiber.Map{"Data": receiptItem})
}

// อัปเดต ReceiptItem
func UpdateReceiptItem(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var receiptItem Models.ReceiptItems
	if err := db.Where("receipt_item_id = ?", id).First(&receiptItem).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt item not found",
		})
	}

	var req Models.ReceiptItems
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	receiptItem.ReceiptID = req.ReceiptID
	receiptItem.ProductID = req.ProductID
	receiptItem.Quantity = req.Quantity
	receiptItem.UnitPrice = req.UnitPrice
	receiptItem.TotalPrice = req.TotalPrice

	if err := db.Save(&receiptItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update receipt item: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ ReceiptItem
func DeleteReceiptItem(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var receiptItem Models.ReceiptItems
	if err := db.Where("receipt_item_id = ?", id).First(&receiptItem).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt item not found",
		})
	}
	if err := db.Delete(&receiptItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete receipt item: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ ReceiptItems
func ReceiptItemRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/receiptitems", func(c *fiber.Ctx) error {
		return LookReceiptItems(db, c)
	})
	app.Get("/receiptitems/:id", func(c *fiber.Ctx) error {
		return FindReceiptItem(db, c)
	})
	app.Post("/receiptitems", func(c *fiber.Ctx) error {
		return AddReceiptItem(db, c)
	})
	app.Put("/receiptitems/:id", func(c *fiber.Ctx) error {
		return UpdateReceiptItem(db, c)
	})
	app.Delete("/receiptitems/:id", func(c *fiber.Ctx) error {
		return DeleteReceiptItem(db, c)
	})
}
