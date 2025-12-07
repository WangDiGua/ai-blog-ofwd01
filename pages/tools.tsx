import React, { useState, useEffect } from 'react';
import { Card, Button, Modal } from '../components/ui';
import { Hash, Video as VideoIcon, ArrowRightLeft, Copy, RefreshCw, Type, AlertCircle, Clock } from 'lucide-react';

const JsonTool = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [error, setError] = useState('');

    const format = () => {
        try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed, null, 2));
            setError('');
        } catch (e) {
            setError('无效的 JSON 格式');
            setOutput('');
        }
    };

    const compress = () => {
         try {
            const parsed = JSON.parse(input);
            setOutput(JSON.stringify(parsed));
            setError('');
        } catch (e) {
            setError('无效的 JSON 格式');
            setOutput('');
        }
    };

    return (
        <div className="space-y-4 h-full flex flex-col">
            <textarea 
                className="w-full h-32 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none text-apple-text dark:text-apple-dark-text"
                placeholder="在此粘贴 JSON..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <div className="flex space-x-2">
                <Button size="sm" onClick={format}>美化</Button>
                <Button size="sm" variant="secondary" onClick={compress}>压缩</Button>
                <Button size="sm" variant="secondary" onClick={() => {setInput(''); setOutput(''); setError('');}}>清空</Button>
            </div>
            {error && <div className="text-red-500 text-xs flex items-center"><AlertCircle size={12} className="mr-1"/>{error}</div>}
            <div className="flex-1 relative">
                <textarea 
                    readOnly
                    className="w-full h-full p-3 bg-gray-900 text-green-400 rounded-lg text-xs font-mono border-none outline-none"
                    value={output}
                    placeholder="结果将显示在这里..."
                />
                {output && (
                    <button 
                        onClick={() => navigator.clipboard.writeText(output)}
                        className="absolute top-2 right-2 p-1.5 bg-gray-800 rounded text-gray-400 hover:text-white"
                        title="复制"
                    >
                        <Copy size={14}/>
                    </button>
                )}
            </div>
        </div>
    );
};

