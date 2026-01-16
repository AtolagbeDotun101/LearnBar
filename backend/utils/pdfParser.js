import fs from "fs/promises";

import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs';

 

/**  
 * extract text from pdf file
* @param {string} filePath - path to the pdf file
* @returns {Promise<{text: string, numPages: number}>} - extracted text and number of pages
*/
// export const extractTextFromPDF = async (filePath) => {
//     try {
//         // const dataBuffer = await fs.readFile(filePath);
//         // // pdf-parse expects a Unit8Array, not a Buffer
//         // const parser = new Uint8Array(dataBuffer);
//         // const data = await parser.getText();
// const dataBuffer = await fs.readFile(filePath);
//         const data = await pdfParse(dataBuffer);
    
//         return{
//             text: data.text,
//             numPages: data.numpages,
//             info: data.info
//         };
//     } catch (error) {
//         console.error("Error extracting text from PDF:", error);
//         throw new Error("Failed to extract text from PDF");
//     }
// }

/**  
 * Extract text from PDF file
 * @param {string} filePath - path to the PDF file
 * @returns {Promise<{text: string, numPages: number}>}
 */
export const extractTextFromPDF = async (filePath) => {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = new Uint8Array(dataBuffer);
        
        // Load PDF document
        const loadingTask = getDocument({ data });
        const pdfDocument = await loadingTask.promise;
        
        const numPages = pdfDocument.numPages;
        let fullText = '';
        
        // Extract text from each page
        for (let pageNum = 1; pageNum <= numPages; pageNum++) {
            const page = await pdfDocument.getPage(pageNum);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
        }
        
        return {
            text: fullText.trim(),
            numPages: numPages,
        };
    } catch (error) {
        console.error("Error extracting text from PDF:", error);
        throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
}

