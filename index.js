require("dotenv").config();

const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildInvites
  ]
});

const inviteCache = new Map();

const WELCOME_CHANNEL = "1511249061796380793";
const RULES_CHANNEL = "1510886925278646403";
const PRICE_CHANNEL = "1510888015772258354";

client.once("ready", async () => {
  console.log(`${client.user.tag} is online!`);

  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.invites.fetch();
      inviteCache.set(guild.id, invites);
    } catch (err) {
      console.log(`Failed to cache invites for ${guild.name}`);
    }
  }
});

client.on("inviteCreate", async invite => {
  const invites = await invite.guild.invites.fetch();
  inviteCache.set(invite.guild.id, invites);
});

client.on("inviteDelete", async invite => {
  const invites = await invite.guild.invites.fetch();
  inviteCache.set(invite.guild.id, invites);
});

client.on("guildMemberAdd", async member => {
  const channel = member.guild.channels.cache.get(WELCOME_CHANNEL);

  if (!channel) return;

  let inviter = "Unknown";

  try {
    const oldInvites = inviteCache.get(member.guild.id);
    const newInvites = await member.guild.invites.fetch();

    const usedInvite = newInvites.find(invite => {
      const oldUses = oldInvites?.get(invite.code)?.uses || 0;
      return invite.uses > oldUses;
    });

    if (usedInvite?.inviter) {
      inviter = `<@${usedInvite.inviter.id}>`;
    }

    inviteCache.set(member.guild.id, newInvites);
  } catch (err) {
    console.error(err);
  }

  const embed = new EmbedBuilder()
    .setColor("#00FF9D")
    .setTitle("🌿 Welcome to MiNT Services™")
    .setDescription(
`Welcome ${member}! ⚡

We're excited to have you join MiNT Services.

🍈 Fruit Grinding
⚔️ Raid Carries
🏆 PvP Training
💎 Level Farming
🎯 Custom Services

━━━━━━━━━━━━━━━━━━

📅 Join Date » <t:${Math.floor(Date.now() / 1000)}:F>

👤 Account Created » <t:${Math.floor(member.user.createdTimestamp / 1000)}:F>

📊 Member Count » ${member.guild.memberCount}

📜 Rules » <#${RULES_CHANNEL}>

💰 Price List » <#${PRICE_CHANNEL}>

🔗 Invited By » ${inviter}

━━━━━━━━━━━━━━━━━━

Please read the rules and pricing channels before opening a ticket.

Happy Grinding! ⚡`
    )
    .setThumbnail(
      member.user.displayAvatarURL({
        dynamic: true,
        size: 1024
      })
    )
    .setImage(
      "https://media.tenor.com/6ZUs587K4QAAAAAC/blox-fruits.gif"
    )
    .setFooter({
      text: "🌿 MiNT Services • Trusted Blox Fruits Solutions"
    })
    .setTimestamp();

  const buttons = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setLabel("📜 Rules")
        .setStyle(ButtonStyle.Secondary)
        .setCustomId("rules"),

      new ButtonBuilder()
        .setLabel("💰 Prices")
        .setStyle(ButtonStyle.Success)
        .setCustomId("prices")
    );

  await channel.send({
    content: `🎉 Welcome ${member}!`,
    embeds: [embed],
    components: [buttons]
  });
});

client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  if (interaction.customId === "rules") {
    await interaction.reply({
      content: `📜 Rules Channel: <#${RULES_CHANNEL}>`,
      ephemeral: true
    });
  }

  if (interaction.customId === "prices") {
    await interaction.reply({
      content: `💰 Price List: <#${PRICE_CHANNEL}>`,
      ephemeral: true
    });
  }
});

client.login(process.env.TOKEN);
