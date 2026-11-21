import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { ChevronLeft, ChevronRight, Send } from "lucide-react";

export default function QuestionnairePage() {
  const { id } = useParams();
  const nav = useNavigate();
  const [ev, setEv] = useState<any>(null);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [orderState, setOrderState] = useState<Record<string, number[]>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get(`/evaluations/${id}`).then((r) => {
      setEv(r.data);
      const init: Record<string, number[]> = {};
      for (const q of r.data.questions) {
        if (q.type === "ORDERING") {
          const opts = Array.isArray(q.options) ? q.options : [];
          init[q.id] = opts.map((_: any, i: number) => i);
        }
      }
      setOrderState(init);
    }).catch(() => {});
  }, [id]);

  if (!ev) return <div>Cargando cuestionario...</div>;
  const questions = ev.questions || [];
  const q = questions[idx];
  const total = questions.length;
  const progress = ((idx + 1) / total) * 100;

  const setAnswer = (qid: string, val: any) => setAnswers((a) => ({ ...a, [qid]: val }));

  const moveOrder = (qid: string, from: number, to: number) => {
    setOrderState((s) => {
      const arr = [...(s[qid] || [])];
      const [item] = arr.splice(from, 1);
      arr.splice(to, 0, item);
      return { ...s, [qid]: arr };
    });
  };

  const persistAnswers = async () => {
    const payload = { answers: questions.map((qq: any) => ({ questionId: qq.id, answer: answers[qq.id] ?? (orderState[qq.id] || null) })) };
    try { await api.post(`/evaluations/${id}/answers`, payload); } catch {}
  };

  const finalize = async () => {
  
    // practical case textarea handled
    if (questions.some((qq: any) => {
      if (qq.type === "ORDERING") return false;
      if (qq.type === "PRACTICAL_CASE") {
        const a = answers[qq.id];
        if (a === undefined) return true;
        if (typeof a === "string" && a.trim() === "") return true;
        return false;
      }
      return answers[qq.id] === undefined;
    })) {
      if (!confirm("Hay preguntas sin responder. ¿Finalizar de todos modos?")) return;
    }
    setSubmitting(true);
    await persistAnswers();
    // ensure ordering answers saved
    for (const qq of questions) {
      if (qq.type === "ORDERING") {
        await api.post(`/evaluations/${id}/answers`, { answers: [{ questionId: qq.id, answer: orderState[qq.id] }] }).catch(() => {});
      }
      if (qq.type === "PRACTICAL_CASE" && typeof answers[qq.id] === "string") {
        await api.post(`/evaluations/${id}/answers`, { answers: [{ questionId: qq.id, answer: { text: answers[qq.id] } }] }).catch(() => {});
      }
    }
    try {
      await api.post(`/evaluations/${id}/finalize`, { timeUsedSeconds: 0 });
      nav(`/evaluation/${id}/result`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Error al finalizar");
    } finally { setSubmitting(false); }
  };

  const opts = Array.isArray(q.options) ? q.options : [];

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Pregunta {idx + 1} de {total}</span>
          <span className="text-xs text-gray-500">{q.competence}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-[#2563EB] h-2 rounded-full" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border space-y-4">
        <p className="font-medium">{q.statement}</p>
        {q.type === "ORDERING" ? (
          <div className="space-y-2">
            <p className="text-xs text-gray-500">Ordena las acciones (usa ↑ ↓):</p>
            {(orderState[q.id] || []).map((oi: number, i: number) => (
              <div key={i} className="flex items-center gap-2 p-2 border rounded-lg">
                <span className="text-sm">{i + 1}.</span>
                <span className="flex-1 text-sm">{String(opts[oi])}</span>
                <button onClick={() => i > 0 && moveOrder(q.id, i, i - 1)} className="px-2 border rounded">↑</button>
                <button onClick={() => i < (orderState[q.id].length - 1) && moveOrder(q.id, i, i + 1)} className="px-2 border rounded">↓</button>
              </div>
            ))}
          </div>
        ) : q.type === "PRACTICAL_CASE" && (!Array.isArray(opts) || opts.length === 0) ? (
          <textarea value={answers[q.id] || ""} onChange={(e) => setAnswer(q.id, e.target.value)} className="w-full border rounded-lg p-2" rows={5} placeholder="Tu respuesta..." />
        ) : (
          <div className="space-y-2">
            {opts.map((opt: any, i: number) => (
              <label key={i} className={`flex items-center gap-2 p-2 border rounded-lg cursor-pointer ${answers[q.id] === i ? "bg-[#EAF2FF] border-[#2563EB]" : ""}`}>
                <input type="radio" name={q.id} checked={answers[q.id] === i} onChange={() => setAnswer(q.id, i)} />
                <span className="text-sm">{String(opt)}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button onClick={() => setIdx((i) => Math.max(0, i - 1))} disabled={idx === 0} className="flex items-center gap-1 px-4 py-2 border rounded-lg disabled:opacity-50">
          <ChevronLeft size={16} /> Anterior
        </button>
        <div className="text-xs text-gray-500">{questions.filter((qq: any) => answers[qq.id] !== undefined || orderState[qq.id]).length} respondidas</div>
        {idx < total - 1 ? (
          <button onClick={async () => { await persistAnswers(); setIdx((i) => i + 1); }} className="flex items-center gap-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg">
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={finalize} disabled={submitting} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg">
            <Send size={16} /> {submitting ? "Finalizando..." : "Finalizar"}
          </button>
        )}
      </div>
    </div>
  );
}
