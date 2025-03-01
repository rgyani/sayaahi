import React, { useState, useEffect, useRef } from 'react';
import { Configuration, OpenAIApi } from 'openai'

const AIChatApp = () => {
  // State for managing endpoints, selected endpoint, messages, and input
  const [endpoints] = useState([
    { 
      id: 1, 
      name: 'Formal', 
      info: "I will restructure your input to formal sentences",
      prompt: '[Voice and style guide: Rephrase the input, line by line, in a coherent, formal, precise and business tone paired with sophisticated vocabulary and grammar. Make sure to keep the meaning the same. Also make sure not to remove line separators between lines]:',
      icon: "assets/akane.png",
      results: 5
    },
    { 
      id: 2, 
      name: 'Casual', 
      info: "I will restructure your input to casual sentences",
      prompt: "[Voice and style guide: Rephrase in a conversational, relatable style as if you were explaining something to a friend. Use natural language and phrasing that a real person would use in everyday conversation. Make sure to keep the meaning the same]:",
      icon: "assets/gamer.png",
      results: 5
    },
    { 
      id: 3, 
      name: 'AMA', 
      info: "Ask Me Anything",
      prompt: '',
      icon: "assets/bot.png",
      results: 1
    },
    { 
      id: 4, 
      name: 'Standard English', 
      info: "I will restructure your input to proper English sentences",
      prompt: "Correct this to standard English:",
      icon: "assets/emily.png",
      results: 5
    },
    { 
      id: 5, 
      name: 'English To German', 
      info: "Translate to German",
      prompt: "Convert English To German:",
      icon: "assets/joe.png",
      results: 1
    },
    { 
      id: 6, 
      name: 'German To English', 
      info: "Translate to English",
      prompt: "Convert English To German:",
      icon: "assets/beard.png",
      results: 1
    },
    { 
      id: 7, 
      name: 'AWS', 
      info: "Write python boto3 code",
      prompt: "Write python boto3 code for: ",
      icon: "assets/aws.png",
      results: 1
    },
  ]);
  
  const queryParameters = new URLSearchParams(window.location.search)

  const configuration = new Configuration({
    apiKey: queryParameters.get("key")?.valueOf()
  })
  const openai = new OpenAIApi(configuration)

  // Initialize selected endpoint from localStorage or default to null
  const [selectedEndpoint, setSelectedEndpoint] = useState(() => {
    const savedEndpoint = localStorage.getItem('selectedEndpoint');
    return savedEndpoint ? JSON.parse(savedEndpoint) : null;
  });
  
  // Initialize messages from localStorage based on selected endpoint
  const [messages, setMessages] = useState(() => {
    if (selectedEndpoint) {
      const savedMessages = localStorage.getItem(`messages_${selectedEndpoint.id}`);
      return savedMessages ? JSON.parse(savedMessages) : [];
    }
    return [];
  });
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Save selected endpoint to localStorage when it changes
  useEffect(() => {
    if (selectedEndpoint) {
      localStorage.setItem('selectedEndpoint', JSON.stringify(selectedEndpoint));
      
      // Load messages for the selected endpoint
      const savedMessages = localStorage.getItem(`messages_${selectedEndpoint.id}`);
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      } else {
        setMessages([]);
      }
    }
  }, [selectedEndpoint]);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (selectedEndpoint) {
      localStorage.setItem(`messages_${selectedEndpoint.id}`, JSON.stringify(messages));
    }
  }, [messages, selectedEndpoint]);

  // Send message to selected endpoint
  const sendMessage = async () => {
    if (!inputMessage.trim() || !selectedEndpoint) return;

    let id = Date.now() + 1
 
    const userMessage = {
      sender: 'user',
      id: id,
      text: inputMessage,
      timestamp: new Date().toISOString(),
    };
    
    setMessages([...messages, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    
    try {
      const payload = {
        model: 'gpt-3.5-turbo-instruct',
        prompt: `${selectedEndpoint.prompt}${inputMessage}'`,
        temperature: 0.9,
        max_tokens: 250,
        top_p: 1,
        n: selectedEndpoint.results,
        frequency_penalty: 0,
        presence_penalty: 0.6,
    }

    const response = await openai.createCompletion(payload)
    
    response.data.choices.forEach(r => {
      const data = r.text?.toString().trim()
      console.log(data)
      if (data) {
        const aiMessage = {
          id : id + 1,
          sender: selectedEndpoint.name,
          text: data,
          timestamp: new Date().toISOString(),
        };
        id += 1;
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      }
    });
    setIsLoading(false);

    } catch (error) {
      console.error('Error sending message:', error);
      
      const errorMessage = {
        id: id + 100,
        sender: 'system',
        text: `Error: Failed to get response from ${selectedEndpoint.name}.`,
        timestamp: new Date().toISOString(),
      };
      
      setMessages(prevMessages => [...prevMessages, errorMessage]);
      setIsLoading(false);
    }
  };

  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">
      {/* Sidebar for endpoints */}
      <div
        className={`bg-gray-800 text-white p-4 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {/* Toggle Button */}
        <button
          className="mb-4 text-white bg-gray-700 hover:bg-gray-600 p-2 rounded"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? "▶" : "◀"}
        </button>

        {!isCollapsed && <h2 className="text-xl font-bold mb-4">AI Endpoints</h2>}

        <div className="flex-1 overflow-y-auto">
          {endpoints.map((endpoint) => (
            <div
              key={endpoint.id}
              className={`p-3 mb-2 rounded cursor-pointer flex items-center ${
                selectedEndpoint?.id === endpoint.id ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"
              }`}
              onClick={() => setSelectedEndpoint(endpoint)}
            >
              <span className="text-2xl mr-3">
                <img src={endpoint.icon} className="w-6 h-6" />
              </span>
              {!isCollapsed && <span>{endpoint.name}</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selectedEndpoint ? (
          <>
            {/* Chat header */}
            <div className="bg-white p-4 shadow flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold flex items-center">
                  <span className="text-2xl mr-2">
                    <img src={selectedEndpoint.icon} className="w-6 h-6" />
                  </span>
                  {selectedEndpoint.info}
                </h2>
                <p className="text-sm text-gray-500">{selectedEndpoint.url}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                  Send a message to start the conversation
                </div>
              ) : (
                messages.map((message) => (
                  <div key={message.id} className={`mb-4 ${message.sender === "user" ? "text-right" : "text-left"}`}>
                    <div className="flex items-start">
                      <div
                        className={`p-3 rounded-lg ${
                          message.sender === "user"
                            ? "bg-blue-600 text-white rounded-br-none"
                            : message.sender === "system"
                            ? "bg-red-100 text-red-800 rounded-bl-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        {message.text}
                      </div>
                    </div>
                    <div className="text-xs mt-1 text-left">
                      {message.sender === "user" ? "You" : message.sender} ·{" "}
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                ))
              )}
              {isLoading && (
                <div className="flex items-center text-gray-500 mb-4">
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-4 border-t bg-white">
              <div className="flex">
                <input
                  type="text"
                  className="flex-1 p-2 border border-gray-300 rounded-l focus:outline-none focus:border-blue-500"
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  disabled={isLoading}
                />
                <button
                  className="bg-blue-600 text-white px-4 rounded-r hover:bg-blue-700 disabled:bg-blue-400"
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-xl mb-2">No AI Endpoint Selected</h3>
              <p>Please select an endpoint from the sidebar to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIChatApp;