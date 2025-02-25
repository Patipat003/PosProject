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

// ประกาศตัวแปร global สำหรับฐานข้อมูล PosDB และ WarehouseDB
var posDB *gorm.DB
var warehouseDB *gorm.DB

// ฟังก์ชันสำหรับเชื่อมต่อกับฐานข้อมูล
func connectDB(host string, port int, user string, password string, dbname string) (*gorm.DB, error) {
	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable", host, port, user, password, dbname)
	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

func main() {
	// โหลด .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	// การตั้งค่าฐานข้อมูล PosDB
	posHost := os.Getenv("POS_DB_HOST")
	posPort, _ := strconv.Atoi(os.Getenv("POS_DB_PORT"))
	posUser := os.Getenv("POS_DB_USER")
	posPassword := os.Getenv("POS_DB_PASSWORD")
	posDBName := os.Getenv("POS_DB_NAME")

	// การตั้งค่าฐานข้อมูล WarehouseDB
	warehouseHost := os.Getenv("WAREHOUSE_DB_HOST")
	warehousePort, _ := strconv.Atoi(os.Getenv("WAREHOUSE_DB_PORT"))
	warehouseUser := os.Getenv("WAREHOUSE_DB_USER")
	warehousePassword := os.Getenv("WAREHOUSE_DB_PASSWORD")
	warehouseDBName := os.Getenv("WAREHOUSE_DB_NAME")

	// เชื่อมต่อกับฐานข้อมูล PosDB
	posDB, err = connectDB(posHost, posPort, posUser, posPassword, posDBName)
	if err != nil {
		log.Fatalf("Failed to connect to PosDB: %v", err)
	}
	log.Println("Connected to PosDB")

	// เชื่อมต่อกับฐานข้อมูล WarehouseDB
	warehouseDB, err = connectDB(warehouseHost, warehousePort, warehouseUser, warehousePassword, warehouseDBName)
	if err != nil {
		log.Fatalf("Failed to connect to WarehouseDB: %v", err)
	}
	log.Println("Connected to WarehouseDB")

	// ทำการ AutoMigrate โมเดลสำหรับ PosDB
	err = posDB.AutoMigrate(
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
	)

	if err != nil {
		log.Fatalf("AutoMigrate failed for PosDB: %v", err)
	}

	// สร้าง Fiber app
	app := fiber.New()

	// กำหนด CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "*",                                                                       // อนุญาตให้ React app ที่รันที่ localhost:3000 เข้าถึง
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE",                                               // อนุญาต HTTP methods
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, ngrok-skip-browser-warning", // อนุญาต headers
		AllowCredentials: true,                                                                      // อนุญาตการใช้ credentials เช่น cookies, authorization headers
	}))

	app.Get("/warehouse", func(c *fiber.Ctx) error {
		var branches []Models.Branches
		// ดึงข้อมูลจาก WarehouseDB โดยใช้ warehouseDB
		if err := warehouseDB.Find(&branches).Error; err != nil {
			return c.Status(500).JSON(fiber.Map{
				"message": "Failed to fetch branches from WarehouseDB",
				"error":   err.Error(),
			})
		}

		// ส่งข้อมูลกลับไปยัง frontend
		return c.JSON(branches)
	})

	// กำหนด routes สำหรับการจัดการต่างๆ
	app.Post("/login", Database.LoginHandler(posDB)) // route สำหรับ login

	// ใช้ middleware ตรวจสอบ JWT token สำหรับทุกๆ route ที่ต้องการ
	app.Use(Middleware.IsAuthenticated())

	// กำหนด routes อื่นๆ
	Database.BranchRoutes(app, posDB)
	Database.EmployeesRoutes(app, posDB)
	Database.ProductRoutes(app, posDB)
	Database.InventoryRoutes(app, posDB)
	Database.SaleRoutes(app, posDB)
	Database.SaleItemRoutes(app, posDB)
	Database.ReceiptRoutes(app, posDB)
	Database.ReceiptItemRoutes(app, posDB)
	Database.RequestRoutes(app, posDB)
	Database.ShipmentRoutes(app, posDB)
	Database.CategoryRoutes(app, posDB)

	// เริ่มต้นเซิร์ฟเวอร์ที่พอร์ต 5050
	log.Fatal(app.Listen(":6060"))
}
