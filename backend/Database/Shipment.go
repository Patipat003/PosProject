package Database

import (
	"fmt"
	"math/rand"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

func generateShipmentNumber() (string, error) {
	// ตั้งค่า seed สำหรับสุ่มค่า
	rand.Seed(time.Now().UnixNano())

	// ดึงวันที่ปัจจุบันในรูปแบบ YYYYMMDD
	today := time.Now().Format("20060102")

	// สุ่มตัวเลข 5 หลัก (10000 - 99999)
	randomNumber := rand.Intn(90000) + 10000

	// คืนค่า Shipment Number
	return fmt.Sprintf("SHIP-%s-%05d", today, randomNumber), nil
}

func AddShipment(db *gorm.DB, c *fiber.Ctx) error {
	var req struct {
		BranchID string                 `json:"branchid" binding:"required"`
		Items    []Models.ShipmentItems `json:"items" binding:"required"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ตรวจสอบ Branch
	var branch Models.Branches
	if err := db.Where("branch_id = ?", req.BranchID).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}

	// สร้าง Shipment Number
	shipmentNumber, err := generateShipmentNumber()
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate shipment number: " + err.Error(),
		})
	}

	// เริ่ม Transaction
	tx := db.Begin()

	newShipment := Models.Shipments{
		ShipmentID:     uuid.New().String(),
		ShipmentNumber: shipmentNumber, // ✅ ใช้ค่าที่สร้างได้
		BranchID:       req.BranchID,
		Status:         "pending",
		CreatedAt:      time.Now(),
	}

	if err := tx.Create(&newShipment).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create shipment: " + err.Error(),
		})
	}

	// เพิ่ม ShipmentItems
	for _, item := range req.Items {
		var product Models.Product
		if err := db.Where("product_id = ?", item.ProductID).First(&product).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
				"error": "Product with ID " + item.ProductID + " not found",
			})
		}

		item.ShipmentItemID = uuid.New().String()
		item.ShipmentID = newShipment.ShipmentID

		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to add shipment item: " + err.Error(),
			})
		}
	}

	tx.Commit()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New Shipment": newShipment})
}

// ดู Shipment ทั้งหมด พร้อมตัวกรอง
func LookShipments(db *gorm.DB, c *fiber.Ctx) error {
	var shipments []Models.Shipments
	query := db.Preload("Items") // ✅ Load Items ของ Shipment

	// กรองตาม query parameters
	if status := c.Query("status"); status != "" {
		query = query.Where("status = ?", status)
	}
	if branchID := c.Query("branchid"); branchID != "" {
		query = query.Where("branch_id = ?", branchID)
	}

	// ค้นหา shipments
	if err := query.Find(&shipments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find shipments: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": shipments})
}

// หา Shipment ตาม ID
func FindShipment(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var shipment Models.Shipments
	if err := db.Preload("Items").Where("shipment_id = ?", id).First(&shipment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Shipment not found",
		})
	}
	return c.JSON(fiber.Map{"Data": shipment})
}

// อัปเดต Status ของ Shipment
func UpdateShipment(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var shipment Models.Shipments
	if err := db.Where("shipment_id = ?", id).First(&shipment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Shipment not found",
		})
	}

	var req struct {
		Status string `json:"status"`
	}

	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	if req.Status != "" {
		shipment.Status = req.Status
		shipment.UpdatedAt = time.Now()
	}

	if err := db.Save(&shipment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update shipment: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Shipment พร้อม ShipmentItems
func DeleteShipment(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var shipment Models.Shipments
	if err := db.Where("shipment_id = ?", id).First(&shipment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Shipment not found",
		})
	}

	// ลบ ShipmentItems ก่อน
	if err := db.Where("shipment_id = ?", id).Delete(&Models.ShipmentItems{}).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete shipment items: " + err.Error(),
		})
	}

	// ลบ Shipment
	if err := db.Delete(&shipment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete shipment: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// ตั้งค่า Routes
func ShipmentRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/shipments", func(c *fiber.Ctx) error {
		return LookShipments(db, c)
	})
	app.Get("/shipments/:id", func(c *fiber.Ctx) error {
		return FindShipment(db, c)
	})
	app.Post("/shipments", func(c *fiber.Ctx) error {
		return AddShipment(db, c)
	})
	app.Put("/shipments/:id", func(c *fiber.Ctx) error {
		return UpdateShipment(db, c)
	})
	app.Delete("/shipments/:id", func(c *fiber.Ctx) error {
		return DeleteShipment(db, c)
	})
}
