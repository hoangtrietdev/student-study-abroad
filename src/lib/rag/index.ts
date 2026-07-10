/**
 * RAG (Retrieval-Augmented Generation) module for Study Abroad Chatbot.
 *
 * Provides university ranking, scholarship, and tuition information retrieved
 * from local Markdown files in /data/universities/.
 *
 * Data is sourced from QS World University Rankings and is updated monthly via cronjob.
 */

export { retrieveContext, retrieveByCountry } from './retriever';
export type { RAGResult } from './retriever';
export { loadUniversityChunks, getCountryContent, getAvailableCountries } from './loader';
export type { UniversityChunk } from './loader';
