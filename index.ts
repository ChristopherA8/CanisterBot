/*
 * Discord bot for api.canister.me
 *
 * Developed by Chr1s (christopher#8888)
 */

const Discord = require("discord.js");
const { Client, Intents } = require("discord.js");
const client = new Client({ intents: [Intents.NON_PRIVILEGED] });
const { token } = require("./config.json");
const axios = require("axios");

client.on(`ready`, () => {
  console.log(
    `Logged in as ${client.user.tag} in ${client.guilds.cache.size} guilds`
  );
  client.user.setActivity(`in ${client.guilds.cache.size} server`);
});

client.on(`message`, async (msg) => {
  if (msg.author.bot) return;
  let currentPage = 0;

  const regex = /\[\[.*\]\]/g;
  if (msg.content.match(regex)) {
    let commandContent = msg.content.match(regex);
    let tweakName = String(commandContent)
      .replace(/\[/g, "")
      .replace(/\]/g, "");

    axios
      .get(
        `https://api.canister.me/v1/community/packages/search?query=${tweakName}&searchFields=packageId,name&responseFields=packageId,name,price,description,icon,repositoryURI,author,latestVersion,nativeDepiction,depiction,versions`
      )
      .then(function (res) {
        let response = res.data;
        const package = response.data[0];

        // This is uhhh...... :/
        if (!package) throw new Error("Package not found");

        // Why why why
        let icon = package.icon;
        if (icon) {
          if (package.icon.includes(`file://`)) icon = "";
        }

        const embed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setAuthor(
            `${package.name}`,
            ``,
            `${package.depiction ? package.depiction : ""}`
          )
          .setThumbnail(icon ? icon : ``)
          .setDescription(
            package.description ? package.description : "No Description"
          )
          .addFields(
            {
              name: "Author",
              value: package.author ? package.author : `No Author`,
              inline: true,
            },
            {
              name: "Version",
              value: package.latestVersion
                ? package.latestVersion
                : `No Version`,
              inline: true,
            },
            {
              name: "Price",
              value: package.price ? package.price : `No Price`,
              inline: true,
            },
            {
              name: "BundleID",
              value: package.packageId ? package.packageId : `No BundleID`,
              inline: false,
            },
            {
              name: "Depiction",
              value: package.depiction ? package.depiction : `No Depiction`,
              inline: false,
            }
          )
          .setFooter(response.date, icon ? icon : ``);

        msg.channel
          .send(embed)
          .then((message) => {
            if (response.data.length <= 1) return;
            message.react(`◀`);
            message.react(`▶`);

            const filter = (reaction, user) => {
              return (
                (reaction.emoji.name === "◀" || reaction.emoji.name === "▶") &&
                !user.bot
              );
            };

            const collector = message.createReactionCollector(filter, {
              time: 30000,
            });

            collector.on("collect", async (reaction, user) => {
              // Remove the reaction when changing the page
              const userReactions = message.reactions.cache.filter((reaction) =>
                reaction.users.cache.has(user.id)
              );
              try {
                for (const reaction of userReactions.values()) {
                  await reaction.users.remove(user.id);
                }
              } catch (error) {
                console.error("Failed to remove reactions.");
              }
              if (reaction.emoji.name === "◀" && currentPage > 0) {
                currentPage--;
                // console.log(currentPage);
              }
              if (
                reaction.emoji.name === "▶" &&
                currentPage < response.data.length - 1
              ) {
                currentPage++;
                // console.log(currentPage);
              }

              let package = response.data[currentPage];
              // Why why why
              let icon = package.icon;
              if (icon) {
                if (package.icon.includes(`file://`)) icon = "";
              }

              const embed = new Discord.MessageEmbed()
                .setColor("#0099ff")
                .setAuthor(
                  `${package.name}`,
                  ``,
                  `${package.depiction ? package.depiction : ""}`
                )
                .setThumbnail(icon ? icon : ``)
                .setDescription(
                  package.description ? package.description : "No Description"
                )
                .addFields(
                  {
                    name: "Author",
                    value: package.author ? package.author : `No Author`,
                    inline: true,
                  },
                  {
                    name: "Version",
                    value: package.latestVersion
                      ? package.latestVersion
                      : `No Version`,
                    inline: true,
                  },
                  {
                    name: "Price",
                    value: package.price ? package.price : `No Price`,
                    inline: true,
                  },
                  {
                    name: "BundleID",
                    value: package.packageId
                      ? package.packageId
                      : `No BundleID`,
                    inline: false,
                  },
                  {
                    name: "Depiction",
                    value: package.depiction
                      ? package.depiction
                      : `No Depiction`,
                    inline: false,
                  }
                )
                .setFooter(response.date, icon ? icon : ``);

              message.edit(embed);
            });

            collector.on("end", (collected) => {
              // console.log(`Collected ${collected.size} items`);
              message.reactions
                .removeAll()
                .catch((error) =>
                  console.error("Failed to clear reactions: ", error)
                );
            });
          })
          .catch((err) => {
            console.log(err);
            const embed = new Discord.MessageEmbed()
              .setAuthor(`Uh oh`)
              .setDescription(`Something went wrong`);
            msg.channel.send(embed);
          });
      })
      .catch((err) => {
        console.log(err);
        const embed = new Discord.MessageEmbed()
          .setAuthor(`Uh oh`)
          .setDescription(`Something went wrong`);
        msg.channel.send(embed);
      });
  }
});

client.on("interaction", (interaction) => {
  if (!interaction.isCommand()) return;
  if (interaction.commandName !== "search") return;
  let packageName = interaction.options[0].value;

  axios
    .get(
      `https://api.canister.me/v1/community/packages/search?query=${packageName}&searchFields=packageId,name&responseFields=packageId,name,price,description,icon,repositoryURI,author,latestVersion,nativeDepiction,depiction,versions`
    )
    .then(function (res) {
      let response = res.data;
      const package = response.data[0];

      // pls change this :)
      if (!package) throw new Error("Package not found");

      // Why why why
      let icon = package.icon;
      if (icon) {
        if (package.icon.includes(`file://`)) icon = "";
      }

      const embed = new Discord.MessageEmbed()
        .setColor("#0099ff")
        .setAuthor(
          `${package.name}`,
          ``,
          `${package.depiction ? package.depiction : ""}`
        )
        .setThumbnail(icon ? icon : ``)
        .setDescription(
          package.description ? package.description : "No Description"
        )
        .addFields(
          {
            name: "Author",
            value: package.author ? package.author : `No Author`,
            inline: true,
          },
          {
            name: "Version",
            value: package.latestVersion ? package.latestVersion : `No Version`,
            inline: true,
          },
          {
            name: "Price",
            value: package.price ? package.price : `No Price`,
            inline: true,
          },
          {
            name: "BundleID",
            value: package.packageId ? package.packageId : `No BundleID`,
            inline: false,
          },
          {
            name: "Depiction",
            value: package.depiction ? package.depiction : `No Depiction`,
            inline: false,
          }
        )
        .setFooter(response.date, icon ? icon : ``);

      interaction.reply(embed).catch((err) => {
        console.log(err);
        interaction.reply(`Something went wrong`, { ephemeral: true });
      });
    })
    .catch((err) => {
      console.log(err);
      interaction.reply(`Something went wrong`, { ephemeral: true });
    });
});

client.login(token);
