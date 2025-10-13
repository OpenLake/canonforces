import React from 'react';
import { formatDescription } from '../utils/formatDescription';

const ProblemOfTheDay = ({ problem }) => {
  return (
    <div>
      <h2>{problem.title}</h2>
      <p dangerouslySetInnerHTML={{ __html: formatDescription(problem.description) }} />
    </div>
  );
};

export default ProblemOfTheDay;
