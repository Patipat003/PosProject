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
		return c.Next()
	}
}
