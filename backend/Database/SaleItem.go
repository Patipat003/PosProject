package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม SaleItem
func AddSaleItem(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.SaleItems
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	req.SaleItemID = uuid.New().String()

	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create sale item: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู SaleItems ทั้งหมด
func LookSaleItems(db *gorm.DB, c *fiber.Ctx) error {
	var saleItems []Models.SaleItems
	if err := db.Find(&saleItems).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find sale items: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": saleItems})
}

// หา SaleItem ตาม ID
func FindSaleItem(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var saleItem Models.SaleItems
	if err := db.Where("sale_item_id = ?", id).First(&saleItem).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale item not found",
		})
	}
	return c.JSON(fiber.Map{"Data": saleItem})
}

// อัปเดต SaleItem
func UpdateSaleItem(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var saleItem Models.SaleItems
	if err := db.Where("sale_item_id = ?", id).First(&saleItem).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale item not found",
		})
	}

	var req Models.SaleItems
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	saleItem.SaleID = req.SaleID
	saleItem.ProductID = req.ProductID
	saleItem.Quantity = req.Quantity
	saleItem.Price = req.Price
	saleItem.TotalPrice = req.TotalPrice

	if err := db.Save(&saleItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update sale item: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ SaleItem
func DeleteSaleItem(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var saleItem Models.SaleItems
	if err := db.Where("sale_item_id = ?", id).First(&saleItem).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale item not found",
		})
	}
	if err := db.Delete(&saleItem).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete sale item: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ SaleItems
func SaleItemRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/saleitems", func(c *fiber.Ctx) error {
		return LookSaleItems(db, c)
	})
	app.Get("/saleitems/:id", func(c *fiber.Ctx) error {
		return FindSaleItem(db, c)
	})
	app.Post("/saleitems", func(c *fiber.Ctx) error {
		return AddSaleItem(db, c)
	})
	app.Put("/saleitems/:id", func(c *fiber.Ctx) error {
		return UpdateSaleItem(db, c)
	})
	app.Delete("/saleitems/:id", func(c *fiber.Ctx) error {
		return DeleteSaleItem(db, c)
	})
}
