import os
import json
import asyncio
from typing import List, Dict, Any, Optional
from abc import ABC, abstractmethod
import httpx
import openai
from anthropic import Anthropic
from decouple import config

# Configuration
OPENAI_API_KEY = config("OPENAI_API_KEY", default="")
ANTHROPIC_API_KEY = config("ANTHROPIC_API_KEY", default="")
OLLAMA_BASE_URL = config("OLLAMA_BASE_URL", default="http://localhost:11434")
HUGGINGFACE_API_KEY = config("HUGGINGFACE_API_KEY", default="")

class LLMProvider(ABC):
    """Abstract base class for LLM providers"""
    
    @abstractmethod
    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """Generate a response from the LLM"""
        pass
    
    @abstractmethod
    def is_available(self) -> bool:
        """Check if the provider is available"""
        pass

class OpenAIProvider(LLMProvider):
    """OpenAI GPT provider"""
    
    def __init__(self):
        self.client = openai.AsyncOpenAI(api_key=OPENAI_API_KEY)
        self.model = config("OPENAI_MODEL", default="gpt-3.5-turbo")
    
    def is_available(self) -> bool:
        return bool(OPENAI_API_KEY)
    
    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        try:
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=kwargs.get("max_tokens", 1000),
                temperature=kwargs.get("temperature", 0.7),
                stream=False
            )
            return response.choices[0].message.content
        except Exception as e:
            raise Exception(f"OpenAI API error: {str(e)}")

class AnthropicProvider(LLMProvider):
    """Anthropic Claude provider"""
    
    def __init__(self):
        self.client = Anthropic(api_key=ANTHROPIC_API_KEY)
        self.model = config("ANTHROPIC_MODEL", default="claude-3-sonnet-20240229")
    
    def is_available(self) -> bool:
        return bool(ANTHROPIC_API_KEY)
    
    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        try:
            # Convert OpenAI format to Anthropic format
            system_message = ""
            user_messages = []
            
            for msg in messages:
                if msg["role"] == "system":
                    system_message = msg["content"]
                elif msg["role"] == "user":
                    user_messages.append(msg["content"])
                elif msg["role"] == "assistant":
                    # Anthropic doesn't support assistant messages in the same way
                    continue
            
            # Combine user messages
            user_content = "\n".join(user_messages)
            
            response = self.client.messages.create(
                model=self.model,
                max_tokens=kwargs.get("max_tokens", 1000),
                temperature=kwargs.get("temperature", 0.7),
                system=system_message if system_message else "You are a helpful AI assistant.",
                messages=[{"role": "user", "content": user_content}]
            )
            return response.content[0].text
        except Exception as e:
            raise Exception(f"Anthropic API error: {str(e)}")

class OllamaProvider(LLMProvider):
    """Ollama local LLM provider"""
    
    def __init__(self):
        self.base_url = OLLAMA_BASE_URL
        self.model = "llama2:latest"  # Force the correct model name
    
    def is_available(self) -> bool:
        try:
            import httpx
            response = httpx.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except:
            return False
    
    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        try:
            # Convert messages to prompt format for Ollama
            prompt = self._format_messages_for_ollama(messages)
            print(f"Ollama prompt: {prompt[:200]}...")
            print(f"Ollama model: {self.model}")
            print(f"Ollama base_url: {self.base_url}")
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/api/generate",
                    json={
                        "model": self.model,
                        "prompt": prompt,
                        "stream": False,
                        "options": {
                            "temperature": kwargs.get("temperature", 0.7),
                            "num_predict": kwargs.get("max_tokens", 1000)
                        }
                    },
                    timeout=60
                )
                response.raise_for_status()
                result = response.json()
                print(f"Ollama response: {result}")
                return result["response"]
        except Exception as e:
            print(f"Ollama error details: {str(e)}")
            raise Exception(f"Ollama API error: {str(e)}")
    
    def _format_messages_for_ollama(self, messages: List[Dict[str, str]]) -> str:
        """Format messages for Ollama models"""
        formatted = ""
        for msg in messages:
            if msg["role"] == "system":
                formatted += f"<|system|>\n{msg['content']}\n<|end|>\n"
            elif msg["role"] == "user":
                formatted += f"<|user|>\n{msg['content']}\n<|end|>\n"
            elif msg["role"] == "assistant":
                formatted += f"<|assistant|>\n{msg['content']}\n<|end|>\n"
        formatted += "<|assistant|>\n"
        return formatted

