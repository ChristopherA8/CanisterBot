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

  const regex = /\[\[.*\]\]/g;
  if (msg.content.match(regex)) {
    let commandContent = msg.content.match(regex);
    let tweakName = String(commandContent)
      .replace(/\[/g, "")
      .replace(/\]/g, "");

    fetch(
      `https://api.canister.me/v1/community/packages/search?query=${tweakName}&searchFields=name&responseFields=packageId,name,price,description,icon,repositoryURI,author,latestVersion,nativeDepiction,depiction,versions`
    )
      .then((res) => res.json())
      .then((out) => {
        console.log(out);
        const package = out.data[0];
        // let price = package.price;
        // if (price == "0") {
        //   price = "Free";
        // }
        const embed = new Discord.MessageEmbed()
          .setColor("#0099ff")
          .setAuthor(`${package.name}`, ``, `${package.depiction}`)
          .setThumbnail(`${package.icon}` ? package.icon : ``)
          .setDescription(package.description)
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
          .setFooter(out.date, package.icon);

        msg.channel.send(embed).catch((err) => {
          const embed = new Discord.MessageEmbed()
            .setAuthor(`Uh oh`)
            .setDescription(`Something went wrong`);
          msg.channel.send(embed);
        });
      })
      .catch((err) => {
        const embed = new Discord.MessageEmbed()
          .setAuthor(`Uh oh`)
          .setDescription(`Something went wrong`);
        msg.channel.send(embed);
      });
  }
});

client.login(token);
