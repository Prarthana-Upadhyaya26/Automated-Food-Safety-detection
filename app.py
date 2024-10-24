import cv2
import pytesseract
import json
import re
import streamlit as st

# Set the path to your Tesseract executable (Ensure this path is correct)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# Define banned ingredients and thresholds
banned_ingredients = ["Aspartame", "Red Dye"]  # Replace with actual banned ingredients
thresholds = {
    "Polydextrose": 150,
    "Caffeine": 30,
    "SodiumBenzoate": 100  # Added threshold for Sodium Benzoate
}

# Function to preprocess the frame
def preprocess_image(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    return thresh

# Function to extract text from a webcam frame
def extract_text_from_frame(frame):
    preprocessed_img = preprocess_image(frame)
    try:
        text = pytesseract.image_to_string(preprocessed_img)
        if text.strip() == "":
            st.warning("No text detected in the frame.")
            return ""
        return text
    except Exception as e:
        st.error(f"Error during text extraction: {e}")
        return None

# Function to extract ingredients from the text
def extract_ingredients(text):
    # Updated regex patterns
    pattern_with_value = r"([A-Za-z\s]+)\s*\(\s*([\d]+(?:\.\d+)?\s?[A-Za-z%]+)\s*\)"
    pattern_without_value = r"([A-Za-z\s]+)(?=\s*,|$)"

    ingredients_dict = {}

    # Extract ingredients with values
    ingredient_list_with_value = re.findall(pattern_with_value, text)
    for ingredient, amount in ingredient_list_with_value:
        ingredients_dict[ingredient.strip()] = amount.strip()

    # Extract ingredients without values
    ingredient_list_without_value = re.findall(pattern_without_value, text)
    for ingredient in ingredient_list_without_value:
        ingredient = ingredient.strip()
        if ingredient and ingredient not in ingredients_dict:
            ingredients_dict[ingredient] = ""  # Assign empty string if no value specified

    return ingredients_dict

# Function to check ingredients for banned items and threshold limits
def check_ingredients(ingredients):
    alerts = []
    for ingredient, amount in ingredients.items():
        # Check for banned ingredients
        if ingredient in banned_ingredients:
            alerts.append(f"{ingredient}: Banned")
            st.warning(f"{ingredient} is banned")

        # Check for thresholds
        if ingredient in thresholds:
            try:
                # Extract numeric value from the amount string
                numeric_amount = float(re.findall(r'[\d\.]+', amount)[0]) if amount else 0
                if numeric_amount > thresholds[ingredient]:
                    alerts.append(f"{ingredient}: Exceeded (Amount: {numeric_amount})")
                    st.error(f"{ingredient} exceeded the threshold of {thresholds[ingredient]} (Amount: {numeric_amount})")
            except (ValueError, IndexError):
                st.error(f"Error processing amount for {ingredient}: {amount}")

    return alerts

# Function to save the detected ingredients to a JSON file
def save_ingredients_to_json(ingredients, status, output_file="ingredients.json"):
    if ingredients:
        data = {
            "Ingredients": ingredients,
            "Status": status
        }
        try:
            with open(output_file, "w", encoding="utf-8") as json_file:
                json.dump(data, json_file, ensure_ascii=False, indent=4)
                st.success(f"Ingredients saved to {output_file}")
        except Exception as e:
            st.error(f"Error saving ingredients to JSON: {e}")
    else:
        st.warning("No ingredients found to save.")

# Streamlit app main function
def main():
    st.title("Real-time Label Detection and Ingredient Checking")

    # Open webcam video stream
    cap = cv2.VideoCapture(0)  # Use 0 for the default webcam

    if not cap.isOpened():
        st.error("Error: Could not open webcam.")
        return

    frame_placeholder = st.empty()

    while True:
        ret, frame = cap.read()
        if not ret:
            st.error("Error: Failed to capture frame.")
            break

        # Display the frame
        frame_placeholder.image(frame, channels="BGR", use_column_width=True)

        # Extract text from the frame
        text_data = extract_text_from_frame(frame)

        if text_data:
            st.write("*Extracted Text:*", text_data)

            # Extract ingredients
            ingredients = extract_ingredients(text_data)

            if ingredients:
                st.write("*Extracted Ingredients:*")
                for ing, amt in ingredients.items():
                    st.write(f"- {ing}: {amt or 'No amount specified'}")

                # Check ingredients against banned list and thresholds
                alerts = check_ingredients(ingredients)
                if alerts:
                    st.error("*Alerts Detected:*")
                    for alert in alerts:
                        st.write(f"- {alert}")
                    status = False
                else:
                    st.success("No alerts found.")
                    status = True

                # Save the ingredients and status to a JSON file
                save_ingredients_to_json(ingredients, status)
            else:
                st.warning("No ingredients found in the text.")

        # Stop the process if the user clicks "Stop"
        if st.button("Stop"):
            break

    # Release the webcam and close windows
    cap.release()

if __name__ == "__main__":
    main()
