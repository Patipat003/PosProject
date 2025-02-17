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

// เพิ่ม Sale พร้อม SaleItems, สร้างใบเสร็จและอัปเดต Inventory
func AddSale(db *gorm.DB, c *fiber.Ctx) error {
	type SaleRequest struct {
		EmployeeID string             `json:"employeeid"`
		BranchID   string             `json:"branchid"`
		SaleItems  []Models.SaleItems `json:"saleitems"`
	}

	var req SaleRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// คำนวณยอดขายรวม
	var totalAmount float64
	for _, item := range req.SaleItems {
		totalAmount += item.TotalPrice
	}

	// สร้าง Sales
	sale := Models.Sales{
		SaleID:      uuid.New().String(),
		EmployeeID:  req.EmployeeID,
		BranchID:    req.BranchID,
		TotalAmount: totalAmount,
		CreatedAt:   time.Now(),
	}

	// ใช้ Transaction เพื่อความปลอดภัย
	tx := db.Begin()

	if err := tx.Create(&sale).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create sale: " + err.Error(),
		})
	}

	// เพิ่ม SaleItems และอัปเดต Inventory
	for _, item := range req.SaleItems {
		item.SaleID = sale.SaleID
		if err := tx.Create(&item).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create sale item: " + err.Error(),
			})
		}

		// อัปเดต Inventory
		var inventory Models.Inventory
		if err := tx.Where("product_id = ? AND branch_id = ?", item.ProductID, sale.BranchID).First(&inventory).Error; err == nil {
			if inventory.Quantity < item.Quantity {
				tx.Rollback()
				return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
					"error": "Not enough inventory for product: " + item.ProductID,
				})
			}
			inventory.Quantity -= item.Quantity
			inventory.UpdatedAt = time.Now()
			if err := tx.Save(&inventory).Error; err != nil {
				tx.Rollback()
				return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
					"error": "Failed to update inventory: " + err.Error(),
				})
			}
		} else {
			tx.Rollback()
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Inventory not found for product: " + item.ProductID,
			})
		}
	}

	// สร้างหมายเลขใบเสร็จ
	rand.Seed(time.Now().UnixNano())                               // ตั้งค่า Seed ให้สุ่มได้ทุกครั้ง
	receiptNumber := fmt.Sprintf("R%010d", rand.Intn(10000000000)) // สุ่มตัวเลข 5 หลัก

	receipt := Models.Receipts{
		SaleID:        sale.SaleID,
		BranchID:      sale.BranchID,
		ReceiptNumber: receiptNumber,
		TotalAmount:   totalAmount,
		ReceiptDate:   time.Now(),
	}

	if err := tx.Create(&receipt).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create receipt: " + err.Error(),
		})
	}

	// สร้าง ReceiptItems
	for _, item := range req.SaleItems {
		receiptItem := Models.ReceiptItems{
			ReceiptID:  receipt.ReceiptID,
			ProductID:  item.ProductID,
			Quantity:   item.Quantity,
			UnitPrice:  item.Price, // ใช้ราคาจาก SaleItems
			TotalPrice: item.TotalPrice,
		}
		if err := tx.Create(&receiptItem).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to create receipt item: " + err.Error(),
			})
		}
	}

	tx.Commit()
	return c.Status(fiber.StatusOK).JSON(fiber.Map{
		"message": "Sale and receipt created successfully",
		"sale":    sale,
		"receipt": receipt,
	})
}

// ดู Sales ทั้งหมด
func LookSales(db *gorm.DB, c *fiber.Ctx) error {
	var sales []Models.Sales
	if err := db.Find(&sales).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find sales: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": sales})
}

// หา Sale ตาม ID
func FindSale(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var sale Models.Sales
	if err := db.Where("sale_id = ?", id).First(&sale).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale not found",
		})
	}
	return c.JSON(fiber.Map{"Data": sale})
}

// อัปเดต Sale
func UpdateSale(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var sale Models.Sales
	if err := db.Where("sale_id = ?", id).First(&sale).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale not found",
		})
	}

	var req Models.Sales
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	sale.EmployeeID = req.EmployeeID
	sale.BranchID = req.BranchID
	sale.TotalAmount = req.TotalAmount
	sale.CreatedAt = time.Now()

	if err := db.Save(&sale).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update sale: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Sale และข้อมูลที่เกี่ยวข้อง
func DeleteSale(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id") // รับ sale_id

	// ค้นหา Sale
	var sale Models.Sales
	if err := db.Where("sale_id = ?", id).First(&sale).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Sale not found",
		})
	}

	// ใช้ Transaction เพื่อความปลอดภัย
	tx := db.Begin()

	// ค้นหา receipt_id ที่เกี่ยวข้องกับ sale_id
	var receipt Models.Receipts
	if err := tx.Where("sale_id = ?", id).First(&receipt).Error; err == nil {
		// ลบ ReceiptItems ที่มี receipt_id นี้
		if err := tx.Where("receipt_id = ?", receipt.ReceiptID).Delete(&Models.ReceiptItems{}).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to delete receipt items: " + err.Error(),
			})
		}

		// ลบ Receipts
		if err := tx.Where("sale_id = ?", id).Delete(&Models.Receipts{}).Error; err != nil {
			tx.Rollback()
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Failed to delete receipt: " + err.Error(),
			})
		}
	}

	// ลบ SaleItems ที่เกี่ยวข้อง
	if err := tx.Where("sale_id = ?", id).Delete(&Models.SaleItems{}).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete sale items: " + err.Error(),
		})
	}

	// ลบ Sale
	if err := tx.Delete(&sale).Error; err != nil {
		tx.Rollback()
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete sale: " + err.Error(),
		})
	}

	tx.Commit()

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Sales
func SaleRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/sales", func(c *fiber.Ctx) error {
		return LookSales(db, c)
	})
	app.Get("/sales/:id", func(c *fiber.Ctx) error {
		return FindSale(db, c)
	})
	app.Post("/sales", func(c *fiber.Ctx) error {
		return AddSale(db, c)
	})
	app.Put("/sales/:id", func(c *fiber.Ctx) error {
		return UpdateSale(db, c)
	})
	app.Delete("/sales/:id", func(c *fiber.Ctx) error {
		return DeleteSale(db, c)
	})
}
