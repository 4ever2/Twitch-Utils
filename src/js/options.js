// Saves options to chrome.storage
function save_options() {
  var frontPageAutoPlay = document.getElementById('frontPageAutoPlay').checked;
  chrome.storage.local.set({
    frontPageAutoPlay: frontPageAutoPlay
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
    frontPageAutoPlay: true
  }, function(items) {
    document.getElementById('frontPageAutoPlay').checked = items.frontPageAutoPlay;
  });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
