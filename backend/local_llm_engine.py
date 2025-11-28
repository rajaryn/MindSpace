import requests
import json
import re

class OllamaEngine:
    def __init__(self, model="qwen2.5:1.5b"):
        self.base_url = "http://localhost:11434/api/chat"
        self.model = model
        
        self.greeting_keywords = ["hi", "hello", "hey", "greetings", "sup", "morning", "evening"]

        self.base_system_content = (
            "You are a compassionate mental health assistant named 'MindMate'. "
            "Your goal is to provide empathetic listening and verified information. "
            "IMPORTANT: You are NOT a doctor. If a user mentions self-harm, "
            "provide Indian helpline numbers (Tele-MANAS: 14416). "
        )

    def check_status(self):
        try:
            r = requests.get("http://localhost:11434/api/tags")
            if r.status_code == 200:
                return True
        except:
            return False
        return False
    
    def _beautify_response(self, text):
        """
        Aggressive cleanup: Forces newlines for numbered lists.
        """
        text = text.replace("**", "")
        
        # === NUCLEAR REGEX FIX ===
        # 1. Catches "1.", "2." preceded by space OR start of line
        # 2. Replaces it with "\n\n1."
        text = re.sub(r'(?:^|\s)(\d+\.)', r'\n\n\1', text)
        
        # 3. Fix bullet points too (- or *)
        text = re.sub(r'(?:^|\s)([\-\*]\s)', r'\n\n\1', text)
        
        return text.strip()

    def generate_response(self, user_query, context_chunks=None):
        current_system_content = self.base_system_content
        
        clean_query = user_query.lower().strip()
        word_count = len(clean_query.split())
        is_greeting = any(word in clean_query for word in self.greeting_keywords)
        
        messages = []

        # 1. GREETING MODE
        if word_count < 5 and is_greeting:
            current_system_content += (
                "\nCONTEXT: The user sent a simple greeting. "
                "INSTRUCTION: Reply with a warm, short welcome (max 15 words). "
            )
            messages.append({"role": "system", "content": current_system_content})

        # 2. EMPATHY MODE
        elif word_count < 8 and not is_greeting:
            current_system_content += (
                "\nCONTEXT: The user gave a short emotional response. "
                "INSTRUCTION: Validate their feeling immediately. "
            )
            messages.append({"role": "system", "content": current_system_content})

        # 3. ADVICE MODE (ONE-SHOT + FORMATTING RULES)
        else:
            # A. Explicit Instruction
            current_system_content += (
                "\nINSTRUCTION: Provide a structured list. "
                "Use numbered lists (1., 2., 3.). "
                "Add a BLANK LINE between items."
            )
            messages.append({"role": "system", "content": current_system_content})

            # B. The "One-Shot" Fake Example (CRITICAL FOR QWEN)
            messages.append({
                "role": "user", 
                "content": "How can I sleep better?"
            })
            messages.append({
                "role": "assistant", 
                "content": (
                    "Here are tips for better sleep:\n\n"
                    "1. Schedule: Sleep at the same time daily.\n\n"
                    "2. No Screens: Avoid phones before bed.\n\n"
                    "3. Relax: Try meditation."
                )
            })

        # RAG Context
        final_user_message = user_query
        if context_chunks:
            combined_context = "\n\n".join(context_chunks)
            final_user_message = (
                f"Context:\n---\n{combined_context}\n---\n"
                f"Question: {user_query}"
            )

        messages.append({"role": "user", "content": final_user_message})

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "temperature": 0.3 
        }

        try:
            response = requests.post(self.base_url, json=payload)
            response.raise_for_status()
            
            bot_reply = response.json()['message']['content']
            
            # ALWAYS RUN CLEANUP
            return self._beautify_response(bot_reply)

        except Exception as e:
            return f"Error: {e}"

if __name__ == "__main__":
    bot = OllamaEngine()
    # Test the Pellet Violence query
    query = "Seeking support for someone who has experienced pellet violence"
    print(bot.generate_response(query))