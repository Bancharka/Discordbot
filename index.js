const fs = require('fs');
const path = require('path');
const { Client, Collection, GatewayIntentBits, Events } = require('discord.js');
const { token } = require('./config.json');

// Erstelle den Client mit den benötigten Intents
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Sammlung (Collection) für Befehle
client.commands = new Collection();

// Lade alle Befehle aus dem Ordner "commands"
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Speichere jeden Befehl in der Collection
    client.commands.set(command.data.name, command);
}

// Funktion zur Registrierung der Befehle
async function registerCommands() {
    const commands = [];

    client.commands.forEach(command => {
        commands.push(command.data.toJSON());
    });

    try {
        await client.application.commands.set(commands);
        console.log('Commands registered successfully!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

// Event-Handler, wenn der Bot online ist
client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user.tag}`);
    await registerCommands(); // Registriere die Befehle
});

// Event-Handler für Slash-Befehl-Interaktionen
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// Bot mit dem Token einloggen
client.login(token);
