package Middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

// JWT Middleware ตรวจสอบ token และ role ของผู้ใช้
func IsAuthenticated() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// ดึงค่า Authorization Header
		token := c.Get("Authorization")
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Missing token",
			})
		}

		// ตัด "Bearer " ออกจาก token
		token = strings.TrimPrefix(token, "Bearer ")

		// ตรวจสอบ token
		claims := jwt.MapClaims{}
		parsedToken, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
			// ตรวจสอบว่า token ใช้ signing method ที่ถูกต้องหรือไม่
			if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fiber.ErrUnauthorized
			}
			return []byte(os.Getenv("JWT_SECRET")), nil
		})
		if err != nil || !parsedToken.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Invalid or expired token",
			})
		}

		// ตรวจสอบว่า claims มี role หรือไม่
		role, ok := claims["role"].(string)
		if !ok || role == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "Token does not have a valid role",
			})
		}

		// เก็บข้อมูล user จาก claims ไปใน context
		c.Locals("user", claims)

		// ตรวจสอบ role และกำหนดการเข้าถึง route
		// Admin สามารถเข้าถึงทุกอย่าง
		if role == "Admin" {
			return c.Next()
		}

		// Manager สามารถเข้าถึงทุกอย่าง ยกเว้น สำหรับ branches
		if role == "Manager" {
			// ตรวจสอบว่า route ที่เข้าถึงเกี่ยวข้องกับ branches และไม่ใช่ GET method
			if strings.HasPrefix(c.Path(), "/branches") && c.Method() != "GET" {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": "Managers can only view branches (GET method)",
				})
			}
			return c.Next()
		}

		// Cashier สามารถเข้าถึงเฉพาะ routes ที่เกี่ยวข้องกับ product
		if role == "Cashier" {
			// ตรวจสอบว่า route ที่เข้าถึงเกี่ยวข้องกับการเพิ่ม, ลบ, แก้ไข product หรือไม่
			if !strings.HasPrefix(c.Path(), "/products") {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": "Cashiers can only manage products",
				})
			}
			return c.Next()
		}

		// Audit สามารถเข้าถึงข้อมูลทุกอย่าง แต่เฉพาะ GET method เท่านั้น
		if role == "Audit" {
			// ตรวจสอบว่าเป็นการกระทำแบบ GET หรือไม่
			if c.Method() != "GET" {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": "Audit role can only perform GET requests",
				})
			}
			return c.Next()
		}

		// ถ้า role ไม่มีสิทธิ์เข้าถึง
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You do not have permission",
		})
	}
}
