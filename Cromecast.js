let currentSession;
let currentMediaSession;
let isPlaying = true;
let currentVideoIndex = 0;
let currentVideoUrl;
let updateInterval;
let Volume 
const seekSlider = document.getElementById('seekSlider');
const currentTimeElement = document.getElementById('currentTime');
const totalTimeElement = document.getElementById('totalTime');
const defaultContentType = 'video/mp4';
const applicationID = '3DDC41A0';
const videoList = [
    'https://transfertco.ca/video/DBillPrelude.mp4',
    'https://transfertco.ca/video/DBillSpotted.mp4',
    'https://transfertco.ca/video/usa23_7_02.mp4',
    "https://github.com/JF195/testvideocast/raw/main/fish.mp4",
    "https://github.com/JF195/testvideocast/raw/main/cat.mp4",
    "https://github.com/JF195/testvideocast/raw/main/sans.mp4",
    "https://github.com/JF195/testvideocast/raw/main/woz.mp4",
    'https://drive.google.com/file/d/17U-2jbGkzWg6-8-uvesS_aNELsW1IzaG/view?usp=sharing'
    // Add more video URLs as needed
];

document.getElementById('power_button').addEventListener('click', () => {
    initializeApiOnly();
});

document.getElementById('options_button').addEventListener('click', () => {
    if (currentSession) {
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});


document.getElementById('rewind_foward_video').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        loadMedia(videoList[currentVideoIndex]);
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

document.getElementById('rewind_back_video').addEventListener('click', () => {
    if (currentSession) {
        currentVideoIndex = (currentVideoIndex - 1) % videoList.length;
        loadMedia(videoList[currentVideoIndex]);
        if (currentVideoIndex < 0) {
            currentVideoIndex = videoList.length;
        }
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
});

//Method for skipping 30 seconds back
document.getElementById('rewind_30seconds').addEventListener('click', () => {
    const currentTime = currentMediaSession.getEstimatedTime();
    const seekRequest = new chrome.cast.media.SeekRequest()
    seekRequest.currentTime =  currentTime - 30;
    currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);

    if (currentTime < 0) {
        seekRequest.currentTime = 0
        currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
    }
});


document.getElementById('pauseStart_button').addEventListener('click', () => {
    let self = document.querySelector("#pauseStart_button button img");
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
        }
        isPlaying = !isPlaying;
        console.log(self);
        console.log(isPlaying);
        self.src = (isPlaying) ? "./img/stop.png" : "./img/play.png"
    }
});

//Method for skipping 10 seconds forward
document.getElementById('forward_10seconds').addEventListener('click', () => {
    const currentTime = currentMediaSession.getEstimatedTime();
    const seekRequest = new chrome.cast.media.SeekRequest()
    seekRequest.currentTime =  currentTime + 10;
    currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
    

    if (currentTime > totalTime) {
        currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
        loadMedia(videoList[currentVideoIndex]);
    }
    else{
        alert('Une erreur est survenu')
    }
});

function updateVolume(value){
    document.querySelector("#show_volume").innerText = Math.floor(value*100);
}

//Method for upping the volume
document.getElementById('up_volume').addEventListener('click', () => {
    const volume = currentMediaSession.volume.level
    const NewVolume = Math.min(volume + 0.1, 1)
    updateVolume(NewVolume);
    currentMediaSession.ControlVolume(NewVolume, onMediaCommandSuccess, onError)
});

//Method for upping the volume
document.getElementById('down_volume').addEventListener('click', () => {
    const volume = currentMediaSession.volume.level
    const NewVolume = Math.max(volume - 0.1, 0)
    updateVolume(NewVolume);
    currentMediaSession.ControlVolume(NewVolume, onMediaCommandSuccess, onError)
});



function sessionListener(newSession) {
    currentSession = newSession;
    //document.getElementById('options_button').style.display = 'block';
    //document.getElementById('rewind_foward_video').style.display = 'block';
}



function initializeSeekSlider(remotePlayerController, mediaSession) {
    currentMediaSession = mediaSession;
    document.getElementById('pauseStart_button').style.display = 'block';
   // Set max value of seek slider to media duration in seconds
   seekSlider.max = mediaSession.media.duration;

    // Update seek slider and time elements on time update
    updateInterval = setInterval(() => {
        const currentTime = mediaSession.getEstimatedTime();
        const totalTime = mediaSession.media.duration;
  
        seekSlider.value = currentTime;
        currentTimeElement.textContent = formatTime(currentTime);
        totalTimeElement.textContent = formatTime(totalTime);
      }, 1000); //chaque 1000 ms... 1 sec
  
      // slider change
      seekSlider.addEventListener('input', () => {
        const seekTime = parseFloat(seekSlider.value);
        remotePlayerController.seek(seekTime);
      });
 }

function receiverListener(availability) {
    if (availability === chrome.cast.ReceiverAvailability.AVAILABLE) {
        //document.getElementById('options_button').style.display = 'block';
    } else {
        //document.getElementById('options_button').style.display = 'none';
    }
}

function ControlVolume(volumeLevel){
   const currentVolume = new chrome.cast.Volume(volumeLevel)
   const SetVolume = new chrome.cast.media.SetVolume(currentVolume)
   currentMediaSession.ControlVolume(NewVolume, onMediaCommandSuccess, onError)
}

function onInitSuccess() {
    console.log('Chromecast init success');
}

function onError(error) {
    console.error('Chromecast initialization error', error);
}

function onMediaCommandSuccess() {
    console.log('Media command success');
}

function initializeApiOnly() {
    
    const sessionRequest = new chrome.cast.SessionRequest(chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID);
    const apiConfig = new chrome.cast.ApiConfig(sessionRequest, sessionListener, receiverListener);

    chrome.cast.initialize(apiConfig, onInitSuccess, onError);
}

function loadMedia(videoUrl) {
    currentVideoUrl = videoUrl;
    const mediaInfo = new chrome.cast.media.MediaInfo(videoUrl, defaultContentType);
    const request = new chrome.cast.media.LoadRequest(mediaInfo);
    const remotePlayer = new cast.framework.RemotePlayer();
    const remotePlayerController = new cast.framework.RemotePlayerController(remotePlayer);

    currentSession.loadMedia(request, mediaSession => {
        console.log('Media chargé avec succès');
        initializeSeekSlider(remotePlayerController, mediaSession);
      }, onError);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}