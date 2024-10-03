import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

// Initialize OpenAI configuration
const openaiClient = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

// Initialize Anthropic configuration
const anthropicApiKey = process.env['ANTHROPIC_API_KEY'];

export async function POST(request: Request) {
  console.log('Received POST request to /api/ask-openai');
  const startTime = Date.now();
  try {
    const { message, model } = await request.json();
    console.log('Parsed request body:', { message, model });

    if (!message) {
      console.warn('Request rejected: Message is required');
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!model) {
      console.warn('Request rejected: Model is required');
      return NextResponse.json({ error: 'Model is required' }, { status: 400 });
    }

    let model_reply: string | undefined;

    if (model === 'claude-3.5-sonnet') {
      console.log('Sending request to Anthropic API');
      const anthropicResponse = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-5-sonnet-20240620',
          max_tokens: 2000,
          messages: [{ role: 'user', content: message }],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': anthropicApiKey,
            'anthropic-version': '2023-06-01',
          },
        }
      );
      console.log('Received response from Anthropic API');
      model_reply = anthropicResponse.data.content[0].text;
    } else {
      console.log('Sending request to OpenAI');
      const chatCompletion = await openaiClient.chat.completions.create({
        model: model,
        messages: [{ role: "user", "content": message }],
      });
      console.log('Received response from OpenAI');
      model_reply = chatCompletion.choices[0].message?.content ?? '';
    }

    console.log('Model used:', model);

    if (!model_reply) {
      console.error('API response did not contain a message');
      return NextResponse.json({ error: 'Failed to get response from API' }, { status: 500 });
    }

    // Extract content within <result>, <tldr>, <details>, <errors>, and <suggestions> tags using regex
    const resultRegex = /<result>([\s\S]*?)<\/result>/;
    const tldrRegex = /<tldr>([\s\S]*?)<\/tldr>/;
    const detailsRegex = /<details>([\s\S]*?)<\/details>/;
    const errorsRegex = /<errors>([\s\S]*?)<\/errors>/;
    const suggestionsRegex = /<suggestions>([\s\S]*?)<\/suggestions>/;

    const resultMatch = model_reply.match(resultRegex);
    const tldrMatch = model_reply.match(tldrRegex);
    const detailsMatch = model_reply.match(detailsRegex);
    const errorsMatch = model_reply.match(errorsRegex);
    const suggestionsMatch = model_reply.match(suggestionsRegex);

    const extractedResult = resultMatch ? resultMatch[1].trim() : '';
    const extractedTldr = tldrMatch ? tldrMatch[1].trim() : '';
    const extractedDetails = detailsMatch ? detailsMatch[1].trim() : '';
    const extractedErrors = errorsMatch ? errorsMatch[1].trim() : '';
    const extractedSuggestions = suggestionsMatch ? suggestionsMatch[1].trim() : '';

    const endTime = Date.now();
    const timeTakenSeconds = ((endTime - startTime) / 1000).toFixed(1);

    console.log('Sending successful response', {
      result: extractedResult,
      tldr: extractedTldr,
      details: extractedDetails,
      errors: extractedErrors,
      suggestions: extractedSuggestions,
      timeTaken: timeTakenSeconds
    });
    return NextResponse.json({ 
      result: extractedResult,
      tldr: extractedTldr,
      details: extractedDetails,
      errors: extractedErrors,
      suggestions: extractedSuggestions,
      timeTaken: timeTakenSeconds
    });
  } catch (error) {
    const endTime = Date.now();
    const timeTakenSeconds = ((endTime - startTime) / 1000).toFixed(1);
    console.error('Error processing request:', error, { timeTaken: timeTakenSeconds });
    return NextResponse.json({ error: 'Internal Server Error', timeTaken: timeTakenSeconds }, { status: 500 });
  }
}