import React from 'react';
import { LANGUAGE_VERSIONS } from '../../../constants/boilerplate';
import styles from '../../../styles/Language.module.css';

type LanguageProps = {
  language: string;
  onSelect: (lang: string) => void;
};

const Language: React.FC<LanguageProps> = ({ language, onSelect }) => {
  return (
    <div className={styles.wrapper}>
      <label htmlFor="language-select" className={styles.label}>
        Language
      </label>
      <select
        id="language-select"
        className={styles.select}
        value={language}
        onChange={(e) => onSelect(e.target.value)}
      >
        {Object.entries(LANGUAGE_VERSIONS).map(([lang, version]) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)} ({version})
          </option>
        ))}
      </select>
    </div>
  );
};

export default Language;
