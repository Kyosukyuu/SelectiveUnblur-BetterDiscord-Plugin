/**
 * @name SelectiveUnblur
 * @author Kyosukyuu
 * @authorId 196430252161892352
 * @version 0.0.2
 * @description Unblur certain channels of your choosing
 * @source https://github.com/Kyosukyuu/SelectiveUnblur-BetterDiscord-Plugin
 * @updateUrl https://raw.githubusercontent.com/Kyosukyuu/SelectiveUnblur-BetterDiscord-Plugin/main/SelectiveUnblur.plugin.js
 */

// Huge thanks to whoever made MessageLoggerV2, as I learned and based off my code from it

module.exports = (() => {
  const config = {
    info: {
      name: "SelectiveUnblur",
      authors: [
        {
          name: "Kyoskyuu",
        },
      ],
      version: "0.0.2",
      description: "Unblur certain channels of your choosing",
    },
    changelog: [],
    main: "index.js",
    defaultConfig: [],
  };

  return !global.ZeresPluginLibrary
    ? class {
        constructor() {
          this._config = config;
        }
        getName() {
          return config.info.name;
        }
        getAuthor() {
          return config.info.authors.map((a) => a.name).join(", ");
        }
        getDescription() {
          return config.info.description;
        }
        getVersion() {
          return config.info.version;
        }
        load() {
          BdApi.showConfirmationModal(
            "Library Missing",
            `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
            {
              confirmText: "Download Now",
              cancelText: "Cancel",
              onConfirm: () => {
                require("request").get(
                  "https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js",
                  async (error, response, body) => {
                    if (error)
                      return require("electron").shell.openExternal(
                        "https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js"
                      );
                    await new Promise((r) =>
                      require("fs").writeFile(
                        require("path").join(
                          BdApi.Plugins.folder,
                          "0PluginLibrary.plugin.js"
                        ),
                        body,
                        r
                      )
                    );
                  }
                );
              },
            }
          );
        }
        start() {}
        stop() {}
      }
    : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {
          const {
            DiscordSelectors,
            PluginUtilities,
            Tooltip,
            DiscordModules,
            Patcher,
            Utilities,
            DCM,
            DOMTools,
            ReactTools,
          } = Api;

          return class SelectiveUnblur extends Plugin {
            constructor() {
              super();
            }

            attemptUnblur() {
              const currentChannel = document.querySelector(
                ".title-17SveM.base-ZDDK0g.size16-CysEuG"
              );

              try {
                const channelsList =
                  this.settings["unblur-channels-list"].split(",");

                const shouldUnblur = channelsList.includes(
                  currentChannel.innerText
                );

                if (shouldUnblur) {
                  ZeresPluginLibrary.PluginUtilities.addStyle(
                    "unblur",
                    `
                    .spoilerWarning-8ovW0v {
                      display: none !important;
                    }

                    .spoiler-3aUoEX.hiddenSpoilers-19m4Pg, .spoilerEmbed-1LYr3G.hiddenSpoiler-3pPzRF .grid-1aWVsE {
                      filter: unset;
                      -webkit-filter: unset;
                    }

                    .theme-dark .spoilerText-27bIiA.hidden-3B-Rum {
                      background-color: transparent;
                    }
                    .spoilerText-27bIiA.hidden-3B-Rum .inlineContent-2YnoDy {
                      opacity: 1;
                    }
                    .theme-dark .spoilerText-27bIiA.hidden-3B-Rum:hover {
                      background-color: transparent;
                      text-decoration: underline;
                    }
                    `
                  );
                } else {
                  ZeresPluginLibrary.PluginUtilities.removeStyle("unblur");
                }
              } catch (e) {
                XenoLib.Notifications.error(
                  "There has been an error parsing the channels list, please make sure each channel list is seperated by a single comma ONLY"
                );
                ZeresPluginLibrary.Logger.stacktrace(
                  this.getName(),
                  "There has been an error parsing the channels list, please make sure each channel list is seperated by a single comma ONLY",
                  e
                );
              }
            }

            onStart() {
              this.attemptUnblur();
            }
            onStop() {}

            buildSetting(data) {
              // const { id } = data;
              const setting = XenoLib.buildSetting(data);
              // if (id) setting.getElement().id = this.obfuscatedClass(id);
              return setting;
            }
            createSetting(data) {
              const current = Object.assign({}, data);
              if (!current.onChange) {
                current.onChange = (value) => {
                  this.settings[current.id] = value;
                  if (current.callback) current.callback(value);
                };
              }
              if (typeof current.value === "undefined")
                current.value = this.settings[current.id];
              return this.buildSetting(current);
            }

            createGroup(group) {
              const { name, id, collapsible, shown, settings } = group;

              const list = [];
              for (let s = 0; s < settings.length; s++)
                list.push(this.createSetting(settings[s]));

              const settingGroup = new ZeresPluginLibrary.Settings.SettingGroup(
                name,
                { shown, collapsible }
              ).append(...list);
              settingGroup.group.id = id;
              return settingGroup;
            }

            onSwitch() {
              this.attemptUnblur();
            }

            saveSettings() {
              ZeresPluginLibrary.PluginUtilities.saveSettings(
                this.getName(),
                this.settings
              );
            }

            getSettingsPanel() {
              const settingsList = [
                this.createGroup({
                  name: "Channels To Unblur",
                  id: "selective-unblur-settings-0",
                  collapsible: true,
                  shown: false,
                  settings: [
                    {
                      name: "List all channels here (seperate each channel name with a comma ONLY)",
                      id: "unblur-channels-list",
                      type: "textbox",
                      onChange: (val) => {
                        this.settings["unblur-channels-list"] = val;
                        this.attemptUnblur();
                      },
                    },
                  ],
                }),
              ];

              return ZeresPluginLibrary.Settings.SettingPanel.build(
                (_) => this.saveSettings(),
                ...settingsList
              );
            }
          };
        };
        return plugin(Plugin, Api);
      })(global.ZeresPluginLibrary.buildPlugin(config));
})();
