package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม TransferProduct
func AddTransferProduct(db *gorm.DB, c *fiber.Ctx) error {
	// Define struct to receive request data
	type TransferProductRequest struct {
		TransferNumber string    `json:"transfernumber"`
		FromBranchID   string    `json:"frombranchid"`
		ToBranchID     string    `json:"tobranchid"`
		RequestDate    time.Time `json:"requestdate"`
		Status         string    `json:"status"`
	}

	// Parse request body into the TransferProductRequest struct
	var req TransferProductRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// Check if FromBranchID exists in the database
	var fromBranch Models.Branches
	if err := db.Where("branch_id = ?", req.FromBranchID).First(&fromBranch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "From branch not found",
		})
	}

	// Check if ToBranchID exists in the database
	var toBranch Models.Branches
	if err := db.Where("branch_id = ?", req.ToBranchID).First(&toBranch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "To branch not found",
		})
	}

	// Create a new TransferProduct object
	transferProduct := Models.TransferProduct{
		TransferNumber: req.TransferNumber,
		FromBranchID:   fromBranch.BranchID, // Link to the existing FromBranch
		ToBranchID:     toBranch.BranchID,   // Link to the existing ToBranch
		RequestDate:    req.RequestDate,
		Status:         req.Status,
	}

	// Insert the new transfer product into the database
	if err := db.Create(&transferProduct).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create transfer product: " + err.Error(),
		})
	}

	// Return success response with the created transfer product
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": transferProduct})
}

// ดู TransferProduct ทั้งหมด
func LookTransferProduct(db *gorm.DB, c *fiber.Ctx) error {
	var transferProducts []Models.TransferProduct
	if err := db.Find(&transferProducts).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find transfer products: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": transferProducts})
}

// หา TransferProduct ตาม ID
func FindTransferProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var transferProduct Models.TransferProduct
	if err := db.Where("transfer_product_id = ?", id).First(&transferProduct).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Transfer product not found",
		})
	}
	return c.JSON(fiber.Map{"Data": transferProduct})
}

// อัปเดต TransferProduct
func UpdateTransferProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var transferProduct Models.TransferProduct
	if err := db.Where("transfer_product_id = ?", id).First(&transferProduct).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Transfer product not found",
		})
	}

	var req Models.TransferProduct
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	transferProduct.TransferNumber = req.TransferNumber
	transferProduct.FromBranchID = req.FromBranchID
	transferProduct.ToBranchID = req.ToBranchID
	transferProduct.RequestDate = req.RequestDate
	transferProduct.Status = req.Status
	transferProduct.CreatedAt = req.CreatedAt
	transferProduct.UpdateAt = req.UpdateAt

	if err := db.Save(&transferProduct).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update transfer product: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ TransferProduct
func DeleteTransferProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var transferProduct Models.TransferProduct
	if err := db.Where("transfer_product_id = ?", id).First(&transferProduct).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Transfer product not found",
		})
	}
	if err := db.Delete(&transferProduct).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete transfer product: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ TransferProduct
func TransferProductRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/transferproducts", func(c *fiber.Ctx) error {
		return LookTransferProduct(db, c)
	})
	app.Get("/transferproducts/:id", func(c *fiber.Ctx) error {
		return FindTransferProduct(db, c)
	})
	app.Post("/transferproducts", func(c *fiber.Ctx) error {
		return AddTransferProduct(db, c)
	})
	app.Put("/transferproducts/:id", func(c *fiber.Ctx) error {
		return UpdateTransferProduct(db, c)
	})
	app.Delete("/transferproducts/:id", func(c *fiber.Ctx) error {
		return DeleteTransferProduct(db, c)
	})
}
