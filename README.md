# x402 Arcade - A Peer-to-Peer Gaming Platform on Aptos

x402 Arcade is a decentralized peer-to-peer gaming platform built on the Aptos blockchain. It enables players to create lobbies, bet Aptos tokens, and participate in AI-powered mini-games with transparent and secure outcomes.

## Features

*   **PvP Gameplay**: Challenge other players in various mini-games.
*   **Win-to-Earn**: Bet Aptos tokens and win real rewards.
*   **Decentralized Lobbies**: Create and join game sessions with unique invite links.
*   **AI Mini-Games**: Play against an AI opponent in games like "Taboo the AI".
*   **Aptos Wallet Integration**: Seamless connectivity with your Aptos wallet for transactions.
*   **Transparent Outcomes**: All game results and payouts are verifiable on the Aptos blockchain.

## Getting Started

Follow these steps to set up and run the x402 Arcade project locally.

### Prerequisites

Before you begin, ensure you have the following installed:

*   [Node.js](https://nodejs.org/en/) (LTS version recommended)
*   [npm](https://www.npmjs.com/) (usually comes with Node.js)
*   An Aptos-compatible wallet (e.g., Petra Wallet) installed in your browser and connected to the Aptos Testnet.

### Installation

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd x402-Arcade-p2p
    ```

2.  **Install dependencies:**

    Navigate to the project root directory and install the necessary dependencies for the monorepo setup. This will install dependencies for the `frontend` workspace.

    ```bash
    npm install
    ```

### Running the Application

1.  **Start the frontend development server:**

    From the project root directory, run the development server for the frontend application.

    ```bash
    npm run dev
    ```

    The application will typically be available at `http://localhost:3000`.

2.  **Open in your browser:**

    Navigate to `http://localhost:3000` in your web browser.

3.  **Connect your Aptos Wallet:**

    Ensure your Aptos wallet (e.g., Petra) is unlocked and connected to the Aptos Testnet.

## Project Structure

*   `backend/`: (Future development for smart contract deployment/interaction helpers)
*   `frontend/`: Contains the Next.js application for the user interface.
    *   `components/`: Reusable React components.
    *   `pages/`: Next.js pages and API routes.
    *   `public/`: Static assets.
    *   `styles/`: Global CSS.
*   `package.json`: Project-wide dependencies and scripts.

## Smart Contract (Future/Placeholder)

This project is designed to interact with an Aptos smart contract for actual betting and prize distribution. The smart contract logic is assumed to be deployed on the Aptos Testnet. Details on the smart contract interface (e.g., function names, arguments) would be provided here for full integration.

## Contributing

Feel free to fork the repository, make improvements, and submit pull requests.
