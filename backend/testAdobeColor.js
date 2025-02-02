const axios = require('axios');

const apiKey = '95da2b55e04b4b37be74394cac1ef9df'; // Your API key
const url = 'https://color.adobe.io/v2/some-endpoint'; // Replace with a valid endpoint

const testAdobeColorAPI = async () => {
    try {
        const response = await axios.get(url, {
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });
        console.log('API Response:', response.data);
    } catch (error) {
        console.error('Error fetching from Adobe Color API:', error.response ? error.response.data : error.message);
    }
};

testAdobeColorAPI();
