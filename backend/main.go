package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/posproject/Database"
	"github.com/posproject/Middleware"
	"github.com/posproject/Models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // ใช้ CORS middleware
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	// โหลด .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	// การตั้งค่าฐานข้อมูลจาก .env
	host := os.Getenv("DB_HOST")
	port, _ := strconv.Atoi(os.Getenv("DB_PORT"))
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	// เชื่อมต่อกับฐานข้อมูล
	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// ทำการ AutoMigrate โมเดล
	err = db.AutoMigrate(
		&Models.Employees{},
		&Models.Branches{},
		&Models.Product{},
		&Models.Inventory{},
		&Models.Sales{},
		&Models.SaleItems{},
		&Models.Receipts{},
		&Models.ReceiptItems{},
		&Models.Requests{},
		&Models.Shipments{},
		&Models.Category{},
	)
	if err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	// สร้าง Fiber app
	app := fiber.New()

	// กำหนด CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://127.0.0.1:3000",                       // อนุญาตให้ React app ที่รันที่ localhost:3000 เข้าถึง
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE",                         // อนุญาต HTTP methods
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization", // อนุญาต headers
		AllowCredentials: true,                                          // อนุญาตการใช้ credentials เช่น cookies, authorization headers
	}))

	// กำหนด routes สำหรับการจัดการต่างๆ
	app.Post("/login", Database.LoginHandler(db)) // route สำหรับ login

	// ใช้ middleware ตรวจสอบ JWT token สำหรับทุกๆ route ที่ต้องการ
	app.Use(Middleware.IsAuthenticated())
	

	// กำหนด routes อื่นๆ
	Database.BranchRoutes(app, db)
	Database.EmployeesRoutes(app, db)
	Database.ProductRoutes(app, db)
	Database.InventoryRoutes(app, db)
	Database.SaleRoutes(app, db)
	Database.SaleItemRoutes(app, db)
	Database.ReceiptRoutes(app, db)
	Database.ReceiptItemRoutes(app, db)
	Database.RequestRoutes(app, db)
	Database.ShipmentRoutes(app, db)
	Database.CategoryRoutes(app, db)

	// เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 5050
	log.Fatal(app.Listen(":5050"))
}
