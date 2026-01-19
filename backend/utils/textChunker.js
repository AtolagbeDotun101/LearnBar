/**
 * Splits the given text into chunks for AI better processing.
 * @param {string} text - The text to be chunked.
 * @param {number} chunkSize - The maximum size of each chunk.
 * @param {number} overlap - The number of overlapping characters between chunks.
 * @returns {Array<{content:string, chunkIndex:number, pageNumber:number}>} - An array of text chunks.
 */

export const chunkText = (text, chunkSize = 500, overlap = 50) => {
  if (!text || text.trim().length === 0) {
    return [];
  }

  // Clean text while preserving paragraphs structure
  const cleanedText = text
    .replace(/\r\n/g, "\n") // normalize new lines
    .replace(/\s+/g, " ") // replace multiple spaces with single space
    .replace(/\n /g, "\n") // remove spaces after new lines
    .replace(/ \n/g, "\n") // remove spaces before new lines
    .trim();

  // Try to split by paragraphs
  const paragraphs = cleanedText.split("\n").filter((p) => p.trim().length > 0);
  const chunks = [];
  let currentChunk = [];
  let currentWordCount = 0;
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const paragraphWords = paragraph.trim().split(/\s+/);
    const paragraphWordCount = paragraphWords.length;

    // If single paragraph exceeds chunk size, split it by words
    if (paragraphWordCount > chunkSize) {
      // Save current chunk if it exists
      if (currentChunk.length > 0) {
        chunks.push({
          content: currentChunk.join("\n\n"),
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });
        currentChunk = [];
        currentWordCount = 0;
      }

      // Split paragraph into word-based chunks
      for (let i = 0; i < paragraphWordCount; i += chunkSize - overlap) {
        const wordChunk = paragraphWords.slice(i, i + chunkSize).join(" ");
        chunks.push({
          content: wordChunk,
          chunkIndex: chunkIndex++,
          pageNumber: 0,
        });

        if (i + chunkSize >= paragraphWordCount) {
          break;
        }
      }
      continue; // Move to next paragraph
    }

    // If adding this paragraph exceeds chunk size, save current chunk
    if (
      currentWordCount + paragraphWordCount > chunkSize &&
      currentChunk.length > 0
    ) {
      chunks.push({
        content: currentChunk.join("\n\n"),
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      // Create overlap from previous chunk
      const prevChunkText = currentChunk.join(" ");
      const prevWords = prevChunkText.split(/\s+/);
      const overlapText = prevWords
        .slice(-Math.min(overlap, prevWords.length))
        .join(" ");

      currentChunk = [overlapText, paragraph.trim()];
      currentWordCount = overlapText.split(/\s+/).length + paragraphWordCount;
    } else {
      currentChunk.push(paragraph.trim());
      currentWordCount += paragraphWordCount;
    }
  }

  // Push any remaining text as chunk
  if (currentChunk.length > 0) {
    chunks.push({
      content: currentChunk.join("\n\n"),
      chunkIndex: chunkIndex++,
      pageNumber: 0,
    });
  }

  // Fallback: if no chunks created, split by words
  if (chunks.length === 0 && cleanedText.length > 0) {
    const allWords = cleanedText.split(/\s+/);
    for (let i = 0; i < allWords.length; i += chunkSize - overlap) {
      const wordChunk = allWords.slice(i, i + chunkSize).join(" ");
      chunks.push({
        content: wordChunk,
        chunkIndex: chunkIndex++,
        pageNumber: 0,
      });

      if (i + chunkSize >= allWords.length) {
        break;
      }
    }
  }

  return chunks;
};

/** 
 * Find relevant chunks based on keyword matching
 * @param {Array<Object>} chunks - array of text chunks
 * @param {string} query - search query
 * @param {number} maxChunks - maximum number of relevant chunks to return
 * @returns {Array<Object>} - array of relevant chunks
 */

export const findRelevantChunks = (chunks, query, maxChunks = 3) => {
    if (!query || query.trim().length === 0 || !chunks) {
        return [];
    }

    // Common stopwords to exclude
    const stopwords = new Set([
        "the", "is", "which", "and", "to",
         "a", "of", "that", "it", "on",
          "for", "as", "with", "was", 
          "at", "by", "an", "or", "but", "in"
    ]);

    // Extract clean query keywords
    const queryKeywords = query
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 0 && !stopwords.has(word));

    if (queryKeywords.length === 0) {
        // Return clean chunks object without mongoose metadata
        return chunks.slice(0, maxChunks).map(chunk => ({
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id
        }));
    }

    // Score chunks based on keyword matches
    const scoredChunks = chunks.map((chunk, index) => {
        const content = chunk.content.toLowerCase();
        const contentWords = new Set(content.split(/\s+/));
        let score = 0;

        // Score each keyword match
        for (const word of queryKeywords) {
            // Exact word match (higher score)
            const exactMatches = (content.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
            score += exactMatches * 3;

            // Partial word match (lower score)
            const partialMatches = (content.match(new RegExp(word, 'g')) || []).length - exactMatches;
            score += Math.max(0, partialMatches) * 1.5;
        }

        // Bonus: multiple keyword matches
        const uniqueKeywordMatches = queryKeywords.filter(word => contentWords.has(word)).length;
        if (uniqueKeywordMatches > 1) {
            score += uniqueKeywordMatches * 2;
        }

        // Normalize by content length
        const normalizedScore = score / Math.sqrt(contentWords.size);

        // Small bonus for earlier chunks
        const positionBonus = 1 - (index / chunks.length) * 0.1;

        // Return clean object without mongoose metadata
        return {
            content: chunk.content,
            chunkIndex: chunk.chunkIndex,
            pageNumber: chunk.pageNumber,
            _id: chunk._id,
            score: normalizedScore * positionBonus,
            rawScore: score,
            matchedWords: uniqueKeywordMatches
        };
    });

    return scoredChunks
        .filter(chunk => chunk.score > 0)
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            if (b.matchedWords !== a.matchedWords) {
                return b.matchedWords - a.matchedWords;
            }
            return a.chunkIndex - b.chunkIndex;
        })
        .slice(0, maxChunks);
};