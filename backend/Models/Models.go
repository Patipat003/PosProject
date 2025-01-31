package Models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Employees struct
type Employees struct {
	EmployeeID string    `gorm:"type:uuid;primaryKey" json:"employeeid"`
	Email      string    `gorm:"type:varchar(20);not null;unique" json:"email"`
	Password   string    `gorm:"type:varchar(100);not null" json:"password"`
	Name       string    `gorm:"type:varchar(40);not null" json:"name"`
	Role       string    `gorm:"type:varchar(8);not null;check:role IN ('Cashier', 'Manager', 'Audit')" json:"role"`
	BranchID   string    `gorm:"type:uuid;foreignKey:BranchID" json:"branchid"`
	CreatedAt  time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"createdat"`
}

func (Employees) TableName() string {
	return "Employees"
}

func (s *Employees) BeforeCreate(tx *gorm.DB) (err error) {
	s.EmployeeID = uuid.New().String()
	return
}

// Branches struct
type Branches struct {
	BranchID  string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"branchid"`
	BName     string    `gorm:"type:varchar(100);not null" json:"bname"`
	Location  string    `gorm:"type:varchar(255);not null" json:"location"`
	CreatedAt time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"createdat"`
}

func (Branches) TableName() string {
	return "Branches"
}

func (s *Branches) BeforeCreate(tx *gorm.DB) (err error) {
	s.BranchID = uuid.New().String()
	return
}

// Product struct
type Product struct {
	ProductID   string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"productid"`
	ProductCode string    `gorm:"type:varchar(50);unique;not null" json:"productcode"` // รหัสสินค้า (SKU)
	ProductName string    `gorm:"type:varchar(100);not null" json:"productname"`
	Description string    `gorm:"type:varchar(255);not null" json:"description"`
	Price       float64   `gorm:"type:numeric(10,2);not null" json:"price"`
	UnitsPerBox int       `gorm:"type:int;not null;default:1" json:"unitsperbox"` // จำนวนชิ้นต่อกล่อง
	CreatedAt   time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"createdat"`
	ImageURL    string    `gorm:"type:varchar(255)" json:"imageurl"` // ฟิลด์สำหรับเก็บ URL ของภาพ
	CategoryID  string    `gorm:"type:uuid;foreignKey:CategoryID" json:"categoryid"`
}

func (Product) TableName() string {
	return "Products"
}

// Inventory struct
type Inventory struct {
	InventoryID string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"inventoryid"`
	ProductID   string    `gorm:"type:uuid;foreignKey:ProductID" json:"productid"`
	BranchID    string    `gorm:"type:uuid;foreignKey:BranchID" json:"branchid"`
	Quantity    int       `gorm:"type:int;not null" json:"quantity"`
	UpdatedAt   time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"updatedat"`
}

func (Inventory) TableName() string {
	return "Inventory"
}

// Sales struct
type Sales struct {
	SaleID      string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"saleid"`
	EmployeeID  string    `gorm:"type:uuid;foreignKey:EmployeeID" json:"employeeid"`
	BranchID    string    `gorm:"type:uuid;foreignKey:BranchID" json:"branchid"`
	TotalAmount float64   `gorm:"type:numeric(10,2);not null" json:"totalamount"`
	CreatedAt   time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"createdat"`
}

func (Sales) TableName() string {
	return "Sales"
}

// SaleItems struct
type SaleItems struct {
	SaleItemID string  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"saleitemid"`
	SaleID     string  `gorm:"type:uuid;foreignKey:SaleID" json:"saleid"`
	ProductID  string  `gorm:"type:uuid;foreignKey:ProductID" json:"productid"`
	Quantity   int     `gorm:"type:int;not null" json:"quantity"`
	Price      float64 `gorm:"type:numeric(10,2);not null" json:"price"`
	TotalPrice float64 `gorm:"type:numeric(10,2);not null" json:"totalprice"`
	// Removed CreatedAt for simplicity
}

func (SaleItems) TableName() string {
	return "SaleItems"
}

// Receipts struct
type Receipts struct {
	ReceiptID     string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"receiptid"`
	SaleID        string    `gorm:"type:uuid;foreignKey:SaleID" json:"saleid"`
	BranchID      string    `gorm:"type:uuid;foreignKey:BranchID" json:"branchid"`
	ReceiptNumber string    `gorm:"type:varchar(100);not null;unique" json:"receiptnumber"`
	TotalAmount   float64   `gorm:"type:numeric(10,2);not null" json:"totalamount"`
	ReceiptDate   time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"receiptdate"`
}

func (Receipts) TableName() string {
	return "Receipts"
}

// ReceiptItems struct
type ReceiptItems struct {
	ReceiptItemID string  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"receiptitemid"`
	ReceiptID     string  `gorm:"type:uuid;foreignKey:ReceiptID" json:"receiptid"`
	ProductID     string  `gorm:"type:uuid;foreignKey:ProductID" json:"productid"`
	Quantity      int     `gorm:"type:int;not null" json:"quantity"`
	UnitPrice     float64 `gorm:"type:numeric(10,2);not null" json:"unitprice"`
	TotalPrice    float64 `gorm:"type:numeric(10,2);not null" json:"totalprice"`
	// Removed BranchID as it can be derived from Receipts
}

func (ReceiptItems) TableName() string {
	return "ReceiptItems"
}

// Requests struct
type Requests struct {
	RequestID    string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"requestid"`
	FromBranchID string    `gorm:"type:uuid;foreignKey:BranchID" json:"frombranchid"`
	ToBranchID   string    `gorm:"type:uuid;foreignKey:BranchID" json:"tobranchid"`
	ProductID    string    `gorm:"type:uuid;foreignKey:ProductID" json:"productid"`
	Quantity     int       `gorm:"type:int;not null" json:"quantity"`
	Status       string    `gorm:"type:varchar(50);default:'pending'" json:"status"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"createdat"`
}

func (Requests) TableName() string {
	return "Requests"
}

// Shipments struct
type Shipments struct {
	ShipmentID   string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"shipmentid"`
	RequestID    string    `gorm:"type:uuid;foreignKey:RequestID" json:"requestid"`
	FromBranchID string    `gorm:"type:uuid;foreignKey:BranchID" json:"frombranchid"`
	ToBranchID   string    `gorm:"type:uuid;foreignKey:BranchID" json:"tobranchid"`
	ProductID    string    `gorm:"type:uuid;foreignKey:ProductID" json:"productid"`
	Quantity     int       `gorm:"type:int;not null" json:"quantity"`    // จำนวนที่ส่งมาทั้งหมด
	UnitsPerBox  int       `gorm:"type:int;not null" json:"unitsperbox"` // จำนวนสินค้าต่อกล่อง
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"createdat"`
}

func (Shipments) TableName() string {
	return "Shipments"
}

// Category struct
type Category struct {
	CategoryID   string    `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"categoryid"`
	CategoryName string    `gorm:"type:varchar(100);not null" json:"categoryname"`
	CreatedAt    time.Time `gorm:"type:timestamp;default:CURRENT_TIMESTAMP" json:"createdat"`
}

func (Category) TableName() string {
	return "Category"
}
