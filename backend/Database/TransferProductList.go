package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม TransferProductList
func AddTransferProductList(db *gorm.DB, c *fiber.Ctx) error {
	// Define struct to receive request data
	type TransferProductListRequest struct {
		TransferID    string `json:"transferid"`
		ProductUnitID string `json:"productunitid"`
		Quantity      int    `json:"quantity"`
	}

	// Parse request body into the TransferProductListRequest struct
	var req TransferProductListRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// Check if TransferID exists in the TransferProduct table
	var transferProduct Models.TransferProduct
	if err := db.Where("transfer_product_id = ?", req.TransferID).First(&transferProduct).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Transfer product not found",
		})
	}

	// Check if ProductUnitID exists in the ProductUnit table
	var productUnit Models.ProductUnit
	if err := db.Where("product_unit_id = ?", req.ProductUnitID).First(&productUnit).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product unit not found",
		})
	}

	// Create a new TransferProductList object
	transferProductList := Models.TransferProductList{
		TransferID:    transferProduct.TransferProductID, // Link to the TransferProduct
		ProductUnitID: productUnit.ProductUnitID,         // Link to the ProductUnit
		Quantity:      req.Quantity,
	}

	// Insert the new transfer product list into the database
	if err := db.Create(&transferProductList).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create transfer product list: " + err.Error(),
		})
	}

	// Return success response with the created transfer product list
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": transferProductList})
}

// ดู TransferProductList ทั้งหมด
func LookTransferProductList(db *gorm.DB, c *fiber.Ctx) error {
	var transferProductLists []Models.TransferProductList
	if err := db.Find(&transferProductLists).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find transfer product lists: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": transferProductLists})
}

// หา TransferProductList ตาม ID
func FindTransferProductList(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var transferProductList Models.TransferProductList
	if err := db.Where("transfer_list_id = ?", id).First(&transferProductList).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Transfer product list not found",
		})
	}
	return c.JSON(fiber.Map{"Data": transferProductList})
}

// อัปเดต TransferProductList
func UpdateTransferProductList(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var transferProductList Models.TransferProductList
	if err := db.Where("transfer_list_id = ?", id).First(&transferProductList).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Transfer product list not found",
		})
	}

	var req Models.TransferProductList
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	transferProductList.TransferID = req.TransferID
	transferProductList.ProductUnitID = req.ProductUnitID
	transferProductList.Quantity = req.Quantity
	transferProductList.CreatedAt = req.CreatedAt
	transferProductList.UpdateAt = req.UpdateAt

	if err := db.Save(&transferProductList).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update transfer product list: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ TransferProductList
func DeleteTransferProductList(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var transferProductList Models.TransferProductList
	if err := db.Where("transfer_list_id = ?", id).First(&transferProductList).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Transfer product list not found",
		})
	}
	if err := db.Delete(&transferProductList).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete transfer product list: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ TransferProductList
func TransferProductListRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/transferproductlists", func(c *fiber.Ctx) error {
		return LookTransferProductList(db, c)
	})
	app.Get("/transferproductlists/:id", func(c *fiber.Ctx) error {
		return FindTransferProductList(db, c)
	})
	app.Post("/transferproductlists", func(c *fiber.Ctx) error {
		return AddTransferProductList(db, c)
	})
	app.Put("/transferproductlists/:id", func(c *fiber.Ctx) error {
		return UpdateTransferProductList(db, c)
	})
	app.Delete("/transferproductlists/:id", func(c *fiber.Ctx) error {
		return DeleteTransferProductList(db, c)
	})
}
