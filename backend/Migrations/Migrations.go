package Migrations

import (
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/posproject/Models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// Migrate ทำการ migration ทั้งหมดที่ต้องการ
func Migrate(tx *gorm.DB) error {
	// รวม AutoMigrate ทั้งหมดไว้ที่นี่
	if err := tx.AutoMigrate(
		&Models.Employees{},
		&Models.Branches{},
		&Models.Product{},
		&Models.Inventory{},
		&Models.Sales{},
		&Models.SaleItems{},
		&Models.Receipts{},
		&Models.ReceiptItems{},
		&Models.Requests{},
		&Models.Category{},
		&Models.Shipments{},
		&Models.ShipmentItems{},
	); err != nil {
		return err
	}

	// สร้าง branch เริ่มต้นถ้ายังไม่มี
	var branch Models.Branches
	tx.Model(&Models.Branches{}).First(&branch)
	if branch.BranchID == "" {
		branch = Models.Branches{
			BranchID:       uuid.New().String(),
			BName:          "Main Branch",
			Location:       "Thailand",
			GoogleLocation: "13.7563, 100.5018",
			CreatedAt:      time.Now(),
		}
		if err := tx.Create(&branch).Error; err != nil {
			log.Fatal("Error creating Main Branch: ", err)
			return err
		}
		log.Println("Main Branch created successfully!")
	}

	// สร้าง Super Admin ถ้ายังไม่มี
	var superAdminCount int64
	tx.Model(&Models.Employees{}).Where("role = ?", "Super Admin").Count(&superAdminCount)
	if superAdminCount == 0 {
		hashedPassword, _ := bcrypt.GenerateFromPassword([]byte("1234"), bcrypt.DefaultCost)

		superAdmin := Models.Employees{
			EmployeeID: uuid.New().String(),
			Email:      "admin@admin.com",
			Password:   string(hashedPassword),
			Name:       "Super Admin",
			Role:       "Super Admin",
			BranchID:   nil,
			CreatedAt:  time.Now(),
		}

		if err := tx.Create(&superAdmin).Error; err != nil {
			log.Fatal("Error creating Super Admin: ", err)
			return err
		}
		log.Println("Super Admin created successfully!")
	}

	// สร้าง Category ถ้ายังไม่มี
	var categoryCount int64
	tx.Model(&Models.Category{}).Count(&categoryCount)

	var electronicsCategory Models.Category
	if categoryCount == 0 {
		electronicsCategory = Models.Category{
			CategoryID:   uuid.New().String(),
			CategoryName: "Electronics",
			CategoryCode: "ELEC",
			CreatedAt:    time.Now(),
		}
		if err := tx.Create(&electronicsCategory).Error; err != nil {
			log.Fatal("Error creating Category: ", err)
			return err
		}
		log.Println("Categories created successfully!")
	} else {
		if err := tx.Where("category_code = ?", "ELEC").First(&electronicsCategory).Error; err != nil {
			log.Fatal("Error fetching existing Category: ", err)
			return err
		}
	}

	// สร้าง Product ถ้ายังไม่มี
	var productCount int64
	tx.Model(&Models.Product{}).Count(&productCount)
	if productCount == 0 {
		products := []Models.Product{
			{
				ProductID:   uuid.New().String(),
				ProductCode: "ELEC-12345",
				ProductName: "Laptop",
				CategoryID:  electronicsCategory.CategoryID,
				Price:       999.99,
				CreatedAt:   time.Now(),
			},
		}
		for _, prod := range products {
			if err := tx.Create(&prod).Error; err != nil {
				log.Fatal("Error creating Product: ", err)
				return err
			}
		}
		log.Println("Products created successfully!")
	}

	return nil
}
