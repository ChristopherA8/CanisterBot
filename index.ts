const Discord = require("discord.js");
const client = new Discord.Client();
const { token } = require("./config.json");
const axios = require("axios").default;
const fetch = require("node-fetch");

// Imma work on this tomorrow, cause the api was down
// Todo list:
// use axios
// add page feature
// :)

("https://api.canister.me/v1/community/packages/search?query=");
("https://api.canister.me/v1/community/packages/search?query=(query)&searchFields=packageId,name,author,maintainer&responseFields=packageId,name,description,icon,repositoryURI,author,latestVersion,nativeDepiction,depiction");

client.on(`ready`, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(`message`, (msg) => {
  if (msg.author.bot) return;
  let currentPage = 0;

  const regex = /\[\[.*\]\]/g;
  if (msg.content.match(regex)) {
    let commandContent = msg.content.match(regex);
    let tweakName = String(commandContent)
      .replace(/\[/g, "")
      .replace(/\]/g, "");

    fetch(
      `https://api.canister.me/v1/community/packages/search?query=${tweakName}&searchFields=packageId,name&responseFields=packageId,name,price,description,icon,repositoryURI,author,latestVersion,nativeDepiction,depiction,versions`
    )
      .then((res) => res.json())
      .then((out) => {
        console.log(out.data.length);
        const package = out.data[0];
        if (!package) throw new Error("Package not found");

        // Why why why
        let icon = package.icon;
        if (package.icon.includes(`file://`)) icon = "";

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
          .setFooter(out.date, icon ? icon : ``);

        msg.channel
          .send(embed)
          .then((message) => {
            if (out.data.length <= 1) return;
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
              console.log(`Collected ${reaction.emoji.name} from ${user.tag}`);
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
                console.log(currentPage);
              }
              if (
                reaction.emoji.name === "▶" &&
                currentPage < out.data.length
              ) {
                currentPage++;
                console.log(currentPage);
              }

              let package = out.data[currentPage];
              // Why why why
              let icon = package.icon;
              if (package.icon.includes(`file://`)) icon = "";

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
                .setFooter(out.date, icon ? icon : ``);

              message.edit(embed);
            });

            collector.on("end", (collected) => {
              console.log(`Collected ${collected.size} items`);
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

client.login(token);
