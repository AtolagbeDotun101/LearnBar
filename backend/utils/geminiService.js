import dotenv from  'dotenv'
import { GoogleGenAI } from '@google/genai'

dotenv.config();

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY})

if (!process.env.GEMINI_API_KEY){
    console.log("FATAL ERROR: GEMINI_API_KEY is not available")
    process.exit(1)
}

/**
 * Generate flashcard from text
 * @param {string} text - Document text
 * @param {number} count -  Number of flashcard to generate
 * @returns {Promise<Array<{question: string, answer:string, difficulty:string}>>}
 */

export const generateFlashcards = async (text, count =10) =>{
    const prompt = `Generate exactly ${count} educational flashcards from the following text.
    Format each flashcard as: 
    Q: [Clear,  specific question]
    A: [Concise, accurate anser]
    D: [Difficulty level: easy, medium, hard] 
    
    seperrate each flashcard with "---"
    
    Text:
    ${text.substring[0, 15000]}`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt
        })

        const generatedText = response.text;

        const flashcards = []
        const cards = generatedText.split('---').filter(c => c.trim());
        for (const card of cards){
            const lines = card.trim().split('\n');
            let question = '', answer= '', difficulty ='medium';

            for (const line of lines){
                 if(line.startsWith('Q:')){
                    question = line.substring(2).trim()
                 }else if(line.startsWith('A:')){
                    answer = line.substring(2).trim()
                 }else if(line.substring('D:')){
                   const diff = line.substring(2).trim().toLowerCase();
                    if(['easy', 'medium', 'hard'].includes(diff)){
                        difficulty = diff;
                    }
                 }
            }

            if(question && answer){
                flashcards.push({question, answer, difficulty});
            }
        }
        return flashcards.slice(0, count);
        
    } catch (error) {
        console.log("Gemini API error :", error);
        throw new Error( "failed to generate flashcards");
    }
}

/**
 * Generate quiz questions
 * @param {string} text - Document
 * @param {number} numQuestions - Number of questions
 * @returns {Promise<Array<{question: string, options:Array, correctAnswer:string, explanation:string, difficulty:string}>>}
 */

export const generateQuiz = async (text, numQuestions) =>{
    const prompt = `Generate exactly ${numQuestions} multiple choice questions from the following text.
    Format each questions as:
    Q: [Question]
    Q1: [Option 1]
    Q2: [Option 2]
    Q3: [Option 3]
    Q4: [Option 4]
    C: [Correct option - exactly as written above]
    E: [Brief explanation]
    D: [Difficulty: easy, medium or hard]
    
    Seperate questions with "---"
    
    Text:
    ${text.substring(0, 15000)}`;

    try {
        const respose = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt 
        })

        const generatedtext = respose.text;

        const questions = []
        const questionBlocks = generatedtext.split('---').filter(q => q.trim());

        for (block of questionBlocks){
            const lines = block.trim().split('\n');
            let question = '', options = [], correctAnswer= '', explanation = '' ,difficulty = 'medium';

            for(const line of lines){
                const trimmed = line.trim()
                if(trimmed.startsWith('Q:')){
                    question = trimmed.substring(2).trim();
                }else if (trimmed.match(/^O\d:/)){
                    options.push(trimmed.substring(3).trim())
                }else if(trimmed.startsWith('C:')){
                     correctAnswer = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('E:')){
                     explanation = trimmed.substring(2).trim();
                } else if (trimmed.startsWith('D:')){
                    const diff = line.substring(2).trim().toLowerCase();
                    if(['easy', 'medium', 'hard'].includes(diff)){
                        difficulty = diff;
                    }
                }
            }

            if(question && options.length === 4 && correctAnswer){
                questions.push({question,options,correctAnswer,explanation,difficulty})
            }
        }
        return questions.slice(0, numQuestions);

    } catch (error) {
       console.log("Gemini API error :", error) 
       throw new Error("Failed to generate quiz");
    }
}

/**
 * Generate document summary
 * @param {string} text - Document text
 * @returns {Promise<string>} 
 */

export const generateSummary =async (text)=>{
    const prompt  = `Provide a concise summary of the following text , highlighting the key concept ,main ideas and important points.
    keep the summary clear and structured.
    
    Text:
    ${text.substring(0, 20000)}`;

    try {
        const response = ai.models.generateContent({
              model: "gemini-2.5-flash-lite",
            contents: prompt 
        })
        const generatedText = await response.text;
        return generatedText;
    } catch (error) {
        console.log("Gemini API error :", error) 
       throw new Error("Failed to generate summary");
    }
}

/**
 * chat with document context
 * @param {string} question - User question
 * @param {Array<Object>} chunks - Relevant documnet chunks
 * @returns {Promise<string>}
 */
export const chatWithContext = async (question, chunks) =>{
    const context = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.content}`).join('\n\n');

    console.log("context ____",context);
    
    const prompt = `Based on the following context from a document, Analyse the context and answer the users question. 
    If the answer is not in the context say so
    
    Context:
    ${context}
    
    Question: ${question}
    
    Answer: `;

    try {
        const respose = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt 
        })

        const generatedtext = respose.text;
        return generatedtext;
        
    } catch (error) {
         console.log("Gemini API error :", error) 
       throw new Error("Failed to generate chat");
    }
}

/**
 * Explain a certain concept
 * @param {string} concept - Concept to explain
 * @param {string} context - Relevant context
 * @returns {Promise<string>}
 */

export const explainConcept = async (concept, context) =>{
   
        const prompt = `Explain the concept of ${concept} based on the following context. 
        Provide a clear, educational explanation that is e asy to understand
        Include example if relevant
        
        Context: 
        ${context.substring(0, 10000)}`;
    try {
          const respose = await ai.models.generateContent({
            model: "gemini-2.5-flash-lite",
            contents: prompt 
        })

        const generatedtext = respose.text;
        return generatedtext;
        
    } catch (error) {
         console.log("Gemini API error :", error) 
       throw new Error("Failed to explain concept");
    }
}