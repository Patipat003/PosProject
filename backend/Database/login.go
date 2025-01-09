package Database

import (
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
	"github.com/posproject/Models"
	"golang.org/x/crypto/bcrypt" // import bcrypt
	"gorm.io/gorm"
)

// LoginHandler สำหรับการ login และสร้าง token
func LoginHandler(db *gorm.DB) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// รับข้อมูลจาก body (เช่น username และ password)
		var body struct {
			Email    string `json:"email"`
			Password string `json:"password"`
		}
		if err := c.BodyParser(&body); err != nil {
			return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
				"error": "Invalid request",
			})
		}

		// ค้นหาผู้ใช้จากฐานข้อมูล
		var employee Models.Employees
		if err := db.Where("email = ?", body.Email).First(&employee).Error; err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid credentials",
			})
		}

		// ตรวจสอบ password (ใช้ bcrypt ในการตรวจสอบ)
		err := bcrypt.CompareHashAndPassword([]byte(employee.Password), []byte(body.Password))
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid credentials",
			})
		}

		// สร้าง JWT token
		claims := jwt.MapClaims{
			"email":    body.Email,
			"role":     employee.Role,
			"branchid": employee.BranchID,                     // เพิ่มข้อมูล branchid จาก employee
			"exp":      time.Now().Add(time.Hour * 24).Unix(), // กำหนดวันหมดอายุเป็น 1 วัน
		}
		token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

		// เซ็นชื่อด้วย secret key
		secretKey := []byte(os.Getenv("JWT_SECRET"))
		tokenString, err := token.SignedString(secretKey)
		if err != nil {
			log.Fatal("Error signing the token: ", err)
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Could not generate token",
			})
		}

		// ส่ง token กลับ
		return c.JSON(fiber.Map{
			"token": tokenString,
		})
	}
}
