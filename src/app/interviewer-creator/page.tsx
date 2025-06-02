"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Plus, Save } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface VAPIAgent {
  id: string;
  name: string;
  voice?: {
    model?: string;
    voiceId: string;
    provider: string;
  };
  model?: {
    model: string;
    provider: string;
    messages?: { role: string; content: string }[];
    temperature?: number;
    maxTokens?: number;
  };
  firstMessage?: string;
  firstMessageMode?: 'assistant-speaks-first' | 'assistant-waits-for-user' | 'assistant-speaks-first-with-model-generated-message';
  createdAt: string;
  updatedAt: string;
}

interface VAPIModel {
  id: string;
  name: string;
  provider: string;
  model: string;
}

interface VAPIVoice {
  id: string;
  name: string;
  provider: string;
}

export default function InterviewerCreatorPage() {
  const [agents, setAgents] = useState<VAPIAgent[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [editAgent, setEditAgent] = useState<VAPIAgent | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [models, setModels] = useState<VAPIModel[]>([]);
  const [voices, setVoices] = useState<VAPIVoice[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/agents');
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents);
          if (data.agents.length > 0) {
            setSelectedIndex(0);
            setEditAgent(data.agents[0]);
            setIsNew(false);
          }
        }
      } catch (error) {
        // handle error
      } finally {
        setIsLoading(false);
      }
    };

    const fetchModelsAndVoices = async () => {
      try {
        const modelsResponse = await fetch('/api/vapi/models');
        const voicesResponse = await fetch('/api/vapi/voices');
        if (modelsResponse.ok && voicesResponse.ok) {
          const modelsData = await modelsResponse.json();
          const voicesData = await voicesResponse.json();
          setModels(modelsData.models);
          setVoices(voicesData.voices);
        }
      } catch (error) {
        console.error('Error fetching models and voices:', error);
      }
    };

    fetchAgents();
    fetchModelsAndVoices();
  }, []);

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    setEditAgent(agents[idx]);
    setIsNew(false);
  };

  const handleFieldChange = (field: keyof VAPIAgent, value: any) => {
    setEditAgent((prev) => prev ? { ...prev, [field]: value } : null);
  };

  const getPromptFromMessages = (model?: VAPIAgent['model']) => {
    if (!model?.messages || !Array.isArray(model.messages)) return '';
    const systemMsg = model.messages.find(m => m.role === 'system');
    return systemMsg?.content || '';
  };

  const setPromptInMessages = (model: VAPIAgent['model'], prompt: string) => {
    const messages = model?.messages ? [...model.messages] : [];
    const idx = messages.findIndex(m => m.role === 'system');
    if (idx !== -1) {
      messages[idx] = { role: 'system', content: prompt };
    } else {
      messages.unshift({ role: 'system', content: prompt });
    }
    return {
      ...(model || {}),
      messages,
      provider: model?.provider ?? '',
      model: model?.model ?? '',
    };
  };

  const handleModelFieldChange = (subfield: string, value: any) => {
    setEditAgent((prev) => {
      if (!prev) return null;
      if (subfield === 'prompt') {
        const newModel = setPromptInMessages({
          provider: prev.model?.provider || '',
          model: prev.model?.model || '',
          messages: prev.model?.messages || [],
          temperature: prev.model?.temperature,
          maxTokens: prev.model?.maxTokens,
        }, value);
        return {
          ...prev,
          model: {
            ...newModel,
            provider: newModel.provider ?? '',
            model: newModel.model ?? '',
          },
        };
      }
      const newModel = {
        provider: (subfield === 'provider' ? value : prev.model?.provider) || '',
        model: (subfield === 'model' ? value : prev.model?.model) || '',
        messages: prev.model?.messages || [],
        temperature: subfield === 'temperature' ? value : prev.model?.temperature,
        maxTokens: subfield === 'maxTokens' ? value : prev.model?.maxTokens,
      };
      return {
        ...prev,
        model: {
          ...newModel,
          provider: newModel.provider ?? '',
          model: newModel.model ?? '',
        },
      };
    });
  };

  const handleNew = () => {
    setEditAgent({
      id: '',
      name: '',
      voice: { voiceId: '', provider: '' },
      model: { model: '', provider: '' },
      firstMessage: '',
      firstMessageMode: 'assistant-speaks-first',
      createdAt: '',
      updatedAt: '',
    });
    setIsNew(true);
    setSelectedIndex(-1);
  };

  const handleSave = async () => {
    if (!editAgent) return;
    try {
      const url = isNew ? '/api/vapi/assistant' : `/api/vapi/assistant`;
      const method = isNew ? 'POST' : 'PATCH';
      const payload: any = {
        name: editAgent.name,
        voice: editAgent.voice,
        model: {
          provider: editAgent.model?.provider || '',
          model: editAgent.model?.model || '',
          messages: editAgent.model?.messages || [],
          temperature: editAgent.model?.temperature,
          maxTokens: editAgent.model?.maxTokens,
        },
        firstMessage: editAgent.firstMessage,
        firstMessageMode: editAgent.firstMessageMode,
      };
      if (!isNew && editAgent.id) {
        payload.id = editAgent.id;
      }
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save agent');
      }
      const savedAgent = await response.json();
      console.log('Agent saved:', savedAgent);
      if (isNew) {
        setAgents((prev) => [...prev, savedAgent]);
      } else {
        setAgents((prev) => prev.map((a) => (a.id === savedAgent.id ? savedAgent : a)));
      }
    } catch (error) {
      console.error('Error saving agent:', error);
    }
  };

  // Filtered models and voices based on selected provider
  const filteredModels = models.filter(m => m.provider === editAgent?.model?.provider);
  const filteredVoices = voices.filter(v => v.provider === editAgent?.voice?.provider);

  return (
    <div className="container mx-auto p-6 max-w-6xl flex gap-8">
      {/* Sidebar: Agent List */}
      <div className="w-1/4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Assistants</h2>
          <Button size="sm" variant="outline" onClick={handleNew}>
            <Plus className="h-4 w-4 mr-1" /> New
          </Button>
        </div>
        <div className="bg-white border rounded-lg divide-y">
          {agents.map((agent, idx) => (
            <div
              key={agent.id || idx}
              className={`p-4 cursor-pointer hover:bg-blue-50 ${selectedIndex === idx && !isNew ? 'bg-blue-100' : ''}`}
              onClick={() => handleSelect(idx)}
            >
              <div className="font-semibold">{agent.name}</div>
              <div className="text-xs text-muted-foreground">{agent.model?.provider} {agent.model?.model}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Panel: Edit/Create Agent */}
      <div className="flex-1">
        <Card>
          <CardHeader>
            <CardTitle>{isNew ? 'Create New Assistant' : 'Edit Assistant'}</CardTitle>
            <CardDescription>
              {isNew
                ? 'Fill out the details to create a new VAPI assistant.'
                : 'Edit the details of the selected VAPI assistant.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {editAgent ? (
              <form className="space-y-4" onSubmit={e => { e.preventDefault(); handleSave(); }}>
                <div className="space-y-4">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={editAgent.name}
                      onChange={e => handleFieldChange('name', e.target.value)}
                      placeholder="Assistant Name"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Model Provider</Label>
                      <Input
                        value={editAgent?.model?.provider || ''}
                        onChange={isNew ? (e => handleModelFieldChange('provider', e.target.value)) : undefined}
                        readOnly={!isNew}
                        placeholder="Model Provider"
                      />
                    </div>
                    <div>
                      <Label>Model</Label>
                      <Input
                        value={editAgent?.model?.model || ''}
                        onChange={isNew ? (e => handleModelFieldChange('model', e.target.value)) : undefined}
                        readOnly={!isNew}
                        placeholder="Model"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Voice Provider</Label>
                      <Input
                        value={editAgent?.voice?.provider || ''}
                        onChange={isNew ? (e => handleFieldChange('voice', { ...editAgent?.voice, provider: e.target.value })) : undefined}
                        readOnly={!isNew}
                        placeholder="Voice Provider"
                      />
                    </div>
                    <div>
                      <Label>Voice ID</Label>
                      <Input
                        value={editAgent?.voice?.voiceId || ''}
                        onChange={isNew ? (e => handleFieldChange('voice', { ...editAgent?.voice, voiceId: e.target.value })) : undefined}
                        readOnly={!isNew}
                        placeholder="Voice ID"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>First Message</Label>
                    <Textarea
                      value={editAgent.firstMessage || ''}
                      onChange={e => handleFieldChange('firstMessage', e.target.value)}
                      placeholder="e.g. Hello! How can I help you today?"
                    />
                  </div>
                  <div>
                    <Label>First Message Mode</Label>
                    <select
                      value={editAgent.firstMessageMode || 'assistant-speaks-first'}
                      onChange={e => handleFieldChange('firstMessageMode', e.target.value as 'assistant-speaks-first' | 'assistant-waits-for-user' | 'assistant-speaks-first-with-model-generated-message')}
                      className="w-full p-2 border rounded"
                    >
                      <option value="assistant-speaks-first">Assistant Speaks First</option>
                      <option value="assistant-waits-for-user">Assistant Waits for User</option>
                      <option value="assistant-speaks-first-with-model-generated-message">Assistant Speaks First with Model Generated Message</option>
                    </select>
                  </div>
                  <div>
                    <Label>Prompt</Label>
                    <Textarea
                      value={getPromptFromMessages(editAgent?.model)}
                      onChange={e => handleModelFieldChange('prompt', e.target.value)}
                      placeholder="e.g. You are a helpful assistant."
                      className="min-h-[120px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Temperature</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={editAgent?.model?.temperature ?? 0.4}
                        onChange={e => handleModelFieldChange('temperature', Number(e.target.value))}
                        placeholder="e.g. 0.4"
                      />
                    </div>
                    <div>
                      <Label>Max Tokens</Label>
                      <Input
                        type="number"
                        value={editAgent?.model?.maxTokens ?? 250}
                        onChange={e => handleModelFieldChange('maxTokens', Number(e.target.value))}
                        placeholder="e.g. 250"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isNew ? 'Create Assistant' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            ) : (
              <div className="text-muted-foreground">Select an assistant to edit or create a new one.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 