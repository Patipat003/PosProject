package Database

import (
	"github.com/gofiber/fiber/v2"
	"github.com/posproject/Models"
	"gorm.io/gorm"
)

// เพิ่ม Branch
func AddBranches(db *gorm.DB, c *fiber.Ctx) error {
	var req Models.Branches
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	if err := db.Create(&req).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create branch: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"New": req})
}

// ดู Branch ทั้งหมด
func LookBranches(db *gorm.DB, c *fiber.Ctx) error {
	var branches []Models.Branches
	if err := db.Find(&branches).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to find branches: " + err.Error(),
		})
	}
	return c.JSON(fiber.Map{"Data": branches})
}

// หา Branch ตาม ID
func FindBranch(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var branch Models.Branches
	if err := db.Where("branch_id = ?", id).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}
	return c.JSON(fiber.Map{"Data": branch})
}

// อัปเดต Branch
func UpdateBranch(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var branch Models.Branches
	if err := db.Where("branch_id = ?", id).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}

	var req Models.Branches
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid JSON format: " + err.Error(),
		})
	}

	branch.BName = req.BName
	branch.Location = req.Location

	if err := db.Save(&branch).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update branch: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Updated": "Succeed"})
}

// ลบ Branch
func DeleteBranch(db *gorm.DB, c *fiber.Ctx) error {
	id := c.Params("id")
	var branch Models.Branches
	if err := db.Where("branch_id = ?", id).First(&branch).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Branch not found",
		})
	}
	if err := db.Delete(&branch).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to delete branch: " + err.Error(),
		})
	}
	return c.Status(fiber.StatusOK).JSON(fiber.Map{"Deleted": "Succeed"})
}

// Route สำหรับ Branch
func BranchRoutes(app *fiber.App, db *gorm.DB) {
	app.Get("/branches", func(c *fiber.Ctx) error {
		return LookBranches(db, c)
	})
	app.Get("/branches/:id", func(c *fiber.Ctx) error {
		return FindBranch(db, c)
	})
	app.Post("/branches", func(c *fiber.Ctx) error {
		return AddBranches(db, c)
	})
	app.Put("/branches/:id", func(c *fiber.Ctx) error {
		return UpdateBranch(db, c)
	})
	app.Delete("/branches/:id", func(c *fiber.Ctx) error {
		return DeleteBranch(db, c)
	})
}
