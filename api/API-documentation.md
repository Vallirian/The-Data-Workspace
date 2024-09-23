# API Documentation
## **Base URL:** `/api/v1`


## **Authentication (Firebase)**

### **Login (via Firebase)**

- **Endpoint:** `--`
- **Method:** `POST`
- **Description:** Authenticates a user with Firebase and returns an ID token that can be used for authorized requests.

#### Request:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "returnSecureToken": true
}
```

#### Response:

```json
{
    "idToken": "your-firebase-id-token",
    "refreshToken": "your-firebase-refresh-token",
    "expiresIn": "3600",
    "localId": "user-uid"
}

```

### **Register (via Firebase)**

- **Endpoint:** `—`
- **Method:** `POST`
- **Description:** Registers a new user with Firebase.

#### Request:

```json
{
    "email": "newuser@example.com",
    "password": "newpassword123",
    "returnSecureToken": true
}
```

#### Response:

```json
{
    "idToken": "your-firebase-id-token",
    "refreshToken": "your-firebase-refresh-token",
    "expiresIn": "3600",
    "localId": "new-user-uid"
}

```

---

### **Change Password (via Firebase)**

- **Endpoint:** `--`
- **Method:** `POST`
- **Description:** Allows a logged-in user to change their password.

#### Request:

```json
{
    "idToken": "your-firebase-id-token",
    "password": "newpassword123",
    "returnSecureToken": true
}
```

#### Response:

```json
{
    "idToken": "your-new-firebase-id-token",
    "expiresIn": "3600",
    "localId": "user-uid"
}
```

---

## **Home Page**

### **Create New Workbook**

- **Endpoint:** `/workbooks`
- **Method:** `POST`
- **Description:** Creates a new workbook for the user.

#### Request:

```json

{
    "name": "My Workbook"
}
```

#### Response:

```json
{
    "id": "123",
    "name": "My Workbook",
    "created_at": "2024-09-21T12:00:00Z"
}
```

### **List Workbooks**

- **Endpoint:** `/workbooks`
- **Method:** `GET`
- **Description:** Retrieves a list of all workbooks created by the user.

#### Response:

```json
[
    {
        "id": "123",
        "name": "My Workbook",
        "created_at": "2024-09-21T12:00:00Z"
    },
    {
        "id": "124",
        "name": "Another Workbook",
        "created_at": "2024-09-22T08:00:00Z"
    }
]
```

### **Rename Workbook**

- **Endpoint:** `/workbooks/{id}`
- **Method:** `PUT`
- **Description:** Renames an existing workbook by updating its `name`.

#### **Request:**

```json
{
    "name": "New Workbook Name"
}

```

#### **Response:**

```json
{
    "id": "124",
    "name": "New Workbook Name",
    "created_at": "2024-09-22T08:00:00Z"
}

```

### **Delete Workbook**

- **Endpoint:** `/workbooks/{id}`
- **Method:** `DELETE`
- **Description:** Deletes the specified workbook.

#### **Request:**

No body is required for this request; only the workbook ID is needed as a path parameter.

#### **Response:**

```json
{
    "message": "Workbook deleted successfully",
}

```

---

## **Workbook Page**

### **Upload Data**

- **Endpoint:** `/workbooks/{id}/upload`
- **Method:** `POST`
- **Description:** Uploads a data file (e.g., CSV) to a workbook.

#### Request (Multipart Form Data):

```bash
POST /workbooks/123/upload
```

Form Data:

- `file`: (file upload, e.g., `.csv`)

#### Response:

```json
{
    "message": "File uploaded successfully"
}
```

### **Add or Update Table Description**

- **Endpoint:** `/workbooks/{id}/table/description`
- **Method:** `PUT`
- **Description:** Adds or updates a description for a table (data set) within a workbook.

#### **Request:**

```json
{
    "description": "This table contains sales data for the fiscal year 2023."
}

```

#### **Response:**

```json
{
    "workbook_id": "12345",
    "table_id": "table_001",
    "description": "This table contains sales data for the fiscal year 2023.",
    "updated_at": "2024-09-21T12:30:00Z"
}

```

---

### **Add or Update Column Description**

- **Endpoint:** `/workbooks/{id}/table/{table_id}/columns/{column_id}/description`
- **Method:** `PUT`
- **Description:** Adds or updates a description for a specific column in a table.

#### **Request:**

```json
{
    "description": "This column represents the total sales for each product."
}

