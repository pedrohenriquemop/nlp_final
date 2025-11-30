import { useState } from "react";

interface PredictionResult {
  language: string;
  confidence: number;
  is_code: boolean;
}

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDetect = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:8000/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error("Erro ao conectar com a API");

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      setError("Falha ao identificar. Verifique se a API está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-6">
        <div className="space-y-2 text-center sm:text-left">
          <h1 className="text-2xl font-bold tracking-tight">
            Detector de Linguagem
          </h1>
          <p className="text-slate-500 text-sm">
            Cole um trecho de código ou texto abaixo para identificar a
            linguagem.
          </p>
        </div>

        <div className="space-y-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Digite ou cole seu texto aqui..."
            className="flex min-h-[160px] w-full rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y font-mono"
          />
        </div>

        <button
          onClick={handleDetect}
          disabled={loading || !text.trim()}
          className="inline-flex items-center justify-center w-full rounded-md text-sm font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-slate-900 text-slate-50 hover:bg-slate-900/90 h-10 px-4 py-2"
        >
          {loading ? "Analisando..." : "Identificar Linguagem"}
        </button>

        {error && (
          <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-100">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Linguagem Detectada
                </span>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {result.language}
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full mt-2 inline-block ${
                    result.is_code
                      ? "bg-blue-100 text-blue-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {result.is_code ? "Programação" : "Linguagem Natural"}
                </span>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-medium text-slate-500 uppercase">
                  Grau de Confiança
                </span>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {(result.confidence * 100).toFixed(1)}%
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-3">
                  <div
                    className="bg-slate-900 h-1.5 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
