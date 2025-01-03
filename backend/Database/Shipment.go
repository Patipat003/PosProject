package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Shipment และอัปเดต Inventory
func AddShipment(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Shipments
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// สร้าง Shipment ใหม่
	req.ShipmentID = uuid.New().String()
	req.CreatedAt = time.Now()

	// เพิ่มข้อมูล Shipment ลงใน DB
	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create shipment: " + err.Error(),
		})
	}

	// คำนวณจำนวนสินค้าที่จะเพิ่มใน Inventory (จำนวนกล่อง * จำนวนชิ้นในแต่ละกล่อง)
	quantity := req.Quantity * req.UnitsPerBox

	// อัปเดตหรือสร้าง Inventory ในสาขาที่รับสินค้า
	var inventory Models.Inventory
	if err := db.Where("product_id = ? AND branch_id = ?", req.ProductID, req.ToBranchID).First(&inventory).Error; err != nil {
		// ถ้าไม่มีข้อมูล Inventory สำหรับสินค้าตัวนี้ ให้เพิ่มใหม่
		inventory.InventoryID = uuid.New().String()
		inventory.ProductID = req.ProductID
		inventory.BranchID = req.ToBranchID
		inventory.Quantity = quantity
		inventory.UpdatedAt = time.Now()
		if err := db.Create(&inventory).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update inventory: " + err.Error(),
			})
		}
	} else {
		// ถ้ามีข้อมูล Inventory อยู่แล้ว ให้เพิ่มจำนวนสินค้าเข้าไป
		inventory.Quantity += quantity
		inventory.UpdatedAt = time.Now()
		if err := db.Save(&inventory).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to update inventory: " + err.Error(),
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Shipment ทั้งหมด
func LookShipments(db *gorm.DB, c *fiber.Ctx) error {
	var shipments []Models.Shipments
	if err := db.Find(&shipments).Error; err != nil {
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
	if err := db.Where("shipment_id = ?", id).First(&shipment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Shipment not found",
		})
	}
	return c.JSON(fiber.Map{"Data": shipment})
}

// อัปเดต Shipment
func UpdateShipment(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var shipment Models.Shipments
	if err := db.Where("shipment_id = ?", id).First(&shipment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Shipment not found",
		})
	}

	var req Models.Shipments
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	shipment.RequestID = req.RequestID
	shipment.FromBranchID = req.FromBranchID
	shipment.ToBranchID = req.ToBranchID
	shipment.ProductID = req.ProductID
	shipment.Quantity = req.Quantity
	shipment.UnitsPerBox = req.UnitsPerBox
	shipment.CreatedAt = time.Now()

	if err := db.Save(&shipment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update shipment: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Shipment
func DeleteShipment(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var shipment Models.Shipments
	if err := db.Where("shipment_id = ?", id).First(&shipment).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Shipment not found",
		})
	}
	if err := db.Delete(&shipment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete shipment: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

func ShipmentRoutes(app *fiber.App, db *gorm.DB) {
	// Route สำหรับ Shipments
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