```

#### **Response:**

```json
{
    "workbook_id": "12345",
    "table_id": "table_001",
    "column_id": "column_002",
    "description": "This column represents the total sales for each product.",
    "updated_at": "2024-09-21T12:35:00Z"
}

```

---

### **View Data in Table**

- **Endpoint:** `/workbooks/{id}/data`
- **Method:** `GET`
- **Description:** Retrieves the data from a workbook in tabular format.

#### Response:

```json
{
    "data": [
        { "column1": "value1", "column2": "value2" },
        { "column1": "value3", "column2": "value4" }
    ]
}
```

### **Update Report (Overwrite)**

- **Endpoint:** `/workbooks/{workbook_id}/reports/{report_id}`
- **Method:** `PUT`
- **Description:** This endpoint allows the frontend to send a full report object, which will overwrite the existing report. This includes updating sections, columns, and their values in one request.

---

#### **Request:**

The frontend will send the complete report structure, including sections, columns, and values. For any field that has been changed, the backend will update the report accordingly. If new sections or columns are added, they will be created, and if some sections or columns are missing, they will be delete.

```json
{
    "title": "Updated Monthly Sales Report",
    "description": "A report detailing the updated sales performance for the month.",
    "workbook_id": "w_123",
    "sections": [
        {
            "section_id": "section123",
            "section_name": "Sales Overview",
            "columns": [
                {
                    "column_id": "col123",
                    "column_name": "Product Name",
                    "formula_id": "f_123",
                    "value": "Product A"
                },
                {
                    "column_id": "col124",
                    "column_name": "Total Sales",
                    "formula_id": "f_456",
                    "value": "6000"
                },
                {
                    "column_id": "col125",
                    "column_name": "Region",
                    "formula_id": "f_789",
                    "value": "Europe"
                }
            ]
        },
        {
            "section_id": "section124",
            "section_name": "Profit Overview",
            "columns": [
                {
                    "column_id": "col126",
                    "column_name": "Product Name",
                    "formula_id": "f_101",
                    "value": "Product B"
                },
                {
                    "column_id": "col127",
                    "column_name": "Total Profit",
                    "formula_id": "f_102",
                    "value": "2000"
                }
            ]
        }
    ]
}

```

---

#### **Response:**
```json
{
    "title": "Updated Monthly Sales Report",
    "description": "A report detailing the updated sales performance for the month.",
    "workbook_id": "w_123",
    "sections": [
        {
            "section_id": "section123",
            "section_name": "Sales Overview",
            "columns": [
                {
                    "column_id": "col123",
                    "column_name": "Product Name",
                    "formula_id": "f_123",
                    "value": "Product A"
                },
                {
                    "column_id": "col124",
                    "column_name": "Total Sales",
                    "formula_id": "f_456",
                    "value": "6000"
                },
                {
                    "column_id": "col125",
                    "column_name": "Region",
                    "formula_id": "f_789",
                    "value": "Europe"
                }
            ]
        },
        {
            "section_id": "section124",
            "section_name": "Profit Overview",
            "columns": [
                {
                    "column_id": "col126",
                    "column_name": "Product Name",
                    "formula_id": "f_101",
                    "value": "Product B"
                },
                {
                    "column_id": "col127",
                    "column_name": "Total Profit",
                    "formula_id": "f_102",
                    "value": "2000"
                }
            ]
        }
    ]
}
```

---
### **Create or Continue Chat**

- **Endpoint:** `/workbooks/{id}/chat`
- **Method:** `POST`
- **Description:** Allows users to initiate a new chat session with the first message or continue an existing chat if `chat_id` is provided. The backend automatically creates a new chat if no `chat_id` is provided.

#### Request:

```json
{
    "chat_id": null,  // Optional. If provided, continues the chat; if null, starts a new chat.
    "message_content": "What is the profit from last month?",
    "message_type": "PQL" // can be PQL, STANDARD
}

```

#### Response

```json
{   
    "chat_id": "c_123",
    "message_id": "m_124",
    "user_role": "model",
    "message_content":5662.32,
    "message_type": "PQL",
    "created_at": "2024-09-21T12:01:00Z"
}

