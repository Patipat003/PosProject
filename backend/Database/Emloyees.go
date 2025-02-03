package Database

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"github.com/posproject/Models"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// เพิ่ม Employee
func AddEmployees(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Employees
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ตรวจสอบว่า Role เป็น Super Admin หรือไม่
	if req.Role == "Super Admin" {
		// ตรวจสอบว่า user ที่ทำการเพิ่มสามารถเพิ่ม Super Admin ได้
		// คุณอาจจะเพิ่มเงื่อนไขว่าเฉพาะ Super Admin สามารถเพิ่ม Super Admin ได้
		userRole := "Super Admin" // ตัวอย่างนี้สามารถแทนที่ด้วยการตรวจสอบ Role ของผู้ใช้ใน session หรือ token
		if userRole != "Super Admin" {
			return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
				"error": "Only Super Admin can add Super Admin.",
			})
		}

		// ตั้งค่า BranchID เป็น NULL หรือค่า default สำหรับ Super Admin
		req.BranchID = nil // หรือ "" ถ้าใช้ string
	}

	// แฮชรหัสผ่าน
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Error hashing password: " + err.Error(),
		})
	}
	req.Password = string(hashedPassword)
	req.EmployeeID = uuid.New().String()
	req.CreatedAt = time.Now()

	// สร้างข้อมูล Employee
	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create employee: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Employees ทั้งหมด
func LookEmployees(db *gorm.DB, c *fiber.Ctx) error {
	var employees []Models.Employees
	if err := db.Find(&employees).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find employees: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": employees})
}

// หา Employee ตาม ID
func FindEmployee(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var employee Models.Employees
	if err := db.Where("employee_id = ?", id).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Employee not found",
		})
	}
	return c.JSON(fiber.Map{"Data": employee})
}

// อัปเดต Employee
func UpdateEmployee(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var employee Models.Employees
	if err := db.Where("employee_id = ?", id).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Employee not found",
		})
	}

	// ตรวจสอบสิทธิ์การอัปเดต
	userRole := "Super Admin" // ตัวอย่างนี้สามารถแทนที่ด้วยการตรวจสอบ Role ของผู้ใช้ใน session หรือ token
	if employee.Role == "Super Admin" && userRole != "Super Admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{
			"error": "You do not have permission to update a Super Admin.",
		})
	}

	var req Models.Employees
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	employee.Email = req.Email
	employee.Name = req.Name
	employee.Role = req.Role
	employee.BranchID = req.BranchID

	// แฮชรหัสผ่านใหม่ถ้ามีการเปลี่ยนแปลง
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error hashing password: " + err.Error(),
			})
		}
		employee.Password = string(hashedPassword)
	}

	if err := db.Save(&employee).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update employee: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Employee
func DeleteEmployee(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var employee Models.Employees
	if err := db.Where("employee_id = ?", id).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Employee not found",
		})
	}
	if err := db.Delete(&employee).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete employee: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

func PatchEmployee(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var employee Models.Employees
	if err := db.Where("employee_id = ?", id).First(&employee).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Employee not found",
		})
	}

	var req Models.Employees
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// อัปเดตเฉพาะข้อมูลที่มีการส่งมาใน request
	if req.Email != "" {
		employee.Email = req.Email
	}
	if req.Name != "" {
		employee.Name = req.Name
	}
	if req.Role != "" {
		employee.Role = req.Role
	}
	if req.BranchID != nil {
		employee.BranchID = req.BranchID
	}

	// แฮชรหัสผ่านใหม่ถ้ามีการเปลี่ยนแปลง
	if req.Password != "" {
		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"error": "Error hashing password: " + err.Error(),
			})
		}
		employee.Password = string(hashedPassword)
	}

	if err := db.Save(&employee).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update employee: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// Route สำหรับ Employees
func EmployeesRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/employees", func(c *fiber.Ctx) error {
		return LookEmployees(db, c)
	})
	app.Get("/employees/:id", func(c *fiber.Ctx) error {
		return FindEmployee(db, c)
	})
	app.Post("/employees", func(c *fiber.Ctx) error {
		return AddEmployees(db, c)
	})
	app.Put("/employees/:id", func(c *fiber.Ctx) error {
		return UpdateEmployee(db, c)
	})
	app.Patch("/employees/:id", func(c *fiber.Ctx) error {
		return PatchEmployee(db, c)
	})
	app.Delete("/employees/:id", func(c *fiber.Ctx) error {
		return DeleteEmployee(db, c)
	})
}
