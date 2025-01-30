package Database

import (
	"fmt"
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
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid CategoryID: " + err.Error(),
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
	switch strings.ToLower(categoryName) {
	case "specialty products":
		return "SPP"
	case "Seasonal Products":
		return "SSP"
	case "Pharmaceutical and Health Products":
		return "PHAR"
	case "Fresh Produce":
		return "FRS"
	case "Electronics":
		return "ELEC"
	case "Fashion":
		return "FASH"
	case "Toys and Kids' Products":
		return "TNK"
	case "Stationery and Office Supplies":
		return "STOFF"
	case "Personal Care":
		return "PSNC"
	case "Fruits and Vegetables":
		return "FNV"
	case "Consumer Goods":
		return "CSM"
	case "Food and Beverages":
		return "FNB"
	// เพิ่มกรณีอื่น ๆ ได้ที่นี่
	default:
		return "GEN" // ใช้รหัส "GEN" หากไม่พบหมวดหมู่ที่ตรง
	}
}

// ฟังก์ชันช่วยในการสร้าง SKU โดยใช้ category code และหมายเลขที่ไม่ซ้ำกัน
func generateSKU(categoryCode string, db *gorm.DB) string {
	// ค้นหา product ล่าสุดจาก categoryCode นี้
	var lastProduct Models.Product
	if err := db.Where("product_code LIKE ?", fmt.Sprintf("%s-%%", categoryCode)).Order("created_at desc").First(&lastProduct).Error; err != nil {
		return fmt.Sprintf("%s-10001", categoryCode) // ถ้าไม่พบสินค้าก่อนหน้านี้ ให้เริ่มต้นที่ 10001
	}

	// ดึงหมายเลข SKU ล่าสุดและเพิ่มขึ้น 1
	var lastSKU int
	fmt.Sscanf(lastProduct.ProductCode, fmt.Sprintf("%s-%d", categoryCode, &lastSKU))
	nextSKU := fmt.Sprintf("%s-%d", categoryCode, lastSKU+1)

	return nextSKU
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

// ลบ Product
func DeleteProduct(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var product Models.Product
	if err := db.Where("product_id = ?", id).First(&product).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Product not found",
		})
	}
	if err := db.Delete(&product).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete product: " + err.Error(),
		})
	}
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
