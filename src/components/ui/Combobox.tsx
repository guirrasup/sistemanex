// src/components/ui/Combobox.tsx
// Autocomplete genérico: o próprio campo de edição é a busca — sem input
// extra ao lado/embaixo. Teclado: ↓/↑ navega as sugestões, Enter confirma a
// destacada, Esc fecha. Clique nas sugestões também funciona (onMouseDown,
// não onClick, pra disparar antes do blur do input fechar a lista).
// Acessibilidade: padrão WAI-ARIA "combobox com listbox" — o foco fica no
// input e a opção destacada é anunciada via aria-activedescendant.
import React, { useState, useRef, useEffect, useId } from 'react';

interface ComboboxProps<T> {
  value: string;
  onInputChange: (texto: string) => void;
  onSelect: (item: T) => void;
  options: T[];
  getKey: (item: T) => string;
  renderOption: (item: T, destacado: boolean) => React.ReactNode;
  inputClassName: string;
  placeholder?: string;
  emptyMessage?: string;
  maxResults?: number;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export function Combobox<T>({
  value,
  onInputChange,
  onSelect,
  options,
  getKey,
  renderOption,
  inputClassName,
  placeholder,
  emptyMessage,
  maxResults = 30,
  inputProps,
}: ComboboxProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const optionId = (i: number) => `${listboxId}-opcao-${i}`;

  const visibleOptions = options.slice(0, maxResults);

  useEffect(() => {
    setHighlightIndex(0);
  }, [options]);

  useEffect(() => {
    const el = listRef.current?.children[highlightIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex]);

  const showPanel = isOpen && (visibleOptions.length > 0 || !!emptyMessage);
  const opcaoAtiva = showPanel && visibleOptions[highlightIndex] ? optionId(highlightIndex) : undefined;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      setHighlightIndex((i) => Math.min(i + 1, visibleOptions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      const item = visibleOptions[highlightIndex];
      if (isOpen && item) {
        e.preventDefault();
        onSelect(item);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => {
          onInputChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (value.trim()) setIsOpen(true);
        }}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-activedescendant={opcaoAtiva}
        {...inputProps}
      />
      {showPanel && (
        <div
          ref={listRef}
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg p-1.5 max-h-56 overflow-y-auto space-y-1 z-30 shadow-lg"
        >
          {visibleOptions.length === 0 ? (
            <div className="text-xs text-slate-500 p-2 text-center" role="status">{emptyMessage}</div>
          ) : (
            visibleOptions.map((item, i) => (
              <div
                key={getKey(item)}
                id={optionId(i)}
                role="option"
                aria-selected={i === highlightIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  onSelect(item);
                  setIsOpen(false);
                }}
                onMouseEnter={() => setHighlightIndex(i)}
              >
                {renderOption(item, i === highlightIndex)}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
