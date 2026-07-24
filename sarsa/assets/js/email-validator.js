/**
 * Email Validation Module
 * Implements robust email validation following RFC 5322 guidelines
 */

(function() {
    'use strict';

    /**
     * Validates email format
     * @param {string} email - Email address to validate
     * @returns {boolean} - True if valid, false otherwise
     */
    function isValidEmail(email) {
        // Trim whitespace
        email = email.trim();

        // Check basic length constraints
        if (email.length < 3 || email.length > 254) {
            return false;
        }

        // RFC 5322 compliant regex
        const emailRegex = /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

        if (!emailRegex.test(email)) {
            return false;
        }

        // Split email into local and domain parts
        const parts = email.split('@');
        if (parts.length !== 2) {
            return false;
        }

        const localPart = parts[0];
        const domain = parts[1];

        // Validate local part (before @)
        if (localPart.length < 1 || localPart.length > 64) {
            return false;
        }

        // Validate domain part
        if (domain.length < 1 || domain.length > 253) {
            return false;
        }

        // Domain must not start or end with dot
        if (domain.startsWith('.') || domain.endsWith('.')) {
            return false;
        }

        // Domain must not start or end with hyphen
        if (domain.startsWith('-') || domain.endsWith('-')) {
            return false;
        }

        // Domain must have at least one dot
        if (!domain.includes('.')) {
            return false;
        }

        // Check TLD (Top Level Domain) is at least 2 characters
        const domainParts = domain.split('.');
        const tld = domainParts[domainParts.length - 1];
        if (tld.length < 2) {
            return false;
        }

        // No consecutive dots
        if (email.includes('..')) {
            return false;
        }

        return true;
    }

    /**
     * Gets user-friendly error message
     * @param {string} email - Email address that failed validation
     * @returns {string} - Error message
     */
    function getEmailErrorMessage(email) {
        if (!email || email.trim().length === 0) {
            return 'Email address is required';
        }

        email = email.trim();

        if (!email.includes('@')) {
            return 'Email must contain @ symbol';
        }

        const parts = email.split('@');
        if (parts.length > 2) {
            return 'Email must contain only one @ symbol';
        }

        if (parts[0].length === 0) {
            return 'Email must have text before @ symbol';
        }

        const domain = parts[1];
        if (!domain || domain.length === 0) {
            return 'Email must have a domain after @ symbol';
        }

        if (domain.startsWith('.')) {
            return 'Domain cannot start with a dot';
        }

        if (!domain.includes('.')) {
            return 'Email must include a valid domain (e.g., .com, .org)';
        }

        return 'Please enter a valid email address';
    }

    // Attach real-time validation to email inputs
    function attachValidation() {
        const emailInputs = document.querySelectorAll('input[type="email"]');

        emailInputs.forEach(function(input) {
            // Create error message element
            const errorSpan = document.createElement('span');
            errorSpan.className = 'email-error-message';
            errorSpan.style.color = '#dc3545';
            errorSpan.style.fontSize = '0.875rem';
            errorSpan.style.display = 'none';
            errorSpan.style.marginTop = '0.25rem';

            // Insert error message after input
            if (input.parentNode) {
                input.parentNode.insertBefore(errorSpan, input.nextSibling);
            }

            // Validate on blur
            input.addEventListener('blur', function() {
                const email = this.value;
                if (email && !isValidEmail(email)) {
                    this.classList.add('is-invalid');
                    errorSpan.textContent = getEmailErrorMessage(email);
                    errorSpan.style.display = 'block';
                } else {
                    this.classList.remove('is-invalid');
                    errorSpan.style.display = 'none';
                }
            });

            // Clear error on input
            input.addEventListener('input', function() {
                if (this.classList.contains('is-invalid')) {
                    const email = this.value;
                    if (isValidEmail(email)) {
                        this.classList.remove('is-invalid');
                        errorSpan.style.display = 'none';
                    }
                }
            });

            // Validate on form submit
            const form = input.closest('form');
            if (form) {
                form.addEventListener('submit', function(e) {
                    const email = input.value;
                    if (!isValidEmail(email)) {
                        e.preventDefault();
                        input.classList.add('is-invalid');
                        errorSpan.textContent = getEmailErrorMessage(email);
                        errorSpan.style.display = 'block';
                        input.focus();
                    }
                });
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', attachValidation);
    } else {
        attachValidation();
    }

    // Expose validation function globally for external use
    window.validateEmail = isValidEmail;
    window.getEmailErrorMessage = getEmailErrorMessage;

})();
