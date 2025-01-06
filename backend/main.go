package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/posproject/Database"
	"github.com/posproject/Models"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors" // เพิ่มการใช้งาน CORS middleware
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
	)
	if err != nil {
		log.Fatalf("AutoMigrate failed: %v", err)
	}

	// สร้าง Fiber app
	app := fiber.New()

	// // Define routes
	//app.Post("/login", Database.LoginHandler(db)) // route สำหรับ login

	// // ใช้ middleware ตรวจสอบ JWT token สำหรับทุกๆ route ที่ต้องการ
	//app.Use(Middleware.IsAuthenticated())

	// กำหนด CORS middleware
	// ตั้งค่า CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://127.0.0.1:3000", // อนุญาตให้เข้าถึงจาก React ที่รันบน localhost:3000
		AllowMethods: "GET,POST,PUT,DELETE",   // อนุญาตเฉพาะ HTTP Methods ที่ต้องการ
		AllowHeaders: "Content-Type",          // อนุญาตแค่ Content-Type, ไม่อนุญาต Authorization
	}))

	// กำหนด routes สำหรับการจัดการต่างๆ
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

	// เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 5050
	log.Fatal(app.Listen(":5050"))
}
