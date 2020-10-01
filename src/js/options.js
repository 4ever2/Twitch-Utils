// Saves options to chrome.storage
function save_options() {
    var test = document.getElementById('test').checked;
    chrome.storage.local.set({
      test: test
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
    // Use default value test = true.
    chrome.storage.local.get({
      test: true
    }, function(items) {
      document.getElementById('test').checked = items.test;
    });
  }
  document.addEventListener('DOMContentLoaded', restore_options);
  document.getElementById('save').addEventListener('click',
      save_options);