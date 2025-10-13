import { pipeline } from '@huggingface/transformers';

const classifier = await pipeline('sentiment-analysis');
const result = await classifier('I love programming!');
console.log(result); // e.g. [{ label: 'POSITIVE', score: 0.9998 }]