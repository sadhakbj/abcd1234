"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Mic, Send, Square } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "user" | "bot";
  content: string;
};

interface ChatInterfaceProps {
  onSendMessage: (msg: string) => void;
  messages: Message[];
  isThinking: boolean;
}

export function ChatInterface({ onSendMessage, messages, isThinking }: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo(0, scrollRef.current.scrollHeight);
    }
  }, [messages, isThinking]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (inputValue.trim() === "" || isThinking) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  const toggleRecording = async () => {
    if (isRecording) {
      // Stop recording
      setIsRecording(false);
      setIsProcessingVoice(true);
      
      // Mock transcription processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setIsProcessingVoice(false);
      // Mocked transcribed text for the specific test case
      const transcribedText = "I just moved to Kita-ku from Suginami, what should I do next?";
      setInputValue(transcribedText);
      // Auto send or let user review? Let's just put it in the input so they can review and hit send,
      // or we can auto-send. The user asked to "let users ask the question via voice rather than typing".
      // Let's auto-send to make it seamless.
      onSendMessage(transcribedText);
      setInputValue("");
    } else {
      // Start recording
      setIsRecording(true);
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-3xl mx-auto space-y-4">
      <Card className="flex-1 p-4 shadow-xl border-slate-100 flex flex-col bg-slate-50/50 relative overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollRef}>
          <div className="space-y-4 pb-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex w-full ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3 shadow-sm ${
                    message.role === "user"
                      ? "bg-blue-600 text-white rounded-br-sm"
                      : "bg-white text-slate-800 border border-slate-100 rounded-bl-sm"
                  }`}
                >
                  <p className="text-lg leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isThinking && (
              <div className="flex w-full justify-start">
                <div className="bg-white text-slate-500 border border-slate-100 rounded-2xl rounded-bl-sm px-5 py-4 shadow-sm flex items-center space-x-2">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        {/* Full screen recording overlay */}
        {isRecording && (
          <div className="absolute inset-0 z-10 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center animate-in fade-in duration-300">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 tracking-tight">Listening...</h3>
            
            {/* Visualizer rings */}
            <div className="relative flex items-center justify-center mb-12">
              <div className="absolute w-48 h-48 bg-red-100 rounded-full animate-ping opacity-75"></div>
              <div className="absolute w-36 h-36 bg-red-200 rounded-full animate-ping opacity-75" style={{ animationDelay: "0.2s" }}></div>
              <div className="absolute w-24 h-24 bg-red-300 rounded-full animate-pulse"></div>
              
              <div className="relative z-10 w-24 h-24 bg-red-500 rounded-full flex items-center justify-center shadow-xl shadow-red-500/30">
                <Mic className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>
            
            <p className="text-slate-500 text-lg mb-8">Speak clearly into the tablet</p>
            
            <Button 
              onClick={toggleRecording}
              size="lg"
              variant="destructive"
              className="px-8 py-6 rounded-full shadow-lg text-lg flex items-center gap-3 hover:scale-105 transition-transform"
            >
              <Square className="w-5 h-5 fill-current" />
              Stop Recording
            </Button>
          </div>
        )}
      </Card>
      
      <div className="flex gap-3 items-center bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
        <form onSubmit={handleSubmit} className="flex-1 flex">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your question or use voice..."
            className="flex-1 text-lg py-6 px-5 border-none shadow-none focus-visible:ring-0 bg-transparent"
            disabled={isThinking || isProcessingVoice}
          />
        </form>

        {/* Dynamic Action Button */}
        <div className="shrink-0 flex items-center justify-center pr-2">
          {inputValue.trim() ? (
            <Button 
              onClick={(e) => { e.preventDefault(); handleSubmit(); }}
              disabled={isThinking || isProcessingVoice}
              size="icon"
              className="h-12 w-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:scale-105"
            >
              <Send className="w-5 h-5 -ml-1" />
            </Button>
          ) : (
            <Button 
              onClick={toggleRecording}
              disabled={isThinking || isProcessingVoice}
              size="icon"
              className={`h-14 w-14 rounded-full shadow-md transition-all hover:scale-105 ${
                isProcessingVoice ? "bg-slate-200" : "bg-red-500 hover:bg-red-600"
              }`}
            >
              {isProcessingVoice ? (
                <Loader2 className="w-6 h-6 text-slate-600 animate-spin" />
              ) : (
                <Mic className="w-6 h-6 text-white" />
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