```

---

### **Get Chat Messages**

- **Endpoint:** `/workbooks/{id}/chat/{chat_id}/messages`
- **Method:** `GET`
- **Description:** Retrieves all the messages in a specific chat session, allowing the user to continue from where they left off.

#### Request Parameters:

- **chat_id**: The ID of the chat whose messages need to be retrieved.

#### Response:

```json
{
    "chat_id": "c_123",
    "messages": [
        {
            "message_id": "m_123",
            "user_role": "user",
            "message_content": "What is the profit from last month?",
            "message_type": "PQL",
            "created_at": "2024-09-21T12:00:00Z"
        },
        {
            "message_id": "m_124",
            "user_role": "model",
            "message_content": 5662.32,
            "message_type": "PQL",
            "created_at": "2024-09-21T12:01:00Z"
        }
    ]
}

```

---

### **Send Message in Existing Chat**

- **Endpoint:** `/workbooks/{id}/chat/{chat_id}/message`
- **Method:** `POST`
- **Description:** Allows users to send a new message in an existing chat session.

#### Request:

```json
{
    "chat_id": "c_123",
    "message_content": "Can you break down the profit by region?",
    "message_type": "STANDARD"  // can be PQL, STANDARD
}

```

#### Response:

```json
{
    "message_id": "m_457",  // Backend generates new message ID
    "user_role": "model",
    "message_content":"The profit for North America is 300, and for Europe is 262.21.",
    "message_type": "STANDARD",
    "created_at": "2024-09-21T12:05:00Z"
}

```

---

### **Chat Flow Overview:**

1. **Create or Continue a Chat**:
    - When a user sends the first message in a new chat session, the backend creates a new chat.
    - For existing chats, sending a message (with the `chat_id` provided) continues the conversation.
2. **Retrieve Chat Messages**:
    - The frontend fetches all previous messages in the chat when the user selects an existing chat session. This enables the frontend to display the chat history and continue the conversation seamlessly.
3. **Send a New Message**:
    - New messages in an existing chat can be sent using the `/message` endpoint. This allows the user to continue the chat naturally.
---

### **Saved Formulas**

- **Endpoint:** `/workbooks/{id}/formulas`
- **Method:** `POST`
- **Description:** Save a new formula to the workbook.

#### Request:

```json
{
    "chat_id": "c_123",
    "message_id": "m_456"
}

```

#### Response:

```json
{
    "id": "f_123",
    "name": "Total Sales",
    "description": "--description--",
    "translated_sql": "---sql query---"
}

```

### **Get Saved Formulas**

- **Endpoint:** `/workbooks/{id}/formulas`
- **Method:** `GET`
- **Description:** Retrieves all saved formulas in a workbook.

#### Response:

```json
[
    {
        "id": "f_123",
        "name": "Total Sales",
        "description": "--description--",
        "translated_sql": "---sql query---"
    },
    {
        "id": "f_456",
        "name": "Total Profit",
        "description": "--description--",
        "translated_sql": "---sql query---"
    }
]

```

### **Get One Formula**

- **Endpoint:** `/workbooks/{id}/formulas/{formula_id}`
- **Method:** `GET`
- **Description:** Retrieves a specific formula by its ID from a workbook.

#### Response:

```json
{
    "id": "f_123",
    "name": "Total Sales",
    "description": "--description--",
    "translated_sql": "---sql query---"
}
```

### **Delete Saved Formula**

- **Endpoint:** `/workbooks/{id}/formulas/{formula_id}`
- **Method:** `DELETE`
- **Description:** Deletes a specific formula by its ID from a workbook.

#### Response:

```json
{
    "message": "Formula deleted successfully"
}
```

---

## **Account Page**

### **View Account Info**

- **Endpoint:** `/account`
- **Method:** `GET`
- **Description:** Retrieves the account information for the user.

#### Response:

```json
{
    "email": "user@example.com",
    "created_at": "2023-01-01T12:00:00Z"
}

```

### **View Utilization**

- **Endpoint:** `/account/utilization`
- **Method:** `GET`
- **Description:** Retrieves the utilization metrics (e.g., API calls, data usage) for the user.

#### Response:

```json
{
    "workbooks_created": 5,
    "formulas_saved": 10,
    "total_tokens_consumed": 76589,
    "total_tokens_remaining": 1000000,
}

```

---

### **Error Responses**

For all requests, if something goes wrong, the API will respond with an error message.

### Example Error Response:

```json
{
    "error": {
        "code": 400,
        "message": "Invalid request"
    }
}

```

### **Status Codes:**

- `200 OK`: The request was successful.
- `201 Created`: The resource was successfully created.
- `400 Bad Request`: There was an issue with the request.
- `401 Unauthorized`: Invalid credentials or session expired.
- `404 Not Found`: The requested resource does not exist.
- `500 Internal Server Error`: Something went wrong on the server.

---