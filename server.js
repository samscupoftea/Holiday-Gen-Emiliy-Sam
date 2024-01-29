const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const { configuration, OpenAI } = require('openai');
const { createApi } = require('unsplash-js');
const app = express();
let country = "";

// Unsplash API Setup
global.fetch = fetch;
const unsplash = createApi({ accessKey: process.env.unsplashAPI });



// Call the function to get photos
// getPhotos().catch(console.error);

app.use(express.static('public')); // Serve static files from 'public' directory

// Define a new endpoint that includes a country name as part of the URL path
app.get('/api/countries/:name', async (req, res) => {
    const countryName = req.params.name;
    const url = `https://restcountries.com/v3.1/name/${countryName}?fullText=true`;
    country = countryName;

    try {
        const response = await fetch(url);
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Error fetching country details:', error);
        res.status(500).send('Internal Server Error');
    }
});

const openai = new OpenAI({
    apiKey: process.env.openaiAPI,
});

app.get("/openai", async (req, res) => {
    const completion = await openai.chat.completions.create({
        messages: [
            {
                role: "user",
                content: `Provide a seven day holiday plan for ${country}. Provide the information formatted in HTML. The title should read 'Seven Days in ${country}' and be written in <h3>, and subtitles should be in <h4 class="chat-subtitles">. Do not style anything that is returned or use bullet points.`
            },
        ],
        model: "gpt-3.5-turbo",
        max_tokens: 2000,
    });
    res.json(completion);
});

// Function to get photos from Unsplash - Now properly inside an async function


// async function getPhotos() {
//   const photos = await unsplash.search.getPhotos({ query: "tiger" });
//   console.log(JSON.stringify(photos, null, 2));
// }

// This endpoint should be added to your server.js file.
app.get('/unsplash', async (req, res) => {
  try {
      const photosResponse = await unsplash.search.getPhotos({ query: "tiger" });
      const photos = photosResponse.response.results;
      res.json(photos);
  } catch (error) {
      console.error('Error fetching images:', error);
      res.status(500).send('Internal Server Error');
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
