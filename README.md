# DET175 Warrior Knowledge Quiz Chatbot

![Chatbot Screenshot](https://via.placeholder.com/800x400?text=Chatbot+Screenshot)

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Demo](#demo)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview

DET175 Warrior Knowledge Quiz Chatbot is an interactive web-based chatbot designed to help cadets quiz themselves on the **DET175 Cadet Handbook Information Fall 2024**. Leveraging OpenAI's GPT-4 model, the chatbot generates diverse and randomized questions based on the handbook's content, facilitating effective self-assessment and learning.

## Features

- **Interactive Quiz:** Engage with the chatbot to receive questions covering various sections of the DET175 Cadet Handbook.
- **Dynamic Question Generation:** Utilizes OpenAI's GPT-4omini to generate diverse questions, including factual recall, rank identification, mission statements, historical facts, leadership roles, and key doctrines.
- **Session Management:** Maintains individual chat histories to ensure personalized interactions.
- **Rate Limiting:** Protects the server by limiting the number of requests per IP address.
- **Dark/Light Mode:** Offers a toggle between dark and light themes for enhanced user experience.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## Demo

![Chatbot Interaction](https://github.com/sozodennis01/Det175WarriorKnowledgeChatBot/blob/main/Det175WKChatbotPhoto.jpg)

*Note: Replace the placeholder images with actual screenshots or GIFs of your chatbot in action.*

## Technologies Used

- **Frontend:**
  - HTML5
  - CSS3
  - JavaScript

- **Backend:**
  - Node.js
  - Express.js
  - OpenAI API
  - dotenv
  - body-parser
  - express-rate-limit

## Installation

### Prerequisites

- **Node.js** (v18 or later)
- **npm** (Node Package Manager)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/DET175-Quiz-Chatbot.git
   cd DET175-Quiz-Chatbot
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Prepare Environment Variables**

   Create a `.env` file in the root directory and add your OpenAI API key:

   ```env
   OPENAI_DET175_DEV=your-openai-api-key
   PORT=3000
   ```

   *Replace `your-openai-api-key` with your actual OpenAI API key.*

4. **Add the Cadet Handbook Text File**

   Ensure the `DET175_CadetHandbook_F24_9OCT2024.txt` file is placed inside the `public` directory.

   ```bash
   public/
     └── DET175_CadetHandbook_F24_9OCT2024.txt
   ```

## Configuration

- **Environment Variables:**

  | Variable           | Description                                 | Default  |
  | ------------------ | ------------------------------------------- | -------- |
  | `OPENAI_DET175_DEV` | Your OpenAI API key                        | N/A      |
  | `PORT`             | Port number for the server to listen on     | `3000`   |

- **Rate Limiting:**

  Configured to allow **5 requests per minute** per IP address. Adjust the `windowMs` and `max` values in `index.mjs` as needed.

  ```javascript
  const limiter = rateLimit({
      windowMs: 1 * 60 * 1000, // 1 minute window
      max: 5, // limit each IP to 5 requests per 1 minute
  });
  ```

## Usage

1. **Start the Server**

   ```bash
   npm start
   ```

   *If you have defined a start script in your `package.json`, e.g., `"start": "node index.mjs"`. Otherwise, run `node index.mjs`.*

2. **Access the Chatbot**

   Open your browser and navigate to `http://localhost:3000` (or the port you specified).

3. **Interact with the Chatbot**

   - **Ask Questions:** Type your answer in the input field and click "Send" or press Enter.
   - **Receive Questions:** The chatbot will generate questions based on the Cadet Handbook.
   - **Loading Indicator:** A `...` will appear in the chat while waiting for a response.

4. **Toggle Dark/Light Mode**

   Click the "Switch Mode" button at the top-right corner to toggle between dark and light themes.

## Project Structure

```
DET175-Quiz-Chatbot/
├── public/
│   ├── DET175_CadetHandbook_F24_9OCT2024.txt
│   └── index.html
├── .env
├── index.mjs
├── package.json
└── README.md
```

- **public/**: Contains static files served by Express, including the Cadet Handbook text and the frontend `index.html`.
- **index.mjs**: Main server file handling API requests and interfacing with OpenAI.
- **package.json**: Lists project dependencies and scripts.
- **README.md**: Project documentation (this file).

## Contributing

Contributions are welcome! Follow the steps below to contribute to this project.

### Steps to Contribute

1. **Fork the Repository**

   Click the "Fork" button at the top-right corner of the repository page.

2. **Clone Your Fork**

   ```bash
   git clone https://github.com/yourusername/DET175-Quiz-Chatbot.git
   cd DET175-Quiz-Chatbot
   ```

3. **Create a New Branch**

   ```bash
   git checkout -b feature/YourFeatureName
   ```

4. **Make Changes**

   Implement your feature or bug fix.

5. **Commit Your Changes**

   ```bash
   git commit -m "Add feature: YourFeatureName"
   ```

6. **Push to Your Fork**

   ```bash
   git push origin feature/YourFeatureName
   ```

7. **Create a Pull Request**

   Navigate to your fork on GitHub and click "Compare & pull request". Provide a clear description of your changes and submit the PR.

### Guidelines

- Ensure your code adheres to the existing coding style.
- Include comments and documentation where necessary.
- Test your changes thoroughly before submitting.
- Follow the [Code of Conduct](#code-of-conduct).

## License

This project is licensed under the [MIT License](LICENSE).

## Acknowledgments

- [OpenAI](https://openai.com/) for providing the powerful language model.
- [Express.js](https://expressjs.com/) for the robust backend framework.
- [dotenv](https://github.com/motdotla/dotenv) for environment variable management.
- [Express-rate-limit](https://github.com/nfriedly/express-rate-limit) for protecting the server against brute-force attacks.
- Inspired by AFROTC Cadet Handbook requirements.

---

*Maintained by [C/Sarsozo](mailto:dsarsozo@hawaii.edu). For any questions or concerns, feel free to reach out! 🤙🏽*
