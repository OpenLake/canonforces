import React from 'react'
import { CODE_SNIPPETS } from '../../../constants/boilerplate'
import { Editor } from '@monaco-editor/react'
import {useState,useEffect,useRef} from 'react'
import Language from './Language'
import Output from './Output'

const CodeEditor = ({ id }: { id: string }) => {
    const [language, setLanguage] = useState<string>('python');
    const [value, setValue] = useState(CODE_SNIPPETS[language as keyof typeof CODE_SNIPPETS]);
   
const onSelect = (lang: string) => {
  setLanguage(lang);
  setValue(CODE_SNIPPETS[lang as keyof typeof CODE_SNIPPETS]);
};

  return (
    <div>
    <Language language={language} onSelect={onSelect}/> 
    <Editor
            options={{ minimap: { enabled: false } }}
            height="60vh"
            width="50vw"
            theme="vs-dark"
            language={language}
            defaultValue={CODE_SNIPPETS[language as keyof typeof CODE_SNIPPETS]}
            value={value}
            onChange={(value) => setValue(value ?? "")}
          />
    <Output id={id} language={language} value={value}/>
    </div>
  )
}

export default CodeEditor