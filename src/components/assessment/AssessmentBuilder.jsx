/* eslint-disable react/prop-types */
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { newSection, newQuestion, questionTypes } from '@/lib/assessment-schema';

export default function AssessmentBuilder({ value, onChange }) {
  const addSection = () => {
    onChange({ sections: [...(value.sections || []), newSection()] });
  };
  const updateSection = (sid, patch) => {
    onChange({
      sections: value.sections.map((s) => (s.id === sid ? { ...s, ...patch } : s)),
    });
  };
  const removeSection = (sid) => {
    onChange({ sections: value.sections.filter((s) => s.id !== sid) });
  };

  const addQuestion = (sid, type = 'short') => {
    const q = newQuestion(type);
    onChange({
      sections: value.sections.map((s) => (s.id === sid ? { ...s, questions: [...(s.questions || []), q] } : s)),
    });
  };
  const updateQuestion = (sid, qid, patch) => {
    onChange({
      sections: value.sections.map((s) =>
        s.id === sid
          ? {
              ...s,
              questions: s.questions.map((q) => (q.id === qid ? { ...q, ...patch } : q)),
            }
          : s
      ),
    });
  };
  const removeQuestion = (sid, qid) => {
    onChange({
      sections: value.sections.map((s) =>
        s.id === sid ? { ...s, questions: s.questions.filter((q) => q.id !== qid) } : s
      ),
    });
  };

  const allQuestions = (value.sections || []).flatMap((s) => s.questions.map((q) => ({ id: q.id, label: q.label })));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">Builder</div>
        <Button variant="outline" onClick={addSection}>+ Add Section</Button>
      </div>

      {(value.sections || []).map((sec, sIdx) => (
        <div key={sec.id} className="rounded-md border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="font-medium">Section {sIdx + 1}</div>
            <Button variant="destructive" onClick={() => removeSection(sec.id)}>Remove</Button>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3">
            <div>
              <Label>Title</Label>
              <Input value={sec.title} onChange={(e) => updateSection(sec.id, { title: e.target.value })} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={sec.description} onChange={(e) => updateSection(sec.id, { description: e.target.value })} />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between">
              <div className="font-medium">Questions</div>
              <div className="flex items-center gap-2">
                {/* Key forces remount when questions count changes so the selection resets */}
                <Select key={`${sec.id}-${(sec.questions||[]).length}`} onValueChange={(t) => addQuestion(sec.id, t)}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Add question type" />
                  </SelectTrigger>
                  <SelectContent>
                    {questionTypes.map((t) => (
                      <SelectItem key={t.key} value={t.key}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="mt-3 space-y-4">
              {(sec.questions || []).map((q, qIdx) => (
                <div key={q.id} className="rounded-md border border-gray-700 p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm opacity-80">Q{qIdx + 1} • {q.type}</div>
                    <Button variant="outline" onClick={() => removeQuestion(sec.id, q.id)}>Delete</Button>
                  </div>
                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    <div>
                      <Label>Label</Label>
                      <Input value={q.label} onChange={(e) => updateQuestion(sec.id, q.id, { label: e.target.value })} />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Input value={q.description} onChange={(e) => updateQuestion(sec.id, q.id, { description: e.target.value })} />
                    </div>
                    <div className="flex items-center gap-2">
                      <input id={`req-${q.id}`} type="checkbox" checked={!!q.required} onChange={(e) => updateQuestion(sec.id, q.id, { required: e.target.checked })} />
                      <Label htmlFor={`req-${q.id}`}>Required</Label>
                    </div>

                    {(q.type === 'short' || q.type === 'long') && (
                      <div>
                        <Label>Max Length</Label>
                        <Input type="number" value={q.maxLength ?? ''} onChange={(e) => updateQuestion(sec.id, q.id, { maxLength: e.target.value === '' ? undefined : Number(e.target.value) })} />
                      </div>
                    )}

                    {q.type === 'number' && (
                      <>
                        <div>
                          <Label>Min</Label>
                          <Input type="number" value={q.min ?? ''} onChange={(e) => updateQuestion(sec.id, q.id, { min: e.target.value === '' ? undefined : Number(e.target.value) })} />
                        </div>
                        <div>
                          <Label>Max</Label>
                          <Input type="number" value={q.max ?? ''} onChange={(e) => updateQuestion(sec.id, q.id, { max: e.target.value === '' ? undefined : Number(e.target.value) })} />
                        </div>
                      </>
                    )}

                    {(q.type === 'single' || q.type === 'multi') && (
                      <div className="md:col-span-2">
                        <Label>Options (comma separated)</Label>
                        <Input
                          value={(q.options || []).join(', ')}
                          onChange={(e) => updateQuestion(sec.id, q.id, { options: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                        />
                      </div>
                    )}

                    {/* Conditional visibility */}
                    <div className="md:col-span-2 grid md:grid-cols-4 gap-3 items-end">
                      <div>
                        <Label>Show if question</Label>
                        <Select
                          value={q.condition?.dependsOn ?? undefined}
                          onValueChange={(v) => {
                            if (v === '__none__') {
                              updateQuestion(sec.id, q.id, { condition: null });
                            } else {
                              updateQuestion(sec.id, q.id, { condition: { ...(q.condition || {}), dependsOn: v } });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="None" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {allQuestions
                              .filter((aq) => aq.id !== q.id)
                              .map((aq) => (
                                <SelectItem key={aq.id} value={aq.id}>{aq.label}</SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Operator</Label>
                        <Select
                          value={q.condition?.dependsOn ? (q.condition?.op || 'eq') : undefined}
                          onValueChange={(v) => updateQuestion(sec.id, q.id, { condition: { ...(q.condition || {}), op: v } })}
                          disabled={!q.condition?.dependsOn}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="eq">equals</SelectItem>
                            <SelectItem value="neq">not equals</SelectItem>
                            <SelectItem value="includes">includes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label>Value</Label>
                        {(() => {
                          const depQ = allQuestions.find((aq) => aq.id === q.condition?.dependsOn);
                          if (!q.condition?.dependsOn) {
                            return (
                              <Input disabled placeholder="Select a question first" />
                            );
                          }
                          if ((depQ?.type === 'single' || depQ?.type === 'multi') && Array.isArray(depQ?.options)) {
                            return (
                              <Select
                                value={q.condition?.value ?? undefined}
                                onValueChange={(v) => updateQuestion(sec.id, q.id, { condition: { ...(q.condition || {}), value: v } })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Pick an option" />
                                </SelectTrigger>
                                <SelectContent>
                                  {depQ.options.map((opt, idx) => (
                                    <SelectItem key={idx} value={opt}>{opt}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            );
                          }
                          return (
                            <Input
                              value={q.condition?.value ?? ''}
                              onChange={(e) => updateQuestion(sec.id, q.id, { condition: { ...(q.condition || {}), value: e.target.value } })}
                              placeholder={depQ?.type === 'number' ? 'Enter number to compare' : 'Enter match value'}
                            />
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
