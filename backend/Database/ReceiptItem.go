package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม ReceiptItem
func AddReceiptItem(db *gorm.DB, c *fiber.Ctx) error {
	// Define struct to receive request data
	type ReceiptItemRequest struct {
		ReceiptID     string  `json:"receiptid"`
		ProductUnitID string  `json:"productunitid"`
		Quantity      int     `json:"quantity"`
		UnitPrice     float64 `json:"unitprice"`
	}

	// Parse request body into the ReceiptItemRequest struct
	var req ReceiptItemRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// Check if the ReceiptID exists in the database
	var receipt Models.Receipt
	if err := db.Where("receipt_id = ?", req.ReceiptID).First(&receipt).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt not found",
		})
	}

	// Check if the ProductUnitID exists in the database
	var productUnit Models.ProductUnit
	if err := db.Where("product_unit_id = ?", req.ProductUnitID).First(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product unit not found",
		})
	}

	// Create a new ReceiptItem object
	receiptItem := Models.ReceiptItem{
		ReceiptID:     receipt.ReceiptID,         // Link to the existing Receipt
		ProductUnitID: productUnit.ProductUnitID, // Link to the existing ProductUnit
		Quantity:      req.Quantity,
		UnitPrice:     req.UnitPrice,
	}

	// Insert the new receipt item into the database
	if err := db.Create(&receiptItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create receipt item: " + err.Error(),
		})
	}

	// Return success response with the created receipt item
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": receiptItem})
}

// ดู ReceiptItem ทั้งหมด
func LookReceiptItem(db *gorm.DB, c *fiber.Ctx) error {
	var receiptItems []Models.ReceiptItem
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
	var receiptItem Models.ReceiptItem
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
	var receiptItem Models.ReceiptItem
	if err := db.Where("receipt_item_id = ?", id).First(&receiptItem).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt item not found",
		})
	}

	var req Models.ReceiptItem
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	receiptItem.ReceiptID = req.ReceiptID
	receiptItem.ProductUnitID = req.ProductUnitID
	receiptItem.Quantity = req.Quantity
	receiptItem.UnitPrice = req.UnitPrice
	receiptItem.CreatedAt = req.CreatedAt
	receiptItem.UpdateAt = req.UpdateAt

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
	var receiptItem Models.ReceiptItem
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

// Route สำหรับ ReceiptItem
func ReceiptItemRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/receiptitems", func(c *fiber.Ctx) error {
		return LookReceiptItem(db, c)
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
