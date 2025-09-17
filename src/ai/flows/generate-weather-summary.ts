'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a concise weather summary.
 *
 * - generateWeatherSummary - A function that takes weather data as input and returns a human-readable summary.
 * - GenerateWeatherSummaryInput - The input type for the generateWeatherSummary function.
 * - GenerateWeatherSummaryOutput - The return type for the generateWeatherSummary function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateWeatherSummaryInputSchema = z.object({
  location: z.string().describe('The location for which to generate the weather summary.'),
  temperature: z.number().describe('The current temperature in Celsius.'),
  humidity: z.number().describe('The current humidity percentage.'),
  windSpeed: z.number().describe('The current wind speed in km/h.'),
  description: z.string().describe('A brief description of the weather conditions.'),
});

export type GenerateWeatherSummaryInput = z.infer<typeof GenerateWeatherSummaryInputSchema>;

const GenerateWeatherSummaryOutputSchema = z.object({
  summary: z.string().describe('A concise, human-readable summary of the weather conditions.'),
});

export type GenerateWeatherSummaryOutput = z.infer<typeof GenerateWeatherSummaryOutputSchema>;

export async function generateWeatherSummary(input: GenerateWeatherSummaryInput): Promise<GenerateWeatherSummaryOutput> {
  return generateWeatherSummaryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateWeatherSummaryPrompt',
  input: {schema: GenerateWeatherSummaryInputSchema},
  output: {schema: GenerateWeatherSummaryOutputSchema},
  prompt: `You are a helpful weather assistant. Generate a concise and human-readable summary of the current weather conditions for the given location.

Location: {{{location}}}
Temperature: {{{temperature}}}°C
Humidity: {{{humidity}}}%
Wind Speed: {{{windSpeed}}} km/h
Description: {{{description}}}

Summary:`,
});

const generateWeatherSummaryFlow = ai.defineFlow({
  name: 'generateWeatherSummaryFlow',
  inputSchema: GenerateWeatherSummaryInputSchema,
  outputSchema: GenerateWeatherSummaryOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
