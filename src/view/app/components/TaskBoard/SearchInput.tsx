import * as React from 'react';

interface Props {
  style?: object;
  placeholder?: string;
  delayTime?: number;
  onChange?: (value: string) => void;
}

export default function ({ style, placeholder = 'Search', delayTime = 200, onChange }: Props) {
  const [timeoutId, setTimeoutId] = React.useState(null);
  const [value, setValue] = React.useState('');
  const inputRef: React.RefObject<HTMLInputElement> = React.useRef(null);
  const allStyle = {
    padding: '4px 3px',
    backgroundColor: 'var(--vscode-tab-background)',
    color: 'var(--button-text-color)',
    border: '1px solid var(--vscode-tab-inactiveBackground)',
    ...style
  };
  const resetTimer = () =>
    setTimeout(() => {
      clearTimeout(timeoutId);
      setTimeoutId(null);
      if (onChange) {
        onChange(inputRef.current.value);
      }
    }, delayTime);

  return (
    <input
      autoFocus
      ref={inputRef}
      placeholder={placeholder}
      defaultValue={value}
      onChange={ev => {
        setValue(ev.target.value);
        if (timeoutId) {
          clearTimeout(timeoutId);
          setTimeoutId(null);
        }
        const id = resetTimer();
        setTimeoutId(id);
      }}
      style={{ ...allStyle }}
    />
  );
}
