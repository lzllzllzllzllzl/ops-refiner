# PDF Form Filling Guide (Text Mode)

This guide covers how to fill PDF forms using text-based methods. This approach is optimized for compatibility with all LLM models.

## Step 1: Check for Fillable Fields

First, check if the PDF has fillable form fields:

```bash
python scripts/check_fillable_fields.py <file.pdf>
```

Based on the result, follow either:
- **Fillable fields**: Go to "Filling Fillable Forms" section
- **Non-fillable fields**: Go to "Handling Non-Fillable Forms" section

---

## Filling Fillable Forms

If the PDF has fillable form fields, follow these steps:

### 1. Extract Field Information

Run this script to get a list of all form fields:

```bash
python scripts/extract_form_field_info.py <input.pdf> <field_info.json>
```

This creates a JSON file with field details:

```json
[
  {
    "field_id": "name",
    "page": 1,
    "type": "text",
    "rect": [100, 200, 300, 220]
  },
  {
    "field_id": "agree_checkbox",
    "page": 1,
    "type": "checkbox",
    "checked_value": "/Yes",
    "unchecked_value": "/Off"
  },
  {
    "field_id": "gender",
    "page": 1,
    "type": "radio_group",
    "radio_options": [
      {"value": "/Male", "rect": [100, 300, 115, 315]},
      {"value": "/Female", "rect": [150, 300, 165, 315]}
    ]
  },
  {
    "field_id": "country",
    "page": 2,
    "type": "choice",
    "choice_options": [
      {"value": "US", "text": "United States"},
      {"value": "CN", "text": "China"},
      {"value": "UK", "text": "United Kingdom"}
    ]
  }
]
```

### 2. Understand Field Types

| Type | Description | Value Format |
|------|-------------|--------------|
| `text` | Text input field | Any string |
| `checkbox` | Checkbox | Use `checked_value` or `unchecked_value` |
| `radio_group` | Radio button group | Use one of the `value` from `radio_options` |
| `choice` | Dropdown/selection list | Use one of the `value` from `choice_options` |

### 3. Analyze Form Context

To understand what each field is for, extract the PDF text:

```bash
python scripts/extract_text.py <input.pdf>
```

Match field IDs with nearby text labels in the extracted content to determine the purpose of each field.

### 4. Create Field Values JSON

Create a `field_values.json` file with the values to fill:

```json
[
  {
    "field_id": "last_name",
    "description": "The user's last name",
    "page": 1,
    "value": "Simpson"
  },
  {
    "field_id": "agree_checkbox",
    "description": "Agreement checkbox",
    "page": 1,
    "value": "/Yes"
  },
  {
    "field_id": "gender",
    "description": "Gender selection",
    "page": 1,
    "value": "/Male"
  },
  {
    "field_id": "country",
    "description": "Country selection",
    "page": 2,
    "value": "US"
  }
]
```

**Important Notes:**
- `field_id` must exactly match the ID from `extract_form_field_info.py`
- `page` must match the page number from field info
- For checkboxes, use the exact `checked_value` or `unchecked_value`
- For radio groups, use one of the `value` strings from `radio_options`
- For choice fields, use one of the `value` strings from `choice_options`

### 5. Fill the Form

Run the fill script:

```bash
python scripts/fill_fillable_fields.py <input.pdf> <field_values.json> <output.pdf>
```

The script validates field IDs and values before filling. If there are errors, it will print them and you should correct the `field_values.json` file.

---

## Handling Non-Fillable Forms

If the PDF doesn't have fillable form fields (common in scanned documents or simple PDFs), you have two options:

### Option A: Text Annotation Approach

For simple forms where you know the approximate positions:

1. Extract text to understand the form structure:
   ```bash
   python scripts/extract_text.py <input.pdf>
   ```

2. Create a `fields.json` with field positions (coordinates in PDF points, origin at bottom-left):
   ```json
   {
     "pages": [
       {"page_number": 1, "width": 612, "height": 792}
     ],
     "form_fields": [
       {
         "page_number": 1,
         "description": "Name field",
         "entry_bounding_box": [100, 700, 300, 720],
         "entry_text": {
           "text": "John Doe",
           "font_size": 12
         }
       }
     ]
   }
   ```

3. Fill using annotations:
   ```bash
   python scripts/fill_pdf_form_with_annotations.py <input.pdf> <fields.json> <output.pdf>
   ```

### Option B: Manual Editing

For complex non-fillable forms, consider:

1. Using a PDF editor (Adobe Acrobat, Preview on Mac, etc.)
2. Converting to an editable format first
3. Using OCR + form recognition tools

**Note:** This text-mode skill is optimized for fillable PDF forms. For complex non-fillable forms that require precise visual positioning, consider using dedicated PDF editing software.

---

## Field Type Reference

### Text Fields
```json
{
  "field_id": "name",
  "page": 1,
  "value": "Any text value"
}
```

### Checkboxes
```json
{
  "field_id": "agree",
  "page": 1,
  "value": "/Yes"  // Use the exact checked_value from field info
}
```

To uncheck:
```json
{
  "field_id": "agree",
  "page": 1,
  "value": "/Off"  // Use the exact unchecked_value from field info
}
```

### Radio Groups
```json
{
  "field_id": "gender",
  "page": 1,
  "value": "/Male"  // Must be one of the values from radio_options
}
```

### Choice/Dropdown Fields
```json
{
  "field_id": "country",
  "page": 2,
  "value": "US"  // Must be one of the values from choice_options
}
```

---

## Troubleshooting

### Common Errors

1. **"field_id is not a valid field ID"**
   - Check that the field_id exactly matches what's in field_info.json
   - Field IDs are case-sensitive

2. **"Incorrect page number"**
   - Ensure the page number matches the field's actual location

3. **"Invalid value for checkbox/radio/choice"**
   - Use the exact value strings from the field info
   - For checkboxes: use `checked_value` or `unchecked_value`
   - For radio: use one of the `value` strings from `radio_options`
   - For choice: use one of the `value` strings from `choice_options`

### Verifying Results

After filling, you can:
1. Open the output PDF in a PDF viewer
2. Extract text from the filled PDF to verify values were applied
