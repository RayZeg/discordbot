const { Client, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
} = require("@discordjs/voice");
const path = require("path");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
});

const TARGET_USER_ID = process.env.TARGET_USER_ID; // Replace with the target user's Discord ID
const AUDIO_FILE_PATH = path.join(__dirname, "public/videoplayback.m4a"); // Replace with your audio file path

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("voiceStateUpdate", (oldState, newState) => {
  // Check if the user is the target user and has joined a voice channel
  if (
    newState.member.id === TARGET_USER_ID &&
    !oldState.channel &&
    newState.channel
  ) {
    // Join the voice channel
    const connection = joinVoiceChannel({
      channelId: newState.channel.id,
      guildId: newState.guild.id,
      adapterCreator: newState.guild.voiceAdapterCreator,
    });

    // Create an audio player and play the audio file
    const player = createAudioPlayer();
    const resource = createAudioResource(AUDIO_FILE_PATH);

    player.play(resource);
    connection.subscribe(player);

    // Disconnect after 30 seconds
    setTimeout(() => {
      connection.destroy();
      console.log("Disconnected from voice channel after 30 seconds");
    }, 30000);

    // Disconnect when playback is done
    player.on("idle", () => {
      connection.destroy();
      console.log("Disconnected after playback finished.");
    });
  }
});

// Use environment variable for the token
client.login(process.env.DISCORD_TOKEN);

// Exporting a placeholder HTTP function for Vercel
module.exports = (req, res) => {
  res.status(200).send("Bot is running");
};
