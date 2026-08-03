DISCORD TICKET BOT
===================

A simple support ticket bot. People click a button (or run a command), it
opens a private channel for them, staff can claim/close it, and closing
saves a text transcript. No database server needed, everything is stored
in a plain data/tickets.json file.

Made by Ivy (ivymakes).


WHAT IT DOES
------------
- Posts a panel with an "Open Ticket" button (or people can just run /ticket)
- Creates a private channel when someone opens a ticket (only they plus
  support roles can see it)
- One open ticket per person at a time
- Staff can claim a ticket (renames the channel so everyone knows it's
  being handled)
- Close button (or /close) saves a .txt transcript to a log channel,
  then deletes the channel
- /add and /remove to bring other people into a ticket


BEFORE YOU START
-----------------
You need:

- [Node.js](https://nodejs.org/) installed, version 18 or newer. If you're not
  sure whether you have it, open a terminal/command prompt and type:

      node -v

If that gives an error, go install it first.

- A Discord account and a server where you have admin permissions.


STEP 1 - GET THE BOT FILES ONTO YOUR COMPUTER
-----------------------------------------------
Download/unzip this folder wherever you want it to live, then open a
terminal in that folder.


STEP 2 - INSTALL THE DEPENDENCIES
------------------------------------
In the terminal, in the bot's folder, run:

    npm install

This downloads the packages the bot needs (discord.js, dotenv). It
creates a node_modules folder, that's normal, leave it alone.


STEP 3 - CREATE A DISCORD APPLICATION/BOT
--------------------------------------------
1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)

2. Click "New Application", name it whatever you want

3. Go to the "Bot" tab, click "Reset Token", and copy the token it
   gives you (you'll only see it once, so paste it somewhere safe
   for a second)

4. On that same Bot tab, scroll down and turn on:
   Presence Intent, Server Members Intent, Message Content Intent

5. Go to the "OAuth2 -> URL Generator" tab:
   - Under Scopes, check: bot, applications.commands
   - Under Bot Permissions, check: Manage Channels, View Channels,
     Send Messages, Read Message History, Attach Files, Embed Links
   - Copy the generated URL at the bottom, open it in your browser,
     and invite the bot to your server


STEP 4 - FILL IN YOUR .env FILE
----------------------------------
In the bot's folder, make a copy of .env.example and rename the copy
to .env. Then open .env in any text editor and fill in:

    DISCORD_TOKEN – the token you copied in step 3
    CLIENT_ID – Developer Portal -> your app -> General
                    Information -> Application ID
    GUILD_ID – in Discord, right-click your server icon ->
                    Copy Server ID
                    (turn on Developer Mode first: User Settings ->
                    Advanced -> Developer Mode)

Never share your .env file or post your token anywhere. If your
token ever leaks, go reset it in the Developer Portal immediately.


STEP 5 - EDIT config.js
--------------------------
This is where the non-secret settings live, open config.js in a
text editor:

    supportRoleIds – the role(s) that can see/claim tickets.
                            Add as many as you want, e.g.
                            ['123...', '456...']. Right-click a role
                            -> Copy Role ID (needs Developer Mode on,
                            same as above).

    ticketCategoryId – the channel category new ticket channels
                            get created under. Right-click the
                            category -> Copy Category ID. Leave as
                            null to skip this and create tickets at
                            the top level.

    transcriptChannelId – the channel closed-ticket transcripts get
                            posted to. Right-click the channel ->
                            Copy Channel ID.


STEP 6 - REGISTER THE SLASH COMMANDS
---------------------------------------
Still in the terminal, in the bot's folder, run:

    npm run deploy

Run this again anytime you add or change a command.


STEP 7 - START THE BOT
-------------------------
Run:

    npm start

If it prints "Logged in as YourBotName#0000", it's working.


STEP 8 - POST THE PANEL (optional)
-------------------------------------
In your Discord server, in whatever channel you want the ticket
panel in, run:

    /panel

That posts the "Open Ticket" button. People can also just run /ticket
directly without needing the panel, whichever's easier for your
server.


FILE STRUCTURE
---------------
discord-ticket-bot/
  index.js              entry point, logs in, loads commands/events
  deploy-commands.js    registers the slash commands with Discord
  config.js             non-secret settings: support roles,
                         category, transcript channel
  package.json
  .env.example           copy to .env and fill in (token/IDs only)
  .gitignore 
  README.md

  data/
    tickets.json            the "database", auto-updated, don't
                            edit by hand while the bot's running

  commands/
    panel.js                /panel    posts the open-ticket button
    ticket.js                /ticket   opens a ticket directly,
                            no panel needed
    close.js                /close
    add.js                   /add @user
    remove.js           /remove @user

  events/
    ready.js                logs "Logged in as..." on startup
    interactionCreate.js    routes slash commands and button clicks

  handlers/
    ticketManager.js        the actual open/claim/close/add/remove logic

  utils/
    db.js                    reads/writes data/tickets.json
    transcript.js            builds the .txt transcript on close


TROUBLESHOOTING
-----------------
- Slash commands aren't showing up
  Run npm run deploy again, then fully restart Discord (close and
  reopen it).

- "Missing DISCORD_TOKEN"
  You didn't rename .env.example to .env, or forgot to paste the
  token in.

- Bot doesn't respond / offline
  Make sure npm start is still running in a terminal window.

- Bot can't create channels
  Double check it has Manage Channels permission in the server
  (and in that category, if you set ticketCategoryId).

- Nobody can claim tickets
  Check that supportRoleIds in config.js actually has role IDs in
  it, and that the ID is right (it should be a long number, not
  the role name).