const TimeTool = () => {
    const [now, setNow] = useState(Math.floor(Date.now() / 1000));
    const [tsInput, setTsInput] = useState('');
    const [dateResult, setDateResult] = useState('');
    const [dateInput, setDateInput] = useState('');
    const [tsResult, setTsResult] = useState('');

    useEffect(() => {
        const timer = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
        return () => clearInterval(timer);
    }, []);

    const convertTs = () => {
        if (!tsInput) return;
        const ts = parseInt(tsInput);
        const date = new Date(ts < 10000000000 ? ts * 1000 : ts);
        setDateResult(date.toLocaleString());
    };

    const convertDate = () => {
        if (!dateInput) return;
        const ts = new Date(dateInput).getTime();
        setTsResult(isNaN(ts) ? '无效日期' : Math.floor(ts / 1000).toString());
    };

    return (
        <div className="space-y-6">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                <div className="text-xs text-gray-500 uppercase">当前 Unix 时间戳</div>
                <div className="text-3xl font-mono font-bold text-apple-blue mt-1">{now}</div>
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold">时间戳转日期</h4>
                <div className="flex space-x-2">
                    <input 
                        className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono"
                        placeholder="Unix 时间戳"
                        value={tsInput}
                        onChange={(e) => setTsInput(e.target.value)}
                    />
                    <Button size="sm" onClick={convertTs}>转换</Button>
                </div>
                {dateResult && <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-green-600 dark:text-green-400 font-medium">{dateResult}</div>}
            </div>

            <div className="space-y-2">
                <h4 className="text-sm font-semibold">日期转时间戳</h4>
                <div className="flex space-x-2">
                    <input 
                        type="datetime-local"
                        className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm"
                        value={dateInput}
                        onChange={(e) => setDateInput(e.target.value)}
                    />
                    <Button size="sm" onClick={convertDate}>转换</Button>
                </div>
                {tsResult && <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded text-sm text-green-600 dark:text-green-400 font-mono font-medium">{tsResult}</div>}
            </div>
        </div>
    );
};

const ColorTool = () => {
    const [color, setColor] = useState('#0071e3');
    const [hex, setHex] = useState('#0071e3');
    const [rgb, setRgb] = useState('rgb(0, 113, 227)');

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : null;
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setColor(val);
        setHex(val);
        const rgbVal = hexToRgb(val);
        if (rgbVal) setRgb(rgbVal);
    };

    const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setHex(val);
        if (/^#[0-9A-F]{6}$/i.test(val)) {
            setColor(val);
            const rgbVal = hexToRgb(val);
            if (rgbVal) setRgb(rgbVal);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4">
                 <input 
                    type="color" 
                    value={color}
                    onChange={handleColorChange}
                    className="w-20 h-20 p-1 bg-white dark:bg-gray-800 rounded-xl cursor-pointer shadow-sm border border-gray-200 dark:border-gray-700"
                 />
                 <div className="flex-1 space-y-3">
                     <div>
                         <label className="text-xs text-gray-500 block mb-1">HEX</label>
                         <div className="flex items-center">
                             <input 
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono uppercase"
                                value={hex}
                                onChange={handleHexChange}
                             />
                             <button className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500" onClick={() => navigator.clipboard.writeText(hex)}>
                                 <Copy size={16}/>
                             </button>
                         </div>
                     </div>
                     <div>
                         <label className="text-xs text-gray-500 block mb-1">RGB</label>
                         <div className="flex items-center">
                             <input 
                                className="w-full p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-sm font-mono"
                                value={rgb}
                                readOnly
                             />
                             <button className="ml-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded text-gray-500" onClick={() => navigator.clipboard.writeText(rgb)}>
                                 <Copy size={16}/>
                             </button>
                         </div>
                     </div>
                 </div>
            </div>
            <div className="p-4 rounded-xl text-white text-center font-bold shadow-inner" style={{ backgroundColor: color }}>
                预览效果 PREVIEW
            </div>
        </div>
    );
};

const Base64Tool = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState('');
    const [mode, setMode] = useState<'encode' | 'decode'>('encode');

    const process = () => {
        try {
            if (mode === 'encode') {
                setOutput(btoa(unescape(encodeURIComponent(input))));
            } else {
                setOutput(decodeURIComponent(escape(atob(input))));
            }
        } catch (e) {
            setOutput('错误：无效的输入');
        }
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex justify-center space-x-4 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg self-center">
                <button 
                    onClick={() => { setMode('encode'); setOutput(''); }} 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'encode' ? 'bg-white dark:bg-gray-700 shadow text-apple-blue' : 'text-gray-500'}`}
                >
                    编码
                </button>
                <button 
                    onClick={() => { setMode('decode'); setOutput(''); }} 
                    className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${mode === 'decode' ? 'bg-white dark:bg-gray-700 shadow text-apple-blue' : 'text-gray-500'}`}
                >
                    解码
                </button>
            </div>
            
            <textarea 
                className="flex-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-xs font-mono border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-apple-blue outline-none resize-none text-apple-text dark:text-apple-dark-text"
                placeholder={mode === 'encode' ? "输入文本..." : "输入 Base64..."}
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            
            <Button className="w-full" onClick={process}>
                <ArrowRightLeft size={16} className="mr-2"/> {mode === 'encode' ? '编码' : '解码'}
            </Button>
            
            <div className="flex-1 relative">
                <textarea 
                    readOnly
                    className="w-full h-full p-3 bg-gray-100 dark:bg-gray-900 rounded-lg text-xs font-mono border-none outline-none resize-none text-apple-text dark:text-apple-dark-text"
                    value={output}
                    placeholder="结果..."
                />
                 {output && (
                    <button 
                        onClick={() => navigator.clipboard.writeText(output)}
                        className="absolute top-2 right-2 p-1.5 bg-white dark:bg-gray-800 rounded shadow text-gray-400 hover:text-apple-blue"
                        title="复制"
                    >
                        <Copy size={14}/>
                    </button>
                )}
            </div>
        </div>
    );
};

const LoremTool = () => {
    const [count, setCount] = useState(3);
    const [text, setText] = useState('');

    const generate = () => {
        const sentences = [
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
            "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
            "The quick brown fox jumps over the lazy dog.",
            "Pack my box with five dozen liquor jugs."
        ];
        
        let result = [];
        for(let i=0; i<count; i++) {
            const numSentences = Math.floor(Math.random() * 4) + 3;
            let paragraph = "";
            for(let j=0; j<numSentences; j++) {
                paragraph += sentences[Math.floor(Math.random() * sentences.length)] + " ";
            }
            result.push(paragraph.trim());
        }
        setText(result.join('\n\n'));
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex items-center space-x-4">
                <span className="text-sm font-medium">段落数: {count}</span>
                <input 
                    type="range" min="1" max="10" 
                    value={count} onChange={(e) => setCount(parseInt(e.target.value))}
                    className="flex-1 accent-apple-blue"
                />
                <Button size="sm" onClick={generate}>生成</Button>
            </div>
            <textarea 
                readOnly
                className="flex-1 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm leading-relaxed border border-gray-200 dark:border-gray-700 resize-none text-apple-text dark:text-apple-dark-text"
                value={text}
                placeholder="点击生成以获取文本..."
            />
            {text && (
                <Button variant="secondary" onClick={() => navigator.clipboard.writeText(text)}>
                    <Copy size={16} className="mr-2"/> 复制全部
                </Button>
            )}
        </div>
    );
};

