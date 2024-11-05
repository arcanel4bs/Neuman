// Helper functions for data generation
export function extractData(content: string, format: string) {
  if (format === 'JSON') {
    try {
      // First try to parse the content directly
      return JSON.parse(content);
    } catch (e) {
      // Look for JSON in code blocks with or without language specification
      const jsonMatches = [
        content.match(/```json\n([\s\S]*?)\n```/),
        content.match(/```\n([\s\S]*?)\n```/),
        content.match(/\[([\s\S]*?)\]/) // Look for array notation
      ];

      for (const match of jsonMatches) {
        if (match) {
          try {
            const cleaned = match[1].trim();
            return JSON.parse(cleaned);
          } catch (e) {
            continue;
          }
        }
      }

      // If all parsing attempts fail, try to extract any JSON-like structure
      const jsonPattern = /(\[|\{)[\s\S]*?(\]|\})/;
      const jsonMatch = content.match(jsonPattern);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.error('Failed to parse JSON structure:', e);
        }
      }

      console.error('Failed to extract valid JSON data');
      return [];
    }
  } else if (format === 'CSV') {
    const match = content.match(/```csv\n([\s\S]*?)\n```/) || content.match(/^([^`]+)/);
    if (match) {
      const csvContent = match[1].trim();
      if (csvContent.includes(',') && csvContent.includes('\n')) {
        return csvContent;
      }
    }
    console.error('Failed to extract valid CSV data');
    return '';
  }
  return content;
}

export function getChunkConfig(dataSize: string) {
  const configs = {
    small: { chunks: 1, tokensPerChunk: 1024 },
    medium: { chunks: 3, tokensPerChunk: 1024 },
    large: { chunks: 8, tokensPerChunk: 1024 },
  };
  return configs[dataSize as keyof typeof configs] || configs.small;
}

export function getTemperature(chunkIndex: number, totalChunks: number) {
  return 0.3 + (0.6 * (chunkIndex / (totalChunks - 1)));
}

export function getDiversePrompt(
  basePrompt: string, 
  chunkIndex: number, 
  totalChunks: number, 
  previousChunks: any[], 
  format: string
) {
  let diversityInstructions = '';
  
  if (chunkIndex > 0 && previousChunks.length > 0) {
    const previousSummary = previousChunks
      .map(chunk => typeof chunk === 'string' ? chunk.substring(0, 100) : JSON.stringify(chunk).substring(0, 100))
      .join(' ');
    
    diversityInstructions = `Generate completely different data from the following examples: ${previousSummary}. Ensure maximum diversity and uniqueness.`;
  }

  const diversityModifiers = [
    'Focus on common scenarios',
    'Include edge cases and unusual scenarios',
    'Emphasize extreme or rare cases',
    'Mix different categories or types',
    'Use contrasting or opposing elements',
    'Incorporate unexpected or surprising elements',
    'Focus on niche or specialized scenarios',
    'Blend multiple perspectives or approaches'
  ];

  const modifier = diversityModifiers[chunkIndex % diversityModifiers.length];

  let formatInstructions = '';
  if (format === 'JSON') {
    formatInstructions = 'Ensure the output is in valid JSON format. Do not include any explanatory text outside the JSON structure.';
  }

  return `${basePrompt} ${modifier}. ${diversityInstructions} ${formatInstructions}`;
}

export function removeSimilarities(newChunk: any, previousChunks: any[], format: string) {
  if (format === 'JSON') {
    return removeSimilaritiesJSON(newChunk, previousChunks);
  } else if (format === 'CSV') {
    return removeSimilaritiesCSV(newChunk, previousChunks);
  }
  return removeSimilaritiesTXT(newChunk, previousChunks);
}

function removeSimilaritiesJSON(newChunk: any, previousChunks: any[]) {
  try {
    let newData = typeof newChunk === 'string' ? JSON.parse(newChunk) : newChunk;
    const previousData = previousChunks.map(chunk => 
      typeof chunk === 'string' ? JSON.parse(chunk) : chunk
    ).flat();

    if (!Array.isArray(newData)) {
      newData = [newData];
    }

    const isSimilar = (obj1: any, obj2: any) => {
      if (typeof obj1 !== 'object' || typeof obj2 !== 'object') {
        return obj1 === obj2;
      }
      const similarity = Object.keys(obj1).reduce((count, key) => {
        return obj1[key] === obj2[key] ? count + 1 : count;
      }, 0) / Math.max(Object.keys(obj1).length, Object.keys(obj2).length);
      return similarity > 0.6;
    };

    const uniqueData = newData.filter((newObj: any) => 
      !previousData.some((prevObj: any) => isSimilar(newObj, prevObj))
    );

    return JSON.stringify(uniqueData);
  } catch (error) {
    console.error('Error processing JSON similarity:', error);
    return JSON.stringify(newChunk);
  }
}

function removeSimilaritiesCSV(newChunk: string, previousChunks: string[]) {
  try {
    const newLines = newChunk.split('\n');
    const previousLines = previousChunks
      .map(chunk => chunk.split('\n'))
      .flat();

    const headers = newLines[0];
    const uniqueLines = newLines.filter(line => 
      line === headers || !previousLines.includes(line)
    );

    return uniqueLines.join('\n');
  } catch (error) {
    console.error('Error processing CSV similarity:', error);
    return newChunk;
  }
}

function removeSimilaritiesTXT(newChunk: string, previousChunks: string[]) {
  try {
    const newSentences = newChunk.split('. ');
    const previousSentences = previousChunks
      .map(chunk => chunk.split('. '))
      .flat();

    const uniqueSentences = newSentences.filter(sentence => 
      !previousSentences.some(prevSentence => 
        calculateStringSimilarity(sentence, prevSentence) > 0.6
      )
    );

    return uniqueSentences.join('. ');
  } catch (error) {
    console.error('Error processing TXT similarity:', error);
    return newChunk;
  }
}

function calculateStringSimilarity(str1: string, str2: string) {
  const shorter = str1.length < str2.length ? str1 : str2;
  const longer = str1.length < str2.length ? str2 : str1;
  
  const longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  
  return (longerLength - editDistance(shorter, longer)) / parseFloat(longerLength.toString());
}

function editDistance(s1: string, s2: string) {
  s1 = s1.toLowerCase();
  s2 = s2.toLowerCase();

  const costs: number[] = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0)
        costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue),
              costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0)
      costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

export function mergeDataChunks(chunks: any[], format: string) {
  if (format === 'JSON') {
    try {
      const mergedData = chunks.reduce((acc, chunk) => {
        const parsedChunk = typeof chunk === 'string' ? JSON.parse(chunk) : chunk;
        return acc.concat(Array.isArray(parsedChunk) ? parsedChunk : [parsedChunk]);
      }, []);
      return JSON.stringify(mergedData, null, 2);
    } catch (error) {
      console.error('Error merging JSON chunks:', error);
      return JSON.stringify(chunks);
    }
  } else if (format === 'CSV') {
    try {
      const [firstChunk, ...restChunks] = chunks;
      const lines = firstChunk.split('\n');
      const headers = lines[0];
      const dataLines = lines.slice(1).concat(...restChunks.map(chunk => chunk.split('\n').slice(1)));
      return [headers, ...Array.from(new Set(dataLines))].join('\n');
    } catch (error) {
      console.error('Error merging CSV chunks:', error);
      return chunks.join('\n\n');
    }
  } else {
    return chunks.join('\n\n');
  }
} 