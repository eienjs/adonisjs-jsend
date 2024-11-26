import type ConfigureCommand from '@adonisjs/core/commands/configure';

export const configure = async function (command: ConfigureCommand): Promise<void> {
  const codemods = await command.createCodemods();

  await codemods.updateRcFile((rcFile) => {
    rcFile.addProvider('@eienjs/adonisjs-jsend/jsend_provider');
  });
};
