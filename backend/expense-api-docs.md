# Expense Tracker API Documentation

## Overview
Complete REST API for managing farm expenses with aggregation, cost analysis, and ROI calculations.

## Base URL
```
http://localhost:5000/api/expenses
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Endpoints

### 1. Create Expense
**POST** `/api/expenses`

**Request Body:**
```json
{
  "category": "seeds",
  "amount": 2500,
  "crop": "rice",
  "date": "2024-01-15",
  "season": "Kharif",
  "notes": "Basmati seeds from local supplier",
  "quantity": 50,
  "unit": "kg",
  "supplier": "Local Market"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "crop": "rice",
    "category": "seeds",
    "amount": 2500,
    "currency": "INR",
    "date": "2024-01-15T00:00:00Z",
    "season": "Kharif",
    "notes": "Basmati seeds from local supplier",
    "quantity": 50,
    "unit": "kg",
    "supplier": "Local Market",
    "receiptUrl": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 2. Get Single Expense
**GET** `/api/expenses/:id`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "userId": "507f1f77bcf86cd799439012",
    "crop": "rice",
    "category": "seeds",
    "amount": 2500,
    "currency": "INR",
    "date": "2024-01-15T00:00:00Z",
    "season": "Kharif",
    "notes": "Basmati seeds from local supplier",
    "receiptUrl": null,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

---

### 3. Update Expense
**PUT** `/api/expenses/:id`

**Request Body:** (same as create)

**Response (200):** Updated expense object

---

### 4. Delete Expense
**DELETE** `/api/expenses/:id`

**Response (200):**
```json
{
  "success": true,
  "message": "Expense deleted successfully"
}
```

---

### 5. List Expenses
**GET** `/api/expenses?page=1&limit=10&dateFrom=2024-01-01&dateTo=2024-12-31&category=seeds&crop=rice&sort=-date`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 10)
- `dateFrom` (YYYY-MM-DD)
- `dateTo` (YYYY-MM-DD)
- `category` (seeds|fertilizer|pesticides|labour|irrigation|transport|machinery|misc)
- `crop` (string)
- `sort` (field with -/+ prefix, default: -date)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "507f1f77bcf86cd799439011",
      "crop": "rice",
      "category": "seeds",
      "amount": 2500,
      "date": "2024-01-15T00:00:00Z",
      "notes": "Basmati seeds from local supplier"
    }
  ],
  "meta": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "pages": 5
  }
}
```

---

### 6. Category Summary
**GET** `/api/expenses/summary/category?from=2024-01-01&to=2024-12-31`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "category": "fertilizer",
      "total": 25000,
      "count": 15,
      "avgAmount": 1666.67
    },
    {
      "category": "seeds",
      "total": 12500,
      "count": 5,
      "avgAmount": 2500
    }
  ]
}
```

---

### 7. Crop Summary
**GET** `/api/expenses/summary/crop?from=2024-01-01&to=2024-12-31`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "crop": "rice",
      "total": 45000,
      "count": 12,
      "avgAmount": 3750
    },
    {
      "crop": "wheat",
      "total": 35000,
      "count": 10,
      "avgAmount": 3500
    }
  ]
}
```

---

### 8. Seasonal Summary
**GET** `/api/expenses/summary/season?season=Kharif`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "category": "fertilizer",
      "total": 15000,
      "count": 8
    },
    {
      "category": "labour",
      "total": 12000,
      "count": 4
    }
  ]
}
```

---

### 9. Time Series Summary
**GET** `/api/expenses/summary/timeseries?from=2024-01-01&to=2024-12-31`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "month": "2024-01",
      "total": 8500,
      "count": 5
    },
    {
      "month": "2024-02",
      "total": 12300,
      "count": 8
    }
  ]
}
```

---

### 10. Upload Receipt
**POST** `/api/expenses/:id/receipt`

**Content-Type:** `multipart/form-data`

**Form Data:**
- `receipt` (file, max 5MB, JPEG/PNG/PDF only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "receiptUrl": "/uploads/receipts/1705315200000-507f1f77bcf86cd799439012-receipt.pdf"
  },
  "message": "Receipt uploaded successfully"
}
```

---

### 11. Calculate Cost Per Acre
**POST** `/api/expenses/calculate/costPerAcre`

**Request Body:**
```json
{
  "totalExpense": 50000,
  "areaHa": 2.5
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "costPerHa": 20000,
    "costPerAcre": 8093.71
  }
}
```

**Formula:**
- 1 hectare = 2.47105 acres
- costPerHa = totalExpense / areaHa
- costPerAcre = costPerHa / 2.47105

---

### 12. Calculate ROI
**POST** `/api/expenses/calculate/roi`

**Request Body:**
```json
{
  "totalExpense": 50000,
  "yieldQty": 500,
  "pricePerUnit": 200
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 100000,
    "profit": 50000,
    "roiPercentage": 100,
    "breakEven": true
  }
}
```

**Formula:**
- totalRevenue = yieldQty × pricePerUnit
- profit = totalRevenue - totalExpense
- roiPercentage = (profit / totalExpense) × 100

---

### 13. Get Crop Expenses with Analysis
**GET** `/api/expenses/crop/rice?areaHa=2.5`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "crop": "rice",
    "total": 45000,
    "count": 12,
    "byCategory": {
      "seeds": 2500,
      "fertilizer": 25000,
      "pesticides": 8000,
      "labour": 9500
    },
    "costMetrics": {
      "costPerHa": 18000,
      "costPerAcre": 7283.99
    },
    "expenses": [...]
  }
}
```

---

### 14. Get Budget Status
**GET** `/api/expenses/budget/status?limit=100000`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "currentMonth": "2024-01",
    "spent": 45000,
    "budgetLimit": 100000,
    "remaining": 55000,
    "percentageUsed": 45,
    "isExceeded": false
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation failed: Amount must be greater than 0"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized: Token missing or invalid"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Expense not found or unauthorized"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

---

## Sample cURL Commands

### Create Expense
```bash
curl -X POST http://localhost:5000/api/expenses \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "category": "seeds",
    "amount": 2500,
    "crop": "rice",
    "date": "2024-01-15",
    "notes": "Basmati seeds from local supplier"
  }'
```

### List Expenses with Filters
```bash
curl -X GET "http://localhost:5000/api/expenses?page=1&limit=10&dateFrom=2024-01-01&dateTo=2024-12-31&category=seeds" \
  -H "Authorization: Bearer your_jwt_token"
```

### Get Category Summary
```bash
curl -X GET "http://localhost:5000/api/expenses/summary/category?from=2024-01-01&to=2024-12-31" \
  -H "Authorization: Bearer your_jwt_token"
```

### Calculate ROI
```bash
curl -X POST http://localhost:5000/api/expenses/calculate/roi \
  -H "Authorization: Bearer your_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "totalExpense": 50000,
    "yieldQty": 500,
    "pricePerUnit": 200
  }'
```

### Upload Receipt
```bash
curl -X POST http://localhost:5000/api/expenses/507f1f77bcf86cd799439011/receipt \
  -H "Authorization: Bearer your_jwt_token" \
  -F "receipt=@receipt.pdf"
```

---

## Notes
- All monetary values are in INR (currency: INR, USD, EUR supported)
- Dates should be in YYYY-MM-DD format
- Season is auto-detected from date but can be overridden
- Pagination defaults: page=1, limit=10
- Max 100 results per page
- Timestamps use UTC timezone

