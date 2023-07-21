<div align="center">
  <img src="https://media.discordapp.net/attachments/588083425496399892/1132003213109903370/void.png" alt="VoidChat Logo">
</div>

Void Chat is a simplistic and purely anonymous chat app developed by [ButterDebugger](https://github.com/ButterDebugger).
## Features

- **Anonymity**: Chat with others without revealing your identity.
- **Simplicity**: A straightforward interface for easy communication.
- **Real-time**: Instantly send and receive messages.

## Getting Started

To get started with Void Chat, follow these steps:
1. Clone the repository: `git clone https://github.com/HeyItsSloth/VoidChat.git`
2. Install the dependencies: `npm install`
3. Create a `.env` file in the root directory and add the following environment variables:

 -   PORT = <0 - 65535> (optional, defaults to 8080)
 -   TOKEN_SECRET = <128 characters>
 -   CLOUD_TOKEN = <cloud.butterycode.com database token> (optional)


4. #### You can start the node.js server in a couple of ways!
 -  `node server.js`

 - ###### With the new flagging system in the server.js file, we have a couple of new options

 - `node server.js -log`
 - ###### This allows users to activate a logging feature so that all events are logged in the console, along with this update, brings subflags like -icons or -app
 - `node server.js -log -app`
 - `node server.js -log -icons`
 - ###### this allows users to log specific application pulls, from /app or from /icons to see if there are any events not loading or icons not loading
 ---

## Usage

Once the server is running, open your web browser and navigate to `http://localhost:8080` to access Void Chat.

## Contributing

We welcome contributions to Void Chat. To contribute, please follow these guidelines:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -am 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Submit a pull request.

## Support

If you have any questions, issues, or suggestions, please feel free to [open an issue](https://github.com/HeyItsSloth/VoidChat/issues).

## Discord

Join our Discord community to stay updated and interact with other VoidChat users.

[![Discord](https://img.shields.io/badge/Join%20Us%20on-Discord-7289DA.svg?logo=discord&logoColor=white)](https://discord.gg/TBkjPn6mHg)

## License

Void Chat is released under the [MIT License](https://raw.githubusercontent.com/HeyItsSloth/VoidChat/main/LICENSE).
