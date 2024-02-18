document.addEventListener('DOMContentLoaded', function () {

    // When a form submission happens, show loading symbol and overlay container
    const form = document.querySelector('form');
    const overlay = document.getElementById('overlay');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    form.addEventListener('submit', function(event) {
        event.preventDefault();

        overlay.classList.remove('d-none');
        loadingIndicator.classList.remove('d-none');
    
        setTimeout(function() {
            form.submit();
        }, 1000); 
    });
    
    
    // Add an event listener to the checkbox to update the display when the checkbox is clicked
    const recordCheckbox = document.getElementById('record');
    const recordGroup = document.querySelector('.record-group');

    function toggleRecordGroup() {
        recordGroup.style.display = recordCheckbox.checked ? 'block' : 'none';
    }

    toggleRecordGroup(); 

    recordCheckbox.addEventListener('change', toggleRecordGroup);


    // Not same code, but follow almost all the steps:
    // Source: https://picovoice.ai/blog/how-to-record-audio-from-a-web-browser/
    let mediaRecorder;
    let recordedChunks = [];
    
    const startRecordingButton = document.getElementById('startRecording');
    const stopRecordingButton = document.getElementById('stopRecording');
    const audioPlayer = document.getElementById('audioPlayer');
    const recordedAudioInput = document.getElementById('audioFile');

    startRecordingButton.addEventListener('click', async function (event) {
        event.preventDefault();
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        
        mediaRecorder.ondataavailable = function (event) {
            if (event.data.size > 0) {
                recordedChunks.push(event.data);
            }
        };
        
        mediaRecorder.onstop = function () {
            console.log("mediaRecorder run")
            const blob = new Blob(recordedChunks, { type: 'audio/wav' });
            const url = URL.createObjectURL(blob);
            audioPlayer.src = url;

            const reader = new FileReader();
            reader.onloadend = function () {
                const base64Data = reader.result;
                recordedAudioInput.value = base64Data;
                console.log(recordedAudioInput.value)
            };
            reader.readAsDataURL(blob);
        };
        
        mediaRecorder.start();
        startRecordingButton.disabled = true;
        stopRecordingButton.disabled = false;
    });

    stopRecordingButton.addEventListener('click', function (event) {
        event.preventDefault();
        mediaRecorder.stop();
        startRecordingButton.disabled = false;
        stopRecordingButton.disabled = true;
    });
    
});