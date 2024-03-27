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
    'https://drive.google.com/file/d/17U-2jbGkzWg6-8-uvesS_aNELsW1IzaG/view?usp=sharing'
    // Add more video URLs as needed
];

document.getElementById('power_button').addEventListener('click', () => {
    initializeApiOnly();
    loadMedia(videoList[currentVideoIndex]);
});

document.getElementById('help_button').addEventListener('click', function() {
    var helpSection = document.getElementById('help_section');
    if (helpSection.style.display === 'none') {
        helpSection.style.display = 'block';
    } else {
        helpSection.style.display = 'none';
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

document.getElementById('rewind_30seconds').addEventListener('click', () => {
    if (currentSession) {
        const currentTime = currentMediaSession.getEstimatedTime();
        const seekRequest = new chrome.cast.media.SeekRequest()
        seekRequest.currentTime =  currentTime - 30;
        currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);

        if (currentTime < 0) {
            seekRequest.currentTime = 0
            currentMediaSession.seek(seekRequest, onMediaCommandSuccess, onError);
        }
    } else {
        alert('Connectez-vous sur chromecast en premier');
    }
    
});


document.getElementById('pauseStart_button').addEventListener('click', () => {
    if (currentMediaSession) {
        if (isPlaying) {
            currentMediaSession.pause(null, onMediaCommandSuccess, onError);
        } else {
            currentMediaSession.play(null, onMediaCommandSuccess, onError);
        }
        isPlaying = !isPlaying;
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


//Method for upping the volume
document.getElementById('up_volume').addEventListener('click', () => {
    const volume = currentMediaSession.volume.level
    const NewVolume = Math.min(volume + 0.1)
    currentMediaSession.ControlVolume(NewVolume, onMediaCommandSuccess, onError)
    
});

//Method for upping the volume
document.getElementById('down_volume').addEventListener('click', () => {
    const volume = currentMediaSession.volume.level
    const NewVolume = Math.min(volume - 0.1)
    currentMediaSession.ControlVolume(NewVolume, onMediaCommandSuccess, onError)
   
});



function sessionListener(newSession) {
    currentSession = newSession;
    document.getElementById('options_button').style.display = 'block';
    document.getElementById('rewind_foward_video').style.display = 'block';
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
        currentMediaSession = mediaSession;
      }, onError);
}

function formatTime(timeInSeconds) {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}