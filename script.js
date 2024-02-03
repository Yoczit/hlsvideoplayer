var lastTime = new Date().getTime(); //This will used to hide/show a control element.

document.addEventListener('mousemove', function(event) {lastTime = new Date().getTime();}); // This is update the last moved time for hide/show control element

let VIDEO_EL = document.getElementById("video_element");

let loadedAera = 0;

let HLS = new Hls();

if(Hls.isSupported()){
    //HLS.loadSource("https://stream.77lab.cloud/VIDEOS/AMVID/output.m3u8"); // decommentout this and commentout below for load our example vid.
    HLS.loadSource('<?php echo (isset($_GET["url"]) ? $_GET["url"] : "." . $_GET["id"] ); ?>'); // It need php. well just it put path to m3u8.
    HLS.attachMedia(VIDEO_EL);
    HLS.on(Hls.Events.MANIFEST_LOADED ,function() {
        val = document.cookie.split("; ")
        .find((row) => row.startsWith("vol"));
        // Load Cookie and set volume.
        if(val == undefined){
            document.cookie = "vol=1";
        }else {
            document.getElementById("control_volbar_range").value = val.split("=")[1];
        }
        Play();
    });
}else{
    alert("HLS can not used somehow! it was error but not my fault :(");
}

function SpeedUpdate(btn,val){
    VIDEO_EL.playbackRate = val;
    document.querySelectorAll('.spd-btns').forEach(function(element) {
        element.classList.remove('bg-stone-800'); //remove background  from all.
    });
    btn.classList.add("bg-stone-800"); //the last selected one, this should be has background color.
    //Video Play Speed Update. all buttons has spd-btns class and i add/remove color to make users understand current speed.
}

setInterval(function(){
    // This is update volume bar, control buttons and do more.
    UpdateControlButtons();
    UpdateVolbar();
    VIDEO_EL.volume = document.getElementById('control_volbar_range').value;
    if(isValidFocus()){
        lastTime = new Date().getTime();
        return;
    }
    if( ( new Date().getTime() - lastTime ) > ( 1000 * 3 ) ){ //The logic to hide/show control element. 1000*3 is 3 seconds.
        document.getElementById("control_element").classList.remove("bottom-5");
        document.getElementById("body_element").classList.add("cursor-none");
    }else{
        document.getElementById("control_element").classList.add("bottom-5");
        document.getElementById("body_element").classList.remove("cursor-none");
    }
},50);

VIDEO_EL.addEventListener("loadedmetadata", (E)=>{ //when video's meta loded.
    document.getElementById('control_seekbar_range').max = VIDEO_EL.duration; //set video length.
    document.getElementById('control_seekbar_range').value = 0; //reset seekbar
    document.getElementById('control_time_max').innerHTML = convertSecondsToTime(VIDEO_EL.duration); //set video length.
});

function Play(){
    if(VIDEO_EL.paused){ //if paused, play video, if not paused, pause the video, very simple.
        VIDEO_EL.play();
    }else {
        VIDEO_EL.pause();
    }
}

