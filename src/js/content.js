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

window.addEventListener("load", function(){
    // Pause player if on front page and feature is enabled
    disableAutoPlayNew();
});
