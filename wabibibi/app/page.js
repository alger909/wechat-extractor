'use client';
import { useState } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const extractText = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/extract', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });
      
      const data = await response.json();
      if (data.error) {
        alert(data.error);
        return;
      }
      
      setContent(data.content.join('\n\n'));
    } catch (error) {
      alert('提取失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板！');
  };

  return (
    <main className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">微信文章提取器</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="粘贴微信文章链接"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={extractText}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? '提取中...' : '提取'}
        </button>
      </div>

      {content && (
        <div className="mt-4">
          <div className="p-4 border rounded bg-gray-50 min-h-[200px] whitespace-pre-wrap">
            {content}
          </div>
          <button
            onClick={copyToClipboard}
            className="mt-4 px-4 py-2 bg-green-500 text-white rounded"
          >
            复制文本
          </button>
        </div>
      )}
    </main>
  );
}
