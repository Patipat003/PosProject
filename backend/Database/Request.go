package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// สร้างคำขอ (Request) อัตโนมัติ
func AutoCreateRequest(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Requests
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ตรวจสอบว่ามีสินค้าที่ต้องการในสาขาของตัวเอง (tobranchid) หรือไม่
	var productInventory Models.Inventory
	if err := db.Where("branch_id = ? AND product_id = ?", req.ToBranchID, req.ProductID).First(&productInventory).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found in your branch",
		})
	}

	// ตรวจสอบว่า FromBranchID และ ToBranchID ไม่ใช่สาขาเดียวกัน
	if req.FromBranchID == req.ToBranchID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "FromBranchID and ToBranchID cannot be the same",
		})
	}

	// หาสาขาที่มีสินค้ามากที่สุด
	var fromBranch Models.Inventory
	if err := db.Where("product_id = ?", req.ProductID).Order("quantity desc").First(&fromBranch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found in any branch",
		})
	}

	// สร้างคำขอ
	req.RequestID = uuid.New().String()
	req.CreatedAt = time.Now()
	req.FromBranchID = fromBranch.BranchID // ตั้งค่า fromBranchID เป็นสาขาที่มีสินค้าเยอะที่สุด
	req.Status = "pending"                 // ตั้งค่าเริ่มต้นเป็น pending

	// ตรวจสอบสินค้าจากสาขาที่ส่งสินค้า (fromBranchID) ว่ามีสินค้าพอหรือไม่
	var inventoryFrom Models.Inventory
	if err := db.Where("branch_id = ? AND product_id = ?", req.FromBranchID, req.ProductID).First(&inventoryFrom).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Inventory of sending branch not found",
		})
	} else {
		// ถ้าสินค้าจากสาขาที่ส่งมีไม่พอ
		if inventoryFrom.Quantity < req.Quantity {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Not enough stock in sending branch",
			})
		}
	}

	// บันทึกคำขอในฐานข้อมูล
	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create request: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// เพิ่ม Request
func AddRequest(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Requests
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ตรวจสอบว่า FromBranchID และ ToBranchID ไม่ใช่สาขาเดียวกัน
	if req.FromBranchID == req.ToBranchID {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "FromBranchID and ToBranchID cannot be the same",
		})
	}

	// สร้าง Request ID ใหม่
	req.RequestID = uuid.New().String()
	req.CreatedAt = time.Now()

	// เพิ่ม Request ลงในฐานข้อมูล
	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create request: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Requests ทั้งหมด
func LookRequests(db *gorm.DB, c *fiber.Ctx) error {
	var requests []Models.Requests
	if err := db.Find(&requests).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find requests: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": requests})
}

// หา Request ตาม ID
func FindRequest(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var request Models.Requests
	if err := db.Where("request_id = ?", id).First(&request).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Request not found",
		})
	}
	return c.JSON(fiber.Map{"Data": request})
}

// อัปเดต Request
func UpdateRequest(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var request Models.Requests
	if err := db.Where("request_id = ?", id).First(&request).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Request not found",
		})
	}

	// รับข้อมูลใหม่จาก body ของคำขอ (แค่ status)
	var req Models.Requests
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// อัปเดตแค่ status
	request.Status = req.Status

	// ถ้าสถานะเป็น "complete", เพิ่มสินค้าใน Inventory และลดสินค้าในสาขาที่ส่ง
	if request.Status == "complete" {
		// ค้นหา Inventory ของสาขาที่ได้รับสินค้า (ToBranchID)
		var inventoryTo Models.Inventory
		if err := db.Where("branch_id = ? AND product_id = ?", request.ToBranchID, request.ProductID).First(&inventoryTo).Error; err != nil {
			// ถ้าไม่พบสินค้าใน Inventory ของสาขาที่รับ, สร้างใหม่
			inventoryTo = Models.Inventory{
				InventoryID: uuid.New().String(),
				BranchID:    request.ToBranchID,
				ProductID:   request.ProductID,
				Quantity:    request.Quantity,
				UpdatedAt:   time.Now(),
			}
			if err := db.Create(&inventoryTo).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to update inventory of receiving branch: " + err.Error(),
				})
			}
		} else {
			// ถ้ามีสินค้าก่อนหน้าในสาขาที่รับ, เพิ่มจำนวนสินค้า
			inventoryTo.Quantity += request.Quantity
			inventoryTo.UpdatedAt = time.Now()
			if err := db.Save(&inventoryTo).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to update inventory of receiving branch: " + err.Error(),
				})
			}
		}

		// ค้นหา Inventory ของสาขาที่ส่งสินค้า (FromBranchID) และลดจำนวนสินค้า
		var inventoryFrom Models.Inventory
		if err := db.Where("branch_id = ? AND product_id = ?", request.FromBranchID, request.ProductID).First(&inventoryFrom).Error; err != nil {
			// หากไม่พบ inventory จาก FromBranchID ก็ไม่จำเป็นต้องส่ง error
			// เพราะต้องการให้ update เป็น "complete" โดยไม่คำนึงถึง inventory ของ FromBranchID
			// สามารถดำเนินการต่อได้เลย
		} else {
			// ลดจำนวนสินค้าในสาขาที่ส่ง
			if inventoryFrom.Quantity < request.Quantity {
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Not enough stock in sending branch",
				})
			}
			inventoryFrom.Quantity -= request.Quantity
			inventoryFrom.UpdatedAt = time.Now()
			if err := db.Save(&inventoryFrom).Error; err != nil {
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to update inventory of sending branch: " + err.Error(),
				})
			}
		}
	}

	// อัปเดตสถานะของ request
	if err := db.Save(&request).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update request: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Request
func DeleteRequest(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var request Models.Requests
	if err := db.Where("request_id = ?", id).First(&request).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Request not found",
		})
	}
	if err := db.Delete(&request).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete request: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Requests
func RequestRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/requests", func(c *fiber.Ctx) error {
		return LookRequests(db, c)
	})
	app.Get("/requests/:id", func(c *fiber.Ctx) error {
		return FindRequest(db, c)
	})
	app.Post("/requests", func(c *fiber.Ctx) error {
		return AddRequest(db, c)
	})
	// ใช้ route ใหม่สำหรับสร้างคำขออัตโนมัติ
	app.Post("/requests/auto", func(c *fiber.Ctx) error {
		return AutoCreateRequest(db, c)
	})
	app.Put("/requests/:id", func(c *fiber.Ctx) error {
		return UpdateRequest(db, c)
	})
	app.Delete("/requests/:id", func(c *fiber.Ctx) error {
		return DeleteRequest(db, c)
	})
}
