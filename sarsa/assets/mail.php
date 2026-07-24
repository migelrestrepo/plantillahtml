<?php

    /**
     * Enhanced email validation function
     * Validates email format more strictly than FILTER_VALIDATE_EMAIL
     * Prevents acceptance of invalid formats like usuario@.com
     */
    function validateEmailStrict($email) {
        // Basic filter validation
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return false;
        }

        // Length constraints (RFC 5321)
        if (strlen($email) < 3 || strlen($email) > 254) {
            return false;
        }

        // Split into local and domain parts
        $parts = explode('@', $email);
        if (count($parts) !== 2) {
            return false;
        }

        $localPart = $parts[0];
        $domain = $parts[1];

        // Validate local part length
        if (strlen($localPart) < 1 || strlen($localPart) > 64) {
            return false;
        }

        // Validate domain part length
        if (strlen($domain) < 1 || strlen($domain) > 253) {
            return false;
        }

        // Domain must not start or end with dot
        if ($domain[0] === '.' || substr($domain, -1) === '.') {
            return false;
        }

        // Domain must not start or end with hyphen
        if ($domain[0] === '-' || substr($domain, -1) === '-') {
            return false;
        }

        // Domain must have at least one dot
        if (strpos($domain, '.') === false) {
            return false;
        }

        // Check TLD is at least 2 characters
        $domainParts = explode('.', $domain);
        $tld = end($domainParts);
        if (strlen($tld) < 2) {
            return false;
        }

        // No consecutive dots
        if (strpos($email, '..') !== false) {
            return false;
        }

        // Additional check: domain should match valid format
        if (!preg_match('/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/', $domain)) {
            return false;
        }

        return true;
    }

    // Only process POST reqeusts.
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        // Get the form fields and remove whitespace.
        $name = strip_tags(trim($_POST["name"]));
        $name = str_replace(array("\r","\n"),array(" "," "),$name);
        $email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
        $subject = trim($_POST["subject"]);
        $message = trim($_POST["message"]);

        // Check that data was sent to the mailer with enhanced email validation.
        if ( empty($name) OR empty($subject) OR empty($message) OR !validateEmailStrict($email)) {
            // Set a 400 (bad request) response code and exit.
            http_response_code(400);
            echo "Please complete the form with valid information and try again.";
            exit;
        }

        // Set the recipient email address.
        // FIXME: Update this to your desired email address.
        $recipient = "founder@stthemes.com";

        // Set the email subject.
        $sender = "New contact from $name";

        //Email Header
        $head = " /// STTHEMES \\\ ";

        // Build the email content.
        $email_content = "$head\n\n\n";
        $email_content .= "Name: $name\n";
        $email_content .= "Email: $email\n\n";
        $email_content .= "Subject: $subject\n\n";
        $email_content .= "Message:\n$message\n";

        // Build the email headers.
        $email_headers = "From: $name <$email>";

        // Send the email.
        if (mail($recipient, $sender, $email_content, $email_headers)) {
            // Set a 200 (okay) response code.
            http_response_code(200);
            echo "Thank You! Your message has been sent.";
        } else {
            // Set a 500 (internal server error) response code.
            http_response_code(500);
            echo "Oops! Something went wrong and we couldn't send your message.";
        }

    } else {
        // Not a POST request, set a 403 (forbidden) response code.
        http_response_code(403);
        echo "There was a problem with your submission, please try again.";
    }

?>
