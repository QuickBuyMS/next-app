'use client';

/**
 * IntentMatchmaker — AI Search Bar
 *
 * Renders the chat input + AI response text.
 * When AI returns products via tool output, calls `onProductsFound(products)` so the
 * parent can display them in the existing product grid layout (ProductCard / products-grid).
 */

import { useChat } from '@ai-sdk/react';
import { useEffect, useState, useCallback } from 'react';
import { FiSearch, FiX, FiZap } from 'react-icons/fi';

export default function IntentMatchmaker({ onProductsFound, onReset }) {
  const [inputText, setInputText] = useState('');
  const [lastQuery, setLastQuery]   = useState('');

  const { messages = [], status, error, sendMessage } = useChat({
    api: '/api/chat',
    onError: (err) => {
      console.error('[IntentMatchmaker] Chat error:', err);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';
  const hasQuery  = Boolean(lastQuery);

  const getMessageText = (m) => {
    if (Array.isArray(m.parts)) {
      const t = m.parts.filter(p => p.type === 'text').map(p => p.text).join('\n').trim();
      if (t) return t;
    }
    if (typeof m.content === 'string') return m.content;
    return '';
  };

  const extractProductsFromMessage = useCallback((m) => {
    const map = new Map();

    const add = (p) => {
      if (!p || typeof p !== 'object') return;
      const id = String(p.product_id || p.id || p.name || Math.random());
      if (!map.has(id)) map.set(id, p);
    };

    const tryResult = (result) => {
      if (!result) return;
      if (Array.isArray(result))          { result.forEach(add); return; }
      if (Array.isArray(result.products)) { result.products.forEach(add); return; }
      if (Array.isArray(result.data))     { result.data.forEach(add); return; }
    };

    if (Array.isArray(m.parts)) {
      m.parts.forEach(part => {
        if (!part?.type) return;
        if (part.type.startsWith('tool-') && part.type !== 'tool-invocation') {
          tryResult(part.output);
        }
        if (part.type === 'tool-invocation' && part.toolInvocation) {
          tryResult(part.toolInvocation.output || part.toolInvocation.result);
        }
      });
    }
    if (Array.isArray(m.toolInvocations)) {
      m.toolInvocations.forEach(inv => tryResult(inv.output || inv.result));
    }

    return Array.from(map.values());
  }, []);

  useEffect(() => {
    if (!onProductsFound) return;
    const assistantMsgs = messages.filter(m => m.role === 'assistant');
    if (assistantMsgs.length === 0) return;

    const lastAssistant = assistantMsgs[assistantMsgs.length - 1];
    const products = extractProductsFromMessage(lastAssistant);
    onProductsFound(products);
  }, [messages, onProductsFound, extractProductsFromMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputText.trim();
    if (!q || isLoading) return;
    setLastQuery(q);
    setInputText('');
    sendMessage({ text: q });
  };

  const handleClear = () => {
    setLastQuery('');
    setInputText('');
    onReset?.();
  };

  const lastAssistantText = (() => {
    const assistantMsgs = messages.filter(m => m.role === 'assistant');
    if (assistantMsgs.length === 0) return '';
    return getMessageText(assistantMsgs[assistantMsgs.length - 1]);
  })();

  return (
    <div className="intent-matchmaker" id="ai-search-bar">
      <form className="intent-matchmaker__form" onSubmit={handleSubmit}>
        <div className="intent-matchmaker__input-wrap">
          <FiZap className="intent-matchmaker__zap-icon" size={18} />
          <input
            type="text"
            className="intent-matchmaker__input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask AI: 'black camera', 'gaming laptop under ₹70k', 'office chair'…"
            disabled={isLoading}
            aria-label="AI product search"
            id="ai-search-input"
          />
          {hasQuery && !isLoading && (
            <button
              type="button"
              className="intent-matchmaker__clear-btn"
              onClick={handleClear}
              aria-label="Clear AI search"
            >
              <FiX size={16} />
            </button>
          )}
          <button
            type="submit"
            className="intent-matchmaker__submit-btn"
            disabled={isLoading || !inputText.trim()}
            aria-label="Search with AI"
          >
            {isLoading ? (
              <span className="intent-matchmaker__spinner" />
            ) : (
              <FiSearch size={16} />
            )}
            <span>{isLoading ? 'Searching…' : 'AI Search'}</span>
          </button>
        </div>
      </form>

      {(isLoading || lastAssistantText || error) && (
        <div className="intent-matchmaker__reply">
          {isLoading && (
            <span className="intent-matchmaker__reply-loading">
              <span className="intent-matchmaker__dot" />
              <span className="intent-matchmaker__dot" />
              <span className="intent-matchmaker__dot" />
              Quix is searching the catalog…
            </span>
          )}
          {!isLoading && error && (
            <span className="intent-matchmaker__reply-error">
              ⚠️ {error.message || 'Something went wrong. Please try again.'}
            </span>
          )}
          {!isLoading && lastAssistantText && !error && (
            <span className="intent-matchmaker__reply-text">
              <strong>Quix:</strong> {lastAssistantText}
            </span>
          )}
        </div>
      )}

      {hasQuery && !isLoading && (
        <div className="intent-matchmaker__active-badge">
          <FiZap size={12} />
          <span>AI results for &ldquo;{lastQuery}&rdquo;</span>
          <button onClick={handleClear} aria-label="Clear AI filter">
            <FiX size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
