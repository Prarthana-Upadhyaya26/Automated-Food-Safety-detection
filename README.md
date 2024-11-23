# IngreScan: AI-Powered Ingredient Detection and Supply Chain Management

IngreScan is an integrated solution that leverages AI and blockchain technology to automate ingredient detection and ensure compliance within the beverage supply chain. The project combines an AI-based ingredient detection system with a decentralized supply chain management system, providing transparency and traceability from raw material suppliers to retailers.

## Project Overview

IngreScan consists of two main components:

1. **AI-Powered Ingredient Detection**: This component utilizes Optical Character Recognition (OCR) and image processing to extract ingredient information from product labels, ensuring that they meet safety standards and regulations.

2. **Cold Drink Supply Chain Smart Contract**: This Ethereum-based smart contract tracks the flow of cold drinks through various stages of the supply chain, providing a secure and transparent way to manage suppliers, manufacturers, distributors, and retailers.

## Features

### Ingredient Detection
- **OCR and Image Processing**: Extracts ingredients from product labels using OpenCV and Tesseract OCR
- **Banned Substances Detection**: Flags ingredients on a predefined banned list and monitors them against safety thresholds
- **Real-Time Alerts**: Notifies users of any compliance violations with clear labeling as "Exceeded" or "Banned"
- **Data Storage**: Saves extracted ingredient lists and compliance status as JSON files for further analysis

### Supply Chain Management
- **Decentralized Tracking**: Uses blockchain technology to track cold drinks from raw material suppliers to retailers
- **Role Management**: Only the contract owner can authorize suppliers, manufacturers, distributors, and retailers
- **Stage Tracking**: Monitors each cold drink's progress through stages such as Raw Material Supply, Manufacture, Distribution, and Retail
- **Data Immutability**: Ensures all transactions and state changes are recorded on the blockchain

## Tech Stack

- **OpenCV**: For image processing and product label pre-processing
- **Tesseract**: OCR engine for text extraction
- **Solidity**: Smart contract development language for the supply chain component
- **Ethereum**: Blockchain platform for deploying the smart contract
- **Truffle**: Development framework for Ethereum, providing tools for smart contract compilation, deployment, and testing
- **Ganache**: Personal blockchain for testing and development of smart contracts in a local environment
- **Node.js**: JavaScript runtime used for managing backend processes and running blockchain interaction scripts
- **Python**: Main language for the backend and data processing
- **JSON**: For storing ingredient data and compliance results
- **Regex**: For parsing and extracting ingredient information

## Setup Instructions

### 1. Prerequisites

- Install Python 3.8 or higher: [Python Downloads](https://www.python.org/downloads/)
- Install Tesseract OCR:
  - **Windows**: Download and install [Tesseract for Windows](https://github.com/tesseract-ocr/tesseract)
  - **macOS/Linux**: Install via Homebrew or package manager

Configure Tesseract path:
```python
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Update with your path
```
- Install npm and parcel (globally)

### 2. Clone the Repository

```bash
git clone <your-repo-url>
cd <your-repo-name>
```

### 3. Install Required Python Packages

```bash
pip install -r requirements.txt
```

> **Note**: If there is no `requirements.txt` file yet, you can manually install required packages like OpenCV and pytesseract.

### 4. Deploy the Smart Contract

1. Install Ganache and create a workspace.
2. Install Truffle npm package globally by running ```npm install -g truffle```.
3. In the `truffle-config.js` file update the `from:` address to an address from your Ganache workspace.
4. Run ```truffle migrate --reset``` from the command line to deploy the smart contract to the blockchain.
5. Download Metamask Chrome extension for the browser to help interaction between the application and the blockchain.

### 5. To run Front-end server

1. Navigate to the 'client' director:
   ``` bash
   cd client
   ```
2. Start the Parcel development server
   ``` bash
   npm run start 
   ```


## Usage

### Supply Chain Management


Use the smart contract functions to add raw material suppliers, manufacturers, distributors, and retailers. Track the state of cold drinks as they move through the supply chain.\

### Ingredient Detection

1. Place your image file (e.g., `correct2.jpg`) in the same directory as the script
2. Run the main script:
```bash
python your_script_name.py
```
3. The extracted ingredients and their compliance status will be saved in `ingredients.json`


## Contributing

Contributions are welcome! Feel free to fork the repository, create a branch, and submit a pull request with your improvements or bug fixes.

## License

This project is licensed under the MIT License.
