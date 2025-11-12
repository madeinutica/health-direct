import { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, MapPin, Shield, Clock } from 'lucide-react';
import { useLocation } from 'wouter';
import TabBar from '@/components/TabBar';
import ProviderCard from '@/components/ProviderCard';
import { processProviders } from '@/lib/dataUtils';
import type { HealthcareData, ProcessedProvider } from '@/lib/types';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  options?: string[];
  providers?: ProcessedProvider[];
}

interface ConversationState {
  step: 'greeting' | 'symptoms' | 'insurance' | 'location' | 'urgency' | 'results';
  symptoms?: string;
  insurance?: string;
  location?: string;
  urgency?: string;
}

export default function AssistantPage() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>({ step: 'greeting' });
  const [allProviders, setAllProviders] = useState<ProcessedProvider[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load provider data
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then((jsonData: HealthcareData) => {
        const processed = processProviders(jsonData.containsPlace);
        setAllProviders(processed);
      })
      .catch(err => console.error('Error loading data:', err));
  }, []);

  // Initial greeting
  useEffect(() => {
    if (messages.length === 0) {
      setTimeout(() => {
        addAssistantMessage(
          "👋 Hi! I'm your AI Healthcare Assistant. I'll help you find the right healthcare provider based on your needs.\n\nWhat brings you here today?",
          [
            "I need urgent care",
            "Looking for a specialist",
            "Routine checkup",
            "Mental health support"
          ]
        );
      }, 500);
    }
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addAssistantMessage = (content: string, options?: string[], providers?: ProcessedProvider[]) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content,
        options,
        providers
      }]);
      setIsTyping(false);
    }, 800);
  };

  const addUserMessage = (content: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content
    }]);
  };

  const handleOptionClick = (option: string) => {
    addUserMessage(option);
    processResponse(option);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    addUserMessage(inputValue);
    processResponse(inputValue);
    setInputValue('');
  };

  const processResponse = (response: string) => {
    const lowerResponse = response.toLowerCase();

    switch (conversationState.step) {
      case 'greeting':
        setConversationState({ ...conversationState, step: 'symptoms', symptoms: response });
        
        // Ask about insurance
        setTimeout(() => {
          addAssistantMessage(
            "Got it! To help you find in-network providers, what insurance do you have?",
            [
              "Excellus BCBS",
              "Fidelis Care",
              "MVP Health Care",
              "Medicaid",
              "Medicare",
              "No insurance"
            ]
          );
        }, 1000);
        break;

      case 'symptoms':
        setConversationState({ ...conversationState, step: 'insurance', insurance: response });
        
        // Ask about location
        setTimeout(() => {
          addAssistantMessage(
            "Perfect! Where would you prefer to receive care?",
            [
              "Utica",
              "Rome",
              "Oneida",
              "New Hartford",
              "Anywhere in Oneida County"
            ]
          );
        }, 1000);
        break;

      case 'insurance':
        setConversationState({ ...conversationState, step: 'location', location: response });
        
        // Ask about urgency
        setTimeout(() => {
          addAssistantMessage(
            "When do you need to be seen?",
            [
              "Emergency - Right now",
              "Urgent - Today or tomorrow",
              "Soon - Within a week",
              "Routine - Flexible timing"
            ]
          );
        }, 1000);
        break;

      case 'location':
        setConversationState({ ...conversationState, step: 'urgency', urgency: response });
        
        // Process and show results
        setTimeout(() => {
          const matchedProviders = findMatchingProviders({
            ...conversationState,
            location: conversationState.location!,
            urgency: response
          });
          
          const urgencyLevel = lowerResponse.includes('emergency') ? 'emergency' : 
                               lowerResponse.includes('urgent') ? 'urgent' : 'routine';
          
          let explanation = '';
          if (urgencyLevel === 'emergency') {
            explanation = "🚨 For emergency care, I recommend calling 911 or visiting these emergency rooms immediately:";
          } else if (urgencyLevel === 'urgent') {
            explanation = "⚡ Based on your needs, here are urgent care facilities and providers who can see you quickly:";
          } else {
            explanation = "✨ Great! Here are the best matches for your needs:";
          }
          
          addAssistantMessage(
            explanation,
            undefined,
            matchedProviders.slice(0, 5)
          );
          
          setConversationState({ ...conversationState, step: 'results' });
        }, 1000);
        break;

      case 'results':
        // Allow restart
        setConversationState({ step: 'greeting' });
        setTimeout(() => {
          addAssistantMessage(
            "Would you like to search for another provider?",
            ["Yes, start over", "No, I'm all set"]
          );
        }, 1000);
        break;
    }
  };

  const findMatchingProviders = (state: ConversationState): ProcessedProvider[] => {
    let filtered = [...allProviders];
    const symptoms = state.symptoms?.toLowerCase() || '';
    const insurance = state.insurance?.toLowerCase() || '';
    const location = state.location?.toLowerCase() || '';
    const urgency = state.urgency?.toLowerCase() || '';

    // Filter by urgency
    if (urgency.includes('emergency')) {
      filtered = filtered.filter(p => 
        p.category === 'Hospital' || 
        p.specialties.some(s => s.toLowerCase().includes('emergency'))
      );
    } else if (urgency.includes('urgent')) {
      filtered = filtered.filter(p => 
        p.category === 'Urgent Care' || 
        p.category === 'Hospital'
      );
    }

    // Filter by symptoms/need
    if (symptoms.includes('mental') || symptoms.includes('crisis')) {
      filtered = filtered.filter(p => 
        p.category === 'Mental Health' ||
        p.specialties.some(s => s.toLowerCase().includes('mental') || s.toLowerCase().includes('behavioral'))
      );
    } else if (symptoms.includes('specialist')) {
      filtered = filtered.filter(p => 
        p.category !== 'Hospital' && 
        p.category !== 'Urgent Care' &&
        p.category !== 'Primary Care'
      );
    } else if (symptoms.includes('routine') || symptoms.includes('checkup')) {
      filtered = filtered.filter(p => p.category === 'Primary Care');
    }

    // Filter by location
    if (location && !location.includes('anywhere')) {
      filtered = filtered.filter(p => 
        p.location.toLowerCase().includes(location)
      );
    }

    // Filter by insurance
    if (insurance && !insurance.includes('no insurance')) {
      filtered = filtered.filter(p => {
        if (!p.acceptsInsurance) return false;
        const insuranceLower = insurance.toLowerCase();
        return p.acceptsInsurance.some((ins: string) => 
          ins.toLowerCase().includes(insuranceLower) ||
          (insuranceLower.includes('medicaid') && p.acceptsMedicaid) ||
          (insuranceLower.includes('medicare') && p.acceptsMedicare)
        );
      });
    }

    // Sort by relevance (hospitals first for emergencies, etc.)
    filtered.sort((a, b) => {
      if (urgency.includes('emergency')) {
        if (a.category === 'Hospital' && b.category !== 'Hospital') return -1;
        if (a.category !== 'Hospital' && b.category === 'Hospital') return 1;
      }
      return 0;
    });

    return filtered;
  };

  const handleQuickAction = (action: string) => {
    addUserMessage(action);
    setConversationState({ step: 'greeting', symptoms: action });
    
    setTimeout(() => {
      addAssistantMessage(
        "Got it! To help you find in-network providers, what insurance do you have?",
        [
          "Excellus BCBS",
          "Fidelis Care",
          "MVP Health Care",
          "Medicaid",
          "Medicare",
          "No insurance"
        ]
      );
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background pb-tab-safe flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 text-white sticky top-0 z-40 safe-top shadow-lg">
        <div className="container py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                AI Healthcare Assistant
              </h1>
              <p className="text-sm text-white/80">
                Smart provider matching
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="container py-4">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleQuickAction("I need urgent care")}
              className="bg-card p-4 rounded-xl border border-border text-left hover:border-primary transition-all shadow-sm"
            >
              <Clock className="w-6 h-6 text-primary mb-2" />
              <div className="text-sm font-semibold text-foreground">Urgent Care</div>
              <div className="text-xs text-muted-foreground">Need care today</div>
            </button>
            <button
              onClick={() => handleQuickAction("Looking for a specialist")}
              className="bg-card p-4 rounded-xl border border-border text-left hover:border-primary transition-all shadow-sm"
            >
              <Shield className="w-6 h-6 text-primary mb-2" />
              <div className="text-sm font-semibold text-foreground">Specialist</div>
              <div className="text-xs text-muted-foreground">Expert care</div>
            </button>
            <button
              onClick={() => handleQuickAction("Routine checkup")}
              className="bg-card p-4 rounded-xl border border-border text-left hover:border-primary transition-all shadow-sm"
            >
              <MapPin className="w-6 h-6 text-primary mb-2" />
              <div className="text-sm font-semibold text-foreground">Primary Care</div>
              <div className="text-xs text-muted-foreground">Routine visit</div>
            </button>
            <button
              onClick={() => handleQuickAction("Mental health support")}
              className="bg-card p-4 rounded-xl border border-border text-left hover:border-primary transition-all shadow-sm"
            >
              <Sparkles className="w-6 h-6 text-primary mb-2" />
              <div className="text-sm font-semibold text-foreground">Mental Health</div>
              <div className="text-xs text-muted-foreground">Support & care</div>
            </button>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="container py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              {/* Message bubble */}
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-card border border-border text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>

              {/* Options */}
              {message.options && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {message.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionClick(option)}
                      className="bg-card border border-primary/30 text-primary px-4 py-2 rounded-full text-sm font-medium hover:bg-primary/10 transition-all"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}

              {/* Provider results */}
              {message.providers && message.providers.length > 0 && (
                <div className="mt-4 space-y-3">
                  {message.providers.map((provider) => (
                    <ProviderCard key={provider.id} provider={provider} />
                  ))}
                  {message.providers.length === 0 && (
                    <div className="bg-card rounded-xl p-6 border border-border text-center">
                      <p className="text-muted-foreground">
                        No providers found matching your criteria. Try adjusting your preferences.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-card border border-border rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card safe-bottom">
        <form onSubmit={handleSubmit} className="container py-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 bg-background border border-border rounded-2xl text-body focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </form>
      </div>

      {/* Tab Bar */}
      <TabBar />
    </div>
  );
}
