"use client"
import React, { useState, useRef, useEffect, FormEvent, ReactNode } from 'react';
import axios from 'axios';

export default function Home() {
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string | ReactNode }[]>([{ role: 'assistant', content: "Merhaba size nasıl yardımcı olabilirim" }]);
  const [userMessage, setUserMessage] = useState('');
  const [status, setStatus] = useState(true);
  const apiKey = process.env.OPENAI_API_KEY;

  const sendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUserMessage('');
    const url = 'https://api.openai.com/v1/chat/completions';
    const messages = [
      { role: 'system', content: `Sen bir seyahat asistanısın ve kullanıcıya sorarak istediğin bilgileri esprili ve samimi bir dil kullanarak alacaksın. Emoji de kullanabilirsin. 
      Bu bilgiler kullanıcının seyahat planını oluşturman için gereklidir.  Verileri tamamladığında aşağıdaki JSON'ın doldurulmuş halini dön. Konu dışına çıkmamaya özen göster.

      {
          "arrivalLocations": [
            {
              "name": "Kalkış şehri neresi? (şehir ismi)"
            }
          ],
          "checkIn": "Hangi tarihte check-in yapmayı düşünüyorsun? (buraya gelecek tarihi YYYY-MM-DD formatında ekle)"
          "departureLocations": [
            {
              "name": "Varış noktan neresi? (şehir ismi )"
            }
          ],
          "night": "Kaç gece konaklamayı planlıyorsun? (sayı)"
          "currency": "Hangi para birimiyle ödeme yapmayı düşünüyorsun? (para biriminin kısaltmasını kullanmaya özen göster)"
        }
      }` },
      ...chatHistory,
      { role: 'user', content: userMessage },
    ];

    const body = {
      messages,
      model: 'gpt-3.5-turbo', // gpt-4
      stream: false,
    };

    try {
      setStatus(false);
      const response = await axios.post(url, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
      });
      const assistantReply = response.data.choices[0].message.content;
      setChatHistory([...chatHistory, { role: 'user', content: userMessage }, { role: 'assistant', content: assistantReply }]);
    } catch (error) {
      console.error(error);
    } finally {
      setStatus(true);
    }
  }

  const inputRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => {
    if (status) {
      inputRef.current?.focus();
    }
  }, [status]);

  return (
    <main className="flex justify-center gap-3">
      <div className="left-area">
        <div className="message-container">
          {chatHistory.map((message, index) => (
            <div key={index} className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}>
              {message.content}
            </div>
          ))}
          <div className="input-container">
            <form onSubmit={sendMessage}>
              <input
                type="text"
                ref={inputRef}
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder="Mesajınızı girin"
                className="user-input"
                disabled={!status}
              />
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
