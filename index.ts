const Discord = require("discord.js");
const client = new Discord.Client();
const { token } = require("./config.json");
const fetch = require("node-fetch");

("https://api.canister.me/v1/community/packages/search?query=");

client.on(`ready`, () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(`message`, (msg) => {
  if (msg.author.bot) return;
  const regex = /\[\[.*\]\]/g;
  if (msg.content.match(regex)) {
    let commandContent = msg.content.match(regex);
    let tweakName = String(commandContent)
      .replace(/\[/g, "")
      .replace(/\]/g, "");

    fetch(
      `https://api.canister.me/v1/community/packages/search?query=${tweakName}`
    )
      .then((res) => res.json())
      .then((out) => {
        const tweak = out.data[0];
        // console.log(JSON.stringify(out, null, 2));
        const embed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setTitle("")
          .setURL("")
          .setAuthor(`${tweak.name}`, ``, `${tweak.depiction}`)
          .setThumbnail(`${tweak.icon}` ? tweak.icon : ``)
          .setDescription(tweak.description)
          .addFields(
            {
              name: "Author",
              value: tweak.author ? tweak.author : `No Author`,
              inline: true,
            },
            {
              name: "Repository",
              value: tweak.repositoryURI ? tweak.repositoryURI : `No Repo URL`,
              inline: true,
            },
            {
              name: "Depiction",
              value: tweak.depiction ? tweak.depiction : `No Depiction`,
              inline: false,
            }
          )
          // .addField("Inline field title", "Some value here", true)
          // .setImage("https://i.imgur.com/wSTFkRM.png")
          // .setTimestamp()
          .setFooter(out.date, tweak.icon);

        msg.channel.send(embed).catch((err) => {
          const embed = new Discord.MessageEmbed()
            .setAuthor(`Uh Oh`)
            .setDescription(`Something went wrong :/`);
          msg.channel.send(embed);
          msg.delete();
        });
        msg.delete();
      })
      .catch((err) => {
        const embed = new Discord.MessageEmbed()
          .setAuthor(`Uh Oh`)
          .setDescription(`Something went wrong :/`);
        msg.channel.send(embed);
        msg.delete();
      });
  }
});

client.login(token);
