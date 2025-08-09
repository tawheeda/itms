// Popup functions
function showPopup(message, type) {
    const overlay = document.getElementById('popupOverlay');
    const popup = document.getElementById('popupMessage');
    const popupText = document.getElementById('popupText');
    
    popupText.textContent = message;
    popup.className = 'popup ' + type; // Apply "success" or "error" styles
    overlay.style.display = 'block';
    popup.style.display = 'block';
}

function closePopup() {
    document.getElementById('popupOverlay').style.display = 'none';
    document.getElementById('popupMessage').style.display = 'none';
    // Remove ?status=... from URL
    history.replaceState({}, document.title, window.location.pathname);
}

// Auto-show popup based on status from PHP
document.addEventListener("DOMContentLoaded", function() {
    // This value comes from PHP in contact.php
    const status = "<?php echo isset($_GET['status']) ? $_GET['status'] : ''; ?>";
    
    if (status === "success") {
        showPopup("✅ Your message has been sent and saved successfully.", "success");
    } else if (status === "error") {
        showPopup("❌ There was an issue sending your message. Please try again later.", "error");
    }
});
