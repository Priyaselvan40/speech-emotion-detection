from flask import Flask, render_template, request, jsonify
import requests

app = Flask(__name__)

API_URL = "https://api-inference.huggingface.co/models/ehcalabres/wav2vec2-lg-xlsr-en-speech-emotion-recognition"
headers = {"Authorization": "Bearer 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"}

def query(filename):
    with open(filename, "rb") as f:
        data = f.read()
    response = requests.post(API_URL, headers=headers, data=data)
    return response.json()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_audio():
    # Get the audio file from the POST request
    if 'audio_file' not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    audio_file = request.files['audio_file']
    if audio_file.filename == '':
        return jsonify({"error": "No file selected"}), 400

    # Save file temporarily
    audio_file.save(audio_file.filename)
    
    # Call the emotion recognition model API
    result = query(audio_file.filename)
    
    # Remove the saved file (optional)
    # os.remove(audio_file.filename)

    # Return the result to the front end
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)
