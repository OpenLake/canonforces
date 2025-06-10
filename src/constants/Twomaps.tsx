import { Problem } from './problems'; 

import { problem as rawProblemData } from './problems'; 


export const ratingToQuesMap: {
  [rating: string]: { id: string; title: string }[];
} = {};

export const idToProblemMap: {
  [id: string]: Problem;
} = {};


for (const rating in rawProblemData) {
  ratingToQuesMap[rating] = [];

  for (const ques of rawProblemData[rating]) {
    ratingToQuesMap[rating].push({ id: ques.id, title: ques.title });
    idToProblemMap[ques.id] = ques;
  }
}

