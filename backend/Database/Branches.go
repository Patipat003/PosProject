package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// โครงสร้างข้อมูลที่ใช้รับค่า Latitude และ Longitude จาก Nominatim
type NominatimResponse []struct {
	Lat string `json:"lat"`
	Lon string `json:"lon"`
}

// เพิ่ม Branch และสร้าง Inventory สำหรับทุก Product
func AddBranches(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Branches
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	req.BranchID = uuid.New().String()
	req.CreatedAt = time.Now()

	if req.GoogleLocation == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Google Location (Latitude, Longitude) is required",
		})
	}

	// ใช้ Transaction เพื่อให้แน่ใจว่าทั้ง Branch และ Inventory ถูกสร้างครบ
	err := db.Transaction(func(tx *gorm.DB) error {
		// 1️⃣ บันทึก Branch ลงฐานข้อมูล
		if err := tx.Create(&req).Error; err != nil {
			return err
		}

		// 2️⃣ ดึง Product ทั้งหมดที่มีอยู่
		var products []Models.Product
		if err := tx.Find(&products).Error; err != nil {
			return err
		}

		// 3️⃣ สร้าง Inventory สำหรับ Branch ใหม่โดยใช้ Product ที่มี
		var inventories []Models.Inventory
		for _, product := range products {
			inventories = append(inventories, Models.Inventory{
				InventoryID: uuid.New().String(),
				BranchID:    req.BranchID,
				ProductID:   product.ProductID,
				Quantity:    0, // หรือค่าเริ่มต้นที่ต้องการ
				UpdatedAt:   time.Now(),
			})
		}

		// 4️⃣ บันทึก Inventory ลงฐานข้อมูล (หากมี Product อยู่)
		if len(inventories) > 0 {
			if err := tx.Create(&inventories).Error; err != nil {
				return err
			}
		}

		return nil // Transaction สำเร็จ
	})

	// ตรวจสอบว่า Transaction สำเร็จหรือไม่
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create branch and inventory: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"NewBranch": req,
		"Message":   "Branch and Inventory created successfully",
	})
}

// ดู Branch ทั้งหมด
func LookBranches(db *gorm.DB, c *fiber.Ctx) error {
	var branches []Models.Branches
	googleLocation := c.Query("google_location")

	query := db
	if googleLocation != "" {
		query = query.Where("google_location LIKE ?", "%"+googleLocation+"%")
	}

	if err := query.Find(&branches).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find branches: " + err.Error(),
		})
	}

	return c.JSON(fiber.Map{"Data": branches})
}

// หา Branch ตาม ID
func FindBranch(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var branch Models.Branches
	if err := db.Where("branch_id = ?", id).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}
	return c.JSON(fiber.Map{"Data": branch})
}

// อัปเดต Branch
func UpdateBranch(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var branch Models.Branches
	if err := db.Where("branch_id = ?", id).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}

	var req Models.Branches
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	branch.BName = req.BName
	branch.Location = req.Location
	branch.GoogleLocation = req.GoogleLocation

	if err := db.Save(&branch).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update branch: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Branch และลบ Inventory ที่เกี่ยวข้อง
func DeleteBranch(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var branch Models.Branches

	// ตรวจสอบว่ามีสาขานี้หรือไม่
	if err := db.Where("branch_id = ?", id).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}

	// ใช้ Transaction เพื่อความปลอดภัย
	tx := db.Begin()

	// ลบ Inventory ที่มี branch_id นี้
	if err := tx.Where("branch_id = ?", id).Delete(&Models.Inventory{}).Error; err != nil {
		tx.Rollback() // ยกเลิก Transaction หากมีข้อผิดพลาด
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete inventory: " + err.Error(),
		})
	}

	// ลบ Branch
	if err := tx.Delete(&branch).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete branch: " + err.Error(),
		})
	}

	// Commit Transaction หากทุกอย่างสำเร็จ
	tx.Commit()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"Deleted":  "Branch and associated inventory deleted successfully",
		"BranchID": id,
	})
}

// Route สำหรับ Branch
func BranchRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/branches", func(c *fiber.Ctx) error {
		return LookBranches(db, c)
	})
	app.Get("/branches/:id", func(c *fiber.Ctx) error {
		return FindBranch(db, c)
	})
	app.Post("/branches", func(c *fiber.Ctx) error {
		return AddBranches(db, c)
	})
	app.Put("/branches/:id", func(c *fiber.Ctx) error {
		return UpdateBranch(db, c)
	})
	app.Delete("/branches/:id", func(c *fiber.Ctx) error {
		return DeleteBranch(db, c)
	})
}
