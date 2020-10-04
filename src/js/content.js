console.log("Twitch utils extension injected on page " + window.location.href);

// Warning message used when hiding
var adWarning = document.createElement("div");
adWarning.id = "adWarning";
adWarning.textContent = "Ad in progress";
adWarning.style.fontSize = "xxx-large";
adWarning.style.height = "100%";
adWarning.style.display = "flex";
adWarning.style.alignItems = "center";
adWarning.style.justifyContent = "center";
adWarning.style.color = "dimgrey";

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
        adMute: true,
        adHide: true
    }, function(options) {
        // Check if option is enabled
        if (options.adMute || options.adHide) {
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
                    if (options.adMute) {
                        // Mute stream
                        wasMuted = stream.muted;
                        stream.muted = true;
                    }
                    if (options.adHide) {
                        // Hide ad
                        stream.style.visibility = "hidden";
                        // Add message telling user that an ad is in progress
                        videoContainer.appendChild(adWarning);
                    }
                } else {
                    if (options.adMute){
                        // Restore sound setting to what it was before ad started
                        stream.muted = wasMuted;
                    }
                    if (options.adHide) {
                        // Make stream visible again
                        stream.style.visibility = "visible";
                        // Remove "ad in progress" message
                        videoContainer.removeChild(adWarning);
                    }
                }
            };
            
            // Start listener for ads
            var adObserver = new MutationObserver(adCallback);
            adObserver.observe(adScript, config);
        }
    });
}

function claimChannelPoints() {
    // Are we on a page with a chat window?
    var chatWindows = document.getElementsByClassName("stream-chat");
    if (chatWindows.length == 0) {
        return; // We are not on a page with a chat window
    }

    var chat = chatWindows[0] // Assumes that there will only be one chat window

    // Load options
    chrome.storage.local.get({
        channelPointsClaim: false
    }, function(options) {
        // Check if option is enabled
        if (options.channelPointsClaim) {
            const config = { attributes: false, childList: true, subtree: true };
            const channelPointcallback = function(mutationsList, observer) {
                for (mutation of mutationsList) {
                    // Check if channel point section have been added to chat window yet
                    if (mutation.target.className === "tw-relative tw-z-default" || mutation.target.className === "") {

                        // For some reason twitch doesn't always deliver community-points-summary in the same mutation
                        // So we have to check for both mutation target "div.tw-relative.tw-z-default" and "div"
                        var pointsContainer = chat.querySelector('div.community-points-summary div.tw-transition');
                        if (!pointsContainer) {
                            continue;
                        }
                        
                        // Stop listening for further events
                        chatLoadObserver.disconnect();

                        // Look if there are already points to be collected
                        button = pointsContainer.querySelector('button');
                        if (button) {
                            button.click();
                        }

                        const channelPointcallback = function(mutationsList, observer) {
                            for(let mutation of mutationsList) {
                                if (mutation.addedNodes.length > 0) {
                                    // Look for points claim button
                                    button = pointsContainer.querySelector('button');
                                    if (button) {
                                        button.click();
                                    }
                                }
                            }
                        };
                    
                        // Listen for changes in channel points container
                        const channelPointsObserver = new MutationObserver(channelPointcallback);
                        channelPointsObserver.observe(pointsContainer, config);
                    }
                }
            };
        
            // Listen for changes in chat container
            const chatLoadObserver = new MutationObserver(channelPointcallback);
            chatLoadObserver.observe(chat, config);
        }
    });
}

window.addEventListener("load", function(){
    // Pause player if on front page and feature is enabled
    disableAutoPlayNew();

    // Mute player during ads
    muteAds();

    // Auto claim channel points
    claimChannelPoints();
});
