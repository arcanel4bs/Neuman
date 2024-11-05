import Groq from "groq-sdk";
import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';
import { 
  extractData, 
  getChunkConfig, 
  getTemperature, 
  getDiversePrompt, 
  removeSimilarities, 
  mergeDataChunks 
} from '@/utils/dataGeneration';

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

export async function POST(req: Request) {
  const { prompt, format, dataSize } = await req.json();
  const supabase = await createClient();
  
  try {
    const chunkConfig = getChunkConfig(dataSize);
    const dataChunks = [];
    
    for (let i = 0; i < chunkConfig.chunks; i++) {
      const temperature = getTemperature(i, chunkConfig.chunks);
      const diversePrompt = getDiversePrompt(prompt, i, chunkConfig.chunks, dataChunks, format);

      const completion = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
          { 
            role: "system", 
            content: "You are a synthetic data generator. Always respond with valid JSON data only. Do not include any explanatory text, markdown formatting, or code blocks. Just return the raw JSON array or object." 
          },
          { 
            role: "user", 
            content: diversePrompt 
          }
        ],
        temperature,
        max_tokens: chunkConfig.tokensPerChunk,
      });

      if (!completion.choices[0].message.content) {
        console.error('Empty response from Groq API');
        throw new Error('No content generated');
      }
      
      let generatedData = completion.choices[0].message.content;
      console.log('Raw API response:', generatedData);

      generatedData = extractData(generatedData, format);
      console.log('Extracted data:', generatedData);

      // Check if the extracted data is valid
      if ((format === 'JSON' && !Array.isArray(generatedData) && typeof generatedData !== 'object') ||
          (format === 'CSV' && typeof generatedData !== 'string') ||
          (format === 'TXT' && typeof generatedData !== 'string')) {
        throw new Error(`Invalid ${format} data generated`);
      }
      
      // Remove similarities with previous chunks
      if (i > 0) {
        generatedData = removeSimilarities(generatedData, dataChunks, format);
      }
      
      dataChunks.push(generatedData);
    }

    const mergedData = mergeDataChunks(dataChunks, format);

    // New improved Supabase storage handling
    const timestamp = new Date().toISOString();
    const dataToStore = {
      prompt,
      format,
      data_size: dataSize,
      generated_data: mergedData,
      created_at: timestamp,
      status: 'success',
      metadata: {
        chunks_count: dataChunks.length,
        total_records: Array.isArray(JSON.parse(mergedData)) 
          ? JSON.parse(mergedData).length 
          : 1
      }
    };

    // First, validate the data size
    const dataSizeInBytes = new TextEncoder().encode(JSON.stringify(dataToStore)).length;
    if (dataSizeInBytes > 1024 * 1024) { // If larger than 1MB
      console.warn('Large data detected, compressing before storage');
      dataToStore.generated_data = JSON.stringify(JSON.parse(mergedData)); // Minify JSON
    }

    // Attempt to store with retry logic
    let retryCount = 0;
    const maxRetries = 3;
    
    while (retryCount < maxRetries) {
      const { data, error: supabaseError } = await supabase
        .from('response')
        .insert([dataToStore])
        .select()
        .single();

      if (data) {
        // Successfully stored
        return NextResponse.json({ 
          data: mergedData,
          type: 'complete',
          stored: true,
          record_id: data.id
        });
      }

      if (supabaseError) {
        console.error(`Storage attempt ${retryCount + 1} failed:`, supabaseError);
        
        // Handle specific Supabase errors
        if (supabaseError.code === '23505') { // Unique constraint error
          const uniqueSuffix = Math.random().toString(36).substring(7);
          dataToStore.prompt = `${prompt}_${uniqueSuffix}`;
        } else if (supabaseError.code === '23502') { // Not null violation
          console.error('Required field missing:', supabaseError.details);
          throw new Error('Missing required fields in data');
        } else if (supabaseError.code === '42P01') { // Undefined table
          console.error('Table "response" does not exist');
          // Create table if it doesn't exist
          await createResponseTableIfNotExists(supabase);
          retryCount--; // Don't count this as a retry
        }

        retryCount++;
        if (retryCount === maxRetries) {
          // If all retries failed, store error details and return data anyway
          const { error: logError } = await supabase
            .from('error_logs')
            .insert([{
              error: supabaseError,
              timestamp: new Date().toISOString(),
              data_sample: JSON.stringify(dataToStore).substring(0, 1000) // First 1000 chars --> increased to 2000 chars
            }]);
          
          if (logError) {
            console.error('Failed to log error:', logError);
          }

          // Return success with data but indicate storage failed
          return NextResponse.json({ 
            data: mergedData,
            type: 'complete',
            stored: false,
            storage_error: 'Data generated successfully but storage failed'
          });
        }

        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

  } catch (error: any) {
    console.error('Error details:', {
      message: error.message,
      status: error.status,
      response: error.response?.data,
      url: error.request?.url,
      headers: error.request?.headers,
    });
    return NextResponse.json({ 
      error: 'An error occurred while generating data',
      details: error.message,
      type: 'error'
    }, { status: error.status || 500 });
  }
}

// Helper function to create the response table if it doesn't exist
async function createResponseTableIfNotExists(supabase: any) {
  const { error } = await supabase.rpc('create_response_table_if_not_exists');
  if (error) {
    console.error('Failed to create table:', error);
    throw error;
  }
} 