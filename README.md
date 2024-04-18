# sdk-generative-ai

## Project for Creating Knowledge Bases from Documents

This project allows you to create knowledge bases from documents.

## Configuration
1. **Adding the value of the token variable:** 
   - The token is necessary for uploading documents and creating knowledge bases.
   - To add your token, open the `config.js` file in the `config/` folder and insert your token at the appropriate location.

## Installation
1. Make sure you have Node.js and npm installed on your machine.
2. Clone this repository to your local machine.
3. Navigate to the project's root directory.
4. Run the following command to install dependencies:
    ```sh
    npm install
    ```

## Usage
This project offers two ways to create knowledge bases:

1. **Creating knowledge bases from documents:** 
   - Place a folder for each knowledge base in the `assets` directory.
   - Within each folder, you can place multiple files.
   - To use this method, uncomment the following line in the `index.js` file:
     ```javascript
     // await fileHelper.createDocumentKnowledge(this.directoryPath);
     ```

2. **Creating a knowledge base from a CSV file filled with URLs:**
   - To use this method, comment out the following line in the `index.js` file:
     ```javascript
     // await fileHelper.createDocumentKnowledge(this.directoryPath);
     ```

## Project Launch
Once dependencies are installed and configuration is complete, you can start the project by using the following command:
```sh
node index.js
