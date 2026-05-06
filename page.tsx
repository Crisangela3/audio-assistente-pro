"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("Parado");
  const [listening, setListening] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const recognitionRef = useRef<any>(null);
  const isListening = useRef(false);

  // 📂 carregar histórico ao abrir
  useEffect(() => {
    const saved = localStorage.getItem("aulas");
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const salvarNoStorage = (novoTexto: string) => {
    const atualizado = [...history, novoTexto];

    setHistory(atualizado);
    localStorage.setItem("aulas", JSON.stringify(atualizado));
  };

  const iniciar = () => {
    try {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        setStatus("❌ Use Google Chrome");
        return;
      }

      const recognition = new SpeechRecognition();

      recognition.lang = "pt-BR";
      recognition.continuous = true;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setStatus("🎤 Ouvindo...");
      };

      recognition.onresult = (event: any) => {
        let finalText = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalText += event.results[i][0].transcript + " ";
          }
        }

        if (finalText.trim()) {
          setText((prev) => {
            const novo = prev + finalText;

            // 💾 auto-salvar a cada frase
            salvarNoStorage(finalText);

            return novo;
          });
        }
      };

      recognition.onerror = (e: any) => {
        setStatus("Erro: " + e.error);
      };

      recognition.onend = () => {
        if (isListening.current) recognition.start();
      };

      recognition.start();

      recognitionRef.current = recognition;
      isListening.current = true;
      setListening(true);
    } catch (err) {
      console.error(err);
      setStatus("Erro ao iniciar");
    }
  };

  const parar = () => {
    isListening.current = false;
    recognitionRef.current?.stop();
    setListening(false);
    setStatus("Parado");
  };

  const salvarManual = () => {
    if (!text.trim()) return;

    salvarNoStorage(text);
    setText("");
  };

  return (
    <div style={{ padding: 20, background: "#E4D0B4", minHeight: "100vh" }}>
      <h1 style={{ color: "#748264" }}>🎧 Assistente de Aula</h1>

      <p>Status: {status}</p>

      {!listening ? (
        <button onClick={iniciar} style={{ background: "#94A074", padding: 10 }}>
          ▶ Iniciar
        </button>
      ) : (
        <button onClick={parar} style={{ background: "#A46C3C", padding: 10 }}>
          ⏹ Parar
        </button>
      )}

      <button
        onClick={salvarManual}
        style={{
          marginLeft: 10,
          background: "#748264",
          padding: 10,
          color: "white",
        }}
      >
        💾 Salvar trecho
      </button>

      <textarea
        value={text}
        readOnly
        placeholder="Texto da aula..."
        style={{
          width: "100%",
          height: 180,
          marginTop: 15,
          background: "#B4C494",
          padding: 10,
        }}
      />

      <h3>📂 Histórico automático</h3>

      {history.map((h, i) => (
        <div
          key={i}
          style={{
            background: "#CCAC84",
            marginTop: 10,
            padding: 10,
          }}
        >
          {h}
        </div>
      ))}
    </div>
  );
}