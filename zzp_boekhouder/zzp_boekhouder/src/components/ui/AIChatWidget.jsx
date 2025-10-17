import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

const AIChatWidget = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef?.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Context-aware suggestions based on current page
  const getContextualSuggestions = () => {
    const currentPath = location?.pathname;
    
    switch (currentPath) {
      case '/dashboard':
        return [
          'Toon mijn financiële overzicht van deze maand',
          'Welke facturen zijn nog niet betaald?',
          'Wat zijn mijn belangrijkste KPI\'s?'
        ];
      case '/client-management':
        return [
          'Hoe voeg ik een nieuwe klant toe?',
          'Toon klanten met openstaande facturen',
          'Wat zijn de contactgegevens van klant X?'
        ];
      case '/invoice-creation':
        return [
          'Maak een factuur voor klant X',
          'Wat is het juiste BTW-tarief voor diensten?',
          'Hoe stel ik automatische herinneringen in?'
        ];
      case '/time-tracking':
        return [
          'Hoeveel uren heb ik deze week gewerkt?',
          'Start een timer voor project X',
          'Toon mijn uurtarief per klant'
        ];
      case '/expense-management':
        return [
          'Scan deze bon en categoriseer de uitgave',
          'Welke uitgaven kan ik aftrekken?',
          'Toon mijn uitgaven van vorige maand'
        ];
      case '/bank-integration':
        return [
          'Synchroniseer mijn bankrekening',
          'Match deze transactie met een factuur',
          'Toon niet-gecategoriseerde transacties'
        ];
      default:
        return [
          'Hoe kan ik je helpen met je boekhouding?',
          'Toon mijn laatste facturen',
          'Wat zijn mijn belastingverplichtingen?'
        ];
    }
  };

  const suggestions = getContextualSuggestions();

  const handleSendMessage = async (message = inputValue) => {
    if (!message?.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        content: getAIResponse(message),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const getAIResponse = (message) => {
    const lowerMessage = message?.toLowerCase();
    
    if (lowerMessage?.includes('factuur')) {
      return 'Ik kan je helpen met het maken van een factuur. Ga naar de Facturen pagina en klik op "Nieuwe Factuur". Welke klant wil je factureren?';
    } else if (lowerMessage?.includes('uitgave') || lowerMessage?.includes('bon')) {
      return 'Voor uitgaven kun je naar de Uitgaven pagina gaan. Je kunt bons scannen met de camera functie of handmatig invoeren. Wil je dat ik je door het proces leid?';
    } else if (lowerMessage?.includes('btw') || lowerMessage?.includes('belasting')) {
      return 'Voor Nederlandse ZZP\'ers geldt: 21% BTW voor de meeste diensten, 9% voor bepaalde goederen. Vanaf €20.000 omzet per jaar ben je BTW-plichtig. Wil je meer specifieke informatie?';
    } else if (lowerMessage?.includes('klant')) {
      return 'In het Klanten overzicht kun je nieuwe klanten toevoegen, bestaande gegevens bewerken en factuurhistorie bekijken. Wat wil je precies doen met je klantgegevens?';
    } else {
      return 'Ik ben je AI assistent voor boekhouding. Ik kan je helpen met facturen, uitgaven, klantbeheer, tijdregistratie en belastingvragen. Wat kan ik voor je doen?';
    }
  };

  const handleSuggestionClick = (suggestion) => {
    handleSendMessage(suggestion);
  };

  return (
    <div className="fixed bottom-6 left-6 z-1100">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 h-96 bg-card border border-border rounded-lg shadow-elevation-3 flex flex-col animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Icon name="Bot" size={16} color="white" />
              </div>
              <div>
                <h3 className="font-medium text-foreground">AI Assistent</h3>
                <p className="text-xs text-muted-foreground">Altijd beschikbaar</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              iconName="X"
              iconSize={16}
            />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages?.length === 0 && (
              <div className="text-center text-muted-foreground text-sm">
                <p className="mb-3">Hallo! Ik ben je AI boekhouding assistent.</p>
                <div className="space-y-2">
                  {suggestions?.slice(0, 2)?.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="block w-full text-left p-2 text-xs bg-muted hover:bg-muted/80 rounded-md transition-colors duration-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            {messages?.map((message) => (
              <div
                key={message?.id}
                className={`flex ${message?.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message?.type === 'user' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground'
                  }`}
                >
                  {message?.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-muted text-muted-foreground p-3 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                type="text"
                placeholder="Stel een vraag..."
                value={inputValue}
                onChange={(e) => setInputValue(e?.target?.value)}
                onKeyPress={(e) => e?.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                variant="default"
                size="icon"
                onClick={() => handleSendMessage()}
                disabled={!inputValue?.trim()}
                iconName="Send"
                iconSize={16}
              />
            </div>
          </div>
        </div>
      )}
      {/* Toggle Button */}
      <Button
        variant={isOpen ? "secondary" : "default"}
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        iconName={isOpen ? "MessageSquare" : "Bot"}
        iconSize={24}
        className="w-14 h-14 shadow-elevation-3 hover:shadow-elevation-3 transition-all duration-200"
      />
    </div>
  );
};

export default AIChatWidget;