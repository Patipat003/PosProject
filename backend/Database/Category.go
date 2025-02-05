package Database

import (
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// AddCategory เพิ่ม Category ใหม่ พร้อมสร้าง CategoryCode อัตโนมัติ
func AddCategory(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Category
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ตรวจสอบว่า CategoryName มีค่าหรือไม่
	if req.CategoryName == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "CategoryName is required",
		})
	}

	// สร้าง CategoryCode จาก 4 ตัวแรกของชื่อหมวดหมู่
	req.CategoryCode = generateCategoryCode(req.CategoryName)

	// ตรวจสอบว่ารหัสนี้ซ้ำในฐานข้อมูลหรือไม่
	var existing Models.Category
	if err := db.Where("category_code = ?", req.CategoryCode).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "CategoryCode already exists",
		})
	}

	// สร้าง UUID และกำหนดเวลาสร้าง
	req.CategoryID = uuid.New().String()
	req.CreatedAt = time.Now().UTC() // กำหนดให้เป็น UTC

	// บันทึกลงฐานข้อมูล
	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create category: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// generateCategoryCode สร้างรหัสหมวดหมู่จากชื่อ (ใช้ 4 ตัวแรก)
func generateCategoryCode(name string) string {
	name = strings.ToUpper(strings.TrimSpace(name)) // แปลงเป็นตัวพิมพ์ใหญ่ & ตัดช่องว่าง
	if len(name) >= 4 {
		return name[:4] // ใช้ 4 ตัวแรก
	}
	return name // ถ้าชื่อสั้นกว่า 4 ตัว ให้ใช้ชื่อทั้งหมด
}

// LookCategories ดึงข้อมูลหมวดหมู่ทั้งหมด
func LookCategories(db *gorm.DB, c *fiber.Ctx) error {
	var categories []Models.Category
	if err := db.Find(&categories).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find categories: " + err.Error(),
		})
	}

	// แปลงเวลาสร้างให้เป็น UTC ก่อนส่งกลับ
	for i := range categories {
		categories[i].CreatedAt = categories[i].CreatedAt.UTC()
	}

	return c.JSON(fiber.Map{"Data": categories})
}

// DeleteCategory ลบ Category โดยใช้ categoryid
func DeleteCategory(db *gorm.DB, c *fiber.Ctx) error {
	categoryID := c.Params("categoryid") // รับ categoryid จากพารามิเตอร์ใน URL

	// ตรวจสอบว่ามีหมวดหมู่นี้ในฐานข้อมูลหรือไม่
	var category Models.Category
	if err := db.Where("category_id = ?", categoryID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found",
		})
	}

	// ลบหมวดหมู่นี้
	if err := db.Delete(&category).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete category: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Category deleted successfully",
	})
}

// Route สำหรับ Categories
func CategoryRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/categories", func(c *fiber.Ctx) error {
		return LookCategories(db, c)
	})
	app.Post("/categories", func(c *fiber.Ctx) error {
		return AddCategory(db, c)
	})
	app.Delete("/categories/:categoryid", func(c *fiber.Ctx) error {
		return DeleteCategory(db, c)
	})
}
