package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

func AddEmployees(db *gorm.DB, c *fiber.Ctx) error {
	// รับข้อมูล JSON จาก request body
	type UserRequest struct {
		Username string  `json:"username"`
		Password string  `json:"password"`
		Name     string  `json:"name"`
		Role     string  `json:"role"`
		BranchID string  `json:"branchid"`
		Salary   float64 `json:"salary"`
	}

	var req UserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ตรวจสอบว่า BranchID ที่ส่งมามีในฐานข้อมูลหรือไม่
	var branch Models.Branches
	if err := db.Where("branch_id = ?", req.BranchID).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}

	// สร้าง object `user` จากข้อมูลที่รับมาจาก request
	user := Models.Employees{
		Username: req.Username,
		Password: req.Password,
		Name:     req.Name,
		Role:     req.Role,
		BranchID: branch.BranchID, // เชื่อมโยงกับ Branch object
		Salary:   req.Salary,
	}

	// สร้าง employee ใหม่ในฐานข้อมูล
	if err := db.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user: " + err.Error(),
		})
	}

	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": user})
}

func LookEmployees(db *gorm.DB, c *fiber.Ctx) error {
	var users []Models.Employees
	if err := db.Find(&users).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find users: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"This": "User", "Data": users})
}

func FindEmployees(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var user Models.Employees
	if err := db.Where("employee_id = ?", id).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}
	return c.JSON(fiber.Map{"This": "User", "Data": user})
}

func DeleteEmployees(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var user Models.Employees
	if err := db.Where("employee_id = ?", id).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}
	if err := db.Delete(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete user: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

func UpdateEmployees(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var user Models.Employees
	if err := db.Where("employee_id = ?", id).First(&user).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}

	// รับข้อมูล JSON ที่จะอัปเดตจาก BodyParser
	type UserRequest struct {
		Username string  `json:"username"`
		Password string  `json:"password"`
		Name     string  `json:"name"`
		Role     string  `json:"role"`
		BranchID string  `json:"branchid"`
		Salary   float64 `json:"salary"`
	}

	var req UserRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	// ค้นหา Branch ที่ตรงกับ BranchID
	var branch Models.Branches
	if err := db.First(&branch, "branch_id = ?", req.BranchID).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}

	// อัปเดตข้อมูลผู้ใช้
	user.Username = req.Username
	user.Password = req.Password
	user.Name = req.Name
	user.Role = req.Role
	user.BranchID = branch.BranchID // เชื่อมโยงกับ Branch ที่ค้นหามา
	user.Salary = req.Salary

	// บันทึกการอัปเดตลงฐานข้อมูล
	if err := db.Save(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update user: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

func EmployeesRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/Employees", func(c *fiber.Ctx) error {
		return LookEmployees(db, c)
	})
	app.Get("/Employees/:id", func(c *fiber.Ctx) error {
		return FindEmployees(db, c)
	})
	app.Post("/Employees", func(c *fiber.Ctx) error {
		return AddEmployees(db, c)
	})
	app.Put("/Employees/:id", func(c *fiber.Ctx) error {
		return UpdateEmployees(db, c)
	})
	app.Delete("/Employees/:id", func(c *fiber.Ctx) error {
		return DeleteEmployees(db, c)
	})
}
