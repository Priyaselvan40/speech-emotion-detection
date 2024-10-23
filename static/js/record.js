let mediaRecorder;
let recordedChunks = [];

document.getElementById("startRecord").addEventListener("click", () => {
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => recordedChunks.push(event.data);
            mediaRecorder.start();
            document.getElementById("startRecord").disabled = true;
            document.getElementById("stopRecord").disabled = false;
        });
});

document.getElementById("stopRecord").addEventListener("click", () => {
    mediaRecorder.stop();
    mediaRecorder.onstop = () => {
        let audioBlob = new Blob(recordedChunks, { type: 'audio/wav' });
        let audioUrl = URL.createObjectURL(audioBlob);
        document.getElementById("audioPlayback").src = audioUrl;

        let formData = new FormData();
        formData.append('audio_file', audioBlob, 'recorded_audio.wav');

        fetch('/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                // Display the first emotion label and its score
                const firstEmotion = data[0];
                document.getElementById('result').innerHTML = `Emotion: ${firstEmotion.label}, Score: ${firstEmotion.score.toFixed(2)}`;
            } else {
                document.getElementById('result').innerHTML = 'No emotion detected';
            }
        })
        
        .catch(error => console.error('Error:', error));

        recordedChunks = []; // clear for the next recording
        document.getElementById("startRecord").disabled = false;
        document.getElementById("stopRecord").disabled = true;
    };
});
