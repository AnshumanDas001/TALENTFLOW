/* eslint-disable react/prop-types */
import React, { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { validateAnswer, isQuestionVisible } from '@/lib/assessment-schema';

function SingleChoice({ q, value, onChange }) {
  return (
    <div className="space-y-2">
      {q.options?.map((opt, idx) => (
        <label key={idx} className="flex items-center gap-2">
          <input
            type="radio"
            name={q.id}
            value={opt}
            checked={value === opt}
            onChange={(e) => onChange(e.target.value)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function MultiChoice({ q, value = [], onChange }) {
  const toggle = (opt) => {
    const set = new Set(value);
    if (set.has(opt)) set.delete(opt); else set.add(opt);
    onChange(Array.from(set));
  };
  return (
    <div className="space-y-2">
      {q.options?.map((opt, idx) => (
        <label key={idx} className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={value.includes(opt)}
            onChange={() => toggle(opt)}
          />
          <span>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function NumberField({ q, value, onChange }) {
  return (
    <Input
      type="number"
      value={value ?? ''}
      min={q.min ?? undefined}
      max={q.max ?? undefined}
      onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
      placeholder={`Enter a number${q.min !== undefined || q.max !== undefined ? ` (${q.min ?? '-∞'}..${q.max ?? '∞'})` : ''}`}
    />
  );
}

function FileStub({ value, onChange }) {
  return (
    <Input type="file" onChange={(e) => onChange(e.target.files?.[0] ? { name: e.target.files[0].name } : undefined)} />
  );
}

export default function AssessmentForm({ schema, onSubmit }) {
  const allQuestions = useMemo(() => schema?.sections?.flatMap(s => s.questions || []) || [], [schema]);
  const [answers, setAnswers] = useState({});
  const [errors, setErrors] = useState({});

  const questionsById = useMemo(() => Object.fromEntries(allQuestions.map(q => [q.id, q])), [allQuestions]);
  const visibleQuestions = useMemo(() => {
    const map = answers;
    return allQuestions.filter(q => isQuestionVisible(q, map, questionsById));
  }, [allQuestions, answers, questionsById]);

  const updateAnswer = (qid, v) => {
    setAnswers((prev) => ({ ...prev, [qid]: v }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    for (const q of visibleQuestions) {
      const msg = validateAnswer(q, answers[q.id]);
      if (msg) errs[q.id] = msg;
    }
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onSubmit?.({ answers });
    }
  };

  if (!schema || !schema.sections?.length) {
    return <div className="opacity-70">No sections/questions yet.</div>;
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {schema.sections.map((sec) => (
        <div key={sec.id} className="rounded-md border border-gray-700 p-4">
          <div className="text-lg font-semibold">{sec.title}</div>
          {sec.description && (
            <div className="text-sm opacity-70 mt-1">{sec.description}</div>
          )}
          <div className="mt-4 space-y-4">
            {sec.questions.filter(q => isQuestionVisible(q, answers, questionsById)).map((q) => (
              <div key={q.id} className="space-y-2">
                <Label htmlFor={q.id}>
                  {q.label} {q.required && <span className="text-red-400">*</span>}
                </Label>
                {q.description && (
                  <div className="text-xs opacity-70">{q.description}</div>
                )}
                {q.type === 'short' && (
                  <Input
                    id={q.id}
                    value={answers[q.id] ?? ''}
                    maxLength={q.maxLength ?? undefined}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder={q.maxLength ? `Max ${q.maxLength} chars` : 'Your answer'}
                  />
                )}
                {q.type === 'long' && (
                  <Textarea
                    id={q.id}
                    value={answers[q.id] ?? ''}
                    maxLength={q.maxLength ?? undefined}
                    onChange={(e) => updateAnswer(q.id, e.target.value)}
                    placeholder={q.maxLength ? `Max ${q.maxLength} chars` : 'Your answer'}
                  />
                )}
                {q.type === 'number' && (
                  <NumberField q={q} value={answers[q.id]} onChange={(v) => updateAnswer(q.id, v)} />
                )}
                {q.type === 'single' && (
                  <SingleChoice q={q} value={answers[q.id]} onChange={(v) => updateAnswer(q.id, v)} />
                )}
                {q.type === 'multi' && (
                  <MultiChoice q={q} value={answers[q.id]} onChange={(v) => updateAnswer(q.id, v)} />
                )}
                {q.type === 'file' && (
                  <FileStub value={answers[q.id]} onChange={(v) => updateAnswer(q.id, v)} />
                )}
                {errors[q.id] && <div className="text-xs text-red-400">{errors[q.id]}</div>}
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-2">
        <Button type="submit" variant="blue">Submit</Button>
      </div>
    </form>
  );
}
