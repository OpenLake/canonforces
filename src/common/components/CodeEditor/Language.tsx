import React from 'react';
import { LANGUAGE_VERSIONS } from '../../../constants/boilerplate';
import styles from '../../../styles/Language.module.css';

type LanguageProps = {
  language: string;
  onSelect: (lang: string) => void;
};

const Language: React.FC<LanguageProps> = ({ language, onSelect }) => {
  const getLanguageIcon = (lang: string) => {
    const icons: { [key: string]: string } = {
      javascript: '🟨',
      python: '🐍',
      java: '☕',
      cpp: '⚡',
      c: '🔧',
      typescript: '🔷',
      go: '🔵',
      rust: '🦀',
      php: '🐘',
      ruby: '💎',
    };
    return icons[lang] || '📝';
  };

  return (
    <div className={styles.languageWrapper}>
      <div className={styles.selectWrapper}>
        <div className={styles.currentLanguage}>
          <span className={styles.languageIcon}>
            {getLanguageIcon(language)}
          </span>
          <span className={styles.languageName}>
            {language.charAt(0).toUpperCase() + language.slice(1)}
          </span>
          <span className={styles.version}>
            {LANGUAGE_VERSIONS[language as keyof typeof LANGUAGE_VERSIONS]}
          </span>
        </div>
        <select
          className={styles.languageSelect}
          value={language}
          onChange={(e) => onSelect(e.target.value)}
          aria-label="Select programming language"
        >
          {Object.entries(LANGUAGE_VERSIONS).map(([lang, version]) => (
            <option key={lang} value={lang}>
              {lang.charAt(0).toUpperCase() + lang.slice(1)} ({version})
            </option>
          ))}
        </select>
        <div className={styles.dropdownIcon}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );
};

export default Language;