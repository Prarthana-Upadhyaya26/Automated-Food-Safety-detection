import cv2
import pytesseract
import json
import os
import re

# Set the path to your Tesseract executable (Ensure this path is correct)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Update banned ingredients and thresholds
banned_ingredients = ["Aspartame", "Red Dye"]
thresholds = {
    "Caffeine": 150,
    "SodiumBenzoate": 100  # Added threshold for Sodium Benzoate
}

def preprocess_image(image_path):
    if not os.path.exists(image_path):
        print(f"Error: Image file not found at {image_path}")
        return None

    img = cv2.imread(image_path)
    if img is None:
        print("Error: Could not load image. Please check the image file format or path.")
        return None

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    print("Image preprocessing complete.")
    return thresh

def extract_text(image_path):
    preprocessed_img = preprocess_image(image_path)

    if preprocessed_img is None:
        print("Error: Preprocessing failed, skipping text extraction.")
        return None

    try:
        text = pytesseract.image_to_string(preprocessed_img)
        if text.strip() == "":
            print("Warning: No text detected in the image.")
            return ""
        print("Text extraction complete.")
        return text
    except Exception as e:
        print(f"Error during text extraction: {e}")
        return None

def extract_ingredients(text):
    pattern_with_value = r"([A-Za-z\s]+)\s*\(\s*([#\d]+(?:\.\d+)?\s?[A-Za-z%])\s\)"
    pattern_without_value = r"([A-Za-z\s]+)(?=\s*,|$)"

    ingredients_dict = {}

    ingredient_list_with_value = re.findall(pattern_with_value, text)
    for ingredient, amount in ingredient_list_with_value:
        ingredients_dict[ingredient.strip()] = amount.strip()

    ingredient_list_without_value = re.findall(pattern_without_value, text)
    for ingredient in ingredient_list_without_value:
        ingredient = ingredient.strip()
        if ingredient and ingredient not in ingredients_dict:
            ingredients_dict[ingredient] = ""

    return ingredients_dict

def save_ingredients_to_json(ingredients, status, output_file="ingredients.json"):
    if ingredients:
        data = {
            "Ingredients": ingredients,
            "Status": status
        }
        try:
            with open(output_file, "w", encoding="utf-8") as json_file:
                json.dump(data, json_file, ensure_ascii=False, indent=4)
                print(f"Ingredients saved to {output_file}")
        except Exception as e:
            print(f"Error saving ingredients to JSON: {e}")
    else:
        print("No ingredients found to save.")

def check_ingredients(ingredients):
    alerts = []
    for ingredient, amount in ingredients.items():
        # Print checking ingredient with or without amount based on its presence
        if amount:
            print(f"Checking ingredient: {ingredient}, Amount: {amount}")
        else:
            print(f"Checking ingredient: {ingredient}")

        if ingredient in banned_ingredients:
            alerts.append(f"{ingredient}: Banned")
            print(f"{ingredient} is banned")  # Debugging info

        if ingredient in thresholds:
            try:
                numeric_amount = int(re.findall(r'\d+', amount)[0]) if amount else 0
                if amount:  # Check only if there's an amount specified
                    print(f"Numeric amount for {ingredient}: {numeric_amount}")  # Debugging info

                if numeric_amount > thresholds[ingredient]:
                    alerts.append(f"{ingredient}: Exceeded (Amount: {numeric_amount})")
                    print(f"{ingredient} exceeded the threshold")  # Debugging info
            except (ValueError, IndexError) as e:
                print(f"Error processing amount for {ingredient}: {e}")

    return alerts

def main(image_path):
    text_data = extract_text(image_path)

    if text_data:
        print("\n--- Extracted Text ---\n", text_data)

        ingredients = extract_ingredients(text_data)

        if ingredients:
            print("\n--- Extracted Ingredients ---")
            for ing, amt in ingredients.items():
                print(f"{ing}: {amt or 'No amount specified'}")
            
            alerts = check_ingredients(ingredients)
            if alerts:
                print("\n--- Alerts ---")
                for alert in alerts:
                    print(f"- {alert}")
                status = False
            else:
                print("\nNo alerts found.")
                status = True
            print("\nOverall Status:", "Safe" if status else "Unsafe")
            save_ingredients_to_json(ingredients, status)
        else:
            print("No ingredients found in the text.")
    else:
        print("No text extracted from the image.")

# Run the main function with your image path
if __name__ == "__main__":  # Fixed the typo
    image_path = r"correct2.jpg"  # Make sure the image path is correct
    main(image_path)
