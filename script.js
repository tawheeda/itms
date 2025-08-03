      // Get the modal elements
        var successModal = document.getElementById("successModal");
        var errorModal = document.getElementById("errorModal");

        // Get the <span> element that closes the modal
        var closeButtons = document.getElementsByClassName("close-button");
        for (var i = 0; i < closeButtons.length; i++) {
            closeButtons[i].onclick = function() {
                // Remove the "show" class to hide the modal
                this.parentElement.parentElement.classList.remove("show");
                // Remove the query parameter from the URL after closing the modal
                history.replaceState({}, document.title, window.location.pathname);
            }
        }

        // Function to close any active modal
        function closeModal() {
            successModal.classList.remove("show");
            errorModal.classList.remove("show");
            // Remove the query parameter from the URL after closing the modal
            history.replaceState({}, document.title, window.location.pathname);
        }

        // When the user clicks anywhere outside of the modal, close it
        window.onclick = function(event) {
            if (event.target == successModal) {
                closeModal();
            }
            if (event.target == errorModal) {
                closeModal();
            }
        }

        // Check URL for status parameter on page load
        window.onload = function() {
            const urlParams = new URLSearchParams(window.location.search);
            const status = urlParams.get('status');

            if (status === 'success') {
                successModal.classList.add("show"); // Add 'show' class to display
            } else if (status === 'error') {
                errorModal.classList.add("show"); // Add 'show' class to display
            }
        }

        // Get the contact form element
        const contactForm = document.querySelector('.contact-form');

        // Add an event listener for the form submission
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Stop the form from submitting normally and reloading the page

            // Simulate sending data (e.g., to a server via fetch() API)
            // For now, we'll just simulate a delay and then redirect
            console.log('Form submission intercepted. Simulating sending message...');

            // Simulate a successful submission after a short delay (e.g., 1 second)
            // For testing error, change 'success' to 'error'
            setTimeout(() => {
                // After the simulated submission, redirect to the contact page with a status
                // This will trigger your existing window.onload logic for the modals
                window.location.href = 'contact.html?status=success'; // Change to 'error' to test the error modal
            }, 1000); // 1000 milliseconds = 1 second delay
        });
