console.log("Twitch utils extension injected on page " + window.location.href);

function disableAutoPlayNew() {
    // Check that we are on the front page of twitch
    if (window.location.pathname != "/") {
        return;
    }

    // Load options
    chrome.storage.local.get({
        frontPageAutoPlay: true
    }, function(options) {
        // Check if feature is enabled
        if (options.frontPageAutoPlay) {
            var featuredContent = document.getElementsByClassName("featured-content-carousel")[0];

            var config = { attributes: false, childList: true, subtree: true };
            var callback = function(mutationsList, observer) {
                for (mutation of mutationsList) {
                    // Identify when video element is added
                    if (mutation.target.className === "tw-absolute tw-bottom-0 tw-left-0 tw-overflow-hidden tw-right-0 tw-top-0 video-player__container") {
                        var stream = featuredContent.getElementsByTagName("video")[0];
                        
                        // Add event listener for stream playing
                        stream.addEventListener("play", function(event) {
                            // Pause stream
                            this.pause();
                            // Stop eventlistener so that player can optionally resume stream
                            this.removeEventListener("play", arguments.callee);
                        });

                        // Stop listening for further changes
                        observer.disconnect();
                    }
                }
            };

            // Start obeserver, listening for changes in featured-content-carousel
            var observer = new MutationObserver(callback);
            observer.observe(featuredContent, config);
        }
    });
}

function muteAds() {
    // Are we on a page with a player?
    var videoContainers = document.getElementsByClassName("video-player__container");
    if (videoContainers.length == 0) {
        return; // We are not on a page with an active stream
    }

    // We assume that we are not on a page with multiple streams
    // Squad streaming is not supported
    var videoContainer = videoContainers[0]
    var videoOverlay = videoContainer.getElementsByClassName("video-player__overlay")[0];

    // Load options
    chrome.storage.local.get({
        adMute: true
    }, function(options) {
        // Check if option is enabled
        if (options.adMute) {
            // Get stream node
            var streams = videoContainer.getElementsByTagName("video");
            if (streams.length == 0) {
                return;
            }
            var stream = streams[0];

            // Get div where ad timer appears
            var adScript = videoOverlay.querySelector("div.video-player__overlay div.tw-absolute.tw-bottom-0.tw-left-0.tw-right-0.tw-top-0 div");
            var wasMuted = stream.muted;

            var config = { attributes: false, childList: true, subtree: true };
            var adCallback = function(mutationsList, observer) {
                // Ad event detected
                if (adScript.childElementCount > 0) {
                    // Mute stream
                    wasMuted = stream.muted;
                    stream.muted = true;
                } else {
                    // Restore sound setting to what it was before ad started
                    stream.muted = wasMuted;
                }
            };
            
            // Start listener for ads
            var adObserver = new MutationObserver(adCallback);
            adObserver.observe(adScript, config);
        }
    });
}

window.addEventListener("load", function(){
    // Pause player if on front page and feature is enabled
    disableAutoPlayNew();

    // Mute player during ads
    muteAds();
});
