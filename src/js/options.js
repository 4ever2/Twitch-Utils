// Saves options to chrome.storage
function save_options() {
  var frontPageAutoPlay = document.getElementById('frontPageAutoPlay').checked;
  var adMute = document.getElementById('adMute').checked;
  var adHide = document.getElementById('adHide').checked;
  var channelPointsClaim = document.getElementById('channelPointsClaim').checked;
  chrome.storage.local.set({
    frontPageAutoPlay: frontPageAutoPlay,
    adMute: adMute,
    adHide: adHide,
    channelPointsClaim: channelPointsClaim
  }, function() {
    // Update status to let user know options were saved.
    var status = document.getElementById('status');
    status.textContent = 'Options saved.';
    setTimeout(function() {
      status.textContent = '';
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  // Use default value frontPageAutoPlay = true.
  chrome.storage.local.get({
    frontPageAutoPlay: true,
    adMute: true,
    adHide: true,
    channelPointsClaim: false
  }, function(items) {
    document.getElementById('frontPageAutoPlay').checked = items.frontPageAutoPlay;
    document.getElementById('adMute').checked = items.adMute;
    document.getElementById('adHide').checked = items.adHide;
    document.getElementById('channelPointsClaim').checked = items.channelPointsClaim;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
