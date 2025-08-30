import os
import google.generativeai as genai

# genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

def generate_response(prompt: str, api_key: str, model_name: str, temperature: float):
    try:
        if api_key:
            genai.configure(api_key=api_key)

        model = genai.GenerativeModel(model_name)
        generation_config = genai.types.GenerationConfig(temperature=temperature)

        response = model.generate_content(prompt, generation_config=generation_config)
        return response.text
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return "Sorry, I encountered an error while generating a response."