const DiffTool = () => {
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [diffResult, setDiffResult] = useState<React.ReactNode[] | null>(null);

    const checkDiff = () => {
        const oldLines = oldText.split('\n');
        const newLines = newText.split('\n');
        const result: React.ReactNode[] = [];
        
        const maxLines = Math.max(oldLines.length, newLines.length);

        for (let i = 0; i < maxLines; i++) {
            const oldL = oldLines[i] || '';
            const newL = newLines[i] || '';

            if (oldL === newL) {
                result.push(
                    <div key={i} className="flex text-xs font-mono text-gray-500 dark:text-gray-400 px-2 py-0.5">
                        <span className="w-8 text-right mr-4 select-none opacity-50">{i+1}</span>
                        <span>{oldL}</span>
                    </div>
                );
            } else {
                if (oldL) {
                    result.push(
                        <div key={`d-${i}`} className="flex text-xs font-mono bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 px-2 py-0.5">
                            <span className="w-8 text-right mr-4 select-none opacity-50">-</span>
                            <span>{oldL}</span>
                        </div>
                    );
                }
                if (newL) {
                    result.push(
                        <div key={`a-${i}`} className="flex text-xs font-mono bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5">
                            <span className="w-8 text-right mr-4 select-none opacity-50">+</span>
                            <span>{newL}</span>
                        </div>
                    );
                }
            }
        }
        setDiffResult(result);
    };

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex space-x-4 h-1/3">
                <textarea 
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono resize-none text-apple-text dark:text-apple-dark-text"
                    placeholder="原文..."
                    value={oldText}
                    onChange={(e) => setOldText(e.target.value)}
                />
                <textarea 
                    className="flex-1 p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-xs font-mono resize-none text-apple-text dark:text-apple-dark-text"
                    placeholder="新文..."
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                />
            </div>
            <Button size="sm" onClick={checkDiff}>对比差异</Button>
            <div className="flex-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg overflow-y-auto p-2">
                {diffResult || <div className="text-center text-gray-400 text-sm mt-10">输入文本并点击对比</div>}
            </div>
        </div>
    );
};

export const Tools = () => {
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const tools = [
       { id: 'json', name: 'JSON 格式化', desc: '美化或压缩 JSON 数据', icon: Hash, component: <JsonTool /> },
       { id: 'time', name: '时间戳转换', desc: '转换 Unix 时间戳', icon: Clock, component: <TimeTool /> },
       { id: 'color', name: '颜色提取器', desc: 'Hex/RGB 转换与预览', icon: VideoIcon, component: <ColorTool /> },
       { id: 'base64', name: 'Base64 编码', desc: '编码和解码 Base64', icon: ArrowRightLeft, component: <Base64Tool /> },
       { id: 'lorem', name: 'Lorem Ipsum', desc: '生成随机占位文本', icon: Type, component: <LoremTool /> },
       { id: 'diff', name: 'Diff 检查器', desc: '比较文本差异', icon: RefreshCw, component: <DiffTool /> }
  ];

  const currentTool = tools.find(t => t.id === activeTool);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-10 mb-20">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8 text-apple-text dark:text-apple-dark-text">开发者工具</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
         {tools.map(tool => (
           <Card 
                key={tool.id} 
                hover 
                onClick={() => setActiveTool(tool.id)}
                className="p-6 flex flex-col items-center justify-center text-center h-40 md:h-48 cursor-pointer border-dashed border-2 border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:border-apple-blue dark:hover:border-apple-blue transition-colors"
           >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm mb-4 flex items-center justify-center text-apple-blue">
                 <tool.icon size={20} />
              </div>
              <h3 className="font-semibold text-sm md:text-base text-apple-text dark:text-apple-dark-text">{tool.name}</h3>
              <p className="text-xs text-gray-400 mt-2">{tool.desc}</p>
           </Card>
         ))}
      </div>

      <Modal 
        isOpen={!!activeTool} 
        onClose={() => setActiveTool(null)} 
        title={currentTool?.name}
        className="max-w-3xl h-[80vh] flex flex-col"
      >
          <div className="flex-1 overflow-hidden pt-2">
            {currentTool?.component}
          </div>
      </Modal>
    </div>
  );
};