const Event = require(`./Event`);
const DeviceCommand = require(`../../DeviceCommand`);
const Action = require(`../../../../shim/Action`);
const Filter = require(`../Filter`);


class CommandEvent extends Event {

    constructor({ deviceCommand } = {}) {
        super({ action: Action.COMMAND_EVENT, command: deviceCommand });

        const me = this;

        me.command = deviceCommand;
    }

    get command() {
        return this._command;
    }

    set command(value) {
        this._command = new DeviceCommand(value);
    }

    getApplicableFilters() {
        const me = this;

        return [
            new Filter({
                networkId: me.command.networkId,
                deviceTypeId: me.command.deviceTypeId,
                deviceId: me.command.deviceId,
                eventName: `COMMAND_EVENT`, // TODO
            }),
            new Filter({
                networkId: me.command.networkId,
                deviceTypeId:  me.command.deviceTypeId,
                deviceId: me.command.deviceId,
                eventName: `COMMAND_EVENT`, // TODO
                name: me.command.command
            })
        ];
    }
}


module.exports = CommandEvent;