function UpdateSeekbar(){
    slider = document.getElementById('control_seekbar_range');
    if(!slider.max) {
        slider.max = 100;
    }
    // i setting custom background, loaded area background and many more here.
    const progress = (slider.value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, #ef4444 ${progress}%, transparent ${progress}%)`;
    pp = document.getElementById('control_seekbar_background');
    pp.style.background = `linear-gradient(to right, #f5f5f4 ${loadedAera}%, #d6d3d1 ${loadedAera}%)`;
    document.getElementById('control_time_current').innerHTML = convertSecondsToTime(VIDEO_EL.currentTime); //its update current time e.g 1:25
    document.getElementById('control_seekbar_range').value = VIDEO_EL.currentTime; //change range to current time. 
    // below is just updating bottom seekbar for when control element hidden.
    document.getElementById('bottom_seekbar_background').style.background = `linear-gradient(to right, #ef4444 ${progress}%, #f5f5f4 ${progress}%)`; // it fill watched as red, unwatched as light gray.
    document.getElementById('bottom_seekbar_range').style.background = `linear-gradient(to right, transparent ${loadedAera}%, #d6d3d1 ${loadedAera}%)`; //it fill loaded as transparnt so light gray will shown, unloaded as darker gray.
}

function UpdateVolbar(){
    slider = document.getElementById('control_volbar_range'); //volumebar update.
    if(!slider.max) {
        slider.max = 1;
    }
    const progress = (slider.value / slider.max) * 100;
    slider.style.background = `linear-gradient(to right, #ef4444 ${progress}%, #d6d3d1 ${progress}%)`; //this is also customize volume bar too.
    value = slider.value;
    volicon = document.getElementById("control_volbar_icon");
    if(value > 0.6) {
        volicon.innerHTML = '<span class="material-symbols-outlined text-[1.5rem]">volume_up</span>';
    }else if(value > 0) {
        volicon.innerHTML = '<span class="material-symbols-outlined text-[1.5rem]">volume_down</span>';
    }else {
        volicon.innerHTML = '<span class="material-symbols-outlined text-[1.5rem]">volume_mute</span>';
    }
}

function TimeControl(input){
    VIDEO_EL.currentTime += input; //time control. if skip 30sec, just do TimeControl(30), if backward 30sec, just gave -30.
    UpdateSeekbar(); //this doesnt call timeupdate, so update manually.
}


function TimeControlSet(input){
    VIDEO_EL.currentTime = input;
    UpdateSeekbar(); //set time customizily. cuz for range(seekbar) :p
}

function UpdateControlButtons(){
    el = document.getElementById("replay_element"); // if video ended, show replay button. simple code
    if(VIDEO_EL.currentTime >= VIDEO_EL.duration){
        el.classList.remove("hidden");
        document.getElementById('control_button_playpause').innerHTML = '<span class="material-symbols-outlined text-[2.5rem]">replay</span>';
        return;
    }
    el.classList.add("hidden");
    if(VIDEO_EL.paused){
        document.getElementById('control_button_playpause').innerHTML = '<span class="material-symbols-outlined text-[2.5rem]">play_arrow</span>';
    }else {
        document.getElementById('control_button_playpause').innerHTML = '<span class="material-symbols-outlined text-[2.5rem]">pause</span>';
    }
}

function convertSecondsToTime(seconds) {
    // convert time (125(sec) e.g) to hour:min:sec style.
  seconds = Math.floor(seconds);
  var hours = Math.floor(seconds / 3600);
  var minutes = Math.floor((seconds % 3600) / 60);
  var remainingSeconds = seconds % 60;
  var formattedHours = (hours > 0) ? hours + ':' : '';
  var formattedMinutes = (hours > 0 || minutes > 0) ? (minutes < 10 ? '0' : '') + minutes + ':' : '00:';
  var formattedSeconds = (remainingSeconds < 10 ? '0' : '') + remainingSeconds;
  var formattedTime = formattedHours + formattedMinutes + formattedSeconds;
  return formattedTime;
}

VIDEO_EL.addEventListener('timeupdate', function () {
    UpdateSeekbar(); //update seekbar bec timeupdated!!
    if (this.duration) {
         let range = 0;
         let bf = this.buffered;
         let time = this.currentTime;

         while (!(bf.start(range) <= time && time <= bf.end(range))) {
            range += 1;
         }
         let loadStartPercentage = bf.start(range) / this.duration;
         let loadEndPercentage = bf.end(range) / this.duration;
         let loadPercentage = (loadEndPercentage - loadStartPercentage) * 100;
         loadedAera = loadEndPercentage * 100; //its caluclate loaded area. idk how this is wroking :p
    }
});

const isValidFocus = () => (document.activeElement && (['INPUT', 'BUTTON'].includes(document.activeElement.tagName)));
document.addEventListener('keydown', function(event) {
    if(isValidFocus()){
        return; //if focus on button or input it will be cause error so i add this. checking is focus to button or input element.
    }
    if (event.keyCode === 32) {
        Play(); // when spacekey pressed, call play to pause or play video 
    }
    if (event.keyCode === 37 || event.key === 'ArrowLeft') {
        TimeControl(-5); // backward 5 sec
    }
    if (event.keyCode === 39 || event.key === 'ArrowRight') {
        TimeControl(5); // forward 5 sec.
    }
});

// TOGGLE PICTURE IN PICTURE. VERY SIMPLE
function TogglePictureInPicture() {
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  } else if (document.pictureInPictureEnabled) {
    VIDEO_EL.requestPictureInPicture();
  }
}

// TOGGLE FULLSCREEN. VERY SIMPLE
function ToggleFullScreen(x) {
    if (document.fullscreen || document.webkitIsFullScreen) {
      document.exitFullscreen();
      x.innerHTML = '<span class="material-symbols-outlined text-[1.5rem]">fullscreen</span>';
    } else {
      document.documentElement.requestFullscreen();
      x.innerHTML = '<span class="material-symbols-outlined text-[1.5rem]">fullscreen_exit</span>';
    }
  }


// it just show/hide loading animation. :p i just make it function for do same thing many times in the below...
function UpdateLoadingStatus(b){
    el = document.getElementById("loading_element");
    if(b){
        el.classList.remove("hidden");
    }else{
        el.classList.add("hidden");
    }
}
// it updates loading animation.

VIDEO_EL.addEventListener('waiting', function() {
    UpdateLoadingStatus(true); //show it
});
VIDEO_EL.addEventListener('stalled', function() {
    UpdateLoadingStatus(true);
});

VIDEO_EL.addEventListener('playing', function() {
    UpdateLoadingStatus(false); //hide it
});

VIDEO_EL.addEventListener('canplaythrough', function() {
    UpdateLoadingStatus(false);
});
