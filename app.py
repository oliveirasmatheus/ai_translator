import torch, os
from flask import Flask, render_template, request
from transformers import pipeline, AutoTokenizer, AutoModelForSeq2SeqLM

app = Flask(__name__)

ALLOWED_EXTENSIONS = {'mp3', 'wav', 'ogg', 'm4a'}

@app.route('/', methods=['GET', 'POST'])
def home():
    if request.method == 'GET':
        return render_template('index.html')
    else:
        language_selected = request.form['languages']

        # Check if the file is present in the request
        if 'audioFile' in request.files and request.files['audioFile'].filename != '':
            audio_file = request.files['audioFile']

            # Check if it's a valid audio file
            if not allowed_file(audio_file.filename):
                return render_template('index.html', error='Invalid file format. Please upload a valid audio file.')

            # Save the file
            path = os.path.join('./static/audios', audio_file.filename)
            audio_file.save(path)

            # Perform translations using the saved file
            ai_answer = get_audio(path)

            # check which translation function to use
            if (language_selected == "fr"):
                ai_translation = french_translation(ai_answer)
            elif (language_selected == "sp"):
                ai_translation = spanish_translation(ai_answer)

            # Remove the temporary file
            os.remove(path)

            return render_template('index.html', question=audio_file.filename, answer=ai_answer, translation=ai_translation, language_selected=language_selected)

        # No file
        else:
            return render_template('index.html', error='No file uploaded')

def get_audio(audio):
    device = "cuda:0" if torch.cuda.is_available() else "cpu"

    # load pipeline
    pipe = pipeline(
    "automatic-speech-recognition",
    model="openai/whisper-medium",
    chunk_length_s=30,
    device=device,
    )

    # transcript the audio using pipe
    transcription = pipe(audio)
    return transcription['text']

def french_translation(text):
    tokenizer = AutoTokenizer.from_pretrained("Helsinki-NLP/opus-mt-en-fr")
    model = AutoModelForSeq2SeqLM.from_pretrained("Helsinki-NLP/opus-mt-en-fr")

    pipe = pipeline("translation", model=model, tokenizer=tokenizer)
    translation = pipe(text)

    return translation[0]['translation_text']

def spanish_translation(text):
    pipe = pipeline("translation", model="Helsinki-NLP/opus-mt-tc-big-en-cat_oci_spa")
    translation = pipe(f">>spa<< {text}")
    return translation[0]['translation_text']

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS