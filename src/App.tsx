import React, { useState, useEffect, KeyboardEvent, useRef } from "react";
import { franc } from "franc-min";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";
import "./App.css";
import { Helmet } from "react-helmet";
import logo from "./assets/logo.png";

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [fileName, setFileName] = useState<string>("Audio File name");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(-1);
  const textRef = useRef<HTMLTextAreaElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const languageMap: { [key: string]: string } = {
    eng: "en",
    fra: "fr",
    arb: "ar",
  };

  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

  useEffect(() => {
    if (text.trim()) {
      const detectedLanguage = franc(text);
      const mappedLanguage = languageMap[detectedLanguage] || "en";
      setLanguage(mappedLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  useEffect(() => {
    // Handle speech synthesis end
    const handleSpeechEnd = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      setSelectedWordIndex(-1);
    };

    window.speechSynthesis.addEventListener("end", handleSpeechEnd);

    // Cleanup function to cancel speech synthesis when component unmounts
    return () => {
      window.speechSynthesis.removeEventListener("end", handleSpeechEnd);
      window.speechSynthesis.cancel(); // Cancel any ongoing speech
      setIsSpeaking(false);
      setIsPaused(false);
    };
  }, []);

  const handleSpeak = (): void => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        setSelectedWordIndex(-1);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;

      // Store the utterance in the ref for later use
      utteranceRef.current = utterance;

      // Add event listener for word boundaries
      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const wordIndex = event.charIndex;
          const words = text.split(/\s+/);
          let currentIndex = 0;

          for (let i = 0; i < words.length; i++) {
            if (currentIndex + words[i].length >= wordIndex) {
              setSelectedWordIndex(i);
              break;
            }
            currentIndex += words[i].length + 1; // +1 for the space
          }
        }
      };

      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const handlePauseResume = (): void => {
    if (isSpeaking) {
      if (isPaused) {
        window.speechSynthesis.resume();
        setIsPaused(false);
      } else {
        window.speechSynthesis.pause();
        setIsPaused(true);
      }
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSpeak();
    }
  };

  const handleWordClick = (index: number): void => {
    setSelectedWordIndex(index);

    if (isSpeaking) {
      window.speechSynthesis.cancel();

      const words = text.split(/\s+/);
      const textFromWord = words.slice(index).join(" ");

      const utterance = new SpeechSynthesisUtterance(textFromWord);
      utterance.lang = language;
      utteranceRef.current = utterance;

      utterance.onboundary = (event) => {
        if (event.name === "word") {
          const wordIndex = event.charIndex;
          const currentWords = textFromWord.split(/\s+/);
          let currentIndex = 0;

          for (let i = 0; i < currentWords.length; i++) {
            if (currentIndex + currentWords[i].length >= wordIndex) {
              setSelectedWordIndex(index + i);
              break;
            }
            currentIndex += currentWords[i].length + 1; // +1 for the space
          }
        }
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePdfUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;

      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      console.log(pdf);
      let extractedText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        extractedText += textContent.items
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((item: any) => item.str)
          .join(" ");
      }
      setText(extractedText);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDocxUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const result = await mammoth.extractRawText({ arrayBuffer });
      setText(result.value);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;
    setFileName(file.name);
    setIsProcessing(true);

    if (file.type === "application/pdf") {
      handlePdfUpload(file);
      setIsProcessing(false);
    } else if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      handleDocxUpload(file);
      setIsProcessing(false);
    } else {
      alert("Unsupported file type. Please upload a PDF or DOCX file.");
    }
  };

  const renderTextAsWords = () => {
    if (!text) return null;

    const words = text.split(/\s+/);
    return (
      <div className="words-container">
        {words.map((word, index) => (
          <span
            key={index}
            className={`word ${
              selectedWordIndex === index ? "selected-word" : ""
            }`}
            onClick={() => handleWordClick(index)}
          >
            {word}{" "}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="container">
      <Helmet>
        <title>Audio Transcribe - Browser-Based Text to Speech</title>
        <meta
          name="title"
          content="Audio Transcribe - Browser-Based Text to Speech"
        />
        <meta
          name="description"
          content="Convert text, PDFs, and DOCX files to speech using native browser APIs. No external services or uploads required - everything runs locally in your browser."
        />
        <meta
          name="keywords"
          content="text to speech, Web Speech API, offline text to speech, PDF to speech, DOCX to speech, browser-based converter, privacy-focused, no upload required"
        />
        <meta name="author" content="Mohamed Ali Landolsi" />

        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="Audio Transcribe - Text to Speech Converter"
        />
        <meta
          property="og:description"
          content="Modern text-to-speech converter with support for PDFs, DOCX files, and multiple languages. Built with React and TypeScript."
        />

        <meta property="twitter:card" content="summary_large_image" />
        <meta
          property="twitter:title"
          content="Audio Transcribe - Text to Speech Converter"
        />
        <meta
          property="twitter:description"
          content="Modern text-to-speech converter with support for PDFs, DOCX files, and multiple languages. Built with React and TypeScript."
        />
        <meta property="twitter:image" content="/logo.svg" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta name="robots" content="index,follow" />

        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <meta property="og:image" content={logo} />
      </Helmet>
      // actual work
      <div className="header">
        <div className="logo-container">
          <img src="/logo.svg" alt="Audio Transcribe Logo" className="logo" />
          <h1 className="title">Audio Transcribe</h1>
        </div>
        <label className="upload-btn">
          Add New File
          <input
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileUpload}
            className="file-input"
            hidden
          />
        </label>
      </div>
      <div className="description">
        Transform your text into natural speech instantly. Upload PDFs, Word
        documents, or type directly - Audio Transcribe converts everything to
        clear, natural-sounding speech using your browser's native capabilities.
        No external services, no data uploads, just pure browser magic.
      </div>
      <div className="file-info">
        <span className="file-name">{fileName}</span>
        <span className="file-date">
          {new Date().toLocaleDateString("en-GB")}
        </span>
      </div>
      <div className="content-area">
        <div className="text-container">
          <textarea
            ref={textRef}
            className="textarea"
            placeholder="Enter text to speak or upload a PDF/DOCX file..."
            value={text}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setText(e.target.value)
            }
            onKeyDown={handleKeyDown}
          />
          {isProcessing && (
            <div className="loading-spinner">
              <div className="spinner"></div>
            </div>
          )}
          <div className="word-count">
            {text.split(/\s+/).filter(Boolean).length} / 225
          </div>
        </div>

        <div className="clickable-text-container">{renderTextAsWords()}</div>
      </div>
      <div className="controls">
        <select
          className="select"
          value={language}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            setLanguage(e.target.value)
          }
        >
          <option value="en">English</option>
          <option value="fr">French</option>
          <option value="ar">Arabic</option>
        </select>

        <div className="voice-controls">
          <button
            className="voice-btn"
            onClick={handleSpeak}
            title={isSpeaking ? "Stop" : "Convert to Audio"}
          >
            {isSpeaking ? "Stop" : "Convert to Audio"}
          </button>
          {isSpeaking && (
            <button className="voice-btn" onClick={handlePauseResume}>
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TextToSpeech;
