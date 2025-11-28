import os
from openai import OpenAI
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

class OpenAIEngine:
    def __init__(self, api_key=None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        self.organization = os.getenv("ORGANIZATION")
        self.client = OpenAI(api_key=self.api_key)
        self.model = "gpt-4o-mini" 
        
    def generate_response_with_history(self, messages: list):
        try:
            print("Sending request to OpenAI with history...")
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages 
            )
            return self._cleanup(response.choices[0].message.content)
        except Exception as e:
            print(f"OpenAI Error with history: {e}")
            return "I am currently having trouble connecting to the cloud server."

    def _cleanup(self, text):
        return text.replace("**", "")


class GroqEngine:
    def __init__(self, api_key=None):
        self.client = Groq()
        self.model = "llama-3.3-70b-versatile" 


    def generate_response_with_history(self, messages: list):
        try:
            print("Sending request to Groq (Llama 3) with history...")
            chat_completion = self.client.chat.completions.create(
                messages=messages, 
                model=self.model,
                temperature=0.5,
            )

            reply = chat_completion.choices[0].message.content
            reply = reply.replace("**", "")
            return reply

        except Exception as e:
            print(f"Groq Error with history: {e}")
            return "I'm having trouble connecting to the AI server. Please try again."