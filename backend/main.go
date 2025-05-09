package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/posproject/Database"
	"github.com/posproject/Middleware"
	"github.com/posproject/Migrations"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var posDB *gorm.DB

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
	fmt.Println("JWT_SECRET =", os.Getenv("JWT_SECRET"))

	// การตั้งค่าฐานข้อมูล PosDB
	posHost := os.Getenv("POS_DB_HOST")
	posPort, _ := strconv.Atoi(os.Getenv("POS_DB_PORT"))
	posUser := os.Getenv("POS_DB_USER")
	posPassword := os.Getenv("POS_DB_PASSWORD")
	posDBName := os.Getenv("POS_DB_NAME")

	// เชื่อมต่อกับฐานข้อมูล PosDB
	posDB, err = connectDB(posHost, posPort, posUser, posPassword, posDBName)
	if err != nil {
		log.Fatalf("Failed to connect to PosDB: %v", err)
	}
	log.Println("Connected to PosDB")

	// ทำการ Migration
	if err := Migrations.Migrate(posDB); err != nil {
		log.Fatalf("Migration failed: %v", err)
	}

	// สร้าง Fiber app
	app := fiber.New()

	// กำหนด CORS middleware
	app.Use(cors.New(cors.Config{
		AllowOrigins:     "http://127.0.0.1:3000",                                                   // อนุญาตให้ React app ที่รันที่ localhost:3000 เข้าถึง
		AllowMethods:     "GET,POST,PUT,PATCH,DELETE",                                               // อนุญาต HTTP methods
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization, ngrok-skip-browser-warning", // อนุญาต headers
		AllowCredentials: true,                                                                      // อนุญาตการใช้ credentials เช่น cookies, authorization headers
	}))

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

	// เริ่มแอปพลิเคชัน
	log.Fatal(app.Listen(":6060"))
}
