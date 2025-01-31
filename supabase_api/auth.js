const { createClient } = require('@supabase/supabase-js');
const http = require('http');

// Your Supabase URL and API key
const SUPABASE_URL = "https://czrcvaekcadbxgyiciat.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN6cmN2YWVrY2FkYnhneWljaWF0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU3OTMyMzYsImV4cCI6MjA1MTM2OTIzNn0.ZYtUC6q28eWLTXtD03NU9h6qGOvWikJUfGgweLt9jdM";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Function to sign in with Google using OAuth
const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'http://localhost:3000/callback', // Your local server's redirect URL
    },
  });

  if (error) {
    console.error('Error during sign-in:', error.message);
  } else {
    console.log('Open this URL in your browser:', data.url);
  }
};

// Start a local server to handle the redirect
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/callback')) {
    const urlParams = new URLSearchParams(req.url.split('?')[1]);
    const accessToken = urlParams.get('access_token');
    console.log('Access Token:', accessToken);
    res.end('Authentication successful! You can close this window.');
    server.close(); // Stop the server after handling the request
  }
});

// Function to start the local server on port 3000
const startServer = () => {
  server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    signInWithGoogle(); // Start the sign-in process
  });
};

// Start the process by running the server
startServer();
