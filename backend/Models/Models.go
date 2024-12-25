package Models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

//Employee struct

type Employees struct {
	EmployeeID string     `gorm:"type:uuid;primaryKey" json:"employeeid"`
	Username   string     `json:"username"`
	Password   string     `json:"password"`
	Name       string     `json:"name"`
	Role       string     `json:"role"`
	BrancheID  []Branches `gorm:"type:uuid;foreignKey:BrancheID" json:"brancheid"`
	Salary     float64    `json:"salary"`
	CreatedAt  time.Time  `json:"createdat"`
}

func (Employees) TableName() string {
	return "Employees"
}

func (s *Employees) BeforeCreate(tx *gorm.DB) (err error) {
	s.EmployeeID = uuid.New().String()
	return
}

//Branches struct

type Branches struct {
	BrancheID string    `gorm:"type:uuid;primaryKey" json:"brancheid"`
	BName     string    `json:"bname"`
	Location  string    `json:"location"`
	CreatedAt time.Time `json:"createdat"`
}

func (Branches) TableName() string {
	return "Branches"
}

func (s *Branches) BeforeCreate(tx *gorm.DB) (err error) {
	s.BrancheID = uuid.New().String()
	return
}

//Product struct

type Product struct {
	ProductID   string    `gorm:"type:uuid;primaryKey" json:"productid"`
	ProductName string    `json:"productname"`
	Description string    `json:"description"`
	CreatedAt   time.Time `json:"createdat"`
}

func (Product) TableName() string {
	return "Product"
}

func (s *Product) BeforeCreate(tx *gorm.DB) (err error) {
	s.ProductID = uuid.New().String()
	return
}

//ProductUnit struct

type ProductUnit struct {
	ProductUnitID string    `gorm:"type:uuid;primaryKey" json:"productunitid"`
	ProductID     []Product `gorm:"foreignKey:ProductID" json:"productid"`
	Type          string    `json:"type"`
	ConversRate   int       `json:"conversrate"`
}

func (ProductUnit) TableName() string {
	return "ProductUnit"
}

func (s *ProductUnit) BeforeCreate(tx *gorm.DB) (err error) {
	s.ProductUnitID = uuid.New().String()
	return
}

//Inventory struct

type Inventory struct {
	InventoryID   string        `gorm:"type:uuid;primaryKey" json:"inventoryid"`
	ProductUnitID []ProductUnit `gorm:"foreignKey:ProductUnitID" json:"productunitid"`
	BrancheID     []Branches    `gorm:"type:uuid;foreignKey:BrancheID" json:"brancheid"`
	Quantity      int           `json:"quantity"`
	Price         float64       `json:"price"`
	UpdateAt      time.Time     `json:"updateat"`
}

func (Inventory) TableName() string {
	return "Inventory"
}

func (s *Inventory) BeforeCreate(tx *gorm.DB) (err error) {
	s.InventoryID = uuid.New().String()
	return
}

//Receipt struct

type Receipt struct {
	ReceiptID     string      `gorm:"type:uuid;primaryKey" json:"receiptid"`
	ReceiptNumber string      `json:"receiptname"`
	EmployeeID    []Employees `gorm:"foreignKey:EmployeeID" json:"employeeid"`
	BrancheID     []Branches  `gorm:"type:uuid;foreignKey:BrancheID" json:"brancheid"`
	ReceiptDate   time.Time   `json:"receiptdate"`
	TotalAmount   float64     `json:"totalamount"`
	Status        string      `json:"status"`
	CreatedAt     time.Time   `json:"createdat"`
	Update        time.Time   `json:"updateat"`
}

func (Receipt) TableName() string {
	return "Receipt"
}

func (s *Receipt) BeforeCreate(tx *gorm.DB) (err error) {
	s.ReceiptID = uuid.New().String()
	return
}

//Receipt Item struct

type ReceiptItem struct {
	ReceiptItemID string        `gorm:"type:uuid;primaryKey" json:"receiptitemid"`
	ReceiptID     []Receipt     `gorm:"type:uuid;foreignKey:ReceiptID" json:"receiptid"`
	ProductUnitID []ProductUnit `gorm:"type:uuid;foreignKey:ProductUnitID" json:"productunitid"`
	Quantity      int           `json:"quantity"`
	UnitPrice     float64       `json:"unitprice"`
	CreatedAt     time.Time     `json:"createdat"`
	UpdateAt      time.Time     `json:"updateat"`
}

func (ReceiptItem) TableName() string {
	return "ReceiptItem"
}

func (s *ReceiptItem) BeforeCreate(tx *gorm.DB) (err error) {
	s.ReceiptItemID = uuid.New().String()
	return
}

//Transfer Product struct

type TransferProduct struct {
	TransferProductID string     `gorm:"type:uuid;primaryKey" json:"transferproductid"`
	TransferNumber    string     `json:"transfernumber"`
	FromBranchID      []Branches `gorm:"type:uuid;foreignKey:BrancheID" json:"frombranchid"`
	ToBranchID        []Branches `gorm:"type:uuid;foreignKey:BrancheID" json:"tobranchid"`
	RequestDate       time.Time  `json:"requestdate"`
	Status            string     `json:"status"`
	CreatedAt         time.Time  `json:"createdat"`
	UpdateAt          time.Time  `json:"updateat"`
}

func (TransferProduct) TableName() string {
	return "TransferProduct"
}

func (s *TransferProduct) BeforeCreate(tx *gorm.DB) (err error) {
	s.TransferProductID = uuid.New().String()
	return
}

//Transfer Product List struct

type TransferProductList struct {
	TransferListID string            `gorm:"type:uuid;primaryKey" json:"transferlistid"`
	TransferID     []TransferProduct `gorm:"type:uuid;foreignKey:TransferID" json:"transferid"`
	ProductUnitID  []ProductUnit     `gorm:"type:uuid;foreignKey:ProductUnitID" json:"productunitid"`
	Quantity       int               `json:"quantity"`
	CreatedAt      time.Time         `json:"createdat"`
	UpdateAt       time.Time         `json:"updateat"`
}

func (TransferProductList) TableName() string {
	return "TransferProductList"
}

func (s *TransferProductList) BeforeCreate(tx *gorm.DB) (err error) {
	s.TransferListID = uuid.New().String()
	return
}
