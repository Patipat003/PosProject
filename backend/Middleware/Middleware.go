package Middleware

import (
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v4"
)

func IsAuthenticated() fiber.Handler {
	return func(c *fiber.Ctx) error {
		// ดึง token จาก header
		token := c.Get("Authorization")
		if token == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token missing"})
		}

		// ลบ "Bearer " ออกจาก token
		token = strings.TrimPrefix(token, "Bearer ")

		// ตรวจสอบและ parse token
		claims := jwt.MapClaims{}
		_, err := jwt.ParseWithClaims(token, claims, func(t *jwt.Token) (interface{}, error) {
			return []byte(os.Getenv("JWT_SECRET")), nil // ใช้ secret key ของคุณ
		})
		if err != nil {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Invalid or expired token"})
		}

		// ส่งข้อมูลผู้ใช้กลับ (สามารถใช้ user ID จาก claims หรือทำอะไรเพิ่มเติมได้ที่นี่)
		c.Locals("user", claims)

		// ตรวจสอบ role จาก claims และกำหนดการเข้าถึง
		role, ok := claims["role"].(string)
		if !ok || role == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "Token does not have a valid role"})
		}

		// ตรวจสอบ role และกำหนดการเข้าถึง route
		switch role {
		case "admin":
			// Admin สามารถเข้าถึงทุกอย่าง
			return c.Next()
		case "Manager":
			// Manager สามารถเข้าถึงทุกอย่าง ยกเว้น สำหรับ branches

			return c.Next()
		case "Cashier":
			// Cashier สามารถเข้าถึงเฉพาะ GET method สำหรับ /branches, /products, และ /inventory

			return c.Next()

		case "Audit":
			// Audit สามารถเข้าถึงข้อมูลทุกอย่าง แต่เฉพาะ GET method เท่านั้น
			if c.Method() != "GET" {
				return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
					"error": "Audit role can only perform GET requests",
				})
			}
			return c.Next()
		default:
			// ถ้า role ไม่มีสิทธิ์เข้าถึง
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "You do not have permission",
			})
		}
	}
}
