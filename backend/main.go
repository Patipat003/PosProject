package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/posproject/Database" // import middleware package   // import routes package
	"github.com/posproject/Middleware"
	"github.com/posproject/Models"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file")
	}

	host := os.Getenv("DB_HOST")
	port, _ := strconv.Atoi(os.Getenv("DB_PORT"))
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")

	dsn := fmt.Sprintf("host=%s port=%d user=%s password=%s dbname=%s sslmode=disable",
		host, port, user, password, dbname)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("failed to connect to database: %v", err)
	}

	// Automatically migrate models
	db.AutoMigrate(
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

	// Set up Fiber app
	app := fiber.New()

	// // Define routes
	app.Post("/login", Database.LoginHandler(db)) // route สำหรับ login

	// // ใช้ middleware ตรวจสอบ JWT token สำหรับทุกๆ route ที่ต้องการ
	app.Use(Middleware.IsAuthenticated())

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

	log.Fatal(app.Listen(":5050"))
}
