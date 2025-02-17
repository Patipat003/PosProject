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

// ✅ เพิ่มสินค้าใหม่ พร้อมสร้าง SKU โดยดึง categorycode จากฐานข้อมูล
func AddProduct(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Product
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// 🔍 ตรวจสอบ CategoryID และดึง categorycode จากฐานข้อมูล
	var category Models.Category
	if err := db.Where("category_id = ?", req.CategoryID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found for CategoryID: " + req.CategoryID,
		})
	}

	// ✅ ใช้ categorycode จากฐานข้อมูลแทน
	req.ProductID = uuid.New().String()
	req.ProductCode = generateSKU(category.CategoryCode, db) // ใช้ categorycode จริงจากฐานข้อมูล
	req.CreatedAt = time.Now()

	// ✅ บันทึก Product ลงฐานข้อมูล
	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create product: " + err.Error(),
		})
	}

	// ✅ ดึงข้อมูลสาขาทั้งหมด
	var branches []Models.Branches
	if err := db.Find(&branches).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve branches: " + err.Error(),
		})
	}

	// ✅ สร้าง Inventory สำหรับทุกสาขา
	for _, branch := range branches {
		inventory := Models.Inventory{
			ProductID: req.ProductID,
			BranchID:  branch.BranchID,
			Quantity:  0,
			UpdatedAt: time.Now(),
		}
		if err := db.Create(&inventory).Error; err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create inventory for branch: " + err.Error(),
			})
		}
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ✅ ฟังก์ชันสร้าง SKU โดยใช้ categorycode จากฐานข้อมูล
func generateSKU(categoryCode string, db *gorm.DB) string {
	rand.Seed(time.Now().UnixNano()) // ใช้ Seed เพื่อให้เลขสุ่มเปลี่ยนทุกครั้ง
	randomNumber := rand.Intn(90000) + 10001
	randomSKU := fmt.Sprintf("%s-%d", categoryCode, randomNumber)

	// ตรวจสอบว่า SKU ซ้ำหรือไม่
	var existingProduct Models.Product
	if err := db.Where("product_code = ?", randomSKU).First(&existingProduct).Error; err == nil {
		return generateSKU(categoryCode, db) // ถ้าซ้ำให้สุ่มใหม่
	}

	return randomSKU
}

// ✅ ดู Products ทั้งหมด
func LookProducts(db *gorm.DB, c *fiber.Ctx) error {
	var products []Models.Product
	if err := db.Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find products: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": products})
}

// ✅ หา Product ตาม ID หรือ ProductCode
func FindProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product

	if err := db.Where("product_id = ? OR product_code = ?", id, id).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}
	return c.JSON(fiber.Map{"Data": product})
}

// ✅ อัปเดต Product
func UpdateProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product

	// ตรวจสอบว่าสินค้านี้มีอยู่จริงหรือไม่
	if err := db.Where("product_id = ?", id).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	var req Models.Product
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ✅ ตรวจสอบ CategoryID ใหม่ และดึง categorycode
	var category Models.Category
	if err := db.Where("category_id = ?", req.CategoryID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid CategoryID: " + err.Error(),
		})
	}

	// ✅ เช็คว่า CategoryID มีการเปลี่ยนแปลงหรือไม่
	if product.CategoryID != req.CategoryID {
		product.ProductCode = generateSKU(category.CategoryCode, db) // สร้างรหัสใหม่
	}

	// อัปเดตฟิลด์ต่างๆ
	product.ProductName = req.ProductName
	product.Description = req.Description
	product.Price = req.Price
	product.UnitsPerBox = req.UnitsPerBox
	product.ImageURL = req.ImageURL
	product.CategoryID = req.CategoryID

	if err := db.Save(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update product: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed", "ProductCode": product.ProductCode})
}

// ✅ ลบ Product และ Inventory ที่เกี่ยวข้อง
func DeleteProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")

	// เริ่ม transaction
	tx := db.Begin()

	// ลบ Inventory
	if err := tx.Where("product_id = ?", id).Delete(&Models.Inventory{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete inventory: " + err.Error(),
		})
	}

	// ลบ Product
	var product Models.Product
	if err := tx.Where("product_id = ?", id).First(&product).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	if err := tx.Delete(&product).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete product: " + err.Error(),
		})
	}

	// Commit การลบ
	tx.Commit()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// ✅ Route สำหรับ Products
func ProductRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/products", func(c *fiber.Ctx) error {
		return LookProducts(db, c)
	})
	app.Get("/products/:id", func(c *fiber.Ctx) error {
		return FindProduct(db, c)
	})
	app.Post("/products", func(c *fiber.Ctx) error {
		return AddProduct(db, c)
	})
	app.Put("/products/:id", func(c *fiber.Ctx) error {
		return UpdateProduct(db, c)
	})
	app.Delete("/products/:id", func(c *fiber.Ctx) error {
		return DeleteProduct(db, c)
	})
}
