package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Receipt
func AddReceipt(db *gorm.DB, c *fiber.Ctx) error {
	// Define a struct to receive request data
	type ReceiptRequest struct {
		ReceiptNumber string  `json:"receiptnumber"`
		EmployeeID    string  `json:"employeeid"`
		BranchID      string  `json:"branchid"`
		ReceiptDate   string  `json:"receiptdate"` // รับค่าจาก JSON เป็น string
		TotalAmount   float64 `json:"totalamount"`
		Status        string  `json:"status"`
	}

	// Parse request body into the ReceiptRequest struct
	var req ReceiptRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// Convert ReceiptDate from string to time.Time
	receiptDate, err := time.Parse("2006-01-02", req.ReceiptDate)
	if err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid date format, please use yyyy-mm-dd",
		})
	}

	// Create a new Receipt object
	receipt := Models.Receipt{
		ReceiptNumber: req.ReceiptNumber,
		EmployeeID:    req.EmployeeID,
		BranchID:      req.BranchID,
		ReceiptDate:   receiptDate, // Assign the parsed date
		TotalAmount:   req.TotalAmount,
		Status:        req.Status,
	}

	// Insert the new receipt into the database
	if err := db.Create(&receipt).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create receipt: " + err.Error(),
		})
	}

	// Return success response with the created receipt
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": receipt})
}

// ดู Receipt ทั้งหมด
func LookReceipt(db *gorm.DB, c *fiber.Ctx) error {
	var receipts []Models.Receipt
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
	var receipt Models.Receipt
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
	var receipt Models.Receipt
	if err := db.Where("receipt_id = ?", id).First(&receipt).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Receipt not found",
		})
	}

	var req Models.Receipt
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	receipt.ReceiptNumber = req.ReceiptNumber
	receipt.EmployeeID = req.EmployeeID
	receipt.BranchID = req.BranchID
	receipt.ReceiptDate = req.ReceiptDate
	receipt.TotalAmount = req.TotalAmount
	receipt.Status = req.Status
	receipt.Update = req.Update

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
	var receipt Models.Receipt
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

// Route สำหรับ Receipt
func ReceiptRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/receipts", func(c *fiber.Ctx) error {
		return LookReceipt(db, c)
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
