import fs from "fs/promises";
import {PDFParse} from "pdf-parse";
 

/**  
 * extract text from pdf file
* @param {string} filePath - path to the pdf file
* @returns {Promise<{text: string, numPages: number}>} - extracted text and number of pages
*/
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        //pdf-parse expects a Unit8Array, not a Buffer
        const parser = new Uint8Array(dataBuffer);
        const data = await parser.getText();
        return{
            text: data.text,
            numPages: data.numpages,
            info: data.info
        };
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error("Failed to extract text from PDF");
    }
}