class HuggingFaceProvider(LLMProvider):
    """Hugging Face Inference API provider"""
    
    def __init__(self):
        self.api_key = HUGGINGFACE_API_KEY
        self.model = config("HF_MODEL", default="meta-llama/Llama-2-7b-chat-hf")
        self.api_url = f"https://api-inference.huggingface.co/models/{self.model}"
    
    def is_available(self) -> bool:
        return bool(HUGGINGFACE_API_KEY)
    
    async def generate_response(self, messages: List[Dict[str, str]], **kwargs) -> str:
        try:
            # Convert to Hugging Face format
            prompt = self._format_messages_for_hf(messages)
            
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    self.api_url,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "inputs": prompt,
                        "parameters": {
                            "max_new_tokens": kwargs.get("max_tokens", 1000),
                            "temperature": kwargs.get("temperature", 0.7),
                            "do_sample": True
                        }
                    },
                    timeout=60
                )
                response.raise_for_status()
                return response.json()[0]["generated_text"]
        except Exception as e:
            raise Exception(f"Hugging Face API error: {str(e)}")
    
    def _format_messages_for_hf(self, messages: List[Dict[str, str]]) -> str:
        """Format messages for Hugging Face models"""
        formatted = ""
        for msg in messages:
            if msg["role"] == "system":
                formatted += f"<|system|>\n{msg['content']}\n<|end|>\n"
            elif msg["role"] == "user":
                formatted += f"<|user|>\n{msg['content']}\n<|end|>\n"
            elif msg["role"] == "assistant":
                formatted += f"<|assistant|>\n{msg['content']}\n<|end|>\n"
        formatted += "<|assistant|>\n"
        return formatted

class LLMService:
    """Main LLM service that manages multiple providers"""
    
    def __init__(self):
        self.providers = {
            "ollama": OllamaProvider(),  # Put Ollama first!
            "openai": OpenAIProvider(),
            "anthropic": AnthropicProvider(),
            "huggingface": HuggingFaceProvider()
        }
        self.default_provider = config("DEFAULT_LLM_PROVIDER", default="ollama")  # Default to Ollama
    
    def get_available_providers(self) -> List[str]:
        """Get list of available providers"""
        return [name for name, provider in self.providers.items() if provider.is_available()]
    
    def get_default_provider(self) -> Optional[LLMProvider]:
        """Get the default provider"""
        provider = self.providers.get(self.default_provider)
        if provider and provider.is_available():
            return provider
        # Fallback to first available provider
        available = self.get_available_providers()
        return self.providers.get(available[0]) if available else None
    
    async def generate_response(
        self, 
        messages: List[Dict[str, str]], 
        provider: Optional[str] = None,
        **kwargs
    ) -> str:
        """Generate a response using the specified or default provider"""
        
        # Determine which provider to use
        if provider and provider in self.providers:
            selected_provider = self.providers[provider]
        else:
            selected_provider = self.get_default_provider()
        
        if not selected_provider:
            raise Exception("No available LLM providers. Please install Ollama or add API keys.")
        
        if not selected_provider.is_available():
            raise Exception(f"Provider {provider} is not available")
        
        # Generate response
        return await selected_provider.generate_response(messages, **kwargs)
    
    async def generate_chat_response(
        self, 
        user_message: str, 
        chat_history: List[Dict[str, str]] = None,
        system_prompt: str = "You are a helpful AI assistant.",
        provider: Optional[str] = None,
        **kwargs
    ) -> str:
        """Generate a chat response with context"""
        
        # Build messages array
        messages = []
        
        # Add system message
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        
        # Add chat history
        if chat_history:
            messages.extend(chat_history)
        
        # Add current user message
        messages.append({"role": "user", "content": user_message})
        
        # Generate response
        return await self.generate_response(messages, provider, **kwargs)

# Global LLM service instance
llm_service = LLMService()
