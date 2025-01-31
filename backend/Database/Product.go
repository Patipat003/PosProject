package Database

import (
	"fmt"
	"math/rand"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Product พร้อม SKU อิงตาม CategoryID และสร้าง Inventory สำหรับทุกสาขา
func AddProduct(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Product
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ตรวจสอบ CategoryID
	var category Models.Category
	if err := db.Where("category_id = ?", req.CategoryID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Category not found for CategoryID: " + req.CategoryID,
		})
	}

	// สร้าง SKU อิงตาม CategoryID (ใช้ CategoryName เพื่อสร้างรหัส)
	categoryCode := getCategoryCode(category.CategoryName)
	req.ProductID = uuid.New().String()             // UUID สำหรับ ProductID
	req.ProductCode = generateSKU(categoryCode, db) // สร้าง SKU ที่ไม่ซ้ำกัน
	req.CreatedAt = time.Now()

	// สร้าง Product
	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create product: " + err.Error(),
		})
	}

	// ดึงข้อมูลสาขาทั้งหมด
	var branches []Models.Branches
	if err := db.Find(&branches).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to retrieve branches: " + err.Error(),
		})
	}

	// สร้าง Inventory สำหรับทุกสาขา
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

// ฟังก์ชันช่วยในการดึงรหัสหมวดหมู่ (Category Code) เช่น "SPP" จากชื่อหมวดหมู่
func getCategoryCode(categoryName string) string {
	// แปลงชื่อหมวดหมู่ให้เป็นรหัสที่สามารถใช้ใน SKU ได้
	categoryName = strings.ToLower(categoryName) // แปลงเป็นพิมพ์เล็ก

	switch categoryName {
	case "specialty products":
		return "SPP"
	case "seasonal products":
		return "SSP"
	case "pharmaceutical and health products":
		return "PHAR"
	case "fresh produce":
		return "FRS"
	case "electronics":
		return "ELEC"
	case "fashion":
		return "FASH"
	case "toys and kids' products":
		return "TNK"
	case "stationery and office supplies":
		return "STOFF"
	case "personal care":
		return "PSNC"
	case "fruits and vegetables":
		return "FNV"
	case "consumer goods":
		return "CSM"
	case "food and beverages":
		return "FNB"
	default:
		return "GEN" // ใช้รหัส "GEN" หากไม่พบหมวดหมู่ที่ตรง
	}
}

// ฟังก์ชันช่วยในการสร้าง SKU โดยใช้ category code และหมายเลขที่ไม่ซ้ำกัน
func generateSKU(categoryCode string, db *gorm.DB) string {
	// สร้างหมายเลขสุ่มในช่วง 10001 ถึง 99999
	rand.Seed(time.Now().UnixNano())         // กำหนด seed สำหรับการสุ่ม
	randomNumber := rand.Intn(90000) + 10001 // สุ่มระหว่าง 10001 ถึง 99999

	// สร้าง SKU จาก categoryCode และหมายเลขสุ่ม
	randomSKU := fmt.Sprintf("%s-%d", categoryCode, randomNumber)

	// ตรวจสอบว่า SKU นี้ซ้ำหรือไม่
	var existingProduct Models.Product
	if err := db.Where("product_code = ?", randomSKU).First(&existingProduct).Error; err == nil {
		// หากพบ SKU ซ้ำ ให้เรียกใช้ฟังก์ชันนี้อีกครั้ง
		return generateSKU(categoryCode, db)
	}

	// ส่งคืน SKU ที่ไม่ซ้ำ
	return randomSKU
}

// ดู Products ทั้งหมด
func LookProducts(db *gorm.DB, c *fiber.Ctx) error {
	var products []Models.Product
	if err := db.Find(&products).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find products: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": products})
}

// หา Product ตาม ID หรือ ProductCode
func FindProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product

	// ค้นหาได้ทั้ง product_id และ product_code
	if err := db.Where("product_id = ? OR product_code = ?", id, id).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}
	return c.JSON(fiber.Map{"Data": product})
}

// อัปเดต Product
func UpdateProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product
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

	// ตรวจสอบ CategoryID
	var category Models.Category
	if err := db.Where("category_id = ?", req.CategoryID).First(&category).Error; err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid CategoryID: " + err.Error(),
		})
	}

	// ตรวจสอบว่า ProductCode ใหม่ซ้ำหรือไม่
	if req.ProductCode != product.ProductCode {
		var existing Models.Product
		if err := db.Where("product_code = ?", req.ProductCode).First(&existing).Error; err == nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "ProductCode already exists",
			})
		}
	}

	// อัปเดตฟิลด์
	product.ProductCode = req.ProductCode
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
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Product และ Inventory ที่เกี่ยวข้องทั้งหมด
func DeleteProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")

	// เริ่มต้น transaction
	tx := db.Begin()

	// ลบ Inventory ที่เกี่ยวข้องทั้งหมดก่อน
	if err := tx.Where("product_id = ?", id).Delete(&Models.Inventory{}).Error; err != nil {
		tx.Rollback() // หากลบ Inventory ไม่สำเร็จ ย้อนกลับการทำงานทั้งหมด
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete inventory: " + err.Error(),
		})
	}

	// ลบ Product
	var product Models.Product
	if err := tx.Where("product_id = ?", id).First(&product).Error; err != nil {
		tx.Rollback() // หากไม่พบ Product ให้ย้อนกลับ
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}

	if err := tx.Delete(&product).Error; err != nil {
		tx.Rollback() // หากลบ Product ไม่สำเร็จ ย้อนกลับการทำงานทั้งหมด
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete product: " + err.Error(),
		})
	}

	// Commit การลบทั้งสองตาราง
	tx.Commit()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Products
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
