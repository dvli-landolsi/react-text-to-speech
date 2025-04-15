import React, { useState, useEffect, KeyboardEvent } from "react";
import { franc } from "franc-min";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import mammoth from "mammoth";
import "./App.css";

const TextToSpeech: React.FC = () => {
  const [text, setText] = useState<string>("");
  const [language, setLanguage] = useState<string>("en");
  const [fileName, setFileName] = useState<string>("Audio File name");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);

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
    };

    window.speechSynthesis.addEventListener("end", handleSpeechEnd);

    return () => {
      window.speechSynthesis.removeEventListener("end", handleSpeechEnd);
    };
  }, []);

  const handleSpeak = (): void => {
    if ("speechSynthesis" in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setIsPaused(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
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

  // Handle PDF file upload
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

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Audio Transcribe</h1>
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

      <div className="file-info">
        <span className="file-name">{fileName}</span>
        <span className="file-date">
          {new Date().toLocaleDateString("en-GB")}
        </span>
      </div>

      <div className="content-area">
        <div className="text-container">
          <textarea
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
